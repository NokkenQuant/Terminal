type PriceRow = {
  trade_date: string;
  asset: string;
  ticker?: string | null;
  exchange?: string | null;
  description?: string | null;
  open?: number | null;
  high?: number | null;
  low?: number | null;
  close?: number | null;
  volume?: number | null;
};

type LatestPriceRow = {
  trade_date: string;
  asset: string;
  ticker?: string | null;
  exchange?: string | null;
  description?: string | null;
  close?: number | null;
  volume?: number | null;
};

type MetricRow = {
  trade_date: string;
  asset: string;
  close?: number | null;
  mom_3m?: number | null;
  vol_30d_anualizada?: number | null;
  zscore_252d?: number | null;
  trend_ema_50_200?: number | null;
};

const SYMBOL_TO_ASSET: Record<string, string> = {
  "ZS=F": "SOJA_EUA",
  "ZC=F": "MILHO_EUA",
  "ZW=F": "TRIGO_SRW",
  "KC=F": "CAFE_EUA",
  "CT=F": "ALGODAO",
};

function env() {
  return {
    supabaseUrl: process.env.SUPABASE_URL || "",
    supabaseKey: process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    pricesTable: process.env.SUPABASE_PRICES_TABLE || "agro_prices",
    metricsTable: process.env.SUPABASE_METRICS_TABLE || "agro_metrics_analysis",
  };
}

function headers() {
  const { supabaseKey } = env();
  return {
    apikey: supabaseKey,
    Authorization: `Bearer ${supabaseKey}`,
    "Content-Type": "application/json",
  };
}

function ensureEnv() {
  const { supabaseUrl, supabaseKey } = env();
  if (!supabaseUrl || !supabaseKey) {
    throw new Error("SUPABASE_URL e SUPABASE_SERVICE_ROLE_KEY sao obrigatorios.");
  }
}

function toNum(value: unknown): number {
  const num = Number(value);
  return Number.isFinite(num) ? num : 0;
}

function round(value: number, decimals = 2): number {
  const base = 10 ** decimals;
  return Math.round(value * base) / base;
}

function resolveAsset(symbolOrAsset: string): string {
  const value = decodeURIComponent(symbolOrAsset || "").toUpperCase();
  return SYMBOL_TO_ASSET[value] || value;
}

async function fetchPaged<T>(table: string, params: URLSearchParams, pageSize = 1000): Promise<T[]> {
  ensureEnv();
  const { supabaseUrl } = env();
  const allRows: T[] = [];
  let offset = 0;

  while (true) {
    const pageParams = new URLSearchParams(params);
    pageParams.set("limit", String(pageSize));
    pageParams.set("offset", String(offset));

    const url = `${supabaseUrl.replace(/\/$/, "")}/rest/v1/${table}?${pageParams.toString()}`;
    const response = await fetch(url, { headers: headers() });
    if (!response.ok) {
      const body = await response.text();
      throw new Error(`Supabase error (${response.status}) ${body}`);
    }
    const data = (await response.json()) as T[];
    if (!Array.isArray(data) || data.length === 0) break;

    allRows.push(...data);
    if (data.length < pageSize) break;
    offset += pageSize;
  }

  return allRows;
}

function computeVolatility(closes: number[], period: number): number {
  if (closes.length < period + 1) return 0;
  const slice = closes.slice(-(period + 1));
  const returns: number[] = [];
  for (let i = 1; i < slice.length; i += 1) {
    const prev = slice[i - 1];
    const curr = slice[i];
    if (prev > 0 && curr > 0) returns.push(Math.log(curr / prev));
  }
  if (returns.length < 2) return 0;
  const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
  const variance = returns.reduce((a, b) => a + (b - mean) ** 2, 0) / (returns.length - 1);
  return round(Math.sqrt(variance) * Math.sqrt(252) * 100, 2);
}

function computeSma(closes: number[], period: number): number {
  if (closes.length < period) return 0;
  const slice = closes.slice(-period);
  return round(slice.reduce((a, b) => a + b, 0) / period, 2);
}

export async function getMarketData() {
  const { pricesTable } = env();
  const latestTable = process.env.SUPABASE_LATEST_PRICES_VIEW || "agro_latest_prices";
  const latestParams = new URLSearchParams({
    select: "trade_date,asset,ticker,exchange,description,close",
    order: "asset.asc",
  });
  const latestRows = await fetchPaged<LatestPriceRow>(latestTable, latestParams, 1000);

  const priceParams = new URLSearchParams({
    select: "asset,trade_date,close",
    order: "asset.asc,trade_date.desc",
  });
  const priceRows = await fetchPaged<PriceRow>(pricesTable, priceParams, 1000);
  const lastTwoByAsset = new Map<string, number[]>();

  for (const row of priceRows) {
    if (!row.asset || row.close == null) continue;
    const values = lastTwoByAsset.get(row.asset) || [];
    if (values.length < 2) {
      values.push(toNum(row.close));
      lastTwoByAsset.set(row.asset, values);
    }
  }

  return latestRows
    .filter((row) => row.asset && row.close != null)
    .map((row) => {
      const asset = row.asset;
      const price = toNum(row.close);
      const history = lastTwoByAsset.get(asset) || [];
      const latestClose = history[0] ?? price;
      const previousClose = history[1];
      const change = previousClose == null ? 0 : round(latestClose - previousClose);
      const changePercent =
        previousClose == null || previousClose === 0
          ? 0
          : round(((latestClose - previousClose) / previousClose) * 100);

      return {
        name: row.description || asset,
        ticker: row.ticker || asset,
        asset,
        market: row.exchange || "N/A",
        price: round(price),
        change,
        changePercent,
      };
    });
}

export async function getHistorical(symbolOrAsset: string, startDate: string, endDate: string) {
  const { pricesTable } = env();
  const asset = resolveAsset(symbolOrAsset);
  const params = new URLSearchParams({
    select: "trade_date,open,high,low,close,volume",
    asset: `eq.${asset}`,
    trade_date: `gte.${startDate}`,
    order: "trade_date.asc",
  });
  params.append("trade_date", `lte.${endDate}`);

  const rows = await fetchPaged<PriceRow>(pricesTable, params, 1000);
  return rows.map((row) => ({
    date: row.trade_date,
    open: row.open == null ? null : toNum(row.open),
    high: row.high == null ? null : toNum(row.high),
    low: row.low == null ? null : toNum(row.low),
    close: row.close == null ? null : toNum(row.close),
    volume: row.volume == null ? null : toNum(row.volume),
  }));
}

export async function getAnalysis(symbolOrAsset: string) {
  const { metricsTable, pricesTable } = env();
  const asset = resolveAsset(symbolOrAsset);
  const metricParams = new URLSearchParams({
    select: "trade_date,asset,close,mom_3m,vol_30d_anualizada,zscore_252d,trend_ema_50_200",
    asset: `eq.${asset}`,
    order: "trade_date.desc",
    limit: "1",
  });
  const metricRows = await fetchPaged<MetricRow>(metricsTable, metricParams, 1000);
  const latestMetric = metricRows[0];

  const priceParams = new URLSearchParams({
    select: "trade_date,close",
    asset: `eq.${asset}`,
    order: "trade_date.asc",
  });
  const priceRows = await fetchPaged<PriceRow>(pricesTable, priceParams, 1000);
  const closes = priceRows.map((row) => toNum(row.close)).filter((v) => v > 0);

  return {
    asset,
    trade_date: latestMetric?.trade_date || null,
    current_price: round(closes[closes.length - 1] || toNum(latestMetric?.close), 2),
    mom_3m: round(toNum(latestMetric?.mom_3m), 4),
    vol_30d_anualizada: round(toNum(latestMetric?.vol_30d_anualizada), 4),
    zscore_252d: round(toNum(latestMetric?.zscore_252d), 4),
    trend_ema_50_200: round(toNum(latestMetric?.trend_ema_50_200), 4),
    volatility: {
      "21d": computeVolatility(closes, 21),
      "63d": computeVolatility(closes, 63),
      "252d": computeVolatility(closes, 252),
    },
    moving_averages: {
      "8d": computeSma(closes, 8),
      "16d": computeSma(closes, 16),
      "32d": computeSma(closes, 32),
      "100d": computeSma(closes, 100),
    },
  };
}

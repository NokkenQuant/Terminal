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

type PhysicalPriceRow = {
  snapshot_date: string;
  commodity: string;
  variable: string;
  unit?: string | null;
  currency?: string | null;
  price?: number | null;
  series_position: number;
  source?: string | null;
};

type PhysicalLatestRow = {
  data: string;
  snapshot_date: string;
  commodity: string;
  variable: string;
  unit?: string | null;
  currency?: string | null;
  price?: number | null;
  source?: string | null;
};

type PhysicalPanelRow = {
  data: string;
  commodity: string;
  variable: string;
  unit?: string | null;
  currency?: string | null;
  value?: number | null;
  source?: string | null;
};

type PhysicalSeriesPoint = {
  date: string;
  price: number | null;
  snapshot_date: string;
  commodity: string;
  variable: string;
  unit: string | null;
  currency: string | null;
  series_position: number;
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
    physicalTable: process.env.SUPABASE_PHYSICAL_TABLE || "agro_physical_prices",
    physicalPanelTable: process.env.SUPABASE_PHYSICAL_PANEL_TABLE || "painel_fisico",
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

const physicalCache = {
  latest: { at: 0, data: [] as PhysicalLatestRow[] },
  history: new Map<string, { at: number; data: PhysicalSeriesPoint[] }>(),
};
const PHYSICAL_CACHE_TTL_MS = 5 * 60 * 1000;

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

function avg(values: number[]): number {
  if (values.length === 0) return 0;
  return values.reduce((sum, value) => sum + value, 0) / values.length;
}

function signalByMean(current: number, mean: number): "compra" | "venda" | "neutro" {
  const tolerance = Math.max(Math.abs(mean) * 0.01, 0.0001);
  if (current > mean + tolerance) return "compra";
  if (current < mean - tolerance) return "venda";
  return "neutro";
}

function latestMetricValue(rows: MetricRow[], key: keyof MetricRow): number {
  for (const row of rows) {
    const value = row[key];
    if (value != null && Number.isFinite(Number(value))) return Number(value);
  }
  return 0;
}

export async function getMarketData() {
  const { pricesTable } = env();
  const latestTable = process.env.SUPABASE_LATEST_PRICES_VIEW || "agro_latest_prices";
  const latestParams = new URLSearchParams({
    select: "trade_date,asset,ticker,exchange,description,close",
    order: "asset.asc",
  });
  const latestRows = await fetchPaged<LatestPriceRow>(latestTable, latestParams, 1000);

  const assets = latestRows
    .map((row) => row.asset)
    .filter((asset): asset is string => Boolean(asset));
  const recentStartDate = new Date(Date.now() - 1000 * 60 * 60 * 24 * 14).toISOString().slice(0, 10);
  const priceParams = new URLSearchParams({
    select: "asset,trade_date,close",
    order: "trade_date.desc",
    trade_date: `gte.${recentStartDate}`,
  });
  if (assets.length > 0) {
    priceParams.set("asset", `in.(${assets.join(",")})`);
  }
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

export async function getAnalysis(symbolOrAsset: string, selectedDate?: string) {
  const { metricsTable } = env();
  const asset = resolveAsset(symbolOrAsset);
  const metricParams = new URLSearchParams({
    select: "trade_date,asset,close,mom_3m,vol_30d_anualizada,zscore_252d,trend_ema_50_200",
    asset: `eq.${asset}`,
    order: "trade_date.desc",
    limit: "500",
  });
  const metricRows = await fetchPaged<MetricRow>(metricsTable, metricParams, 1000);
  const latestMetric = selectedDate
    ? metricRows.find((row) => row.trade_date === selectedDate) || metricRows[0]
    : metricRows[0];
  const availableDates = metricRows.map((row) => row.trade_date);

  const momCurrent = selectedDate ? toNum(latestMetric?.mom_3m) : latestMetricValue(metricRows, "mom_3m");
  const volCurrent = selectedDate ? toNum(latestMetric?.vol_30d_anualizada) : latestMetricValue(metricRows, "vol_30d_anualizada");
  const zscoreCurrent = selectedDate ? toNum(latestMetric?.zscore_252d) : latestMetricValue(metricRows, "zscore_252d");
  const trendCurrent = selectedDate ? toNum(latestMetric?.trend_ema_50_200) : latestMetricValue(metricRows, "trend_ema_50_200");

  const momSeries = metricRows.map((row) => row.mom_3m).filter((v): v is number => v != null && Number.isFinite(Number(v))).map(Number);
  const volSeries = metricRows.map((row) => row.vol_30d_anualizada).filter((v): v is number => v != null && Number.isFinite(Number(v))).map(Number);
  const zscoreSeries = metricRows.map((row) => row.zscore_252d).filter((v): v is number => v != null && Number.isFinite(Number(v))).map(Number);
  const trendSeries = metricRows.map((row) => row.trend_ema_50_200).filter((v): v is number => v != null && Number.isFinite(Number(v))).map(Number);

  const means = {
    mom_3m: avg(momSeries),
    vol_30d_anualizada: avg(volSeries),
    zscore_252d: avg(zscoreSeries),
    trend_ema_50_200: avg(trendSeries),
  };

  const signals = {
    mom_3m: signalByMean(momCurrent, means.mom_3m),
    vol_30d_anualizada: signalByMean(volCurrent, means.vol_30d_anualizada),
    zscore_252d: signalByMean(zscoreCurrent, means.zscore_252d),
    trend_ema_50_200: signalByMean(trendCurrent, means.trend_ema_50_200),
  };
  const recommendationScore =
    (signals.mom_3m === "compra" ? 1 : signals.mom_3m === "venda" ? -1 : 0) +
    (signals.vol_30d_anualizada === "compra" ? 1 : signals.vol_30d_anualizada === "venda" ? -1 : 0) +
    (signals.zscore_252d === "compra" ? 1 : signals.zscore_252d === "venda" ? -1 : 0) +
    (signals.trend_ema_50_200 === "compra" ? 1 : signals.trend_ema_50_200 === "venda" ? -1 : 0);
  const recommendation = recommendationScore > 0 ? "compra" : recommendationScore < 0 ? "venda" : "neutro";

  return {
    asset,
    trade_date: latestMetric?.trade_date || null,
    available_dates: availableDates,
    current_price: round(toNum(latestMetric?.close), 2),
    mom_3m: round(momCurrent, 4),
    vol_30d_anualizada: round(volCurrent, 4),
    zscore_252d: round(zscoreCurrent, 4),
    trend_ema_50_200: round(trendCurrent, 4),
    historical_means: {
      mom_3m: round(means.mom_3m, 4),
      vol_30d_anualizada: round(means.vol_30d_anualizada, 4),
      zscore_252d: round(means.zscore_252d, 4),
      trend_ema_50_200: round(means.trend_ema_50_200, 4),
    },
    signal: recommendation,
    signals,
  };
}

export async function getPhysicalMarketData() {
  const now = Date.now();
  if (now - physicalCache.latest.at < PHYSICAL_CACHE_TTL_MS && physicalCache.latest.data.length > 0) {
    return physicalCache.latest.data;
  }

  const { physicalPanelTable } = env();

  const params = new URLSearchParams({
    select: "data,commodity,variable,unit,currency,value,source",
    order: "commodity.asc,variable.asc",
    limit: "1500",
  });
  const rows = await fetchPaged<PhysicalPanelRow>(physicalPanelTable, params, 1000);
  const mapped = rows.map((row) => ({
    data: row.data,
    snapshot_date: row.data,
    commodity: row.commodity,
    variable: row.variable,
    unit: row.unit || null,
    currency: row.currency || null,
    price: row.value == null ? null : toNum(row.value),
    source: row.source || "CEPEA",
  }));
  physicalCache.latest = { at: now, data: mapped };
  return mapped;
}

export async function getPhysicalMarketHistory(commodity: string, variable: string, startDate?: string) {
  const now = Date.now();
  const key = `${commodity}::${variable}`;
  const cached = physicalCache.history.get(key);
  if (cached && now - cached.at < PHYSICAL_CACHE_TTL_MS) {
    if (!startDate) return cached.data;
    return cached.data.filter((row) => row.date >= startDate);
  }

  const { physicalTable } = env();
  const params = new URLSearchParams({
    select: "snapshot_date,commodity,variable,unit,currency,price,series_position",
    commodity: `eq.${commodity}`,
    variable: `eq.${variable}`,
    order: "series_position.asc",
    limit: "3000",
  });
  const rows = await fetchPaged<PhysicalPriceRow>(physicalTable, params, 1000);
  const latestSnapshot = rows[0]?.snapshot_date || new Date().toISOString().slice(0, 10);
  const baseDate = new Date(latestSnapshot);
  const series = rows.map((row) => {
    const pos = Number(row.series_position || 1);
    const d = new Date(baseDate);
    d.setDate(baseDate.getDate() - (pos - 1));
    return {
      date: d.toISOString().slice(0, 10),
      price: row.price == null ? null : toNum(row.price),
      snapshot_date: row.snapshot_date,
      commodity: row.commodity,
      variable: row.variable,
      unit: row.unit || null,
      currency: row.currency || null,
      series_position: pos,
    } as PhysicalSeriesPoint;
  });
  physicalCache.history.set(key, { at: now, data: series });
  if (!startDate) return series;
  return series.filter((row) => row.date >= startDate);
}

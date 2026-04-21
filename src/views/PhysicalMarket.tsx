import React, { useEffect, useMemo, useState } from 'react';
import { motion } from 'motion/react';
import { Download, RefreshCw } from 'lucide-react';
import { ResponsiveContainer, AreaChart, Area, CartesianGrid, XAxis, YAxis, Tooltip } from 'recharts';
import { getCepeaDownloadLink } from '../data/cepeaLinks';

type PhysicalRow = {
  data: string;
  snapshot_date: string;
  commodity: string;
  variable: string;
  unit?: string | null;
  currency?: string | null;
  price?: number | null;
  source?: string | null;
};

type PhysicalSeriesPoint = {
  date: string;
  price: number | null;
  commodity: string;
  variable: string;
  unit?: string | null;
  currency?: string | null;
};

export default function PhysicalMarket() {
  const [rows, setRows] = useState<PhysicalRow[]>([]);
  const [selectedCommodities, setSelectedCommodities] = useState<string[]>([]);
  const [selectedSerie, setSelectedSerie] = useState<{ commodity: string; variable: string } | null>(null);
  const [history, setHistory] = useState<PhysicalSeriesPoint[]>([]);
  const [chartStartDate, setChartStartDate] = useState('');
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/physical-market');
      const data = await response.json();
      setRows(Array.isArray(data) ? data : []);
    } catch (error) {
      console.error('Error fetching physical market data:', error);
      setRows([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const commodities = useMemo(
    () => Array.from(new Set<string>(rows.map((row) => row.commodity))).sort((a, b) => a.localeCompare(b)),
    [rows],
  );

  useEffect(() => {
    if (commodities.length === 0) return;
    if (selectedCommodities.length === 0) {
      setSelectedCommodities([commodities[0]]);
    }
  }, [commodities, selectedCommodities.length]);

  useEffect(() => {
    const loadHistory = async () => {
      if (!selectedSerie) return;
      setLoadingHistory(true);
      try {
        const q = new URLSearchParams({
          commodity: selectedSerie.commodity,
          variable: selectedSerie.variable,
          ...(chartStartDate ? { startDate: chartStartDate } : {}),
        });
        const response = await fetch(`/api/physical-market/history?${q.toString()}`);
        const data = await response.json();
        setHistory(Array.isArray(data) ? data : []);
      } catch (error) {
        console.error('Error fetching physical history:', error);
        setHistory([]);
      } finally {
        setLoadingHistory(false);
      }
    };
    loadHistory();
  }, [selectedSerie?.commodity, selectedSerie?.variable, chartStartDate]);

  const rowsByCommodity = useMemo(() => {
    const grouped = new Map<string, PhysicalRow[]>();
    rows.forEach((row) => {
      const list = grouped.get(row.commodity) || [];
      list.push(row);
      grouped.set(row.commodity, list);
    });
    grouped.forEach((list) => list.sort((a, b) => a.variable.localeCompare(b.variable)));
    return grouped;
  }, [rows]);

  const selectedCards = useMemo(
    () => selectedCommodities.map((commodity) => ({ commodity, rows: rowsByCommodity.get(commodity) || [] })),
    [selectedCommodities, rowsByCommodity],
  );

  useEffect(() => {
    if (!selectedSerie && selectedCards.length > 0 && selectedCards[0].rows.length > 0) {
      setSelectedSerie({
        commodity: selectedCards[0].commodity,
        variable: selectedCards[0].rows[0].variable,
      });
    }
  }, [selectedCards, selectedSerie]);

  const latestDate = rows[0]?.snapshot_date;
  const chartData = history.map((p) => ({
    date: new Date(p.date).toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit' }),
    price: p.price,
  }));

  return (
    <motion.div
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      <section className="mb-4">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-4 mb-4">
          <div>
            <h1 className="text-4xl font-headline font-extrabold text-[#e2e3df] tracking-tight mb-2">Mercado Fisico CEPEA</h1>
            <p className="text-[#c3c8c1] text-sm">
              Snapshot mais recente por commodity e variavel.
              {latestDate ? ` Data: ${new Date(latestDate).toLocaleDateString('pt-BR')}` : ''}
            </p>
          </div>
          <button
            onClick={fetchData}
            className="bg-[#333533] hover:bg-[#383a37] text-[#e2e3df] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
          >
            <RefreshCw size={14} className={loading ? 'animate-spin' : ''} /> Atualizar
          </button>
        </div>

        <div className="flex flex-wrap gap-2">
          {commodities.map((commodity) => {
            const active = selectedCommodities.includes(commodity);
            return (
              <button
                key={commodity}
                onClick={() =>
                  setSelectedCommodities((prev) =>
                    prev.includes(commodity) ? prev.filter((c) => c !== commodity) : [...prev, commodity],
                  )
                }
                className={`px-3 py-2 rounded-lg text-xs font-bold border transition-colors ${
                  active
                    ? 'bg-[#a1d494]/20 border-[#a1d494] text-[#d7f2d0]'
                    : 'bg-[#1a1c1a] border-[#434843]/25 text-[#c3c8c1] hover:bg-[#333533]'
                }`}
              >
                {commodity}
              </button>
            );
          })}
        </div>
      </section>

      {loading ? (
        <section className="bg-[#1e201e] rounded-2xl border border-[#434843]/10 p-8 text-center text-[#c3c8c1]">
          <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
          Carregando painel fisico...
        </section>
      ) : (
        <section className="grid grid-cols-1 xl:grid-cols-2 gap-4">
          {selectedCards.map((card) => (
            <article key={card.commodity} className="bg-[#1e201e] rounded-2xl border border-[#434843]/10 p-4">
              <div className="flex items-center justify-between gap-3 mb-3">
                <h2 className="text-base font-headline font-bold text-[#e2e3df]">{card.commodity}</h2>
                <a
                  href={getCepeaDownloadLink(card.commodity)}
                  target="_blank"
                  rel="noreferrer"
                  className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-bold bg-[#333533] text-[#e2e3df] hover:bg-[#3d403d]"
                >
                  <Download size={13} /> Download historico
                </a>
              </div>
              {card.rows.length === 0 ? (
                <div className="text-sm text-[#c3c8c1]">Sem dados para esta commodity.</div>
              ) : (
                <div className="space-y-2">
                  {card.rows.map((row) => {
                    const active =
                      selectedSerie?.commodity === row.commodity && selectedSerie?.variable === row.variable;
                    return (
                      <button
                        key={`${row.commodity}-${row.variable}`}
                        onClick={() => {
                          setSelectedSerie({ commodity: row.commodity, variable: row.variable });
                          setChartStartDate('');
                        }}
                        className={`w-full text-left rounded-xl border p-3 transition-colors ${
                          active
                            ? 'bg-[#2b3529] border-[#a1d494]/50'
                            : 'bg-[#121412] border-[#434843]/20 hover:bg-[#1a1c1a]'
                        }`}
                      >
                        <div className="text-xs text-[#c3c8c1]">{row.variable}</div>
                        <div className="text-lg font-bold tabular-nums text-[#e2e3df]">
                          {row.price == null
                            ? '-'
                            : row.price.toLocaleString('pt-BR', {
                                minimumFractionDigits: 2,
                                maximumFractionDigits: 2,
                              })}{' '}
                          {row.currency || ''}
                        </div>
                        <div className="text-[11px] text-[#9ea39d]">
                          Data referencia: {new Date(row.data).toLocaleDateString('pt-BR')}
                        </div>
                        <div className="text-[11px] text-[#9ea39d]">{row.unit || '-'}</div>
                      </button>
                    );
                  })}
                </div>
              )}
            </article>
          ))}
        </section>
      )}

      {selectedSerie && (
        <section className="bg-[#1e201e] rounded-2xl border border-[#434843]/10 p-5 md:p-6">
          <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
            <div>
              <h2 className="text-lg font-headline font-bold text-[#e2e3df]">
                Grafico CEPEA: {selectedSerie.commodity}
              </h2>
              <p className="text-xs text-[#c3c8c1]">{selectedSerie.variable}</p>
            </div>
            <div>
              <label className="block text-[10px] uppercase tracking-widest text-[#c3c8c1] mb-1">
                Data inicial
              </label>
              <input
                type="date"
                value={chartStartDate}
                onChange={(e) => setChartStartDate(e.target.value)}
                className="bg-[#0d0f0d] border border-[#434843]/20 rounded px-2 py-1 text-xs text-[#e2e3df]"
              />
            </div>
          </div>

          <div className="h-[340px] bg-[#0d0f0d] rounded-xl border border-[#434843]/20 p-2">
            {loadingHistory ? (
              <div className="h-full flex items-center justify-center text-[#c3c8c1] text-sm">
                <RefreshCw className="animate-spin mr-2" size={16} />
                Carregando serie historica...
              </div>
            ) : chartData.length === 0 ? (
              <div className="h-full flex items-center justify-center text-[#c3c8c1] text-sm">
                Sem historico disponivel.
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={chartData} margin={{ top: 8, right: 18, left: 8, bottom: 8 }}>
                  <defs>
                    <linearGradient id="physicalArea" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#4ec9b0" stopOpacity={0.35} />
                      <stop offset="95%" stopColor="#4ec9b0" stopOpacity={0.02} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid stroke="#2a2d2a" vertical={false} />
                  <XAxis dataKey="date" tick={{ fill: '#9da39d', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#2a2d2a' }} minTickGap={24} />
                  <YAxis tick={{ fill: '#9da39d', fontSize: 11 }} tickLine={false} axisLine={{ stroke: '#2a2d2a' }} domain={['auto', 'auto']} width={70} />
                  <Tooltip
                    contentStyle={{ background: '#121412', border: '1px solid #2a2d2a', borderRadius: 8, color: '#e2e3df' }}
                    labelStyle={{ color: '#c3c8c1', fontSize: 12 }}
                  />
                  <Area type="monotone" dataKey="price" stroke="#4ec9b0" strokeWidth={2} fill="url(#physicalArea)" />
                </AreaChart>
              </ResponsiveContainer>
            )}
          </div>
        </section>
      )}
    </motion.div>
  );
}

import React, { useState, useEffect, useMemo } from 'react';
import { motion } from 'motion/react';
import { ArrowUpRight, ArrowDownRight, Filter, Download, Lock, Sparkles, Info, Stars, Sun, Truck, Ship, RefreshCw, Share2, Bolt, Bell, Maximize2 } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';
import { NEWS } from '../constants';

interface MarketDataItem {
  name: string;
  ticker: string;
  asset: string;
  market: string;
  price: number;
  change: number;
  changePercent: number;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1c1a] border border-[#434843]/20 p-3 rounded-lg shadow-2xl backdrop-blur-md">
        <p className="text-[10px] uppercase font-bold text-[#c3c8c1] mb-1">{new Date(label).toLocaleDateString()}</p>
        <p className="text-sm font-bold text-[#a1d494]">
          Preço: <span className="text-[#e2e3df] tabular-nums">{payload[0].value.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' })}</span>
        </p>
      </div>
    );
  }
  return null;
};

export default function Dashboard() {
  const [selectedSymbol, setSelectedSymbol] = useState('');
  const [marketData, setMarketData] = useState<MarketDataItem[]>([]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [timeRange, setTimeRange] = useState('30d');

  const fetchHistory = async (symbol: string, range: string) => {
    setLoading(true);
    try {
      const end = new Date();
      const start = new Date();
      if (range === '7d') start.setDate(end.getDate() - 7);
      else if (range === '30d') start.setDate(end.getDate() - 30);
      else if (range === '90d') start.setDate(end.getDate() - 90);
      else if (range === '1y') start.setFullYear(end.getFullYear() - 1);

      const response = await fetch(`/api/historical/${symbol}?startDate=${start.toISOString().split('T')[0]}&endDate=${end.toISOString().split('T')[0]}`);
      const data = await response.json();
      if (Array.isArray(data)) {
        setHistoricalData(data.map(d => ({
          date: d.date,
          price: d.close
        })));
      }
    } catch (error) {
      console.error("Error fetching dashboard history:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (!selectedSymbol) return;
    fetchHistory(selectedSymbol, timeRange);
  }, [selectedSymbol, timeRange]);

  useEffect(() => {
    const fetchMarketData = async () => {
      try {
        const response = await fetch('/api/market-data');
        const data = await response.json();
        if (Array.isArray(data)) {
          setMarketData(data);
          if (data.length > 0) {
            setSelectedSymbol((current) => current || data[0].ticker);
          }
        }
      } catch (error) {
        console.error("Error fetching market data:", error);
      }
    };
    fetchMarketData();
  }, []);

  const selectedAssetInfo = useMemo(
    () => marketData.find((c) => c.ticker === selectedSymbol) || marketData[0],
    [marketData, selectedSymbol]
  );

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-6"
    >
      {/* Linha de Ticker */}
      <div className="flex items-center gap-4 overflow-x-auto pb-2 whitespace-nowrap scrollbar-hide">
        {marketData.map((c) => (
          <div key={c.ticker} className="bg-[#1e201e] px-3 py-1.5 rounded flex items-center gap-3 border-l-2 border-[#a1d494]">
            <span className="text-[10px] font-bold text-[#c3c8c1]">{c.ticker}</span>
            <span className="tabular-nums font-semibold text-sm text-[#e2e3df]">{c.price.toLocaleString()}</span>
            <span className={`text-[10px] flex items-center ${c.change > 0 ? 'text-[#a1d494]' : 'text-[#ffb4ab]'}`}>
              {c.change > 0 ? <ArrowUpRight size={10} /> : <ArrowDownRight size={10} />}
              {Math.abs(c.changePercent)}%
            </span>
          </div>
        ))}
      </div>

      {/* Grade do Dashboard */}
      <div className="grid grid-cols-12 gap-6">
        {/* Coluna Central: Dados e Gráficos */}
        <div className="col-span-12 xl:col-span-8 space-y-6">
          {/* Tabela de Commodities de Alta Densidade */}
          <section className="bg-[#1e201e] rounded-xl overflow-hidden border border-[#434843]/10">
            <div className="px-4 py-3 flex justify-between items-center bg-[#292a28]">
              <h3 className="font-headline font-bold text-sm tracking-wide text-[#e2e3df]">MONITOR DE GRÃOS E OLEAGINOSAS</h3>
              <div className="flex gap-2">
                <span className="bg-[#043405] text-[#a1d494] text-[10px] font-bold px-2 py-0.5 rounded">AO VIVO</span>
                <span className="text-[10px] text-[#c3c8c1] opacity-60">Atualizado há 2s</span>
              </div>
            </div>
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead className="bg-[#1a1c1a] text-[10px] uppercase tracking-widest text-[#c3c8c1] font-bold">
                  <tr>
                    <th className="px-4 py-2">Instrumento</th>
                    <th className="px-4 py-2">Último Preço</th>
                    <th className="px-4 py-2">Variação</th>
                    <th className="px-4 py-2">% Var</th>
                    <th className="px-4 py-2">Volume</th>
                    <th className="px-4 py-2">OI</th>
                    <th className="px-4 py-2 text-right">Tendência (24h)</th>
                  </tr>
                </thead>
                <tbody className="text-sm tabular-nums divide-y divide-[#434843]/10 text-[#e2e3df]">
                  {marketData.map((c) => (
                    <tr 
                      key={c.ticker} 
                      onClick={() => setSelectedSymbol(c.ticker)}
                      className={`hover:bg-[#333533] transition-colors group cursor-pointer ${selectedSymbol === c.ticker ? 'bg-[#333533]' : ''}`}
                    >
                      <td className="px-4 py-3 font-semibold">
                        <div className="flex items-center gap-2">
                          {selectedSymbol === c.ticker && <div className="w-1.5 h-1.5 rounded-full bg-[#a1d494] animate-pulse"></div>}
                          {c.name}
                        </div>
                      </td>
                      <td className="px-4 py-3">{c.price.toLocaleString()}</td>
                      <td className={`px-4 py-3 ${c.change > 0 ? 'text-[#a1d494]' : 'text-[#ffb4ab]'}`}>
                        {c.change > 0 ? '+' : ''}{c.change}
                      </td>
                      <td className={`px-4 py-3 ${c.change > 0 ? 'text-[#a1d494]' : 'text-[#ffb4ab]'}`}>
                        {c.change > 0 ? '+' : ''}{c.changePercent}%
                      </td>
                      <td className="px-4 py-3 text-[#c3c8c1]">-</td>
                      <td className="px-4 py-3 text-[#c3c8c1]">-</td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          {[25, 40, 60, 45, 75].map((h, i) => (
                            <div 
                              key={i} 
                              className={`w-1 rounded-full ${c.change > 0 ? 'bg-[#a1d494]' : 'bg-[#ffb4ab]'}`} 
                              style={{ height: `${h/4}px`, opacity: (i + 1) / 5 }}
                            />
                          ))}
                        </div>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </section>

          {/* Grade de Gráficos Macro */}
          <section className="bg-[#1e201e] rounded-xl p-6 border border-[#434843]/10">
            <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4 mb-8">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <h4 className="text-[10px] text-[#c3c8c1] font-bold uppercase tracking-widest">Histórico de Preços / {selectedAssetInfo?.name || '-'}</h4>
                  <span className="bg-[#a1d494]/10 text-[#a1d494] text-[9px] font-bold px-1.5 py-0.5 rounded">INTERATIVO</span>
                </div>
                <div className="flex items-baseline gap-3">
                  <span className="text-3xl font-headline font-extrabold text-[#e2e3df]">
                    {historicalData.length > 0 ? historicalData[historicalData.length - 1].price.toLocaleString('pt-BR', { style: 'currency', currency: 'USD' }) : '-'}
                  </span>
                  <span className={`text-sm font-bold ${selectedAssetInfo?.change > 0 ? 'text-[#a1d494]' : 'text-[#ffb4ab]'}`}>
                    {selectedAssetInfo?.change > 0 ? '+' : ''}{selectedAssetInfo?.changePercent ?? 0}%
                  </span>
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="bg-[#1a1c1a] p-1 rounded-lg flex gap-1 border border-[#434843]/10">
                  {[
                    { label: '7D', value: '7d' },
                    { label: '1M', value: '30d' },
                    { label: '3M', value: '90d' },
                    { label: '1A', value: '1y' }
                  ].map((t) => (
                    <button 
                      key={t.value}
                      onClick={() => setTimeRange(t.value)}
                      className={`text-[10px] px-3 py-1.5 rounded-md font-bold transition-all ${timeRange === t.value ? 'bg-[#333533] text-[#a1d494] shadow-lg' : 'text-[#c3c8c1] hover:text-[#e2e3df]'}`}
                    >
                      {t.label}
                    </button>
                  ))}
                </div>
                <button className="p-2 bg-[#1a1c1a] rounded-lg border border-[#434843]/10 text-[#c3c8c1] hover:text-[#e2e3df] transition-colors">
                  <Maximize2 size={16} />
                </button>
              </div>
            </div>

            <div className="h-[350px] w-full relative">
              {loading && (
                <div className="absolute inset-0 z-10 flex items-center justify-center bg-[#1e201e]/50 backdrop-blur-[1px]">
                  <RefreshCw className="animate-spin text-[#a1d494]" size={32} />
                </div>
              )}
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={historicalData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a1d494" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a1d494" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#434843" vertical={false} opacity={0.2} />
                  <XAxis 
                    dataKey="date" 
                    hide 
                  />
                  <YAxis 
                    domain={['auto', 'auto']} 
                    orientation="right"
                    tick={{ fill: '#c3c8c1', fontSize: 10 }}
                    axisLine={false}
                    tickLine={false}
                    tickFormatter={(val) => val.toLocaleString()}
                  />
                  <Tooltip content={<CustomTooltip />} />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#a1d494" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    animationDuration={1000}
                  />
                </AreaChart>
              </ResponsiveContainer>
            </div>
            
            <div className="mt-4 flex justify-between items-center text-[10px] text-[#c3c8c1] font-bold uppercase tracking-widest opacity-60">
              <span>{historicalData.length > 0 ? new Date(historicalData[0].date).toLocaleDateString() : ''}</span>
              <div className="flex gap-4">
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#a1d494]"></div> FECHAMENTO</span>
                <span className="flex items-center gap-1"><div className="w-2 h-2 rounded-full bg-[#434843]"></div> MÉDIA MÓVEL</span>
              </div>
              <span>{historicalData.length > 0 ? new Date(historicalData[historicalData.length - 1].date).toLocaleDateString() : ''}</span>
            </div>
          </section>

          {/* Grade de Gráficos Macro Antiga (Removida ou Substituída) */}

          {/* Grade Bento de Clima e Insights Logísticos */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="md:col-span-2 bg-[#1e201e] rounded-xl p-4 relative overflow-hidden border border-[#434843]/10">
              <h4 className="text-[10px] text-[#c3c8c1] font-bold uppercase tracking-widest mb-4">Índice Climático Mato Grosso</h4>
              <div className="flex gap-4 items-center">
                <div className="flex-1">
                  <div className="flex justify-between items-end mb-2">
                    <span className="text-3xl font-headline font-bold text-[#e2e3df]">28,5°C</span>
                    <span className="text-xs text-[#e9c176]">Risco de Estiagem: 42%</span>
                  </div>
                  <div className="w-full bg-[#1a1c1a] h-2 rounded-full overflow-hidden">
                    <div className="bg-[#e9c176] h-full" style={{ width: '42%' }}></div>
                  </div>
                  <div className="mt-4 flex justify-between text-[10px] text-[#c3c8c1]">
                    <span>PREV. 7 DIAS: <strong className="text-[#e2e3df]">PANCADAS ISOLADAS</strong></span>
                    <span>PRECIP: <strong className="text-[#e2e3df]">12MM</strong></span>
                  </div>
                </div>
                <div className="w-24 h-24 bg-[#292a28] rounded-full flex items-center justify-center border-4 border-[#a1d494]/20 relative">
                  <Sun className="text-4xl text-[#e9c176]" />
                  <div className="absolute -top-1 -right-1 bg-[#ffb4ab] w-3 h-3 rounded-full animate-pulse"></div>
                </div>
              </div>
            </div>
            <div className="bg-gradient-to-br from-[#1e201e] to-[#1a1c1a] rounded-xl p-4 flex flex-col justify-between border border-[#434843]/10">
              <h4 className="text-[10px] text-[#c3c8c1] font-bold uppercase tracking-widest">Frete: Santos-CH</h4>
              <div className="py-4">
                <span className="text-2xl font-headline font-bold text-[#e2e3df]">$112,50</span>
                <p className="text-[10px] text-[#a1d494] mt-1">▲ +$2,15 (Contêiner/Seco)</p>
              </div>
              <div className="flex items-center gap-2">
                <div className="flex -space-x-2">
                  <div className="w-6 h-6 rounded-full border-2 border-[#1e201e] bg-[#383a37] flex items-center justify-center">
                    <Truck size={10} className="text-[#e2e3df]" />
                  </div>
                  <div className="w-6 h-6 rounded-full border-2 border-[#1e201e] bg-[#383a37] flex items-center justify-center">
                    <Ship size={10} className="text-[#e2e3df]" />
                  </div>
                </div>
                <span className="text-[9px] text-[#c3c8c1]">Alta congestão portuária relatada</span>
              </div>
            </div>
          </div>
        </div>

        {/* Coluna Direita: Notícias e Feed de Atividade */}
        <div className="col-span-12 xl:col-span-4 space-y-6">
          <section className="bg-[#1e201e] rounded-xl flex flex-col h-full border border-[#434843]/10">
            <div className="px-4 py-3 flex justify-between items-center bg-[#292a28] border-b border-[#434843]/10">
              <h3 className="font-headline font-bold text-sm tracking-wide text-[#e2e3df]">TERMINAL NEWS WIRE</h3>
              <button className="text-[#c3c8c1] hover:text-[#a1d494]">
                <Filter size={14} />
              </button>
            </div>
            <div className="flex-1 overflow-y-auto p-4 space-y-5 max-h-[600px] scrollbar-hide">
              {NEWS.map((item) => (
                <article key={item.id} className="group cursor-pointer">
                  <div className="flex items-start gap-3">
                    <div className={`w-1.5 h-12 rounded-full mt-1 ${item.isPremium ? 'bg-[#e9c176]' : 'bg-[#a1d494]/20'}`}></div>
                    <div className="flex-1">
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`text-[9px] font-bold uppercase ${item.isPremium ? 'text-[#e9c176]' : 'text-[#a1d494]'}`}>
                          {item.category}
                        </span>
                        <span className="text-[9px] text-[#c3c8c1] tabular-nums">{item.time}</span>
                      </div>
                      <h4 className="text-sm font-bold leading-snug text-[#e2e3df] group-hover:text-[#a1d494] transition-colors">
                        {item.title}
                      </h4>
                      {item.summary && (
                        <div className="mt-2 text-[11px] text-[#c3c8c1] leading-relaxed line-clamp-2">
                          {item.summary}
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-3">
                        {item.tags.map(tag => (
                          <span key={tag} className="text-[9px] px-1.5 py-0.5 bg-[#333533] rounded text-[#c3c8c1]">
                            {tag}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </article>
              ))}

              {/* Seção de Bloqueio Premium */}
              <div className="relative mt-8 group">
                <div className="blur-sm opacity-50 space-y-5 pointer-events-none">
                  <article className="group">
                    <div className="flex items-start gap-3">
                      <div className="w-1.5 h-12 bg-[#a1d494]/20 rounded-full mt-1"></div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-1">
                          <span className="text-[9px] font-bold text-[#c3c8c1] uppercase">Bloomberg</span>
                          <span className="text-[9px] text-[#c3c8c1] tabular-nums">08:45 AM</span>
                        </div>
                        <h4 className="text-sm font-semibold leading-snug text-[#e2e3df]">Atualização logística global: Volumes de trânsito no Canal de Suez...</h4>
                      </div>
                    </div>
                  </article>
                </div>
                <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#1e201e]/60 backdrop-blur-[2px] rounded-xl p-6 text-center">
                  <Lock className="text-4xl text-[#e9c176] mb-3 fill-current" />
                  <h5 className="text-sm font-bold text-[#e2e3df] mb-2">Upgrade para Pro Wire</h5>
                  <p className="text-[10px] text-[#c3c8c1] mb-4">Obtenha notícias de nível institucional, sinais de especialistas e arquivos históricos ilimitados.</p>
                  <button className="bg-[#e9c176] text-[#412d00] text-[11px] font-bold px-4 py-2 rounded-lg hover:scale-105 transition-transform active:opacity-80">
                    SEJA PREMIUM
                  </button>
                </div>
              </div>
            </div>
          </section>

          {/* Catalisadores Próximos */}
          <div className="bg-[#1e201e] p-4 rounded-xl border border-[#434843]/10">
            <h4 className="text-[10px] text-[#c3c8c1] font-bold uppercase tracking-widest mb-4">Próximos Catalisadores</h4>
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#292a28] w-8 h-8 rounded flex items-center justify-center font-bold text-xs text-[#e2e3df] text-center leading-tight">
                    MAI<br/>24
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#e2e3df]">Relatório USDA WASDE</p>
                    <p className="text-[9px] text-[#c3c8c1]">Estimativas Globais de S&D</p>
                  </div>
                </div>
                <Bell size={14} className="text-[#c3c8c1]" />
              </div>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="bg-[#292a28] w-8 h-8 rounded flex items-center justify-center font-bold text-xs text-[#e2e3df] text-center leading-tight">
                    MAI<br/>28
                  </div>
                  <div>
                    <p className="text-[11px] font-bold text-[#e2e3df]">Levantamento de Safra CONAB</p>
                    <p className="text-[9px] text-[#c3c8c1]">Foco na Produção Brasileira</p>
                  </div>
                </div>
                <Bell size={14} className="text-[#c3c8c1]" />
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Botão de Ação Flutuante */}
      <button className="fixed bottom-8 right-8 bg-[#a1d494] text-[#0a3909] w-14 h-14 rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-95 transition-all z-40 group">
        <Bolt size={24} />
        <div className="absolute right-16 bg-[#333533] text-[#e2e3df] text-[10px] font-bold py-2 px-3 rounded-lg whitespace-nowrap opacity-0 group-hover:opacity-100 translate-x-2 group-hover:translate-x-0 transition-all shadow-xl pointer-events-none">
          Nova Mesa de Análise
        </div>
      </button>
    </motion.div>
  );
}

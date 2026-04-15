import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Bell, TrendingUp, User, Sprout, Database, ArrowUp, ArrowDown, Lock, ShoppingCart, Info, Star, ArrowUpRight, ArrowDownRight, Maximize2, ZoomIn, ZoomOut, MoveHorizontal, Activity, Shield, Zap, RefreshCw } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, ReferenceLine } from 'recharts';

interface AnalysisMetrics {
  mom_3m: number;
  vol_30d_anualizada: number;
  zscore_252d: number;
  trend_ema_50_200: number;
  current_price: number;
}

// Dados simulados para o grÃ¡fico
const CHART_DATA = [
  { time: '08:00', price: 1170.50, volume: 1200 },
  { time: '08:30', price: 1171.50, volume: 1300 },
  { time: '09:00', price: 1172.25, volume: 1500 },
  { time: '09:30', price: 1170.25, volume: 1400 },
  { time: '10:00', price: 1168.75, volume: 1100 },
  { time: '10:30', price: 1172.75, volume: 1600 },
  { time: '11:00', price: 1175.00, volume: 1800 },
  { time: '11:30', price: 1176.00, volume: 1900 },
  { time: '12:00', price: 1178.50, volume: 2200 },
  { time: '12:30', price: 1180.50, volume: 2300 },
  { time: '13:00', price: 1182.25, volume: 2500 },
  { time: '13:30', price: 1183.25, volume: 2400 },
  { time: '14:00', price: 1184.25, volume: 2100 },
  { time: '14:30', price: 1182.25, volume: 2000 },
  { time: '15:00', price: 1181.50, volume: 1900 },
  { time: '15:30', price: 1183.50, volume: 2200 },
  { time: '16:00', price: 1186.75, volume: 2400 },
  { time: '16:30', price: 1185.75, volume: 2300 },
  { time: '17:00', price: 1184.25, volume: 2000 },
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-[#1a1c1a] border border-[#434843] p-3 rounded-lg shadow-2xl">
        <p className="text-[10px] font-bold text-[#c3c8c1] mb-1 uppercase tracking-widest">{label}</p>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-[#a1d494]"></div>
          <p className="text-sm font-bold text-[#e2e3df]">
            PreÃ§o: <span className="tabular-nums">{payload[0].value.toFixed(2)}</span>
          </p>
        </div>
        <div className="flex items-center gap-2 mt-1">
          <div className="w-2 h-2 rounded-full bg-[#e9c176]"></div>
          <p className="text-[10px] text-[#c3c8c1]">
            Volume: <span className="tabular-nums">{payload[0].payload.volume}</span>
          </p>
        </div>
      </div>
    );
  }
  return null;
};

export default function Analysis() {
  const [timeframe, setTimeframe] = useState('1D');
  const [viewMode, setViewMode] = useState('technical');
  const [zoom, setZoom] = useState(1);
  const [panOffset, setPanOffset] = useState(0);
  const [metrics, setMetrics] = useState<AnalysisMetrics | null>(null);
  const [loadingMetrics, setLoadingMetrics] = useState(false);

  useEffect(() => {
    const fetchMetrics = async () => {
      setLoadingMetrics(true);
      try {
        const response = await fetch('/api/analysis/ZS=F');
        const data = await response.json();
        if (data && !data.error) {
          setMetrics(data);
        } else {
          console.error("API returned error or invalid data:", data);
          setMetrics(null);
        }
      } catch (error) {
        console.error("Error fetching analysis metrics:", error);
        setMetrics(null);
      } finally {
        setLoadingMetrics(false);
      }
    };
    fetchMetrics();
  }, []);
  const [scrollOffset, setScrollOffset] = useState(0);

  const handleZoomIn = () => setZoom(prev => Math.min(prev + 0.5, 4));
  const handleZoomOut = () => {
    setZoom(prev => {
      const next = Math.max(prev - 0.5, 1);
      if (next === 1) setScrollOffset(0);
      return next;
    });
  };

  const handleScroll = (direction: 'left' | 'right') => {
    const step = 2;
    if (direction === 'left') {
      setScrollOffset(prev => Math.max(0, prev - step));
    } else {
      const visibleCount = Math.floor(CHART_DATA.length / zoom);
      setScrollOffset(prev => Math.min(CHART_DATA.length - visibleCount, prev + step));
    }
  };

  const visibleCount = Math.floor(CHART_DATA.length / zoom);
  const startIndex = Math.min(CHART_DATA.length - visibleCount, scrollOffset);
  const visibleData = CHART_DATA.slice(startIndex, startIndex + visibleCount);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="space-y-8"
    >
      {/* SeÃ§Ã£o de CabeÃ§alho: TÃ­tulo do Ativo e EstatÃ­sticas Chave */}
      <section className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 bg-[#1e201e] rounded-xl flex items-center justify-center border-b-2 border-[#e9c176]">
            <Sprout size={40} className="text-[#e9c176] fill-current" />
          </div>
          <div>
            <div className="flex items-center gap-2 mb-1">
              <h1 className="text-3xl font-extrabold font-headline tracking-tighter text-[#e2e3df]">SOJA (ZS)</h1>
              <span className="bg-[#292a28] px-2 py-0.5 rounded text-[10px] font-bold text-[#e9c176] tracking-widest">SOJA.CBOT</span>
            </div>
            <div className="flex items-center gap-4 text-sm">
              <span className="text-[#a1d494] font-black tabular-nums text-xl">1.184,25</span>
              <span className="text-[#a1d494] flex items-center gap-1 font-semibold">
                <ArrowUpRight size={14} />
                +12,75 (1,09%)
              </span>
              <span className="text-[#c3c8c1] opacity-50 font-medium tracking-tight uppercase text-xs">Mercado Aberto â€¢ Mar 2024</span>
            </div>
          </div>
        </div>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 w-full md:w-auto">
          {[
            { label: 'MÃ¡xima 24h', val: '1.192,50', color: 'text-[#e9c176]' },
            { label: 'MÃ­nima 24h', val: '1.168,00', color: 'text-[#e2e3df]' },
            { label: 'Volume', val: '142,8K', color: 'text-[#e2e3df]' },
            { label: 'Var. OI', val: '+2,4%', color: 'text-[#a1d494]', border: 'border-b-2 border-[#a1d494]' }
          ].map((stat) => (
            <div key={stat.label} className={`bg-[#1e201e] p-3 rounded-lg ${stat.border || ''}`}>
              <p className="text-[10px] uppercase text-[#c3c8c1] mb-1 font-bold">{stat.label}</p>
              <p className={`text-sm font-bold tabular-nums ${stat.color}`}>{stat.val}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Layout Principal do Workspace */}
      <div className="grid grid-cols-12 gap-6">
        {/* Esquerda: GrÃ¡fico TÃ©cnico e Tabela */}
        <div className="col-span-12 xl:col-span-8 flex flex-col gap-6">
          <div className="bg-[#1a1c1a] rounded-xl overflow-hidden flex flex-col h-[500px] border border-[#434843]/10">
            <div className="flex justify-between items-center px-6 py-4 bg-[#1e201e] border-b border-[#434843]/10">
              <div className="flex gap-4">
                <button 
                  onClick={() => setViewMode('technical')}
                  className={`text-xs font-bold transition-all ${viewMode === 'technical' ? 'text-[#a1d494] border-b border-[#a1d494] pb-1' : 'text-[#c3c8c1] opacity-50 hover:opacity-100'}`}
                >
                  Vista TÃ©cnica
                </button>
                <button 
                  onClick={() => setViewMode('seasonality')}
                  className={`text-xs font-bold transition-all ${viewMode === 'seasonality' ? 'text-[#a1d494] border-b border-[#a1d494] pb-1' : 'text-[#c3c8c1] opacity-50 hover:opacity-100'}`}
                >
                  Sazonalidade
                </button>
                <button 
                  onClick={() => setViewMode('cot')}
                  className={`text-xs font-bold transition-all ${viewMode === 'cot' ? 'text-[#a1d494] border-b border-[#a1d494] pb-1' : 'text-[#c3c8c1] opacity-50 hover:opacity-100'}`}
                >
                  Compromisso dos Traders
                </button>
              </div>
              <div className="flex gap-2 items-center">
                <div className="flex bg-[#0d0f0d] rounded-lg p-1 mr-4">
                  {['1H', '1D', '1W', '1M'].map(t => (
                    <button 
                      key={t}
                      onClick={() => setTimeframe(t)}
                      className={`px-3 py-1 rounded text-[10px] font-bold transition-all ${timeframe === t ? 'bg-[#a1d494] text-[#0a3909]' : 'text-[#c3c8c1] hover:text-[#e2e3df]'}`}
                    >
                      {t}
                    </button>
                  ))}
                </div>
                <div className="flex gap-1 mr-2">
                  <button 
                    onClick={() => handleScroll('left')}
                    disabled={scrollOffset === 0}
                    className="p-1.5 bg-[#292a28] rounded hover:bg-[#333533] text-[#c3c8c1] disabled:opacity-30"
                  >
                    <MoveHorizontal size={14} className="rotate-180" />
                  </button>
                  <button 
                    onClick={() => handleScroll('right')}
                    disabled={startIndex + visibleCount >= CHART_DATA.length}
                    className="p-1.5 bg-[#292a28] rounded hover:bg-[#333533] text-[#c3c8c1] disabled:opacity-30"
                  >
                    <MoveHorizontal size={14} />
                  </button>
                </div>
                <button onClick={handleZoomIn} className="p-1.5 bg-[#292a28] rounded hover:bg-[#333533] text-[#c3c8c1]"><ZoomIn size={14} /></button>
                <button onClick={handleZoomOut} className="p-1.5 bg-[#292a28] rounded hover:bg-[#333533] text-[#c3c8c1]"><ZoomOut size={14} /></button>
                <button className="p-1.5 bg-[#292a28] rounded hover:bg-[#333533] text-[#c3c8c1]"><Maximize2 size={14} /></button>
              </div>
            </div>
            <div className="flex-1 relative bg-[#0d0f0d] p-6">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={visibleData} margin={{ top: 10, right: 10, left: 0, bottom: 0 }}>
                  <defs>
                    <linearGradient id="colorPrice" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#a1d494" stopOpacity={0.3}/>
                      <stop offset="95%" stopColor="#a1d494" stopOpacity={0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e201e" vertical={false} />
                  <XAxis 
                    dataKey="time" 
                    stroke="#434843" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                  />
                  <YAxis 
                    domain={['dataMin - 2', 'dataMax + 2']} 
                    stroke="#434843" 
                    fontSize={10} 
                    tickLine={false} 
                    axisLine={false}
                    orientation="right"
                    tickFormatter={(val) => val.toFixed(2)}
                  />
                  <Tooltip 
                    content={<CustomTooltip />}
                    cursor={{ stroke: '#a1d494', strokeWidth: 1 }}
                  />
                  <Area 
                    type="monotone" 
                    dataKey="price" 
                    stroke="#a1d494" 
                    strokeWidth={2}
                    fillOpacity={1} 
                    fill="url(#colorPrice)" 
                    animationDuration={300}
                  />
                  <ReferenceLine y={1180} stroke="#e9c176" strokeDasharray="3 3" label={{ value: 'ResistÃªncia', position: 'right', fill: '#e9c176', fontSize: 10 }} />
                </AreaChart>
              </ResponsiveContainer>
              
              <div className="flex flex-col gap-1 absolute top-10 left-10 bg-[#292a28]/80 backdrop-blur-md p-4 rounded-lg border-l-2 border-[#a1d494] pointer-events-none">
                <span className="text-xs font-bold text-[#e9c176]">EMA(20): 1172,4</span>
                <span className="text-xs font-bold text-[#a1d494]">SMA(50): 1158,2</span>
                <span className="text-xs font-bold text-[#c3c8c1]">RSI: 64,2 (Altista)</span>
              </div>

              {zoom > 1 && (
                <div className="absolute bottom-10 left-1/2 -translate-x-1/2 bg-[#1e201e]/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-[#a1d494] flex items-center gap-2 border border-[#a1d494]/20">
                  <MoveHorizontal size={12} />
                  MODO PANORÃ‚MICO ATIVO
                </div>
              )}
            </div>
          </div>

          <div className="bg-[#1e201e] p-6 rounded-xl border border-[#434843]/10">
            <h3 className="text-lg font-bold font-headline mb-6 flex items-center gap-2 text-[#e2e3df]">
              <Database size={20} className="text-[#a1d494]" />
              ProjeÃ§Ãµes Fundamentais (WASDE)
            </h3>
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead>
                  <tr className="text-[10px] uppercase tracking-widest text-[#c3c8c1] font-bold border-b border-[#434843]/10">
                    <th className="pb-4 px-2">MÃ©trica</th>
                    <th className="pb-4 px-2">Final 2022/23</th>
                    <th className="pb-4 px-2">Proj. 2023/24</th>
                    <th className="pb-4 px-2 text-[#a1d494]">PrevisÃ£o 24/25</th>
                    <th className="pb-4 px-2">Var. YoY</th>
                  </tr>
                </thead>
                <tbody className="text-sm font-medium tabular-nums text-[#e2e3df]">
                  {[
                    { m: 'ProduÃ§Ã£o Total (MT)', f: '374,4M', p: '398,9M', fc: '410,2M', y: '+2,8%' },
                    { m: 'Estoques Finais', f: '101,9M', p: '114,6M', fc: '116,0M', y: '+1,2%' },
                    { m: 'RelaÃ§Ã£o Estoque/Uso', f: '27,2%', p: '28,7%', fc: '29,1%', y: '+0,4%' },
                    { m: 'PrevisÃ£o de ExportaÃ§Ã£o (MT)', f: '171,1M', p: '172,9M', fc: '178,5M', y: '+3,2%' }
                  ].map((row) => (
                    <tr key={row.m} className="hover:bg-[#333533] transition-colors border-b border-[#434843]/5">
                      <td className="py-4 px-2 font-headline font-semibold">{row.m}</td>
                      <td className="py-4 px-2">{row.f}</td>
                      <td className="py-4 px-2">{row.p}</td>
                      <td className="py-4 px-2 text-[#e9c176] font-bold">{row.fc}</td>
                      <td className="py-4 px-2 text-[#a1d494] flex items-center gap-1">
                        <ArrowUp size={12} /> {row.y}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          {/* MÃ©tricas diretas da tabela agro_metrics_analysis */}
          <div className="bg-[#1e201e] p-6 rounded-xl border border-[#434843]/10">
            <h3 className="text-lg font-bold font-headline mb-6 flex items-center gap-2 text-[#e2e3df]">
              <Activity size={20} className="text-[#e9c176]" />
              MÃ©tricas Quantitativas (Supabase)
            </h3>
            {loadingMetrics ? (
              <div className="flex items-center justify-center py-8 text-[#c3c8c1]">
                <RefreshCw className="animate-spin mr-2" size={18} /> Carregando...
              </div>
            ) : metrics ? (
              <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4">
                <div className="bg-[#0d0f0d] p-4 rounded-lg border border-[#434843]/10">
                  <p className="text-[10px] text-[#c3c8c1] uppercase font-bold mb-1">mom_3m</p>
                  <p className="text-xl font-bold text-[#e2e3df]">{metrics.mom_3m?.toFixed(4) ?? '-'}</p>
                </div>
                <div className="bg-[#0d0f0d] p-4 rounded-lg border border-[#434843]/10">
                  <p className="text-[10px] text-[#c3c8c1] uppercase font-bold mb-1">vol_30d_anualizada</p>
                  <p className="text-xl font-bold text-[#e2e3df]">{metrics.vol_30d_anualizada?.toFixed(4) ?? '-'}</p>
                </div>
                <div className="bg-[#0d0f0d] p-4 rounded-lg border border-[#434843]/10">
                  <p className="text-[10px] text-[#c3c8c1] uppercase font-bold mb-1">zscore_252d</p>
                  <p className="text-xl font-bold text-[#e2e3df]">{metrics.zscore_252d?.toFixed(4) ?? '-'}</p>
                </div>
                <div className="bg-[#0d0f0d] p-4 rounded-lg border border-[#434843]/10">
                  <p className="text-[10px] text-[#c3c8c1] uppercase font-bold mb-1">trend_ema_50_200</p>
                  <p className="text-xl font-bold text-[#e2e3df]">{metrics.trend_ema_50_200?.toFixed(4) ?? '-'}</p>
                </div>
              </div>
            ) : (
              <p className="text-center py-8 text-[#c3c8c1]">Erro ao carregar mÃ©tricas.</p>
            )}
          </div>

        </div>
{/* Direita: Insights e Sentimento */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-6">
          <div className="bg-[#292a28] p-6 rounded-xl relative overflow-hidden group border border-[#434843]/10">
            <div className="absolute -right-4 -top-4 w-24 h-24 bg-[#a1d494]/10 rounded-full blur-2xl group-hover:bg-[#a1d494]/20 transition-all"></div>
            <h3 className="text-sm font-bold font-headline mb-4 uppercase tracking-widest text-[#c3c8c1] flex justify-between items-center">
              Radar de Sentimento
              <Star size={16} className="text-[#e9c176] fill-current" />
            </h3>
            <div className="flex items-center justify-center py-8">
              <div className="relative w-40 h-40">
                <svg className="w-full h-full transform -rotate-90">
                  <circle cx="80" cy="80" fill="transparent" r="70" stroke="#1a1c1a" strokeWidth="12" />
                  <circle cx="80" cy="80" fill="transparent" r="70" stroke="#a1d494" strokeDasharray="440" strokeDashoffset="132" strokeWidth="12" />
                </svg>
                <div className="absolute inset-0 flex flex-col items-center justify-center">
                  <span className="text-3xl font-black text-[#e2e3df]">70%</span>
                  <span className="text-[10px] font-bold text-[#a1d494] uppercase">Altista</span>
                </div>
              </div>
            </div>
            <div className="space-y-3">
              <div className="flex justify-between items-center">
                <span className="text-xs font-medium text-[#c3c8c1]">Consenso</span>
                <span className="text-xs font-bold text-[#a1d494]">Compra Forte</span>
              </div>
              <div className="h-1.5 bg-[#1e201e] rounded-full overflow-hidden">
                <div className="h-full bg-[#a1d494]" style={{ width: '70%' }}></div>
              </div>
              <p className="text-[10px] text-[#c3c8c1] leading-relaxed opacity-70 italic mt-2">
                "A reduÃ§Ã£o de produtividade no Mato Grosso, somada Ã  forte demanda das processadoras chinesas, estÃ¡ fornecendo suporte significativo para os prÃªmios do 3Âº trimestre."
              </p>
            </div>
          </div>

          <div className="bg-[#1e201e] p-6 rounded-xl border border-[#434843]/10 flex-1">
            <h3 className="text-sm font-bold font-headline mb-6 uppercase tracking-widest text-[#c3c8c1]">Monitor de Basis Regional</h3>
            <div className="space-y-6">
              {[
                { loc: 'Porto de ParanaguÃ¡ (BRA)', val: '+$0,45', color: 'bg-[#e9c176]', text: 'text-[#e9c176]' },
                { loc: 'New Orleans (GULF)', val: '+$0,72', color: 'bg-[#a1d494]', text: 'text-[#a1d494]', offset: true },
                { loc: 'RosÃ¡rio (ARG)', val: '+$0,22', color: 'bg-[#c3c8c1]', text: 'text-[#e2e3df]' }
              ].map((b) => (
                <div key={b.loc} className={`flex items-start gap-4 ${b.offset ? 'translate-x-4' : ''}`}>
                  <div className={`w-2 h-12 rounded-full ${b.color}`}></div>
                  <div>
                    <p className="text-xs font-bold text-[#e2e3df]">{b.loc}</p>
                    <p className={`text-lg font-black tabular-nums ${b.text}`}>{b.val}</p>
                    <p className="text-[10px] text-[#c3c8c1]">Basis vs CBOT (FOB)</p>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative h-48 rounded-xl overflow-hidden group border border-[#434843]/10">
            <img 
              src="https://picsum.photos/seed/soy-field/400/300" 
              alt="Campo de soja" 
              className="w-full h-full object-cover"
              referrerPolicy="no-referrer"
            />
            <div className="absolute inset-0 bg-[#1e201e]/60 backdrop-blur-sm flex flex-col items-center justify-center p-6 text-center">
              <Lock className="text-[#e9c176] text-4xl mb-2" size={32} />
              <h4 className="text-sm font-bold text-[#e2e3df] mb-2">RelatÃ³rios de InteligÃªncia Profunda</h4>
              <p className="text-[10px] text-[#c3c8c1] mb-4 max-w-[200px]">Desbloqueie a modelagem preditiva de impacto climÃ¡tico para a safra 2024.</p>
              <button className="bg-gradient-to-r from-[#a1d494] to-[#043405] text-[#e2e3df] px-6 py-2 rounded-lg text-[10px] font-black uppercase tracking-widest shadow-lg active:scale-95 transition-transform">
                Upgrade para Harvest+
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* BotÃ£o de AÃ§Ã£o Flutuante */}
      <button className="fixed bottom-8 right-8 w-14 h-14 bg-[#a1d494] text-[#0a3909] rounded-full shadow-2xl flex items-center justify-center hover:scale-110 active:scale-90 transition-all z-[60] border-4 border-[#1e201e]">
        <ShoppingCart size={24} />
      </button>
    </motion.div>
  );
}


import React, { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Search, Filter, Download, Bell, Star, Ship, Info, RefreshCw, History, X } from 'lucide-react';

interface CommodityData {
  name: string;
  ticker: string;
  asset: string;
  market: string;
  price: number;
  change: number;
  changePercent: number;
}

export default function MarketData() {
  const [data, setData] = useState<CommodityData[]>([]);
  const [searchAsset, setSearchAsset] = useState('');
  const [loading, setLoading] = useState(true);
  const [period, setPeriod] = useState('DiÃ¡rio');

  const [selectedAsset, setSelectedAsset] = useState<CommodityData | null>(null);
  const [startDate, setStartDate] = useState(new Date(new Date().setDate(new Date().getDate() - 30)).toISOString().split('T')[0]);
  const [endDate, setEndDate] = useState(new Date().toISOString().split('T')[0]);
  const [historicalData, setHistoricalData] = useState<any[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);
  const [showHistoryModal, setShowHistoryModal] = useState(false);
  const assetOptions = Array.from(new Set(data.map((d) => d.asset))).sort();
  const filteredData = searchAsset
    ? data.filter((d) => d.asset.toLowerCase().includes(searchAsset.toLowerCase()))
    : data;

  const fetchData = async (selectedPeriod: string) => {
    setLoading(true);
    try {
      const response = await fetch(`/api/market-data?period=${selectedPeriod}`);
      const jsonData = await response.json();
      if (Array.isArray(jsonData)) {
        setData(jsonData);
      } else {
        console.error("API returned non-array data:", jsonData);
        setData([]);
      }
    } catch (error) {
      console.error("Error fetching market data:", error);
      setData([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData(period);
  }, [period]);

  const downloadCSV = () => {
    const headers = ["Nome", "Ticker", "Mercado", "PreÃ§o", "VariaÃ§Ã£o", "% VariaÃ§Ã£o"];
    const rows = data.map(c => [c.name, c.ticker, c.market, c.price, c.change, c.changePercent]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `market_data_${period.toLowerCase()}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const fetchHistoricalData = async (symbol: string) => {
    setLoadingHistory(true);
    try {
      const response = await fetch(`/api/historical/${symbol}?startDate=${startDate}&endDate=${endDate}`);
      const jsonData = await response.json();
      if (Array.isArray(jsonData)) {
        setHistoricalData(jsonData.reverse()); // Most recent first
      } else {
        setHistoricalData([]);
      }
    } catch (error) {
      console.error("Error fetching historical data:", error);
      setHistoricalData([]);
    } finally {
      setLoadingHistory(false);
    }
  };

  const downloadHistoricalCSV = () => {
    if (!selectedAsset || historicalData.length === 0) return;
    
    const headers = ["Data", "Abertura", "MÃ¡xima", "MÃ­nima", "Fechamento", "Volume"];
    const rows = historicalData.map(h => [
      new Date(h.date).toLocaleDateString(),
      h.open?.toFixed(2),
      h.high?.toFixed(2),
      h.low?.toFixed(2),
      h.close?.toFixed(2),
      h.volume
    ]);
    
    const csvContent = [
      headers.join(","),
      ...rows.map(r => r.join(","))
    ].join("\n");

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const link = document.createElement("a");
    const url = URL.createObjectURL(blob);
    link.setAttribute("href", url);
    link.setAttribute("download", `historico_${selectedAsset.ticker}_${startDate}_${endDate}.csv`);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <motion.div 
      initial={{ opacity: 0, x: 20 }}
      animate={{ opacity: 1, x: 0 }}
      className="space-y-6"
    >
      {/* CabeÃ§alho da PÃ¡gina / Barra de Filtros */}
      <section className="mb-8">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 mb-6">
          <div>
            <h1 className="text-4xl font-headline font-extrabold text-[#e2e3df] tracking-tight mb-2">Cockpit de Dados de Mercado</h1>
            <p className="text-[#c3c8c1] text-sm">Acompanhamento de commodities com dados consolidados do Supabase.</p>
          </div>
          <div className="flex gap-2 p-1 bg-[#1a1c1a] rounded-xl">
            {['DiÃ¡rio', 'Semanal', 'Mensal'].map((p) => (
              <button 
                key={p}
                onClick={() => setPeriod(p)}
                className={`px-6 py-2 font-bold text-xs rounded-lg transition-all ${period === p ? 'bg-[#292a28] text-[#a1d494] shadow-sm' : 'text-[#c3c8c1] hover:text-[#e2e3df]'}`}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 p-4 bg-[#1e201e] rounded-2xl border border-[#434843]/10">
          <div className="col-span-2 relative">
            <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[#c3c8c1]" />
            <input 
              type="text"
              value={searchAsset}
              onChange={(e) => setSearchAsset(e.target.value)}
              list="asset-options"
              className="w-full bg-[#0d0f0d] border-none rounded-lg py-2.5 pl-10 pr-4 text-sm text-[#e2e3df] placeholder:text-[#c3c8c1]/50 focus:ring-1 focus:ring-[#e9c349]" 
              placeholder="Pesquisar por asset (ex: SOJA_EUA)..." 
            />
            <datalist id="asset-options">
              {assetOptions.map((asset) => (
                <option key={asset} value={asset} />
              ))}
            </datalist>
          </div>
          <div className="relative">
            <select className="w-full bg-[#0d0f0d] border-none rounded-lg py-2.5 px-4 text-sm text-[#e2e3df] focus:ring-1 focus:ring-[#e9c349] appearance-none">
              <option>Todas as RegiÃµes</option>
              <option>AmÃ©rica do Norte</option>
              <option>AmÃ©rica do Sul (BRA/ARG)</option>
              <option>Mar Negro / UE</option>
            </select>
          </div>
          <div className="flex gap-2">
            <button 
              onClick={() => fetchData(period)}
              className="flex-1 bg-[#333533] hover:bg-[#383a37] text-[#e2e3df] text-xs font-bold rounded-lg flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} className={loading ? "animate-spin" : ""} /> Atualizar
            </button>
            <button 
              onClick={downloadCSV}
              className="flex-1 bg-[#a1d494] text-[#0a3909] text-xs font-bold rounded-lg flex items-center justify-center gap-2"
            >
              <Download size={14} /> Exportar
            </button>
          </div>
        </div>
      </section>

      {/* Grade de Dados */}
      <section className="bg-[#1e201e] rounded-2xl overflow-hidden border border-[#434843]/10">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-[#1a1c1a]">
                <th className="px-6 py-4 font-headline text-[10px] uppercase tracking-widest text-[#c3c8c1]">Ativo / Ticker</th>
                <th className="px-4 py-4 font-headline text-[10px] uppercase tracking-widest text-[#c3c8c1]">Mercado</th>
                <th className="px-4 py-4 font-headline text-[10px] uppercase tracking-widest text-[#c3c8c1] text-right">PreÃ§o Atual</th>
                <th className="px-4 py-4 font-headline text-[10px] uppercase tracking-widest text-[#c3c8c1] text-right">VariaÃ§Ã£o</th>
                <th className="px-4 py-4 font-headline text-[10px] uppercase tracking-widest text-[#c3c8c1] text-right">% VariaÃ§Ã£o</th>
                <th className="px-6 py-4 font-headline text-[10px] uppercase tracking-widest text-[#c3c8c1] text-right">AÃ§Ãµes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#1a1c1a]/30 font-body text-sm text-[#e2e3df]">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-[#c3c8c1]">
                    <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                    Carregando dados do Supabase...
                  </td>
                </tr>
              ) : filteredData.map((c) => (
                <tr key={`${c.asset}-${c.ticker}`} className="hover:bg-[#333533] transition-colors group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`w-2 h-8 rounded-full ${c.change > 0 ? 'bg-[#a1d494]' : 'bg-[#ffb4ab]'}`}></div>
                      <div>
                        <div className="font-bold">{c.name}</div>
                        <div className="text-[10px] text-[#c3c8c1] uppercase">{c.asset} • {c.ticker}</div>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4">
                    <span className="px-2 py-1 bg-[#0d0f0d] rounded text-[10px] font-bold border border-[#434843]/10">{c.market}</span>
                  </td>
                  <td className="px-4 py-4 text-right tabular-nums font-bold">{c.price.toLocaleString()}</td>
                  <td className={`px-4 py-4 text-right tabular-nums ${c.change > 0 ? 'text-[#a1d494]' : 'text-[#ffb4ab]'}`}>
                    {c.change > 0 ? '+' : ''}{c.change.toFixed(2)}
                  </td>
                  <td className={`px-4 py-4 text-right tabular-nums ${c.change > 0 ? 'text-[#a1d494]' : 'text-[#ffb4ab]'}`}>
                    {c.change > 0 ? '+' : ''}{c.changePercent.toFixed(2)}%
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                      <button 
                        onClick={() => {
                          setSelectedAsset(c);
                          setShowHistoryModal(true);
                          fetchHistoricalData(c.asset);
                        }}
                        className="p-1.5 hover:bg-[#1e201e] rounded-md text-[#a1d494]"
                        title="Ver HistÃ³rico"
                      >
                        <History size={14} />
                      </button>
                      <button className="p-1.5 hover:bg-[#1e201e] rounded-md"><Bell size={14} /></button>
                      <button className="p-1.5 hover:bg-[#1e201e] rounded-md"><Star size={14} /></button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* Grade de Insights Inferior */}
      <section className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2 bg-[#1a1c1a] rounded-2xl p-6 relative overflow-hidden border border-[#434843]/10">
          <div className="absolute inset-0 bg-[#a1d494]/5 pointer-events-none"></div>
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-headline font-bold text-lg text-[#e2e3df]">Rastreador de PrÃªmios LogÃ­sticos</h2>
            <span className="text-xs font-bold text-[#a1d494] flex items-center gap-1">
              <span className="w-2 h-2 rounded-full bg-[#a1d494] animate-pulse"></span> CORRELAÃ‡ÃƒO AO VIVO
            </span>
          </div>
          <div className="grid grid-cols-2 gap-8">
            <div>
              <p className="text-[10px] uppercase font-bold text-[#c3c8c1] mb-4">Ãndice de Frete (GranÃ©is SÃ³lidos)</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-headline font-extrabold tabular-nums text-[#e2e3df]">2.410</span>
                <span className="text-[#ffb4ab] text-sm font-bold pb-1 flex items-center">-1,2%</span>
              </div>
              <div className="h-1 bg-[#333533] rounded-full overflow-hidden">
                <div className="h-full bg-[#ffb4ab]" style={{ width: '65%' }}></div>
              </div>
            </div>
            <div>
              <p className="text-[10px] uppercase font-bold text-[#c3c8c1] mb-4">MÃ©dia de Sobretaxa de CombustÃ­vel</p>
              <div className="flex items-end gap-2 mb-2">
                <span className="text-3xl font-headline font-extrabold tabular-nums text-[#e2e3df]">1,18</span>
                <span className="text-[#a1d494] text-sm font-bold pb-1 flex items-center">+0,5%</span>
              </div>
              <div className="h-1 bg-[#333533] rounded-full overflow-hidden">
                <div className="h-full bg-[#a1d494]" style={{ width: '42%' }}></div>
              </div>
            </div>
          </div>
          <div className="mt-8 h-32 bg-[#0d0f0d] rounded-xl flex items-center justify-center border border-[#434843]/10">
            <p className="text-[#c3c8c1] italic text-xs">Carregando VisualizaÃ§Ã£o de Spread LogÃ­stico DinÃ¢mico...</p>
          </div>
        </div>

        <div className="bg-[#0d0f0d] rounded-2xl p-6 border border-[#434843]/10">
          <h2 className="font-headline font-bold text-lg text-[#e2e3df] mb-6">Alertas CrÃ­ticos</h2>
          <div className="space-y-4">
            <div className="flex gap-4 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-[#93000a]/30 flex items-center justify-center shrink-0">
                <Info size={18} className="text-[#ffb4ab]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#e2e3df] leading-tight">Gargalo LogÃ­stico no Mato Grosso</h4>
                <p className="text-xs text-[#c3c8c1] mt-1">PrÃªmios de transporte rodoviÃ¡rio subiram 14% na regiÃ£o de MT.</p>
              </div>
            </div>
            <div className="flex gap-4 group cursor-pointer">
              <div className="w-10 h-10 rounded-lg bg-[#3a2800]/30 flex items-center justify-center shrink-0">
                <Star size={18} className="text-[#e9c176]" />
              </div>
              <div>
                <h4 className="text-sm font-bold text-[#e2e3df] leading-tight">Fraqueza na Base do Milho Argentino</h4>
                <p className="text-xs text-[#c3c8c1] mt-1">Estreitamento da base devido Ã  melhoria nas perspectivas climÃ¡ticas.</p>
              </div>
            </div>
          </div>
          <button className="w-full mt-6 py-2 border border-[#434843]/20 rounded-lg text-xs font-bold text-[#c3c8c1] hover:bg-[#1e201e] transition-colors">
            Ver Todas as NotÃ­cias e Alertas
          </button>
        </div>
      </section>

      {/* Modal de HistÃ³rico */}
      {showHistoryModal && selectedAsset && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm">
          <motion.div 
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-[#1e201e] w-full max-w-4xl max-h-[90vh] rounded-2xl border border-[#434843]/20 overflow-hidden flex flex-col shadow-2xl"
          >
            <div className="p-6 border-b border-[#434843]/10 flex justify-between items-center bg-[#1a1c1a]">
              <div>
                <h2 className="text-xl font-headline font-bold text-[#e2e3df]">HistÃ³rico: {selectedAsset.name} ({selectedAsset.asset})</h2>
                <p className="text-xs text-[#c3c8c1]">Consulte dados histÃ³ricos e exporte para anÃ¡lise.</p>
              </div>
              <button onClick={() => setShowHistoryModal(false)} className="p-2 hover:bg-[#333533] rounded-full text-[#c3c8c1]">
                <X size={20} />
              </button>
            </div>

            <div className="p-6 bg-[#1a1c1a]/50 border-b border-[#434843]/10 flex flex-wrap gap-4 items-end">
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#c3c8c1]">Data Inicial</label>
                <input 
                  type="date" 
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="bg-[#0d0f0d] border-none rounded-lg py-2 px-3 text-sm text-[#e2e3df] focus:ring-1 focus:ring-[#a1d494]"
                />
              </div>
              <div className="space-y-1">
                <label className="text-[10px] uppercase font-bold text-[#c3c8c1]">Data Final</label>
                <input 
                  type="date" 
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="bg-[#0d0f0d] border-none rounded-lg py-2 px-3 text-sm text-[#e2e3df] focus:ring-1 focus:ring-[#a1d494]"
                />
              </div>
              <button 
                onClick={() => fetchHistoricalData(selectedAsset.asset)}
                className="bg-[#333533] hover:bg-[#383a37] text-[#e2e3df] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2"
              >
                <RefreshCw size={14} className={loadingHistory ? "animate-spin" : ""} /> Filtrar
              </button>
              <button 
                onClick={downloadHistoricalCSV}
                disabled={historicalData.length === 0}
                className="bg-[#a1d494] text-[#0a3909] px-4 py-2 rounded-lg text-xs font-bold flex items-center gap-2 disabled:opacity-50"
              >
                <Download size={14} /> Baixar CSV
              </button>
            </div>

            <div className="flex-1 overflow-y-auto p-0">
              <table className="w-full text-left border-collapse">
                <thead className="sticky top-0 bg-[#1e201e] z-10 shadow-sm">
                  <tr>
                    <th className="px-6 py-3 font-headline text-[10px] uppercase tracking-widest text-[#c3c8c1]">Data</th>
                    <th className="px-4 py-3 font-headline text-[10px] uppercase tracking-widest text-[#c3c8c1] text-right">Abertura</th>
                    <th className="px-4 py-3 font-headline text-[10px] uppercase tracking-widest text-[#c3c8c1] text-right">MÃ¡xima</th>
                    <th className="px-4 py-3 font-headline text-[10px] uppercase tracking-widest text-[#c3c8c1] text-right">MÃ­nima</th>
                    <th className="px-4 py-3 font-headline text-[10px] uppercase tracking-widest text-[#c3c8c1] text-right">Fechamento</th>
                    <th className="px-6 py-3 font-headline text-[10px] uppercase tracking-widest text-[#c3c8c1] text-right">Volume</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-[#434843]/10 font-body text-xs text-[#e2e3df]">
                  {loadingHistory ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[#c3c8c1]">
                        <RefreshCw className="animate-spin mx-auto mb-2" size={24} />
                        Buscando histÃ³rico...
                      </td>
                    </tr>
                  ) : historicalData.length === 0 ? (
                    <tr>
                      <td colSpan={6} className="px-6 py-12 text-center text-[#c3c8c1]">
                        Nenhum dado encontrado para este perÃ­odo.
                      </td>
                    </tr>
                  ) : historicalData.map((h, idx) => (
                    <tr key={idx} className="hover:bg-[#333533]/50 transition-colors">
                      <td className="px-6 py-3 font-bold">{new Date(h.date).toLocaleDateString()}</td>
                      <td className="px-4 py-3 text-right tabular-nums">{h.open?.toFixed(2) || '-'}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#a1d494]">{h.high?.toFixed(2) || '-'}</td>
                      <td className="px-4 py-3 text-right tabular-nums text-[#ffb4ab]">{h.low?.toFixed(2) || '-'}</td>
                      <td className="px-4 py-3 text-right tabular-nums font-bold">{h.close?.toFixed(2) || '-'}</td>
                      <td className="px-6 py-3 text-right tabular-nums text-[#c3c8c1]">{h.volume?.toLocaleString() || '-'}</td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </motion.div>
        </div>
      )}
    </motion.div>
  );
}

import React from 'react';
import { motion } from 'motion/react';
import { Download, Share2, Plus, Minus, Layers, Droplets, Activity, Sparkles, ArrowRight, RefreshCw, Bolt } from 'lucide-react';

export default function Premium() {
  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      className="space-y-6"
    >
      {/* Seção de Cabeçalho */}
      <div className="mb-8 flex justify-between items-end">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <span className="bg-[#e9c176] text-[#261900] px-2 py-0.5 rounded text-[10px] font-black tracking-widest uppercase">Premium</span>
            <h2 className="font-headline text-3xl font-extrabold text-[#e2e3df] tracking-tight">Terminal de Inteligência</h2>
          </div>
          <p className="text-[#c3c8c1] font-medium">Análises proprietárias de camada profunda e modelagem preditiva de safra.</p>
        </div>
        <div className="flex gap-2">
          <button className="px-4 py-2 bg-[#292a28] hover:bg-[#333533] transition-colors text-xs font-bold rounded flex items-center gap-2 text-[#e2e3df]">
            <Download size={14} />
            Exportar Relatório PDF
          </button>
          <button className="px-4 py-2 bg-[#a1d494] text-[#0a3909] hover:opacity-90 transition-opacity text-xs font-bold rounded flex items-center gap-2">
            <Share2 size={14} />
            Compartilhar Insights
          </button>
        </div>
      </div>

      {/* Layout de Grade Bento */}
      <div className="grid grid-cols-12 gap-4">
        {/* Mapa de Risco Climático IA (Grande) */}
        <div className="col-span-12 xl:col-span-8 bg-[#1e201e] rounded-xl overflow-hidden relative group border border-[#434843]/10">
          <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
            <div className="bg-[#0d0f0d]/80 backdrop-blur-md p-3 rounded-lg border border-[#434843]/10">
              <p className="text-[10px] font-bold text-[#c3c8c1] uppercase tracking-widest mb-1">Camada de Risco Global</p>
              <h3 className="font-headline text-lg font-bold text-[#e2e3df]">Variância de Precipitação IA</h3>
            </div>
            <div className="flex gap-2">
              <span className="px-2 py-1 bg-[#a1d494]/20 text-[#a1d494] text-[10px] font-bold rounded">Ativo: Previsão Q4</span>
              <span className="px-2 py-1 bg-[#333533] text-[#c3c8c1] text-[10px] font-bold rounded">98,2% de Confiança</span>
            </div>
          </div>
          <div className="absolute top-4 right-4 z-10">
            <div className="flex flex-col gap-1">
              <button className="bg-[#0d0f0d]/80 p-2 rounded-lg backdrop-blur-sm text-[#e2e3df] hover:text-[#a1d494] transition-colors"><Plus size={16} /></button>
              <button className="bg-[#0d0f0d]/80 p-2 rounded-lg backdrop-blur-sm text-[#e2e3df] hover:text-[#a1d494] transition-colors"><Minus size={16} /></button>
              <button className="bg-[#0d0f0d]/80 p-2 rounded-lg backdrop-blur-sm text-[#e2e3df] hover:text-[#a1d494] transition-colors"><Layers size={16} /></button>
            </div>
          </div>
          <div className="h-[460px] w-full bg-[#0d0f0d] relative overflow-hidden">
            <img 
              className="w-full h-full object-cover opacity-60 grayscale-[0.5] contrast-125" 
              src="https://picsum.photos/seed/agriculture-map/1200/800" 
              alt="Mapa de satélite"
              referrerPolicy="no-referrer"
            />
            {/* Sobreposição HUD do Mapa */}
            <div className="absolute inset-0 pointer-events-none border-[20px] border-transparent">
              <div className="h-full w-full border border-[#a1d494]/5 rounded-lg flex items-center justify-center">
                <div className="w-1/2 h-1/2 border border-[#a1d494]/10 rounded-full animate-pulse"></div>
              </div>
            </div>
          </div>
          <div className="absolute bottom-4 left-4 right-4 h-12 bg-[#292a28]/80 backdrop-blur-md border-l-2 border-[#a1d494] rounded-lg flex items-center px-4 justify-between">
            <div className="flex gap-6">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#ffb4ab]"></div>
                <span className="text-[10px] font-bold text-[#c3c8c1]">Risco de Seca Severa</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#e9c176]"></div>
                <span className="text-[10px] font-bold text-[#c3c8c1]">Zona de Volatilidade de Produtividade</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 rounded-full bg-[#a1d494]"></div>
                <span className="text-[10px] font-bold text-[#c3c8c1]">Crescimento Ideal</span>
              </div>
            </div>
            <div className="text-[10px] font-mono text-[#a1d494]">ESCANEANDO COORD: 41.8781° N, 87.6298° W</div>
          </div>
        </div>

        {/* Feed de Inteligência */}
        <div className="col-span-12 xl:col-span-4 flex flex-col gap-4">
          <div className="bg-[#1a1c1a] p-5 rounded-xl flex-1 flex flex-col border border-[#434843]/10">
            <div className="flex justify-between items-center mb-4">
              <h3 className="font-headline font-bold text-[#e2e3df]">Feed de Inteligência</h3>
              <span className="text-xs text-[#a1d494] font-bold">14 Novos Sinais</span>
            </div>
            <div className="space-y-6">
              <div className="relative pl-4 border-l-2 border-[#e9c176]">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-bold text-[#e9c176] uppercase">Alto Impacto</span>
                  <span className="text-[10px] text-[#c3c8c1]">2m atrás</span>
                </div>
                <h4 className="text-sm font-bold text-[#e2e3df] mb-1 leading-snug">Interrupção na Cadeia de Suprimentos do Mar Negro Prevista</h4>
                <p className="text-xs text-[#c3c8c1] leading-relaxed">Modelo proprietário sugere queda de 14% na capacidade de exportação de trigo até novembro.</p>
              </div>
              <div className="relative pl-4 border-l-2 border-[#a1d494]">
                <div className="flex justify-between mb-1">
                  <span className="text-[10px] font-bold text-[#a1d494] uppercase">Previsão de Safra</span>
                  <span className="text-[10px] text-[#c3c8c1]">14m atrás</span>
                </div>
                <h4 className="text-sm font-bold text-[#e2e3df] mb-1 leading-snug">Safra Brasileira de Soja Revisada para Cima</h4>
                <p className="text-xs text-[#c3c8c1] leading-relaxed">Padrões favoráveis de chuva no Mato Grosso indicam colheita recorde.</p>
              </div>
            </div>
            <button className="mt-auto w-full py-3 text-xs font-bold text-[#c3c8c1] hover:text-[#e2e3df] border-t border-[#434843]/10 transition-colors">
              Ver Toda a Inteligência
            </button>
          </div>
        </div>

        {/* Umidade Profunda do Solo */}
        <div className="col-span-12 md:col-span-5 bg-[#1a1c1a] rounded-xl p-6 border border-[#434843]/10">
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <Droplets className="text-[#a1d494]" size={20} />
              <h3 className="font-headline font-bold text-[#e2e3df]">Umidade Profunda do Solo</h3>
            </div>
            <div className="flex gap-1">
              <button className="px-2 py-1 bg-[#333533] text-[10px] font-bold rounded text-[#e2e3df]">10cm</button>
              <button className="px-2 py-1 bg-[#a1d494] text-[#0a3909] text-[10px] font-bold rounded">40cm</button>
              <button className="px-2 py-1 bg-[#333533] text-[10px] font-bold rounded text-[#e2e3df]">100cm</button>
            </div>
          </div>
          <div className="space-y-4">
            <div className="bg-[#0d0f0d] p-4 rounded-lg flex items-center justify-between">
              <div>
                <p className="text-[10px] font-bold text-[#c3c8c1] uppercase tracking-widest">Nível de Nitrogênio</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#e2e3df] tabular-nums">42,8</span>
                  <span className="text-xs text-[#a1d494] font-bold">ppm</span>
                </div>
              </div>
              <div className="flex gap-0.5 items-end h-8">
                {[4, 6, 8, 5, 3].map((h, i) => (
                  <div key={i} className="w-1 bg-[#a1d494] rounded-t-sm" style={{ height: `${h*4}px`, opacity: (i+1)/5 }} />
                ))}
              </div>
            </div>
            <div className="bg-[#0d0f0d] p-4 rounded-lg flex items-center justify-between border-l-2 border-[#e9c176]">
              <div>
                <p className="text-[10px] font-bold text-[#e9c176] uppercase tracking-widest">Equilíbrio de pH do Solo</p>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-[#e2e3df] tabular-nums">6,4</span>
                  <span className="text-xs text-[#e9c176] font-bold">pH</span>
                </div>
              </div>
              <div className="text-[10px] font-bold text-[#c3c8c1] text-right">
                <p className="text-[#e9c176]">FAIXA IDEAL</p>
                <p>6,2 - 6,8</p>
              </div>
            </div>
          </div>
        </div>

        {/* Motor de Previsão de Colheita */}
        <div className="col-span-12 md:col-span-7 bg-[#1e201e] rounded-xl p-6 relative overflow-hidden border border-[#434843]/10">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[#e9c176]/5 blur-3xl rounded-full"></div>
          <div className="flex items-center justify-between mb-6 relative z-10">
            <div className="flex items-center gap-3">
              <Activity className="text-[#e9c176]" size={20} />
              <h3 className="font-headline font-bold text-[#e2e3df]">Motor de Previsão de Colheita</h3>
            </div>
            <div className="text-[10px] font-bold text-[#c3c8c1] flex items-center gap-2">
              COMPUTADO: 04:00 GMT
              <RefreshCw size={10} />
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="text-[10px] font-bold text-[#c3c8c1] uppercase tracking-widest">
                  <th className="pb-4">Região</th>
                  <th className="pb-4">Commodity</th>
                  <th className="pb-4">Est. Anterior</th>
                  <th className="pb-4">Previsão Premium</th>
                  <th className="pb-4 text-right">Probabilidade</th>
                </tr>
              </thead>
              <tbody className="text-sm text-[#e2e3df]">
                <tr className="hover:bg-[#333533]/50 transition-colors cursor-default border-t border-[#434843]/10">
                  <td className="py-4 font-bold">Centro-Oeste EUA</td>
                  <td className="py-4 text-[#c3c8c1]">Milho (ZC)</td>
                  <td className="py-4 tabular-nums">172,5 bu/ac</td>
                  <td className="py-4 font-bold text-[#a1d494] tabular-nums">178,2 bu/ac</td>
                  <td className="py-4 text-right"><span className="bg-[#043405] px-2 py-0.5 rounded text-[10px] font-bold text-[#a1d494]">94%</span></td>
                </tr>
                <tr className="hover:bg-[#333533]/50 transition-colors cursor-default border-t border-[#434843]/10">
                  <td className="py-4 font-bold">Mar Negro</td>
                  <td className="py-4 text-[#c3c8c1]">Trigo (ZW)</td>
                  <td className="py-4 tabular-nums">85,0 Mmt</td>
                  <td className="py-4 font-bold text-[#ffb4ab] tabular-nums">78,4 Mmt</td>
                  <td className="py-4 text-right"><span className="bg-[#93000a]/20 px-2 py-0.5 rounded text-[10px] font-bold text-[#ffb4ab]">88%</span></td>
                </tr>
              </tbody>
            </table>
          </div>
          <div className="mt-6 flex items-center justify-between p-4 bg-[#043405]/20 rounded-lg border border-[#a1d494]/20">
            <div className="flex items-center gap-3">
              <Sparkles className="text-[#a1d494]" size={18} />
              <div>
                <p className="text-xs font-bold text-[#e2e3df]">Resumo IA: Variância de Produtividade Altista</p>
                <p className="text-[10px] text-[#c3c8c1]">O enfraquecimento favorável do La Niña indica potencial de alta para os mercados de milho da América do Norte.</p>
              </div>
            </div>
            <button className="text-xs font-bold text-[#a1d494] flex items-center gap-1">
              Relatório Completo <ArrowRight size={14} />
            </button>
          </div>
        </div>
      </div>

      {/* Rodapé de Estatísticas do Terminal */}
      <div className="mt-8 pt-6 border-t border-[#434843]/10 flex items-center justify-between text-[10px] font-mono text-[#c3c8c1] opacity-60">
        <div className="flex gap-6">
          <span>STATUS DO SISTEMA: IDEAL</span>
          <span>ATUALIZAÇÃO DE DADOS: 0,2s</span>
          <span>ENDPOINT DA API: AGRI-PRO-04</span>
        </div>
        <div>
          © 2024 UNIDADE DE INTELIGÊNCIA AGRI-TERMINAL. TODOS OS DIREITOS RESERVADOS.
        </div>
      </div>

      {/* Botão de Ação Flutuante */}
      <button className="fixed bottom-8 right-8 h-14 w-14 bg-[#e9c176] text-[#261900] rounded-full shadow-[0_20px_40px_rgba(233,195,118,0.3)] flex items-center justify-center hover:scale-105 active:scale-95 transition-all z-50">
        <Bolt size={24} className="fill-current" />
      </button>
    </motion.div>
  );
}

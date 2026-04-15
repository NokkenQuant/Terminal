import React from 'react';
import { motion } from 'motion/react';
import { CheckCircle, Lock, Sparkles, Crown, BarChart3, BrainCircuit, HelpCircle, ArrowRight } from 'lucide-react';

export default function Pricing() {
  return (
    <motion.div 
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      className="space-y-12"
    >
      {/* Seção Hero */}
      <section className="relative h-[409px] flex items-center px-10 overflow-hidden rounded-3xl">
        <div className="absolute inset-0 z-0">
          <div className="absolute inset-0 bg-gradient-to-r from-[#121412] via-[#121412]/80 to-transparent z-10"></div>
          <img 
            className="w-full h-full object-cover opacity-40" 
            src="https://picsum.photos/seed/wheat-storm/1200/600" 
            alt="Campo de trigo dramático"
            referrerPolicy="no-referrer"
          />
        </div>
        <div className="relative z-20 max-w-2xl">
          <span className="text-[#e9c349] font-bold tracking-widest text-xs uppercase mb-4 block">Inteligência Institucional</span>
          <h1 className="font-headline text-5xl font-extrabold tracking-tighter text-[#e2e3df] mb-6">
            Escale sua Produtividade com <br/><span className="text-[#a1d494]">Harvest+</span>
          </h1>
          <p className="font-body text-[#c3c8c1] text-lg leading-relaxed">
            Desbloqueie análises profundas do solo, modelagem climática preditiva e dados de mercado de nível institucional para negociação profissional de commodities.
          </p>
        </div>
      </section>

      {/* Arquitetura Tonal de Preços */}
      <div className="px-10 py-12 grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
        {/* Contêiner de Cards de Preço */}
        <div className="md:col-span-8 grid grid-cols-1 md:grid-cols-2 gap-6">
          {/* Plano Gratuito */}
          <div className="bg-[#1a1c1a] p-8 rounded-lg flex flex-col h-full border border-[#434843]/10">
            <div className="mb-8">
              <h3 className="font-headline text-2xl font-bold mb-2 text-[#e2e3df]">Gratuito</h3>
              <p className="text-[#c3c8c1] text-sm">Dados essenciais para operadores locais.</p>
              <div className="mt-6 flex items-baseline gap-1">
                <span className="text-4xl font-extrabold tabular-nums text-[#e2e3df]">$0</span>
                <span className="text-[#c3c8c1] text-sm font-medium">/mês</span>
              </div>
            </div>
            <ul className="flex-grow space-y-4 mb-10">
              <li className="flex items-start gap-3">
                <CheckCircle className="text-[#a1d494] text-lg" size={18} />
                <span className="text-sm font-medium text-[#e2e3df]">Dados de Mercado Atrasados (15m)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-[#a1d494] text-lg" size={18} />
                <span className="text-sm font-medium text-[#e2e3df]">Mapeamento Básico de Campo (5 campos)</span>
              </li>
              <li className="flex items-start gap-3">
                <CheckCircle className="text-[#a1d494] text-lg" size={18} />
                <span className="text-sm font-medium text-[#e2e3df]">Feed de Clima Padrão</span>
              </li>
              <li className="flex items-start gap-3 opacity-40">
                <Lock className="text-[#e2e3df] text-lg" size={18} />
                <span className="text-sm font-medium text-[#e2e3df]">Previsões Baseadas em IA</span>
              </li>
            </ul>
            <button className="w-full py-3 bg-[#292a28] text-[#e2e3df] font-bold rounded hover:bg-[#383a37] transition-all">Plano Atual</button>
          </div>

          {/* Plano Harvest+ Premium */}
          <div className="relative group h-full">
            {/* Efeito de Brilho */}
            <div className="absolute -inset-0.5 bg-gradient-to-b from-[#a1d494] to-[#e9c349] rounded-xl blur opacity-20 group-hover:opacity-40 transition duration-1000"></div>
            <div className="relative bg-[#1e201e] p-8 rounded-lg flex flex-col h-full border-t-2 border-[#a1d494]">
              <div className="absolute top-0 right-0 p-4">
                <span className="bg-[#043405] text-[#a1d494] text-[10px] font-black px-2 py-1 rounded tracking-widest uppercase">Mais Popular</span>
              </div>
              <div className="mb-8">
                <h3 className="font-headline text-2xl font-bold mb-2 text-[#a1d494] flex items-center gap-2">
                  Harvest+
                  <Crown size={24} className="fill-current" />
                </h3>
                <p className="text-[#c3c8c1] text-sm">Inteligência profunda do solo para profissionais.</p>
                <div className="mt-6 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold tabular-nums text-[#e9c349]">$149</span>
                  <span className="text-[#c3c8c1] text-sm font-medium">/mês</span>
                </div>
              </div>
              <ul className="flex-grow space-y-4 mb-10">
                <li className="flex items-start gap-3">
                  <Sparkles className="text-[#e9c349] text-lg fill-current" size={18} />
                  <span className="text-sm font-bold text-[#e2e3df]">Execução de Terminal em Tempo Real</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-[#a1d494] text-lg" size={18} />
                  <span className="text-sm font-medium text-[#e2e3df]">Mapeamento de Múltiplos Campos Ilimitado</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-[#a1d494] text-lg" size={18} />
                  <span className="text-sm font-medium text-[#e2e3df]">Previsões de IA e Produtividade Preditiva</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-[#a1d494] text-lg" size={18} />
                  <span className="text-sm font-medium text-[#e2e3df]">Relatórios Institucionais e Acesso à API</span>
                </li>
                <li className="flex items-start gap-3">
                  <CheckCircle className="text-[#a1d494] text-lg" size={18} />
                  <span className="text-sm font-medium text-[#e2e3df]">Suporte Concierge Prioritário 24/7</span>
                </li>
              </ul>
              <button className="w-full py-4 bg-[#e9c176] text-[#412d00] font-black rounded text-lg tracking-tight shadow-xl shadow-[#e9c176]/10 hover:scale-[1.02] active:scale-95 transition-all">
                UPGRADE PARA HARVEST+
              </button>
            </div>
          </div>
        </div>

        {/* Detalhamento de Recursos / Bento de Comparação */}
        <div className="md:col-span-4 space-y-6">
          {/* Card de Cobertura de Dados */}
          <div className="bg-[#1a1c1a] p-6 rounded-lg border border-[#434843]/10">
            <h4 className="text-[#e9c176] font-bold text-xs uppercase mb-4 flex items-center gap-2">
              <BarChart3 size={14} />
              Cobertura de Dados
            </h4>
            <div className="space-y-4">
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#c3c8c1]">Acesso a Bolsas Globais</span>
                <span className="font-bold text-[#a1d494]">Todas as Principais</span>
              </div>
              <div className="w-full bg-[#333533] h-1 rounded">
                <div className="bg-[#a1d494] h-full w-full rounded"></div>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span className="text-[#c3c8c1]">Classificação de Confiança IA</span>
                <span className="font-bold text-[#a1d494]">94,8%</span>
              </div>
              <div className="w-full bg-[#333533] h-1 rounded">
                <div className="bg-[#e9c349] h-full w-[94%] rounded"></div>
              </div>
            </div>
          </div>

          {/* Insight em Destaque */}
          <div className="bg-[#292a28]/80 backdrop-blur-md p-6 rounded-lg relative overflow-hidden group border-l-2 border-[#a1d494]">
            <div className="absolute -right-10 -bottom-10 w-32 h-32 bg-[#a1d494]/20 blur-3xl group-hover:bg-[#a1d494]/40 transition-all"></div>
            <div className="relative z-10">
              <div className="flex items-center gap-3 mb-4">
                <BrainCircuit className="text-[#e9c176]" size={20} />
                <h4 className="font-bold text-[#e2e3df]">Modelo de Colheita Preditiva</h4>
              </div>
              <p className="text-xs text-[#c3c8c1] leading-relaxed mb-4">
                Os usuários do Harvest+ ganham acesso exclusivo ao Modelo Neural de Solo, prevendo níveis de umidade dos grãos com 14 dias de antecedência com ingestão de satélite de alta frequência.
              </p>
              <div className="flex items-center gap-2 text-[#a1d494] font-bold text-xs cursor-pointer group/link">
                Saiba mais sobre Modelos de IA
                <ArrowRight size={14} className="group-hover/link:translate-x-1 transition-transform" />
              </div>
            </div>
          </div>

          {/* Info de Suporte */}
          <div className="bg-[#0d0f0d] p-6 rounded-lg border-l-4 border-[#434843]">
            <h4 className="font-bold text-sm mb-2 text-[#e2e3df]">Suporte Institucional</h4>
            <p className="text-xs text-[#c3c8c1] mb-4">
              Gerentes de conta dedicados para empresas e cooperativas agrícolas de grande escala.
            </p>
            <button className="text-xs font-bold text-[#e2e3df] border border-[#434843] px-4 py-2 rounded hover:bg-[#1e201e] transition-all">Contatar Vendas</button>
          </div>
        </div>
      </div>

      {/* Módulos Avançados do Terminal */}
      <section className="px-10 pb-24 mt-12">
        <h2 className="font-headline text-3xl font-extrabold mb-8 text-[#e2e3df]">Módulos Avançados do Terminal</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[
            { title: 'Imagens Espectrais de Satélite', desc: 'Índices de vegetação NDVI ao vivo atualizados diariamente por coordenada de campo.', img: 'satellite' },
            { title: 'Algo-Trader de Futuros', desc: 'Execução automatizada baseada na umidade do solo e gatilhos de relatórios globais de safra.', img: 'algo' },
            { title: 'Fluxos Logísticos Globais', desc: 'Rastreie os principais navios de grãos e remessas ferroviárias em tempo real em todo o mundo.', img: 'logistics' }
          ].map((mod) => (
            <div key={mod.title} className="relative h-64 bg-[#1e201e] rounded-lg overflow-hidden flex flex-col justify-center items-center text-center p-6 border border-[#434843]/10">
              <img 
                className="absolute inset-0 w-full h-full object-cover blur-sm opacity-20" 
                src={`https://picsum.photos/seed/${mod.img}/400/300`} 
                alt={mod.title}
                referrerPolicy="no-referrer"
              />
              <div className="relative z-10">
                <Lock className="text-[#e9c176] text-4xl mb-4 mx-auto fill-current" size={40} />
                <h4 className="font-bold text-lg mb-2 text-[#e2e3df]">{mod.title}</h4>
                <p className="text-xs text-[#c3c8c1]">{mod.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* Log do Rodapé do Terminal */}
      <footer className="bg-[#0d0f0d] py-8 px-10 border-t border-[#434843]/10">
        <div className="flex flex-col md:flex-row justify-between items-center gap-6">
          <div className="flex items-center gap-6">
            <span className="text-lg font-bold text-[#a1d494]">AGRI-TERMINAL</span>
            <span className="text-[10px] tabular-nums font-mono text-[#c3c8c1] opacity-40">UPTIME_SISTEMA: 99,998% // LATÊNCIA: 12ms</span>
          </div>
          <div className="flex gap-8 text-xs text-[#c3c8c1]">
            <a className="hover:text-[#a1d494]" href="#">Protocolo de Privacidade</a>
            <a className="hover:text-[#a1d494]" href="#">Termos de Serviço</a>
            <a className="hover:text-[#a1d494]" href="#">Documentação da API</a>
            <a className="hover:text-[#a1d494]" href="#">Contatar Suporte</a>
          </div>
          <div className="text-xs text-[#c3c8c1] opacity-60">
            © 2024 AGRI-TERMINAL TECHNOLOGIES. TODOS OS DIREITOS RESERVADOS.
          </div>
        </div>
      </footer>
    </motion.div>
  );
}

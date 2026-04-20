import React from 'react';
import { LayoutDashboard, BarChart3, BrainCircuit, Crown, Package, Settings, HelpCircle, Stars } from 'lucide-react';
import { View } from '../types';

interface SidebarProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function Sidebar({ currentView, onViewChange }: SidebarProps) {
  const menuItems = [
    { id: 'dashboard', label: 'Painel', icon: LayoutDashboard },
    { id: 'market-data', label: 'Dados de Mercado', icon: BarChart3 },
    { id: 'physical-market', label: 'Mercado Fisico', icon: BarChart3 },
    { id: 'analysis', label: 'AnÃ¡lise de Ativos', icon: BrainCircuit },
    { id: 'premium', label: 'Premium', icon: Crown, color: 'text-[#e9c176]' },
    { id: 'portfolio', label: 'PortfÃ³lio', icon: Package },
  ];

  return (
    <aside className="fixed left-0 top-0 flex flex-col h-full py-4 bg-[#1a1c1a] w-64 pt-16 z-40 hidden md:flex">
      <div className="px-6 mb-8">
        <h2 className="text-lg font-black text-[#e9c176] font-headline">Terminal v2.4</h2>
        <p className="text-[10px] uppercase tracking-widest text-[#c3c8c1] opacity-60">InteligÃªncia Profunda do Solo</p>
      </div>

      <nav className="flex-1 space-y-1">
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <div
              key={item.id}
              onClick={() => onViewChange(item.id as View)}
              className={`
                flex items-center px-6 py-3 gap-3 cursor-pointer transition-all
                ${isActive 
                  ? 'bg-[#1e201e] text-[#a1d494] rounded-r-full mr-4' 
                  : 'text-[#e2e3df] opacity-60 hover:text-[#a1d494] hover:bg-[#292a28]'
                }
              `}
            >
              <Icon size={18} className={isActive ? 'fill-current' : ''} />
              <span className="text-sm font-medium">{item.label}</span>
            </div>
          );
        })}
      </nav>

      <div className="px-4 mt-auto">
        <div className="bg-gradient-to-br from-[#043405] to-[#292a28] p-4 rounded-xl mb-6 relative overflow-hidden group">
          <div className="relative z-10">
            <div className="flex items-center gap-2 mb-1">
              <Stars size={14} className="text-[#e9c176] fill-current" />
              <p className="text-xs font-bold text-[#e9c176]">Harvest+ Pronto</p>
            </div>
            <p className="text-[10px] text-[#c3c8c1] mb-3">Desbloqueie mapas de liquidez CBOT em tempo real</p>
            <button 
              onClick={() => onViewChange('pricing')}
              className="bg-[#a1d494] text-[#0a3909] text-[11px] font-bold py-1.5 px-3 rounded-md w-full hover:brightness-110 transition-all"
            >
              Upgrade para Harvest+
            </button>
          </div>
        </div>

        <div className="flex flex-col gap-1 border-t border-[#434843]/20 pt-4">
          <div className="text-[#e2e3df] opacity-60 hover:text-[#a1d494] transition-all flex items-center px-2 py-2 gap-3 cursor-pointer">
            <Settings size={14} />
            <span className="text-xs">ConfiguraÃ§Ãµes</span>
          </div>
          <div className="text-[#e2e3df] opacity-60 hover:text-[#a1d494] transition-all flex items-center px-2 py-2 gap-3 cursor-pointer">
            <HelpCircle size={14} />
            <span className="text-xs">Suporte</span>
          </div>
        </div>
      </div>
    </aside>
  );
}


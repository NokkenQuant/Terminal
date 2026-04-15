import React from 'react';
import { Search, Bell, TrendingUp, User } from 'lucide-react';
import { View } from '../types';

interface TopNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
}

export default function TopNav({ currentView, onViewChange }: TopNavProps) {
  return (
    <nav className="flex justify-between items-center px-6 w-full h-14 z-50 bg-[#121412] fixed top-0 left-0 border-b border-[#434843]/10">
      <div className="flex items-center gap-8">
        <span className="text-xl font-bold tracking-tight text-[#a1d494] font-headline">AGRI-TERMINAL</span>
        <div className="hidden md:flex items-center gap-6">
          <button 
            onClick={() => onViewChange('dashboard')}
            className={`text-sm font-semibold px-1 h-14 flex items-center transition-all ${currentView === 'dashboard' ? 'text-[#a1d494] border-b-2 border-[#a1d494]' : 'text-[#e2e3df] opacity-70 hover:opacity-100'}`}
          >
            Painel de Mercado
          </button>
          <button className="text-sm text-[#e2e3df] opacity-70 hover:bg-[#1e201e] transition-colors duration-200 px-2 py-1 rounded">
            Visão Global
          </button>
          <button className="text-sm text-[#e2e3df] opacity-70 hover:bg-[#1e201e] transition-colors duration-200 px-2 py-1 rounded">
            Sazonalidade
          </button>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="relative group">
          <div className="flex items-center bg-[#0d0f0d] px-3 py-1.5 rounded-lg border border-[#434843]/20 group-focus-within:border-[#a1d494] transition-all">
            <Search size={14} className="text-[#c3c8c1] mr-2" />
            <input 
              type="text" 
              className="bg-transparent border-none focus:ring-0 text-xs w-64 placeholder:text-[#c3c8c1]/50 text-[#e2e3df]" 
              placeholder="Pesquisar commodities, notícias, tickers..." 
            />
            <span className="text-[10px] bg-[#1e201e] px-1.5 py-0.5 rounded text-[#c3c8c1]">CMD + K</span>
          </div>
        </div>
        
        <div className="flex items-center gap-3">
          <button className="text-[#c3c8c1] hover:text-[#a1d494] transition-colors">
            <Bell size={18} />
          </button>
          <button className="text-[#c3c8c1] hover:text-[#a1d494] transition-colors">
            <TrendingUp size={18} />
          </button>
          <button className="text-[#a1d494]">
            <User size={20} />
          </button>
        </div>
      </div>
    </nav>
  );
}

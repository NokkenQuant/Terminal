/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import React, { useState } from 'react';
import { View } from './types';
import Sidebar from './components/Sidebar';
import TopNav from './components/TopNav';
import Dashboard from './views/Dashboard';
import MarketData from './views/MarketData';
import PhysicalMarket from './views/PhysicalMarket';
import Premium from './views/Premium';
import Analysis from './views/Analysis';
import Pricing from './views/Pricing';
import { BarChart3, BrainCircuit, Crown, LayoutDashboard, Wheat } from 'lucide-react';

export default function App() {
  const [currentView, setCurrentView] = useState<View>('dashboard');

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard />;
      case 'market-data':
        return <MarketData />;
      case 'physical-market':
        return <PhysicalMarket />;
      case 'premium':
        return <Premium />;
      case 'analysis':
        return <Analysis />;
      case 'pricing':
        return <Pricing />;
      default:
        return <Dashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-[#121412] text-[#e2e3df] font-body selection:bg-[#a1d494]/30">
      <TopNav currentView={currentView} onViewChange={setCurrentView} />
      
      <div className="flex pt-14 h-screen overflow-hidden">
        <Sidebar currentView={currentView} onViewChange={setCurrentView} />
        
        <main className="flex-1 ml-0 md:ml-64 p-4 pb-24 md:pb-6 lg:p-6 overflow-y-auto bg-[#0d0f0d] scrollbar-hide">
          {renderView()}
        </main>
      </div>

      {/* Mobile Navigation Shell (Bottom Bar) */}
      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#1a1c1a] h-16 flex items-center justify-around z-50 border-t border-[#434843]/20">
        <button 
          onClick={() => setCurrentView('dashboard')}
          className={`min-w-12 min-h-12 flex flex-col items-center justify-center gap-1 rounded-lg ${currentView === 'dashboard' ? 'text-[#a1d494]' : 'text-[#c3c8c1] opacity-70'}`}
          aria-label="Abrir painel"
        >
          <LayoutDashboard size={18} />
          <span className="text-[10px] font-bold">Painel</span>
        </button>
        <button 
          onClick={() => setCurrentView('market-data')}
          className={`min-w-12 min-h-12 flex flex-col items-center justify-center gap-1 rounded-lg ${currentView === 'market-data' ? 'text-[#a1d494]' : 'text-[#c3c8c1] opacity-70'}`}
          aria-label="Abrir dados de mercado"
        >
          <BarChart3 size={18} />
          <span className="text-[10px] font-bold">Mercados</span>
        </button>
        <button 
          onClick={() => setCurrentView('physical-market')}
          className={`min-w-12 min-h-12 flex flex-col items-center justify-center gap-1 rounded-lg ${currentView === 'physical-market' ? 'text-[#a1d494]' : 'text-[#c3c8c1] opacity-70'}`}
          aria-label="Abrir mercado físico"
        >
          <Wheat size={18} />
          <span className="text-[10px] font-bold">Físico</span>
        </button>
        <button
          onClick={() => setCurrentView('analysis')}
          className={`min-w-12 min-h-12 flex flex-col items-center justify-center gap-1 rounded-lg ${currentView === 'analysis' ? 'text-[#a1d494]' : 'text-[#c3c8c1] opacity-70'}`}
          aria-label="Abrir análises"
        >
          <BrainCircuit size={18} />
          <span className="text-[10px] font-bold">Análise</span>
        </button>
        <button 
          onClick={() => setCurrentView('premium')}
          className={`min-w-12 min-h-12 flex flex-col items-center justify-center gap-1 rounded-lg ${currentView === 'premium' ? 'text-[#a1d494]' : 'text-[#c3c8c1] opacity-70'}`}
          aria-label="Abrir área premium"
        >
          <Crown size={18} />
          <span className="text-[10px] font-bold">Premium</span>
        </button>
      </nav>
    </div>
  );
}

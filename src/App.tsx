import React, { useEffect, useMemo, useState } from "react";
import { View } from "./types";
import Sidebar from "./components/Sidebar";
import TopNav from "./components/TopNav";
import Dashboard from "./views/Dashboard";
import MarketData from "./views/MarketData";
import PhysicalMarket from "./views/PhysicalMarket";
import Premium from "./views/Premium";
import Analysis from "./views/Analysis";
import Pricing from "./views/Pricing";
import Profile from "./views/Profile";
import { BarChart3, BrainCircuit, Crown, LayoutDashboard, Wheat } from "lucide-react";
import { AuthSession, ensureAuthSeedUsers, getSession, login, logout, RegisterInput, registerFreeAccount } from "./auth";

export default function App() {
  const [currentView, setCurrentView] = useState<View>("dashboard");
  const [session, setSession] = useState<AuthSession | null>(null);

  useEffect(() => {
    ensureAuthSeedUsers();
    setSession(getSession());
  }, []);

  const isPremium = useMemo(() => session?.plan === "premium", [session]);

  const onLogin = async (username: string, password: string) => {
    const authSession = await login(username, password);
    setSession(authSession);
  };

  const onRegister = async (input: RegisterInput) => {
    await registerFreeAccount(input);
  };

  const onLogout = () => {
    logout();
    setSession(null);
    if (currentView === "analysis") {
      setCurrentView("dashboard");
    }
  };

  const goToView = (view: View) => {
    if (view === "analysis" && !isPremium) {
      setCurrentView("premium");
      return;
    }
    setCurrentView(view);
  };

  const renderView = () => {
    switch (currentView) {
      case "dashboard":
        return <Dashboard session={session} />;
      case "market-data":
        return <MarketData session={session} />;
      case "physical-market":
        return <PhysicalMarket />;
      case "premium":
        return <Premium />;
      case "analysis":
        return isPremium ? (
          <Analysis />
        ) : (
          <section className="bg-[#1e201e] rounded-2xl border border-[#434843]/10 p-8">
            <h1 className="text-2xl font-headline font-extrabold text-[#e2e3df] mb-2">Analise de Ativos bloqueada</h1>
            <p className="text-sm text-[#c3c8c1] mb-4">
              Somente assinantes premium podem acessar esta aba. As demais abas continuam livres.
            </p>
            <button
              onClick={() => setCurrentView("pricing")}
              className="bg-[#a1d494] text-[#0a3909] text-xs font-bold rounded-lg px-4 py-2"
            >
              Ver plano premium
            </button>
          </section>
        );
      case "pricing":
        return <Pricing />;
      case "portfolio":
        return <Profile session={session} />;
      default:
        return <Dashboard session={session} />;
    }
  };

  return (
    <div className="relative min-h-screen overflow-hidden bg-[#0d0f0d] text-[#e2e3df] font-body">
      <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(161,212,148,0.12),transparent_26%),radial-gradient(circle_at_bottom_right,rgba(34,58,32,0.3),transparent_30%)]" />
      <div className="pointer-events-none absolute inset-0 opacity-40 [background-image:linear-gradient(rgba(67,72,67,0.11)_1px,transparent_1px),linear-gradient(90deg,rgba(67,72,67,0.11)_1px,transparent_1px)] [background-size:44px_44px] [mask-image:radial-gradient(circle_at_center,black,transparent_84%)]" />
      <TopNav
        currentView={currentView}
        onViewChange={goToView}
        session={session}
        onLogin={onLogin}
        onRegister={onRegister}
        onLogout={onLogout}
      />

      <div className="relative z-10 flex pt-14 h-screen overflow-hidden">
        <Sidebar currentView={currentView} onViewChange={goToView} session={session} />

        <main className="flex-1 ml-0 md:ml-64 p-4 pb-24 md:pb-6 lg:p-6 overflow-y-auto bg-transparent scrollbar-hide">
          {renderView()}
        </main>
      </div>

      <nav className="md:hidden fixed bottom-0 left-0 w-full bg-[#101210]/95 backdrop-blur-xl h-16 flex items-center justify-around z-50 border-t border-[#434843]/20">
        <button
          onClick={() => goToView("dashboard")}
          className={`min-w-12 min-h-12 flex flex-col items-center justify-center gap-1 rounded-lg ${currentView === "dashboard" ? "text-[#a1d494]" : "text-[#c3c8c1] opacity-70"}`}
          aria-label="Abrir painel"
        >
          <LayoutDashboard size={18} />
          <span className="text-[10px] font-bold">Painel</span>
        </button>
        <button
          onClick={() => goToView("market-data")}
          className={`min-w-12 min-h-12 flex flex-col items-center justify-center gap-1 rounded-lg ${currentView === "market-data" ? "text-[#a1d494]" : "text-[#c3c8c1] opacity-70"}`}
          aria-label="Abrir dados de mercado"
        >
          <BarChart3 size={18} />
          <span className="text-[10px] font-bold">Mercados</span>
        </button>
        <button
          onClick={() => goToView("physical-market")}
          className={`min-w-12 min-h-12 flex flex-col items-center justify-center gap-1 rounded-lg ${currentView === "physical-market" ? "text-[#a1d494]" : "text-[#c3c8c1] opacity-70"}`}
          aria-label="Abrir mercado fisico"
        >
          <Wheat size={18} />
          <span className="text-[10px] font-bold">Fisico</span>
        </button>
        <button
          onClick={() => goToView("analysis")}
          className={`min-w-12 min-h-12 flex flex-col items-center justify-center gap-1 rounded-lg ${currentView === "analysis" ? "text-[#a1d494]" : "text-[#c3c8c1] opacity-70"}`}
          aria-label="Abrir analises"
        >
          <BrainCircuit size={18} />
          <span className="text-[10px] font-bold">Analise</span>
        </button>
        <button
          onClick={() => goToView("premium")}
          className={`min-w-12 min-h-12 flex flex-col items-center justify-center gap-1 rounded-lg ${currentView === "premium" ? "text-[#a1d494]" : "text-[#c3c8c1] opacity-70"}`}
          aria-label="Abrir area premium"
        >
          <Crown size={18} />
          <span className="text-[10px] font-bold">Premium</span>
        </button>
      </nav>
    </div>
  );
}

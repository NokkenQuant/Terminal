import React, { useState } from "react";
import { Search, Bell, TrendingUp, User, LogOut } from "lucide-react";
import { View } from "../types";
import { AuthSession, RegisterInput } from "../auth";
import { BR_STATES, BR_STATES_CITIES } from "../data/brLocations";

interface TopNavProps {
  currentView: View;
  onViewChange: (view: View) => void;
  session: AuthSession | null;
  onLogin: (username: string, password: string) => Promise<void>;
  onRegister: (input: RegisterInput) => Promise<void>;
  onLogout: () => void;
}

export default function TopNav({ currentView, onViewChange, session, onLogin, onRegister, onLogout }: TopNavProps) {
  const [showAuthModal, setShowAuthModal] = useState(false);
  const [mode, setMode] = useState<"login" | "register">("login");
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"Masculino" | "Feminino" | "">("");
  const [phone, setPhone] = useState("");
  const [city, setCity] = useState("");
  const [state, setState] = useState("");
  const [country, setCountry] = useState("Brasil");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  const phoneRegex = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;
  const cities = state ? BR_STATES_CITIES[state] || [] : [];

  const formatPhone = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 2) return digits;
    if (digits.length <= 6) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    if (digits.length <= 10) return `(${digits.slice(0, 2)}) ${digits.slice(2, 6)}-${digits.slice(6)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  };

  const submit = async () => {
    setLoading(true);
    setError("");
    setSuccess("");
    try {
      if (mode === "login") {
        await onLogin(username, password);
        setShowAuthModal(false);
      } else {
        if (!emailRegex.test(email.trim())) throw new Error("Email invalido.");
        if (!phoneRegex.test(phone.trim())) throw new Error("Telefone invalido. Use formato (DD) 99999-9999.");
        if (!sex) throw new Error("Selecione o sexo.");
        if (!state || !city) throw new Error("Selecione estado e cidade.");
        await onRegister({
          username,
          password,
          fullName,
          email,
          age: Number(age),
          sex,
          phone,
          city,
          state,
          country,
        });
        setMode("login");
        setSuccess("Cadastro criado. Verifique seu e-mail e confirme a conta antes de entrar.");
        setPassword("");
        return;
      }
      setShowAuthModal(false);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Falha na autenticacao.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <>
      <nav className="flex justify-between items-center px-6 w-full h-14 z-50 bg-[#121412] fixed top-0 left-0 border-b border-[#434843]/10">
        <div className="flex items-center gap-8">
          <span className="text-xl font-bold tracking-tight text-[#a1d494] font-headline">AGRI-TERMINAL</span>
          <div className="hidden md:flex items-center gap-6">
            <button
              onClick={() => onViewChange("dashboard")}
              className={`text-sm font-semibold px-1 h-14 flex items-center transition-all ${currentView === "dashboard" ? "text-[#a1d494] border-b-2 border-[#a1d494]" : "text-[#e2e3df] opacity-70 hover:opacity-100"}`}
            >
              Painel de Mercado
            </button>
          </div>
        </div>

        <div className="flex items-center gap-4">
          <div className="relative group hidden sm:block">
            <div className="flex items-center bg-[#0d0f0d] px-3 py-1.5 rounded-lg border border-[#434843]/20 group-focus-within:border-[#a1d494] transition-all">
              <Search size={14} className="text-[#c3c8c1] mr-2" />
              <input type="text" className="bg-transparent border-none focus:ring-0 text-xs w-56 lg:w-64 text-[#e2e3df]" placeholder="Pesquisar..." />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <button className="text-[#c3c8c1] hover:text-[#a1d494] transition-colors" title="Alertas"><Bell size={18} /></button>
            <button className="text-[#c3c8c1] hover:text-[#a1d494] transition-colors" title="Resumo"><TrendingUp size={18} /></button>
            {session ? (
              <div className="flex items-center gap-2">
                <span className="text-[11px] px-2 py-1 rounded bg-[#1e201e] border border-[#434843]/25 text-[#e2e3df]">
                  {session.username} ({session.plan.toUpperCase()})
                </span>
                <button onClick={onLogout} className="text-[#c3c8c1] hover:text-[#ffb4ab]" title="Sair"><LogOut size={18} /></button>
              </div>
            ) : (
              <button className="text-[#a1d494]" title="Entrar ou criar conta" onClick={() => setShowAuthModal(true)}><User size={20} /></button>
            )}
          </div>
        </div>
      </nav>

      {showAuthModal && (
        <div className="fixed inset-0 z-[120] flex items-center justify-center bg-black/70 p-4">
          <div className="w-full max-w-xl rounded-2xl border border-[#434843]/25 bg-[#1e201e] p-5 max-h-[90vh] overflow-y-auto">
            <h2 className="text-xl font-headline font-bold text-[#e2e3df] mb-1">{mode === "login" ? "Entrar na conta" : "Criar conta free"}</h2>
            <div className="space-y-3">
              <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} placeholder={mode === "login" ? "Email" : "Usuario"} className="w-full rounded-lg bg-[#0d0f0d] border border-[#434843]/20 px-3 py-2 text-sm text-[#e2e3df]" />
              <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} placeholder="Senha" className="w-full rounded-lg bg-[#0d0f0d] border border-[#434843]/20 px-3 py-2 text-sm text-[#e2e3df]" />
              {mode === "register" && (
                <>
                  <input type="text" value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Nome completo" className="w-full rounded-lg bg-[#0d0f0d] border border-[#434843]/20 px-3 py-2 text-sm text-[#e2e3df]" />
                  <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} placeholder="Email" className="w-full rounded-lg bg-[#0d0f0d] border border-[#434843]/20 px-3 py-2 text-sm text-[#e2e3df]" />
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                    <input type="number" min="13" value={age} onChange={(e) => setAge(e.target.value)} placeholder="Idade" className="w-full rounded-lg bg-[#0d0f0d] border border-[#434843]/20 px-3 py-2 text-sm text-[#e2e3df]" />
                    <select value={sex} onChange={(e) => setSex(e.target.value as "Masculino" | "Feminino")} className="w-full rounded-lg bg-[#0d0f0d] border border-[#434843]/20 px-3 py-2 text-sm text-[#e2e3df]">
                      <option value="">Sexo</option>
                      <option value="Masculino">Masculino</option>
                      <option value="Feminino">Feminino</option>
                    </select>
                    <input type="text" value={phone} onChange={(e) => setPhone(formatPhone(e.target.value))} placeholder="Telefone (DD) 99999-9999" className="w-full rounded-lg bg-[#0d0f0d] border border-[#434843]/20 px-3 py-2 text-sm text-[#e2e3df]" />
                    <select
                      value={state}
                      onChange={(e) => {
                        const nextState = e.target.value;
                        setState(nextState);
                        setCity("");
                      }}
                      className="w-full rounded-lg bg-[#0d0f0d] border border-[#434843]/20 px-3 py-2 text-sm text-[#e2e3df]"
                    >
                      <option value="">Estado</option>
                      {BR_STATES.map((uf) => (
                        <option key={uf} value={uf}>{uf}</option>
                      ))}
                    </select>
                    <select value={city} onChange={(e) => setCity(e.target.value)} className="w-full rounded-lg bg-[#0d0f0d] border border-[#434843]/20 px-3 py-2 text-sm text-[#e2e3df]" disabled={!state}>
                      <option value="">Cidade</option>
                      {cities.map((cityOption) => (
                        <option key={cityOption} value={cityOption}>{cityOption}</option>
                      ))}
                    </select>
                    <input type="text" value={country} onChange={(e) => setCountry(e.target.value)} placeholder="Pais" className="w-full rounded-lg bg-[#0d0f0d] border border-[#434843]/20 px-3 py-2 text-sm text-[#e2e3df]" />
                  </div>
                </>
              )}
              {error && <p className="text-xs text-[#ffb4ab]">{error}</p>}
              {success && <p className="text-xs text-[#a1d494]">{success}</p>}
            </div>
            <div className="mt-4 flex gap-2">
              <button onClick={submit} disabled={loading} className="flex-1 rounded-lg bg-[#a1d494] px-3 py-2 text-xs font-bold text-[#0a3909] disabled:opacity-70">
                {loading ? "Processando..." : mode === "login" ? "Entrar" : "Criar conta free"}
              </button>
              <button onClick={() => setShowAuthModal(false)} className="rounded-lg border border-[#434843]/30 px-3 py-2 text-xs font-bold text-[#e2e3df]">Fechar</button>
            </div>
            <button onClick={() => setMode((current) => (current === "login" ? "register" : "login"))} className="mt-3 text-xs text-[#c3c8c1] hover:text-[#a1d494]">
              {mode === "login" ? "Nao tem conta? Criar free" : "Ja tem conta? Entrar"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}

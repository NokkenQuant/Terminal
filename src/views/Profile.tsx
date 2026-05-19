import React, { useEffect, useState } from "react";
import { motion } from "motion/react";
import { AuthSession, getPriceAlertsAsync, getWatchlistAssetsAsync, PriceAlert } from "../auth";

type ProfileProps = {
  session: AuthSession | null;
};

type SupabaseProfile = {
  full_name?: string;
  email?: string;
  age?: number;
  sex?: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
};

export default function Profile({ session }: ProfileProps) {
  const [profile, setProfile] = useState<SupabaseProfile | null>(null);
  const [watchlist, setWatchlist] = useState<string[]>([]);
  const [alerts, setAlerts] = useState<PriceAlert[]>([]);

  useEffect(() => {
    const loadProfile = async () => {
      if (!session?.token) {
        setProfile(null);
        return;
      }
      try {
        const resp = await fetch("/api/auth/profile", {
          headers: { Authorization: `Bearer ${session.token}` },
        });
        if (!resp.ok) {
          setProfile(null);
          return;
        }
        const payload = await resp.json();
        setProfile(payload?.profile || null);
      } catch {
        setProfile(null);
      }
    };
    loadProfile();
  }, [session?.token]);

  useEffect(() => {
    const load = async () => {
      if (!session) {
        setWatchlist([]);
        setAlerts([]);
        return;
      }
      try {
        const [watchlistData, alertsData] = await Promise.all([getWatchlistAssetsAsync(), getPriceAlertsAsync()]);
        setWatchlist(watchlistData);
        setAlerts(alertsData);
      } catch (error) {
        console.error(error);
        setWatchlist([]);
        setAlerts([]);
      }
    };
    load();
  }, [session]);

  if (!session) {
    return (
      <section className="bg-[#1e201e] rounded-2xl border border-[#434843]/10 p-8">
        <h1 className="text-2xl font-headline font-extrabold text-[#e2e3df] mb-2">Perfil do usuario</h1>
        <p className="text-sm text-[#c3c8c1]">Entre na conta para visualizar dados pessoais, watchlist e pagamento.</p>
      </section>
    );
  }

  const paymentStatus = session.plan === "premium" ? "Ativo" : "Nao contratado";
  const renewalDate = session.plan === "premium" ? "2026-12-31" : "-";

  return (
    <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="space-y-4">
      <section className="bg-[#1e201e] rounded-2xl border border-[#434843]/10 p-6">
        <h1 className="text-2xl font-headline font-extrabold text-[#e2e3df] mb-3">Perfil do usuario</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
          <div className="bg-[#121412] rounded-lg p-3 border border-[#434843]/20">
            <p className="text-[#9ea39d] text-xs">Nome</p>
            <p className="text-[#e2e3df] font-bold">{profile?.full_name || session.username}</p>
          </div>
          <div className="bg-[#121412] rounded-lg p-3 border border-[#434843]/20">
            <p className="text-[#9ea39d] text-xs">Usuario</p>
            <p className="text-[#e2e3df] font-bold">{session.username}</p>
          </div>
          <div className="bg-[#121412] rounded-lg p-3 border border-[#434843]/20">
            <p className="text-[#9ea39d] text-xs">Email</p>
            <p className="text-[#e2e3df] font-bold">{profile?.email || "-"}</p>
          </div>
          <div className="bg-[#121412] rounded-lg p-3 border border-[#434843]/20">
            <p className="text-[#9ea39d] text-xs">Tipo de conta</p>
            <p className="text-[#e2e3df] font-bold uppercase">{session.plan}</p>
          </div>
          <div className="bg-[#121412] rounded-lg p-3 border border-[#434843]/20">
            <p className="text-[#9ea39d] text-xs">Idade</p>
            <p className="text-[#e2e3df] font-bold">{profile?.age ?? "-"}</p>
          </div>
          <div className="bg-[#121412] rounded-lg p-3 border border-[#434843]/20">
            <p className="text-[#9ea39d] text-xs">Sexo</p>
            <p className="text-[#e2e3df] font-bold">{profile?.sex || "-"}</p>
          </div>
          <div className="bg-[#121412] rounded-lg p-3 border border-[#434843]/20">
            <p className="text-[#9ea39d] text-xs">Telefone</p>
            <p className="text-[#e2e3df] font-bold">{profile?.phone || "-"}</p>
          </div>
          <div className="bg-[#121412] rounded-lg p-3 border border-[#434843]/20">
            <p className="text-[#9ea39d] text-xs">Cidade / Estado</p>
            <p className="text-[#e2e3df] font-bold">{[profile?.city, profile?.state].filter(Boolean).join(" / ") || "-"}</p>
          </div>
        </div>
      </section>

      <section className="bg-[#1e201e] rounded-2xl border border-[#434843]/10 p-6">
        <h2 className="text-lg font-headline font-bold text-[#e2e3df] mb-3">Watchlist</h2>
        <p className="text-sm text-[#c3c8c1]">{watchlist.length ? watchlist.join(", ") : "Nenhum ativo favoritado."}</p>
      </section>

      <section className="bg-[#1e201e] rounded-2xl border border-[#434843]/10 p-6">
        <h2 className="text-lg font-headline font-bold text-[#e2e3df] mb-3">Alertas de preco</h2>
        <p className="text-sm text-[#c3c8c1]">
          {alerts.length
            ? alerts
                .slice(0, 10)
                .map((a) => `${a.asset} alvo ${a.targetPrice} (${a.direction === "above" ? "acima" : "abaixo"}) ate ${new Date(a.expiresAt).toLocaleDateString("pt-BR")}`)
                .join(", ")
            : "Nenhum alerta configurado."}
        </p>
      </section>

      <section className="bg-[#1e201e] rounded-2xl border border-[#434843]/10 p-6">
        <h2 className="text-lg font-headline font-bold text-[#e2e3df] mb-3">Controle de pagamento</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-sm">
          <div className="bg-[#121412] rounded-lg p-3 border border-[#434843]/20">
            <p className="text-[#9ea39d] text-xs">Status</p>
            <p className="text-[#e2e3df] font-bold">{paymentStatus}</p>
          </div>
          <div className="bg-[#121412] rounded-lg p-3 border border-[#434843]/20">
            <p className="text-[#9ea39d] text-xs">Plano</p>
            <p className="text-[#e2e3df] font-bold uppercase">{session.plan}</p>
          </div>
          <div className="bg-[#121412] rounded-lg p-3 border border-[#434843]/20">
            <p className="text-[#9ea39d] text-xs">Renovacao</p>
            <p className="text-[#e2e3df] font-bold">{renewalDate}</p>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

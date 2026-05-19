import dotenv from "dotenv";
import express from "express";
import { createServer as createViteServer } from "vite";
import path from "path";
import { fileURLToPath } from "url";
import { getAnalysis, getAnalysisByMacroGroup, getHistorical, getMarketData, getPhysicalMarketData, getPhysicalMarketHistory } from "./lib/supabase-data";

const BR_STATES_CITIES: Record<string, string[]> = {
  SP: ["Sao Paulo", "Campinas", "Ribeirao Preto", "Santos"],
  RJ: ["Rio de Janeiro", "Niteroi", "Petropolis", "Campos dos Goytacazes"],
  MG: ["Belo Horizonte", "Uberlandia", "Vicosa", "Juiz de Fora"],
  PR: ["Curitiba", "Londrina", "Maringa", "Cascavel"],
  RS: ["Porto Alegre", "Caxias do Sul", "Passo Fundo", "Pelotas"],
  GO: ["Goiania", "Rio Verde", "Jatai", "Anapolis"],
  MT: ["Cuiaba", "Rondonopolis", "Sinop", "Sorriso"],
  MS: ["Campo Grande", "Dourados", "Tres Lagoas", "Ponta Pora"],
  BA: ["Salvador", "Luis Eduardo Magalhaes", "Barreiras", "Feira de Santana"],
};

const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_REGEX = /^\(\d{2}\)\s\d{4,5}-\d{4}$/;

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(process.cwd(), ".env.local") });
dotenv.config({ path: path.resolve(process.cwd(), ".env") });

async function startServer() {
  const app = express();
  const port = Number(process.env.PORT || 3000);

  app.use(express.json());

  const getSupabaseEnv = () => {
    const supabaseUrl = process.env.SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const anonKey = process.env.SUPABASE_ANON_KEY || "";
    return { supabaseUrl, serviceRoleKey, anonKey };
  };

  const getMercadoPagoEnv = () => {
    const accessToken = process.env.MP_ACCESS_TOKEN || "";
    const webhookSecret = process.env.MP_WEBHOOK_SECRET || "";
    const planAmount = Number(process.env.MP_PREMIUM_AMOUNT || "49.90");
    const currency = process.env.MP_CURRENCY || "BRL";
    return { accessToken, webhookSecret, planAmount, currency };
  };

  const resolveUserIdFromToken = async (token: string): Promise<string | null> => {
    const { supabaseUrl, serviceRoleKey } = getSupabaseEnv();
    const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
      method: "GET",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${token}`,
      },
    });
    if (!userResp.ok) return null;
    const authUser = await userResp.json();
    return authUser?.id || null;
  };

  const setPremiumSubscription = async (userId: string, source: string) => {
    const { supabaseUrl, serviceRoleKey } = getSupabaseEnv();
    const renewal = new Date();
    renewal.setDate(renewal.getDate() + 30);
    const renewalDate = renewal.toISOString().slice(0, 10);

    const resp = await fetch(`${supabaseUrl}/rest/v1/subscriptions?on_conflict=user_id,plan`, {
      method: "POST",
      headers: {
        apikey: serviceRoleKey,
        Authorization: `Bearer ${serviceRoleKey}`,
        "Content-Type": "application/json",
        Prefer: "resolution=merge-duplicates,return=representation",
      },
      body: JSON.stringify([
        {
          user_id: userId,
          plan: "premium",
          status: "active",
          renewal_date: renewalDate,
          gateway_customer_id: source,
        },
      ]),
    });

    if (!resp.ok) {
      const errorBody = await resp.text();
      throw new Error(`Falha ao atualizar assinatura premium: ${errorBody}`);
    }
  };

  app.post("/api/auth/register", async (req, res) => {
    try {
      const { supabaseUrl, serviceRoleKey, anonKey } = getSupabaseEnv();
      if (!supabaseUrl || !serviceRoleKey || !anonKey) {
        res.status(500).json({ error: "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY/SUPABASE_ANON_KEY nao configurados." });
        return;
      }

      const {
        username,
        password,
        fullName,
        email,
        age,
        sex,
        phone,
        city,
        state,
        country,
      } = req.body || {};

      if (!username || String(username).trim().length < 4) {
        res.status(400).json({ error: "Usuario invalido." });
        return;
      }
      if (!password || String(password).length < 4) {
        res.status(400).json({ error: "Senha invalida." });
        return;
      }
      if (!fullName || !String(fullName).trim()) {
        res.status(400).json({ error: "Nome completo obrigatorio." });
        return;
      }
      if (!email || !EMAIL_REGEX.test(String(email).trim())) {
        res.status(400).json({ error: "Email invalido." });
        return;
      }
      if (!Number.isFinite(Number(age)) || Number(age) < 13 || Number(age) > 120) {
        res.status(400).json({ error: "Idade invalida." });
        return;
      }
      if (sex !== "Masculino" && sex !== "Feminino") {
        res.status(400).json({ error: "Sexo invalido." });
        return;
      }
      if (!phone || !PHONE_REGEX.test(String(phone).trim())) {
        res.status(400).json({ error: "Telefone invalido. Use formato (DD) 99999-9999." });
        return;
      }
      if (!state || !BR_STATES_CITIES[String(state)]) {
        res.status(400).json({ error: "Estado invalido." });
        return;
      }
      if (!city || !BR_STATES_CITIES[String(state)].includes(String(city))) {
        res.status(400).json({ error: "Cidade invalida para o estado selecionado." });
        return;
      }

      const emailRedirectTo = `${process.env.APP_BASE_URL || "http://localhost:3000"}/`;
      const createUserResp = await fetch(`${supabaseUrl}/auth/v1/signup`, {
        method: "POST",
        headers: {
          apikey: anonKey,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: String(email).trim().toLowerCase(),
          password,
          data: {
            username: String(username).trim(),
            full_name: String(fullName).trim(),
            plan: "free",
          },
          options: {
            emailRedirectTo,
          },
        }),
      });

      if (!createUserResp.ok) {
        const errorBody = await createUserResp.text();
        res.status(400).json({ error: `Falha ao criar usuario no Auth: ${errorBody}` });
        return;
      }

      const createdUser = await createUserResp.json();
      const userId = createdUser?.user?.id;
      if (!userId) {
        res.status(500).json({ error: "Auth user criado sem id." });
        return;
      }

      const profileResp = await fetch(`${supabaseUrl}/rest/v1/profiles`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates,return=representation",
        },
        body: JSON.stringify([
          {
            id: userId,
            full_name: String(fullName).trim(),
            email: String(email).trim().toLowerCase(),
            age: Number(age),
            sex,
            phone: String(phone).trim(),
            city: String(city),
            state: String(state),
            country: country ? String(country) : "Brasil",
          },
        ]),
      });

      if (!profileResp.ok) {
        const errorBody = await profileResp.text();
        res.status(400).json({ error: `Falha ao inserir profile: ${errorBody}` });
        return;
      }

      await fetch(`${supabaseUrl}/rest/v1/subscriptions`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify([
          {
            user_id: userId,
            plan: "free",
            status: "active",
          },
        ]),
      });

      res.json({
        user: {
          username,
          plan: "free",
        },
        confirmation_email_sent: true,
      });
    } catch (error) {
      console.error("Auth register error:", error);
      res.status(500).json({ error: "Falha ao registrar usuario." });
    }
  });

  app.post("/api/auth/login", async (req, res) => {
    try {
      const { supabaseUrl, serviceRoleKey } = getSupabaseEnv();
      if (!supabaseUrl || !serviceRoleKey) {
        res.status(500).json({ error: "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY nao configurados." });
        return;
      }

      const { username, password } = req.body || {};
      if (!username || !password || !EMAIL_REGEX.test(String(username).trim())) {
        res.status(400).json({ error: "Use um email valido no login." });
        return;
      }

      const tokenResp = await fetch(`${supabaseUrl}/auth/v1/token?grant_type=password`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          email: String(username).trim().toLowerCase(),
          password,
        }),
      });

      if (!tokenResp.ok) {
        const errorBody = await tokenResp.text();
        res.status(401).json({ error: `Login invalido: ${errorBody}` });
        return;
      }

      const tokenData = await tokenResp.json();
      const userId = tokenData?.user?.id;
      let plan: "free" | "premium" = "free";
      if (userId) {
        const subsResp = await fetch(
          `${supabaseUrl}/rest/v1/subscriptions?select=plan,status&user_id=eq.${userId}&status=eq.active&order=updated_at.desc&limit=1`,
          {
            method: "GET",
            headers: {
              apikey: serviceRoleKey,
              Authorization: `Bearer ${serviceRoleKey}`,
            },
          }
        );
        if (subsResp.ok) {
          const subs = await subsResp.json();
          if (Array.isArray(subs) && subs[0]?.plan === "premium") {
            plan = "premium";
          }
        }
      }
      res.json({
        user: {
          username: tokenData?.user?.user_metadata?.username || String(username).trim().toLowerCase(),
          plan,
          access_token: tokenData?.access_token || "",
        },
      });
    } catch (error) {
      console.error("Auth login error:", error);
      res.status(500).json({ error: "Falha ao autenticar usuario." });
    }
  });

  app.get("/api/auth/profile", async (req, res) => {
    try {
      const { supabaseUrl, serviceRoleKey } = getSupabaseEnv();
      const authHeader = String(req.headers.authorization || "");
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) {
        res.status(401).json({ error: "Token ausente." });
        return;
      }

      const userResp = await fetch(`${supabaseUrl}/auth/v1/user`, {
        method: "GET",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${token}`,
        },
      });
      if (!userResp.ok) {
        res.status(401).json({ error: "Token invalido." });
        return;
      }
      const authUser = await userResp.json();
      const userId = authUser?.id;
      if (!userId) {
        res.status(404).json({ error: "Usuario nao encontrado." });
        return;
      }

      const profileResp = await fetch(`${supabaseUrl}/rest/v1/profiles?select=*&id=eq.${userId}&limit=1`, {
        method: "GET",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
        },
      });
      const profiles = profileResp.ok ? await profileResp.json() : [];
      const profile = Array.isArray(profiles) ? profiles[0] || null : null;

      res.json({
        username: authUser?.user_metadata?.username || authUser?.email || "",
        email: authUser?.email || profile?.email || "",
        profile,
      });
    } catch (error) {
      console.error("Auth profile error:", error);
      res.status(500).json({ error: "Falha ao carregar perfil." });
    }
  });

  app.get("/api/watchlist", async (req, res) => {
    try {
      const { supabaseUrl, serviceRoleKey } = getSupabaseEnv();
      const authHeader = String(req.headers.authorization || "");
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) return res.status(401).json({ error: "Token ausente." });
      const userId = await resolveUserIdFromToken(token);
      if (!userId) return res.status(401).json({ error: "Token invalido." });

      const resp = await fetch(
        `${supabaseUrl}/rest/v1/watchlists?select=asset_code&user_id=eq.${userId}&order=asset_code.asc`,
        { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
      );
      if (!resp.ok) return res.status(500).json({ error: "Falha ao carregar watchlist." });
      const rows = await resp.json();
      res.json({ assets: Array.isArray(rows) ? rows.map((r: any) => r.asset_code) : [] });
    } catch (error) {
      console.error("Watchlist get error:", error);
      res.status(500).json({ error: "Falha ao carregar watchlist." });
    }
  });

  app.post("/api/payments/mercadopago/checkout", async (req, res) => {
    try {
      const { accessToken, planAmount, currency } = getMercadoPagoEnv();
      if (!accessToken) {
        return res.status(500).json({ error: "MP_ACCESS_TOKEN nao configurado." });
      }

      const authHeader = String(req.headers.authorization || "");
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) return res.status(401).json({ error: "Token ausente." });
      const userId = await resolveUserIdFromToken(token);
      if (!userId) return res.status(401).json({ error: "Token invalido." });

      const frontendBaseUrl = process.env.APP_BASE_URL || "http://localhost:3000";
      const preferencePayload = {
        items: [
          {
            title: "Plano Premium Agro Terminal",
            quantity: 1,
            currency_id: currency,
            unit_price: planAmount,
          },
        ],
        external_reference: userId,
        metadata: {
          user_id: userId,
          plan: "premium",
          source: "agro-terminal",
        },
        back_urls: {
          success: `${frontendBaseUrl}/premium?status=success`,
          pending: `${frontendBaseUrl}/premium?status=pending`,
          failure: `${frontendBaseUrl}/premium?status=failure`,
        },
        auto_return: "approved",
      };

      const mpResp = await fetch("https://api.mercadopago.com/checkout/preferences", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${accessToken}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify(preferencePayload),
      });

      if (!mpResp.ok) {
        const errorBody = await mpResp.text();
        return res.status(500).json({ error: `Falha ao criar checkout Mercado Pago: ${errorBody}` });
      }

      const mpData = await mpResp.json();
      res.json({
        init_point: mpData?.init_point || "",
        sandbox_init_point: mpData?.sandbox_init_point || "",
        preference_id: mpData?.id || "",
      });
    } catch (error) {
      console.error("Mercado Pago checkout error:", error);
      res.status(500).json({ error: "Falha ao iniciar checkout Mercado Pago." });
    }
  });

  app.post("/api/payments/mercadopago/webhook", async (req, res) => {
    try {
      const { accessToken } = getMercadoPagoEnv();
      if (!accessToken) return res.status(500).json({ error: "MP_ACCESS_TOKEN nao configurado." });

      const topic = String(req.query.topic || req.body?.type || "");
      const dataId = String(req.query["data.id"] || req.body?.data?.id || "");

      // Ack rapido para evitar retries agressivos.
      res.status(200).json({ ok: true });

      if (!dataId || (topic && topic !== "payment")) return;

      const paymentResp = await fetch(`https://api.mercadopago.com/v1/payments/${dataId}`, {
        headers: {
          Authorization: `Bearer ${accessToken}`,
        },
      });
      if (!paymentResp.ok) {
        const txt = await paymentResp.text();
        console.error("Mercado Pago payment fetch failed:", txt);
        return;
      }

      const payment = await paymentResp.json();
      const status = String(payment?.status || "");
      if (status !== "approved") return;

      const userId = String(payment?.metadata?.user_id || payment?.external_reference || "");
      if (!userId) {
        console.error("Mercado Pago webhook sem user_id/external_reference");
        return;
      }

      await setPremiumSubscription(userId, `mercadopago_payment_${dataId}`);
      console.log(`Premium ativado para user_id=${userId} via Mercado Pago payment=${dataId}`);
    } catch (error) {
      console.error("Mercado Pago webhook error:", error);
    }
  });

  app.post("/api/watchlist", async (req, res) => {
    try {
      const { supabaseUrl, serviceRoleKey } = getSupabaseEnv();
      const authHeader = String(req.headers.authorization || "");
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      const asset = String(req.body?.asset || "").trim().toUpperCase();
      if (!token) return res.status(401).json({ error: "Token ausente." });
      if (!asset) return res.status(400).json({ error: "Asset obrigatorio." });
      const userId = await resolveUserIdFromToken(token);
      if (!userId) return res.status(401).json({ error: "Token invalido." });

      const resp = await fetch(`${supabaseUrl}/rest/v1/watchlists`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify([{ user_id: userId, asset_code: asset }]),
      });
      if (!resp.ok) return res.status(500).json({ error: "Falha ao salvar watchlist." });
      res.json({ ok: true });
    } catch (error) {
      console.error("Watchlist add error:", error);
      res.status(500).json({ error: "Falha ao salvar watchlist." });
    }
  });

  app.delete("/api/watchlist/:asset", async (req, res) => {
    try {
      const { supabaseUrl, serviceRoleKey } = getSupabaseEnv();
      const authHeader = String(req.headers.authorization || "");
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      const asset = String(req.params.asset || "").trim().toUpperCase();
      if (!token) return res.status(401).json({ error: "Token ausente." });
      const userId = await resolveUserIdFromToken(token);
      if (!userId) return res.status(401).json({ error: "Token invalido." });

      const resp = await fetch(
        `${supabaseUrl}/rest/v1/watchlists?user_id=eq.${userId}&asset_code=eq.${encodeURIComponent(asset)}`,
        {
          method: "DELETE",
          headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` },
        }
      );
      if (!resp.ok) return res.status(500).json({ error: "Falha ao remover watchlist." });
      res.json({ ok: true });
    } catch (error) {
      console.error("Watchlist delete error:", error);
      res.status(500).json({ error: "Falha ao remover watchlist." });
    }
  });

  app.get("/api/price-alerts", async (req, res) => {
    try {
      const { supabaseUrl, serviceRoleKey } = getSupabaseEnv();
      const authHeader = String(req.headers.authorization || "");
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) return res.status(401).json({ error: "Token ausente." });
      const userId = await resolveUserIdFromToken(token);
      if (!userId) return res.status(401).json({ error: "Token invalido." });

      const resp = await fetch(
        `${supabaseUrl}/rest/v1/price_alerts?select=asset_code,target_price,direction,expires_at,created_at&user_id=eq.${userId}&order=created_at.desc&limit=100`,
        { headers: { apikey: serviceRoleKey, Authorization: `Bearer ${serviceRoleKey}` } }
      );
      if (!resp.ok) return res.status(500).json({ error: "Falha ao carregar alertas." });
      const rows = await resp.json();
      res.json({
        alerts: Array.isArray(rows)
          ? rows.map((r: any) => ({
              asset: r.asset_code,
              targetPrice: Number(r.target_price),
              direction: r.direction,
              expiresAt: r.expires_at,
              createdAt: r.created_at,
            }))
          : [],
      });
    } catch (error) {
      console.error("Alerts get error:", error);
      res.status(500).json({ error: "Falha ao carregar alertas." });
    }
  });

  app.post("/api/price-alerts", async (req, res) => {
    try {
      const { supabaseUrl, serviceRoleKey } = getSupabaseEnv();
      const authHeader = String(req.headers.authorization || "");
      const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
      if (!token) return res.status(401).json({ error: "Token ausente." });
      const userId = await resolveUserIdFromToken(token);
      if (!userId) return res.status(401).json({ error: "Token invalido." });

      const { asset, targetPrice, direction, expiresAt } = req.body || {};
      const assetCode = String(asset || "").trim().toUpperCase();
      const price = Number(targetPrice);
      if (!assetCode || !Number.isFinite(price) || price <= 0 || (direction !== "above" && direction !== "below") || !expiresAt) {
        return res.status(400).json({ error: "Payload de alerta invalido." });
      }

      const resp = await fetch(`${supabaseUrl}/rest/v1/price_alerts`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify([
          {
            user_id: userId,
            asset_code: assetCode,
            target_price: price,
            direction,
            expires_at: expiresAt,
            active: true,
          },
        ]),
      });
      if (!resp.ok) {
        const txt = await resp.text();
        return res.status(500).json({ error: `Falha ao salvar alerta: ${txt}` });
      }
      res.json({ ok: true });
    } catch (error) {
      console.error("Alerts add error:", error);
      res.status(500).json({ error: "Falha ao salvar alerta." });
    }
  });

  app.get("/api/market-data", async (_req, res) => {
    try {
      const data = await getMarketData();
      res.json(data);
    } catch (error) {
      console.error("Market data error:", error);
      res.status(500).json({ error: "Failed to fetch market data from Supabase" });
    }
  });

  app.get("/api/analysis", async (req, res) => {
    try {
      const macroGroup = String(req.query.macro_group || req.query.macroGroup || "SOJA");
      const selectedDate = req.query.date ? String(req.query.date) : undefined;
      const data = await getAnalysisByMacroGroup(macroGroup, selectedDate);
      res.json(data);
    } catch (error) {
      console.error("Macro analysis data error:", error);
      res.status(500).json({ error: "Failed to fetch macro analysis data from Supabase" });
    }
  });

  app.get("/api/analysis/:symbol", async (req, res) => {
    try {
      const selectedDate = req.query.date ? String(req.query.date) : undefined;
      const data = await getAnalysis(req.params.symbol, selectedDate);
      res.json(data);
    } catch (error) {
      console.error("Analysis data error:", error);
      res.status(500).json({ error: "Failed to fetch analysis data from Supabase" });
    }
  });

  app.get("/api/historical/:symbol", async (req, res) => {
    try {
      const startDate = (req.query.startDate as string) || "2000-01-01";
      const endDate = (req.query.endDate as string) || "2100-01-01";
      const data = await getHistorical(req.params.symbol, startDate, endDate);
      res.json(data);
    } catch (error) {
      console.error("Historical data error:", error);
      res.status(500).json({ error: "Failed to fetch historical data from Supabase" });
    }
  });

  app.get("/api/physical-market", async (_req, res) => {
    try {
      const data = await getPhysicalMarketData();
      res.json(data);
    } catch (error) {
      console.error("Physical market data error:", error);
      res.status(500).json({ error: "Failed to fetch physical market data from Supabase" });
    }
  });

  app.get("/api/physical-market/history", async (req, res) => {
    try {
      const commodity = String(req.query.commodity || "");
      const variable = String(req.query.variable || "");
      const startDate = req.query.startDate ? String(req.query.startDate) : undefined;
      if (!commodity || !variable) {
        res.status(400).json({ error: "commodity and variable are required" });
        return;
      }
      const data = await getPhysicalMarketHistory(commodity, variable, startDate);
      res.json(data);
    } catch (error) {
      console.error("Physical market history error:", error);
      res.status(500).json({ error: "Failed to fetch physical market history from Supabase" });
    }
  });

  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (_req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(port, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${port}`);
  });
}

startServer();

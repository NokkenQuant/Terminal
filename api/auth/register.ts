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

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const anonKey = process.env.SUPABASE_ANON_KEY || "";
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

    if (!username || String(username).trim().length < 4) return res.status(400).json({ error: "Usuario invalido." });
    if (!password || String(password).length < 4) return res.status(400).json({ error: "Senha invalida." });
    if (!fullName || !String(fullName).trim()) return res.status(400).json({ error: "Nome completo obrigatorio." });
    if (!email || !EMAIL_REGEX.test(String(email).trim())) return res.status(400).json({ error: "Email invalido." });
    if (!Number.isFinite(Number(age)) || Number(age) < 13 || Number(age) > 120) return res.status(400).json({ error: "Idade invalida." });
    if (sex !== "Masculino" && sex !== "Feminino") return res.status(400).json({ error: "Sexo invalido." });
    if (!phone || !PHONE_REGEX.test(String(phone).trim())) return res.status(400).json({ error: "Telefone invalido. Use formato (DD) 99999-9999." });
    if (!state || !BR_STATES_CITIES[String(state)]) return res.status(400).json({ error: "Estado invalido." });
    if (!city || !BR_STATES_CITIES[String(state)].includes(String(city))) return res.status(400).json({ error: "Cidade invalida para o estado selecionado." });

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
      // Supabase pode retornar signup sem user id em cenarios de protecao contra enumeracao.
      // Nesses casos seguimos com mensagem de confirmacao para nao bloquear UX.
      res.status(200).json({
        user: { username, plan: "free" },
        confirmation_email_sent: true,
      });
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

    await fetch(`${supabaseUrl}/rest/v1/subscriptions?on_conflict=user_id,plan`, {
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

    res.status(200).json({
      user: { username, plan: "free" },
      confirmation_email_sent: true,
    });
  } catch (error) {
    console.error("Auth register error:", error);
    res.status(500).json({ error: "Falha ao registrar usuario." });
  }
}

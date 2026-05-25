const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export default async function handler(req: any, res: any) {
  if (req.method !== "POST") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
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
      const meta = tokenData?.user?.user_metadata || {};
      // Garante consistencia caso profile/subscription nao tenham sido gravados no signup.
      await fetch(`${supabaseUrl}/rest/v1/profiles?on_conflict=id`, {
        method: "POST",
        headers: {
          apikey: serviceRoleKey,
          Authorization: `Bearer ${serviceRoleKey}`,
          "Content-Type": "application/json",
          Prefer: "resolution=merge-duplicates",
        },
        body: JSON.stringify([
          {
            id: userId,
            full_name: meta?.full_name || meta?.username || String(username).trim(),
            email: String(username).trim().toLowerCase(),
            age: Number(meta?.age || 18),
            sex: meta?.sex === "Feminino" ? "Feminino" : "Masculino",
            phone: meta?.phone || "(00) 00000-0000",
            city: meta?.city || "Sao Paulo",
            state: meta?.state || "SP",
            country: meta?.country || "Brasil",
          },
        ]),
      });

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

      const subsResp = await fetch(
        `${supabaseUrl}/rest/v1/subscriptions?select=plan,status&user_id=eq.${userId}&status=eq.active&order=updated_at.desc&limit=20`,
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
        if (Array.isArray(subs) && subs.some((s: any) => s?.plan === "premium" && s?.status === "active")) {
          plan = "premium";
        }
      }
    }

    res.status(200).json({
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
}

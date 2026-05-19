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
        if (Array.isArray(subs) && subs[0]?.plan === "premium") plan = "premium";
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

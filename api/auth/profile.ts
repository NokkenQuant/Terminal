export default async function handler(req: any, res: any) {
  if (req.method !== "GET") {
    res.status(405).json({ error: "Method not allowed" });
    return;
  }

  try {
    const supabaseUrl = process.env.SUPABASE_URL || "";
    const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || "";
    const authHeader = String(req.headers.authorization || "");
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";
    if (!supabaseUrl || !serviceRoleKey) {
      res.status(500).json({ error: "SUPABASE_URL/SUPABASE_SERVICE_ROLE_KEY nao configurados." });
      return;
    }
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

    res.status(200).json({
      username: authUser?.user_metadata?.username || authUser?.email || "",
      email: authUser?.email || profile?.email || "",
      profile,
    });
  } catch (error) {
    console.error("Auth profile error:", error);
    res.status(500).json({ error: "Falha ao carregar perfil." });
  }
}

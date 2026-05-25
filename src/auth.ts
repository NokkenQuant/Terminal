export type UserPlan = "free" | "premium";

export type AuthUser = {
  username: string;
  plan: UserPlan;
};

export type AlertDirection = "above" | "below";

export type PriceAlert = {
  asset: string;
  targetPrice: number;
  expiresAt: string;
  direction: AlertDirection;
  createdAt: string;
};

export type RegisterInput = {
  username: string;
  password: string;
  fullName: string;
  email: string;
  age: number;
  sex: "Masculino" | "Feminino";
  phone: string;
  city: string;
  state: string;
  country: string;
};

export type StoredUser = AuthUser & {
  passwordHash: string;
  createdAt: string;
  fullName: string;
  email: string;
  age: number;
  sex: "Masculino" | "Feminino";
  phone: string;
  city: string;
  state: string;
  country: string;
};

export type AuthSession = AuthUser & {
  token: string;
  loggedAt: string;
};

const USERS_KEY = "agri_terminal_users_v1";
const SESSION_KEY = "agri_terminal_session_v1";
const WATCHLIST_KEY = "agri_terminal_watchlist_v1";
const ALERTS_KEY = "agri_terminal_alerts_v1";

const DEFAULT_PASSWORD_HASH_FOR_1234 = "03ac674216f3e15c761ee1a5e255f067953623c8b388b4459e13f978d7c846f4";

function loadJson<T>(key: string, fallback: T): T {
  try {
    const raw = localStorage.getItem(key);
    return raw ? (JSON.parse(raw) as T) : fallback;
  } catch {
    return fallback;
  }
}

function saveJson<T>(key: string, value: T): void {
  localStorage.setItem(key, JSON.stringify(value));
}

async function sha256(value: string): Promise<string> {
  const bytes = new TextEncoder().encode(value);
  const hashBuffer = await crypto.subtle.digest("SHA-256", bytes);
  return Array.from(new Uint8Array(hashBuffer))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
}

export function ensureAuthSeedUsers(): void {
  // Authentication is handled by Supabase in production mode.
}

export function getStoredUsers(): StoredUser[] {
  return loadJson<StoredUser[]>(USERS_KEY, []);
}

export function getStoredUserByUsername(username: string): StoredUser | null {
  return getStoredUsers().find((u) => u.username.toLowerCase() === username.toLowerCase()) || null;
}

export function getSession(): AuthSession | null {
  return loadJson<AuthSession | null>(SESSION_KEY, null);
}

export function logout(): void {
  localStorage.removeItem(SESSION_KEY);
}

export async function login(username: string, password: string): Promise<AuthSession> {
  const response = await fetch("/api/auth/login", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ username, password }),
  });
  if (!response.ok) {
    const payload = await response.json().catch(() => ({}));
    throw new Error(payload?.error || "Falha de login no Supabase.");
  }
  const payload = await response.json();
  const session: AuthSession = {
    username: payload?.user?.username || username,
    plan: payload?.user?.plan || "free",
    token: payload?.user?.access_token || crypto.randomUUID(),
    loggedAt: new Date().toISOString(),
  };
  saveJson(SESSION_KEY, session);
  return session;
}

export async function registerFreeAccount(input: RegisterInput): Promise<void> {
  const response = await fetch("/api/auth/register", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(input),
  });
  if (!response.ok) {
    const body = await response.json().catch(() => ({}));
    if (body?.code === "email_exists_or_pending") {
      throw new Error("Este e-mail ja esta cadastrado ou pendente de confirmacao. Verifique sua caixa de entrada.");
    }
    throw new Error(body?.error || "Falha ao registrar no Supabase.");
  }
  return;
}

export function addWatchlistAsset(username: string, asset: string): void {
  throw new Error("Deprecated sync call. Use addWatchlistAssetAsync.");
}

export function removeWatchlistAsset(username: string, asset: string): void {
  throw new Error("Deprecated sync call. Use removeWatchlistAssetAsync.");
}

export function getWatchlistAssets(username: string): string[] {
  throw new Error("Deprecated sync call. Use getWatchlistAssetsAsync.");
}

export function addPriceAlert(username: string, payload: PriceAlert): void {
  throw new Error("Deprecated sync call. Use addPriceAlertAsync.");
}

export function getPriceAlerts(username: string): PriceAlert[] {
  throw new Error("Deprecated sync call. Use getPriceAlertsAsync.");
}

function requireSessionToken(): string {
  const session = getSession();
  if (!session?.token) throw new Error("Sessao invalida.");
  return session.token;
}

export async function getWatchlistAssetsAsync(): Promise<string[]> {
  const token = requireSessionToken();
  const resp = await fetch("/api/watchlist", { headers: { Authorization: `Bearer ${token}` } });
  if (!resp.ok) throw new Error("Falha ao carregar watchlist.");
  const payload = await resp.json();
  return Array.isArray(payload?.assets) ? payload.assets : [];
}

export async function addWatchlistAssetAsync(asset: string): Promise<void> {
  const token = requireSessionToken();
  const resp = await fetch("/api/watchlist", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify({ asset }),
  });
  if (!resp.ok) throw new Error("Falha ao salvar watchlist.");
}

export async function removeWatchlistAssetAsync(asset: string): Promise<void> {
  const token = requireSessionToken();
  const resp = await fetch(`/api/watchlist/${encodeURIComponent(asset)}`, {
    method: "DELETE",
    headers: { Authorization: `Bearer ${token}` },
  });
  if (!resp.ok) throw new Error("Falha ao remover watchlist.");
}

export async function getPriceAlertsAsync(): Promise<PriceAlert[]> {
  const token = requireSessionToken();
  const resp = await fetch("/api/price-alerts", { headers: { Authorization: `Bearer ${token}` } });
  if (!resp.ok) throw new Error("Falha ao carregar alertas.");
  const payload = await resp.json();
  return Array.isArray(payload?.alerts) ? payload.alerts : [];
}

export async function addPriceAlertAsync(payload: PriceAlert): Promise<void> {
  const token = requireSessionToken();
  const resp = await fetch("/api/price-alerts", {
    method: "POST",
    headers: { "Content-Type": "application/json", Authorization: `Bearer ${token}` },
    body: JSON.stringify(payload),
  });
  if (!resp.ok) {
    const body = await resp.json().catch(() => ({}));
    throw new Error(body?.error || "Falha ao salvar alerta.");
  }
}

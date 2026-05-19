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
  sex: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
};

export type StoredUser = AuthUser & {
  passwordHash: string;
  createdAt: string;
  fullName: string;
  email: string;
  age: number;
  sex: string;
  phone?: string;
  city?: string;
  state?: string;
  country?: string;
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
  const users = loadJson<StoredUser[]>(USERS_KEY, []);
  if (users.length > 0) return;
  const now = new Date().toISOString();
  const seeded: StoredUser[] = [
    {
      username: "AdminFree",
      plan: "free",
      passwordHash: DEFAULT_PASSWORD_HASH_FOR_1234,
      createdAt: now,
      fullName: "Admin Free",
      email: "adminfree@example.com",
      age: 30,
      sex: "nao informado",
    },
    {
      username: "AdminPremium",
      plan: "premium",
      passwordHash: DEFAULT_PASSWORD_HASH_FOR_1234,
      createdAt: now,
      fullName: "Admin Premium",
      email: "adminpremium@example.com",
      age: 30,
      sex: "nao informado",
    },
  ];
  saveJson(USERS_KEY, seeded);
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
  const users = getStoredUsers();
  const user = users.find((u) => u.username.toLowerCase() === username.trim().toLowerCase());
  if (!user) {
    throw new Error("Usuario nao encontrado.");
  }
  const passwordHash = await sha256(password);
  if (passwordHash !== user.passwordHash) {
    throw new Error("Senha invalida.");
  }
  const session: AuthSession = {
    username: user.username,
    plan: user.plan,
    token: crypto.randomUUID(),
    loggedAt: new Date().toISOString(),
  };
  saveJson(SESSION_KEY, session);
  return session;
}

export async function registerFreeAccount(input: RegisterInput): Promise<AuthSession> {
  const normalized = input.username.trim();
  if (normalized.length < 4) throw new Error("O usuario precisa ter pelo menos 4 caracteres.");
  if (input.password.length < 4) throw new Error("A senha precisa ter pelo menos 4 caracteres.");
  if (!input.fullName.trim()) throw new Error("Nome completo obrigatorio.");
  if (!input.email.trim() || !input.email.includes("@")) throw new Error("Email invalido.");
  if (!Number.isFinite(input.age) || input.age < 13) throw new Error("Idade invalida.");
  if (!input.sex.trim()) throw new Error("Sexo obrigatorio.");

  const users = getStoredUsers();
  const exists = users.some((u) => u.username.toLowerCase() === normalized.toLowerCase());
  if (exists) throw new Error("Esse usuario ja existe.");

  const newUser: StoredUser = {
    username: normalized,
    plan: "free",
    passwordHash: await sha256(input.password),
    createdAt: new Date().toISOString(),
    fullName: input.fullName.trim(),
    email: input.email.trim().toLowerCase(),
    age: Math.floor(input.age),
    sex: input.sex.trim(),
    phone: input.phone?.trim(),
    city: input.city?.trim(),
    state: input.state?.trim(),
    country: input.country?.trim(),
  };
  saveJson(USERS_KEY, [...users, newUser]);
  const session: AuthSession = {
    username: newUser.username,
    plan: newUser.plan,
    token: crypto.randomUUID(),
    loggedAt: new Date().toISOString(),
  };
  saveJson(SESSION_KEY, session);
  return session;
}

export function addWatchlistAsset(username: string, asset: string): void {
  const state = loadJson<Record<string, string[]>>(WATCHLIST_KEY, {});
  const list = state[username] || [];
  if (!list.includes(asset)) {
    state[username] = [...list, asset].sort((a, b) => a.localeCompare(b, "pt-BR"));
    saveJson(WATCHLIST_KEY, state);
  }
}

export function removeWatchlistAsset(username: string, asset: string): void {
  const state = loadJson<Record<string, string[]>>(WATCHLIST_KEY, {});
  const list = state[username] || [];
  state[username] = list.filter((item) => item !== asset);
  saveJson(WATCHLIST_KEY, state);
}

export function getWatchlistAssets(username: string): string[] {
  const state = loadJson<Record<string, string[]>>(WATCHLIST_KEY, {});
  return state[username] || [];
}

export function addPriceAlert(username: string, payload: PriceAlert): void {
  if (!payload.asset.trim()) throw new Error("Ativo obrigatorio.");
  if (!Number.isFinite(payload.targetPrice) || payload.targetPrice <= 0) throw new Error("Preco alvo invalido.");
  if (!payload.expiresAt) throw new Error("Data limite obrigatoria.");
  const now = new Date();
  const expiry = new Date(payload.expiresAt);
  expiry.setHours(23, 59, 59, 999);
  if (Number.isNaN(expiry.getTime()) || expiry < now) throw new Error("Data limite deve ser futura.");

  const state = loadJson<Record<string, PriceAlert[]>>(ALERTS_KEY, {});
  const list = state[username] || [];
  state[username] = [payload, ...list].slice(0, 100);
  saveJson(ALERTS_KEY, state);
}

export function getPriceAlerts(username: string): PriceAlert[] {
  const state = loadJson<Record<string, PriceAlert[]>>(ALERTS_KEY, {});
  return state[username] || [];
}

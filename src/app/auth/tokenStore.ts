const LEGACY_COOKIE_KEY = 'theagencyjo_auth_session';
const ACCESS_KEY = 'theagencyjo_access_token';
const REFRESH_KEY = 'theagencyjo_refresh_token';
const USER_KEY = 'theagencyjo_auth_user';

export type AuthUser = {
  id: string;
  email?: string;
};

export type StoredAuth = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser | null;
};

function parseLegacyCookie(): StoredAuth | null {
  const allCookies = document.cookie ? document.cookie.split('; ') : [];
  const targetCookie = allCookies.find((c) => c.startsWith(`${LEGACY_COOKIE_KEY}=`));
  if (!targetCookie) return null;

  try {
    const encoded = targetCookie.substring(`${LEGACY_COOKIE_KEY}=`.length);
    const parsed = JSON.parse(decodeURIComponent(encoded)) as {
      access_token?: string;
      refresh_token?: string;
      user?: AuthUser;
    };
    if (!parsed.access_token || !parsed.refresh_token) return null;
    return {
      accessToken: parsed.access_token,
      refreshToken: parsed.refresh_token,
      user: parsed.user ?? null,
    };
  } catch {
    return null;
  }
}

function clearLegacyCookie(): void {
  document.cookie = `${LEGACY_COOKIE_KEY}=; Path=/; Max-Age=0; SameSite=Strict`;
}

export function loadStoredAuth(): StoredAuth | null {
  const accessToken = sessionStorage.getItem(ACCESS_KEY);
  const refreshToken = sessionStorage.getItem(REFRESH_KEY);
  if (accessToken && refreshToken) {
    let user: AuthUser | null = null;
    try {
      const raw = sessionStorage.getItem(USER_KEY);
      user = raw ? (JSON.parse(raw) as AuthUser) : null;
    } catch {
      user = null;
    }
    return { accessToken, refreshToken, user };
  }

  const legacy = parseLegacyCookie();
  if (legacy) {
    saveStoredAuth(legacy);
    clearLegacyCookie();
    return legacy;
  }

  return null;
}

export function saveStoredAuth(auth: StoredAuth): void {
  sessionStorage.setItem(ACCESS_KEY, auth.accessToken);
  sessionStorage.setItem(REFRESH_KEY, auth.refreshToken);
  if (auth.user) {
    sessionStorage.setItem(USER_KEY, JSON.stringify(auth.user));
  } else {
    sessionStorage.removeItem(USER_KEY);
  }
  clearLegacyCookie();
}

export function clearStoredAuth(): void {
  sessionStorage.removeItem(ACCESS_KEY);
  sessionStorage.removeItem(REFRESH_KEY);
  sessionStorage.removeItem(USER_KEY);
  clearLegacyCookie();
}

export function getRefreshToken(): string | null {
  return sessionStorage.getItem(REFRESH_KEY);
}

import { loadStoredAuth, getRefreshToken, clearStoredAuth } from './tokenStore';
import { refreshAuthSession } from './refreshSession';

type Handlers = {
  onRefreshed: (accessToken: string, refreshToken: string) => void;
  onExpired: () => void;
};

let handlers: Handlers | null = null;
let refreshInFlight: Promise<string | null> | null = null;

export function registerAuthSessionHandlers(next: Handlers): () => void {
  handlers = next;
  return () => {
    if (handlers === next) handlers = null;
  };
}

export function getStoredAccessToken(): string | null {
  return loadStoredAuth()?.accessToken ?? null;
}

export async function getValidAccessToken(): Promise<string | null> {
  const stored = loadStoredAuth();
  if (!stored) return null;
  return stored.accessToken;
}

export async function refreshAccessToken(): Promise<string | null> {
  if (refreshInFlight) return refreshInFlight;

  refreshInFlight = (async () => {
    const stored = loadStoredAuth();
    const refreshToken = getRefreshToken();
    if (!stored || !refreshToken) {
      handlers?.onExpired();
      return null;
    }
    try {
      const next = await refreshAuthSession(refreshToken, stored.user);
      handlers?.onRefreshed(next.accessToken, next.refreshToken);
      return next.accessToken;
    } catch {
      clearStoredAuth();
      handlers?.onExpired();
      return null;
    } finally {
      refreshInFlight = null;
    }
  })();

  return refreshInFlight;
}

/** Fetch wrapper: attaches bearer token and retries once after refresh on 401. */
export async function authFetch(
  input: string,
  init: RequestInit = {},
): Promise<Response> {
  const run = async (retry: boolean): Promise<Response> => {
    const token = retry ? await refreshAccessToken() : await getValidAccessToken();
    const headers = new Headers(init.headers);
    if (token) headers.set('Authorization', `Bearer ${token}`);
    const res = await fetch(input, { ...init, headers });
    if (res.status === 401 && !retry) {
      const newToken = await refreshAccessToken();
      if (newToken) return run(true);
    }
    return res;
  };
  return run(false);
}

import type { StoredAuth } from './tokenStore';
import { saveStoredAuth } from './tokenStore';

const API_URL = import.meta.env.VITE_API_URL as string;

type SessionPayload = {
  access_token: string;
  refresh_token: string;
  expires_in?: number;
  user?: { id: string; email?: string };
};

export async function refreshAuthSession(
  refreshToken: string,
  existingUser: StoredAuth['user'],
): Promise<StoredAuth> {
  const res = await fetch(`${API_URL}/auth/refresh`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh_token: refreshToken }),
  });

  if (!res.ok) {
    throw new Error('Session expired');
  }

  const body = (await res.json()) as { session: SessionPayload };
  const session = body.session;
  const auth: StoredAuth = {
    accessToken: session.access_token,
    refreshToken: session.refresh_token,
    user: session.user
      ? { id: session.user.id, email: session.user.email }
      : existingUser,
  };
  saveStoredAuth(auth);
  return auth;
}

import React, { createContext, useContext, useEffect, useState, useCallback } from 'react';
import {
  loadStoredAuth,
  saveStoredAuth,
  clearStoredAuth,
  type AuthUser,
  type StoredAuth,
} from '../auth/tokenStore';
import { registerAuthSessionHandlers, authFetch } from '../auth/authSession';
import { getUserDisplayName, type DisplayNameProfile } from '../utils/userDisplayName';

type AuthSession = {
  access_token?: string;
  refresh_token?: string;
  user?: AuthUser;
};

export type UserProfile = DisplayNameProfile & {
  email?: string | null;
  phone?: string | null;
  age?: number | null;
};

type AuthContextType = {
  session: AuthSession | null;
  user: AuthUser | null;
  profile: UserProfile | null;
  displayName: string;
  loading: boolean;
  setAuthSession: (session: AuthSession) => void;
  refreshProfile: () => Promise<void>;
  signOut: () => Promise<void>;
};

const AuthContext = createContext<AuthContextType>({
  session: null,
  user: null,
  profile: null,
  displayName: '',
  loading: true,
  setAuthSession: () => {},
  refreshProfile: async () => {},
  signOut: async () => {},
});

function toContextSession(stored: StoredAuth): AuthSession {
  return {
    access_token: stored.accessToken,
    refresh_token: stored.refreshToken,
    user: stored.user ?? undefined,
  };
}

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<AuthSession | null>(null);
  const [user, setUser] = useState<AuthUser | null>(null);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [loading, setLoading] = useState(true);
  const API_URL = import.meta.env.VITE_API_URL;

  const displayName = getUserDisplayName(profile, profile?.email ?? user?.email);

  const applyStored = useCallback((stored: StoredAuth) => {
    setSession(toContextSession(stored));
    setUser(stored.user);
  }, []);

  const refreshProfile = useCallback(async () => {
    const token = session?.access_token ?? loadStoredAuth()?.accessToken;
    if (!token || !API_URL) {
      setProfile(null);
      return;
    }
    try {
      const res = await authFetch(`${API_URL}/users/me`, {
        headers: { 'Content-Type': 'application/json' },
      });
      const data = (await res.json()) as UserProfile & { error?: string };
      if (res.ok) {
        setProfile(data);
      } else {
        setProfile(null);
      }
    } catch {
      setProfile(null);
    }
  }, [session?.access_token, API_URL]);

  const setAuthSession = (nextSession: AuthSession) => {
    if (!nextSession.access_token || !nextSession.refresh_token) {
      return;
    }
    const stored: StoredAuth = {
      accessToken: nextSession.access_token,
      refreshToken: nextSession.refresh_token,
      user: nextSession.user ?? null,
    };
    saveStoredAuth(stored);
    applyStored(stored);
  };

  useEffect(() => {
    if (session?.access_token) {
      void refreshProfile();
    } else {
      setProfile(null);
    }
  }, [session?.access_token, refreshProfile]);

  useEffect(() => {
    return registerAuthSessionHandlers({
      onRefreshed: (accessToken, refreshToken) => {
        setSession((prev) => ({
          ...prev,
          access_token: accessToken,
          refresh_token: refreshToken,
          user: prev?.user,
        }));
      },
      onExpired: () => {
        setSession(null);
        setUser(null);
        setProfile(null);
      },
    });
  }, []);

  useEffect(() => {
    try {
      const stored = loadStoredAuth();
      if (stored) applyStored(stored);
    } finally {
      setLoading(false);
    }
  }, [applyStored]);

  const signOut = async () => {
    try {
      const token = session?.access_token ?? loadStoredAuth()?.accessToken;
      if (token) {
        await fetch(`${API_URL}/auth/logout`, {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
      }
    } catch {
      // Ignore network/logout API failures and continue with local signout.
    } finally {
      clearStoredAuth();
      setSession(null);
      setUser(null);
      setProfile(null);
    }
  };

  return (
    <AuthContext.Provider
      value={{
        session,
        user,
        profile,
        displayName,
        loading,
        setAuthSession,
        refreshProfile,
        signOut,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

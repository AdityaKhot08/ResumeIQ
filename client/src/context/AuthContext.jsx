import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import * as authApi from '../api/auth.js';
import {
  clearCredentials,
  getStoredUser,
  getToken,
  setStoredUser,
  setToken,
} from '../api/client.js';

const AuthContext = createContext(null);

/**
 * Provides the authenticated user plus auth actions to the whole app.
 * On mount it validates any persisted token against /auth/me while `loading`
 * is true, so the UI can show a full-screen splash instead of flashing a
 * logged-out state.
 */
export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => getStoredUser());
  const [token, setTokenState] = useState(() => getToken());
  // Only show the splash when there is actually a persisted session to validate.
  const [loading, setLoading] = useState(() => Boolean(getToken()));

  useEffect(() => {
    let active = true;

    async function validate() {
      const storedToken = getToken();
      if (!storedToken) {
        if (active) setLoading(false);
        return;
      }

      try {
        const data = await authApi.me();
        if (!active) return;
        const nextUser = data.user || null;
        setUser(nextUser);
        setStoredUser(nextUser);
      } catch {
        if (!active) return;
        // Interceptor already removed credentials on 401; clean up state too.
        clearCredentials();
        setUser(null);
        setTokenState(null);
      } finally {
        if (active) setLoading(false);
      }
    }

    validate();
    return () => {
      active = false;
    };
  }, []);

  const persistSession = useCallback((data) => {
    const nextToken = data.token || null;
    const nextUser = data.user || null;
    setToken(nextToken);
    setStoredUser(nextUser);
    setTokenState(nextToken);
    setUser(nextUser);
  }, []);

  const login = useCallback(
    async (credentials) => {
      const data = await authApi.login(credentials);
      persistSession(data);
      return data;
    },
    [persistSession],
  );

  const register = useCallback(
    async (payload) => {
      const data = await authApi.register(payload);
      persistSession(data);
      return data;
    },
    [persistSession],
  );

  const logout = useCallback(() => {
    clearCredentials();
    setUser(null);
    setTokenState(null);
  }, []);

  const updateProfile = useCallback(async (payload) => {
    const data = await authApi.updateProfile(payload);
    const nextUser = data.user || null;
    setStoredUser(nextUser);
    setUser(nextUser);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      user,
      token,
      loading,
      isAuthenticated: Boolean(token && user),
      login,
      register,
      logout,
      updateProfile,
    }),
    [user, token, loading, login, register, logout, updateProfile],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

/** Access the auth context. Must be used inside <AuthProvider>. */
export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

export default AuthContext;

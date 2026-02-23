/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useCallback, useContext, useEffect, useMemo, useRef, useState } from 'react';
import api from '../api';

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [status, setStatus] = useState('checking');
  const [user, setUser] = useState(null);
  const inflightRef = useRef(null);

  const refreshMe = useCallback(async ({ force = false } = {}) => {
    if (!force && inflightRef.current) {
      return inflightRef.current;
    }

    const request = (async () => {
      try {
        const response = await api.get('/auth/me');
        setUser(response.data || null);
        setStatus('authenticated');
        return response.data;
      } catch {
        setUser(null);
        setStatus('unauthenticated');
        return null;
      } finally {
        inflightRef.current = null;
      }
    })();

    inflightRef.current = request;
    return request;
  }, []);

  const clearAuth = useCallback(() => {
    setUser(null);
    setStatus('unauthenticated');
  }, []);

  useEffect(() => {
    refreshMe();
  }, [refreshMe]);

  const value = useMemo(() => ({
    status,
    user,
    refreshMe,
    clearAuth,
  }), [status, user, refreshMe, clearAuth]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within AuthProvider');
  }
  return context;
}

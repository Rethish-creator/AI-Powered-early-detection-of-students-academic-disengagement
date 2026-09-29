import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { api, getStoredToken, getStoredUser, setStoredAuth, clearStoredAuth } from '../services/api.ts';

interface AuthContextType {
  user: User | null;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(getStoredUser());
  const [token, setToken] = useState<string | null>(getStoredToken());
  const [loading, setLoading] = useState<boolean>(true);

  useEffect(() => {
    async function verifySession() {
      const storedToken = getStoredToken();
      if (!storedToken) {
        setLoading(false);
        return;
      }
      try {
        const res = await api.getMe();
        setUser(res.user);
        setToken(storedToken);
      } catch (err) {
        clearStoredAuth();
        setUser(null);
        setToken(null);
      } finally {
        setLoading(false);
      }
    }
    verifySession();
  }, []);

  const login = async (email: string, pass: string) => {
    const res = await api.login(email, pass);
    setUser(res.user);
    setToken(res.token);
    setStoredAuth(res.token, res.user);
  };

  const quickDemoLogin = async (role: UserRole) => {
    let email = 'faculty@example.com';
    let pass = 'FacultyPass@2025';

    if (role === 'ADMIN') {
      email = 'admin@example.com';
      pass = 'AdminPass@2025';
    } else if (role === 'STUDENT') {
      email = 'student@example.com';
      pass = 'StudentPass@2025';
    }

    await login(email, pass);
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    clearStoredAuth();
    setUser(null);
    setToken(null);
  };

  return (
    <AuthContext.Provider value={{ user, token, loading, login, quickDemoLogin, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

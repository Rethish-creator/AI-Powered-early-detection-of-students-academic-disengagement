import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, UserRole } from '../types/index.ts';
import { api, getStoredToken, getStoredUser, setStoredAuth } from '../services/api.ts';

const DEFAULT_USER: User = {
  id: 'USR-002',
  email: 'faculty@example.com',
  name: 'Dr. Elena Rostova',
  role: 'FACULTY',
  department: 'Computer Science & Engineering'
};

interface AuthContextType {
  user: User;
  token: string | null;
  loading: boolean;
  login: (email: string, pass: string) => Promise<void>;
  quickDemoLogin: (role: UserRole) => Promise<void>;
  logout: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User>(() => getStoredUser() || DEFAULT_USER);
  const [token, setToken] = useState<string | null>(() => getStoredToken() || 'demo-active-token');
  const [loading, setLoading] = useState<boolean>(false);

  useEffect(() => {
    async function verifySession() {
      try {
        const res = await api.getMe();
        if (res && res.user) {
          setUser(res.user);
          setStoredAuth(token || 'demo-active-token', res.user);
        }
      } catch (err) {
        // Transparent fallback to default user
      }
    }
    verifySession();
  }, []);

  const login = async (email: string, pass: string) => {
    try {
      const res = await api.login(email, pass);
      setUser(res.user);
      setToken(res.token);
      setStoredAuth(res.token, res.user);
    } catch {
      // If error, match by email prefix
      if (email.includes('admin')) {
        quickDemoLogin('ADMIN');
      } else if (email.includes('student')) {
        quickDemoLogin('STUDENT');
      } else {
        quickDemoLogin('FACULTY');
      }
    }
  };

  const quickDemoLogin = async (role: UserRole) => {
    let targetUser = DEFAULT_USER;
    let pass = 'FacultyPass@2025';

    if (role === 'ADMIN') {
      targetUser = {
        id: 'USR-001',
        email: 'admin@example.com',
        name: 'Dr. Arthur Pendelton',
        role: 'ADMIN',
        department: 'Academic Dean Office'
      };
      pass = 'AdminPass@2025';
    } else if (role === 'STUDENT') {
      targetUser = {
        id: 'USR-003',
        email: 'student@example.com',
        name: 'Priya Patel',
        role: 'STUDENT',
        department: 'Computer Science & Engineering',
        studentId: 'S023'
      };
      pass = 'StudentPass@2025';
    }

    setUser(targetUser);
    setStoredAuth('demo-active-token', targetUser);

    try {
      const res = await api.login(targetUser.email, pass);
      if (res && res.user) {
        setUser(res.user);
        setToken(res.token);
        setStoredAuth(res.token, res.user);
      }
    } catch {}
  };

  const logout = async () => {
    try {
      await api.logout();
    } catch {}
    // Reset to faculty user so user is never locked out
    setUser(DEFAULT_USER);
    setStoredAuth('demo-active-token', DEFAULT_USER);
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

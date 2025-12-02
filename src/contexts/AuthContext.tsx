'use client';

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { User, AuthState } from '@/types';

interface AuthContextType extends AuthState {
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [state, setState] = useState<AuthState>({
    user: null,
    isAuthenticated: false,
    isLoading: true,
    isAdmin: false,
  });

  useEffect(() => {
    // 세션 복원
    try {
      const savedUser = localStorage.getItem('user');
      if (savedUser) {
        try {
          const user = JSON.parse(savedUser) as User;
          setState({
            user,
            isAuthenticated: true,
            isLoading: false,
            isAdmin: true, // 모든 사용자에게 관리자 권한 부여
          });
        } catch {
          localStorage.removeItem('user');
          setState(prev => ({ ...prev, isLoading: false }));
        }
      } else {
        setState(prev => ({ ...prev, isLoading: false }));
      }
    } catch {
      // localStorage 접근 불가 (시크릿 모드 등)
      setState(prev => ({ ...prev, isLoading: false }));
    }
  }, []);

  const login = async (email: string, password: string): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password }),
      });

      const data = await response.json();

      if (response.ok && data.user) {
        const user = data.user as User;
        try {
          localStorage.setItem('user', JSON.stringify(user));
        } catch {
          // localStorage 접근 불가
        }
        setState({
          user,
          isAuthenticated: true,
          isLoading: false,
          isAdmin: true, // 모든 사용자에게 관리자 권한 부여
        });
        return true;
      }
      return false;
    } catch (error) {
      console.error('Login error:', error);
      return false;
    }
  };

  const logout = () => {
    try {
      localStorage.removeItem('user');
    } catch {
      // localStorage 접근 불가
    }
    setState({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      isAdmin: false,
    });
  };

  return (
    <AuthContext.Provider value={{ ...state, login, logout }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}

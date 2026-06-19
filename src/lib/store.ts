'use client';

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { ModuleKey } from './types';

interface User {
  username: string;
  email: string;
  role: string;
  avatar: string;
}

interface AppState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => Promise<{ ok: boolean; error?: string }>;
  logout: () => void;

  activeModule: ModuleKey;
  setModule: (m: ModuleKey) => void;

  theme: 'dark' | 'light';
  toggleTheme: () => void;

  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      token: null,
      isAuthenticated: false,

      login: async (username, password) => {
        try {
          const res = await fetch('/api/auth', {
            method: 'POST',
            headers: { 'content-type': 'application/json' },
            body: JSON.stringify({ username, password }),
          });
          if (!res.ok) {
            const err = await res.json().catch(() => ({}));
            return { ok: false, error: err.error || 'Login failed' };
          }
          const data = await res.json();
          set({ user: data.user, token: data.token, isAuthenticated: true });
          return { ok: true };
        } catch (e: any) {
          return { ok: false, error: e.message };
        }
      },

      logout: () => set({ user: null, token: null, isAuthenticated: false, activeModule: 'dashboard' }),

      activeModule: 'dashboard',
      setModule: (m) => set({ activeModule: m }),

      theme: 'dark',
      toggleTheme: () => set((s) => ({ theme: s.theme === 'dark' ? 'light' : 'dark' })),

      sidebarCollapsed: false,
      toggleSidebar: () => set((s) => ({ sidebarCollapsed: !s.sidebarCollapsed })),
    }),
    {
      name: 'datacyber-store',
      partialize: (state) => ({
        user: state.user,
        token: state.token,
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

// Helper para llamadas autenticadas
export async function authFetch(url: string, options: RequestInit = {}) {
  const token = useAppStore.getState().token;
  const headers: Record<string, string> = {
    'content-type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };
  if (token) headers.authorization = `Bearer ${token}`;
  const res = await fetch(url, { ...options, headers });
  return res;
}

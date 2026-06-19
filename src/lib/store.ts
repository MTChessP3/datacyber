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

// Usuarios demo (en producción real: backend con bcrypt + JWT)
const DEMO_ACCOUNTS = {
  admin: {
    password: 'admin',
    user: { username: 'admin', email: 'admin@datacyber.io', role: 'Administrator', avatar: 'AD' },
  },
  analyst: {
    password: 'analyst',
    user: { username: 'analyst', email: 'analyst@datacyber.io', role: 'Threat Analyst', avatar: 'AN' },
  },
};

interface AppState {
  user: User | null;
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
    (set) => ({
      user: null,
      isAuthenticated: false,

      login: async (username, password) => {
        // Simular latencia de red
        await new Promise((r) => setTimeout(r, 400));
        const account = DEMO_ACCOUNTS[username.toLowerCase() as keyof typeof DEMO_ACCOUNTS];
        if (!account || account.password !== password) {
          return { ok: false, error: 'Invalid credentials' };
        }
        set({ user: account.user, isAuthenticated: true });
        return { ok: true };
      },

      logout: () => set({ user: null, isAuthenticated: false, activeModule: 'dashboard' }),

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
        isAuthenticated: state.isAuthenticated,
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

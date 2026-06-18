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
  // Auth
  user: User | null;
  isAuthenticated: boolean;
  login: (username: string, password: string) => boolean;
  logout: () => void;

  // Navigation (single-page app)
  activeModule: ModuleKey;
  setModule: (m: ModuleKey) => void;

  // Theme
  theme: 'dark' | 'light';
  toggleTheme: () => void;

  // Sidebar
  sidebarCollapsed: boolean;
  toggleSidebar: () => void;
}

const DEMO_USERS: Record<string, { password: string; user: User }> = {
  admin: {
    password: 'admin',
    user: {
      username: 'admin',
      email: 'admin@datacyber.io',
      role: 'Administrator',
      avatar: 'AD',
    },
  },
  analyst: {
    password: 'analyst',
    user: {
      username: 'analyst',
      email: 'analyst@datacyber.io',
      role: 'Threat Analyst',
      avatar: 'AN',
    },
  },
};

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      user: null,
      isAuthenticated: false,

      login: (username, password) => {
        const entry = DEMO_USERS[username.toLowerCase()];
        if (entry && entry.password === password) {
          set({ user: entry.user, isAuthenticated: true });
          return true;
        }
        return false;
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
      // Don't persist auth (security) — only navigation/theme preferences
      partialize: (state) => ({
        theme: state.theme,
        sidebarCollapsed: state.sidebarCollapsed,
      }),
    }
  )
);

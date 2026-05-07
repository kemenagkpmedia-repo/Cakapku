import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'SUPER ADMIN' | 'ADMIN' | 'OPERATOR' | 'USER' | 'PIMPINAN';

export interface User {
  id: number;
  nama?: string;
  name?: string;           // alias untuk nama (backward compat)
  email: string;
  role: Role;
  id_satker?: number;
  satker_id?: number;      // alias untuk id_satker (backward compat)
  nip?: string;
  jabatan?: string;
  gol_ruang?: string;
  pangkat?: string;
  golongan?: string;
  phone?: string;
  address?: string;
  assigned_roles?: Role[];
}

export interface UIConfig {
  active_role: Role;
  all_roles: Role[];
  menus: any[];
  allowed_roles: { label: string; value: string }[];
  dashboard_path: string;
}

interface AuthState {
  user: User | null;
  config: UIConfig | null;
  originalAdmin: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string, config: UIConfig) => void;
  loginAs: (user: User) => void;
  stopImpersonation: () => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
  updateConfig: (config: UIConfig) => void;
  isSwitching: boolean;
  setSwitching: (val: boolean) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      config: null,
      originalAdmin: null,
      token: null,
      isAuthenticated: false,
      login: (user, token, config) => set({ user, token, config, isAuthenticated: true, originalAdmin: null }),
      loginAs: (targetUser) => set((state) => ({
        originalAdmin: state.originalAdmin || state.user,
        user: targetUser
      })),
      stopImpersonation: () => set((state) => ({
        user: state.originalAdmin || state.user,
        originalAdmin: null
      })),
      logout: () => set({ user: null, config: null, originalAdmin: null, token: null, isAuthenticated: false }),
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
      updateConfig: (config) => set({ config }),
      isSwitching: false,
      setSwitching: (isSwitching) => set({ isSwitching }),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
      partialize: (state) => 
        Object.fromEntries(
          Object.entries(state).filter(([key]) => !['isSwitching'].includes(key))
        ) as AuthState,
    }
  )
);

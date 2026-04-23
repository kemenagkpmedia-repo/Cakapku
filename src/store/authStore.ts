import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export type Role = 'admin' | 'operator' | 'user' | 'pimpinan';

export interface User {
  id: number;
  name: string;
  email: string;
  role: Role;
  satker_id?: number;
  nip?: string;
  jabatan?: string;
  pangkat?: string;
  golongan?: string;
  phone?: string;
  address?: string;
}

interface AuthState {
  user: User | null;
  originalAdmin: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (user: User, token: string) => void;
  loginAs: (user: User) => void;
  stopImpersonation: () => void;
  logout: () => void;
  updateUser: (userData: Partial<User>) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      originalAdmin: null,
      token: null,
      isAuthenticated: false,
      login: (user, token) => set({ user, token, isAuthenticated: true, originalAdmin: null }),
      loginAs: (targetUser) => set((state) => ({
        originalAdmin: state.originalAdmin || state.user,
        user: targetUser
      })),
      stopImpersonation: () => set((state) => ({
        user: state.originalAdmin || state.user,
        originalAdmin: null
      })),
      logout: () => set({ user: null, originalAdmin: null, token: null, isAuthenticated: false }),
      updateUser: (userData) => set((state) => ({
        user: state.user ? { ...state.user, ...userData } : null
      })),
    }),
    {
      name: 'auth-storage', // name of the item in the storage (must be unique)
    }
  )
);

import { create } from 'zustand';
import { User, Role } from './authStore';
import api from '../api/axios';

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (user: Record<string, any>) => Promise<void>;
  addUsers: (users: Record<string, any>[]) => Promise<void>;
  updateUser: (id: number, userData: Record<string, any>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

export const useUserStore = create<UserState>()((set, get) => ({
  users: [],
  isLoading: false,
  error: null,

  fetchUsers: async () => {
    set({ isLoading: true, error: null });
    try {
      const response = await api.get('/users');
      // Handle both { data: [...] } and [...] response shapes
      const raw = response.data?.data || response.data || [];
      set({ users: Array.isArray(raw) ? raw : [], isLoading: false });
    } catch (error: any) {
      set({ error: error.message, isLoading: false });
    }
  },

  addUser: async (user) => {
    // Throws on error — caller must catch and show message
    const response = await api.post('/users', user);
    const created = response.data?.data || response.data;
    set((state) => ({ users: [...state.users, created] }));
  },

  addUsers: async (newUsers) => {
    try {
      await api.post('/users/batch', { users: newUsers });
      get().fetchUsers();
    } catch (error: any) {
      console.error('Failed to batch import users:', error);
    }
  },

  updateUser: async (id, userData) => {
    // Throws on error — caller must catch and show message
    const response = await api.put(`/users/${id}`, userData);
    const updated = response.data?.data || response.data;
    set((state) => ({
      users: state.users.map((u) => (u.id === id ? { ...u, ...updated } : u)),
    }));
  },

  deleteUser: async (id) => {
    try {
      await api.delete(`/users/${id}`);
      set((state) => ({ users: state.users.filter((u) => u.id !== id) }));
    } catch (error: any) {
      console.error('Failed to delete user:', error);
      throw error;
    }
  },
}));

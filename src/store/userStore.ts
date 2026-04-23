import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role } from './authStore';
import api from '../api/axios';

interface UserState {
  users: User[];
  isLoading: boolean;
  error: string | null;
  fetchUsers: () => Promise<void>;
  addUser: (user: Omit<User, 'id'>) => Promise<void>;
  addUsers: (users: Omit<User, 'id'>[]) => Promise<void>;
  updateUser: (id: number, userData: Partial<User>) => Promise<void>;
  deleteUser: (id: number) => Promise<void>;
}

export const useUserStore = create<UserState>()(
  persist(
    (set, get) => ({
      users: [],
      isLoading: false,
      error: null,

      fetchUsers: async () => {
        set({ isLoading: true, error: null });
        try {
          const response = await api.get('/users');
          set({ users: response.data, isLoading: false });
        } catch (error: any) {
          set({ error: error.message, isLoading: false });
        }
      },

      addUser: async (user) => {
        try {
          const response = await api.post('/users', user);
          set((state) => ({ users: [...state.users, response.data] }));
        } catch (error: any) {
          console.error('Failed to add user:', error);
        }
      },

      addUsers: async (newUsers) => {
        // Typically batch import might have its own endpoint, 
        // but for now we'll just refresh after adding or implement as requested
        try {
          await api.post('/users/batch', { users: newUsers });
          get().fetchUsers();
        } catch (error: any) {
          console.error('Failed to add users:', error);
        }
      },

      updateUser: async (id, userData) => {
        try {
          const response = await api.put(`/users/${id}`, userData);
          set((state) => ({
            users: state.users.map(u => u.id === id ? { ...u, ...response.data } : u)
          }));
        } catch (error: any) {
          console.error('Failed to update user:', error);
        }
      },

      deleteUser: async (id) => {
        try {
          await api.delete(`/users/${id}`);
          set((state) => ({
            users: state.users.filter(u => u.id !== id)
          }));
        } catch (error: any) {
          console.error('Failed to delete user:', error);
        }
      },
    }),
    {
      name: 'user-management-storage',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import { User, Role } from './authStore';

interface UserState {
  users: User[];
  addUser: (user: Omit<User, 'id'>) => void;
  addUsers: (users: Omit<User, 'id'>[]) => void;
  updateUser: (id: number, userData: Partial<User>) => void;
  deleteUser: (id: number) => void;
}

export const useUserStore = create<UserState>()(
  persist(
    (set) => ({
      users: [
        { id: 1, name: 'Admin', email: 'admin@example.com', role: 'admin' as Role, satker_id: 1 },
        { id: 2, name: 'Operator 1', email: 'operator@example.com', role: 'operator' as Role, satker_id: 1 },
        { id: 3, name: 'User 1', email: 'user@example.com', role: 'user' as Role, satker_id: 2 },
        { id: 4, name: 'Pimpinan 1', email: 'pimpinan@example.com', role: 'pimpinan' as Role, satker_id: 1 },
      ],
      addUser: (user) => set((state) => ({
        users: [...state.users, { ...user, id: Math.max(0, ...state.users.map(u => u.id)) + 1 }]
      })),
      addUsers: (newUsers) => set((state) => {
        let currentMaxId = Math.max(0, ...state.users.map(u => u.id));
        const usersWithIds = newUsers.map(u => ({
          ...u,
          id: ++currentMaxId
        }));
        return { users: [...state.users, ...usersWithIds] };
      }),
      updateUser: (id, userData) => set((state) => ({
        users: state.users.map(u => u.id === id ? { ...u, ...userData } : u)
      })),
      deleteUser: (id) => set((state) => ({
        users: state.users.filter(u => u.id !== id)
      })),
    }),
    {
      name: 'user-management-storage',
    }
  )
);

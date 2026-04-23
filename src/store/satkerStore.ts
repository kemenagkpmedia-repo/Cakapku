import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Satker {
  id: number;
  name: string;
}

interface SatkerState {
  satkers: Satker[];
  addSatker: (name: string) => void;
  updateSatker: (id: number, name: string) => void;
  deleteSatker: (id: number) => void;
}

export const useSatkerStore = create<SatkerState>()(
  persist(
    (set) => ({
      satkers: [
        { id: 1, name: 'Kemenag Kulon Progo' },
        { id: 2, name: 'KUA' },
        { id: 3, name: 'Madrasah' },
        { id: 4, name: 'Seksi Bimas Islam' },
        { id: 5, name: 'Seksi Pakis' },
        { id: 6, name: 'Seksi Dikmad' },
      ],
      addSatker: (name) => set((state) => ({
        satkers: [...state.satkers, { id: Math.max(0, ...state.satkers.map(s => s.id)) + 1, name }]
      })),
      updateSatker: (id, name) => set((state) => ({
        satkers: state.satkers.map(s => s.id === id ? { ...s, name } : s)
      })),
      deleteSatker: (id) => set((state) => ({
        satkers: state.satkers.filter(s => s.id !== id)
      })),
    }),
    {
      name: 'satker-storage',
    }
  )
);

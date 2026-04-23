import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface Satker {
  id: number;
  name: string;
  pimpinan_id?: number;
}

interface SatkerState {
  satkers: Satker[];
  addSatker: (name: string, pimpinan_id?: number) => void;
  updateSatker: (id: number, name: string, pimpinan_id?: number) => void;
  deleteSatker: (id: number) => void;
}

export const useSatkerStore = create<SatkerState>()(
  persist(
    (set) => ({
      satkers: [
        { id: 1, name: 'Kemenag Kulon Progo', pimpinan_id: 4 },
        { id: 2, name: 'KUA' },
        { id: 3, name: 'Madrasah' },
        { id: 4, name: 'Seksi Bimas Islam' },
        { id: 5, name: 'Seksi Pakis' },
        { id: 6, name: 'Seksi Dikmad' },
      ],
      addSatker: (name, pimpinan_id) => set((state) => ({
        satkers: [...state.satkers, { id: Math.max(0, ...state.satkers.map(s => s.id)) + 1, name, pimpinan_id }]
      })),
      updateSatker: (id, name, pimpinan_id) => set((state) => ({
        satkers: state.satkers.map(s => s.id === id ? { ...s, name, pimpinan_id } : s)
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

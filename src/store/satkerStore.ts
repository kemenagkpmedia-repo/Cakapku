import { create } from 'zustand';
import { satkerService } from '../api/services/satkerService';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface Satker {
  id: number;
  nama_satker: string;
  id_pimpinan?: number;
  // alias untuk kompatibilitas UI lama
  name?: string;
  pimpinan_id?: number;
}

interface SatkerState {
  satkers: Satker[];
  isLoading: boolean;
  error: string | null;

  fetchSatkers: () => Promise<void>;
  addSatker: (nama_satker: string, id_pimpinan?: number) => Promise<void>;
  updateSatker: (id: number, nama_satker: string, id_pimpinan?: number) => Promise<void>;
  deleteSatker: (id: number) => Promise<void>;
}

// ─── Helper ──────────────────────────────────────────────────────────────────

function mapSatker(s: any): Satker {
  return {
    ...s,
    name: s.nama_satker,
    pimpinan_id: s.id_pimpinan,
  };
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useSatkerStore = create<SatkerState>()((set) => ({
  satkers: [],
  isLoading: false,
  error: null,

  fetchSatkers: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await satkerService.getAll();
      const raw = res.data?.data || res.data || [];
      set({ satkers: raw.map(mapSatker), isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
    }
  },

  addSatker: async (nama_satker, id_pimpinan) => {
    const res = await satkerService.create({ nama_satker, id_pimpinan });
    const s = res.data?.data || res.data;
    set((state) => ({ satkers: [...state.satkers, mapSatker(s)] }));
  },

  updateSatker: async (id, nama_satker, id_pimpinan) => {
    const res = await satkerService.update(id, { nama_satker, id_pimpinan });
    const updated = res.data?.data || res.data;
    set((state) => ({
      satkers: state.satkers.map((s) => (s.id === id ? mapSatker({ ...s, ...updated }) : s)),
    }));
  },

  deleteSatker: async (id) => {
    await satkerService.delete(id);
    set((state) => ({ satkers: state.satkers.filter((s) => s.id !== id) }));
  },
}));

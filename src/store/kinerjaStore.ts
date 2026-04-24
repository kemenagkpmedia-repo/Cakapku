import { create } from 'zustand';
import { kinerjaService } from '../api/services/kinerjaService';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface PerformanceRecord {
  id: number;
  tanggal: string;
  id_iksk: number;
  uraian_pekerjaan: string;
  status_kehadiran: string;
  created_at?: string;

  // Relasi yang dikembalikan backend (eager load)
  iksk?: {
    id: number;
    indikator: string;
    target_vol?: string;
    target_satuan?: string;
    perkin?: {
      id: number;
      nama_perkin: string;
    };
  };
  user?: {
    id: number;
    nama: string;
    nip?: string;
  };

  // Alias untuk kompatibilitas UI lama
  iksk_id?: number;
  iksk_name?: string;
  perkin_id?: number;
  perkin_name?: string;
  userName?: string;
  userNip?: string;
  waktu?: string;
  satker_id?: number;
  volume?: number;
  satuan?: string;
}

interface KinerjaState {
  records: PerformanceRecord[];
  isLoading: boolean;
  error: string | null;
  editingId: number | null;

  fetchKinerja: () => Promise<void>;
  addRecord: (data: {
    tanggal: string;
    id_iksk: number;
    uraian_pekerjaan: string;
    status_kehadiran: string;
  }) => Promise<void>;
  updateRecord: (id: number, data: {
    uraian_pekerjaan?: string;
    status_kehadiran?: string;
  }) => Promise<void>;
  deleteRecord: (id: number) => Promise<void>;
  setEditingId: (id: number | null) => void;
}

// ─── Helper: map raw API response to UI-friendly shape ───────────────────────

function mapRecord(r: any): PerformanceRecord {
  return {
    ...r,
    // Backward-compat aliases
    iksk_id: r.id_iksk ?? r.iksk?.id,
    iksk_name: r.iksk?.indikator || '',
    perkin_id: r.iksk?.perkin?.id,
    perkin_name: r.iksk?.perkin?.nama_perkin || '',
    userName: r.user?.nama || '',
    userNip: r.user?.nip,
    waktu: r.created_at
      ? new Date(r.created_at).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' })
      : '',
    volume: r.iksk?.target_vol ? Number(r.iksk.target_vol) : 0,
    satuan: r.iksk?.target_satuan || '',
  };
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const useKinerjaStore = create<KinerjaState>()((set) => ({
  records: [],
  isLoading: false,
  error: null,
  editingId: null,

  fetchKinerja: async () => {
    set({ isLoading: true, error: null });
    try {
      const res = await kinerjaService.getAll();
      const raw = res.data?.data || res.data || [];
      set({ records: raw.map(mapRecord), isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
    }
  },

  addRecord: async (data) => {
    const res = await kinerjaService.create(data);
    const created = res.data?.data || res.data;
    set((state) => ({ records: [mapRecord(created), ...state.records] }));
  },

  updateRecord: async (id, data) => {
    const res = await kinerjaService.update(id, data);
    const updated = res.data?.data || res.data;
    set((state) => ({
      records: state.records.map((r) => (r.id === id ? mapRecord({ ...r, ...updated }) : r)),
    }));
  },

  deleteRecord: async (id) => {
    await kinerjaService.delete(id);
    set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
  },

  setEditingId: (id) => set({ editingId: id }),
}));

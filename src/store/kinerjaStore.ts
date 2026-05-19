import { create } from 'zustand';
import { kinerjaService, PerformanceRecordResponse, SubordinateUserResponse } from '../api/services/kinerjaService';

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
  bawahanUsers: any[];
  isLoading: boolean;
  error: string | null;
  editingId: number | null;

  fetchKinerja: (month?: string, year?: string) => Promise<void>;
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
  fetchBawahanKinerja: (month?: string, year?: string) => Promise<void>;
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
  bawahanUsers: [],
  isLoading: false,
  error: null,
  editingId: null,

  fetchKinerja: async (month, year) => {
    set({ isLoading: true, error: null });
    try {
      const res = await kinerjaService.getAll(month, year);
      const raw = (res.data as any)?.data || res.data || [];
      set({ records: raw.map(mapRecord), isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
    }
  },

  addRecord: async (data) => {
    const res = await kinerjaService.create(data);
    const created = (res.data as any)?.data || res.data;
    set((state) => ({ records: [mapRecord(created), ...state.records] }));
  },

  updateRecord: async (id, data) => {
    const res = await kinerjaService.update(id, data);
    const updated = (res.data as any)?.data || res.data;
    set((state) => ({
      records: state.records.map((r) => (r.id === id ? mapRecord({ ...r, ...updated }) : r)),
    }));
  },

  deleteRecord: async (id) => {
    await kinerjaService.delete(id);
    set((state) => ({ records: state.records.filter((r) => r.id !== id) }));
  },

  setEditingId: (id) => set({ editingId: id }),

  fetchBawahanKinerja: async (month, year) => {
    set({ isLoading: true, error: null });
    try {
      const res = await kinerjaService.getBawahanKinerja(month, year);
      const raw = (res.data as any)?.data || res.data || [];
      // raw is a list of users, each has kinerja_harians
      const usersWithMappedRecords = raw.map((u: any) => ({
        ...u,
        totalReports: u.kinerja_harians?.length || 0,
        records: (u.kinerja_harians || []).map(mapRecord).sort((a: any, b: any) => 
          new Date(b.tanggal).getTime() - new Date(a.tanggal).getTime()
        )
      }));
      set({ bawahanUsers: usersWithMappedRecords, isLoading: false });
    } catch (err: any) {
      set({ error: err.response?.data?.message || err.message, isLoading: false });
    }
  },
}));

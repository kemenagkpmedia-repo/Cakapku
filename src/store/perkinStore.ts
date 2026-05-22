import { create } from 'zustand';
import { periodeService } from '../api/services/periodeService';
import { perkinService } from '../api/services/perkinService';
import { ikskService } from '../api/services/ikskService';
import { sasaranKegiatanService } from '../api/services/sasaranKegiatanService';

// ─── Types ───────────────────────────────────────────────────────────────────

export interface IKSK {
  id: number;
  id_sasaran_kegiatan: number;
  indikator: string;
  target_vol?: string;
  target_satuan?: string;
  // alias untuk kompatibilitas UI lama
  name?: string;
}

export interface SasaranKegiatan {
  id: number;
  id_perkin: number;
  nama_sasaran: string;
  iksks?: IKSK[];
}

export interface Period {
  id: number;
  tahun: string;
  status: boolean;
  // alias untuk kompatibilitas UI lama
  name?: string;
  isActive?: boolean;
  createdAt?: string;
}

export interface Perkin {
  id: number;
  nama_perkin: string;
  no_sk?: string;
  id_periode: number;
  status?: boolean;
  sasaran_kegiatans?: SasaranKegiatan[];
  iksks?: IKSK[];
  satker_ids?: number[];
  // alias untuk kompatibilitas UI lama
  name?: string;
  period_id?: string | number;
  iksk?: IKSK[];
}

// ─── State ───────────────────────────────────────────────────────────────────

interface PerkinState {
  // Periode
  periods: Period[];
  isLoadingPeriodes: boolean;
  errorPeriodes: string | null;
  fetchPeriodes: () => Promise<void>;
  addPeriode: (tahun: string, status?: boolean) => Promise<void>;
  updatePeriode: (id: number, data: { tahun?: string; status?: boolean }) => Promise<void>;
  deletePeriode: (id: number) => Promise<void>;

  // Perkin
  perkins: Perkin[];
  isLoadingPerkins: boolean;
  errorPerkins: string | null;
  fetchPerkins: () => Promise<void>;
  addPerkin: (data: { nama_perkin: string; no_sk?: string; id_periode: number; status?: boolean }) => Promise<void>;
  updatePerkin: (id: number, data: { nama_perkin?: string; no_sk?: string; status?: boolean }) => Promise<void>;
  deletePerkin: (id: number) => Promise<void>;
  assignSatker: (perkinId: number, satkerIds: number[]) => Promise<void>;
  importPerkin: (file: File, id_periode: number, nama_perkin: string) => Promise<void>;

  // Sasaran Kegiatan (SK)
  sasaranKegiatans: SasaranKegiatan[];
  isLoadingSK: boolean;
  errorSK: string | null;
  fetchSasaranKegiatans: () => Promise<void>;
  addSasaranKegiatan: (data: { id_perkin: number; nama_sasaran: string }) => Promise<void>;
  updateSasaranKegiatan: (id: number, data: { nama_sasaran: string }) => Promise<void>;
  deleteSasaranKegiatan: (id: number) => Promise<void>;

  clearPerkins: () => void;

  // IKSK
  iksks: IKSK[];
  isLoadingIksks: boolean;
  errorIksks: string | null;
  fetchIksks: () => Promise<void>;
  addIksk: (data: { id_sasaran_kegiatan: number; indikator: string; target_vol?: string; target_satuan?: string }) => Promise<void>;
  updateIksk: (id: number, data: { indikator?: string; target_vol?: string; target_satuan?: string }) => Promise<void>;
  deleteIksk: (id: number) => Promise<void>;

  // Active period helper
  activePeriodId: number | null;
  setActivePeriodId: (id: number | null) => void;

  // Backward-compat helpers
  getFilteredPerkins: () => Perkin[];
}

// ─── Store ───────────────────────────────────────────────────────────────────

export const usePerkinStore = create<PerkinState>()((set, get) => ({
  // ── Periode ──────────────────────────────────────────────────────────────
  periods: [],
  isLoadingPeriodes: false,
  errorPeriodes: null,

  fetchPeriodes: async () => {
    set({ isLoadingPeriodes: true, errorPeriodes: null });
    try {
      const res = await periodeService.getAll();
      const data: Period[] = (res.data?.data || res.data || []).map((p: any) => ({
        ...p,
        name: p.tahun,
        isActive: Boolean(p.status),
        createdAt: p.created_at || new Date().toISOString(),
      }));
      set({ periods: data, isLoadingPeriodes: false });
    } catch (err: any) {
      set({ errorPeriodes: err.response?.data?.message || err.message, isLoadingPeriodes: false });
    }
  },

  addPeriode: async (tahun, status = true) => {
    const res = await periodeService.create({ tahun, status });
    const p = res.data?.data || res.data;
    set((state) => ({
      periods: [...state.periods, { ...p, name: p.tahun, isActive: Boolean(p.status), createdAt: p.created_at || new Date().toISOString() }],
    }));
  },

  updatePeriode: async (id, data) => {
    const res = await periodeService.update(id, data);
    const updated = res.data?.data || res.data;
    set((state) => ({
      periods: state.periods.map((p) =>
        p.id === id ? { ...p, ...updated, name: updated.tahun, isActive: Boolean(updated.status) } : p
      ),
    }));
  },

  deletePeriode: async (id) => {
    await periodeService.delete(id);
    set((state) => ({ periods: state.periods.filter((p) => p.id !== id) }));
  },

  // ── Perkin ───────────────────────────────────────────────────────────────
  perkins: [],
  isLoadingPerkins: false,
  errorPerkins: null,

  fetchPerkins: async () => {
    set({ isLoadingPerkins: true, errorPerkins: null });
    try {
      const res = await perkinService.getAll();
      const data: Perkin[] = (res.data?.data || res.data || []).map((p: any) => ({
        ...p,
        name: p.nama_perkin,
        period_id: p.id_periode,
        // Flatten iksks for backward compatibility if needed
        iksk: (p.iksks || []).map((i: any) => ({ ...i, name: i.indikator })),
        satker_ids: (p.satkers || []).map((s: any) => s.id),
        // Grouped view
        sasaran_kegiatans: (p.sasaran_kegiatans || []).map((sk: any) => ({
          ...sk,
          iksks: (sk.iksks || []).map((i: any) => ({ ...i, name: i.indikator }))
        }))
      }));
      set({ perkins: data, isLoadingPerkins: false });
    } catch (err: any) {
      set({ errorPerkins: err.response?.data?.message || err.message, isLoadingPerkins: false });
    }
  },

  addPerkin: async (data) => {
    const res = await perkinService.create(data);
    const p = res.data?.data || res.data;
    set((state) => ({
      perkins: [...state.perkins, { ...p, name: p.nama_perkin, period_id: p.id_periode, iksk: [] }],
    }));
  },

  updatePerkin: async (id, data) => {
    const res = await perkinService.update(id, data);
    const updated = res.data?.data || res.data;
    set((state) => ({
      perkins: state.perkins.map((p) =>
        p.id === id ? { ...p, ...updated, name: updated.nama_perkin } : p
      ),
    }));
  },

  deletePerkin: async (id) => {
    await perkinService.delete(id);
    set((state) => ({ perkins: state.perkins.filter((p) => p.id !== id) }));
  },

  assignSatker: async (perkinId, satkerIds) => {
    await perkinService.assignSatker(perkinId, satkerIds);
    set((state) => ({
      perkins: state.perkins.map((p) => (p.id === perkinId ? { ...p, satker_ids: satkerIds } : p)),
    }));
  },

  importPerkin: async (file, id_periode, nama_perkin) => {
    await perkinService.importExcel(file, id_periode, nama_perkin);
    // Setelah import, refresh data dari server
    await get().fetchPerkins();
  },

  clearPerkins: () => set({ perkins: [] }),

  // ── Sasaran Kegiatan (SK) ────────────────────────────────────────────────
  sasaranKegiatans: [],
  isLoadingSK: false,
  errorSK: null,

  fetchSasaranKegiatans: async () => {
    set({ isLoadingSK: true, errorSK: null });
    try {
      const res = await sasaranKegiatanService.getAll();
      const data = res.data?.data || res.data || [];
      set({ sasaranKegiatans: data, isLoadingSK: false });
    } catch (err: any) {
      set({ errorSK: err.response?.data?.message || err.message, isLoadingSK: false });
    }
  },

  addSasaranKegiatan: async (data) => {
    await sasaranKegiatanService.create(data);
    await get().fetchSasaranKegiatans();
    await get().fetchPerkins(); // Refresh perkins to show new SK
  },

  updateSasaranKegiatan: async (id, data) => {
    await sasaranKegiatanService.update(id, data);
    await get().fetchSasaranKegiatans();
    await get().fetchPerkins();
  },

  deleteSasaranKegiatan: async (id) => {
    await sasaranKegiatanService.delete(id);
    await get().fetchSasaranKegiatans();
    await get().fetchPerkins();
  },

  // ── IKSK ────────────────────────────────────────────────────────────────
  iksks: [],
  isLoadingIksks: false,
  errorIksks: null,

  fetchIksks: async () => {
    set({ isLoadingIksks: true, errorIksks: null });
    try {
      const res = await ikskService.getAll();
      const data: IKSK[] = (res.data?.data || res.data || []).map((i: any) => ({
        ...i,
        name: i.indikator,
      }));
      set({ iksks: data, isLoadingIksks: false });
    } catch (err: any) {
      set({ errorIksks: err.response?.data?.message || err.message, isLoadingIksks: false });
    }
  },

  addIksk: async (data: { id_sasaran_kegiatan: number; indikator: string; target_vol?: string; target_satuan?: string }) => {
    const res = await ikskService.create(data as any);
    const i = res.data?.data || res.data;
    set((state) => ({
      iksks: [...state.iksks, { ...i, name: i.indikator }],
    }));
    await get().fetchPerkins();
  },

  updateIksk: async (id, data) => {
    const res = await ikskService.update(id, data);
    const updated = res.data?.data || res.data;
    set((state) => ({
      iksks: state.iksks.map((i) => (i.id === id ? { ...i, ...updated, name: updated.indikator } : i)),
    }));
    await get().fetchPerkins();
  },

  deleteIksk: async (id) => {
    await ikskService.delete(id);
    set((state) => ({
      iksks: state.iksks.filter((i) => i.id !== id),
    }));
    await get().fetchPerkins();
  },

  // ── Helpers ───────────────────────────────────────────────────────────────
  activePeriodId: null,
  setActivePeriodId: (id) => set({ activePeriodId: id }),

  getFilteredPerkins: () => {
    const { perkins, periods } = get();
    if (!Array.isArray(perkins) || !Array.isArray(periods)) return [];
    const activePeriodIds = periods.filter((p) => p.isActive || p.status).map((p) => p.id);
    return perkins.filter((p) => {
      const pId = p.id_periode ?? (p.period_id as number);
      return activePeriodIds.includes(Number(pId));
    });
  },
}));

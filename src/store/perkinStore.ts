import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface IKSK {
  id: string | number;
  name: string;
  target_vol: string | number;
  target_satuan: string;
}

export interface Period {
  id: string;
  name: string;
  isActive: boolean;
  createdAt: string;
}

export interface Perkin {
  id: string | number;
  name: string;
  iksk: IKSK[];
  period_id: string;
  satker_ids?: number[]; // IDs of satkers that can access this perkin
}

interface PerkinState {
  periods: Period[];
  perkins: Perkin[];
  activePeriodId: string | null;
  setPeriods: (periods: Period[]) => void;
  addPeriod: (period: Period) => void;
  togglePeriodStatus: (id: string) => void;
  deletePeriod: (id: string) => void;
  setActivePeriodId: (id: string | null) => void;
  setPerkins: (perkins: Perkin[]) => void;
  addPerkin: (perkin: Perkin) => void;
  clearPerkins: () => void;
  getFilteredPerkins: () => Perkin[];
}

export const usePerkinStore = create<PerkinState>()(
  persist(
    (set, get) => ({
      periods: [
        { id: 'p1', name: 'Periode Semester 1 - 2026', isActive: true, createdAt: new Date().toISOString() }
      ],
      perkins: [
        {
          id: '1',
          name: 'Meningkatnya jaminan beragama, toleransi, dan cinta kemanusiaan umat beragama (SK.1)',
          iksk: [
            { id: '1', name: '25.w - Persentase layanan keagamaan dan pendidikan berbasis IT', target_vol: 91, target_satuan: '%' },
            { id: '2', name: 'Persentase KUA yang menyelenggarakan EWS (IKSK.1)', target_vol: 50, target_satuan: '%' }
          ],
          period_id: 'p1',
          satker_ids: [1, 2, 3, 4, 5]
        }
      ],
      activePeriodId: 'p1',
      setPeriods: (periods) => set({ periods }),
      addPeriod: (period) => set((state) => ({ periods: [...state.periods, period] })),
      togglePeriodStatus: (id) => set((state) => ({
        periods: state.periods.map(p => p.id === id ? { ...p, isActive: !p.isActive } : p)
      })),
      deletePeriod: (id) => set((state) => ({
        periods: state.periods.filter(p => p.id !== id),
        perkins: state.perkins.filter(perkin => perkin.period_id !== id),
        activePeriodId: state.activePeriodId === id ? null : state.activePeriodId
      })),
      setActivePeriodId: (id) => set({ activePeriodId: id }),
      setPerkins: (perkins) => set({ perkins }),
      addPerkin: (perkin) => set((state) => ({ perkins: [...state.perkins, perkin] })),
      clearPerkins: () => set({ perkins: [] }),
      getFilteredPerkins: () => {
        const state = get();
        const activePeriods = state.periods.filter(p => p.isActive).map(p => p.id);
        return state.perkins.filter(perkin => activePeriods.includes(perkin.period_id));
      }
    }),
    {
      name: 'perkin-storage',
    }
  )
);

import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface PerformanceRecord {
  id: string;
  tanggal: string;
  perkin_id: string;
  perkin_name: string;
  iksk_id: string;
  iksk_name: string;
  uraian_pekerjaan: string;
  status_kehadiran: string;
  waktu: string;
  volume: number;
  satuan: string;
  userName: string;
  userNip?: string;
  satker_id?: number;
}

interface KinerjaState {
  records: PerformanceRecord[];
  editingId: string | null;
  addRecord: (record: Omit<PerformanceRecord, 'id' | 'waktu'>) => void;
  updateRecord: (id: string, record: Partial<PerformanceRecord>) => void;
  deleteRecord: (id: string) => void;
  setEditingId: (id: string | null) => void;
}

export const useKinerjaStore = create<KinerjaState>()(
  persist(
    (set) => ({
      records: [
        {
          id: '1',
          tanggal: new Date().toISOString().split('T')[0],
          perkin_id: '1',
          perkin_name: 'Layanan Perkantoran Digital',
          iksk_id: '1',
          iksk_name: '25.w - Persentase layanan keagamaan dan pendidikan berbasis IT',
          uraian_pekerjaan: 'Melakukan pengecekan rutin pada log firewall dan memastikan intrusi dicegah sejak dini sesuai SOP 04',
          status_kehadiran: 'Hadir di Kantor',
          waktu: '10:45 AM',
          volume: 75,
          satuan: '%',
          userName: 'Rina Amelia',
          userNip: '198203012010012001',
          satker_id: 1
        },
        {
          id: '2',
          tanggal: new Date().toISOString().split('T')[0],
          perkin_id: '2',
          perkin_name: 'Pemeliharaan Infrastruktur TI',
          iksk_id: '2',
          iksk_name: '26.x - Tingkat ketersediaan infrastruktur jaringan',
          uraian_pekerjaan: 'Update security patches pada server database utama dan verifikasi kestabilan sistem',
          status_kehadiran: 'Work From Home / Work From Anywhere',
          waktu: '02:30 PM',
          volume: 100,
          satuan: '%',
          userName: 'Budi Santoso',
          userNip: '199001012020011001',
          satker_id: 1
        },
        {
          id: '3',
          tanggal: new Date().toISOString().split('T')[0],
          perkin_id: '1',
          perkin_name: 'Meningkatnya jaminan beragama, toleransi, dan cinta kemanusiaan umat beragama (SK.1)',
          iksk_id: '1',
          iksk_name: '25.w - Persentase layanan keagamaan dan pendidikan berbasis IT',
          uraian_pekerjaan: 'Mengecek Progress Penghapusan Tanah KUA Kokap, Mencicil Materi Matahatiku',
          status_kehadiran: 'Hadir di Kantor',
          waktu: '08:00 AM',
          volume: 75,
          satuan: '%',
          userName: 'Siti Aminah',
          userNip: '199505052021052002',
          satker_id: 1
        },
        {
          id: '4',
          tanggal: new Date().toISOString().split('T')[0],
          perkin_id: '3',
          perkin_name: 'Peningkatan Kualitas SDM',
          iksk_id: '3',
          iksk_name: '27.y - Persentase pegawai yang mengikuti pengembangan kompetensi',
          uraian_pekerjaan: 'Mengikuti Bimtek Peningkatan Kapasitas SDM Kemenag',
          status_kehadiran: 'Dinas Luar',
          waktu: '09:00 AM',
          volume: 1,
          satuan: 'Sertifikat',
          userName: 'Dian Wijaya',
          userNip: '198812122015031002',
          satker_id: 2
        }
      ],
      editingId: null,
      addRecord: (record) => set((state) => ({
        records: [
          {
            ...record,
            id: Math.random().toString(36).substr(2, 9),
            waktu: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
          },
          ...state.records
        ]
      })),
      updateRecord: (id, updatedFields) => set((state) => ({
        records: state.records.map((r) => r.id === id ? { ...r, ...updatedFields } : r)
      })),
      deleteRecord: (id) => set((state) => ({
        records: state.records.filter((r) => r.id !== id)
      })),
      setEditingId: (id) => set({ editingId: id }),
    }),
    {
      name: 'kinerja-storage',
    }
  )
);

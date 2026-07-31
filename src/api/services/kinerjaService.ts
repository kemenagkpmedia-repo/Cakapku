import api from '../axios';

export interface KinerjaPayload {
  tanggal: string;
  id_iksk: number;
  uraian_pekerjaan: string;
  status_kehadiran: string;
}

export interface PerformanceRecordResponse {
  id: number;
  tanggal: string;
  id_user: number;
  id_iksk: number;
  uraian_pekerjaan: string;
  status_kehadiran: string;
  created_at: string;
  updated_at: string;
  iksk?: {
    id: number;
    indikator: string;
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
}

export interface SubordinateUserResponse {
  id: number;
  nama: string;
  nip?: string;
  jabatan?: string;
  id_satker: number;
  kinerja_harians: PerformanceRecordResponse[];
}

export const kinerjaService = {
  getAll: (month?: string, year?: string) => 
    api.get<PerformanceRecordResponse[]>('/kinerja-harian', { params: { month, year } }),
  
  create: (data: KinerjaPayload) => api.post<PerformanceRecordResponse>('/kinerja-harian', data),
  
  update: (id: number, data: Partial<Pick<KinerjaPayload, 'uraian_pekerjaan' | 'status_kehadiran'>>) =>
    api.put<PerformanceRecordResponse>(`/kinerja-harian/${id}`, data),
    
  delete: (id: number) => api.delete(`/kinerja-harian/${id}`),
  
  // Method ini sekarang mengembalikan daftar User (Bawahan) beserta kinerjanya
  getBawahanKinerja: (month?: string, year?: string, userId?: number) => 
    api.get<SubordinateUserResponse[]>('/kinerja-harian/bawahan', { params: { month, year, user_id: userId } }),
};

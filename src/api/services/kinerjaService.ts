import api from '../axios';

export interface KinerjaPayload {
  tanggal: string;
  id_iksk: number;
  uraian_pekerjaan: string;
  status_kehadiran: string;
}

export const kinerjaService = {
  getAll: () => api.get('/kinerja-harian'),
  create: (data: KinerjaPayload) => api.post('/kinerja-harian', data),
  update: (id: number, data: Partial<Pick<KinerjaPayload, 'uraian_pekerjaan' | 'status_kehadiran'>>) =>
    api.put(`/kinerja-harian/${id}`, data),
  delete: (id: number) => api.delete(`/kinerja-harian/${id}`),
};

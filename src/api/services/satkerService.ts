import api from '../axios';

export interface SatkerPayload {
  nama_satker: string;
  id_pimpinan?: number;
}

export const satkerService = {
  getAll: () => api.get('/satkers'),
  create: (data: SatkerPayload) => api.post('/satkers', data),
  update: (id: number, data: Partial<SatkerPayload>) => api.put(`/satkers/${id}`, data),
  delete: (id: number) => api.delete(`/satkers/${id}`),
};

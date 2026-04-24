import api from '../axios';

export interface PeriodePayload {
  tahun: string;
  status: boolean;
}

export const periodeService = {
  getAll: () => api.get('/periodes'),
  getOne: (id: number) => api.get(`/periodes/${id}`),
  create: (data: PeriodePayload) => api.post('/periodes', data),
  update: (id: number, data: Partial<PeriodePayload>) => api.put(`/periodes/${id}`, data),
  delete: (id: number) => api.delete(`/periodes/${id}`),
};

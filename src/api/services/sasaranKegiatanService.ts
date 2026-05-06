import api from '../axios';

export const sasaranKegiatanService = {
  getAll: () => api.get('/sasaran-kegiatans'),
  getById: (id: number) => api.get(`/sasaran-kegiatans/${id}`),
  create: (data: { id_perkin: number; nama_sasaran: string }) => api.post('/sasaran-kegiatans', data),
  update: (id: number, data: { nama_sasaran?: string }) => api.put(`/sasaran-kegiatans/${id}`, data),
  delete: (id: number) => api.delete(`/sasaran-kegiatans/${id}`),
};

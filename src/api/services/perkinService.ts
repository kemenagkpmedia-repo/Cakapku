import api from '../axios';

export interface PerkinPayload {
  nama_perkin: string;
  no_sk?: string;
  id_periode: number;
  status?: boolean;
}

export const perkinService = {
  getAll: () => api.get('/perkins'),
  create: (data: PerkinPayload) => api.post('/perkins', data),
  update: (id: number, data: Partial<Omit<PerkinPayload, 'id_periode'>>) => api.put(`/perkins/${id}`, data),
  delete: (id: number) => api.delete(`/perkins/${id}`),
  assignSatker: (id: number, id_satkers: number[]) =>
    api.post(`/perkins/${id}/assign-satker`, { id_satkers }),
  importExcel: (file: File, id_periode: number) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('id_periode', String(id_periode));
    return api.post('/perkins/import', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

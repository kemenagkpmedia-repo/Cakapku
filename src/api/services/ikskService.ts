import api from '../axios';

export interface IkskPayload {
  id_perkin: number;
  indikator: string;
  target_vol?: string;
  target_satuan?: string;
}

export const ikskService = {
  getAll: () => api.get('/iksks'),
  create: (data: IkskPayload) => api.post('/iksks', data),
  update: (id: number, data: Partial<Omit<IkskPayload, 'id_perkin'>>) => api.put(`/iksks/${id}`, data),
  delete: (id: number) => api.delete(`/iksks/${id}`),
};

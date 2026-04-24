import api from '../axios';

export const dashboardService = {
  getBawahan: () => api.get('/dashboard/bawahan'),
};

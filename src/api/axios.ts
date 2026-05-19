import axios from 'axios';
import { useAuthStore } from '../store/authStore';

const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL || 'http://172.169.3.114:3001/api',
  headers: {
    'Content-Type': 'application/json',
    'Accept': 'application/json',
  },
});

// Request Interceptor
api.interceptors.request.use(
  (config) => {
    const token = useAuthStore.getState().token;
    const configData = useAuthStore.getState().config;
    let activeRole = configData?.active_role;

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    // Fallback: Jika store belum ter-hidrasi (misal saat baru reload), ambil langsung dari localStorage
    if (!activeRole) {
      try {
        const storage = localStorage.getItem('auth-storage');
        if (storage) {
          const parsed = JSON.parse(storage);
          activeRole = parsed.state?.config?.active_role;
        }
      } catch (e) { }
    }

    if (activeRole) {
      config.headers['X-Active-Role'] = activeRole;
    }

    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response Interceptor
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response && error.response.status === 401) {
      // Handle unauthorized (e.g., token expired)
      useAuthStore.getState().logout();
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default api;

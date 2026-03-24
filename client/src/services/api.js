import axios from 'axios';
import toast from 'react-hot-toast';

const api = axios.create({
  baseURL: '/api'
});

api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (!error.response) {
      toast.error('Unable to connect to database or server is offline.', { duration: 6000 });
      return Promise.reject(error);
    }
    
    const status = error.response.status;
    const msg = error.response.data?.message;

    if (status === 401 && !error.config.url.includes('/login')) {
      // Clear stale token and force login natively to prevent silent failures
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    } else if (status !== 401) {
       if (msg) toast.error(msg);
    }

    return Promise.reject(error);
  }
);

export default api;

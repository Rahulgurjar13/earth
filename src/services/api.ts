import axios from 'axios';

const PROD_API = 'https://darukaa-earth-api.onrender.com/api';
const DEV_API = 'http://localhost:8000/api';

const baseURL =
  (import.meta.env.VITE_API_BASE_URL as string | undefined) ??
  (window.location.hostname === 'localhost' ? DEV_API : PROD_API);

const api = axios.create({
  baseURL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(config => {
  const token = localStorage.getItem('darukaa_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

api.interceptors.response.use(
  res => res,
  err => {
    if (err.response?.status === 401) {
      localStorage.removeItem('darukaa_token');
      localStorage.removeItem('darukaa_user');
      window.location.href = '/login';
    }
    return Promise.reject(err);
  },
);

export default api;

import { create } from 'zustand';
import api from '../services/api';

interface User {
  id: string;
  name: string;
  email: string;
  role: string;
  avatar?: string;
}

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  register: (name: string, email: string, password: string) => Promise<boolean>;
  logout: () => void;
  checkAuth: () => void;
}

export const useAuthStore = create<AuthState>(set => ({
  user: null,
  token: localStorage.getItem('darukaa_token'),
  isAuthenticated: !!localStorage.getItem('darukaa_token'),

  login: async (email: string, password: string) => {
    try {
      const formData = new URLSearchParams();
      formData.append('username', email);
      formData.append('password', password);

      const response = await api.post('/auth/login', formData, {
        headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
      });

      const { access_token, user } = response.data;
      localStorage.setItem('darukaa_token', access_token);
      localStorage.setItem('darukaa_user', JSON.stringify(user));
      set({ user, token: access_token, isAuthenticated: true });
      return true;
    } catch (error) {
      console.error('Login failed', error);
      return false;
    }
  },

  register: async (name: string, email: string, password: string) => {
    try {
      await api.post('/auth/register', { name, email, password });
      return await useAuthStore.getState().login(email, password);
    } catch (error) {
      console.error('Registration failed', error);
      return false;
    }
  },

  logout: () => {
    localStorage.removeItem('darukaa_token');
    localStorage.removeItem('darukaa_user');
    set({ user: null, token: null, isAuthenticated: false });
  },

  checkAuth: () => {
    const token = localStorage.getItem('darukaa_token');
    const userStr = localStorage.getItem('darukaa_user');
    if (token && userStr) {
      set({ user: JSON.parse(userStr), token, isAuthenticated: true });
    } else {
      set({ user: null, token: null, isAuthenticated: false });
    }
  },
}));

import { defineStore } from 'pinia';
import { authAPI } from '../services/api';
import { useToast } from 'vue-toastification';

export const useAuthStore = defineStore('auth', {
  state: () => ({
    user: JSON.parse(localStorage.getItem('user')) || null,
    token: localStorage.getItem('token') || null,
    isAuthenticated: !!localStorage.getItem('token'),
    loading: false,
  }),

  getters: {
    isLoggedIn: (state) => state.isAuthenticated,
    currentUser: (state) => state.user,
  },

  actions: {
    async register(userData) {
      const toast = useToast();
      this.loading = true;
      try {
        const response = await authAPI.register(userData);
        const { user, token } = response.data;
        
        this.setAuthData(user, token);
        toast.success('Registration successful!');
        return { success: true };
      } catch (error) {
        const message = error.response?.data?.message || 'Registration failed';
        toast.error(message);
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    async login(credentials) {
      const toast = useToast();
      this.loading = true;
      try {
        const response = await authAPI.login(credentials);
        const { user, token } = response.data;
        
        this.setAuthData(user, token);
        toast.success('Login successful!');
        return { success: true };
      } catch (error) {
        const message = error.response?.data?.message || 'Login failed';
        toast.error(message);
        return { success: false, error: message };
      } finally {
        this.loading = false;
      }
    },

    async fetchCurrentUser() {
      try {
        const response = await authAPI.me();
        this.user = response.data;
        localStorage.setItem('user', JSON.stringify(response.data));
        return response.data;
      } catch (error) {
        this.logout();
        return null;
      }
    },

    setAuthData(user, token) {
      this.user = user;
      this.token = token;
      this.isAuthenticated = true;
      
      localStorage.setItem('user', JSON.stringify(user));
      localStorage.setItem('token', token);
    },

    logout() {
      const toast = useToast();
      this.user = null;
      this.token = null;
      this.isAuthenticated = false;
      
      localStorage.removeItem('user');
      localStorage.removeItem('token');
      
      toast.info('Logged out successfully');
    },
  },
});
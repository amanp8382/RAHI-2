import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';

const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || '/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 15000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

api.interceptors.response.use(
  (response) => response,
  (error) => {
    const token = localStorage.getItem('authToken') || '';
    const isLocalSession = token.startsWith('local-auth-token-') || token.startsWith('mock-jwt-token-');

    if (error.response?.status === 401 && !isLocalSession) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login.html';
      }
    }

    error.userMessage = handleApiError(error);
    return Promise.reject(error);
  }
);

const apiService = {
  auth: {
    login: async (credentials) => (await api.post('/auth/login', credentials)).data,
    touristDepartmentLogin: async (credentials) => (await api.post('/auth/tourist-dept-login', credentials)).data,
    register: async (userData) => (await api.post('/auth/register', userData)).data,
    logout: async () => (await api.post('/auth/logout')).data
  },

  users: {
    getProfile: async () => {
      const response = await api.get('/auth/me');
      return response.data?.user || response.data;
    },
    updateProfile: async (userData) => (await api.put('/auth/profile', userData)).data
  },

  destinations: {
    getAll: async (params) => (await api.get('/destinations', { params })).data,
    getById: async (id) => (await api.get(`/destinations/${id}`)).data,
    create: async (destinationData) => (await api.post('/destinations', destinationData)).data,
    update: async (id, destinationData) => (await api.put(`/destinations/${id}`, destinationData)).data,
    delete: async (id) => (await api.delete(`/destinations/${id}`)).data,
    getSafetyInfo: async (id) => (await api.get(`/destinations/${id}/safety`)).data
  },

  ai: {
    getSafetyRecommendations: async (location) => (await api.post('/ai/safety-recommendations', { location })).data,
    analyzeRisk: async (data) => (await api.post('/ai/risk-analysis', data)).data,
    getChatbotResponse: async (message) => (await api.post('/ai/chatbot', { message })).data,
    getEmergencyAssistance: async (location, emergencyType) => (await api.post('/ai/emergency-assistance', { location, emergencyType })).data
  },

  health: {
    check: async () => (await api.get('/health')).data
  },

  alerts: {
    create: async (alertData) => (await api.post('/alerts', alertData)).data,
    getAll: async () => (await api.get('/alerts')).data,
    getById: async (id) => (await api.get(`/alerts/${id}`)).data,
    update: async (id, alertData) => (await api.put(`/alerts/${id}`, alertData)).data,
    delete: async (id) => (await api.delete(`/alerts/${id}`)).data
  },

  emergency: {
    triggerPanic: async (panicData) => (await api.post('/emergency/panic', panicData)).data,
    getEmergencyContacts: async () => (await api.get('/emergency/contacts')).data,
    addEmergencyContact: async (contactData) => (await api.post('/emergency/contacts', contactData)).data
  }
};

export default apiService;

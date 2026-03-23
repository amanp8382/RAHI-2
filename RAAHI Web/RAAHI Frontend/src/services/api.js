import axios from 'axios';
import { handleApiError } from '../utils/errorHandler';

// Create axios instance with base configuration
const API_BASE_URL = import.meta.env.VITE_API_BASE_URL || 'http://localhost:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor for error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Handle 401 errors by clearing auth and redirecting
    if (error.response?.status === 401) {
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      // Only redirect if not already on login page
      if (!window.location.pathname.includes('/login')) {
        window.location.href = '/login.html';
      }
    }
    
    // Add user-friendly error message
    error.userMessage = handleApiError(error);
    return Promise.reject(error);
  }
);

// API service methods
const apiService = {
  // Authentication endpoints
  auth: {
    login: async (credentials) => {
      const response = await api.post('/auth/login', credentials);
      return response.data;
    },
    register: async (userData) => {
      const response = await api.post('/auth/register', userData);
      return response.data;
    },
    logout: async () => {
      const response = await api.post('/auth/logout');
      return response.data;
    },
    refreshToken: async () => {
      const response = await api.post('/auth/refresh');
      return response.data;
    },
    forgotPassword: async (email) => {
      const response = await api.post('/auth/forgot-password', { email });
      return response.data;
    },
    resetPassword: async (token, newPassword) => {
      const response = await api.post('/auth/reset-password', { token, newPassword });
      return response.data;
    }
  },

  // User endpoints
  users: {
    getProfile: async () => {
      const response = await api.get('/auth/me');
      return response.data;
    },
    updateProfile: async (userData) => {
      const response = await api.put('/users/profile', userData);
      return response.data;
    },
    deleteAccount: async () => {
      const response = await api.delete('/users/profile');
      return response.data;
    },
    getUsers: async (params) => {
      const response = await api.get('/users', { params });
      return response.data;
    }
  },

  // Destinations endpoints
  destinations: {
    getAll: async (params) => {
      const response = await api.get('/destinations', { params });
      return response.data;
    },
    getById: async (id) => {
      const response = await api.get(`/destinations/${id}`);
      return response.data;
    },
    create: async (destinationData) => {
      const response = await api.post('/destinations', destinationData);
      return response.data;
    },
    update: async (id, destinationData) => {
      const response = await api.put(`/destinations/${id}`, destinationData);
      return response.data;
    },
    delete: async (id) => {
      const response = await api.delete(`/destinations/${id}`);
      return response.data;
    },
    getSafetyInfo: async (id) => {
      const response = await api.get(`/destinations/${id}/safety`);
      return response.data;
    }
  },

  // AI endpoints
  ai: {
    getSafetyRecommendations: async (location) => {
      const response = await api.post('/ai/safety-recommendations', { location });
      return response.data;
    },
    analyzeRisk: async (data) => {
      const response = await api.post('/ai/risk-analysis', data);
      return response.data;
    },
    getChatbotResponse: async (message) => {
      const response = await api.post('/ai/chatbot', { message });
      return response.data;
    },
    getEmergencyAssistance: async (location, emergencyType) => {
      const response = await api.post('/ai/emergency-assistance', { location, emergencyType });
      return response.data;
    }
  },

  // Health check
  health: {
    check: async () => {
      const response = await api.get('/health');
      return response.data;
    }
  },

  // Emergency and alerts
  alerts: {
    create: async (alertData) => {
      const response = await api.post('/alerts', alertData);
      return response.data;
    },
    getAll: async () => {
      const response = await api.get('/alerts');
      return response.data;
    },
    getById: async (id) => {
      const response = await api.get(`/alerts/${id}`);
      return response.data;
    },
    update: async (id, alertData) => {
      const response = await api.put(`/alerts/${id}`, alertData);
      return response.data;
    },
    delete: async (id) => {
      const response = await api.delete(`/alerts/${id}`);
      return response.data;
    }
  },

  // Emergency contact
  emergency: {
    triggerPanic: async (panicData) => {
      const response = await api.post('/emergency/panic', panicData);
      return response.data;
    },
    getEmergencyContacts: async () => {
      const response = await api.get('/emergency/contacts');
      return response.data;
    },
    addEmergencyContact: async (contactData) => {
      const response = await api.post('/emergency/contacts', contactData);
      return response.data;
    }
  }
};

export default apiService;
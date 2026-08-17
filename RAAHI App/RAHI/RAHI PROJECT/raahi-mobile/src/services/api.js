import axios from 'axios';
import Constants from 'expo-constants';
import { storage } from './storage';
import {
  fallbackChatReply,
  fallbackDestinations,
  fallbackEmergencyAssistance,
  fallbackEmergencyContacts,
  fallbackGeofenceMatches,
  fallbackGeofences,
  fallbackPanicHistory,
  fallbackSafetyTips
} from '../data/mockData';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  Constants.expoConfig?.extra?.apiBaseUrl ||
  'http://10.0.2.2:3000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 20000,
  headers: {
    'Content-Type': 'application/json'
  }
});

api.interceptors.request.use(async (config) => {
  const token = await storage.getToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

const normalizeUser = (userData) => {
  if (!userData) return null;

  const firstName = userData.firstName || '';
  const lastName = userData.lastName || '';
  const fullName = userData.fullName || `${firstName} ${lastName}`.trim() || userData.email || 'Traveler';

  return {
    ...userData,
    id: userData.id || userData._id || userData.uid,
    uid: userData.uid || userData.id || userData._id,
    firstName,
    lastName,
    fullName,
    role: userData.role || 'user',
    userType: userData.userType || 'tourist',
    phone: userData.phone || '',
    age: userData.age || '',
    destination: userData.destination || '',
    tripDurationDays: userData.tripDurationDays || '',
    bloodGroup: userData.bloodGroup || '',
    medicalConditions: userData.medicalConditions || '',
    aadhaarNumber: userData.aadhaarNumber || '',
    aadhaarVerified: Boolean(userData.aadhaarVerified),
    travelPreferences: Array.isArray(userData.travelPreferences) ? userData.travelPreferences : [],
    profilePhoto: userData.profilePhoto || null,
    travelerId: userData.travelerId || '',
    publicCardPath: userData.publicCardPath || '',
    emergencyContacts: Array.isArray(userData.emergencyContacts) ? userData.emergencyContacts : [],
    language: userData.language || 'English'
  };
};

const toUserMessage = (error, fallback) => (
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  fallback
);

const canFallback = (error) => !error.response || [404, 500, 503].includes(error.response.status);

const requestOrFallback = async (request, fallbackFactory) => {
  try {
    const response = await request();
    return response.data;
  } catch (error) {
    if (fallbackFactory && canFallback(error)) {
      return fallbackFactory(error);
    }
    throw error;
  }
};

export const apiService = {
  normalizeUser,
  toUserMessage,

  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    const payload = response.data;
    if (payload?.data?.token || payload?.data?.user) {
      return {
        ...payload,
        token: payload.token || payload.data?.token,
        user: payload.user || payload.data?.user
      };
    }
    return payload;
  },

  async register(payload) {
    const response = await api.post('/auth/register', payload);
    const result = response.data;
    if (result?.data?.token || result?.data?.user) {
      return {
        ...result,
        token: result.token || result.data?.token,
        user: result.user || result.data?.user
      };
    }
    return result;
  },

  async getProfile() {
    const response = await api.get('/auth/me');
    return response.data?.user || response.data;
  },

  async updateProfile(userData) {
    const response = await api.put('/auth/profile', userData);
    return response.data;
  },

  async getLiveSafetyScore(payload) {
    const response = await api.post('/ai/live-safety-score', payload);
    return response.data;
  },

  async getDestinations() {
    const data = await requestOrFallback(
      () => api.get('/destinations'),
      () => ({
        success: true,
        destinations: fallbackDestinations,
        source: 'local-fallback'
      })
    );
    return data.destinations || data.data?.destinations || [];
  },

  async getSafetyTips() {
    const data = await requestOrFallback(
      () => api.get('/destinations/safety-tips'),
      () => ({
        success: true,
        tips: fallbackSafetyTips,
        source: 'local-fallback'
      })
    );
    return data.tips || [];
  },

  async getUserStats() {
    const data = await requestOrFallback(
      () => api.get('/users/stats'),
      () => ({
        success: true,
        data: {
          stats: {
            totalActivities: 12,
            profileCompleteness: 82,
            memberSince: new Date().toISOString(),
            recentActivities: []
          }
        },
        source: 'local-fallback'
      })
    );
    return data.data?.stats || data.stats || {};
  },

  async updatePreferences(travelPreferences) {
    const response = await api.put('/users/preferences', { travelPreferences });
    return response.data;
  },

  async triggerPanic(payload) {
    const response = await api.post('/emergency/panic', payload);
    return response.data;
  },

  async getPanicHistory() {
    const data = await requestOrFallback(
      () => api.get('/emergency/panic-alerts'),
      () => ({
        success: true,
        alerts: fallbackPanicHistory,
        source: 'local-fallback'
      })
    );
    return data.alerts || [];
  },

  async getEmergencyContacts(user) {
    return user?.emergencyContacts?.length ? user.emergencyContacts : fallbackEmergencyContacts;
  },

  async getEmergencyAssistance(payload) {
    const data = await requestOrFallback(
      () => api.post('/ai/emergency-assistance', payload),
      () => fallbackEmergencyAssistance(payload)
    );
    return data;
  },

  async getChatbotReply(message) {
    const data = await requestOrFallback(
      () => api.post('/ai/chatbot', { message }),
      () => fallbackChatReply(message)
    );
    return data;
  },

  async getSafetyRecommendations(location) {
    const data = await requestOrFallback(
      () => api.post('/ai/safety-recommendations', { location }),
      () => ({
        success: true,
        recommendations: [
          'Stay in well-lit public areas after sunset.',
          'Share your live trip progress with a trusted contact.',
          'Keep offline copies of hotel and transport details ready.'
        ],
        source: 'local-fallback'
      })
    );
    return data;
  },

  async getGeofences() {
    const data = await requestOrFallback(
      () => api.get('/geofences/hardcoded'),
      () => ({
        success: true,
        geofences: fallbackGeofences,
        source: 'local-fallback'
      })
    );
    return data.geofences || [];
  },

  async checkGeofences(location) {
    const data = await requestOrFallback(
      () => api.post('/geofences/check-hardcoded', location),
      () => ({
        success: true,
        matches: fallbackGeofenceMatches(location),
        source: 'local-fallback'
      })
    );
    return data.matches || [];
  }
};

export { API_BASE_URL };

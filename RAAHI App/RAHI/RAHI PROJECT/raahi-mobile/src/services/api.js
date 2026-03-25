import axios from 'axios';
import Constants from 'expo-constants';
import { storage } from './storage';

const API_BASE_URL =
  process.env.EXPO_PUBLIC_API_BASE_URL ||
  Constants.expoConfig?.extra?.apiBaseUrl ||
  'http://10.0.2.2:5000/api';

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
    publicCardPath: userData.publicCardPath || ''
  };
};

const toUserMessage = (error, fallback) => (
  error.response?.data?.message ||
  error.response?.data?.error ||
  error.message ||
  fallback
);

export const apiService = {
  normalizeUser,
  async login(credentials) {
    const response = await api.post('/auth/login', credentials);
    return response.data;
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
  toUserMessage
};

export { API_BASE_URL };

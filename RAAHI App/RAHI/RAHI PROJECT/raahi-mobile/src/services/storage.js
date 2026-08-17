import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'raahi_mobile_auth_token';
const USER_KEY = 'raahi_mobile_user';
const LOCATION_KEY = 'raahi_mobile_live_location';
const CHAT_HISTORY_KEY = 'raahi_mobile_chat_history';
const SETTINGS_KEY = 'raahi_mobile_settings';

const parse = (raw, fallback = null) => {
  try {
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
};

export const defaultSettings = {
  locationSharing: true,
  panicAutoShare: true,
  geofenceAlerts: true,
  weatherAlerts: true,
  chatbotNotifications: false,
  offlineCaching: true,
  language: 'English'
};

export const storage = {
  async getToken() {
    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
  },

  async setToken(token) {
    return AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  async getUser() {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return parse(raw);
  },

  async setUser(user) {
    return AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async clearSession() {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_KEY]);
  },

  async getLiveLocation() {
    const raw = await AsyncStorage.getItem(LOCATION_KEY);
    return parse(raw);
  },

  async setLiveLocation(location) {
    return AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(location));
  },

  async getChatHistory() {
    const raw = await AsyncStorage.getItem(CHAT_HISTORY_KEY);
    return parse(raw, []);
  },

  async setChatHistory(messages) {
    return AsyncStorage.setItem(CHAT_HISTORY_KEY, JSON.stringify(messages));
  },

  async getSettings() {
    const raw = await AsyncStorage.getItem(SETTINGS_KEY);
    return { ...defaultSettings, ...parse(raw, {}) };
  },

  async setSettings(settings) {
    return AsyncStorage.setItem(SETTINGS_KEY, JSON.stringify(settings));
  }
};

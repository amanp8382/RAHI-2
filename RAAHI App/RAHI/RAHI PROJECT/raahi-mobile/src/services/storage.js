import AsyncStorage from '@react-native-async-storage/async-storage';

const AUTH_TOKEN_KEY = 'raahi_mobile_auth_token';
const USER_KEY = 'raahi_mobile_user';
const LOCATION_KEY = 'raahi_mobile_live_location';

export const storage = {
  async getToken() {
    return AsyncStorage.getItem(AUTH_TOKEN_KEY);
  },

  async setToken(token) {
    return AsyncStorage.setItem(AUTH_TOKEN_KEY, token);
  },

  async getUser() {
    const raw = await AsyncStorage.getItem(USER_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async setUser(user) {
    return AsyncStorage.setItem(USER_KEY, JSON.stringify(user));
  },

  async clearSession() {
    await AsyncStorage.multiRemove([AUTH_TOKEN_KEY, USER_KEY]);
  },

  async getLiveLocation() {
    const raw = await AsyncStorage.getItem(LOCATION_KEY);
    return raw ? JSON.parse(raw) : null;
  },

  async setLiveLocation(location) {
    return AsyncStorage.setItem(LOCATION_KEY, JSON.stringify(location));
  }
};

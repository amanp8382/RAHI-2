import React, { createContext, useContext, useEffect, useMemo, useState } from 'react';
import { apiService } from '../services/api';
import { storage } from '../services/storage';

const AuthContext = createContext(null);

const normalizeUser = apiService.normalizeUser;

const hasCompletedProfile = (user) => Boolean(
  user?.phone &&
  user?.age &&
  user?.destination &&
  user?.tripDurationDays &&
  user?.bloodGroup &&
  user?.aadhaarVerified
);

export function AuthProvider({ children }) {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [settings, setSettings] = useState(null);

  useEffect(() => {
    const bootstrap = async () => {
      try {
        const [token, savedUser, savedSettings] = await Promise.all([
          storage.getToken(),
          storage.getUser(),
          storage.getSettings()
        ]);

        setSettings(savedSettings);

        if (!token || !savedUser) {
          setIsLoading(false);
          return;
        }

        try {
          const profile = await apiService.getProfile();
          const normalized = normalizeUser(profile);
          await storage.setUser(normalized);
          setUser(normalized);
        } catch {
          setUser(normalizeUser(savedUser));
        }
      } finally {
        setIsLoading(false);
      }
    };

    bootstrap();
  }, []);

  const login = async ({ email, password }) => {
    try {
      const response = await apiService.login({ email, password });
      if (!response.success || !response.token) {
        return { success: false, error: response.message || 'Login failed.' };
      }

      const normalized = normalizeUser(response.user);
      await storage.setToken(response.token);
      await storage.setUser(normalized);
      setUser(normalized);

      return { success: true, user: normalized };
    } catch (error) {
      return {
        success: false,
        error: apiService.toUserMessage(error, 'Unable to login right now.')
      };
    }
  };

  const register = async (payload) => {
    try {
      const response = await apiService.register(payload);
      if (!response.success) {
        return { success: false, error: response.message || 'Registration failed.' };
      }

      if (response.token && response.user) {
        const normalized = normalizeUser(response.user);
        await storage.setToken(response.token);
        await storage.setUser(normalized);
        setUser(normalized);
      }

      return { success: true, data: response };
    } catch (error) {
      return {
        success: false,
        error: apiService.toUserMessage(error, 'Unable to register right now.')
      };
    }
  };

  const refreshUser = async () => {
    try {
      const profile = await apiService.getProfile();
      const normalized = normalizeUser(profile);
      await storage.setUser(normalized);
      setUser(normalized);
      return normalized;
    } catch {
      const saved = await storage.getUser();
      const normalized = normalizeUser(saved);
      setUser(normalized);
      return normalized;
    }
  };

  const updateProfile = async (profileData) => {
    try {
      const response = await apiService.updateProfile(profileData);
      if (!response.success) {
        return { success: false, error: response.message || 'Profile update failed.' };
      }

      const normalized = normalizeUser({
        ...user,
        ...profileData,
        ...response.user
      });
      await storage.setUser(normalized);
      setUser(normalized);

      return { success: true, user: normalized };
    } catch {
      const localUser = normalizeUser({ ...user, ...profileData });
      await storage.setUser(localUser);
      setUser(localUser);
      return {
        success: true,
        user: localUser,
        message: 'Profile saved locally. Sync it when the backend is available.'
      };
    }
  };

  const updateAppSettings = async (nextSettings) => {
    await storage.setSettings(nextSettings);
    setSettings(nextSettings);
  };

  const logout = async () => {
    await storage.clearSession();
    setUser(null);
  };

  const value = useMemo(() => ({
    user,
    settings,
    isLoading,
    isAuthenticated: Boolean(user),
    hasCompletedProfile: hasCompletedProfile(user),
    login,
    register,
    refreshUser,
    updateProfile,
    updateAppSettings,
    logout
  }), [user, settings, isLoading]);

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside AuthProvider.');
  }
  return context;
}

import React, { createContext, useContext, useEffect, useState } from 'react';
import apiService from '../services/api';
import { clearTravelerCache } from '../utils/travelerLedger';
import { clearLocationCache } from '../utils/liveLocationStore';
const AuthContext = createContext();
// eslint-disable-next-line react-refresh/only-export-components
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used within an AuthProvider');
  return context;
};
const normalize = user => ({ ...user, fullName: user.fullName || `${user.firstName || ''} ${user.lastName || ''}`.trim(),
  userType: user.userType || (user.role === 'police' ? 'police' : user.role === 'tourist_department' ? 'department' : 'tourist') });
const failure = error => ({ success: false, error: error.response?.data?.message || error.response?.data?.error || 'Cannot reach the account server. Your data has not been saved locally.', details: error.response?.data?.details || [] });
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const clearAuth = () => { clearTravelerCache(); clearLocationCache(); sessionStorage.removeItem('authToken'); setUser(null); setIsAuthenticated(false); };
  const accept = response => {
    if (!response.success || !response.token) return { success: false, error: response.message || 'Authentication failed' };
    sessionStorage.setItem('authToken', response.token);
    const normalized = normalize(response.user);
    setUser(normalized); setIsAuthenticated(true);
    return { success: true, user: normalized, userType: normalized.userType, message: response.message };
  };
  useEffect(() => {
    let active = true;
    const load = async () => {
      try {
        if (sessionStorage.getItem('authToken')) {
          const profile = await apiService.users.getProfile();
          if (active) { setUser(normalize(profile)); setIsAuthenticated(true); }
        }
      } catch { if (active) clearAuth(); }
      finally { if (active) setIsLoading(false); }
    };
    void load();
    return () => { active = false; };
  }, []);
  const register = async data => {
    setIsLoading(true);
    try { return accept(await apiService.auth.register(data)); }
    catch (error) { return failure(error); }
    finally { setIsLoading(false); }
  };
  const login = async data => {
    setIsLoading(true);
    try {
      const response = data.userType === 'police'
        ? await apiService.auth.policeLogin({ pincode: data.pincode, password: data.password })
        : data.userType === 'department'
          ? await apiService.auth.touristDepartmentLogin({ state: data.state, password: data.password })
          : await apiService.auth.login({ email: data.email, password: data.password });
      return accept(response);
    } catch (error) { return failure(error); }
    finally { setIsLoading(false); }
  };
  const completeProfile = async data => {
    setIsLoading(true);
    try {
      const response = await apiService.users.updateProfile(data);
      if (!response.success) return { success: false, error: response.message || 'Profile was not saved' };
      const normalized = normalize(response.user); setUser(normalized);
      return { success: true, user: normalized, message: response.message };
    } catch (error) { return failure(error); }
    finally { setIsLoading(false); }
  };
  const logout = async () => { try { await apiService.auth.logout(); } finally { clearAuth(); } };
  return <AuthContext.Provider value={{ user, isAuthenticated, isLoading, register, login, completeProfile, logout, clearAuth, updateUser: completeProfile }}>{children}</AuthContext.Provider>;
};
export default AuthContext;

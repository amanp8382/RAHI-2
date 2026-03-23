import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';

// Create the Auth Context
const AuthContext = createContext();

// Custom hook to use the auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  // Initialize authentication state on app load
  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      if (token && savedUser) {
        const userData = JSON.parse(savedUser);
        
        // If it's a mock token, just restore the user state
        if (token.startsWith('mock-jwt-token-')) {
          setUser(userData);
          setIsAuthenticated(true);
          return;
        }
        
        // For real tokens, verify with backend
        try {
          const profileData = await apiService.users.getProfile();
          setUser(profileData);
          setIsAuthenticated(true);
        } catch (error) {
          // Token is invalid, clear storage
          console.warn('Token verification failed:', error.message);
          clearAuth();
        }
      }
    } catch (error) {
      console.error('Auth initialization error:', error);
      clearAuth();
    } finally {
      setIsLoading(false);
    }
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);
      
      // Mock authentication for development (check for specific credentials)
      if (credentials.email === 'anike@example.com' && credentials.password === 'asdfghjkl') {
        const mockUser = {
          id: '1',
          email: 'anike@example.com',
          fullName: 'Anike Kumar',
          firstName: 'Anike',
          lastName: 'Kumar',
          phone: '+919876543210',
          touristId: 'TID-2024-001',
          userType: 'tourist',
          role: 'user'
        };
        
        // Store mock token and user data
        localStorage.setItem('authToken', 'mock-jwt-token-' + Date.now());
        localStorage.setItem('user', JSON.stringify(mockUser));
        
        setUser(mockUser);
        setIsAuthenticated(true);
        
        return { success: true, message: 'Login successful' };
      }
      
      // If not using mock credentials, try backend authentication
      try {
        const response = await apiService.auth.login(credentials);
        
        if (response.success && response.token) {
          // Store backend JWT token and user data
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          
          setUser(response.user);
          setIsAuthenticated(true);
          
          return { success: true, message: response.message || 'Login successful' };
        } else {
          return { success: false, error: response.message || 'Login failed', action: response.action };
        }
      } catch (apiError) {
        console.warn('Backend authentication failed:', apiError.message);
        
        // Extract specific error message from backend response
        const errorData = apiError.response?.data;
        if (errorData) {
          return { 
            success: false, 
            error: errorData.message || 'Authentication failed',
            action: errorData.action
          };
        }
        
        return { success: false, error: 'Connection failed. Please check your internet connection.' };
      }
      
    } catch (error) {
      console.error('Login error:', error);
      return { success: false, error: 'Login failed' };
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);
      
      const { fullName, touristData, ...otherData } = userData;
      
      // Parse fullName into firstName and lastName
      const nameParts = fullName.split(' ');
      const firstName = nameParts[0] || '';
      const lastName = nameParts.slice(1).join(' ') || '';
      
      // Prepare data according to backend User model structure
      const backendData = {
        email: userData.email,
        password: userData.password,
        firstName,
        lastName,
        phone: userData.phone
      };

      // Add location if provided in tourist data
      if (touristData && touristData.nationality) {
        backendData.location = {
          country: touristData.nationality
        };
      }
      
      // Register with backend
      const response = await apiService.auth.register(backendData);
      
      if (response.success) {
        console.log('✅ Registration successful');
        
        // Auto-login after successful registration
        if (response.token) {
          localStorage.setItem('authToken', response.token);
          localStorage.setItem('user', JSON.stringify(response.user));
          setUser(response.user);
          setIsAuthenticated(true);
        }
        
        return { 
          success: true, 
          user: response.user, 
          message: response.message || 'Registration successful',
          requiresVerification: !response.user.isEmailVerified
        };
      } else {
        throw new Error(response.error || 'Registration failed');
      }
      
    } catch (error) {
      console.error('Registration error:', error);
      
      // Extract specific error message from backend response
      const errorData = error.response?.data;
      if (errorData) {
        return { 
          success: false, 
          error: errorData.message || 'Registration failed',
          action: errorData.action
        };
      }
      
      const errorMessage = error.message || 'Registration failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      // Call backend logout endpoint
      try {
        await apiService.auth.logout();
      } catch (error) {
        console.error('Backend logout error:', error);
        // Continue with logout even if backend call fails
      }
      
      // Clear local auth state
      clearAuth();
      
    } catch (error) {
      console.error('Logout error:', error);
      // Force clear auth state
      clearAuth();
    }
  };

  const clearAuth = () => {
    localStorage.removeItem('authToken');
    localStorage.removeItem('user');
    setUser(null);
    setIsAuthenticated(false);
  };

  const updateUser = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const refreshToken = async () => {
    try {
      const response = await apiService.auth.refreshToken();
      if (response.token) {
        localStorage.setItem('authToken', response.token);
        return true;
      }
    } catch (error) {
      console.error('Token refresh error:', error);
      clearAuth();
      return false;
    }
  };

  const forgotPassword = async (email) => {
    try {
      setIsLoading(true);
      const response = await apiService.auth.forgotPassword(email);
      return { success: true, message: response.message || 'Password reset email sent' };
    } catch (error) {
      console.error('Forgot password error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  const resetPassword = async (token, newPassword) => {
    try {
      setIsLoading(true);
      const response = await apiService.auth.resetPassword(token, newPassword);
      return { success: true, message: response.message || 'Password reset successful' };
    } catch (error) {
      console.error('Reset password error:', error);
      const errorMessage = error.response?.data?.message || error.message || 'Password reset failed';
      return { success: false, error: errorMessage };
    } finally {
      setIsLoading(false);
    }
  };

  // Context value
  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    logout,
    updateUser,
    refreshToken,
    forgotPassword,
    resetPassword,
    clearAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;
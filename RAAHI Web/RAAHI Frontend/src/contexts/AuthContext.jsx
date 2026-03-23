import React, { createContext, useContext, useState, useEffect } from 'react';
import apiService from '../services/api';
import { issueTravelerCredential } from '../utils/travelerLedger';

const AuthContext = createContext();
const LOCAL_USERS_KEY = 'raahi_local_users_v1';
const LOCAL_TOKEN_PREFIX = 'local-auth-token-';
const MOCK_TOKEN_PREFIX = 'mock-jwt-token-';
const POLICE_TOKEN_PREFIX = 'police-auth-token-';
const POLICE_ACCOUNTS = [
  {
    id: 'police-delhi-central',
    pincode: '110001',
    password: 'police123',
    fullName: 'Delhi Police Control Room',
    firstName: 'Delhi Police',
    lastName: 'Control Room',
    email: 'police.raahi@local',
    role: 'police',
    userType: 'police',
    stationName: 'Connaught Place Police Station'
  },
  {
    id: 'police-delhi-north',
    pincode: '110006',
    password: 'police123',
    fullName: 'North Delhi Police Unit',
    firstName: 'North Delhi',
    lastName: 'Police',
    email: 'north.police.raahi@local',
    role: 'police',
    userType: 'police',
    stationName: 'Red Fort Police Post'
  }
];

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
};

const normalizeUser = (userData) => {
  if (!userData) return null;

  const firstName = userData.firstName || '';
  const lastName = userData.lastName || '';
  const fullName = userData.fullName || `${firstName} ${lastName}`.trim() || userData.email || 'User';

  return {
    ...userData,
    id: userData.id || userData._id || userData.uid,
    uid: userData.uid || userData.id || userData._id,
    firstName,
    lastName,
    fullName,
    role: userData.role || 'user',
    userType: userData.userType || (userData.role === 'tourist_department' ? 'department' : 'tourist'),
    phone: userData.phone || '',
    age: userData.age || '',
    destination: userData.destination || '',
    tripDurationDays: userData.tripDurationDays || '',
    bloodGroup: userData.bloodGroup || '',
    medicalConditions: userData.medicalConditions || '',
    aadhaarNumber: userData.aadhaarNumber || '',
    aadhaarVerified: Boolean(userData.aadhaarVerified),
    travelPreferences: Array.isArray(userData.travelPreferences) ? userData.travelPreferences : [],
    profilePhoto: userData.profilePhoto || null
  };
};

const issueAndPersistUser = async (userData, token = localStorage.getItem('authToken')) => {
  const normalized = normalizeUser(userData);
  const credentialedUser = await issueTravelerCredential(normalized);
  if (token) {
    persistSession(token, credentialedUser);
  } else {
    localStorage.setItem('user', JSON.stringify(credentialedUser));
  }
  return credentialedUser;
};

const getLocalUsers = () => {
  try {
    const users = localStorage.getItem(LOCAL_USERS_KEY);
    return users ? JSON.parse(users) : [];
  } catch (error) {
    console.error('Failed to parse local auth store:', error);
    return [];
  }
};

const setLocalUsers = (users) => {
  localStorage.setItem(LOCAL_USERS_KEY, JSON.stringify(users));
};

const persistSession = (token, user) => {
  localStorage.setItem('authToken', token);
  localStorage.setItem('user', JSON.stringify(user));
};

const persistDirectSessionUser = (userData, token) => {
  const normalized = normalizeUser(userData);
  persistSession(token, normalized);
  return normalized;
};

const persistLocalAccount = (userData, fallbackPassword = 'offline-profile') => {
  const normalized = normalizeUser(userData);
  const email = (normalized.email || '').trim().toLowerCase();
  const localUsers = getLocalUsers();
  const existingIndex = localUsers.findIndex((entry) => (
    entry.id === normalized.id || (email && entry.email === email)
  ));

  const nextEntry = {
    id: normalized.id,
    email,
    password: existingIndex >= 0 ? localUsers[existingIndex].password : fallbackPassword,
    user: normalized
  };

  if (existingIndex >= 0) {
    localUsers[existingIndex] = nextEntry;
  } else {
    localUsers.push(nextEntry);
  }

  setLocalUsers(localUsers);
  return normalized;
};

const hasLocalFallbackSession = () => {
  const token = localStorage.getItem('authToken') || '';
  return (
    token.startsWith(LOCAL_TOKEN_PREFIX) ||
    token.startsWith(MOCK_TOKEN_PREFIX) ||
    token.startsWith(POLICE_TOKEN_PREFIX)
  );
};

const isOfflineFallbackError = (error) => (
  !error.response ||
  error.response.status >= 500 ||
  (error.response.status === 401 && hasLocalFallbackSession())
);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    initializeAuth();
  }, []);

  const initializeAuth = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const savedUser = localStorage.getItem('user');

      if (!token || !savedUser) {
        return;
      }

      const userData = JSON.parse(savedUser);

      if (token.startsWith(POLICE_TOKEN_PREFIX)) {
        const normalized = normalizeUser(userData);
        setUser(normalized);
        setIsAuthenticated(true);
        return;
      }

      if (token.startsWith(MOCK_TOKEN_PREFIX) || token.startsWith(LOCAL_TOKEN_PREFIX)) {
        const normalized = await issueAndPersistUser(userData, token);
        setUser(normalized);
        setIsAuthenticated(true);
        return;
      }

      try {
        const profileData = await apiService.users.getProfile();
        const normalized = await issueAndPersistUser(profileData, token);
        setUser(normalized);
        setIsAuthenticated(true);
      } catch (error) {
        if (isOfflineFallbackError(error)) {
          const normalized = await issueAndPersistUser(userData, token);
          setUser(normalized);
          setIsAuthenticated(true);
        } else {
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

  const loginWithLocalStore = (credentials) => {
    const localUsers = getLocalUsers();
    const matchingUser = localUsers.find((entry) => (
      entry.email?.toLowerCase() === credentials.email?.toLowerCase() &&
      entry.password === credentials.password
    ));

    if (!matchingUser) {
      return {
        success: false,
        error: 'No locally saved account matched these credentials.'
      };
    }

    const normalized = normalizeUser(matchingUser.user);
    const token = `${LOCAL_TOKEN_PREFIX}${normalized.id}`;
    return issueAndPersistUser(normalized, token).then((credentialedUser) => {
      setUser(credentialedUser);
      setIsAuthenticated(true);

      return {
        success: true,
        message: 'Logged in using locally saved data.',
        user: credentialedUser,
        userType: credentialedUser.userType,
        isOfflineMode: true
      };
    });
  };

  const registerLocally = (userData) => {
    const localUsers = getLocalUsers();
    const email = userData.email.trim().toLowerCase();

    if (localUsers.some((entry) => entry.email === email)) {
      return {
        success: false,
        error: 'This email is already saved locally. Please log in instead.'
      };
    }

    const normalized = normalizeUser({
      id: `local-${Date.now()}`,
      firstName: userData.firstName,
      lastName: userData.lastName,
      email,
      role: 'user',
      userType: 'tourist',
      phone: '',
      age: '',
      destination: '',
      tripDurationDays: '',
      bloodGroup: '',
      medicalConditions: '',
      aadhaarNumber: '',
      aadhaarVerified: false,
      travelPreferences: [],
      profilePhoto: null
    });

    localUsers.push({
      id: normalized.id,
      email,
      password: userData.password,
      user: normalized
    });
    setLocalUsers(localUsers);

    const token = `${LOCAL_TOKEN_PREFIX}${normalized.id}`;
    return issueAndPersistUser(normalized, token).then((credentialedUser) => {
      setUser(credentialedUser);
      setIsAuthenticated(true);

      localUsers[localUsers.length - 1].user = credentialedUser;
      setLocalUsers(localUsers);

      return {
        success: true,
        user: credentialedUser,
        message: 'Account saved locally. It will work until backend services are available.',
        isOfflineMode: true
      };
    });
  };

  const updateLocalUser = (userId, updates) => {
    const localUsers = getLocalUsers();
    const nextUsers = localUsers.map((entry) => {
      if (entry.id !== userId) return entry;
      const mergedUser = normalizeUser({ ...entry.user, ...updates });
      return { ...entry, user: mergedUser };
    });
    setLocalUsers(nextUsers);
    return nextUsers.find((entry) => entry.id === userId)?.user || null;
  };

  const login = async (credentials) => {
    try {
      setIsLoading(true);

      if (credentials.userType === 'police') {
        const matchingPolice = POLICE_ACCOUNTS.find((account) => (
          account.pincode === credentials.pincode &&
          account.password === credentials.password
        ));

        if (!matchingPolice) {
          return {
            success: false,
            error: 'Invalid police pincode or password.'
          };
        }

        const policeUser = persistDirectSessionUser(
          {
            ...matchingPolice,
            pincode: matchingPolice.pincode
          },
          `${POLICE_TOKEN_PREFIX}${matchingPolice.id}`
        );

        setUser(policeUser);
        setIsAuthenticated(true);

        return {
          success: true,
          message: 'Police login successful',
          user: policeUser,
          userType: 'police'
        };
      }

      if (credentials.email === 'anike@example.com' && credentials.password === 'asdfghjkl') {
        const mockUser = normalizeUser({
          id: '1',
          email: 'anike@example.com',
          fullName: 'Anike Kumar',
          firstName: 'Anike',
          lastName: 'Kumar',
          phone: '+919876543210',
          touristId: 'TID-2024-001',
          userType: 'tourist',
          role: 'user'
        });

        const credentialedUser = await issueAndPersistUser(mockUser, `${MOCK_TOKEN_PREFIX}${Date.now()}`);
        persistLocalAccount(credentialedUser, credentials.password);
        setUser(credentialedUser);
        setIsAuthenticated(true);

        return { success: true, message: 'Login successful', user: credentialedUser, userType: credentialedUser.userType };
      }

      try {
        const response = credentials.userType === 'department'
          ? await apiService.auth.touristDepartmentLogin({
              state: credentials.state,
              password: credentials.password
            })
          : await apiService.auth.login({
              email: credentials.email,
              password: credentials.password
            });

        if (!response.success || !response.token) {
          return { success: false, error: response.message || 'Login failed', action: response.action };
        }

        const normalized = await issueAndPersistUser(response.user, response.token);
        persistLocalAccount(normalized, credentials.password);
        setUser(normalized);
        setIsAuthenticated(true);

        return {
          success: true,
          message: response.message || 'Login successful',
          user: normalized,
          userType: normalized.userType
        };
      } catch (error) {
        if (!isOfflineFallbackError(error) || credentials.userType === 'department') {
          const errorData = error.response?.data;
          return {
            success: false,
            error: errorData?.message || errorData?.error || 'Connection failed. Please check your internet connection.',
            details: errorData?.details || []
          };
        }

        return loginWithLocalStore(credentials);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData) => {
    try {
      setIsLoading(true);

      try {
        const response = await apiService.auth.register(userData);

        if (!response.success || !response.token) {
          return {
            success: false,
            error: response.message || response.error || 'Registration failed',
            details: response.details || []
          };
        }

        const normalized = await issueAndPersistUser(response.user, response.token);
        persistLocalAccount(normalized, userData.password);
        setUser(normalized);
        setIsAuthenticated(true);

        return {
          success: true,
          user: normalized,
          message: response.message || 'Registration successful'
        };
      } catch (error) {
        if (!isOfflineFallbackError(error)) {
          const errorData = error.response?.data;
          return {
            success: false,
            error: errorData?.message || errorData?.error || 'Registration failed',
            details: errorData?.details || []
          };
        }

        return registerLocally(userData);
      }
    } finally {
      setIsLoading(false);
    }
  };

  const completeProfile = async (profileData) => {
    try {
      setIsLoading(true);

      try {
        const response = await apiService.users.updateProfile(profileData);

        if (!response.success) {
          return {
            success: false,
            error: response.message || 'Profile update failed',
            details: response.details || []
          };
        }

        const normalized = await issueAndPersistUser({
          ...user,
          ...profileData,
          ...response.user
        });
        persistLocalAccount(normalized);
        setUser(normalized);

        const token = localStorage.getItem('authToken');
        if (token?.startsWith(LOCAL_TOKEN_PREFIX)) {
          updateLocalUser(normalized.id, normalized);
        }

        return {
          success: true,
          user: normalized,
          message: response.message || 'Profile updated successfully'
        };
      } catch (error) {
        if (!isOfflineFallbackError(error)) {
          const errorData = error.response?.data;
          return {
            success: false,
            error: errorData?.message || errorData?.error || 'Profile update failed',
            details: errorData?.details || []
          };
        }

        const currentUser = await issueAndPersistUser({ ...user, ...profileData });
        const localUser = persistLocalAccount(currentUser);
        const localToken = `${LOCAL_TOKEN_PREFIX}${localUser.id}`;
        persistSession(localToken, localUser);
        setUser(localUser);
        setIsAuthenticated(true);

        return {
          success: true,
          user: localUser,
          message: 'Profile saved locally. Changes will remain available until backend services return.',
          isOfflineMode: true
        };
      }
    } finally {
      setIsLoading(false);
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      if (
        token &&
        !token.startsWith(LOCAL_TOKEN_PREFIX) &&
        !token.startsWith(MOCK_TOKEN_PREFIX) &&
        !token.startsWith(POLICE_TOKEN_PREFIX)
      ) {
        try {
          await apiService.auth.logout();
        } catch (error) {
          console.error('Backend logout error:', error);
        }
      }
    } finally {
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
    issueAndPersistUser(userData).then((normalized) => {
      setUser(normalized);
      const token = localStorage.getItem('authToken');
      if (token?.startsWith(LOCAL_TOKEN_PREFIX)) {
        updateLocalUser(normalized.id, normalized);
      }
    });
  };

  const value = {
    user,
    isAuthenticated,
    isLoading,
    login,
    register,
    completeProfile,
    logout,
    updateUser,
    clearAuth
  };

  return (
    <AuthContext.Provider value={value}>
      {children}
    </AuthContext.Provider>
  );
};

export default AuthContext;

// src/service/authService.js
import axios from "axios";

// ===== CONFIGURATION =====
const TOKEN_KEY = 'auth_token';
const USER_KEY = 'current_user';
const REFRESH_TOKEN_KEY = 'refresh_token';

// Environment-aware API base URL
const getAuthApiBase = () => {
  if (process.env.NODE_ENV === 'production') {
    return process.env.REACT_APP_AUTH_API_URL || "https://your-production-domain.com/api/auth";
  }
  return process.env.REACT_APP_AUTH_API_URL || "http://127.0.0.1:8001/api/auth";
};

const API_BASE = getAuthApiBase();

// Log the environment and URL for debugging
console.log(`AuthService initialized in ${process.env.NODE_ENV} mode with URL: ${API_BASE}`);

// Configure axios defaults
axios.defaults.timeout = 10000; // 10 second timeout

// ===== STORAGE UTILITIES =====

/**
 * Store authentication data in localStorage
 */
export const storeAuthData = (token, user, refreshToken = null) => {
  localStorage.setItem(TOKEN_KEY, token);
  localStorage.setItem(USER_KEY, JSON.stringify(user));
  if (refreshToken) {
    localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
  }
};

/**
 * Clear all authentication data from localStorage
 */
export const clearAuthData = () => {
  localStorage.removeItem(TOKEN_KEY);
  localStorage.removeItem(USER_KEY);
  localStorage.removeItem(REFRESH_TOKEN_KEY);
};

/**
 * Get auth token from localStorage
 */
export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY);
};

/**
 * Get refresh token from localStorage
 */
export const getRefreshToken = () => {
  return localStorage.getItem(REFRESH_TOKEN_KEY);
};

/**
 * Get current user from localStorage
 */
export const getCurrentUser = () => {
  try {
    const userStr = localStorage.getItem(USER_KEY);
    return userStr ? JSON.parse(userStr) : null;
  } catch (error) {
    console.error('Error getting current user:', error);
    return null;
  }
};

/**
 * Update user data in localStorage
 */
export const updateStoredUser = (updatedUser) => {
  try {
    localStorage.setItem(USER_KEY, JSON.stringify(updatedUser));
  } catch (error) {
    console.error('Error updating stored user:', error);
  }
};

// ===== AUTHENTICATION STATE =====

/**
 * Check if user is authenticated
 */
export const isAuthenticated = () => {
  const token = getToken();
  const user = getCurrentUser();
  
  if (!token || !user) {
    return false;
  }

  try {
    // If using JWT tokens, check expiration
    if (token.includes('.')) {
      const payload = JSON.parse(atob(token.split('.')[1]));
      const currentTime = Date.now() / 1000;
      
      if (payload.exp && payload.exp < currentTime) {
        // Token expired, clear storage
        clearAuthData();
        return false;
      }
    }
    
    return true;
  } catch (error) {
    console.error('Token validation error:', error);
    clearAuthData();
    return false;
  }
};

/**
 * Check if token needs refresh (if using JWT)
 */
export const shouldRefreshToken = () => {
  const token = getToken();
  if (!token || !token.includes('.')) return false;

  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    const timeUntilExpiry = payload.exp - currentTime;
    
    // Refresh if token expires in less than 5 minutes
    return timeUntilExpiry < 300;
  } catch (error) {
    console.error('Token check error:', error);
    return false;
  }
};

/**
 * Get auth headers for API requests
 */
export const getAuthHeaders = () => {
  const token = getToken();
  return token ? {
    'Authorization': `Bearer ${token}`,
    'Content-Type': 'application/json'
  } : {
    'Content-Type': 'application/json'
  };
};

// ===== API CALLS =====

/**
 * Login user
 */
export const login = async ({ email, password, rememberMe = false }) => {
  try {
    const response = await axios.post(`${API_BASE}/login`, { 
      email, 
      password, 
      rememberMe 
    });
    
    // Ensure the response has the expected structure
    if (response.data && response.data.success) {
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
        refreshToken: response.data.refreshToken,
        message: response.data.message || 'Login successful'
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Login failed'
      };
    }
  } catch (error) {
    console.error("Login error:", error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || `Server error: ${error.response.status}`,
        status: error.response.status
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    } else {
      return {
        success: false,
        message: error.message || 'An unexpected error occurred'
      };
    }
  }
};

/**
 * Enhanced login that automatically stores auth data
 */
export const loginWithStorage = async (credentials) => {
  try {
    const response = await login(credentials);
    
    if (response.success && response.token && response.user) {
      storeAuthData(response.token, response.user, response.refreshToken);
      return response;
    } else {
      throw new Error(response.message || 'Login failed');
    }
  } catch (error) {
    console.error('Login with storage error:', error);
    throw error;
  }
};

/**
 * Register new user
 */
export const signup = async ({ fullName, email, password }) => {
  try {
    const response = await axios.post(`${API_BASE}/signup`, { 
      fullName, 
      email, 
      password 
    });
    
    if (response.data && response.data.success) {
      return {
        success: true,
        token: response.data.token,
        user: response.data.user,
        refreshToken: response.data.refreshToken,
        message: response.data.message || 'Registration successful'
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Registration failed'
      };
    }
  } catch (error) {
    console.error("Signup error:", error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || `Server error: ${error.response.status}`,
        status: error.response.status
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    } else {
      return {
        success: false,
        message: error.message || 'An unexpected error occurred'
      };
    }
  }
};

/**
 * Enhanced signup that automatically stores auth data
 */
export const signupWithStorage = async (userData) => {
  try {
    const response = await signup(userData);
    
    if (response.success && response.token && response.user) {
      storeAuthData(response.token, response.user, response.refreshToken);
      return response;
    } else {
      throw new Error(response.message || 'Signup failed');
    }
  } catch (error) {
    console.error('Signup with storage error:', error);
    throw error;
  }
};

/**
 * Forgot password
 */
export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_BASE}/forgot-password`, { email });
    
    return {
      success: true,
      message: response.data.message || 'Password reset email sent'
    };
  } catch (error) {
    console.error("Forgot password error:", error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to send reset email',
        status: error.response.status
      };
    } else if (error.request) {
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    } else {
      return {
        success: false,
        message: error.message || 'An unexpected error occurred'
      };
    }
  }
};

/**
 * Reset password with token
 */
export const resetPassword = async ({ token, newPassword }) => {
  try {
    const response = await axios.post(`${API_BASE}/reset-password`, { 
      token, 
      newPassword 
    });
    
    return {
      success: true,
      message: response.data.message || 'Password reset successful'
    };
  } catch (error) {
    console.error("Reset password error:", error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Password reset failed',
        status: error.response.status
      };
    } else {
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  }
};

/**
 * Verify email
 */
export const verifyEmail = async (token) => {
  try {
    const response = await axios.post(`${API_BASE}/verify-email`, { token });
    
    return {
      success: true,
      message: response.data.message || 'Email verified successfully'
    };
  } catch (error) {
    console.error("Email verification error:", error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Email verification failed',
        status: error.response.status
      };
    } else {
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  }
};

/**
 * Refresh authentication token
 */
export const refreshToken = async (refreshTokenValue = null) => {
  try {
    const tokenToUse = refreshTokenValue || getRefreshToken();
    
    if (!tokenToUse) {
      return {
        success: false,
        message: 'No refresh token available'
      };
    }

    const response = await axios.post(`${API_BASE}/refresh-token`, { 
      refreshToken: tokenToUse 
    });
    
    if (response.data && response.data.success) {
      // Update stored tokens
      const currentUser = getCurrentUser();
      storeAuthData(response.data.token, currentUser, response.data.refreshToken);
      
      return {
        success: true,
        token: response.data.token,
        refreshToken: response.data.refreshToken
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Token refresh failed'
      };
    }
  } catch (error) {
    console.error("Token refresh error:", error);
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Token refresh failed',
        status: error.response.status
      };
    } else {
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  }
};

/**
 * Logout user (calls API and clears local storage)
 */
export const logout = async () => {
  try {
    const token = getToken();
    
    // Call logout endpoint if token exists
    if (token) {
      try {
        await axios.post(`${API_BASE}/logout`, {}, {
          headers: { Authorization: `Bearer ${token}` }
        });
      } catch (error) {
        console.error("Logout endpoint error:", error);
        // Don't throw - we still want to clear local storage
      }
    }
    
    // Always clear local storage
    clearAuthData();
    
    return {
      success: true,
      message: 'Logged out successfully'
    };
  } catch (error) {
    console.error("Logout error:", error);
    // Still clear local storage even if API call fails
    clearAuthData();
    
    return {
      success: true,
      message: 'Logged out'
    };
  }
};

/**
 * Get user profile from API
 */
export const getProfile = async () => {
  try {
    const token = getToken();
    
    if (!token) {
      return {
        success: false,
        message: 'No authentication token'
      };
    }

    const response = await axios.get(`${API_BASE}/profile`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data && response.data.success) {
      // Update stored user data
      updateStoredUser(response.data.user);
      
      return {
        success: true,
        user: response.data.user
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Failed to get profile'
      };
    }
  } catch (error) {
    console.error("Get profile error:", error);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      clearAuthData();
      return {
        success: false,
        message: 'Session expired. Please login again.',
        status: 401
      };
    }
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Failed to get profile',
        status: error.response.status
      };
    } else {
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  }
};

/**
 * Update user profile
 */
export const updateProfile = async (userData) => {
  try {
    const token = getToken();
    
    if (!token) {
      return {
        success: false,
        message: 'No authentication token'
      };
    }

    const response = await axios.put(`${API_BASE}/profile`, userData, {
      headers: { Authorization: `Bearer ${token}` }
    });
    
    if (response.data && response.data.success) {
      // Update stored user data
      updateStoredUser(response.data.user);
      
      return {
        success: true,
        user: response.data.user,
        message: response.data.message || 'Profile updated successfully'
      };
    } else {
      return {
        success: false,
        message: response.data.message || 'Profile update failed'
      };
    }
  } catch (error) {
    console.error("Update profile error:", error);
    
    if (error.response?.status === 401) {
      // Token expired or invalid
      clearAuthData();
      return {
        success: false,
        message: 'Session expired. Please login again.',
        status: 401
      };
    }
    
    if (error.response) {
      return {
        success: false,
        message: error.response.data?.message || 'Profile update failed',
        status: error.response.status
      };
    } else {
      return {
        success: false,
        message: 'Network error. Please check your connection.'
      };
    }
  }
};

// ===== UTILITY FUNCTIONS =====

/**
 * Auto-refresh token if needed
 */
export const autoRefreshToken = async () => {
  if (shouldRefreshToken()) {
    try {
      const result = await refreshToken();
      if (!result.success) {
        console.warn('Auto token refresh failed:', result.message);
        logout();
      }
    } catch (error) {
      console.error('Auto token refresh error:', error);
      logout();
    }
  }
};

/**
 * Initialize auth service (call this when app starts)
 */
export const initializeAuth = () => {
  // Check if we need to refresh token on app start
  if (isAuthenticated() && shouldRefreshToken()) {
    autoRefreshToken();
  }
  
  // Set up automatic token refresh
  setInterval(() => {
    if (isAuthenticated()) {
      autoRefreshToken();
    }
  }, 5 * 60 * 1000); // Check every 5 minutes
};

// ===== EXPORT DEFAULT =====
const authService = {
  // Authentication state
  isAuthenticated,
  getCurrentUser,
  getToken,
  getRefreshToken,
  getAuthHeaders,
  
  // Storage management
  storeAuthData,
  clearAuthData,
  updateStoredUser,
  
  // API calls
  login,
  loginWithStorage,
  signup,
  signupWithStorage,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  refreshToken,
  getProfile,
  updateProfile,
  
  // Utilities
  shouldRefreshToken,
  autoRefreshToken,
  initializeAuth
};

export default authService;
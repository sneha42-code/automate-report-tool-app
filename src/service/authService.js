// src/service/authService.js
import axios from "axios";

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

export const login = async ({ email, password, rememberMe }) => {
  try {
    const response = await axios.post(`${API_BASE}/login`, { email, password, rememberMe });
    return response.data;
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const signup = async ({ fullName, email, password }) => {
  try {
    const response = await axios.post(`${API_BASE}/signup`, { fullName, email, password });
    return response.data;
  } catch (error) {
    console.error("Signup error:", error);
    throw error;
  }
};

export const forgotPassword = async (email) => {
  try {
    const response = await axios.post(`${API_BASE}/forgot-password`, { email });
    return response.data;
  } catch (error) {
    console.error("Forgot password error:", error);
    throw error;
  }
};
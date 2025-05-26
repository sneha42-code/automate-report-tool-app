// src/service/authService.js
import axios from "axios";

const API_BASE = "/api/auth";

export const login = async ({ email, password, rememberMe }) => {
  const response = await axios.post(`${API_BASE}/login`, { email, password, rememberMe });
  return response.data;
};

export const signup = async ({ fullName, email, password }) => {
  const response = await axios.post(`${API_BASE}/signup`, { fullName, email, password });
  return response.data;
};

export const forgotPassword = async (email) => {
  const response = await axios.post(`${API_BASE}/forgot-password`, { email });
  return response.data;
};

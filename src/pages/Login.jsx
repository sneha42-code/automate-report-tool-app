// src/pages/Login.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import { forgotPassword } from "../service/authService";
import "../styles/Auth.css";
import Head3D from "../components/SimpleNeuralNetwork"; // Import the 3D component
import AuthLeftSection from "../components/AuthLeftSection";
import AuthRightSection from "../components/AuthRightSection";

const Login = () => {
  const [formData, setFormData] = useState({
    email: "",
    password: "",
    rememberMe: false,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData({
      ...formData,
      [name]: type === "checkbox" ? checked : value,
    });
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }
    if (!formData.password) {
      newErrors.password = "Password is required";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }
    setIsLoading(true);
    try {
      const response = await axios.post("/api/auth/login", {
        email: formData.email,
        password: formData.password,
        rememberMe: formData.rememberMe,
      });
      localStorage.setItem("isLoggedIn", "true");
      navigate("/");
    } catch (error) {
      setErrors({
        general:
          error.response?.data?.message ||
          "Login failed. Please check your credentials and try again.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email || errors.email) {
      setErrors((prev) => ({ ...prev, general: "Please enter a valid email address above to reset your password." }));
      return;
    }
    setIsLoading(true);
    try {
      await forgotPassword(formData.email);
      setErrors({});
      alert(`If an account exists for ${formData.email}, a reset link has been sent.`);
    } catch (error) {
      setErrors((prev) => ({ ...prev, general: error.response?.data?.message || "Failed to send reset link. Please try again later." }));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page medium-bg" style={{ display: 'flex', minHeight: '100vh', alignItems: 'stretch', justifyContent: 'center', background: '#f7fafd' }}>
      <AuthLeftSection>
        <Head3D />
      </AuthLeftSection>
      <AuthRightSection>
        <div className="auth-header medium-header">
          <h1 className="medium-title">Sign in to your account</h1>
          <p className="auth-subtitle medium-subtitle">
            Welcome back! Enter your email and password to continue.
          </p>
        </div>
        {errors.general && (
          <div className="auth-error-message" style={{ textAlign: "left" }}>
            {errors.general}
          </div>
        )}
        <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group medium-form-group">
            <label htmlFor="email" className="medium-label">
              Email Address
            </label>
            <input
              type="email"
              id="email"
              name="email"
              value={formData.email}
              onChange={handleChange}
              placeholder="Enter your email"
              className={`medium-input${errors.email ? " error" : ""}`}
              disabled={isLoading}
              autoComplete="email"
            />
            {errors.email && (
              <div className="field-error medium-error">{errors.email}</div>
            )}
          </div>
          <div className="form-group medium-form-group">
            <label htmlFor="password" className="medium-label">
              Password
            </label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your password"
              className={`medium-input${errors.password ? " error" : ""}`}
              disabled={isLoading}
              autoComplete="current-password"
            />
            {errors.password && (
              <div className="field-error medium-error">{errors.password}</div>
            )}
          </div>
          <div className="auth-options" style={{ marginBottom: 24 }}>
            <div className="remember-me">
              <input
                type="checkbox"
                id="rememberMe"
                name="rememberMe"
                checked={formData.rememberMe}
                onChange={handleChange}
                disabled={isLoading}
              />
              <label htmlFor="rememberMe">Remember me</label>
            </div>
            <Link
              to="/reset-password"
              className="forgot-password medium-link"
              style={{ color: '#3366cc', fontWeight: 600, fontSize: 14 }}
            >
              Forgot password?
            </Link>
          </div>
          <button
            type="submit"
            className={`auth-button medium-btn${isLoading ? " loading" : ""}`}
            disabled={isLoading}
          >
            {isLoading ? (
              <>
                <span className="loader"></span> Logging in...
              </>
            ) : (
              "Sign in"
            )}
          </button>
        </form>
      </AuthRightSection>
    </div>
  );
};

export default Login;
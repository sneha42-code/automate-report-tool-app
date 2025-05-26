// src/pages/Signup.jsx
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";
import Head3D from "../components/SimpleNeuralNetwork";
import AuthLeftSection from "../components/AuthLeftSection";
import AuthRightSection from "../components/AuthRightSection";

const Signup = () => {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    password: "",
    confirmPassword: "",
    agreeToTerms: false,
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
    // Clear error when user starts typing
    if (errors[name]) {
      setErrors({
        ...errors,
        [name]: "",
      });
    }
  };

  const validateForm = () => {
    const newErrors = {};
    
    // Full name validation
    if (!formData.fullName.trim()) {
      newErrors.fullName = "Full name is required";
    }
    
    // Email validation
    if (!formData.email) {
      newErrors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = "Email address is invalid";
    }
    
    // Password validation
    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }
    
    // Confirm password validation
    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Please confirm your password";
    } else if (formData.confirmPassword !== formData.password) {
      newErrors.confirmPassword = "Passwords do not match";
    }
    
    // Terms agreement validation
    if (!formData.agreeToTerms) {
      newErrors.agreeToTerms = "You must agree to the terms and conditions";
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
      // Replace with your real API endpoint
      await axios.post("/api/auth/signup", {
        fullName: formData.fullName,
        email: formData.email,
        password: formData.password,
      });
      localStorage.setItem("registrationSuccess", "true");
      navigate("/login", {
        state: {
          message: "Registration successful! Please log in with your new account.",
        },
      });
    } catch (error) {
      setErrors({
        general:
          error.response?.data?.message ||
          "Registration failed. Please try again later.",
      });
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
        {/* Centered Auth Card */}
        <div>
          <div className="auth-header medium-header">
            <h1 className="medium-title">Create your account</h1>
            <p className="auth-subtitle medium-subtitle">
              Join us and start generating professional AI-powered reports with ease.
            </p>
          </div>
          {errors.general && (
            <div className="auth-error-message" style={{ textAlign: 'left' }}>{errors.general}</div>
          )}
          <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group medium-form-group">
              <label htmlFor="fullName" className="medium-label">Full Name</label>
              <input
                type="text"
                id="fullName"
                name="fullName"
                value={formData.fullName}
                onChange={handleChange}
                placeholder="Enter your full name"
                className={`medium-input${errors.fullName ? ' error' : ''}`}
                disabled={isLoading}
                autoComplete="name"
              />
              {errors.fullName && (
                <div className="field-error medium-error">{errors.fullName}</div>
              )}
            </div>
            <div className="form-group medium-form-group">
              <label htmlFor="email" className="medium-label">Email Address</label>
              <input
                type="email"
                id="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`medium-input${errors.email ? ' error' : ''}`}
                disabled={isLoading}
                autoComplete="email"
              />
              {errors.email && <div className="field-error medium-error">{errors.email}</div>}
            </div>
            <div className="form-group medium-form-group">
              <label htmlFor="password" className="medium-label">Password</label>
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="Create a password"
                className={`medium-input${errors.password ? ' error' : ''}`}
                disabled={isLoading}
                autoComplete="new-password"
              />
              {errors.password && (
                <div className="field-error medium-error">{errors.password}</div>
              )}
            </div>
            <div className="form-group medium-form-group">
              <label htmlFor="confirmPassword" className="medium-label">Confirm Password</label>
              <input
                type="password"
                id="confirmPassword"
                name="confirmPassword"
                value={formData.confirmPassword}
                onChange={handleChange}
                placeholder="Confirm your password"
                className={`medium-input${errors.confirmPassword ? ' error' : ''}`}
                disabled={isLoading}
                autoComplete="new-password"
              />
              {errors.confirmPassword && (
                <div className="field-error medium-error">{errors.confirmPassword}</div>
              )}
            </div>
            <div className="terms-agreement" style={{ marginBottom: 24 }}>
              <input
                type="checkbox"
                id="agreeToTerms"
                name="agreeToTerms"
                checked={formData.agreeToTerms}
                onChange={handleChange}
                disabled={isLoading}
              />
              <label htmlFor="agreeToTerms" className="medium-terms-label">
                I agree to the{' '}
                <Link to="/terms" className="auth-link medium-link">
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link to="/privacy" className="auth-link medium-link">
                  Privacy Policy
                </Link>
              </label>
              {errors.agreeToTerms && (
                <div className="field-error medium-error">{errors.agreeToTerms}</div>
              )}
            </div>
            <button
              type="submit"
              className={`auth-button medium-btn${isLoading ? ' loading' : ''}`}
              disabled={isLoading}
            >
              {isLoading ? <><span className="loader"></span> Creating account...</> : "Sign up"}
            </button>
          </form>
          <div className="auth-footer medium-footer">
            <span>Already have an account? </span>
            <Link to="/login" className="auth-link medium-link">Sign in</Link>
          </div>
        </div>
      </AuthRightSection>
    </div>
  );
};

export default Signup;
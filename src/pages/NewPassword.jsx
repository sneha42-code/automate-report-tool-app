// src/pages/NewPassword.jsx
import React, { useState, useEffect } from "react";
import { Link, useNavigate, useSearchParams } from "react-router-dom";
import authService from "../service/authService";
import "../styles/Auth.css";
import Head3D from "../components/SimpleNeuralNetwork";
import AuthLeftSection from "../components/AuthLeftSection";
import AuthRightSection from "../components/AuthRightSection";

const NewPassword = () => {
  const [formData, setFormData] = useState({
    password: "",
    confirmPassword: "",
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [resetSuccess, setResetSuccess] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  
  const token = searchParams.get('token');

  useEffect(() => {
    if (!token) {
      navigate('/login');
    }
  }, [token, navigate]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
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
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) {
      return;
    }
    
    setIsLoading(true);
    setErrors({});
    
    try {
      const response = await authService.resetPassword({
        token: token,
        newPassword: formData.password,
      });

      if (response.success) {
        setResetSuccess(true);
        // Redirect to login after 3 seconds
        setTimeout(() => {
          navigate('/login', {
            state: {
              message: "Password reset successful! Please log in with your new password.",
            },
          });
        }, 3000);
      } else {
        setErrors({
          general: response.message || "Password reset failed. The link may be expired or invalid.",
        });
      }
    } catch (error) {
      console.error("Password reset error:", error);
      setErrors({
        general: "Password reset failed. Please try again or request a new reset link.",
      });
    } finally {
      setIsLoading(false);
    }
  };

  if (resetSuccess) {
    return (
      <div className="auth-page medium-bg" style={{ display: 'flex', minHeight: '100vh', alignItems: 'stretch', justifyContent: 'center', background: '#f7fafd' }}>
        <AuthLeftSection>
          <Head3D />
        </AuthLeftSection>
        <AuthRightSection>
          <div className="auth-header medium-header">
            <h1 className="medium-title">Password Reset Successful!</h1>
            <p className="auth-subtitle medium-subtitle">
              Your password has been successfully reset. You will be redirected to the login page in a few seconds.
            </p>
          </div>
          <div className="auth-error-message medium-success">
            Password updated successfully! Redirecting to login...
          </div>
          <div className="auth-footer medium-footer">
            <Link to="/login" className="auth-link medium-link">Go to Login</Link>
          </div>
        </AuthRightSection>
      </div>
    );
  }

  return (
    <div className="auth-page medium-bg" style={{ display: 'flex', minHeight: '100vh', alignItems: 'stretch', justifyContent: 'center', background: '#f7fafd' }}>
      <AuthLeftSection>
        <Head3D />
      </AuthLeftSection>
      <AuthRightSection>
        <div className="auth-header medium-header">
          <h1 className="medium-title">Set New Password</h1>
          <p className="auth-subtitle medium-subtitle">
            Enter your new password below to complete the reset process.
          </p>
        </div>
        {errors.general && (
          <div className="auth-error-message" style={{ textAlign: 'left' }}>
            {errors.general}
          </div>
        )}
        <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
          <div className="form-group medium-form-group">
            <label htmlFor="password" className="medium-label">New Password</label>
            <input
              type="password"
              id="password"
              name="password"
              value={formData.password}
              onChange={handleChange}
              placeholder="Enter your new password"
              className={`medium-input${errors.password ? ' error' : ''}`}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.password && (
              <div className="field-error medium-error">{errors.password}</div>
            )}
          </div>
          <div className="form-group medium-form-group">
            <label htmlFor="confirmPassword" className="medium-label">Confirm New Password</label>
            <input
              type="password"
              id="confirmPassword"
              name="confirmPassword"
              value={formData.confirmPassword}
              onChange={handleChange}
              placeholder="Confirm your new password"
              className={`medium-input${errors.confirmPassword ? ' error' : ''}`}
              disabled={isLoading}
              autoComplete="new-password"
            />
            {errors.confirmPassword && (
              <div className="field-error medium-error">{errors.confirmPassword}</div>
            )}
          </div>
          <button
            type="submit"
            className={`auth-button medium-btn${isLoading ? ' loading' : ''}`}
            disabled={isLoading}
          >
            {isLoading ? <><span className="loader"></span> Updating password...</> : "Update Password"}
          </button>
        </form>
        <div className="auth-footer medium-footer">
          <Link to="/login" className="auth-link medium-link">Back to Login</Link>
        </div>
      </AuthRightSection>
    </div>
  );
};

export default NewPassword;
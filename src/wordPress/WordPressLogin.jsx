import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import WordPressAuthService from "./wordPressAuthService";
import WordPressUserService from "./wordPressUserService";
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react';
import "../styles/WordPressLogin.css";

const WPLoginPage = () => {
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [formData, setFormData] = useState({
    username: "",
    password: "",
    email: "",
    firstName: "",
    lastName: "",
    role: "author",
    sendEmail: true,
  });
  const [errors, setErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [successMessage, setSuccessMessage] = useState("");
  const navigate = useNavigate();

  const validateForm = () => {
    const newErrors = {};

    if (!formData.username.trim()) {
      newErrors.username = "Username is required";
    } else if (formData.username.length < 3) {
      newErrors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(formData.username)) {
      newErrors.username = "Username can only contain letters, numbers, hyphens, and underscores";
    }

    if (!formData.password) {
      newErrors.password = "Password is required";
    } else if (formData.password.length < 8) {
      newErrors.password = "Password must be at least 8 characters";
    }

    if (isCreateMode) {
      if (!formData.email.trim()) {
        newErrors.email = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = "Email is invalid";
      }

      if (!formData.firstName.trim()) {
        newErrors.firstName = "First name is required";
      }

      if (!formData.lastName.trim()) {
        newErrors.lastName = "Last name is required";
      }
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    const newValue = type === "checkbox" ? checked : value;
    setFormData((prev) => ({ ...prev, [name]: newValue }));
    setErrors((prev) => ({ ...prev, [name]: "" }));
    setSuccessMessage("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      return;
    }

    setIsLoading(true);
    setErrors({});
    setSuccessMessage("");

    try {
      if (isCreateMode) {
        const userData = {
          username: formData.username,
          email: formData.email,
          firstName: formData.firstName,
          lastName: formData.lastName,
          password: formData.password,
          role: formData.role,
          sendEmail: formData.sendEmail,
        };

        const newUser = await WordPressUserService.createUser(userData);
        setSuccessMessage(`User ${newUser.username} created successfully! You can now log in.`);
        setIsCreateMode(false);
        setFormData({
          username: "",
          password: "",
          email: "",
          firstName: "",
          lastName: "",
          role: "author",
          sendEmail: true,
        });
      } else {
        const response = await WordPressAuthService.login(formData.username, formData.password);
        if (response.success) {
          navigate("/blog/create");
        } else {
          setErrors({ general: response.message || "Login failed" });
        }
      }
    } catch (err) {
      setErrors({ general: err.message || (isCreateMode ? "User creation failed" : "Login failed") });
    } finally {
      setIsLoading(false);
    }
  };

  const toggleMode = () => {
    setIsCreateMode(!isCreateMode);
    setErrors({});
    setSuccessMessage("");
    setFormData({
      username: "",
      password: "",
      email: "",
      firstName: "",
      lastName: "",
      role: "author",
      sendEmail: true,
    });
  };

  return (
    <div className="login-container">
      <div className="form-card">
        <h2 className="form-heading">
          {isCreateMode ? (
            <>
              <User size={24} />
              Create WordPress Account
            </>
          ) : (
            <>
              <Lock size={24} />
              Login to WordPress
            </>
          )}
        </h2>

        {errors.general && (
          <div className="error-message">
            <AlertCircle size={20} />
            <p>{errors.general}</p>
          </div>
        )}

        {successMessage && (
          <div className="success-message">
            <CheckCircle size={20} />
            <p>{successMessage}</p>
          </div>
        )}

        <form onSubmit={handleSubmit} className="form">
          {/* Username */}
          <div className="input-group">
            <label htmlFor="username" className="form-label">
              Username *
            </label>
            <div className="input-group">
              <User className="input-icon" size={20} />
              <input
                type="text"
                id="username"
                name="username"
                value={formData.username}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`form-input ${errors.username ? 'form-input-error' : ''}`}
                placeholder="Enter username"
                required
              />
            </div>
            {errors.username && <p className="error-text">{errors.username}</p>}
          </div>

          {/* Password */}
          <div className="input-group">
            <label htmlFor="password" className="form-label">
              {isCreateMode ? "Password *" : "Application Password *"}
            </label>
            <div className="input-group">
              <Lock className="input-icon" size={20} />
              <input
                type="password"
                id="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                disabled={isLoading}
                className={`form-input ${errors.password ? 'form-input-error' : ''}`}
                placeholder={isCreateMode ? "Enter password" : "xxxx xxxx xxxx xxxx"}
                required
              />
            </div>
            {errors.password && <p className="error-text">{errors.password}</p>}
            {!isCreateMode && (
              <p className="helper-text">
                Use an Application Password from WordPress Admin → Users → Your Profile
              </p>
            )}
          </div>

          {isCreateMode && (
            <>
              {/* Email */}
              <div className="input-group">
                <label htmlFor="email" className="form-label">
                  Email Address *
                </label>
                <div className="input-group">
                  <Mail className="input-icon" size={20} />
                  <input
                    type="email"
                    id="email"
                    name="email"
                    value={formData.email}
                    onChange={handleInputChange}
                    disabled={isLoading}
                    className={`form-input ${errors.email ? 'form-input-error' : ''}`}
                    placeholder="Enter email"
                    required
                  />
                </div>
                {errors.email && <p className="error-text">{errors.email}</p>}
              </div>

              {/* First Name */}
              <div className="input-group">
                <label htmlFor="firstName" className="form-label">
                  First Name *
                </label>
                <input
                  type="text"
                  id="firstName"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`form-input ${errors.firstName ? 'form-input-error' : ''}`}
                  placeholder="Enter first name"
                  required
                />
                {errors.firstName && <p className="error-text">{errors.firstName}</p>}
              </div>

              {/* Last Name */}
              <div className="input-group">
                <label htmlFor="lastName" className="form-label">
                  Last Name *
                </label>
                <input
                  type="text"
                  id="lastName"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className={`form-input ${errors.lastName ? 'form-input-error' : ''}`}
                  placeholder="Enter last name"
                  required
                />
                {errors.lastName && <p className="error-text">{errors.lastName}</p>}
              </div>

              {/* Role Selection */}
              <div className="input-group">
                <label htmlFor="role" className="form-label">
                  User Role *
                </label>
                <select
                  id="role"
                  name="role"
                  value={formData.role}
                  onChange={handleInputChange}
                  disabled={isLoading}
                  className="dropdown-select"
                >
                  {WordPressUserService.getAvailableRoles().map((role) => (
                    <option key={role.value} value={role.value}>
                      {role.label} - {role.description}
                    </option>
                  ))}
                </select>
              </div>

              {/* Send Email Notification */}
              <div className="checkbox-group">
                <div className="custom-checkbox">
                  <input
                    type="checkbox"
                    id="sendEmail"
                    name="sendEmail"
                    checked={formData.sendEmail}
                    onChange={handleInputChange}
                    disabled={isLoading}
                  />
                </div>
                <label htmlFor="sendEmail" className="checkbox-label">
                  Send login credentials via email
                </label>
              </div>
            </>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isLoading}
            className="submit-button"
          >
            {isLoading ? (
              <div className="spinner"></div>
            ) : isCreateMode ? (
              <>
                <User size={20} />
                Create Account
              </>
            ) : (
              <>
                <Lock size={20} />
                Login
              </>
            )}
          </button>
        </form>

        {/* Toggle Mode */}
        <div className="toggle-mode">
          <button
            onClick={toggleMode}
            className="toggle-mode-btn"
            disabled={isLoading}
          >
            {isCreateMode ? "Already have an account? Login" : "Don't have an account? Create one"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default WPLoginPage;
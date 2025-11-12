// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import AuthService from "../service/authService";
import "../styles/Auth.css";
import AuthLeftSection from "../components/AuthLeftSection";
import AuthRightSection from "../components/AuthRightSection";

const ResetPassword = () => {
  const [email, setEmail] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  const handleChange = (e) => {
    setEmail(e.target.value);
    if (error) setError("");
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!email || !/\S+@\S+\.\S+/.test(email)) {
      setError("Please enter a valid email address.");
      return;
    }
    
    setIsLoading(true);
    setError("");
    
    try {
      const response = await AuthService.forgotPassword(email);
      
      if (response.success) {
        setSubmitted(true);
        setError("");
      } else {
        setError(response.message || "Failed to send reset link. Please try again later.");
      }
    } catch (err) {
      console.error("Reset password error:", err);
      setError("Failed to send reset link. Please try again later.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="auth-page medium-bg" >
      <AuthLeftSection>
       
      </AuthLeftSection>
      <AuthRightSection>
        <div className="auth-header medium-header">
          <h1 className="medium-title">Reset your password</h1>
          <p className="auth-subtitle medium-subtitle">
            Enter your email address and we'll send you a link to reset your password.
          </p>
        </div>
        {submitted ? (
          <div className="auth-error-message medium-success">
            If an account exists for <b>{email}</b>, a reset link has been sent.
          </div>
        ) : (
          <form className="auth-form" onSubmit={handleSubmit} autoComplete="off">
            <div className="form-group medium-form-group">
              <label htmlFor="resetEmail" className="medium-label">Email Address</label>
              <input
                type="email"
                id="resetEmail"
                name="resetEmail"
                value={email}
                onChange={handleChange}
                placeholder="Enter your email"
                className={`medium-input${error ? ' error' : ''}`}
                disabled={isLoading}
                autoComplete="email"
              />
              {error && <div className="field-error medium-error">{error}</div>}
            </div>
            <button type="submit" className={`auth-button medium-btn${isLoading ? ' loading' : ''}`} disabled={isLoading}>
              {isLoading ? <><span className="loader"></span> Sending...</> : "Send reset link"}
            </button>
          </form>
        )}
        <div className="auth-footer medium-footer">
          <Link to="/login" className="auth-link medium-link">Back to sign in</Link>
        </div>
      </AuthRightSection>
    </div>
  );
};

export default ResetPassword;
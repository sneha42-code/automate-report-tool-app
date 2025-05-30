// src/pages/ResetPassword.jsx
import React, { useState } from "react";
import { Link } from "react-router-dom";
import axios from "axios";
import "../styles/Auth.css";
import Head3D from "../components/SimpleNeuralNetwork";
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
    try {
      // Replace with your real API endpoint
      await axios.post("/api/auth/forgot-password", { email });
      setSubmitted(true);
      setError("");
    } catch (err) {
      setError(
        err.response?.data?.message ||
          "Failed to send reset link. Please try again later."
      );
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
          <h1 className="medium-title">Reset your password</h1>
          <p className="auth-subtitle medium-subtitle">
            Enter your email address and we’ll send you a link to reset your password.
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

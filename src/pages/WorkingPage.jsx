// src/pages/NotFound.jsx
import React from "react";
import { Link } from "react-router-dom";
import notfoundImg from "../image/notfound.svg";

const WorkingPage = () => {
  return (
    <div className="auth-page">
      <div className="auth-container" style={{ textAlign: "center" }}>
        <div style={{ marginBottom: "40px" }}>
          <img
            src={notfoundImg}
            alt="Page not found illustration"
            style={{ maxWidth: "100%", height: "auto" }}
          />
        </div>

        <div>
          <Link
            to="/"
            style={{
              backgroundColor: "#F08080",
              color: "white",
              padding: "12px 24px",
              borderRadius: "4px",
              textDecoration: "none",
              display: "inline-block",
              fontWeight: "500",
              marginRight: "12px",
            }}
          >
            Go to Home
          </Link>

          <Link
            to="/documentation"
            style={{
              backgroundColor: "white",
              color: "#F08080",
              padding: "12px 24px",
              borderRadius: "4px",
              textDecoration: "none",
              display: "inline-block",
              fontWeight: "500",
              border: "1px solid #F08080",
            }}
          >
            View Documentation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default WorkingPage;

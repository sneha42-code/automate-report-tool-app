import React from "react";
import { Link } from "react-router-dom";
import notfoundImg from "../image/notfound.svg";
import "../styles/NotFound.css";

const NotFound = () => {
  return (
    <div className="auth-page">
      <div className="auth-container">
        <div className="notfound-image">
          <img
            src={notfoundImg}
            alt="Page not found illustration"
          />
        </div>
        
        <div className="notfound-links">
          <Link to="/" className="btn btn-primary">
            Go Home
          </Link>
          
          <Link to="/documentation" className="btn btn-secondary">
            View Documentation
          </Link>
        </div>
      </div>
    </div>
  );
};

export default NotFound;
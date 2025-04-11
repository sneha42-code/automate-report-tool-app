// src/pages/MinimalDocumentation.jsx
import React from "react";
import { Link } from "react-router-dom";
import "../styles/Documentation.css";

const MinimalDocumentation = () => {
  return (
    <div className="documentation-page">
      <div className="container">
        <h1>Attrition Analysis Tool Guide</h1>

        <div className="documentation-content">
          <div className="doc-section">
            <h2>How to Use</h2>
            <ol>
              <li>Upload Excel file (.xlsx, max 10MB)</li>
              <li>Generate report</li>
              <li>Download results</li>
            </ol>

            <Link to="/tool" className="cta-button">
              Start Now
            </Link>
          </div>

          <div className="doc-section">
            <h2>Required Data</h2>
            <ul>
              <li>Employee Name</li>
              <li>Gender</li>
              <li>Job Location</li>
              <li>Function</li>
              <li>Grade</li>
              <li>Date of Joining</li>
              <li>Action Type</li>
              <li>Action Date</li>
            </ul>
          </div>

          <div className="doc-section">
            <h2>Help</h2>
            <p>Contact: </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MinimalDocumentation;

// src/pages/ReportViewer.jsx
import React, { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import HtmlReportService from "../service/HtmlReportService";
import "../styles/Dashboard.css";

const ReportViewer = () => {
  const { fileId, filename } = useParams();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [htmlContent, setHtmlContent] = useState(null);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchReport = async () => {
      if (!fileId || !filename) {
        setError("Invalid report parameters");
        setIsLoading(false);
        return;
      }

      try {
        // Get the report view URL
        const viewUrl = HtmlReportService.getViewUrl(fileId, filename);
        
        // Option 1: Fetch the HTML content directly (if CORS allows)
        const response = await fetch(viewUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch report: ${response.statusText}`);
        }
        
        const html = await response.text();
        setHtmlContent(html);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching report:", err);
        setError("Failed to load the report. Please try again.");
        setIsLoading(false);
      }
    };

    fetchReport();
  }, [fileId, filename]);

  const handleBackClick = () => {
    navigate(-1); // Go back to previous page
  };

  if (isLoading) {
    return (
      <div className="report-viewer-container">
        <div className="loading-indicator">
          <div className="spinner"></div>
          <p>Loading report...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="report-viewer-container">
        <div className="error-message">
          <h2>Error Loading Report</h2>
          <p>{error}</p>
          <button className="back-button" onClick={handleBackClick}>
            Back
          </button>
        </div>
      </div>
    );
  }

  // Option 1: Display the HTML content directly in an iframe
  return (
    <div className="report-viewer-container">
      <div className="report-viewer-header">
        <button className="back-button" onClick={handleBackClick}>
          ← Back
        </button>
        <h1>Report Viewer</h1>
        <a
          href={reportService.getViewUrl(fileId, filename)}
          target="_blank"
          rel="noopener noreferrer"
          className="download-button"
        >
          Download
        </a>
      </div>
      
      {/* Option 1: Using iframe with srcdoc */}
      <div className="report-content">
        <iframe
          title="Report Viewer"
          srcDoc={htmlContent}
          className="report-iframe"
          sandbox="allow-scripts"
        ></iframe>
      </div>
      
      {/* Option 2: Using iframe with direct URL */}
      {/* Uncomment this and comment out the above iframe if you prefer to use direct URL */}
      {/* 
      <div className="report-content">
        <iframe
          title="Report Viewer"
          src={reportService.getViewUrl(fileId, filename)}
          className="report-iframe"
        ></iframe>
      </div>
      */}
    </div>
  );
};

export default ReportViewer;
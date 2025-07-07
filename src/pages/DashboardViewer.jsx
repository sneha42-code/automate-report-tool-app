// src/pages/DashboardViewer.jsx
import React, { useState, useEffect, useRef } from "react";
import { useParams, useNavigate, useLocation } from "react-router-dom";
import SlicerReportService from "../service/SlicerReportService";
import "../styles/DashboardViewer.css";

const DashboardViewer = () => {
  const { fileId, filename } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [htmlContent, setHtmlContent] = useState(null);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const iframeRef = useRef(null);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchDashboard = async () => {
      // Check if we have the content passed via state (from the tool)
      if (location.state && location.state.dashboardContent) {
        setHtmlContent(location.state.dashboardContent);
        setIsLoading(false);
        return;
      }

      // Otherwise, fetch from the API
      if (!fileId || !filename) {
        setError("Invalid dashboard parameters. Please generate a new dashboard.");
        setIsLoading(false);
        return;
      }

      try {
        const viewUrl = SlicerReportService.getViewUrl(fileId, filename);
        
        // Fetch the HTML content
        const response = await fetch(viewUrl);
        
        if (!response.ok) {
          throw new Error(`Failed to fetch dashboard: ${response.statusText}`);
        }
        
        const html = await response.text();
        setHtmlContent(html);
        setIsLoading(false);
      } catch (err) {
        console.error("Error fetching dashboard:", err);
        setError("Failed to load the dashboard. The file may have expired or been moved.");
        setIsLoading(false);
      }
    };

    fetchDashboard();
  }, [fileId, filename, location.state]);

  const handleBackClick = () => {
    navigate(-1);
  };

  const handleDownloadClick = () => {
    if (fileId && filename) {
      SlicerReportService.downloadReport(fileId, filename);
    }
  };

  const handleFullscreenToggle = () => {
    if (!isFullscreen) {
      if (containerRef.current.requestFullscreen) {
        containerRef.current.requestFullscreen();
      } else if (containerRef.current.webkitRequestFullscreen) {
        containerRef.current.webkitRequestFullscreen();
      } else if (containerRef.current.msRequestFullscreen) {
        containerRef.current.msRequestFullscreen();
      }
    } else {
      if (document.exitFullscreen) {
        document.exitFullscreen();
      } else if (document.webkitExitFullscreen) {
        document.webkitExitFullscreen();
      } else if (document.msExitFullscreen) {
        document.msExitFullscreen();
      }
    }
  };

  const handleRefreshClick = () => {
    if (iframeRef.current) {
      iframeRef.current.contentWindow.location.reload();
    }
  };

  const handleOpenInNewTab = () => {
    if (fileId && filename) {
      const url = SlicerReportService.getViewUrl(fileId, filename);
      window.open(url, '_blank');
    }
  };

  // Listen for fullscreen changes
  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(
        document.fullscreenElement === containerRef.current ||
        document.webkitFullscreenElement === containerRef.current ||
        document.msFullscreenElement === containerRef.current
      );
    };

    document.addEventListener('fullscreenchange', handleFullscreenChange);
    document.addEventListener('webkitfullscreenchange', handleFullscreenChange);
    document.addEventListener('msfullscreenchange', handleFullscreenChange);

    return () => {
      document.removeEventListener('fullscreenchange', handleFullscreenChange);
      document.removeEventListener('webkitfullscreenchange', handleFullscreenChange);
      document.removeEventListener('msfullscreenchange', handleFullscreenChange);
    };
  }, []);

  if (isLoading) {
    return (
      <div className="dashboard-viewer-container">
        <div className="dashboard-loading-indicator">
          <div className="dashboard-spinner"></div>
          <h2>Loading Interactive Dashboard</h2>
          <p>Please wait while we prepare your attrition analysis dashboard...</p>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="dashboard-viewer-container">
        <div className="dashboard-error-message">
          <div className="error-icon">
            <svg xmlns="http://www.w3.org/2000/svg" width="64" height="64" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <circle cx="12" cy="12" r="10"></circle>
              <line x1="15" y1="9" x2="9" y2="15"></line>
              <line x1="9" y1="9" x2="15" y2="15"></line>
            </svg>
          </div>
          <h2>Dashboard Not Available</h2>
          <p>{error}</p>
          <div className="error-actions">
            <button className="dashboard-back-button" onClick={handleBackClick}>
              ← Go Back
            </button>
            <button className="dashboard-retry-button" onClick={() => window.location.reload()}>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`dashboard-viewer-container ${isFullscreen ? 'fullscreen' : ''}`} ref={containerRef}>
      <div className="dashboard-viewer-header">
        <div className="header-left">
          <button className="dashboard-back-button" onClick={handleBackClick}>
            ← Back
          </button>
          <div className="dashboard-info">
            <h1>Interactive Attrition Dashboard</h1>
            <span className="dashboard-subtitle">Use filters and controls to explore your data</span>
          </div>
        </div>
        
        <div className="header-actions">
          <button 
            className="dashboard-action-btn refresh-btn" 
            onClick={handleRefreshClick}
            title="Refresh Dashboard"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <polyline points="23 4 23 10 17 10"></polyline>
              <polyline points="1 20 1 14 7 14"></polyline>
              <path d="m3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path>
            </svg>
          </button>
          
          <button 
            className="dashboard-action-btn new-tab-btn" 
            onClick={handleOpenInNewTab}
            title="Open in New Tab"
          >
            <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M18 13v6a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V8a2 2 0 0 1 2-2h6"></path>
              <polyline points="15,3 21,3 21,9"></polyline>
              <line x1="10" y1="14" x2="21" y2="3"></line>
            </svg>
          </button>
          
          <button 
            className="dashboard-action-btn fullscreen-btn" 
            onClick={handleFullscreenToggle}
            title={isFullscreen ? "Exit Fullscreen" : "Enter Fullscreen"}
          >
            {isFullscreen ? (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3v3a2 2 0 0 1-2 2H3m18 0h-3a2 2 0 0 1-2-2V3m0 18v-3a2 2 0 0 1 2-2h3M3 16h3a2 2 0 0 1 2 2v3"></path>
              </svg>
            ) : (
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M8 3H5a2 2 0 0 0-2 2v3m18 0V5a2 2 0 0 0-2-2h-3m0 18h3a2 2 0 0 0 2-2v-3M3 16v3a2 2 0 0 0 2 2h3"></path>
              </svg>
            )}
          </button>
          
          {fileId && filename && (
            <button 
              className="dashboard-action-btn download-btn" 
              onClick={handleDownloadClick}
              title="Download Dashboard"
            >
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"></path>
                <polyline points="7,10 12,15 17,10"></polyline>
                <line x1="12" y1="15" x2="12" y2="3"></line>
              </svg>
            </button>
          )}
        </div>
      </div>
      
      <div className="dashboard-content">
        <iframe
          ref={iframeRef}
          title="Interactive Attrition Dashboard"
          srcDoc={htmlContent}
          className="dashboard-iframe"
          sandbox="allow-scripts allow-same-origin allow-forms"
          loading="lazy"
        />
      </div>
      
      <div className="dashboard-status-bar">
        <div className="status-left">
          <span className="status-indicator ready">●</span>
          <span>Dashboard Ready</span>
        </div>
        <div className="status-right">
          <span>Interactive Mode • Filters Available • Responsive Design</span>
        </div>
      </div>
    </div>
  );
};

export default DashboardViewer;
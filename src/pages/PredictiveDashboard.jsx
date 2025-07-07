import React, { useState, useEffect, useRef } from "react";
import { useLocation } from "react-router-dom";
import PredictiveService from "../service/PredictiveService";
import { validateFiles, formatFileSize } from "../utils/fileValidation";
import "../styles/PredictiveDashboard.css";

const PredictiveDashboard = () => {
  const location = useLocation();

  // State variables
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [error, setError] = useState(null);
  const [fileErrors, setFileErrors] = useState([]);
  const [apiStatus, setApiStatus] = useState({
    isOnline: true,
    message: "Predictive Analytics API connection established"
  });
  const [showSpecifications, setShowSpecifications] = useState(false);

  // Refs
  const fileInputRef = useRef(null);

  // Check API connection on mount
  // useEffect(() => {
  //   const checkConnection = async () => {
  //     try {
  //       await PredictiveService.checkHealth();
  //       setApiStatus({
  //         isOnline: true,
  //         message: "Predictive Analytics API connection established"
  //       });
  //     } catch (err) {
  //       console.error("Predictive API connection error:", err);
  //       setApiStatus({
  //         isOnline: false,
  //         message: "Could not connect to Predictive Analytics API. The service may be offline."
  //       });
  //     }
  //   };
  //   checkConnection();
  // }, []);

  // Check the current route and set showSpecifications
  useEffect(() => {
    if (location.pathname.startsWith("/tool")) {
      setShowSpecifications(true);
    } else {
      setShowSpecifications(false);
    }
  }, [location]);

  // File handling
  const handleFiles = async (files) => {
    if (!apiStatus.isOnline) {
      setError("Cannot upload files while Predictive Analytics API is offline. Please try again later.");
      return;
    }

    setError(null);
    setFileErrors([]);

    const validationResult = validateFiles(files);
    if (!validationResult.isValid) {
      setFileErrors(validationResult.errors);
      if (validationResult.validFiles.length === 0) return;
    }

    const validFiles = validationResult.validFiles;
    const newFiles = validFiles.map((file) => ({
      name: file.name,
      size: file.size,
      type: file.type,
      formattedSize: formatFileSize(file.size),
      status: "pending",
    }));

    setSelectedFiles((prev) => [...prev, ...newFiles]);
    setIsGenerating(true);
    setUploadProgress(0);

    try {
      const response = await PredictiveService.generateReport(validFiles[0], setUploadProgress);
      const filename = response.download_url.split('/').pop();
      
      setGeneratedReport({
        name: filename,
        size: "Unknown",
        date: new Date().toLocaleDateString(),
        url: PredictiveService.getDownloadUrl(filename),
        type: "word"
      });

      setSelectedFiles((prev) =>
        prev.map((file, index) =>
          index >= prev.length - validFiles.length
            ? { ...file, status: "processed" }
            : file
        )
      );
    } catch (err) {
      console.error("Report generation error:", err);
      setError(err.message || "Failed to generate report.");
      setSelectedFiles((prev) =>
        prev.map((file, index) =>
          index >= prev.length - validFiles.length ? { ...file, status: "failed" } : file
        )
      );
    } finally {
      setIsGenerating(false);
      setUploadProgress(100);
    }
  };

  // Drag and drop handlers
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add("drag-over");
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove("drag-over");
    if (e.dataTransfer.files?.length) handleFiles(e.dataTransfer.files);
  };

  const handleFileSelect = (e) => {
    if (e.target.files?.length) handleFiles(e.target.files);
  };

  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Download report
  const handleDownloadClick = async () => {
    if (!generatedReport) {
      setError("No report available to download.");
      return;
    }

    setError(null);

    try {
      PredictiveService.downloadReport(generatedReport.name);
    } catch (err) {
      console.error("Report download error:", err);
      setError(err.message || "Failed to download report.");
    }
  };

  // Remove file
  const handleRemoveFile = (index) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index));
    setGeneratedReport(null);
  };

  return (
    <div className="predictive-tool-container">
      <h1>Predictive Attrition Analytics</h1>
      <p>Upload your HRIS data to identify employees at high risk of attrition using machine learning predictions.</p>

      {!apiStatus.isOnline && (
        <div className="api-status-warning">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="24"
            height="24"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z" />
            <line x1="12" y1="9" x2="12" y2="13" />
            <line x1="12" y1="17" x2="12.01" y2="17" />
          </svg>
          <span>{apiStatus.message}</span>
        </div>
      )}

      <div className="platform-modules">
        <section className="data-module">
          <div className="module-header">
            <h3>Data Input — Predictive Analytics (DOCX Format)</h3>
            <p className="module-description">Upload Excel file containing HRIS data for predictive attrition analysis</p>
          </div>

          <div className="file-input-section">
            <div
              className="file-dropzone"
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onDrop={handleDrop}
              onClick={handleBrowseClick}
            >
              <div className="dropzone-icon">
                <svg
                  width="24"
                  height="24"
                  viewBox="0 0 24 24"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                    stroke="#2D3748"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M12 16V8"
                    stroke="#2D3748"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                  <path
                    d="M9 11L12 8L15 11"
                    stroke="#2D3748"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </div>
              <p className="dropzone-text">Drag & drop or click to select Excel file</p>
              <p className="dropzone-subtext">Excel format (.xlsx) required for predictive analysis</p>
              <input
                type="file"
                className="file-input"
                onChange={handleFileSelect}
                accept=".xlsx"
                disabled={isGenerating || !apiStatus.isOnline}
                ref={fileInputRef}
              />
            </div>
          </div>

          {fileErrors.length > 0 && (
            <div className="validation-alert">
              <div className="alert-header">File Validation Errors:</div>
              <ul className="alert-list">
                {fileErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          {error && <div className="system-alert">{error}</div>}

          {selectedFiles.length > 0 && (
            <div className="selected-files-panel">
              <div className="panel-header">Selected Files</div>
              {isGenerating && (
                <div className="upload-progress-indicator">
                  <div className="progress-bar">
                    <div
                      className="progress-completed"
                      style={{ width: `${uploadProgress}%` }}
                    />
                  </div>
                  <div className="progress-percentage">{uploadProgress}% Complete</div>
                </div>
              )}
              <table className="files-table">
                <thead>
                  <tr>
                    <th>Filename</th>
                    <th>Size</th>
                    <th>Status</th>
                    <th>Action</th>
                  </tr>
                </thead>
                <tbody>
                  {selectedFiles.map((file, index) => (
                    <tr key={index} className={file.status}>
                      <td className="file-name">{file.name}</td>
                      <td className="file-size">{file.formattedSize}</td>
                      <td className="file-status">
                        <span className={`status-${file.status}`}>
                          {file.status.charAt(0).toUpperCase() + file.status.slice(1)}
                        </span>
                      </td>
                      <td className="file-action">
                        <button
                          className="remove-file-btn"
                          onClick={() => handleRemoveFile(index)}
                          disabled={isGenerating}
                        >
                          Remove
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </section>

        <section className="analysis-module">
          <div className="module-header">
            <h3>Predictive Analytics Controls</h3>
            <p className="module-description">Generate predictive attrition reports using machine learning</p>
          </div>

          <div className="control-panel">
            <div className="control-actions">
              <button
                className={`control-btn retrieve-btn ${!generatedReport ? "disabled" : ""}`}
                onClick={handleDownloadClick}
                disabled={!generatedReport}
              >
                Download Report
              </button>
            </div>

            {generatedReport && (
              <div className="analysis-complete">
                <div className="complete-header">Predictive Analysis Summary</div>
                <div className="report-metadata">
                  <div className="metadata-item">
                    <span className="metadata-label">Document:</span>
                    <span className="metadata-value">{generatedReport.name}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Format:</span>
                    <span className="metadata-value">Microsoft Word</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Generated:</span>
                    <span className="metadata-value">{generatedReport.date}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Status:</span>
                    <span className="metadata-value status-complete">Complete</span>
                  </div>
                </div>
                <div className="report-description">
                  <p>The predictive analysis has been completed successfully. The report includes:</p>
                  <ul>
                    <li>Machine learning model performance metrics</li>
                    <li>High-risk employees (probability &gt; 70%)</li>
                    <li>Risk analysis by gender, location, function, and grade</li>
                    <li>Complete list of employees with attrition risk scores</li>
                  </ul>
                </div>
              </div>
            )}
          </div>
        </section>

        {showSpecifications && (
          <section className="specifications-module">
            <div className="module-header">
              <h3>Predictive Analytics Specifications</h3>
            </div>

            <div className="specifications-grid">
              <div className="specification-item">
                <div className="specification-title">Machine Learning Model</div>
                <div className="specification-content">
                  <p>Random Forest Classifier with 100 estimators</p>
                  <p>Features: Gender, Tenure, Function, Grade</p>
                </div>
              </div>

              <div className="specification-item">
                <div className="specification-title">Risk Threshold</div>
                <div className="specification-content">
                  <p>High-risk employees: Probability &gt; 70%</p>
                  <p>Sorted by descending attrition probability</p>
                </div>
              </div>

              <div className="specification-item">
                <div className="specification-title">Output Analysis</div>
                <div className="specification-content">
                  <p>Demographic risk breakdowns</p>
                  <p>Model performance metrics</p>
                </div>
              </div>

              <div className="specification-item">
                <div className="specification-title">Data Requirements</div>
                <div className="specification-content">
                  <p>Employee Name, Gender, Function, Grade</p>
                  <p>Date of Joining, Action Type, Action Date</p>
                </div>
              </div>
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default PredictiveDashboard;
// src/pages/SlicerAnalysisTool.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/SlicerAnalysisTool.css";
import {
  validateFiles,
  formatFileSize,
} from "../utils/fileValidation";
import SlicerReportService from "../service/slicerReportService";

const SlicerAnalysisTool = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State variables
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [error, setError] = useState(null);
  const [fileErrors, setFileErrors] = useState([]);
  const [fileId, setFileId] = useState(null);
  const [apiStatus, setApiStatus] = useState({
    isOnline: true,
    message: "API connection established"
  });
  const [showSpecifications, setShowSpecifications] = useState(false);

  // Refs
  const fileInputRef = useRef(null);

  const checkApiConnection = async () => {
    try {
      await fetch(process.env.REACT_APP_API_URL || "http://127.0.0.1:8001/api/");
      setApiStatus({
        isOnline: true,
        message: "API connection established"
      });
    } catch (err) {
      console.error("API connection error:", err);
      setApiStatus({
        isOnline: false,
        message: "Could not connect to analysis API. The report generation service may be offline."
      });
    }
  };

  // Check API connection on initial load
  useEffect(() => {
    checkApiConnection();
  }, []);

  // Check for any previously generated reports
  useEffect(() => {
    const fetchReports = async () => {
      if (!apiStatus.isOnline) return;

      try {
        const data = await SlicerReportService.getRecentReports();
        if (data && data.reports && data.reports.length > 0) {
          setGeneratedReport(data.reports[0]);
        }
      } catch (err) {
        console.error("Error fetching recent reports:", err);
      }
    };

    // Uncomment when API is ready
    // fetchReports();
  }, [apiStatus.isOnline]);

  // Check the current route and set showSpecifications accordingly
  useEffect(() => {
    if (location.pathname.startsWith("/tool")) {
      setShowSpecifications(true);
    } else {
      setShowSpecifications(false);
    }
  }, [location]);

  // Handle drag events for the drop zone
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
    
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      handleFiles(e.dataTransfer.files);
    }
  };

  const handleFileSelect = (event) => {
    if (event.target.files) {
      handleFiles(event.target.files);
    }
  };

  const handleFiles = async (files) => {
    if (!apiStatus.isOnline) {
      setError("Cannot upload files while API is offline. Please try again later.");
      return;
    }
    
    // Reset errors
    setError(null);
    setFileErrors([]);

    // Validate files
    const validationResult = validateFiles(files);

    if (!validationResult.isValid) {
      setFileErrors(validationResult.errors);
      // Still allow valid files to be uploaded
      if (validationResult.validFiles.length === 0) {
        return; // No valid files to upload
      }
    }

    // Process only valid files
    const filesArray = validationResult.validFiles;

    // Update UI state immediately
    setSelectedFiles((previousFiles) => [
      ...previousFiles,
      ...filesArray.map((file) => ({
        name: file.name,
        size: file.size,
        type: file.type,
        formattedSize: formatFileSize(file.size),
        status: "pending",
      })),
    ]);

    setIsUploading(true);
    setUploadProgress(0);

    try {
      // Upload file to the server using the service
      const response = await SlicerReportService.uploadFile(
        filesArray[0], 
        (percentCompleted) => setUploadProgress(percentCompleted)
      );

      // Store the file_id returned from the backend
      setFileId(response.file_id);

      // File upload completed - update status
      setSelectedFiles((prev) =>
        prev.map((file, index) => {
          if (index >= prev.length - filesArray.length) {
            return { ...file, status: "uploaded", id: response.file_id };
          }
          return file;
        })
      );

      setIsUploading(false);
      setUploadProgress(100);
    } catch (err) {
      console.error("Error uploading files:", err);
      setError(err.message || "Failed to upload files. Please try again.");
      setIsUploading(false);

      // Mark failed files in the UI
      setSelectedFiles((prev) =>
        prev.map((file, index) => {
          if (index >= prev.length - filesArray.length) {
            return { ...file, status: "failed" };
          }
          return file;
        })
      );
    }
  };

  const handleGenerateClick = async () => {
    if (selectedFiles.length === 0 || !fileId) {
      setError("Please upload files before generating a report");
      return;
    }

    setIsGenerating(true);
    setError(null);
    
    try {
      // Call service to generate report using the file_id
      const response = await SlicerReportService.generateReport(fileId);

      // Report generation succeeded
      setIsGenerating(false);
      setGeneratedReport({
        id: fileId,
        name: response.report_file || "Interactive_Attrition_Dashboard.html",
        size: "Unknown", // Size info not provided by backend
        date: new Date().toLocaleDateString(),
        url: SlicerReportService.getDownloadUrl(fileId, response.report_file),
        viewUrl: SlicerReportService.getViewUrl(fileId, response.report_file),
      });
    } catch (err) {
      console.error("Error generating report:", err);
      setError(err.message || "Failed to generate report. Please try again.");
      setIsGenerating(false);
    }
  };

  const handleDownloadClick = async () => {
    if (!generatedReport) {
      setError("No report available to download. Please generate a report first.");
      return;
    }

    setError(null);

    try {
      if (generatedReport.url) {
        SlicerReportService.downloadReport(generatedReport.id, generatedReport.name);
      }
    } catch (err) {
      console.error("Error downloading report:", err);
      setError(err.message || "Failed to download report. Please try again.");
    }
  };

  const handleViewClick = () => {
    if (generatedReport && generatedReport.viewUrl) {
      // Navigate to the dashboard viewer component
      navigate(`/dashboard/view/${generatedReport.id}/${generatedReport.name}`, {
        state: {
          dashboardUrl: generatedReport.viewUrl,
          reportInfo: generatedReport
        }
      });
    }
  };

  const handleRemoveFile = (index) => {
    const fileToRemove = selectedFiles[index];

    // Remove from UI immediately
    setSelectedFiles((files) => files.filter((_, i) => i !== index));

    // If the file had the fileId, clear it
    if (fileToRemove.id === fileId) {
      setFileId(null);
    }
  };

  const handleBrowseClick = () => {
    // Trigger the hidden file input
    if (fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="slicer-tool-platform">
      <div className="slicer-analytics-platform">
        {!apiStatus.isOnline && (
          <div className="slicer-api-status-warning">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>{apiStatus.message}</span>
          </div>
        )}
        
        <div className="slicer-platform-modules">
          <section className="slicer-data-module">
            <div className="slicer-module-header">
              <h3>Data Input — Interactive Dashboard Output</h3>
              <p className="slicer-module-description">
                Upload Excel file to generate an interactive attrition analysis dashboard with filters and visualizations
              </p>
            </div>

            <div className="slicer-file-input-section">
              <div 
                className="slicer-file-dropzone"
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
                onDrop={handleDrop}
                onClick={handleBrowseClick}
              >
                <div className="slicer-dropzone-icon">
                  <svg
                    width="48"
                    height="48"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      d="M12 22C17.5228 22 22 17.5228 22 12C22 6.47715 17.5228 2 12 2C6.47715 2 2 6.47715 2 12C2 17.5228 6.47715 22 12 22Z"
                      stroke="#3366CC"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M12 16V8"
                      stroke="#3366CC"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                    <path
                      d="M9 11L12 8L15 11"
                      stroke="#3366CC"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </div>
                <p className="slicer-dropzone-text">Drag & drop or click to select Excel file</p>
                <p className="slicer-dropzone-subtext">Generate interactive dashboard with slicers and filters</p>
                <input
                  type="file"
                  className="slicer-file-input"
                  onChange={handleFileSelect}
                  accept=".xlsx"
                  disabled={isUploading || !apiStatus.isOnline}
                  ref={fileInputRef}
                />
              </div>
            </div>

            {fileErrors.length > 0 && (
              <div className="slicer-validation-alert">
                <div className="slicer-alert-header">File Validation Errors:</div>
                <ul className="slicer-alert-list">
                  {fileErrors.map((error, index) => (
                    <li key={index}>{error}</li>
                  ))}
                </ul>
              </div>
            )}

            {error && <div className="slicer-system-alert">{error}</div>}

            {selectedFiles.length > 0 && (
              <div className="slicer-selected-files-panel">
                <div className="slicer-panel-header">Selected Files</div>
                {isUploading && (
                  <div className="slicer-upload-progress-indicator">
                    <div className="slicer-progress-bar">
                      <div
                        className="slicer-progress-completed"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="slicer-progress-percentage">
                      {uploadProgress}% Complete
                    </div>
                  </div>
                )}
                <table className="slicer-files-table">
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
                          {file.status === "uploaded" && (
                            <span className="status-success">Uploaded</span>
                          )}
                          {file.status === "failed" && (
                            <span className="status-error">Failed</span>
                          )}
                          {file.status === "pending" && (
                            <span className="status-pending">Pending</span>
                          )}
                        </td>
                        <td className="file-action">
                          <button
                            className="slicer-remove-file-btn"
                            onClick={() => handleRemoveFile(index)}
                            disabled={isUploading}
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

          <section className="slicer-analysis-module">
            <div className="slicer-module-header">
              <h3>Interactive Dashboard Controls</h3>
              <p className="slicer-module-description">
                Generate and access your interactive attrition analysis dashboard
              </p>
            </div>

            <div className="slicer-control-panel">
              <div className="slicer-control-actions">
                <button
                  className={`slicer-control-btn slicer-analyze-btn ${
                    isGenerating ? "processing" : ""
                  } ${!fileId || !apiStatus.isOnline ? "disabled" : ""}`}
                  onClick={handleGenerateClick}
                  disabled={isGenerating || selectedFiles.length === 0 || !fileId || !apiStatus.isOnline}
                >
                  {isGenerating
                    ? "Creating Dashboard..."
                    : "Generate Interactive Dashboard"}
                </button>

                <button
                  className={`slicer-control-btn slicer-view-btn ${
                    !generatedReport ? "disabled" : ""
                  }`}
                  onClick={handleViewClick}
                  disabled={!generatedReport}
                >
                  Open Dashboard
                </button>

                <button
                  className={`slicer-control-btn slicer-retrieve-btn ${
                    !generatedReport ? "disabled" : ""
                  }`}
                  onClick={handleDownloadClick}
                  disabled={!generatedReport}
                >
                  Download Dashboard
                </button>
              </div>

              {generatedReport && (
                <div className="slicer-analysis-complete">
                  <div className="slicer-complete-header">Interactive Dashboard Ready</div>
                  <div className="slicer-report-metadata">
                    <div className="slicer-metadata-item">
                      <span className="slicer-metadata-label">Dashboard:</span>
                      <span className="slicer-metadata-value">
                        {generatedReport.name}
                      </span>
                    </div>
                    <div className="slicer-metadata-item">
                      <span className="slicer-metadata-label">Generated:</span>
                      <span className="slicer-metadata-value">
                        {generatedReport.date}
                      </span>
                    </div>
                    <div className="slicer-metadata-item">
                      <span className="slicer-metadata-label">Status:</span>
                      <span className="slicer-metadata-value slicer-status-complete">
                        Ready
                      </span>
                    </div>
                  </div>
                  <div className="slicer-report-description">
                    <p>Your interactive attrition analysis dashboard is ready! This comprehensive dashboard includes:</p>
                    <p>Click "Open Dashboard" to explore your data interactively, or "Download Dashboard" to save the HTML file.</p>
                  </div>
                </div>
              )}
            </div>
          </section>
        </div>
        
      </div>
    </div>
  );
};

export default SlicerAnalysisTool;
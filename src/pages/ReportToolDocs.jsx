import React, { useState, useEffect, useRef } from "react";
import "../styles/ReportToolDocs.css";
import { useLocation } from "react-router-dom";
import {
  validateFiles,
  formatFileSize,
} from "../utils/fileValidation";
import ReportService from "../service/DocsReportService";
import { checkApiConnection } from "../service/CheckApiConnection";

/**
 * ReportTool component for uploading files, generating reports, and downloading them.
 */
const ReportTool = () => {
  // State variables for managing file uploads, report generation, and errors
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [error, setError] = useState(null);
  const [fileErrors, setFileErrors] = useState([]);
  const [fileId, setFileId] = useState(null);
  const [showSpecifications, setShowSpecifications] = useState(false);
  const [apiStatus, setApiStatus] = useState({
    isOnline: true,
    message: "API connection established"
  });
  
  // Create a ref for the file input
  const fileInputRef = useRef(null);
  const location = useLocation();

  // Check the current route and set showSpecifications accordingly
  useEffect(() => {
    if (location.pathname.startsWith("/tool")) {
      setShowSpecifications(true);
    } else {
      setShowSpecifications(false);
    }
  }, [location]);

  /**
   * Handles clicking the dropzone to trigger file selection
   */
  const handleDropzoneClick = () => {
    if (fileInputRef.current && !isUploading) {
      fileInputRef.current.click();
    }
  };

  /**
   * Handles file upload and validates the selected files.
   * @param {Event} event - The file input change event
   */
  const handleFileUpload = async (event) => {
    if (event.target.files && event.target.files.length > 0) {
      setError(null);
      setFileErrors([]);

      const validationResult = validateFiles(event.target.files);

      if (!validationResult.isValid) {
        setFileErrors(validationResult.errors);
        if (validationResult.validFiles.length === 0) {
          // Clear the file input
          event.target.value = '';
          return;
        }
      }

      const filesArray = validationResult.validFiles;

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
        const response = await ReportService.uploadFile(
          filesArray[0],
          (percentCompleted) => setUploadProgress(percentCompleted)
        );

        setFileId(response.file_id);

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
        setError("Failed to upload files. Please try again.");
        setIsUploading(false);

        setSelectedFiles((prev) =>
          prev.map((file, index) => {
            if (index >= prev.length - filesArray.length) {
              return { ...file, status: "failed" };
            }
            return file;
          })
        );
      }

      // Clear the file input for next upload
      event.target.value = '';
    }
  };

  /**
   * Handles drag over event
   */
  const handleDragOver = (event) => {
    event.preventDefault();
    event.stopPropagation();
  };

  /**
   * Handles drop event
   */
  const handleDrop = async (event) => {
    event.preventDefault();
    event.stopPropagation();

    if (isUploading) return;

    const files = event.dataTransfer.files;
    if (files && files.length > 0) {
      // Create a synthetic event to reuse the existing upload logic
      const syntheticEvent = {
        target: {
          files: files,
          value: ''
        }
      };
      await handleFileUpload(syntheticEvent);
    }
  };

  /**
   * Initiates report generation for the uploaded file.
   */
  const handleGenerate = async () => {
    if (selectedFiles.length === 0 || !fileId) {
      setError("Please upload files before generating a report");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const response = await ReportService.generateReport(fileId);

      setIsGenerating(false);
      setGeneratedReport({
        id: response.file_id,
        name: response.report_file || "Attrition_Report.docx",
        size: "Unknown",
        date: new Date().toLocaleDateString(),
        url: ReportService.getDownloadUrl(response.file_id, response.report_file),
      });
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Failed to generate report. Please try again.");
      setIsGenerating(false);
    }
  };

  /**
   * Downloads the generated report.
   */
  const handleDownload = async () => {
    if (!generatedReport) {
      setError("No report available to download. Please generate a report first.");
      return;
    }

    setError(null);

    try {
      if (generatedReport.url) {
        window.open(generatedReport.url, "_blank");
      }
    } catch (err) {
      console.error("Error downloading report:", err);
      setError("Failed to download report. Please try again.");
    }
  };

  /**
   * Removes a selected file from the list.
   * @param {number} index - The index of the file to remove
   */
  const handleRemoveFile = async (index) => {
    const fileToRemove = selectedFiles[index];

    setSelectedFiles((files) => files.filter((_, i) => i !== index));

    if (fileToRemove.id === fileId) {
      setFileId(null);
      setGeneratedReport(null); // Clear generated report if removing the file it was based on
    }
  };

  const checkApiConnectionStatus = async () => {
    const result = await checkApiConnection();
    setApiStatus({
      isOnline: result.success,
      message: result.message
    });
  };

  // Check API connection on initial load
  useEffect(() => {
    checkApiConnectionStatus();
  }, []);

  return (
    <div className="tool-platform fade-in">
      <div className="analytics-platform">
        {!apiStatus.isOnline && (
          <div className="api-status-warning">
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
              <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"></path>
              <line x1="12" y1="9" x2="12" y2="13"></line>
              <line x1="12" y1="17" x2="12.01" y2="17"></line>
            </svg>
            <span>{apiStatus.message}</span>
          </div>
        )}

        <div className="platform-modules">
          <section className="data-module fade-in">
            <div className="module-header">
              <h3>Data Input --- Output (file format  * docs)</h3>
              <p className="module-description">
                Upload Excel file containing separation data
              </p>
            </div>

            <div className="file-input-section">
              <div 
                className={`file-dropzone ${isUploading ? 'disabled' : ''}`}
                onClick={handleDropzoneClick}
                onDragOver={handleDragOver}
                onDrop={handleDrop}
                style={{ cursor: isUploading ? 'not-allowed' : 'pointer' }}
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
                <p className="dropzone-text">
                  {isUploading ? 'Uploading...' : 'Click to select Excel file or drag and drop'}
                </p>
                <p className="dropzone-subtext">
                  Excel format (.xlsx) required
                </p>
                <input
                  ref={fileInputRef}
                  type="file"
                  className="file-input"
                  onChange={handleFileUpload}
                  accept=".xlsx"
                  disabled={isUploading}
                  style={{ display: 'none' }}
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
                {isUploading && (
                  <div className="upload-progress-indicator">
                    <div className="progress-bar">
                      <div
                        className="progress-completed"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <div className="progress-percentage">
                      {uploadProgress}% Complete
                    </div>
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
                          {file.status === "uploaded"
                            ? "Uploaded"
                            : file.status === "failed"
                            ? "Failed"
                            : "Pending"}
                        </td>
                        <td className="file-action">
                          <button
                            className="remove-file-btn"
                            onClick={() => handleRemoveFile(index)}
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

          <section className="analysis-module fade-in">
            <div className="module-header">
              <h3>Analysis Controls</h3>
              <p className="module-description">
                Generate and download reports
              </p>
            </div>

            <div className="control-panel">
              <div className="control-actions">
                <button
                  className={`control-btn analyze-btn ${
                    isGenerating ? "processing" : ""
                  } ${!fileId ? "disabled" : ""}`}
                  onClick={handleGenerate}
                  disabled={isGenerating || selectedFiles.length === 0 || !fileId}
                >
                  {isGenerating
                    ? "Processing Data..."
                    : "Generate Report"}
                </button>

                <button
                  className={`control-btn retrieve-btn ${
                    !generatedReport ? "disabled" : ""
                  }`}
                  onClick={handleDownload}
                  disabled={!generatedReport}
                >
                  Download Report
                </button>
              </div>

              {generatedReport && (
                <div className="analysis-complete">
                  <div className="complete-header">Analysis Summary</div>
                  <div className="report-metadata">
                    <div className="metadata-item">
                      <span className="metadata-label">Document:</span>
                      <span className="metadata-value">
                        {generatedReport.name}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Generated:</span>
                      <span className="metadata-value">
                        {generatedReport.date}
                      </span>
                    </div>
                    <div className="metadata-item">
                      <span className="metadata-label">Status:</span>
                      <span className="metadata-value status-complete">
                        Complete
                      </span>
                    </div>
                  </div>
                  <div className="report-description">
                    The analysis document has been generated successfully. Click
                    to download.
                  </div>
                </div>
              )}
            </div>
          </section>

          {/* Add a conditional rendering for the specifications module */}
          {showSpecifications && (
            <section className="specifications-module fade-in">
              <div className="module-header">
                <h3>System Specifications</h3>
              </div>

              <div className="specifications-grid">
                <div className="specification-item">
                  <div className="specification-title">File Requirements</div>
                  <div className="specification-content">
                    <p>XLSX format with standard data fields</p>
                    <p>Employee demographic and employment information</p>
                  </div>
                </div>

                <div className="specification-item">
                  <div className="specification-title">Analysis Parameters</div>
                  <div className="specification-content">
                    <p>Multi-dimensional attrition metrics</p>
                    <p>Demographic, department, and tenure segmentation</p>
                  </div>
                </div>

                <div className="specification-item">
                  <div className="specification-title">Output Format</div>
                  <div className="specification-content">
                    <p>Microsoft Word (.docx) document</p>
                    <p>Embedded visualizations and data tables</p>
                  </div>
                </div>

                <div className="specification-item">
                  <div className="specification-title">Data Security</div>
                  <div className="specification-content">
                    <p>Secure processing without persistent storage</p>
                    <p>Compliance with data protection regulations</p>
                  </div>
                </div>
              </div>
            </section>
          )}
        </div>
      </div>
    </div>
  );
};

export default ReportTool;
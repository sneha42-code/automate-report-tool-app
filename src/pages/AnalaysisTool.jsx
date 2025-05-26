import React, { useState, useEffect, useRef } from "react";
import ReportService from "../service/reportService";
import AttritionAnalysisService from "../service/attritionAnalysisService";
import HtmlReportService from "../service/htmlReportService";
import { validateFiles, formatFileSize } from "../utils/fileValidation";
import "../styles/AnalaysisTool.css";

const AnalaysisTool = () => {
  // State variables
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [error, setError] = useState(null);
  const [fileErrors, setFileErrors] = useState([]);
  const [fileId, setFileId] = useState(null);
  const [reportType, setReportType] = useState("docs");
  const [apiStatus, setApiStatus] = useState({
    isOnline: true,
    message: "API connection established",
  });

  // Ref for file input
  const fileInputRef = useRef(null);

  // Check API connection on mount
  useEffect(() => {
    checkApiConnection();
  }, []);

  const checkApiConnection = async () => {
    try {
      await fetch(process.env.REACT_APP_API_URL || "http://127.0.0.1:8001/api/");
      setApiStatus({ isOnline: true, message: "API connection established" });
    } catch (err) {
      console.error("API connection error:", err);
      setApiStatus({
        isOnline: false,
        message: "Could not connect to analysis API. The report generation service may be offline.",
      });
    }
  };

  // Get service based on report type
  const getService = () => {
    const services = {
      excel: AttritionAnalysisService,
      html: HtmlReportService,
      docs: ReportService,
    };
    return services[reportType] || ReportService;
  };

  // File handling
  const handleFiles = async (files) => {
    if (!apiStatus.isOnline) {
      setError("Cannot upload files while API is offline.");
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
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const service = getService();
      const response = await service.uploadFile(validFiles[0], setUploadProgress);
      setFileId(response.file_id);

      setSelectedFiles((prev) =>
        prev.map((file, index) =>
          index >= prev.length - validFiles.length
            ? { ...file, status: "uploaded", id: response.file_id }
            : file
        )
      );
    } catch (err) {
      console.error("File upload error:", err);
      setError(err.message || "Failed to upload files.");
      setSelectedFiles((prev) =>
        prev.map((file, index) =>
          index >= prev.length - validFiles.length ? { ...file, status: "failed" } : file
        )
      );
    } finally {
      setIsUploading(false);
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

  // Report generation
  const handleGenerateClick = async () => {
    if (!fileId || !selectedFiles.length) {
      setError("Please upload a file before generating a report.");
      return;
    }

    setIsGenerating(true);
    setError(null);

    try {
      const service = getService();
      const response = await service.generateReport(fileId);
      const reportExtension = { docs: ".docx", excel: ".xlsx", html: ".html" }[reportType];

      setGeneratedReport({
        id: fileId,
        name: response.report_file || `Attrition_Report${reportExtension}`,
        size: "Unknown",
        date: new Date().toLocaleDateString(),
        url: service.getDownloadUrl(fileId, response.report_file),
        type: reportType,
        ...(reportType === "html" && { viewUrl: service.getViewUrl(fileId, response.report_file) }),
      });
    } catch (err) {
      console.error("Report generation error:", err);
      setError(err.message || "Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download report
  const handleDownloadClick = async () => {
    if (!generatedReport) {
      setError("No report available to download.");
      return;
    }

    setError(null);

    try {
      const service = getService();
      if (generatedReport.url && (reportType === "html" || reportType === "excel")) {
        service.downloadReport(generatedReport.id, generatedReport.name);
      } else {
        window.open(generatedReport.url, "_blank");
      }
    } catch (err) {
      console.error("Report download error:", err);
      setError(err.message || "Failed to download report.");
    }
  };

  // View HTML report
  const handleViewClick = () => {
    if (generatedReport?.viewUrl && reportType === "html") {
      window.open(generatedReport.viewUrl, "_blank");
    }
  };

  // Remove file
  const handleRemoveFile = (index) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index));
    if (selectedFiles[index].id === fileId) setFileId(null);
  };

  // Change report type
  const handleReportTypeChange = (type) => {
    if (selectedFiles.length && !window.confirm("Changing report type will clear uploaded files. Continue?")) {
      return;
    }
    setReportType(type);
    setSelectedFiles([]);
    setFileId(null);
    setGeneratedReport(null);
    setError(null);
    setFileErrors([]);
  };

  return (
    <div className="unified-tool-container">
      <h1>Analysis & Reporting Tool</h1>
      <p>Upload your files and generate insightful analysis and reports for any domain.</p>

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

      <div className="report-type-selector">
        <div className="selector-label">Select Report Format:</div>
        <div className="selector-options">
          {["docs", "excel", "html"].map((type) => (
            <button
              key={type}
              className={`selector-option ${reportType === type ? "active" : ""}`}
              onClick={() => handleReportTypeChange(type)}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="20"
                height="20"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                {type === "html" ? (
                  <>
                    <polyline points="14 2 14 8 20 8" />
                    <path d="M20 12H4" />
                    <path d="M4 18h16" />
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                  </>
                ) : (
                  <>
                    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    <polyline points="14 2 14 8 20 8" />
                    <line x1="16" y1="13" x2="8" y2="13" />
                    <line x1="16" y1="17" x2="8" y2="17" />
                    <polyline points="10 9 9 9 8 9" />
                  </>
                )}
              </svg>
              {type === "docs" ? "Word (.docx)" : type === "excel" ? "Excel (.xlsx)" : "HTML (.html)"}
            </button>
          ))}
        </div>
      </div>

      <div className="platform-modules">
        <section className="data-module">
          <div className="module-header">
            <h3>Data Input — Output ({reportType.toUpperCase()} Format)</h3>
            <p className="module-description">Upload Excel file containing separation data</p>
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
              <p className="dropzone-subtext">Excel format (.xlsx) required</p>
              <input
                type="file"
                className="file-input"
                onChange={handleFileSelect}
                accept=".xlsx"
                disabled={isUploading || !apiStatus.isOnline}
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
              {isUploading && (
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

        <section className="analysis-module">
          <div className="module-header">
            <h3>Analysis Controls</h3>
            <p className="module-description">Generate and download reports</p>
          </div>

          <div className="control-panel">
            <div className="control-actions">
              <button
                className={`control-btn analyze-btn ${isGenerating ? "processing" : ""} ${
                  !fileId || !apiStatus.isOnline ? "disabled" : ""
                }`}
                onClick={handleGenerateClick}
                disabled={isGenerating || !fileId || !apiStatus.isOnline}
              >
                {isGenerating ? "Processing..." : "Generate Report"}
              </button>

              <button
                className={`control-btn retrieve-btn ${!generatedReport ? "disabled" : ""}`}
                onClick={handleDownloadClick}
                disabled={!generatedReport}
              >
                Download Report
              </button>

              {reportType === "html" && generatedReport && (
                <button className="control-btn view-btn" onClick={handleViewClick}>
                  View Report
                </button>
              )}
            </div>

            {generatedReport && (
              <div className="analysis-complete">
                <div className="complete-header">Analysis Summary</div>
                <div className="report-metadata">
                  <div className="metadata-item">
                    <span className="metadata-label">Document:</span>
                    <span className="metadata-value">{generatedReport.name}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Format:</span>
                    <span className="metadata-value">
                      {reportType === "docs"
                        ? "Microsoft Word"
                        : reportType === "excel"
                        ? "Microsoft Excel"
                        : "HTML Webpage"}
                    </span>
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
              </div>
            )}
          </div>
        </section>
      </div>
    </div>
  );
};

export default AnalaysisTool;
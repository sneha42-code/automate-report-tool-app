import React, { useState, useEffect } from "react";
import axios from "axios";
import "../styles/ReportTool.css";
import {
  validateFiles,
  formatFileSize,
  getAllowedFileExtensionsForDisplay,
} from "../utils/fileValidation";

const ReportTool = () => {
  // State variables
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [error, setError] = useState(null);
  const [fileErrors, setFileErrors] = useState([]);
  const [fileId, setFileId] = useState(null);

  // API base URL - update with your FastAPI endpoint
  const API_BASE_URL = "http://127.0.0.1:8001/api";

  // Check for any previously generated reports
  const fetchReports = async () => {
    try {
      const response = await axios.get(`${API_BASE_URL}/recent`);
      if (
        response.data &&
        response.data.reports &&
        response.data.reports.length > 0
      ) {
        setGeneratedReport(response.data.reports[0]);
      }
    } catch (err) {
      console.error("Error fetching recent reports:", err);
      // Don't set error state here - this is just an initial check
    }
  };

  useEffect(() => {
    //fetchReports();
  }, []);

  const handleFileUpload = async (event) => {
    if (event.target.files) {
      // Reset errors
      setError(null);
      setFileErrors([]);

      // Validate files
      const validationResult = validateFiles(event.target.files);

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

      // Create form data for file upload - use the first file only for attrition report
      const formData = new FormData();
      formData.append("file", filesArray[0]);

      try {
        // Upload file to the server using the FastAPI endpoint
        const response = await axios.post(`${API_BASE_URL}/upload/`, formData, {
          headers: {
            "Content-Type": "multipart/form-data",
          },
          onUploadProgress: (progressEvent) => {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            setUploadProgress(percentCompleted);
          },
        });

        // Store the file_id returned from the backend
        setFileId(response.data.file_id);

        // File upload completed - update status
        setSelectedFiles((prev) =>
          prev.map((file, index) => {
            if (index >= prev.length - filesArray.length) {
              return { ...file, status: "uploaded", id: response.data.file_id };
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
    }
  };

  const handleGenerate = async () => {
    if (selectedFiles.length === 0 || !fileId) {
      setError("Please upload files before generating a report");
      return;
    }

    setIsGenerating(true);
    setError(null)
    console.log("fileid ", fileId)
    try {
      // Call API to generate report using the file_id
      const response = await axios.post(`${API_BASE_URL}/generate-report/?file_id=${fileId}`);

      // Report generation succeeded
      setIsGenerating(false);
      setGeneratedReport({
        id: response.data.file_id,
        name: response.data.report_file || "Attrition_Report.docx",
        size: "Unknown", // Size info not provided by backend
        date: new Date().toLocaleDateString(),
        url: response.data.download_url,
      });
    } catch (err) {
      console.error("Error generating report:", err);
      setError("Failed to generate report. Please try again.");
      setIsGenerating(false);
    }
  };

  const handleDownload = async () => {
    if (!generatedReport) {
      setError(
        "No report available to download. Please generate a report first."
      );
      return;
    }

    setError(null);

    try {
      if (generatedReport.url) {
        // Format the download URL to match backend endpoint
        const downloadUrl = `${API_BASE_URL}/download/?file_id=${generatedReport.id}&filename=${generatedReport.name}`;

        // Open in new tab or initiate download
        window.open(downloadUrl, "_blank");
      }
    } catch (err) {
      console.error("Error downloading report:", err);
      setError("Failed to download report. Please try again.");
    }
  };

  const handleRemoveFile = async (index) => {
    const fileToRemove = selectedFiles[index];

    // Remove from UI immediately
    setSelectedFiles((files) => files.filter((_, i) => i !== index));

    // If the file had the fileId, clear it
    if (fileToRemove.id === fileId) {
      setFileId(null);
    }
  };

  return (
    <div className="analytics-platform">
      <div className="platform-modules">
        <section className="data-module">
          <div className="module-header">
            <h3>Data Input</h3>
            <p className="module-description">
              Upload  Excel file containing separation data
            </p>
          </div>

          <div className="file-input-section">
            <div className="file-dropzone">
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
              <p className="dropzone-text">Select  Excel file</p>
              <p className="dropzone-subtext">Excel format (.xlsx) required</p>
              <input
                type="file"
                className="file-input"
                onChange={handleFileUpload}
                accept=".xlsx"
                disabled={isUploading}
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

        <section className="analysis-module">
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
                  : "Generate "}
              </button>

              <button
                className={`control-btn retrieve-btn ${
                  !generatedReport ? "disabled" : ""
                }`}
                onClick={handleDownload}
                disabled={!generatedReport}
              >
                Download
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
      </div>

      <section className="specifications-module">
        <div className="module-header">
          <h3>System Specifications</h3>
        </div>

        <div className="specifications-grid">
          <div className="specification-item">
            <div className="specification-title">File Requirements</div>
            <div className="specification-content">
              <p>XLSX format with standard  data fields</p>
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
    </div>
  );
};

export default ReportTool;

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
  const API_BASE_URL = "http://127.0.0.1:8000";

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
    setError(null);

    try {
      // Call API to generate report using the file_id
      const response = await axios.post(`${API_BASE_URL}/generate-report/`, {
        file_id: fileId,
      });

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
    <div className="report-tool-container">
      <div className="tool-content">
        <div className="tool-description">
          <h1>Attrition Analysis Report Tool</h1>
          <div className="description-text">
            <p>
              This powerful tool allows you to quickly generate comprehensive
              attrition analysis reports from your HRIS data. Simply upload your
              Excel file, click generate, and download your professionally
              formatted report.
            </p>
            <p>
              Our advanced analytics engine processes your data to provide
              meaningful insights and visualizations that help you make informed
              decisions about employee retention.
            </p>
            <h3>Key Features:</h3>
            <ul>
              <li>Comprehensive attrition analysis</li>
              <li>Gender-wise attrition breakdown</li>
              <li>Location and function-based analysis</li>
              <li>Tenure and grade-wise attrition statistics</li>
              <li>Quarterly and monthly trend analysis</li>
              <li>Professional Word document output with charts</li>
            </ul>

            <div className="file-support-info">
              <h4>Supported File Types:</h4>
              <p>Excel files (.xlsx) containing HRIS data</p>
            </div>
          </div>

          {error && <div className="error-message">{error}</div>}

          {fileErrors.length > 0 && (
            <div className="file-errors">
              <h4>File Validation Errors:</h4>
              <ul>
                {fileErrors.map((error, index) => (
                  <li key={index}>{error}</li>
                ))}
              </ul>
            </div>
          )}

          <div className="file-list-container">
            <h3>Selected Files:</h3>
            {selectedFiles.length === 0 ? (
              <p className="no-files">No files selected</p>
            ) : (
              <>
                {isUploading && (
                  <div className="upload-progress">
                    <div className="progress-bar">
                      <div
                        className="progress-bar-fill"
                        style={{ width: `${uploadProgress}%` }}
                      ></div>
                    </div>
                    <span className="progress-text">
                      {uploadProgress}% Uploaded
                    </span>
                  </div>
                )}
                <ul className="file-list">
                  {selectedFiles.map((file, index) => (
                    <li key={index} className="file-item">
                      <span className="file-name">{file.name}</span>
                      <span className="file-size">({file.formattedSize})</span>
                      <button
                        className="remove-file-btn"
                        onClick={() => handleRemoveFile(index)}
                      >
                        ✕
                      </button>
                    </li>
                  ))}
                </ul>
              </>
            )}
          </div>

          {generatedReport && (
            <div className="generated-report">
              <h3>Generated Report:</h3>
              <div className="report-info">
                <span className="report-name">{generatedReport.name}</span>
                <span className="report-details">
                  Date: {generatedReport.date}
                </span>
              </div>
            </div>
          )}
        </div>

        <div className="tool-actions">
          <div className="action-button-container">
            <div
              className={`action-button upload ${
                isUploading ? "uploading" : ""
              }`}
            >
              <span className="button-icon">📤</span>
              <span className="button-label">
                {isUploading ? "Uploading..." : "Upload HRIS File"}
              </span>
              <input
                type="file"
                accept=".xlsx"
                className="file-input"
                onChange={handleFileUpload}
                disabled={isUploading}
              />
            </div>

            <button
              className={`action-button generate ${
                isGenerating ? "generating" : ""
              }`}
              onClick={handleGenerate}
              disabled={isGenerating || selectedFiles.length === 0 || !fileId}
            >
              <span className="button-icon">⚙️</span>
              <span className="button-label">
                {isGenerating ? "Generating..." : "Generate Attrition Report"}
              </span>
            </button>

            <button
              className={`action-button download ${
                !generatedReport ? "disabled" : ""
              }`}
              onClick={handleDownload}
              disabled={!generatedReport}
            >
              <span className="button-icon">📥</span>
              <span className="button-label">Download Report</span>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ReportTool;

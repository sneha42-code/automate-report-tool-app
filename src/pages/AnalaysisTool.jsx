// src/pages/AnalaysisTool.jsx
import React, { useState, useEffect, useRef } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "../styles/AnalaysisTool.css";
import {
  validateFiles,
  formatFileSize,
} from "../utils/fileValidation";
import PredictiveService from "../service/predictiveService";
import docsReportService from "../service/docsReportService";
import excelReportService from "../service/excelReportService";
import HtmlReportService from "../service/htmlReportService";
import SlicerReportService from "../service/slicerReportService";
import { checkApiConnection } from "../service/checkApiConnection";

const reportConfigs = {
  predictive: {
    name: "Predictive Attrition Analytics",
    description: "Upload HRIS data to identify employees at high risk of attrition using machine learning predictions.",
    service: PredictiveService,
    outputFormats: ["word", "html"],
    defaultFormat: "word",
    reportName: (format) => `Predictive_Attrition_Report.${format === "word" ? "docx" : "html"}`,
    specifications: {
      machineLearning: {
        title: "Machine Learning Model",
        content: ["Random Forest Classifier with 100 estimators", "Features: Gender, Tenure, Function, Grade"],
      },
      riskThreshold: {
        title: "Risk Threshold",
        content: ["High-risk employees: Probability > 70%", "Sorted by descending attrition probability"],
      },
      outputAnalysis: {
        title: "Output Analysis",
        content: ["Demographic risk breakdowns", "Model performance metrics"],
      },
      dataRequirements: {
        title: "Data Requirements",
        content: ["Employee Name, Gender, Function, Grade", "Date of Joining, Action Type, Action Date"],
      },
    },
    reportDetails: [
      "Machine learning model performance metrics",
      "High-risk employees (probability > 70%)",
      "Risk analysis by gender, location, function, and grade",
      "Complete list of employees with attrition risk scores",
    ],
  },
  excel: {
    name: "Attrition Report (Excel)",
    description: "Upload Excel file containing separation data to generate a detailed attrition report.",
    service: excelReportService,
    outputFormats: ["excel"],
    defaultFormat: "excel",
    reportName: () => "Attrition_Report.xlsx",
    specifications: {
      fileRequirements: {
        title: "File Requirements",
        content: ["XLSX format with standard data fields", "Employee demographic and employment information"],
      },
      analysisParameters: {
        title: "Analysis Parameters",
        content: ["Multi-dimensional attrition metrics", "Demographic, department, and tenure segmentation"],
      },
      outputFormat: {
        title: "Output Format",
        content: ["Microsoft Excel (.xlsx) document", "Embedded visualizations and data tables"],
      },
      dataSecurity: {
        title: "Data Security",
        content: ["Secure processing without persistent storage", "Compliance with data protection regulations"],
      },
    },
    reportDetails: [
      "Overall attrition statistics",
      "Gender, location, and function analysis",
      "Tenure and grade breakdowns",
      "Quarterly and monthly trend analysis",
    ],
  },
  docs: {
    name: "Attrition Report (Docs)",
    description: "Upload Excel file containing separation data to generate a detailed attrition report.",
    service: docsReportService,
    outputFormats: ["docs"],
    defaultFormat: "docs",
    reportName: () => "Attrition_Report.docx",
    specifications: {
      fileRequirements: {
        title: "File Requirements",
        content: ["XLSX format with standard data fields", "Employee demographic and employment information"],
      },
      analysisParameters: {
        title: "Analysis Parameters",
        content: ["Multi-dimensional attrition metrics", "Demographic, department, and tenure segmentation"],
      },
      outputFormat: {
        title: "Output Format",
        content: ["Microsoft Word (.docx) document", "Embedded visualizations and data tables"],
      },
      dataSecurity: {
        title: "Data Security",
        content: ["Secure processing without persistent storage", "Compliance with data protection regulations"],
      },
    },
    reportDetails: [
      "Overall attrition statistics",
      "Gender, location, and function analysis",
      "Tenure and grade breakdowns",
      "Quarterly and monthly trend analysis",
    ],
  },
  html: {
    name: "Attrition Report (HTML)",
    description: "Upload Excel file containing separation data to generate a detailed attrition report.",
    service: HtmlReportService,
    outputFormats: ["html"],
    defaultFormat: "html",
    reportName: () => "Attrition_Report.html",
    specifications: {
      fileRequirements: {
        title: "File Requirements",
        content: ["XLSX format with standard data fields", "Employee demographic and employment information"],
      },
      analysisParameters: {
        title: "Analysis Parameters",
        content: ["Multi-dimensional attrition metrics", "Demographic, department, and tenure segmentation"],
      },
      outputFormat: {
        title: "Output Format",
        content: ["HTML (.html) document", "Embedded visualizations and data tables"],
      },
      dataSecurity: {
        title: "Data Security",
        content: ["Secure processing without persistent storage", "Compliance with data protection regulations"],
      },
    },
    reportDetails: [
      "Overall attrition statistics",
      "Gender, location, and function analysis",
      "Tenure and grade breakdowns",
      "Quarterly and monthly trend analysis",
    ],
  },
  slicer: {
    name: "Interactive Attrition Dashboard",
    description: "Upload Excel file to generate an interactive attrition analysis dashboard with filters and visualizations.",
    service: SlicerReportService,
    outputFormats: ["html"],
    defaultFormat: "html",
    reportName: () => "Interactive_Attrition_Dashboard.html",
    specifications: {
      fileRequirements: {
        title: "File Requirements",
        content: ["XLSX format with standard data fields", "Employee demographic and employment information"],
      },
      analysisParameters: {
        title: "Analysis Parameters",
        content: ["Multi-dimensional attrition metrics", "Demographic, department, and tenure segmentation"],
      },
      outputFormat: {
        title: "Output Format",
        content: ["Interactive HTML dashboard", "Slicers, filters, and visualizations"],
      },
      dataSecurity: {
        title: "Data Security",
        content: ["Secure processing without persistent storage", "Compliance with data protection regulations"],
      },
    },
    reportDetails: [
      "Interactive filters and slicers",
      "Dynamic visualizations",
      "Demographic and tenure analysis",
      "Trend analysis with drill-down capabilities",
    ],
  },
};

const AnalaysisTool = () => {
  const location = useLocation();
  const navigate = useNavigate();

  // State variables
  const [reportType, setReportType] = useState("predictive");
  const [outputFormat, setOutputFormat] = useState(reportConfigs.predictive.defaultFormat);
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatedReports, setGeneratedReports] = useState({});
  const [error, setError] = useState(null);
  const [fileErrors, setFileErrors] = useState([]);
  const [fileId, setFileId] = useState(null);
  const [apiStatus, setApiStatus] = useState({
    isOnline: true,
    message: "API connection established",
  });
  const [showSpecifications, setShowSpecifications] = useState(false);

  // Refs
  const fileInputRef = useRef(null);

  // Check API connection on mount
  useEffect(() => {
    const checkApiConnectionStatus = async () => {
      try {
        const service = reportConfigs[reportType].service;
        if (service.healthCheck) {
          await service.healthCheck();
        } else {
          const result = await checkApiConnection();
          if (!result.success) throw new Error(result.message);
        }
        setApiStatus({
          isOnline: true,
          message: "API connection established",
        });
      } catch (err) {
        console.error("API connection error:", err);
        setApiStatus({
          isOnline: false,
          message: `Could not connect to ${reportConfigs[reportType].name} API. The service may be offline.`,
        });
      }
    };
    checkApiConnectionStatus();
  }, [reportType]);

  // Check route for specifications visibility
  useEffect(() => {
    setShowSpecifications(location.pathname.startsWith("/tool"));
  }, [location]);

  // File handling
  const handleFiles = async (files) => {
    if (!apiStatus.isOnline) {
      setError("Cannot upload files while API is offline. Please try again later.");
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
      const service = reportConfigs[reportType].service;
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
      const service = reportConfigs[reportType].service;
      let response;
      if (reportType === "predictive" && outputFormat === "word") {
        response = await service.generateReport(fileId);
      } else if (reportType === "predictive" && outputFormat === "html") {
        response = await service.generateHtmlReport(fileId);
      } else {
        response = await service.generateReport(fileId);
      }

      const reportData = {
        id: fileId,
        name: response.report_file || reportConfigs[reportType].reportName(outputFormat),
        size: "Unknown",
        date: new Date().toLocaleDateString(),
        url: service.getDownloadUrl(fileId, response.report_file),
        ...(reportType === "predictive" && outputFormat === "html" && {
          viewUrl: service.getHtmlViewUrl(fileId, response.report_file),
        }),
        ...(reportType === "slicer" && {
          viewUrl: service.getViewUrl(fileId, response.report_file),
        }),
        type: outputFormat,
      };

      setGeneratedReports((prev) => ({
        ...prev,
        [reportType]: {
          ...prev[reportType],
          [outputFormat]: reportData,
        },
      }));
    } catch (err) {
      console.error("Report generation error:", err);
      setError(err.message || "Failed to generate report.");
    } finally {
      setIsGenerating(false);
    }
  };

  // Download report
  const handleDownloadClick = async () => {
    const currentReport = generatedReports[reportType]?.[outputFormat];
    if (!currentReport) {
      setError("No report available to download.");
      return;
    }

    setError(null);

    try {
      const service = reportConfigs[reportType].service;
      if (reportType === "predictive" && outputFormat === "word") {
        service.downloadReport(currentReport.id, currentReport.name);
      } else if (reportType === "predictive" && outputFormat === "html") {
        service.downloadHtmlReport(currentReport.id, currentReport.name);
      } else {
        service.downloadReport(currentReport.id, currentReport.name);
      }
    } catch (err) {
      console.error("Report download error:", err);
      setError(err.message || "Failed to download report.");
    }
  };

  // View report (for HTML and Slicer)
  const handleViewClick = () => {
    const currentReport = generatedReports[reportType]?.[outputFormat];
    if (!currentReport?.viewUrl) return;

    if (reportType === "slicer") {
      navigate(`/dashboard/view/${currentReport.id}/${currentReport.name}`, {
        state: {
          dashboardUrl: currentReport.viewUrl,
          reportInfo: currentReport,
        },
      });
    } else {
      window.open(currentReport.viewUrl, "_blank");
    }
  };

  // Remove file
  const handleRemoveFile = (index) => {
    setSelectedFiles((files) => files.filter((_, i) => i !== index));
    if (selectedFiles[index].id === fileId) {
      setFileId(null);
      setGeneratedReports((prev) => ({
        ...prev,
        [reportType]: null,
      }));
    }
  };

  // Change report type
  const handleReportTypeChange = (type) => {
    if (selectedFiles.length && !window.confirm("Changing report type will reset the current session. Continue?")) {
      return;
    }
    setReportType(type);
    setOutputFormat(reportConfigs[type].defaultFormat);
    setSelectedFiles([]);
    setFileId(null);
    setGeneratedReports((prev) => ({
      ...prev,
      [type]: null,
    }));
    setError(null);
    setFileErrors([]);
  };

  // Change output format (for Predictive only)
  const handleOutputFormatChange = (format) => {
    if (selectedFiles.length && !window.confirm("Changing format will reset the current session. Continue?")) {
      return;
    }
    setOutputFormat(format);
    setSelectedFiles([]);
    setFileId(null);
    setGeneratedReports((prev) => ({
      ...prev,
      [reportType]: null,
    }));
    setError(null);
    setFileErrors([]);
  };

  const currentReport = generatedReports[reportType]?.[outputFormat];
  const config = reportConfigs[reportType];

  return (
    <div className="unified-tool-container">
      <h1>{config.name}</h1>
      <p>{config.description}</p>

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

      {/* Report Type Selector */}
      <div className="report-type-selector">
        <div className="selector-label">Select Report Type:</div>
        <div className="selector-options">
          {Object.keys(reportConfigs).map((type) => (
            <button
              key={type}
              className={`selector-option ${reportType === type ? "active" : ""}`}
              onClick={() => handleReportTypeChange(type)}
            >
              {reportConfigs[type].name}
            </button>
          ))}
        </div>
      </div>

      {/* Output Format Selector (Predictive Only) */}
      {reportType === "predictive" && (
        <div className="report-type-selector">
          <div className="selector-label">Select Report Format:</div>
          <div className="selector-options">
            {config.outputFormats.map((format) => (
              <button
                key={format}
                className={`selector-option ${outputFormat === format ? "active" : ""}`}
                onClick={() => handleOutputFormatChange(format)}
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
                  {format === "word" ? (
                    <>
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                      <polyline points="14 2 14 8 20 8" />
                      <line x1="16" y1="13" x2="8" y2="13" />
                      <line x1="16" y1="17" x2="8" y2="17" />
                      <polyline points="10 9 9 9 8 9" />
                    </>
                  ) : (
                    <>
                      <polyline points="14 2 14 8 20 8" />
                      <path d="M20 12H4" />
                      <path d="M4 18h16" />
                      <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
                    </>
                  )}
                </svg>
                {format === "word" ? "Word (.docx)" : "HTML (.html)"}
              </button>
            ))}
          </div>
        </div>
      )}

      <div className="platform-modules">
        <section className="data-module">
          <div className="module-header">
            <h3>Data Input — {config.name} ({outputFormat.toUpperCase()} Format)</h3>
            <p className="module-description">{config.description}</p>
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
            <h3>{reportType === "slicer" ? "Interactive Dashboard Controls" : "Analysis Controls"}</h3>
            <p className="module-description">
              {reportType === "slicer"
                ? "Generate and access your interactive attrition analysis dashboard"
                : "Generate and download reports"}
            </p>
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
                {isGenerating
                  ? reportType === "slicer"
                    ? "Creating Dashboard..."
                    : "Processing Data..."
                  : reportType === "slicer"
                  ? "Generate Interactive Dashboard"
                  : "Generate Report"}
              </button>

              {(reportType === "predictive" && outputFormat === "html") || reportType === "slicer" ? (
                <button
                  className={`control-btn view-btn ${!currentReport ? "disabled" : ""}`}
                  onClick={handleViewClick}
                  disabled={!currentReport}
                >
                  {reportType === "slicer" ? "Open Dashboard" : "View Report"}
                </button>
              ) : null}

              <button
                className={`control-btn retrieve-btn ${!currentReport ? "disabled" : ""}`}
                onClick={handleDownloadClick}
                disabled={!currentReport}
              >
                {reportType === "slicer" ? "Download Dashboard" : "Download Report"}
              </button>
            </div>

            {currentReport && (
              <div className="analysis-complete">
                <div className="complete-header">
                  {reportType === "slicer" ? "Interactive Dashboard Ready" : "Analysis Summary"}
                </div>
                <div className="report-metadata">
                  <div className="metadata-item">
                    <span className="metadata-label">
                      {reportType === "slicer" ? "Dashboard" : "Document"}:
                    </span>
                    <span className="metadata-value">{currentReport.name}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Format:</span>
                    <span className="metadata-value">
                      {outputFormat === "word"
                        ? "Microsoft Word"
                        : outputFormat === "excel"
                        ? "Microsoft Excel"
                        : reportType === "slicer"
                        ? "Interactive HTML Dashboard"
                        : "HTML Webpage"}
                    </span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Generated:</span>
                    <span className="metadata-value">{currentReport.date}</span>
                  </div>
                  <div className="metadata-item">
                    <span className="metadata-label">Status:</span>
                    <span className="metadata-value status-complete">
                      {reportType === "slicer" ? "Ready" : "Complete"}
                    </span>
                  </div>
                  <div className="report-description">
                    <p>
                      {reportType === "slicer"
                        ? "Your interactive attrition analysis dashboard is ready! This comprehensive dashboard includes:"
                        : "The analysis document has been generated successfully. Click the Download Report button to download it."}
                    </p>
                    <ul>
                      {config.reportDetails.map((detail, index) => (
                        <li key={index}>{detail}</li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {showSpecifications && (
          <section className="specifications-module">
            <div className="module-header">
              <h3>{config.name} Specifications</h3>
            </div>

            <div className="specifications-grid">
              {Object.entries(config.specifications).map(([key, spec]) => (
                <div key={key} className="specification-item">
                  <div className="specification-title">{spec.title}</div>
                  <div className="specification-content">
                    {spec.content.map((item, index) => (
                      <p key={index}>{item}</p>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          </section>
        )}
      </div>
    </div>
  );
};

export default AnalaysisTool;
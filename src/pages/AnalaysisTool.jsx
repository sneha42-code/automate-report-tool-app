import React, { useState, useRef, useEffect } from 'react';
import { checkAllServicesHealth } from '../service/checkApiConnection';
import PredictiveService from '../service/predictiveService';
import HtmlReportService from '../service/htmlReportService';
import DocsReportService from '../service/docsReportService';
import SlicerReportService from '../service/slicerReportService';
import ExcelReportService from '../service/excelReportService'
import '../styles/AnalaysisTool.css';

const AnalysisTool = () => {
  // State variables
  const [selectedService, setSelectedService] = useState('docs');
  const [selectedFile, setSelectedFile] = useState(null);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadProgress, setUploadProgress] = useState(0);
  const [generatedReport, setGeneratedReport] = useState(null);
  const [error, setError] = useState(null);
  const [fileError, setFileError] = useState(null);
  const [apiStatus, setApiStatus] = useState({ isOnline: false, message: 'Checking API status...' });

  // Ref for file input
  const fileInputRef = useRef(null);

  // Services mapping in specified order: docs, excel, html, slicer, predictive
  const services = {
    docs: DocsReportService,
    excel: ExcelReportService,
    html: HtmlReportService,
    slicer: SlicerReportService,
    predictive: PredictiveService,
  };

  // Service display names in specified order
  const serviceNames = {
    docs: 'Docs Report',
    excel: 'Excel Report',
    html: 'HTML Report',
    slicer: 'Slicer Report',
    predictive: 'Predictive Analytics',
  };

  // Check API and services health on mount
  useEffect(() => {
    const checkHealth = async () => {
      const result = await checkAllServicesHealth();
      setApiStatus({
        isOnline: result.main.success,
        message: result.main.success
          ? 'API connection established'
          : result.main.message,
      });
    };
    checkHealth();
  }, []);

  // File validation
  const validateFile = (file) => {
    if (!file) return 'No file selected';
    const validExtension = '.xlsx';
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    if (fileExtension !== validExtension) {
      return 'Only .xlsx files are supported';
    }
    if (selectedService === 'predictive') {
      return PredictiveService.validateFileFormat(file)
        ? null
        : 'Invalid file format for Predictive Analytics';
    }
    return null;
  };

  // Handle file selection
  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const validationError = validateFile(file);
    if (validationError) {
      setFileError(validationError);
      setSelectedFile(null);
      return;
    }

    setFileError(null);
    setSelectedFile({
      name: file.name,
      size: file.size,
      formattedSize: PredictiveService.formatFileSize(file.size),
      fileObject: file,
      status: 'pending',
    });
    setGeneratedReport(null);
  };

  // Handle file upload and report generation
  const handleGenerateReport = async () => {
    if (!selectedFile || !apiStatus.isOnline) {
      setError(
        !selectedFile
          ? 'Please select a file'
          : 'API is offline. Please try again later.'
      );
      return;
    }

    setError(null);
    setIsUploading(true);
    setUploadProgress(0);

    try {
      const service = services[selectedService];
      let response;

      if (selectedService === 'predictive') {
        // PredictiveService handles upload and generation in one call
        response = await service.generateReport(
          selectedFile.fileObject,
          setUploadProgress
        );
        const filename = response.download_url.split('/').pop();
        setGeneratedReport({
          name: filename,
          url: response.download_url,
          date: new Date().toLocaleDateString(),
          type: 'word',
        });
      } else {
        // Other services: upload file first, then generate report
        const uploadResponse = await service.uploadFile(
          selectedFile.fileObject,
          setUploadProgress
        );
        response = await service.generateReport(uploadResponse.file_id);
        const filename = response.filename || `Report_${Date.now()}.docx`;
        setGeneratedReport({
          name: filename,
          url: service.getDownloadUrl(uploadResponse.file_id, filename),
          viewUrl:
            selectedService === 'html' || selectedService === 'slicer'
              ? service.getViewUrl(uploadResponse.file_id, filename)
              : null,
          date: new Date().toLocaleDateString(),
          type: selectedService === 'excel' ? 'excel' : 'word',
          fileId: uploadResponse.file_id,
        });
      }

      setSelectedFile((prev) => ({ ...prev, status: 'processed' }));
    } catch (err) {
      console.error('Report generation error:', err);
      setError(err.message || 'Failed to generate report');
      setSelectedFile((prev) => ({ ...prev, status: 'failed' }));
    } finally {
      setIsUploading(false);
      setUploadProgress(100);
    }
  };

  // Handle download
  const handleDownload = () => {
    if (!generatedReport) {
      setError('No report available to download');
      return;
    }

    setError(null);
    try {
      const service = services[selectedService];
      if (selectedService === 'predictive') {
        service.downloadReport(generatedReport.name);
      } else {
        service.downloadReport(generatedReport.fileId, generatedReport.name);
      }
    } catch (err) {
      console.error('Download error:', err);
      setError(err.message || 'Failed to download report');
    }
  };

  // Handle view (for HTML and Slicer)
  const handleView = () => {
    if (!generatedReport?.viewUrl) {
      setError('Viewing is not supported for this report type');
      return;
    }

    setError(null);
    try {
      const service = services[selectedService];
      service.viewReport(generatedReport.fileId, generatedReport.name);
    } catch (err) {
      console.error('View error:', err);
      setError(err.message || 'Failed to view report');
    }
  };

  // Handle drag and drop
  const handleDragOver = (e) => {
    e.preventDefault();
    e.currentTarget.classList.add('drag-over');
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.currentTarget.classList.remove('drag-over');
    if (e.dataTransfer.files?.length) {
      const file = e.dataTransfer.files[0];
      const validationError = validateFile(file);
      if (validationError) {
        setFileError(validationError);
        setSelectedFile(null);
        return;
      }
      setFileError(null);
      setSelectedFile({
        name: file.name,
        size: file.size,
        formattedSize: PredictiveService.formatFileSize(file.size),
        fileObject: file,
        status: 'pending',
      });
      setGeneratedReport(null);
    }
  };

  // Trigger file input click
  const handleBrowseClick = () => {
    fileInputRef.current?.click();
  };

  // Clear file
  const handleClearFile = () => {
    setSelectedFile(null);
    setGeneratedReport(null);
    setFileError(null);
    setError(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  };

  return (
    <div className="analysis-tool-container">
      <h1>Analysis Tool</h1>
      <p>Upload an Excel file to generate reports using various analytics services.</p>

      {/* API Status */}
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

      {/* Service Selection */}
      <div className="service-selection">
        <label htmlFor="service-select">Select Service:</label>
        <select
          id="service-select"
          value={selectedService}
          onChange={(e) => {
            setSelectedService(e.target.value);
            setSelectedFile(null);
            setGeneratedReport(null);
            setError(null);
            setFileError(null);
          }}
          disabled={isUploading}
        >
          {Object.keys(services).map((key) => (
            <option key={key} value={key}>
              {serviceNames[key]}
            </option>
          ))}
        </select>
      </div>

      {/* File Input Section */}
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

      {/* File Errors */}
      {fileError && (
        <div className="validation-alert">
          <div className="alert-header">File Validation Error:</div>
          <p>{fileError}</p>
        </div>
      )}

      {/* System Errors */}
      {error && <div className="system-alert">{error}</div>}

      {/* Selected File */}
      {selectedFile && (
        <div className="selected-files-panel">
          <div className="panel-header">Selected File</div>
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
              <tr className={selectedFile.status}>
                <td className="file-name">{selectedFile.name}</td>
                <td className="file-size">{selectedFile.formattedSize}</td>
                <td className="file-status">
                  <span className={`status-${selectedFile.status}`}>
                    {selectedFile.status.charAt(0).toUpperCase() +
                      selectedFile.status.slice(1)}
                  </span>
                </td>
                <td className="file-action">
                  <button
                    className="remove-file-btn"
                    onClick={handleClearFile}
                    disabled={isUploading}
                  >
                    Remove
                  </button>
                </td>
              </tr>
            </tbody>
          </table>
        </div>
      )}

      {/* Control Panel */}
      <div className="control-panel">
        <div className="control-actions">
          <button
            className="control-btn generate-btn"
            onClick={handleGenerateReport}
            disabled={isUploading || !selectedFile || !apiStatus.isOnline}
          >
            Generate Report
          </button>
          <button
            className={`control-btn download-btn ${
              !generatedReport ? 'disabled' : ''
            }`}
            onClick={handleDownload}
            disabled={!generatedReport}
          >
            Download Report
          </button>
          {(selectedService === 'html' || selectedService === 'slicer') && (
            <button
              className={`control-btn view-btn ${
                !generatedReport?.viewUrl ? 'disabled' : ''
              }`}
              onClick={handleView}
              disabled={!generatedReport?.viewUrl}
            >
              View Report
            </button>
          )}
        </div>

        {/* Report Summary */}
        {generatedReport && (
          <div className="analysis-complete">
            <div className="complete-header">Report Summary</div>
            <div className="report-metadata">
              <div className="metadata-item">
                <span className="metadata-label">Document:</span>
                <span className="metadata-value">{generatedReport.name}</span>
              </div>
              <div className="metadata-item">
                <span className="metadata-label">Format:</span>
                <span className="metadata-value">
                  {generatedReport.type === 'excel' ? 'Excel' : 'Microsoft Word'}
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
    </div>
  );
};

export default AnalysisTool;
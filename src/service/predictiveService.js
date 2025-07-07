import axios from "axios";

class PredictiveService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || "http://localhost:8000";
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    console.log(`PredictiveService initialized in ${process.env.NODE_ENV} mode with URL: ${this.baseURL}`);
  }

  /**
   * Upload file and generate predictive report
   * @param {File} file - The file to upload
   * @param {Function} progressCallback - Callback for upload progress
   * @returns {Promise} Promise with report generation response
   */
  async generateReport(file, progressCallback = null) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await this.api.post("/generate-report/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          if (progressCallback) {
            const percentCompleted = Math.round(
              (progressEvent.loaded * 100) / progressEvent.total
            );
            progressCallback(percentCompleted);
          }
        },
      });

      return response.data;
    } catch (error) {
      console.error("Error generating report:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Get download URL for a predictive report
   * @param {string} filename - The name of the report file
   * @returns {string} Download URL
   */
  getDownloadUrl(filename) {
    return `${this.baseURL}/download/${filename}`;
  }

  /**
   * Download predictive report
   * @param {string} filename - The name of the report file
   */
  downloadReport(filename) {
    const url = this.getDownloadUrl(filename);
    this._downloadFile(url, filename);
  }

  // /**
  //  * Check health of predictive analytics service
  //  * @returns {Promise} Promise with health check response
  //  */
  // async checkHealth() {
  //   try {
  //     const response = await this.api.get("/api/v1/health-predictive");
  //     return response.data;
  //   } catch (error) {
  //     console.error("Error checking predictive service health:", error);
  //     throw this._handleError(error);
  //   }
  // }

  /**
   * Get supported file formats
   * @returns {Array} Array of supported file extensions
   */
  getSupportedFormats() {
    return ['.xlsx'];
  }

  /**
   * Validate file format
   * @param {File} file - The file to validate
   * @returns {boolean} True if file format is supported
   */
  validateFileFormat(file) {
    const supportedFormats = this.getSupportedFormats();
    const fileExtension = '.' + file.name.split('.').pop().toLowerCase();
    return supportedFormats.includes(fileExtension);
  }

  /**
   * Get required columns for predictive analysis
   * @returns {Array} Array of required column names
   */
  getRequiredColumns() {
    return [
      'Employee Name',
      'Gender', 
      'Function',
      'Job Location',
      'Grade',
      'Action Date',
      'Date of Joining',
      'Action Type'
    ];
  }

  /**
   * Format file size for display
   * @param {number} bytes - File size in bytes
   * @returns {string} Formatted file size
   */
  formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  }

  /**
   * Generic file download helper
   * @param {string} url - Download URL
   * @param {string} filename - Suggested filename
   * @private
   */
  _downloadFile(url, filename) {
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    link.target = '_blank';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  /**
   * Handle API errors
   * @param {Error} error - The error object
   * @returns {Error} Formatted error object
   * @private
   */
  _handleError(error) {
    let errorMessage = "An unknown error occurred";
    let errorCode = null;

    if (error.response) {
      const serverError = error.response.data?.detail || error.response.data?.message;
      errorMessage = serverError || `Server error: ${error.response.status}`;
      errorCode = error.response.status;
      
      switch (error.response.status) {
        case 400:
          errorMessage = serverError || "Invalid request. Please check your file format.";
          break;
        case 404:
          errorMessage = "Report not found. Please generate the report first.";
          break;
        case 413:
          errorMessage = "File too large. Please upload a smaller file.";
          break;
        case 500:
          errorMessage = "Server error. Please try again later.";
          break;
        case 503:
          errorMessage = "Service temporarily unavailable. Please try again later.";
          break;
      }
    } else if (error.request) {
      errorMessage = "No response from server. Please check your connection and try again.";
      errorCode = 'NETWORK_ERROR';
    } else {
      errorMessage = error.message;
    }

    const customError = new Error(errorMessage);
    customError.code = errorCode;
    customError.originalError = error;
    
    return customError;
  }
}

export default new PredictiveService();
// src/service/PredictiveService.jsx
import axios from "axios";

class PredictiveService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL || "http://127.0.0.1:8001/api";
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }

  /**
   * Upload file for predictive analytics
   * @param {File} file - The file to upload
   * @param {Function} progressCallback - Callback for upload progress
   * @returns {Promise} Promise with upload response data
   */
  async uploadFile(file, progressCallback = null) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await this.api.post("/upload-predictive/", formData, {
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
      console.error("Error uploading file:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Generate predictive report (Word document)
   * @param {string} fileId - The ID of the uploaded file
   * @returns {Promise} Promise with report generation response
   */
  async generateReport(fileId) {
    try {
      const response = await this.api.post(`/generate-predictive-report/?file_id=${fileId}`, null,{ timeout: 60000 });
      return response.data;
    } catch (error) {
      console.error("Error generating predictive report:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Generate predictive HTML report
   * @param {string} fileId - The ID of the uploaded file
   * @returns {Promise} Promise with HTML report generation response
   */
  async generateHtmlReport(fileId) {
    try {
      const response = await this.api.post(`/generate-predictive-html/?file_id=${fileId}`);
      return response.data;
    } catch (error) {
      console.error("Error generating predictive HTML report:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Get download URL for a predictive report (Word document)
   * @param {string} fileId - The ID of the report file
   * @param {string} filename - The name of the report file
   * @returns {string} Download URL
   */
  getDownloadUrl(fileId, filename) {
    return `${this.baseURL}/download-predictive/?file_id=${fileId}&filename=${filename}`;
  }

  /**
   * Get download URL for a predictive HTML report
   * @param {string} fileId - The ID of the report file
   * @param {string} filename - The name of the report file
   * @returns {string} Download URL
   */
  getHtmlDownloadUrl(fileId, filename) {
    return `${this.baseURL}/download-predictive-html/${fileId}/${filename}`;
  }

  /**
   * Get view URL for a predictive HTML report
   * @param {string} fileId - The ID of the report file
   * @param {string} filename - The name of the report file
   * @returns {string} View URL
   */
  getHtmlViewUrl(fileId, filename) {
    return `${this.baseURL}/view-predictive/${fileId}/${filename}`;
  }

  /**
   * Download predictive report (Word document)
   * @param {string} fileId - The ID of the report file
   * @param {string} filename - The name of the report file
   */
  downloadReport(fileId, filename) {
    const url = this.getDownloadUrl(fileId, filename);
    window.open(url, "_blank");
  }

  /**
   * Download predictive HTML report
   * @param {string} fileId - The ID of the report file
   * @param {string} filename - The name of the report file
   */
  downloadHtmlReport(fileId, filename) {
    const url = this.getHtmlDownloadUrl(fileId, filename);
    window.open(url, "_blank");
  }

  /**
   * Check health of predictive analytics service
   * @returns {Promise} Promise with health check response
   */
  async healthCheck() {
    try {
      const response = await this.api.get("/health-predictive");
      return response.data;
    } catch (error) {
      console.error("Error checking predictive service health:", error);
      throw this._handleError(error);
    }
  }

  /**
   * Handle API errors
   * @param {Error} error - The error object
   * @returns {Error} Formatted error object
   */
  _handleError(error) {
    let errorMessage = "An unknown error occurred";

    if (error.response) {
      const serverError = error.response.data.detail || error.response.data.message;
      errorMessage = serverError || `Server error: ${error.response.status}`;
    } else if (error.request) {
      errorMessage = "No response from server. Please check your connection.";
    } else {
      errorMessage = error.message;
    }

    return new Error(errorMessage);
  }
}

export default new PredictiveService();
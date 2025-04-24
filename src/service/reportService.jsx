// src/services/reportService.js
import axios from "axios";

// Get API base URL from environment variables
const API_BASE_URL = process.env.REACT_APP_API_BASE_URL || "http://127.0.0.1:8001/api";

// Create axios instance with default config
const apiClient = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
  },
});

// Service functions for report-related API calls
const reportService = {
  /**
   * Fetch recent reports
   * @returns {Promise} Promise with recent reports data
   */
  getRecentReports: async () => {
    try {
      const response = await apiClient.get("/recent");
      return response.data;
    } catch (error) {
      console.error("Error fetching recent reports:", error);
      throw error;
    }
  },

  /**
   * Upload a file to the server
   * @param {File} file - The file to upload
   * @param {Function} progressCallback - Callback for upload progress
   * @returns {Promise} Promise with upload response data
   */
  uploadFile: async (file, progressCallback) => {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await apiClient.post("/upload/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          if (progressCallback) {
            progressCallback(percentCompleted);
          }
        },
      });
      
      return response.data;
    } catch (error) {
      console.error("Error uploading file:", error);
      throw error;
    }
  },

  /**
   * Generate report based on uploaded file
   * @param {string} fileId - The ID of the uploaded file
   * @returns {Promise} Promise with report generation response
   */
  generateReport: async (fileId) => {
    try {
      const response = await apiClient.post(`/generate-report/?file_id=${fileId}`);
      return response.data;
    } catch (error) {
      console.error("Error generating report:", error);
      throw error;
    }
  },

  /**
   * Get download URL for a report
   * @param {string} fileId - The ID of the report file
   * @param {string} filename - The name of the report file
   * @returns {string} Download URL
   */
  getDownloadUrl: (fileId, filename) => {
    return `${API_BASE_URL}/download/?file_id=${fileId}&filename=${filename}`;
  }
};

export default reportService;
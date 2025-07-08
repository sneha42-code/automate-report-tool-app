// src/service/SlicerReportService.js
import axios from "axios";

class SlicerReportService {
  constructor() {
    this.baseURL = process.env.REACT_APP_API_URL;
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Log the environment and URL for debugging
    console.log(`SlicerReportService initialized in ${process.env.NODE_ENV} mode with URL: ${this.baseURL}`);
  }

  async uploadFile(file, progressCallback = null) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await this.api.post("/slicer/upload/", formData, {
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

  async generateReport(fileId) {
    try {
      const formData = new FormData();
      formData.append("file_id", fileId);

      const response = await this.api.post("/slicer/generate-report/", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        timeout: 60000,
      });
      return response.data;
    } catch (error) {
      console.error("Error generating report:", error);
      throw this._handleError(error);
    }
  }

  getDownloadUrl(fileId, filename) {
    return `${this.baseURL}/slicer/download/${fileId}/${filename}`;
  }

  getViewUrl(fileId, filename) {
    return `${this.baseURL}/slicer/view/${fileId}/${filename}`;
  }

  getUploadFormUrl() {
    return `${this.baseURL}/slicer/upload-form/`;
  }

  downloadReport(fileId, filename) {
    const url = this.getDownloadUrl(fileId, filename);
    // Create a temporary link element to trigger download
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  }

  viewReport(fileId, filename) {
    const url = this.getViewUrl(fileId, filename);
    window.open(url, "_blank");
  }

  openUploadForm() {
    const url = this.getUploadFormUrl();
    window.open(url, "_blank");
  }

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

export default new SlicerReportService();
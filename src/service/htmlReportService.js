import axios from "axios";

class HtmlReportService {
  constructor() {
    // Environment-aware base URL configuration
    this.baseURL = process.env.REACT_APP_API_URL;
      
    this.api = axios.create({
      baseURL: this.baseURL,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Log the environment and URL for debugging
    console.log(`HtmlReportService initialized in ${process.env.NODE_ENV} mode with URL: ${this.baseURL}`);
  }

  async uploadFile(file, progressCallback = null) {
    try {
      const formData = new FormData();
      formData.append("file", file);

      const response = await this.api.post("/html/upload/", formData, {
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
      const response = await this.api.post("/html/generate-report/", null, {
        params: { file_id: fileId },
        timeout: 60000 // 60 seconds timeout
      });
      return response.data;
    } catch (error) {
      console.error("Error generating report:", error);
      throw this._handleError(error);
    }
  }

  getDownloadUrl(fileId, filename) {
    return `${this.baseURL}/html/download/${fileId}/${filename}`;
  }

  getViewUrl(fileId, filename) {
    return `${this.baseURL}/html/view/${fileId}/${filename}`;
  }

  downloadReport(fileId, filename) {
    const url = this.getDownloadUrl(fileId, filename);
    window.open(url, "_blank");
  }

  viewReport(fileId, filename) {
    const url = this.getViewUrl(fileId, filename);
    window.open(url, "_blank");
  }

  async getRecentReports() {
    try {
      const response = await this.api.get("/recent");
      return response.data;
    } catch (error) {
      console.error("Error fetching recent reports:", error);
      throw this._handleError(error);
    }
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

export default new HtmlReportService();
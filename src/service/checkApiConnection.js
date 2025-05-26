import axios from "axios";

/**
 * Checks the API connection by making a GET request to the base API URL.
 * @returns {Promise<{ success: boolean, message: string }>} Result of the API connection check.
 */
export async function checkApiConnection() {
  const apiUrl = process.env.REACT_APP_API_URL || "";
  if (!apiUrl) {
    return { success: false, message: "API URL is not set in environment variables." };
  }
  try {
    // Try a simple GET request to the API root or /health endpoint if available
    const response = await axios.get(apiUrl + "/health");
    if (response.status === 200) {
      return { success: true, message: "API connection successful." };
    }
    return { success: false, message: `API responded with status ${response.status}` };
  } catch (error) {
    return { success: false, message: error.message || "API connection failed." };
  }
}

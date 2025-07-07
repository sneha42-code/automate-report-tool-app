import axios from "axios";

/**
 * Checks the API connection by making a GET request to the health endpoint.
 * @returns {Promise<{ success: boolean, message: string }>} Result of the API connection check.
 */
export async function checkApiConnection() {
  const apiUrl = process.env.REACT_APP_API_URL || "";
  
  if (!apiUrl) {
    return { 
      success: false, 
      message: "API URL is not set in environment variables." 
    };
  }

  try {
    // Check the main health endpoint
    const response = await axios.get(`${apiUrl}/health`, {
      timeout: 5000 // 5 second timeout
    });
    
    if (response.status === 200) {
      return { 
        success: true, 
        message: "API connection successful.",
        data: response.data
      };
    }
    
    return { 
      success: false, 
      message: `API responded with status ${response.status}` 
    };
  } catch (error) {
    let errorMessage = "API connection failed.";
    
    if (error.response) {
      errorMessage = `Server error: ${error.response.status} - ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage = "No response from server. Please check your connection and API URL.";
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = "Request timeout. The API server may be slow or unavailable.";
    } else {
      errorMessage = error.message || "Unknown connection error.";
    }
    
    return { 
      success: false, 
      message: errorMessage 
    };
  }
}

/**
 * Checks the health of specific service endpoints
 * @param {string} service - The service to check ('predictive', etc.)
 * @returns {Promise<{ success: boolean, message: string }>} Result of the service health check.
 */
export async function checkServiceHealth(service) {
  const apiUrl = process.env.REACT_APP_API_URL || "";
  
  if (!apiUrl) {
    return { 
      success: false, 
      message: "API URL is not set in environment variables." 
    };
  }

  try {
    const response = await axios.get(`${apiUrl}/${service}/health`, {
      timeout: 5000
    });
    
    if (response.status === 200) {
      return { 
        success: true, 
        message: `${service} service is healthy.`,
        data: response.data
      };
    }
    
    return { 
      success: false, 
      message: `${service} service responded with status ${response.status}` 
    };
  } catch (error) {
    let errorMessage = `${service} service health check failed.`;
    
    if (error.response) {
      errorMessage = `${service} service error: ${error.response.status} - ${error.response.statusText}`;
    } else if (error.request) {
      errorMessage = `No response from ${service} service.`;
    } else if (error.code === 'ECONNABORTED') {
      errorMessage = `${service} service timeout.`;
    } else {
      errorMessage = error.message || `Unknown ${service} service error.`;
    }
    
    return { 
      success: false, 
      message: errorMessage 
    };
  }
}

/**
 * Checks all available services health
 * @returns {Promise<Object>} Object containing health status of all services
 */
export async function checkAllServicesHealth() {
  const services = ['predictive'];
  
  const results = {
    main: await checkApiConnection(),
    services: {}
  };

  // Check each service health
  for (const service of services) {
    results.services[service] = await checkServiceHealth(service);
  }

  return results;
}
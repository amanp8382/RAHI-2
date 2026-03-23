// Error handling utilities

export const handleApiError = (error) => {
  console.error('API Error:', error);
  
  if (error.response) {
    // Server responded with error status
    const { status, data } = error.response;
    
    switch (status) {
      case 400:
        return data.message || 'Invalid request. Please check your input.';
      case 401:
        return 'Authentication failed. Please log in again.';
      case 403:
        return 'Access denied. You do not have permission to perform this action.';
      case 404:
        return 'The requested resource was not found.';
      case 409:
        return data.message || 'A conflict occurred. The resource may already exist.';
      case 422:
        return data.message || 'Invalid data provided. Please check your input.';
      case 429:
        return 'Too many requests. Please wait before trying again.';
      case 500:
        return 'Server error. Please try again later.';
      case 503:
        return 'Service temporarily unavailable. Please try again later.';
      default:
        return data.message || `An error occurred (${status}). Please try again.`;
    }
  } else if (error.request) {
    // Network error
    return 'Unable to connect to the server. Please check your internet connection.';
  } else {
    // Other errors
    return error.message || 'An unexpected error occurred. Please try again.';
  }
};

export const createErrorNotification = (message, type = 'error') => {
  // You can integrate with a notification library here
  console.log(`${type.toUpperCase()}: ${message}`);
  
  // For now, just return the error for components to display
  return {
    type,
    message,
    timestamp: new Date().toISOString()
  };
};

export const isNetworkError = (error) => {
  return !error.response && error.request;
};

export const isServerError = (error) => {
  return error.response && error.response.status >= 500;
};

export const isClientError = (error) => {
  return error.response && error.response.status >= 400 && error.response.status < 500;
};

export const getErrorCode = (error) => {
  return error.response?.status || 'NETWORK_ERROR';
};

export const shouldRetry = (error) => {
  // Retry on network errors or server errors (except 4xx)
  return isNetworkError(error) || (error.response?.status >= 500);
};

// Retry wrapper for API calls
export const withRetry = async (apiCall, maxRetries = 3, delay = 1000) => {
  let lastError;
  
  for (let attempt = 1; attempt <= maxRetries; attempt++) {
    try {
      return await apiCall();
    } catch (error) {
      lastError = error;
      
      if (attempt === maxRetries || !shouldRetry(error)) {
        throw error;
      }
      
      // Exponential backoff
      const waitTime = delay * Math.pow(2, attempt - 1);
      await new Promise(resolve => setTimeout(resolve, waitTime));
    }
  }
  
  throw lastError;
};

export default {
  handleApiError,
  createErrorNotification,
  isNetworkError,
  isServerError,
  isClientError,
  getErrorCode,
  shouldRetry,
  withRetry
};
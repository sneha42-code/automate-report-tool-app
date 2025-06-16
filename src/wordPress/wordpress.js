// config/wordpress.js
export const WORDPRESS_CONFIG = {
  // Your Hostinger WordPress URLs
  BLOG_URL: 'https://aiblog.automatereporting.com/',
  API_URL: 'https://aiblog.automatereporting.com/wp-json/wp/v2',
  AUTH_URL: 'https://aiblog.automatereporting.com/wp-json/jwt-auth/v1',
  TOKEN_ENDPOINT: 'https://aiblog.automatereporting.com/wp-json/jwt-auth/v1/token',
  TOKEN_VALIDATE_ENDPOINT: 'https://aiblog.automatereporting.com/wp-json/jwt-auth/v1/token/validate',
  
  // Authentication settings
  AUTH_METHOD: 'jwt',
  
  // Default settings
  POSTS_PER_PAGE: 6,
  POSTS_PER_PAGE_SIDEBAR: 4,
  EXCERPT_LENGTH: 200,
  
  // Default images
  DEFAULT_FEATURED_IMAGE: '/default-hero.png',
  DEFAULT_AVATAR: '/api/placeholder/96/96',
  
  // Cache settings (in milliseconds)
  CACHE_DURATION: {
    POSTS: 5 * 60 * 1000, // 5 minutes
    CATEGORIES: 30 * 60 * 1000, // 30 minutes
    TAGS: 30 * 60 * 1000, // 30 minutes
  },
  
  // Request timeout
  TIMEOUT: 6000, // 60 seconds
  
  // API Version
  API_VERSION: 'wp/v2',
  
  // JWT Token settings
  TOKEN_REFRESH_THRESHOLD: 5 * 60 * 1000, // Refresh token 5 minutes before expiry
  
  // Error messages
  ERROR_MESSAGES: {
    CONNECTION_FAILED: 'Could not connect to WordPress. Please check your internet connection.',
    AUTH_FAILED: 'Authentication failed. Please check your credentials.',
    PERMISSION_DENIED: 'You do not have permission to perform this action.',
    POST_NOT_FOUND: 'The requested post could not be found.',
    MEDIA_UPLOAD_FAILED: 'Failed to upload media file.',
    TOKEN_EXPIRED: 'Authentication token has expired. Please log in again.',
    TOKEN_INVALID: 'Invalid authentication token. Please log in again.',
  },
};

// Environment-specific overrides
if (process.env.NODE_ENV === 'development') {
  // For local development, you might want to use different URLs
  // WORDPRESS_CONFIG.BLOG_URL = 'http://localhost:8080';
  // WORDPRESS_CONFIG.API_URL = 'http://localhost:8080/wp-json/wp/v2';
  // WORDPRESS_CONFIG.AUTH_URL = 'http://localhost:8080/wp-json/jwt-auth/v1';
  // WORDPRESS_CONFIG.TOKEN_ENDPOINT = 'http://localhost:8080/wp-json/jwt-auth/v1/token';
  // WORDPRESS_CONFIG.TOKEN_VALIDATE_ENDPOINT = 'http://localhost:8080/wp-json/jwt-auth/v1/token/validate';
  
  // Enable more verbose logging in development
  WORDPRESS_CONFIG.DEBUG = true;
}

// Validation function
export const validateConfig = () => {
  const required = ['BLOG_URL', 'API_URL', 'AUTH_URL', 'TOKEN_ENDPOINT', 'TOKEN_VALIDATE_ENDPOINT'];
  const missing = required.filter(key => !WORDPRESS_CONFIG[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required WordPress config: ${missing.join(', ')}`);
  }
  
  // Validate URLs
  try {
    new URL(WORDPRESS_CONFIG.BLOG_URL);
    new URL(WORDPRESS_CONFIG.API_URL);
    new URL(WORDPRESS_CONFIG.AUTH_URL);
    new URL(WORDPRESS_CONFIG.TOKEN_ENDPOINT);
    new URL(WORDPRESS_CONFIG.TOKEN_VALIDATE_ENDPOINT);
  } catch (error) {
    throw new Error('Invalid URL in WordPress configuration');
  }
  
  return true;
};

export default WORDPRESS_CONFIG;
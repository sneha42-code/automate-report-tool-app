// src/utils/blogAPI.js
const API_BASE_URL = 'http://localhost:8000/api';

/**
 * Fetch blog posts with optional filtering parameters
 * @param {Object} params - Query parameters
 * @param {string} params.category - Filter by category
 * @param {string} params.tag - Filter by tag
 * @param {string} params.author - Filter by author name
 * @param {string} params.search - Search term
 * @param {boolean} params.published - Filter by published status
 * @param {number} params.page - Page number
 * @param {number} params.limit - Items per page
 * @returns {Promise<Object>} Paginated blog posts
 */
export const fetchBlogs = async (params = {}) => {
  try {
    const queryParams = new URLSearchParams();
    
    if (params.category) queryParams.append('category', params.category);
    if (params.tag) queryParams.append('tag', params.tag);
    if (params.author) queryParams.append('author', params.author);
    if (params.search) queryParams.append('search', params.search);
    if (params.published !== undefined) queryParams.append('published', params.published);
    if (params.page) queryParams.append('page', params.page);
    if (params.limit) queryParams.append('limit', params.limit);
    
    const response = await fetch(`${API_BASE_URL}/blogs/?${queryParams}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch blogs');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching blogs:', error);
    throw error;
  }
};

/**
 * Fetch a single blog post by ID
 * @param {string} id - Blog post ID
 * @returns {Promise<Object>} Blog post data
 */
export const fetchBlogById = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch blog');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error fetching blog with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Create a new blog post
 * @param {Object} blogData - Blog post data
 * @returns {Promise<Object>} Created blog post
 */
export const createBlog = async (blogData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blogData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to create blog post');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error creating blog post:', error);
    throw error;
  }
};

/**
 * Update an existing blog post
 * @param {string} id - Blog post ID
 * @param {Object} blogData - Updated blog post data
 * @returns {Promise<Object>} Updated blog post
 */
export const updateBlog = async (id, blogData) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'PUT',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(blogData),
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to update blog post');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error updating blog with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Delete a blog post
 * @param {string} id - Blog post ID
 * @returns {Promise<boolean>} Success status
 */
export const deleteBlog = async (id) => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/${id}`, {
      method: 'DELETE',
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to delete blog post');
    }
    
    return true;
  } catch (error) {
    console.error(`Error deleting blog with ID ${id}:`, error);
    throw error;
  }
};

/**
 * Upload an image for a blog post
 * @param {string} blogId - Blog post ID
 * @param {File} imageFile - Image file to upload
 * @returns {Promise<Object>} Upload result with URL
 */
export const uploadBlogImage = async (blogId, imageFile) => {
  try {
    const formData = new FormData();
    formData.append('file', imageFile);
    
    const response = await fetch(`${API_BASE_URL}/blogs/${blogId}/image`, {
      method: 'POST',
      body: formData,
    });
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to upload image');
    }
    
    return await response.json();
  } catch (error) {
    console.error(`Error uploading image for blog ${blogId}:`, error);
    throw error;
  }
};

/**
 * Get blog statistics
 * @returns {Promise<Object>} Blog statistics
 */
export const fetchBlogStats = async () => {
  try {
    const response = await fetch(`${API_BASE_URL}/blogs/stats/summary`);
    
    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.detail || 'Failed to fetch blog statistics');
    }
    
    return await response.json();
  } catch (error) {
    console.error('Error fetching blog statistics:', error);
    throw error;
  }
};

/**
 * Convert blog data from the existing format to the API format
 * @param {Object} localBlogData - Blog data from the existing format
 * @returns {Object} Blog data in the API format
 */
export const convertLocalBlogToApiFormat = (localBlogData) => {
  // Map content sections to the expected API format
  const content = Array.isArray(localBlogData.content) 
    ? localBlogData.content
    : localBlogData.content
      ? localBlogData.content.split('\n\n').map(paragraph => ({
          type: 'paragraph',
          content: paragraph
        }))
      : [];
  
  return {
    title: localBlogData.title,
    subtitle: localBlogData.subtitle || null,
    excerpt: localBlogData.excerpt,
    content: content,
    image: localBlogData.image,
    categories: localBlogData.categories || [],
    tags: localBlogData.tags || [],
    status: localBlogData.status || 'publish',
    author: {
      name: localBlogData.author?.name || 'Anonymous',
      avatar: localBlogData.author?.avatar || '/default-avatar.png',
      bio: localBlogData.author?.bio || null,
      social: {
        twitter: localBlogData.author?.social?.twitter || null,
        linkedin: localBlogData.author?.social?.linkedin || null
      }
    }
  };
};

/**
 * Convert blog data from the API format to the existing format
 * @param {Object} apiBlogData - Blog data from the API
 * @returns {Object} Blog data in the existing format
 */
export const convertApiToLocalBlogFormat = (apiBlogData) => {
  return {
    id: apiBlogData.id,
    title: apiBlogData.title,
    subtitle: apiBlogData.subtitle,
    excerpt: apiBlogData.excerpt,
    content: apiBlogData.content,
    image: apiBlogData.image,
    date: apiBlogData.date,
    categories: apiBlogData.categories,
    tags: apiBlogData.tags,
    readingTime: apiBlogData.readingTime,
    status: apiBlogData.status,
    author: apiBlogData.author
  };
};
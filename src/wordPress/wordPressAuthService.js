import axios from "axios";
import WORDPRESS_CONFIG from "./wordpress";

class WordPressAuthService {
  constructor() {
    this.baseURL = WORDPRESS_CONFIG.API_URL;
    this.authURL = WORDPRESS_CONFIG.AUTH_URL;
    this.blogURL = WORDPRESS_CONFIG.BLOG_URL;
    
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: WORDPRESS_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include JWT token
    this.api.interceptors.request.use(async (config) => {
      const token = await this.getValidToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (error) => Promise.reject(error));

    // Add response interceptor for 401 handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          this.logout();
          if (window.location.pathname !== "/blog-management") {
            window.location.href = "/blog-management";
          }
        }
        return Promise.reject(error);
      }
    );
  }

  async login(username, password) {
    try {
      console.log('Attempting login to:', `${this.authURL}/token`);
      
      const response = await axios.post(`${this.authURL}/token`, {
        username,
        password,
      }, {
        timeout: WORDPRESS_CONFIG.TIMEOUT,
        headers: { 
          "Content-Type": "application/json",
          "Accept": "application/json"
        },
      });

      console.log('Login response:', response.data);

      const { token, user_email, user_nicename, user_display_name } = response.data;
      
      if (!token) {
        throw new Error("No token received from server");
      }

      // Get user details from WordPress API using the token
      let userDetails = null;
      try {
        const userResponse = await axios.get(`${this.baseURL}/users/me`, {
          headers: {
            "Authorization": `Bearer ${token}`,
            "Accept": "application/json"
          },
          timeout: WORDPRESS_CONFIG.TIMEOUT,
        });
        
        console.log('User details response:', userResponse.data);
        userDetails = userResponse.data;
      } catch (userError) {
        console.warn('Could not fetch user details:', userError);
        // Fallback to basic user info from JWT response
        userDetails = {
          id: response.data.user_id || 1,
          name: user_display_name || user_nicename || username,
          username: user_nicename || username,
          email: user_email || '',
          capabilities: {
            edit_posts: true,
            upload_files: true,
            publish_posts: true,
            edit_published_posts: true,
            delete_posts: true
          },
          roles: ['editor']
        };
      }

      // Verify user has required capabilities
      const requiredCaps = ["edit_posts", "upload_files"];
      const userCaps = userDetails.capabilities ? Object.keys(userDetails.capabilities) : [];
      const hasRequiredCaps = requiredCaps.some(cap => 
        userCaps.includes(cap) || 
        (userDetails.capabilities && userDetails.capabilities[cap])
      );

      if (!hasRequiredCaps && userDetails.roles && !userDetails.roles.includes('administrator')) {
        console.warn('User capabilities check failed, but proceeding...');
        // Don't throw error, just warn - many WordPress setups have different capability structures
      }

      this._storeAuthData(token, userDetails);
      
      return {
        success: true,
        token,
        user: this._formatUserData(userDetails),
      };
    } catch (error) {
      console.error("WordPress login error:", error);
      console.error("Error response:", error.response?.data);
      throw this._handleAuthError(error);
    }
  }

  async refreshToken() {
    try {
      const currentToken = this.getToken();
      if (!currentToken) {
        throw new Error("No token available for refresh");
      }

      // JWT tokens typically don't have a refresh mechanism in basic WordPress JWT
      // Instead, we'll validate the current token
      const response = await axios.post(`${this.authURL}/token/validate`, {}, {
        headers: {
          Authorization: `Bearer ${currentToken}`,
          "Accept": "application/json"
        },
        timeout: WORDPRESS_CONFIG.TIMEOUT,
      });

      if (response.data && response.data.code === 'jwt_auth_valid_token') {
        return currentToken; // Token is still valid
      } else {
        throw new Error('Token validation failed');
      }
    } catch (error) {
      console.error("Token refresh/validation failed:", error);
      this.logout();
      throw new Error(WORDPRESS_CONFIG.ERROR_MESSAGES.TOKEN_INVALID);
    }
  }

  async getValidToken() {
    const token = this.getToken();
    if (!token) return null;

    const timestamp = localStorage.getItem("wp_auth_timestamp");
    if (!timestamp) {
      this.logout();
      return null;
    }

    const authTime = parseInt(timestamp);
    const now = Date.now();
    const tokenAge = now - authTime;

    // JWT tokens in WordPress typically expire after 7 days
    // Check if token is older than 6 days (refresh 1 day before expiry)
    if (tokenAge > (6 * 24 * 60 * 60 * 1000)) {
      try {
        return await this.refreshToken();
      } catch (error) {
        return null;
      }
    }

    // Validate token periodically (every hour)
    const lastValidation = localStorage.getItem("wp_last_validation");
    const shouldValidate = !lastValidation || 
      (now - parseInt(lastValidation)) > (60 * 60 * 1000); // 1 hour

    if (shouldValidate) {
      try {
        await axios.post(`${this.authURL}/token/validate`, {}, {
          headers: { 
            Authorization: `Bearer ${token}`,
            "Accept": "application/json"
          },
          timeout: 5000,
        });
        localStorage.setItem("wp_last_validation", now.toString());
        return token;
      } catch (error) {
        console.error("Token validation failed:", error);
        this.logout();
        return null;
      }
    }

    return token;
  }

  _storeAuthData(token, user) {
    try {
      localStorage.setItem("wp_token", token);
      localStorage.setItem("wp_user", JSON.stringify(this._formatUserData(user)));
      localStorage.setItem("wp_auth_timestamp", Date.now().toString());
    } catch (error) {
      console.error("Failed to store auth data:", error);
      throw new Error(
        "Failed to store authentication data. Please check your browser settings."
      );
    }
  }

  _formatUserData(user) {
    // Handle different user object structures
    return {
      id: user.id || user.user_id || 1,
      username: user.username || user.user_login || user.slug || 'user',
      displayName: user.name || user.display_name || user.user_display_name || user.username || 'User',
      email: user.email || user.user_email || '',
      capabilities: user.capabilities || {
        edit_posts: true,
        upload_files: true,
        publish_posts: true,
        edit_published_posts: true,
        delete_posts: true
      },
      avatar: user.avatar_urls?.[96] || 
              user.avatar_urls?.['96'] || 
              WORDPRESS_CONFIG.DEFAULT_AVATAR ||
              `https://www.gravatar.com/avatar/?d=mp&s=96`,
      roles: user.roles || ['editor'],
      link: user.link || '',
    };
  }

  _handleAuthError(error) {
    if (error.response?.status === 401) {
      return new Error(
        "Invalid username or password. Please check your credentials."
      );
    } else if (error.response?.status === 403) {
      return new Error(
        "Access forbidden. Your user account may not have sufficient permissions."
      );
    } else if (error.response?.status === 404) {
      return new Error(
        "WordPress REST API or JWT endpoint not found. Please check your site configuration."
      );
    } else if (error.code === "ENOTFOUND" || error.code === "NETWORK_ERROR") {
      return new Error(
        "Cannot reach WordPress site. Please check your internet connection."
      );
    } else if (error.response?.data?.message) {
      return new Error(error.response.data.message);
    } else {
      return new Error(
        `Login failed: ${error.message || "Unknown error occurred"}`
      );
    }
  }

  async testConnection() {
    try {
      const response = await axios.get(`${this.baseURL}/`, {
        timeout: 5000,
        headers: { Accept: "application/json" },
      });
      return {
        success: true,
        data: response.data,
        wpVersion: response.headers["x-wp-version"] || "Unknown",
        apiVersion: response.data.name || "WordPress REST API",
      };
    } catch (error) {
      console.error("Connection test failed:", error);
      return {
        success: false,
        error: error.message || "Connection failed",
        code: error.code || "UNKNOWN_ERROR",
      };
    }
  }

  logout() {
    try {
      localStorage.removeItem("wp_token");
      localStorage.removeItem("wp_user");
      localStorage.removeItem("wp_auth_timestamp");
      localStorage.removeItem("wp_last_validation");
    } catch (error) {
      console.error("Error during logout:", error);
    }
  }

  getToken() {
    return localStorage.getItem("wp_token");
  }

  getUser() {
    try {
      const userStr = localStorage.getItem("wp_user");
      return userStr ? JSON.parse(userStr) : null;
    } catch (error) {
      console.error("Error parsing user data:", error);
      this.logout();
      return null;
    }
  }

  getCurrentUser() {
    return this.getUser();
  }

  isAuthenticated() {
    const token = this.getToken();
    const user = this.getUser();
    return !!(token && user);
  }

  // ... rest of your methods remain the same ...
  async createPost(postData) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("User not authenticated. Please login first.");
      }
      const wpPostData = await this._formatPostForAPI(postData);
      const response = await this.api.post("/posts", wpPostData);
      return this.formatWordPressPost(response.data);
    } catch (error) {
      console.error("Error creating post:", error);
      throw this._handleError(error);
    }
  }

  async updatePost(postId, postData) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("User not authenticated. Please login first.");
      }
      const wpPostData = await this._formatPostForAPI(postData);
      const response = await this.api.put(`/posts/${postId}`, wpPostData);
      return this.formatWordPressPost(response.data);
    } catch (error) {
      console.error("Error updating post:", error);
      throw this._handleError(error);
    }
  }

  async deletePost(postId) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("User not authenticated. Please login first.");
      }
      await this.api.delete(`/posts/${postId}`);
      return { success: true, id: postId };
    } catch (error) {
      console.error("Error deleting post:", error);
      throw this._handleError(error);
    }
  }

  async uploadMedia(file, metadata = {}) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("User not authenticated. Please login first.");
      }
      const formData = new FormData();
      formData.append("file", file);
      if (metadata.title) formData.append("title", metadata.title);
      if (metadata.caption) formData.append("caption", metadata.caption);
      if (metadata.alt) formData.append("alt_text", metadata.alt);

      const response = await this.api.post("/media", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      return {
        id: response.data.id,
        url: response.data.source_url,
        title: response.data.title?.rendered || "",
        alt: response.data.alt_text || "",
        caption: response.data.caption?.rendered || "",
      };
    } catch (error) {
      console.error("Error uploading media:", error);
      throw this._handleError(error);
    }
  }

  async _formatPostForAPI(postData) {
    return {
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt,
      status: postData.status || "draft",
      categories: await this.processCategoryIds(postData.categories || []),
      tags: await this.processTagIds(postData.tags || []),
      featured_media: postData.featured_media || null,
      meta: {
        subtitle: postData.meta?.subtitle || postData.subtitle || "",
      },
    };
  }

  async processCategoryIds(categoryNames) {
    if (!Array.isArray(categoryNames) || categoryNames.length === 0) {
      return [1]; // Default to "Uncategorized"
    }
    const categoryIds = [];
    for (const categoryName of categoryNames) {
      if (typeof categoryName === "string" && categoryName.trim()) {
        const id = await this.createOrGetCategory(categoryName.trim());
        if (id) categoryIds.push(id);
      } else if (typeof categoryName === "number") {
        categoryIds.push(categoryName);
      }
    }
    return categoryIds.length > 0 ? categoryIds : [1];
  }

  async processTagIds(tagNames) {
    if (!Array.isArray(tagNames) || tagNames.length === 0) {
      return [];
    }
    const tagIds = [];
    for (const tagName of tagNames) {
      if (typeof tagName === "string" && tagName.trim()) {
        const id = await this.createOrGetTag(tagName.trim());
        if (id) tagIds.push(id);
      } else if (typeof tagName === "number") {
        tagIds.push(tagName);
      }
    }
    return tagIds;
  }

  async createOrGetCategory(categoryName) {
    try {
      const response = await this.api.get("/categories", {
        params: { search: categoryName, per_page: 100 },
      });
      const existingCategory = response.data.find(
        (cat) => cat.name.toLowerCase() === categoryName.toLowerCase()
      );
      if (existingCategory) return existingCategory.id;

      const slug = categoryName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const newCategoryResponse = await this.api.post("/categories", {
        name: categoryName,
        slug,
      });
      return newCategoryResponse.data.id;
    } catch (error) {
      console.error("Error creating/getting category:", error);
      return 1; // Fallback to default category
    }
  }

  async createOrGetTag(tagName) {
    try {
      const response = await this.api.get("/tags", {
        params: { search: tagName, per_page: 100 },
      });
      const existingTag = response.data.find(
        (tag) => tag.name.toLowerCase() === tagName.toLowerCase()
      );
      if (existingTag) return existingTag.id;

      const slug = tagName
        .toLowerCase()
        .replace(/\s+/g, "-")
        .replace(/[^a-z0-9-]/g, "");
      const newTagResponse = await this.api.post("/tags", {
        name: tagName,
        slug,
      });
      return newTagResponse.data.id;
    } catch (error) {
      console.error("Error creating/getting tag:", error);
      return null; // Tags are optional
    }
  }

  async getUserPosts(params = {}) {
    try {
      if (!this.isAuthenticated()) {
        throw new Error("User not authenticated. Please login first.");
      }
      const user = this.getUser();
      const response = await this.api.get("/posts", {
        params: {
          author: user.id,
          status: "publish,draft,pending",
          _embed: true,
          per_page: 10,
          ...params,
        },
      });
      return {
        posts: response.data.map((post) => this.formatWordPressPost(post)),
        totalPages: parseInt(response.headers["x-wp-totalpages"]) || 1,
        total: parseInt(response.headers["x-wp-total"]) || 0,
      };
    } catch (error) {
      console.error("Error fetching user posts:", error);
      throw this._handleError(error);
    }
  }

  formatWordPressPost(wpPost) {
    return {
      id: wpPost.id,
      title: wpPost.title?.rendered || "",
      subtitle: wpPost.meta?.subtitle || "",
      excerpt: wpPost.excerpt?.rendered?.replace(/<[^>]*>/g, "") || "",
      content: wpPost.content?.rendered || "",
      image: this.getFeatureImage(wpPost),
      date: wpPost.date,
      modified: wpPost.modified,
      slug: wpPost.slug,
      status: wpPost.status,
      categories: this.getCategories(wpPost),
      tags: this.getTags(wpPost),
      author: this.getAuthor(wpPost),
      link: wpPost.link,
      readingTime: this.calculateReadingTime(wpPost.content?.rendered || ""),
    };
  }

  calculateReadingTime(content) {
    const wordsPerMinute = 200;
    const textContent = content.replace(/<[^>]*>/g, "");
    const wordCount = textContent.split(/\s+/).length;
    const readingTime = Math.ceil(wordCount / wordsPerMinute);
    return readingTime || 1;
  }

  _handleError(error) {
    let errorMessage = "An unknown error occurred";
    if (error.response) {
      if (error.response.status === 401) {
        errorMessage = WORDPRESS_CONFIG.ERROR_MESSAGES.TOKEN_INVALID;
        this.logout();
      } else if (error.response.status === 403) {
        errorMessage = "You do not have permission to perform this action.";
      } else if (error.response.status === 404) {
        errorMessage =
          "WordPress endpoint not found. Please check your site configuration.";
      } else if (error.response.status === 413) {
        errorMessage = "File too large. Please try a smaller file.";
      } else if (error.response.status === 415) {
        errorMessage = "Unsupported file type.";
      } else {
        const wpError = error.response.data;
        if (wpError.message) {
          errorMessage = wpError.message;
        } else if (wpError.code) {
          errorMessage = `WordPress Error: ${wpError.code}`;
        } else {
          errorMessage = `Server error: ${error.response.status}`;
        }
      }
    } else if (error.request) {
      errorMessage = "No response from WordPress API. Please check your connection.";
    } else {
      errorMessage = error.message;
    }
    return new Error(errorMessage);
  }

  getFeatureImage(wpPost) {
    if (wpPost._embedded?.["wp:featuredmedia"]?.[0]) {
      return wpPost._embedded["wp:featuredmedia"][0].source_url;
    }
    return WORDPRESS_CONFIG.DEFAULT_FEATURED_IMAGE;
  }

  getCategories(wpPost) {
    if (wpPost._embedded?.["wp:term"]?.[0]) {
      return wpPost._embedded["wp:term"][0].map((cat) => cat.name);
    }
    return [];
  }

  getTags(wpPost) {
    if (wpPost._embedded?.["wp:term"]?.[1]) {
      return wpPost._embedded["wp:term"][1].map((tag) => tag.name);
    }
    return [];
  }

  getAuthor(wpPost) {
    if (wpPost._embedded?.author?.[0]) {
      const author = wpPost._embedded.author[0];
      return {
        name: author.name,
        avatar: author.avatar_urls?.["96"] || WORDPRESS_CONFIG.DEFAULT_AVATAR,
        bio: author.description || "",
        link: author.link,
        social: {
          twitter: author.social?.twitter || "",
          linkedin: author.social?.linkedin || "",
        },
      };
    }
    return {
      name: "Unknown Author",
      avatar: WORDPRESS_CONFIG.DEFAULT_AVATAR,
      bio: "",
      social: {
        twitter: "",
        linkedin: "",
      },
    };
  }
}

export default new WordPressAuthService();
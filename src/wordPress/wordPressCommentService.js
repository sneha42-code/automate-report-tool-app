// wordPressCommentService.js
import axios from "axios";
import WORDPRESS_CONFIG from "./wordpress";
import WordPressAuthService from "./wordPressAuthService";

class WordPressCommentService {
  constructor() {
    this.baseURL = WORDPRESS_CONFIG.API_URL;
    this.api = axios.create({
      baseURL: this.baseURL,
      timeout: WORDPRESS_CONFIG.TIMEOUT,
      headers: {
        "Content-Type": "application/json",
      },
    });

    // Add request interceptor to include JWT token
    this.api.interceptors.request.use(async (config) => {
      const token = await WordPressAuthService.getValidToken();
      if (token) {
        config.headers.Authorization = `Bearer ${token}`;
      }
      return config;
    }, (error) => Promise.reject(error));

    // Add response interceptor for error handling
    this.api.interceptors.response.use(
      (response) => response,
      (error) => {
        if (error.response?.status === 401) {
          WordPressAuthService.logout();
        }
        return Promise.reject(error);
      }
    );
  }

  // Get comments for a specific post
  async getComments(postId, params = {}) {
    try {
      const defaultParams = {
        post: postId,
        per_page: 50,
        order: 'asc',
        orderby: 'date',
        status: 'approve',
        ...params,
      };

      const response = await this.api.get("/comments", { params: defaultParams });
      
      return {
        comments: response.data.map(comment => this.formatComment(comment)),
        totalPages: parseInt(response.headers["x-wp-totalpages"]) || 1,
        total: parseInt(response.headers["x-wp-total"]) || 0,
      };
    } catch (error) {
      console.error("Error fetching comments:", error);
      throw this._handleError(error);
    }
  }

  // Create a new comment
  async createComment(commentData) {
    try {
      const validation = this.validateCommentData(commentData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join("; "));
      }

      const requestData = {
        post: commentData.postId,
        content: commentData.content,
        parent: commentData.parentId || 0,
      };

      // If user is not authenticated, include guest info
      if (!WordPressAuthService.isAuthenticated()) {
        if (!commentData.authorName || !commentData.authorEmail) {
          throw new Error("Name and email are required for guest comments");
        }
        
        requestData.author_name = commentData.authorName;
        requestData.author_email = commentData.authorEmail;
        requestData.author_url = commentData.authorUrl || '';
      }

      const response = await this.api.post("/comments", requestData);
      return this.formatComment(response.data);
    } catch (error) {
      console.error("Error creating comment:", error);
      throw this._handleError(error);
    }
  }

  // Update a comment (only by author or admin)
  async updateComment(commentId, content) {
    try {
      if (!WordPressAuthService.isAuthenticated()) {
        throw new Error("Authentication required to update comments");
      }

      const response = await this.api.put(`/comments/${commentId}`, {
        content: content
      });

      return this.formatComment(response.data);
    } catch (error) {
      console.error("Error updating comment:", error);
      throw this._handleError(error);
    }
  }

  // Delete a comment (only by author or admin)
  async deleteComment(commentId, force = false) {
    try {
      if (!WordPressAuthService.isAuthenticated()) {
        throw new Error("Authentication required to delete comments");
      }

      const params = force ? { force: true } : {};
      await this.api.delete(`/comments/${commentId}`, { params });
      return true;
    } catch (error) {
      console.error("Error deleting comment:", error);
      throw this._handleError(error);
    }
  }

  // Get comment replies (nested comments)
  async getCommentReplies(parentId, params = {}) {
    try {
      const defaultParams = {
        parent: parentId,
        per_page: 50,
        order: 'asc',
        orderby: 'date',
        status: 'approve',
        ...params,
      };

      const response = await this.api.get("/comments", { params: defaultParams });
      return response.data.map(comment => this.formatComment(comment));
    } catch (error) {
      console.error("Error fetching comment replies:", error);
      throw this._handleError(error);
    }
  }

  // Organize comments into threaded structure
  organizeCommentsThreaded(comments) {
    const commentMap = new Map();
    const rootComments = [];

    // First pass: create map of all comments
    comments.forEach(comment => {
      comment.replies = [];
      commentMap.set(comment.id, comment);
    });

    // Second pass: organize into tree structure
    comments.forEach(comment => {
      if (comment.parentId && comment.parentId !== 0) {
        const parent = commentMap.get(comment.parentId);
        if (parent) {
          parent.replies.push(comment);
        } else {
          rootComments.push(comment); // Parent not found, treat as root
        }
      } else {
        rootComments.push(comment);
      }
    });

    return rootComments;
  }

  // Get comment statistics for a post
  async getCommentStats(postId) {
    try {
      const response = await this.api.get("/comments", {
        params: {
          post: postId,
          per_page: 1,
          status: 'approve'
        }
      });

      return {
        total: parseInt(response.headers["x-wp-total"]) || 0,
        postId: postId
      };
    } catch (error) {
      console.error("Error fetching comment stats:", error);
      return { total: 0, postId: postId };
    }
  }

  // Moderate comment (admin only)
  async moderateComment(commentId, status) {
    try {
      if (!this.canModerateComments()) {
        throw new Error("You don't have permission to moderate comments");
      }

      const validStatuses = ['approve', 'hold', 'spam', 'trash'];
      if (!validStatuses.includes(status)) {
        throw new Error("Invalid comment status");
      }

      const response = await this.api.put(`/comments/${commentId}`, {
        status: status
      });

      return this.formatComment(response.data);
    } catch (error) {
      console.error("Error moderating comment:", error);
      throw this._handleError(error);
    }
  }

  // Get comments for moderation (admin only)
  async getCommentsForModeration(params = {}) {
    try {
      if (!this.canModerateComments()) {
        throw new Error("You don't have permission to moderate comments");
      }

      const defaultParams = {
        per_page: 50,
        context: 'edit',
        status: 'hold',
        ...params,
      };

      const response = await this.api.get("/comments", { params: defaultParams });
      
      return {
        comments: response.data.map(comment => this.formatComment(comment)),
        totalPages: parseInt(response.headers["x-wp-totalpages"]) || 1,
        total: parseInt(response.headers["x-wp-total"]) || 0,
      };
    } catch (error) {
      console.error("Error fetching comments for moderation:", error);
      throw this._handleError(error);
    }
  }

  // Check if current user can moderate comments
  canModerateComments() {
    const currentUser = WordPressAuthService.getCurrentUser();
    if (!currentUser) return false;

    const moderationRoles = ["administrator", "editor"];
    return (
      currentUser.roles?.some(role => moderationRoles.includes(role)) ||
      Object.keys(currentUser.capabilities || {}).includes("moderate_comments")
    );
  }

  // Check if current user can edit a specific comment
  canEditComment(comment) {
    const currentUser = WordPressAuthService.getCurrentUser();
    if (!currentUser) return false;

    // User can edit their own comments or if they have moderation rights
    return (
      comment.authorId === currentUser.id ||
      this.canModerateComments()
    );
  }

  // Format WordPress comment for frontend use
  formatComment(wpComment) {
    return {
      id: wpComment.id,
      postId: wpComment.post,
      parentId: wpComment.parent || 0,
      content: wpComment.content?.rendered || wpComment.content || "",
      rawContent: wpComment.content?.raw || wpComment.content || "",
      author: {
        id: wpComment.author || 0,
        name: wpComment.author_name || "Anonymous",
        email: wpComment.author_email || "",
        url: wpComment.author_url || "",
        avatar: wpComment.author_avatar_urls?.[48] || 
                `https://www.gravatar.com/avatar/${this.md5(wpComment.author_email || '')}?d=mp&s=48`
      },
      authorId: wpComment.author || 0,
      date: wpComment.date,
      dateGmt: wpComment.date_gmt,
      status: wpComment.status || 'approve',
      link: wpComment.link,
      meta: wpComment.meta || {},
      replies: [], // Will be populated by organizeCommentsThreaded
    };
  }

  // Validate comment data
  validateCommentData(commentData) {
    const errors = {};

    if (!commentData.postId) {
      errors.postId = "Post ID is required";
    }

    if (!commentData.content || !commentData.content.trim()) {
      errors.content = "Comment content is required";
    } else if (commentData.content.length > 65535) {
      errors.content = "Comment is too long";
    }

    // For guest comments
    if (!WordPressAuthService.isAuthenticated()) {
      if (!commentData.authorName || !commentData.authorName.trim()) {
        errors.authorName = "Name is required";
      }

      if (!commentData.authorEmail || !commentData.authorEmail.trim()) {
        errors.authorEmail = "Email is required";
      } else if (!/\S+@\S+\.\S+/.test(commentData.authorEmail)) {
        errors.authorEmail = "Valid email is required";
      }
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  // Simple MD5 hash for Gravatar (you might want to use a proper crypto library)
  md5(string) {
    // This is a simplified MD5 implementation for demo purposes
    // In a real app, use a proper crypto library
    return string.toLowerCase().replace(/\s/g, '');
  }

  // Handle API errors
  _handleError(error) {
    let errorMessage = "An unknown error occurred";

    if (error.response) {
      const wpError = error.response.data;

      if (error.response.status === 401) {
        errorMessage = "Authentication required. Please log in.";
      } else if (error.response.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (error.response.status === 404) {
        errorMessage = "Comment or post not found.";
      } else if (error.response.status === 409) {
        errorMessage = "Duplicate comment detected.";
      } else if (wpError.message) {
        errorMessage = wpError.message;
      } else if (wpError.code) {
        errorMessage = `WordPress Error: ${wpError.code}`;
      } else {
        errorMessage = `Server error: ${error.response.status}`;
      }
    } else if (error.request) {
      errorMessage = "No response from WordPress API. Please check your connection.";
    } else {
      errorMessage = error.message;
    }

    return new Error(errorMessage);
  }
}

export default new WordPressCommentService();
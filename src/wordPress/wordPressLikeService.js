// wordPressLikeService.js
import axios from "axios";
import WORDPRESS_CONFIG from "./wordpress";
import WordPressAuthService from "./wordPressAuthService";

class WordPressLikeService {
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

    // Local storage keys for anonymous likes (when user is not authenticated)
    this.STORAGE_KEY = 'wp_anonymous_likes';
    this.STORAGE_REACTIONS_KEY = 'wp_anonymous_reactions';
  }

  // Toggle like for a post
  async toggleLike(postId) {
    try {
      if (WordPressAuthService.isAuthenticated()) {
        return await this._toggleAuthenticatedLike(postId);
      } else {
        return this._toggleAnonymousLike(postId);
      }
    } catch (error) {
      console.error("Error toggling like:", error);
      throw this._handleError(error);
    }
  }

  // Add reaction to a post (emoji reactions)
  async addReaction(postId, reactionType) {
    try {
      const validReactions = ['like', 'love', 'laugh', 'wow', 'sad', 'angry'];
      if (!validReactions.includes(reactionType)) {
        throw new Error("Invalid reaction type");
      }

      if (WordPressAuthService.isAuthenticated()) {
        return await this._addAuthenticatedReaction(postId, reactionType);
      } else {
        return this._addAnonymousReaction(postId, reactionType);
      }
    } catch (error) {
      console.error("Error adding reaction:", error);
      throw this._handleError(error);
    }
  }

  // Get like/reaction stats for a post
  async getPostStats(postId) {
    try {
      // Try to get from WordPress meta first (for authenticated likes)
      let stats = {
        postId: postId,
        likes: 0,
        reactions: {
          like: 0,
          love: 0,
          laugh: 0,
          wow: 0,
          sad: 0,
          angry: 0
        },
        userLiked: false,
        userReaction: null
      };

      if (WordPressAuthService.isAuthenticated()) {
        // Get authenticated stats from WordPress
        const response = await this.api.get(`/posts/${postId}`, {
          params: { context: 'edit' }
        });

        if (response.data.meta) {
          stats.likes = parseInt(response.data.meta.likes_count) || 0;
          stats.reactions = {
            like: parseInt(response.data.meta.reaction_like) || 0,
            love: parseInt(response.data.meta.reaction_love) || 0,
            laugh: parseInt(response.data.meta.reaction_laugh) || 0,
            wow: parseInt(response.data.meta.reaction_wow) || 0,
            sad: parseInt(response.data.meta.reaction_sad) || 0,
            angry: parseInt(response.data.meta.reaction_angry) || 0,
          };

          // Check if current user has liked/reacted
          const currentUser = WordPressAuthService.getCurrentUser();
          if (currentUser) {
            const userLikes = response.data.meta.user_likes ? 
              JSON.parse(response.data.meta.user_likes) : [];
            const userReactions = response.data.meta.user_reactions ? 
              JSON.parse(response.data.meta.user_reactions) : {};

            stats.userLiked = userLikes.includes(currentUser.id);
            stats.userReaction = userReactions[currentUser.id] || null;
          }
        }
      }

      // Add anonymous stats from localStorage
      const anonymousLikes = this._getAnonymousLikes();
      const anonymousReactions = this._getAnonymousReactions();

      if (anonymousLikes.includes(postId.toString())) {
        stats.userLiked = true;
        if (!WordPressAuthService.isAuthenticated()) {
          stats.likes += 1; // Add anonymous like to count
        }
      }

      const userAnonymousReaction = anonymousReactions[postId];
      if (userAnonymousReaction) {
        stats.userReaction = userAnonymousReaction;
        if (!WordPressAuthService.isAuthenticated()) {
          stats.reactions[userAnonymousReaction] += 1;
        }
      }

      return stats;
    } catch (error) {
      console.error("Error fetching post stats:", error);
      // Return default stats on error
      return {
        postId: postId,
        likes: 0,
        reactions: {
          like: 0,
          love: 0,
          laugh: 0,
          wow: 0,
          sad: 0,
          angry: 0
        },
        userLiked: false,
        userReaction: null
      };
    }
  }

  // Get stats for multiple posts at once
  async getMultiplePostStats(postIds) {
    try {
      const statsPromises = postIds.map(postId => this.getPostStats(postId));
      const results = await Promise.all(statsPromises);
      
      return results.reduce((acc, stats) => {
        acc[stats.postId] = stats;
        return acc;
      }, {});
    } catch (error) {
      console.error("Error fetching multiple post stats:", error);
      throw this._handleError(error);
    }
  }

  // Get popular posts based on likes/reactions
  async getPopularPosts(timeframe = 'all', limit = 10) {
    try {
      let dateQuery = '';
      if (timeframe === 'week') {
        const weekAgo = new Date();
        weekAgo.setDate(weekAgo.getDate() - 7);
        dateQuery = weekAgo.toISOString();
      } else if (timeframe === 'month') {
        const monthAgo = new Date();
        monthAgo.setMonth(monthAgo.getMonth() - 1);
        dateQuery = monthAgo.toISOString();
      }

      const params = {
        per_page: limit,
        meta_key: 'likes_count',
        orderby: 'meta_value_num',
        order: 'desc',
        _embed: true
      };

      if (dateQuery) {
        params.after = dateQuery;
      }

      const response = await this.api.get('/posts', { params });
      return response.data.map(post => ({
        id: post.id,
        title: post.title?.rendered || '',
        link: post.link,
        likesCount: parseInt(post.meta?.likes_count) || 0,
        totalReactions: this._calculateTotalReactions(post.meta)
      }));
    } catch (error) {
      console.error("Error fetching popular posts:", error);
      return [];
    }
  }

  // Private method: Toggle authenticated like
  async _toggleAuthenticatedLike(postId) {
    const currentUser = WordPressAuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Get current post meta
    const postResponse = await this.api.get(`/posts/${postId}`, {
      params: { context: 'edit' }
    });

    const currentMeta = postResponse.data.meta || {};
    const likesCount = parseInt(currentMeta.likes_count) || 0;
    const userLikes = currentMeta.user_likes ? 
      JSON.parse(currentMeta.user_likes) : [];

    const userHasLiked = userLikes.includes(currentUser.id);
    let newLikesCount = likesCount;
    let newUserLikes = [...userLikes];

    if (userHasLiked) {
      // Remove like
      newLikesCount = Math.max(0, likesCount - 1);
      newUserLikes = userLikes.filter(id => id !== currentUser.id);
    } else {
      // Add like
      newLikesCount = likesCount + 1;
      newUserLikes.push(currentUser.id);
    }

    // Update post meta
    await this.api.put(`/posts/${postId}`, {
      meta: {
        likes_count: newLikesCount,
        user_likes: JSON.stringify(newUserLikes)
      }
    });

    return {
      liked: !userHasLiked,
      likesCount: newLikesCount
    };
  }

  // Private method: Toggle anonymous like
  _toggleAnonymousLike(postId) {
    const anonymousLikes = this._getAnonymousLikes();
    const postIdStr = postId.toString();
    const userHasLiked = anonymousLikes.includes(postIdStr);

    if (userHasLiked) {
      // Remove like
      const newLikes = anonymousLikes.filter(id => id !== postIdStr);
      this._setAnonymousLikes(newLikes);
    } else {
      // Add like
      anonymousLikes.push(postIdStr);
      this._setAnonymousLikes(anonymousLikes);
    }

    return {
      liked: !userHasLiked,
      likesCount: userHasLiked ? -1 : 1 // Return relative change
    };
  }

  // Private method: Add authenticated reaction
  async _addAuthenticatedReaction(postId, reactionType) {
    const currentUser = WordPressAuthService.getCurrentUser();
    if (!currentUser) {
      throw new Error("User not authenticated");
    }

    // Get current post meta
    const postResponse = await this.api.get(`/posts/${postId}`, {
      params: { context: 'edit' }
    });

    const currentMeta = postResponse.data.meta || {};
    const userReactions = currentMeta.user_reactions ? 
      JSON.parse(currentMeta.user_reactions) : {};

    const currentReaction = userReactions[currentUser.id];
    
    // Update reaction counts
    const newMeta = { ...currentMeta };
    
    // Remove old reaction count if exists
    if (currentReaction) {
      const oldKey = `reaction_${currentReaction}`;
      newMeta[oldKey] = Math.max(0, (parseInt(newMeta[oldKey]) || 0) - 1);
    }

    // Add new reaction count
    const newKey = `reaction_${reactionType}`;
    newMeta[newKey] = (parseInt(newMeta[newKey]) || 0) + 1;

    // Update user reactions
    if (currentReaction === reactionType) {
      // Remove reaction if same type
      delete userReactions[currentUser.id];
    } else {
      // Set new reaction
      userReactions[currentUser.id] = reactionType;
    }

    newMeta.user_reactions = JSON.stringify(userReactions);

    // Update post meta
    await this.api.put(`/posts/${postId}`, {
      meta: newMeta
    });

    return {
      reaction: currentReaction === reactionType ? null : reactionType,
      reactionCounts: {
        like: parseInt(newMeta.reaction_like) || 0,
        love: parseInt(newMeta.reaction_love) || 0,
        laugh: parseInt(newMeta.reaction_laugh) || 0,
        wow: parseInt(newMeta.reaction_wow) || 0,
        sad: parseInt(newMeta.reaction_sad) || 0,
        angry: parseInt(newMeta.reaction_angry) || 0,
      }
    };
  }

  // Private method: Add anonymous reaction
  _addAnonymousReaction(postId, reactionType) {
    const anonymousReactions = this._getAnonymousReactions();
    const postIdStr = postId.toString();
    const currentReaction = anonymousReactions[postIdStr];

    if (currentReaction === reactionType) {
      // Remove reaction if same type
      delete anonymousReactions[postIdStr];
    } else {
      // Set new reaction
      anonymousReactions[postIdStr] = reactionType;
    }

    this._setAnonymousReactions(anonymousReactions);

    return {
      reaction: currentReaction === reactionType ? null : reactionType,
      oldReaction: currentReaction
    };
  }

  // Private helper methods for localStorage
  _getAnonymousLikes() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_KEY) || '[]');
    } catch {
      return [];
    }
  }

  _setAnonymousLikes(likes) {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(likes));
    } catch (error) {
      console.warn('Could not save anonymous likes to localStorage:', error);
    }
  }

  _getAnonymousReactions() {
    try {
      return JSON.parse(localStorage.getItem(this.STORAGE_REACTIONS_KEY) || '{}');
    } catch {
      return {};
    }
  }

  _setAnonymousReactions(reactions) {
    try {
      localStorage.setItem(this.STORAGE_REACTIONS_KEY, JSON.stringify(reactions));
    } catch (error) {
      console.warn('Could not save anonymous reactions to localStorage:', error);
    }
  }

  _calculateTotalReactions(meta) {
    if (!meta) return 0;
    
    return (parseInt(meta.reaction_like) || 0) +
           (parseInt(meta.reaction_love) || 0) +
           (parseInt(meta.reaction_laugh) || 0) +
           (parseInt(meta.reaction_wow) || 0) +
           (parseInt(meta.reaction_sad) || 0) +
           (parseInt(meta.reaction_angry) || 0);
  }

  // Handle API errors
  _handleError(error) {
    let errorMessage = "An unknown error occurred";

    if (error.response) {
      const wpError = error.response.data;

      if (error.response.status === 401) {
        errorMessage = "Authentication required for this action.";
      } else if (error.response.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (error.response.status === 404) {
        errorMessage = "Post not found.";
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

export default new WordPressLikeService();
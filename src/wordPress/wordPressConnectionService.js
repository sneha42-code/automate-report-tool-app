import WordPressAuthService from './wordPressAuthService';
import WordPressService from './wordPressApiService';
import WORDPRESS_CONFIG from './wordpress';

class WordPressConnectionService {
  constructor() {
    this.connectionStatus = 'disconnected'; // disconnected, connecting, connected, error
    this.lastError = null;
    this.listeners = [];
  }

  // Connection Management
  async testConnection() {
    try {
      this.setStatus('connecting');
      
      // Test basic API connectivity
      const response = await fetch(`${WORDPRESS_CONFIG.API_URL}/posts?per_page=1`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
        },
        timeout: WORDPRESS_CONFIG.TIMEOUT
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }

      // Test if REST API is accessible
      const data = await response.json();

      const result = {
        apiConnection: response.ok,
        wpVersion: response.headers.get('X-WP-Version') || 'Unknown',
        timestamp: new Date().toISOString(),
        postsFound: Array.isArray(data) ? data.length : 0,
        apiData: data
      };

      this.setStatus('connected');
      return result;
    } catch (error) {
      this.setStatus('error', error.message);
      throw error;
    }
  }

  async connect(username, password) {
    try {
      this.setStatus('connecting');
      
      const result = await WordPressAuthService.login(username, password);
      
      if (result.success) {
        this.setStatus('connected');
        this.notifyListeners('authenticated', result.user);
        return result;
      } else {
        throw new Error('Authentication failed');
      }
    } catch (error) {
      this.setStatus('error', error.message);
      throw error;
    }
  }

  disconnect() {
    WordPressAuthService.logout();
    this.setStatus('disconnected');
    this.notifyListeners('disconnected');
  }

  // Status Management
  setStatus(status, error = null) {
    this.connectionStatus = status;
    this.lastError = error;
    this.notifyListeners('statusChanged', { status, error });
  }

  getStatus() {
    return {
      status: this.connectionStatus,
      error: this.lastError,
      isAuthenticated: WordPressAuthService.isAuthenticated(),
      user: WordPressAuthService.getCurrentUser()
    };
  }

  // Event Listeners
  addListener(callback) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter(listener => listener !== callback);
    };
  }

  notifyListeners(event, data = null) {
    this.listeners.forEach(listener => {
      try {
        listener(event, data);
      } catch (error) {
        console.error('Error in WordPress connection listener:', error);
      }
    });
  }

  // Content Management Helpers
  async syncPost(localPost) {
    try {
      if (!WordPressAuthService.isAuthenticated()) {
        throw new Error('Not authenticated with WordPress');
      }

      // Convert local post format to WordPress format
      const wpPostData = this.formatPostForWordPress(localPost);
      
      // Create or update post
      let result;
      if (localPost.wpId || localPost.id) {
        const postId = localPost.wpId || localPost.id;
        result = await WordPressAuthService.updatePost(postId, wpPostData);
      } else {
        result = await WordPressAuthService.createPost(wpPostData);
      }

      return result;
    } catch (error) {
      console.error('Error syncing post to WordPress:', error);
      throw error;
    }
  }

  async uploadImage(file, metadata = {}) {
    try {
      if (!WordPressAuthService.isAuthenticated()) {
        throw new Error('Not authenticated with WordPress');
      }

      const result = await WordPressAuthService.uploadMedia(file, metadata);
      
      return result;
    } catch (error) {
      console.error('Error uploading image to WordPress:', error);
      throw error;
    }
  }

  async updateMediaMetadata(mediaId, metadata) {
    try {
      const updateData = {};
      
      if (metadata.title) updateData.title = metadata.title;
      if (metadata.caption) updateData.caption = metadata.caption;
      if (metadata.alt) updateData.alt_text = metadata.alt;

      const response = await WordPressAuthService.api.put(`/media/${mediaId}`, updateData);
      return response.data;
    } catch (error) {
      console.error('Error updating media metadata:', error);
      throw error;
    }
  }

  // Get user's posts using the auth service
  async getUserPosts(params = {}) {
    try {
      if (!WordPressAuthService.isAuthenticated()) {
        throw new Error('Not authenticated with WordPress');
      }

      return await WordPressAuthService.getUserPosts(params);
    } catch (error) {
      console.error('Error fetching user posts:', error);
      throw error;
    }
  }

  // Get all posts (public) using the API service
  async getAllPosts(params = {}) {
    try {
      return await WordPressService.getPosts(params);
    } catch (error) {
      console.error('Error fetching all posts:', error);
      throw error;
    }
  }

  // Get single post
  async getPost(identifier) {
    try {
      return await WordPressService.getPost(identifier);
    } catch (error) {
      console.error('Error fetching post:', error);
      throw error;
    }
  }

  // Get categories
  async getCategories() {
    try {
      return await WordPressService.getCategories();
    } catch (error) {
      console.error('Error fetching categories:', error);
      throw error;
    }
  }

  // Get tags
  async getTags() {
    try {
      return await WordPressService.getTags();
    } catch (error) {
      console.error('Error fetching tags:', error);
      throw error;
    }
  }

  // Search posts
  async searchPosts(searchTerm, params = {}) {
    try {
      return await WordPressService.searchPosts(searchTerm, params);
    } catch (error) {
      console.error('Error searching posts:', error);
      throw error;
    }
  }

  // Data Formatting
  formatPostForWordPress(localPost) {
    // If content is an array of sections, convert to HTML
    let contentHtml = '';
    
    if (Array.isArray(localPost.content)) {
      contentHtml = this.formatContentSections(localPost.content);
    } else if (typeof localPost.content === 'string') {
      contentHtml = localPost.content;
    }
    
    return {
      title: localPost.title || '',
      content: contentHtml,
      excerpt: localPost.excerpt || '',
      status: localPost.status || 'draft',
      meta: {
        subtitle: localPost.subtitle || ''
      },
      categories: localPost.categories || [],
      tags: localPost.tags || [],
      featured_media: localPost.featuredImageId || localPost.featured_media || null,
    };
  }

  formatContentSections(sections) {
    if (!Array.isArray(sections)) return '';
    
    return sections.map(section => {
      switch (section.type) {
        case 'paragraph':
          return `<p>${this.escapeHtml(section.content || '')}</p>`;
        case 'heading':
          return `<h2>${this.escapeHtml(section.content || '')}</h2>`;
        case 'subheading':
          return `<h3>${this.escapeHtml(section.content || '')}</h3>`;
        case 'image':
          const caption = section.caption ? `<figcaption>${this.escapeHtml(section.caption)}</figcaption>` : '';
          return `<figure><img src="${section.url || ''}" alt="${this.escapeHtml(section.caption || section.alt || '')}" />${caption}</figure>`;
        case 'quote':
          const attribution = section.attribution ? `<cite>— ${this.escapeHtml(section.attribution)}</cite>` : '';
          return `<blockquote><p>${this.escapeHtml(section.content || '')}</p>${attribution}</blockquote>`;
        case 'list':
          if (Array.isArray(section.items)) {
            const items = section.items.map(item => `<li>${this.escapeHtml(item)}</li>`).join('');
            return `<ul>${items}</ul>`;
          }
          return '';
        default:
          return `<p>${this.escapeHtml(section.content || '')}</p>`;
      }
    }).filter(Boolean).join('\n\n');
  }

  escapeHtml(text) {
    if (typeof text !== 'string') return '';
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }

  // Batch Operations
  async batchSyncPosts(localPosts, onProgress = null) {
    const results = [];
    const total = localPosts.length;
    
    for (let i = 0; i < localPosts.length; i++) {
      try {
        const result = await this.syncPost(localPosts[i]);
        results.push({ success: true, post: result, index: i });
        
        if (onProgress) {
          onProgress(i + 1, total, result);
        }
      } catch (error) {
        results.push({ success: false, error: error.message, index: i });
        
        if (onProgress) {
          onProgress(i + 1, total, null, error);
        }
      }
    }
    
    return results;
  }

  // Cache Management
  clearCache() {
    // Clear any cached WordPress data
    Object.keys(localStorage).forEach(key => {
      if (key.startsWith('wp_cache_')) {
        localStorage.removeItem(key);
      }
    });
  }

  // Health Check
  async performHealthCheck() {
    const health = {
      timestamp: new Date().toISOString(),
      connection: false,
      authentication: false,
      permissions: {},
      endpoints: {},
      errors: []
    };

    try {
      // Test basic connection
      const connectionTest = await this.testConnection();
      health.connection = connectionTest.apiConnection;
      health.endpoints.api = connectionTest.apiConnection;
      
      // Test authentication if logged in
      if (WordPressAuthService.isAuthenticated()) {
        health.authentication = true;
        
        // Test permissions
        try {
          await WordPressAuthService.getUserPosts({ per_page: 1 });
          health.permissions.readPosts = true;
        } catch (error) {
          health.permissions.readPosts = false;
          health.errors.push(`Read posts permission: ${error.message}`);
        }

        try {
          // Test if user can access categories (indicates basic permissions)
          await WordPressAuthService.api.get('/categories', { params: { per_page: 1 } });
          health.permissions.manageCategories = true;
        } catch (error) {
          health.permissions.manageCategories = false;
          health.errors.push(`Manage categories permission: ${error.message}`);
        }

        try {
          // Test media upload permissions
          await WordPressAuthService.api.get('/media', { params: { per_page: 1 } });
          health.permissions.uploadMedia = true;
        } catch (error) {
          health.permissions.uploadMedia = false;
          health.errors.push(`Upload media permission: ${error.message}`);
        }
      }

    } catch (error) {
      health.errors.push(`Connection test failed: ${error.message}`);
    }

    return health;
  }

  // Configuration Validation
  validateConfiguration() {
    const issues = [];
    const config = WORDPRESS_CONFIG;

    if (!config.BLOG_URL) {
      issues.push('BLOG_URL is not configured');
    }

    if (!config.API_URL) {
      issues.push('API_URL is not configured');
    }

    if (!config.AUTH_URL) {
      issues.push('AUTH_URL is not configured');
    }

    if (!config.TOKEN_ENDPOINT) {
      issues.push('TOKEN_ENDPOINT is not configured');
    }

    if (!config.TOKEN_VALIDATE_ENDPOINT) {
      issues.push('TOKEN_VALIDATE_ENDPOINT is not configured');
    }

    // Validate URL formats
    try {
      new URL(config.BLOG_URL);
    } catch {
      issues.push('BLOG_URL is not a valid URL');
    }

    try {
      new URL(config.API_URL);
    } catch {
      issues.push('API_URL is not a valid URL');
    }

    try {
      new URL(config.AUTH_URL);
    } catch {
      issues.push('AUTH_URL is not a valid URL');
    }

    try {
      new URL(config.TOKEN_ENDPOINT);
    } catch {
      issues.push('TOKEN_ENDPOINT is not a valid URL');
    }

    try {
      new URL(config.TOKEN_VALIDATE_ENDPOINT);
    } catch {
      issues.push('TOKEN_VALIDATE_ENDPOINT is not a valid URL');
    }

    return {
      valid: issues.length === 0,
      issues
    };
  }

  // Diagnostic Information
  getDiagnosticInfo() {
    const user = WordPressAuthService.getCurrentUser();
    const status = this.getStatus();
    
    return {
      timestamp: new Date().toISOString(),
      configuration: {
        blogUrl: WORDPRESS_CONFIG.BLOG_URL,
        apiUrl: WORDPRESS_CONFIG.API_URL,
        authUrl: WORDPRESS_CONFIG.AUTH_URL,
        tokenEndpoint: WORDPRESS_CONFIG.TOKEN_ENDPOINT,
        tokenValidateEndpoint: WORDPRESS_CONFIG.TOKEN_VALIDATE_ENDPOINT,
        timeout: WORDPRESS_CONFIG.TIMEOUT,
        authMethod: WORDPRESS_CONFIG.AUTH_METHOD
      },
      connection: {
        status: status.status,
        lastError: status.error,
        isAuthenticated: status.isAuthenticated
      },
      user: user ? {
        id: user.id,
        username: user.username,
        displayName: user.displayName,
        email: user.email,
        capabilities: user.capabilities,
        roles: user.roles
      } : null,
      browser: {
        userAgent: navigator.userAgent,
        cookiesEnabled: navigator.cookieEnabled,
        onLine: navigator.onLine
      },
      localStorage: {
        available: this.isLocalStorageAvailable(),
        wpTokenExists: !!localStorage.getItem('wp_token'),
        wpUserExists: !!localStorage.getItem('wp_user')
      }
    };
  }

  isLocalStorageAvailable() {
    try {
      const test = 'wp_test';
      localStorage.setItem(test, test);
      localStorage.removeItem(test);
      return true;
    } catch {
      return false;
    }
  }

  // Export/Import Configuration
  exportSettings() {
    const user = WordPressAuthService.getCurrentUser();
    return {
      timestamp: new Date().toISOString(),
      configuration: WORDPRESS_CONFIG,
      user: user ? {
        username: user.username,
        displayName: user.displayName,
        email: user.email
      } : null
    };
  }

  // Error Recovery
  async recoverConnection() {
    try {
      // Clear any existing auth data
      this.disconnect();
      
      // Clear cache
      this.clearCache();
      
      // Test basic connection
      await this.testConnection();
      
      return { success: true, message: 'Connection recovered successfully' };
    } catch (error) {
      return { success: false, message: error.message };
    }
  }

  // Migration Helpers
  async migratePosts(localPosts, options = {}) {
    const {
      dryRun = false,
      skipExisting = true,
      batchSize = 5,
      onProgress = null
    } = options;

    if (!WordPressAuthService.isAuthenticated()) {
      throw new Error('Authentication required for migration');
    }

    const results = {
      total: localPosts.length,
      processed: 0,
      created: 0,
      updated: 0,
      skipped: 0,
      failed: 0,
      errors: []
    };

    // Process in batches
    for (let i = 0; i < localPosts.length; i += batchSize) {
      const batch = localPosts.slice(i, i + batchSize);
      
      for (const post of batch) {
        try {
          results.processed++;
          
          if (onProgress) {
            onProgress(results);
          }

          if (dryRun) {
            console.log(`[DRY RUN] Would migrate post: ${post.title}`);
            continue;
          }

          // Check if post exists (by title for now)
          if (skipExisting && post.title) {
            const existingPosts = await this.searchPosts(post.title, { per_page: 1 });
            if (existingPosts.posts && existingPosts.posts.length > 0) {
              results.skipped++;
              continue;
            }
          }

          // Migrate the post
          const wpPost = await this.syncPost(post);
          
          if (post.wpId || post.id) {
            results.updated++;
          } else {
            results.created++;
          }
          
        } catch (error) {
          results.failed++;
          results.errors.push({
            post: post.title || 'Untitled',
            error: error.message
          });
        }
      }

      // Small delay between batches to avoid overwhelming the server
      if (i + batchSize < localPosts.length) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    return results;
  }

  // Quick post creation helper
  async createQuickPost(title, content, options = {}) {
    const postData = {
      title,
      content,
      excerpt: options.excerpt || '',
      status: options.status || 'draft',
      categories: options.categories || [],
      tags: options.tags || [],
      subtitle: options.subtitle || ''
    };

    return await this.syncPost(postData);
  }

  // Bulk delete posts
  async deletePosts(postIds, onProgress = null) {
    if (!WordPressAuthService.isAuthenticated()) {
      throw new Error('Authentication required for bulk delete');
    }

    const results = {
      total: postIds.length,
      deleted: 0,
      failed: 0,
      errors: []
    };

    for (let i = 0; i < postIds.length; i++) {
      try {
        await WordPressAuthService.deletePost(postIds[i]);
        results.deleted++;
        
        if (onProgress) {
          onProgress(i + 1, results.total);
        }
      } catch (error) {
        results.failed++;
        results.errors.push({
          postId: postIds[i],
          error: error.message
        });
      }
    }

    return results;
  }

  // Get post statistics
  async getPostStats() {
    try {
      if (!WordPressAuthService.isAuthenticated()) {
        throw new Error('Authentication required for post statistics');
      }

      const user = WordPressAuthService.getCurrentUser();
      
      // Get posts by status
      const [published, drafts, pending] = await Promise.all([
        WordPressAuthService.getUserPosts({ status: 'publish', per_page: 1 }),
        WordPressAuthService.getUserPosts({ status: 'draft', per_page: 1 }),
        WordPressAuthService.getUserPosts({ status: 'pending', per_page: 1 })
      ]);

      return {
        user: user.displayName,
        published: published.total || 0,
        drafts: drafts.total || 0,
        pending: pending.total || 0,
        total: (published.total || 0) + (drafts.total || 0) + (pending.total || 0)
      };
    } catch (error) {
      console.error('Error fetching post statistics:', error);
      throw error;
    }
  }
}

export default new WordPressConnectionService();
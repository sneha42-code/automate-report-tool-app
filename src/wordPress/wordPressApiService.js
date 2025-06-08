import axios from "axios";
import WORDPRESS_CONFIG from "./wordpress";
import WordPressAuthService from "./wordPressAuthService";

class WordPressService {
  constructor() {
    this.baseURL = WORDPRESS_CONFIG.API_URL || "https://aiblog.automatereporting.com/wp-json/wp/v2";
    this.api = axios.create({
      baseURL: this.baseURL,
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
  }

  async getPosts(params = {}) {
    try {
      const defaultParams = {
        per_page: 10,
        page: 1,
        status: "publish",
        _embed: true,
        ...params,
      };
      const response = await this.api.get("/posts", { params: defaultParams });

      return {
        posts: this.formatPosts(response.data),
        totalPages: parseInt(response.headers["x-wp-totalpages"]) || 1,
        total: parseInt(response.headers["x-wp-total"]) || 0,
      };
    } catch (error) {
      console.error("Error fetching posts:", error);
      throw this._handleError(error);
    }
  }

  async getPost(identifier) {
    try {
      const endpoint = isNaN(identifier)
        ? `/posts?slug=${identifier}`
        : `/posts/${identifier}`;
      const response = await this.api.get(endpoint, {
        params: { _embed: true },
      });
      const post = Array.isArray(response.data) ? response.data[0] : response.data;
      if (!post) throw new Error("Post not found");
      return this.formatPost(post);
    } catch (error) {
      console.error("Error fetching post:", error);
      throw this._handleError(error);
    }
  }

  async createPost(postData) {
    try {
      const formattedData = await this.formatPostForAPI(postData);
      const response = await this.api.post("/posts", formattedData);
      return this.formatPost(response.data);
    } catch (error) {
      console.error("Error creating post:", error);
      throw this._handleError(error);
    }
  }

  async updatePost(postId, postData) {
    try {
      const formattedData = await this.formatPostForAPI(postData);
      const response = await this.api.put(`/posts/${postId}`, formattedData);
      return this.formatPost(response.data);
    } catch (error) {
      console.error("Error updating post:", error);
      throw this._handleError(error);
    }
  }

  async deletePost(postId) {
    try {
      await this.api.delete(`/posts/${postId}`);
      return true;
    } catch (error) {
      console.error("Error deleting post:", error);
      throw this._handleError(error);
    }
  }

  async uploadMedia(file, metadata = {}) {
    try {
      const formData = new FormData();
      formData.append("file", file);
      if (metadata.title) formData.append("title", metadata.title);
      if (metadata.caption) formData.append("caption", metadata.caption);
      if (metadata.alt) formData.append("alt_text", metadata.alt);

      const response = await this.api.post("/media", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
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

  async getCategories() {
    try {
      const response = await this.api.get("/categories", {
        params: { per_page: 100 },
      });
      return response.data.map((cat) => ({
        id: cat.id,
        name: cat.name,
        slug: cat.slug,
        count: cat.count,
      }));
    } catch (error) {
      console.error("Error fetching categories:", error);
      throw this._handleError(error);
    }
  }

  async getTags() {
    try {
      const response = await this.api.get("/tags", {
        params: { per_page: 100 },
      });
      return response.data.map((tag) => ({
        id: tag.id,
        name: tag.name,
        slug: tag.slug,
        count: tag.count,
      }));
    } catch (error) {
      console.error("Error fetching tags:", error);
      throw this._handleError(error);
    }
  }

  async searchPosts(searchTerm, params = {}) {
    return this.getPosts({
      search: searchTerm,
      ...params,
    });
  }

  async getPostsByCategory(categoryId, params = {}) {
    return this.getPosts({
      categories: categoryId,
      ...params,
    });
  }

  async getPostsByTag(tagId, params = {}) {
    return this.getPosts({
      tags: tagId,
      ...params,
    });
  }

  async formatPostForAPI(postData) {
    const categories = await this.processCategoryIds(postData.categories || []);
    const tags = await this.processTagIds(postData.tags || []);
    return {
      title: postData.title,
      content: postData.content,
      excerpt: postData.excerpt,
      status: postData.status || "draft",
      categories,
      tags,
      featured_media: postData.featured_media || null,
      meta: {
        subtitle: postData.subtitle || "",
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

  formatPost(wpPost) {
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
      readingTime: this.calculateReadingTime(wpPost.content?.rendered || ""),
      link: wpPost.link,
    };
  }

  formatPosts(wpPosts) {
    return wpPosts.map((post) => this.formatPost(post));
  }

  getFeatureImage(wpPost) {
    if (wpPost._embedded?.["wp:featuredmedia"]?.[0]) {
      return wpPost._embedded["wp:featuredmedia"][0].source_url;
    }
    return WORDPRESS_CONFIG.DEFAULT_FEATURED_IMAGE || "/default-blog-image.jpg";
  }

  getAuthor(wpPost) {
    if (wpPost._embedded?.author?.[0]) {
      const author = wpPost._embedded.author[0];
      return {
        name: author.name || "Unknown Author",
        avatar: author.avatar_urls?.["96"] || WORDPRESS_CONFIG.DEFAULT_AVATAR || "/default-avatar.png",
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
      avatar: WORDPRESS_CONFIG.DEFAULT_AVATAR || "/default-avatar.png",
      bio: "",
      social: {
        twitter: "",
        linkedin: "",
      },
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
      const wpError = error.response.data;
      if (wpError.message) {
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

// Create an instance and export as default
const wordPressService = new WordPressService();
export default wordPressService;
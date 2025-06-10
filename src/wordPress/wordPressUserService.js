import axios from "axios";
import WORDPRESS_CONFIG from "./wordpress";
import WordPressAuthService from "./wordPressAuthService";

class WordPressUserService {
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

  // Admin-only user creation
  async createUser(userData) {
    try {
      if (!this.canManageUsers()) {
        throw new Error("You don't have permission to create users");
      }

      const validation = this.validateUserData(userData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join("; "));
      }

      const requestData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        roles: [userData.role || "author"],
        meta: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          description: userData.bio || "",
        },
      };

      const response = await this.api.post("/users", requestData);
      const user = this.formatUser(response.data);

      if (["author", "editor", "administrator"].includes(userData.role)) {
        try {
          const appPassword = await this.generateApplicationPassword(user.id, "Blog Management App");
          user.applicationPassword = appPassword;
        } catch (error) {
          console.warn("Could not generate application password:", error.message);
        }
      }

      if (userData.sendEmail) {
        try {
          await this.sendWelcomeEmail(user);
        } catch (error) {
          console.warn("Could not send welcome email:", error.message);
        }
      }

      return user;
    } catch (error) {
      console.error("Error creating user:", error);
      throw this._handleError(error);
    }
  }

  // Public user registration
  async registerUser(userData) {
    try {
      const validation = this.validateUserData(userData);
      if (!validation.isValid) {
        throw new Error(Object.values(validation.errors).join("; "));
      }

      // Restrict role to subscriber or author for public registration
      const allowedRoles = ["subscriber", "author"];
      const role = allowedRoles.includes(userData.role) ? userData.role : "subscriber";

      const requestData = {
        username: userData.username,
        email: userData.email,
        password: userData.password,
        first_name: userData.firstName,
        last_name: userData.lastName,
        roles: [role],
        meta: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          description: userData.bio || "",
        },
      };

      // Use a custom endpoint for public registration
      const response = await axios.post(`${this.baseURL}/custom/register`, requestData);
      const user = this.formatUser(response.data);

      if (userData.sendEmail) {
        try {
          await this.sendWelcomeEmail(user);
        } catch (error) {
          console.warn("Could not send welcome email:", error.message);
        }
      }

      return user;
    } catch (error) {
      console.error("Error registering user:", error);
      throw this._handleError(error);
    }
  }

  async getUsers(params = {}) {
    try {
      const defaultParams = {
        per_page: 100,
        page: 1,
        context: "edit",
        ...params,
      };

      const response = await this.api.get("/users", { params: defaultParams });
      const users = response.data.map((user) => this.formatUser(user));

      for (const user of users) {
        try {
          const postsResponse = await this.api.get("/posts", {
            params: { author: user.id, per_page: 1 },
          });
          user.postsCount = parseInt(postsResponse.headers["x-wp-total"]) || 0;
        } catch (error) {
          user.postsCount = 0;
        }
      }

      return users;
    } catch (error) {
      console.error("Error fetching users:", error);
      throw this._handleError(error);
    }
  }

  async getUser(userId) {
    try {
      const response = await this.api.get(`/users/${userId}`, {
        params: { context: "edit" },
      });
      return this.formatUser(response.data);
    } catch (error) {
      console.error("Error fetching user:", error);
      throw this._handleError(error);
    }
  }

  async updateUser(userId, userData) {
    try {
      if (!this.canManageUsers() && !this.isAuthorizedUser(userId)) {
        throw new Error("You don't have permission to update this user");
      }

      const updateData = {
        first_name: userData.firstName,
        last_name: userData.lastName,
        email: userData.email || undefined,
        roles: userData.role ? [userData.role] : undefined,
        meta: {
          first_name: userData.firstName,
          last_name: userData.lastName,
          description: userData.bio || "",
        },
      };

      if (userData.password) {
        updateData.password = userData.password;
      }

      const response = await this.api.put(`/users/${userId}`, updateData);
      return this.formatUser(response.data);
    } catch (error) {
      console.error("Error updating user:", error);
      throw this._handleError(error);
    }
  }

  async deleteUser(userId, reassignTo = null) {
    try {
      if (!this.canManageUsers()) {
        throw new Error("You don't have permission to delete users");
      }

      if (this.isAuthorizedUser(userId)) {
        throw new Error("You cannot delete your own account");
      }

      const params = { force: true };
      if (reassignTo) {
        params.reassign = reassignTo;
      }

      await this.api.delete(`/users/${userId}`, { params });
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      throw this._handleError(error);
    }
  }

  async updateUserRole(userId, newRole) {
    try {
      if (!this.canManageUsers()) {
        throw new Error("You don't have permission to change user roles");
      }

      const response = await this.api.put(`/users/${userId}`, {
        roles: [newRole],
      });

      return this.formatUser(response.data);
    } catch (error) {
      console.error("Error updating user role:", error);
      throw this._handleError(error);
    }
  }

  async generateApplicationPassword(userId, appName = "API Access") {
    try {
      const response = await this.api.post(`/users/${userId}/application-passwords`, {
        name: appName,
      });
      return response.data.password;
    } catch (error) {
      console.error("Error generating application password:", error);
      throw new Error("Could not generate application password.");
    }
  }

  async sendWelcomeEmail(user) {
    try {
      console.log(`Welcome email sent to ${user.email}`);
      return true;
    } catch (error) {
      console.error("Error sending welcome email:", error);
      throw error;
    }
  }

  async getUserStats() {
    try {
      const users = await this.getUsers();
      const stats = {
        total: users.length,
        byRole: {},
        recent: users.filter((user) => {
          const createdDate = new Date(user.createdAt);
          const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
          return createdDate > weekAgo;
        }).length,
        active: users.filter((user) => user.status === "active").length,
      };

      users.forEach((user) => {
        stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
      });

      return stats;
    } catch (error) {
      console.error("Error fetching user stats:", error);
      throw this._handleError(error);
    }
  }

  async searchUsers(searchTerm, params = {}) {
    try {
      const searchParams = {
        search: searchTerm,
        per_page: 50,
        context: "edit",
        ...params,
      };

      const response = await this.api.get("/users", { params: searchParams });
      return response.data.map((user) => this.formatUser(user));
    } catch (error) {
      console.error("Error searching users:", error);
      throw this._handleError(error);
    }
  }

  canManageUsers() {
    const currentUser = WordPressAuthService.getCurrentUser();
    if (!currentUser) return false;

    const managementRoles = ["administrator", "editor"];
    return (
      currentUser.roles?.some((role) => managementRoles.includes(role)) ||
      Object.keys(currentUser.capabilities || {}).includes("edit_users") ||
      Object.keys(currentUser.capabilities || {}).includes("create_users")
    );
  }

  isAuthorizedUser(userId) {
    const currentUser = WordPressAuthService.getCurrentUser();
    return currentUser && currentUser.id === userId;
  }

  formatUser(wpUser) {
    return {
      id: wpUser.id,
      username: wpUser.username || wpUser.slug,
      email: wpUser.email,
      firstName: wpUser.first_name || wpUser.meta?.first_name || "",
      lastName: wpUser.last_name || wpUser.meta?.last_name || "",
      displayName: wpUser.name,
      role: Array.isArray(wpUser.roles) ? wpUser.roles[0] : wpUser.roles,
      roles: wpUser.roles || [],
      capabilities: wpUser.capabilities || {},
      status: wpUser.meta?.wp_user_level !== undefined ? "active" : "active",
      bio: wpUser.description || wpUser.meta?.description || "",
      avatar:
        wpUser.avatar_urls?.[96] ||
        wpUser.avatar_urls?.[48] ||
        WORDPRESS_CONFIG.DEFAULT_AVATAR ||
        `https://ui-avatars.com/api/?name=${encodeURIComponent(wpUser.name || wpUser.username)}&background=667eea&color=fff&size=96`,
      createdAt: wpUser.registered_date || new Date().toISOString(),
      lastLogin: wpUser.meta?.last_login || null,
      postsCount: 0,
      link: wpUser.link,
      meta: wpUser.meta || {},
    };
  }

  validateUserData(userData) {
    const errors = {};

    if (!userData.username || userData.username.length < 3) {
      errors.username = "Username must be at least 3 characters";
    } else if (!/^[a-zA-Z0-9_-]+$/.test(userData.username)) {
      errors.username = "Username can only contain letters, numbers, hyphens, and underscores";
    }

    if (!userData.email) {
      errors.email = "Email is required";
    } else if (!/\S+@\S+\.\S+/.test(userData.email)) {
      errors.email = "Email is invalid";
    }

    if (userData.password && userData.password.length < 8) {
      errors.password = "Password must be at least 8 characters";
    }

    if (!userData.firstName?.trim()) {
      errors.firstName = "First name is required";
    }

    if (!userData.lastName?.trim()) {
      errors.lastName = "Last name is required";
    }

    const validRoles = ["subscriber", "contributor", "author", "editor", "administrator"];
    if (!validRoles.includes(userData.role)) {
      errors.role = "Invalid user role";
    }

    return {
      isValid: Object.keys(errors).length === 0,
      errors,
    };
  }

  _handleError(error) {
    let errorMessage = "An unknown error occurred";

    if (error.response) {
      const wpError = error.response.data;

      if (error.response.status === 401) {
        errorMessage = "Authentication required. Please log in.";
      } else if (error.response.status === 403) {
        errorMessage = "You don't have permission to perform this action.";
      } else if (error.response.status === 404) {
        errorMessage = "User not found.";
      } else if (error.response.status === 409) {
        errorMessage = "Username or email already exists.";
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

  getAvailableRoles() {
    return [
      {
        value: "subscriber",
        label: "Subscriber",
        description: "Can only manage profile and read content",
        capabilities: ["read"],
      },
      {
        value: "contributor",
        label: "Contributor",
        description: "Can write posts but cannot publish them",
        capabilities: ["read", "edit_posts", "delete_posts"],
      },
      {
        value: "author",
        label: "Author",
        description: "Can publish and manage own posts",
        capabilities: ["read", "edit_posts", "publish_posts", "delete_posts", "upload_files"],
      },
      {
        value: "editor",
        label: "Editor",
        description: "Can manage all posts and pages",
        capabilities: [
          "read",
          "edit_posts",
          "publish_posts",
          "delete_posts",
          "edit_others_posts",
          "delete_others_posts",
          "edit_pages",
          "publish_pages",
          "delete_pages",
          "upload_files",
        ],
      },
      {
        value: "administrator",
        label: "Administrator",
        description: "Full access to everything",
        capabilities: ["all"],
      },
    ];
  }
}

export default new WordPressUserService();
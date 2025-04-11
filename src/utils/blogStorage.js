// blogStorage.js
const STORAGE_KEY = "blogPosts";

// Load all posts from localStorage
export const loadPostsFromStorage = () => {
  try {
    const savedPosts = localStorage.getItem(STORAGE_KEY);
    return savedPosts ? JSON.parse(savedPosts) : [];
  } catch (error) {
    console.error("Error loading posts from storage:", error);
    return [];
  }
};

// Save all posts to localStorage
export const savePostsToStorage = (posts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return true;
  } catch (error) {
    console.error("Error saving posts to storage:", error);
    return false;
  }
};

// Get a specific post by ID
export const getPostById = (postId) => {
  try {
    const posts = loadPostsFromStorage();
    // Convert postId to number if it's a string (common with URL parameters)
    const id = typeof postId === "string" ? parseInt(postId, 10) : postId;

    return posts.find((post) => post.id === id) || null;
  } catch (error) {
    console.error("Error getting post by ID:", error);
    return null;
  }
};

// Add a new post
export const addPost = (newPost) => {
  try {
    const posts = loadPostsFromStorage();
    const updatedPosts = [newPost, ...posts];
    savePostsToStorage(updatedPosts);
    return true;
  } catch (error) {
    console.error("Error adding new post:", error);
    return false;
  }
};

// Update an existing post
export const updatePost = (updatedPost) => {
  try {
    const posts = loadPostsFromStorage();
    const updatedPosts = posts.map((post) =>
      post.id === updatedPost.id ? updatedPost : post
    );
    savePostsToStorage(updatedPosts);
    return true;
  } catch (error) {
    console.error("Error updating post:", error);
    return false;
  }
};

// Delete a post
export const deletePost = (postId) => {
  try {
    const posts = loadPostsFromStorage();
    const updatedPosts = posts.filter((post) => post.id !== postId);
    savePostsToStorage(updatedPosts);
    return true;
  } catch (error) {
    console.error("Error deleting post:", error);
    return false;
  }
};

// Get posts by category
export const getPostsByCategory = (category) => {
  try {
    const posts = loadPostsFromStorage();
    return posts.filter(
      (post) =>
        // Only include published posts
        (!post.status || post.status === "publish") &&
        post.categories &&
        post.categories.some(
          (cat) => cat.toLowerCase() === category.toLowerCase()
        )
    );
  } catch (error) {
    console.error("Error getting posts by category:", error);
    return [];
  }
};

// Get posts by tag
export const getPostsByTag = (tag) => {
  try {
    const posts = loadPostsFromStorage();
    return posts.filter(
      (post) =>
        // Only include published posts
        (!post.status || post.status === "publish") &&
        post.tags &&
        post.tags.some((t) => t.toLowerCase() === tag.toLowerCase())
    );
  } catch (error) {
    console.error("Error getting posts by tag:", error);
    return [];
  }
};

// Get draft posts
export const getDraftPosts = () => {
  try {
    const posts = loadPostsFromStorage();
    return posts.filter((post) => post.status === "draft");
  } catch (error) {
    console.error("Error getting draft posts:", error);
    return [];
  }
};

// Get published posts
export const getPublishedPosts = () => {
  try {
    const posts = loadPostsFromStorage();
    return posts.filter((post) => !post.status || post.status === "publish");
  } catch (error) {
    console.error("Error getting published posts:", error);
    return [];
  }
};

// Search posts by keyword
export const searchPosts = (keyword) => {
  try {
    const posts = loadPostsFromStorage();
    const searchTerm = keyword.toLowerCase();

    return posts.filter(
      (post) =>
        // Only include published posts
        (!post.status || post.status === "publish") &&
        (post.title.toLowerCase().includes(searchTerm) ||
          post.excerpt.toLowerCase().includes(searchTerm) ||
          (post.content &&
            typeof post.content === "string" &&
            post.content.toLowerCase().includes(searchTerm)) ||
          (post.tags &&
            post.tags.some((tag) => tag.toLowerCase().includes(searchTerm))) ||
          (post.categories &&
            post.categories.some((category) =>
              category.toLowerCase().includes(searchTerm)
            )))
    );
  } catch (error) {
    console.error("Error searching posts:", error);
    return [];
  }
};

// Publish a draft post
export const publishDraft = (postId) => {
  try {
    const posts = loadPostsFromStorage();
    const updatedPosts = posts.map((post) => {
      if (post.id === postId && post.status === "draft") {
        return {
          ...post,
          status: "publish",
          date: new Date().toISOString(), // Update publish date
        };
      }
      return post;
    });
    savePostsToStorage(updatedPosts);
    return true;
  } catch (error) {
    console.error("Error publishing draft:", error);
    return false;
  }
};

export default {
  loadPostsFromStorage,
  savePostsToStorage,
  getPostById,
  addPost,
  updatePost,
  deletePost,
  getPostsByCategory,
  getPostsByTag,
  getDraftPosts,
  getPublishedPosts,
  searchPosts,
  publishDraft,
};

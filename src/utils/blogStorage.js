// blogStorage.js
const STORAGE_KEY = "blog_posts";

// Load posts from localStorage
export const loadPostsFromStorage = () => {
  try {
    const savedPosts = localStorage.getItem(STORAGE_KEY);
    return savedPosts ? JSON.parse(savedPosts) : [];
  } catch (error) {
    console.error("Error loading posts from localStorage:", error);
    return [];
  }
};

// Save posts to localStorage
export const savePostsToStorage = (posts) => {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(posts));
    return true;
  } catch (error) {
    console.error("Error saving posts to localStorage:", error);
    return false;
  }
};

// Get a single post by ID
export const getPostById = (id) => {
  try {
    const posts = loadPostsFromStorage();
    return posts.find((post) => post.id.toString() === id.toString()) || null;
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
    console.error("Error adding post:", error);
    return false;
  }
};

// Update an existing post
export const updatePost = (updatedPost) => {
  try {
    const posts = loadPostsFromStorage();
    const postIndex = posts.findIndex(
      (post) => post.id.toString() === updatedPost.id.toString()
    );

    if (postIndex !== -1) {
      posts[postIndex] = updatedPost;
      savePostsToStorage(posts);
      return true;
    }
    return false;
  } catch (error) {
    console.error("Error updating post:", error);
    return false;
  }
};

// Delete a post
export const deletePost = (id) => {
  try {
    const posts = loadPostsFromStorage();
    const updatedPosts = posts.filter(
      (post) => post.id.toString() !== id.toString()
    );
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

// Search posts by keyword
export const searchPosts = (keyword) => {
  try {
    const posts = loadPostsFromStorage();
    const searchTerm = keyword.toLowerCase();

    return posts.filter(
      (post) =>
        post.title.toLowerCase().includes(searchTerm) ||
        post.excerpt.toLowerCase().includes(searchTerm) ||
        (post.content && post.content.toLowerCase().includes(searchTerm))
    );
  } catch (error) {
    console.error("Error searching posts:", error);
    return [];
  }
};

import React, { useState, useEffect } from "react";
import { Link, Routes, Route, useNavigate } from "react-router-dom";
import AddPostForm from "./AddPostBlog";
import "../styles/BlogMain.css";

// Import this if you're using local storage
import { loadPostsFromStorage, savePostsToStorage } from "../utils/blogStorage";

const BlogManagement = () => {
  // Initialize with sample data or load from storage/API
  const [posts, setPosts] = useState([]);
  const [isAdding, setIsAdding] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    // Load posts from localStorage when component mounts
    const savedPosts = loadPostsFromStorage();
    if (savedPosts && savedPosts.length > 0) {
      setPosts(savedPosts);
    }
  }, []);

  // Function to add a new post
  const handleAddPost = (newPost) => {
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);

    // Save to localStorage
    savePostsToStorage(updatedPosts);

    // Close the form and navigate to blog list
    setIsAdding(false);
    navigate("/blog");
  };

  return (
    <div className="blog-management">
      <div className="management-controls">
        <button
          className={`control-button ${isAdding ? "active" : ""}`}
          onClick={() => setIsAdding(!isAdding)}
        >
          {isAdding ? "Cancel" : "Add New Post"}
        </button>
      </div>

      {isAdding ? (
        <AddPostForm onAddPost={handleAddPost} />
      ) : (
        <Blog posts={posts} />
      )}
    </div>
  );
};

const Blog = ({ posts = [] }) => {
  const [featuredPost, setFeaturedPost] = useState(null);
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    if (posts.length > 0) {
      // Set the latest post as featured
      const sorted = [...posts].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setFeaturedPost(sorted[0]);
      setRecentPosts(sorted.slice(1, 7)); // Get the next 6 posts

      // Extract unique categories
      const allCategories = new Set();
      posts.forEach((post) => {
        if (post.categories) {
          post.categories.forEach((category) => allCategories.add(category));
        }
      });

      setCategories(Array.from(allCategories));
    }
  }, [posts]);

  if (posts.length === 0) {
    return (
      <div className="blog-empty">
        <h2>No posts yet</h2>
        <p>Start by adding your first blog post!</p>
      </div>
    );
  }

  return (
    <div className="blog-container">
      <header className="blog-header">
        <h1>Our Blog</h1>
        <p className="blog-description">Latest news, articles, and insights</p>
      </header>

      {featuredPost && (
        <section className="featured-post">
          <div className="featured-image">
            <img src={featuredPost.image} alt={featuredPost.title} />
          </div>
          <div className="featured-content">
            <div className="post-meta">
              <span className="post-date">
                {new Date(featuredPost.date).toLocaleDateString("en-US", {
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              {featuredPost.categories && (
                <div className="post-categories">
                  {featuredPost.categories.map((category) => (
                    <span className="category" key={category}>
                      {category}
                    </span>
                  ))}
                </div>
              )}
            </div>
            <h2 className="featured-title">{featuredPost.title}</h2>
            <p className="featured-excerpt">{featuredPost.excerpt}</p>
            <div className="post-author">
              <img
                src={featuredPost.author?.avatar || "/default-avatar.png"}
                alt={featuredPost.author?.name || "Author"}
                className="author-avatar"
              />
              <span className="author-name">
                {featuredPost.author?.name || "Author"}
              </span>
            </div>
            <Link to={`/blog/${featuredPost.id}`} className="read-more-btn">
              Read Full Article
            </Link>
          </div>
        </section>
      )}

      <div className="blog-content">
        <main className="recent-posts">
          <h2 className="section-heading">Recent Articles</h2>
          <div className="posts-grid">
            {recentPosts.map((post) => (
              <article className="post-card" key={post.id}>
                <div className="post-image">
                  <img src={post.image} alt={post.title} />
                </div>
                <div className="post-content">
                  <div className="post-meta">
                    <span className="post-date">
                      {new Date(post.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                  <h3 className="post-title">
                    <Link to={`/blog/${post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <div className="post-footer">
                    <div className="post-author">
                      <img
                        src={post.author?.avatar || "/default-avatar.png"}
                        alt={post.author?.name || "Author"}
                        className="author-avatar-small"
                      />
                      <span className="author-name-small">
                        {post.author?.name || "Author"}
                      </span>
                    </div>
                    <Link to={`/blog/${post.id}`} className="read-more-link">
                      Read More →
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>
          <div className="posts-navigation">
            <button className="load-more-btn">Load More Articles</button>
          </div>
        </main>

        <aside className="blog-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-heading">Categories</h3>
            <ul className="categories-list">
              {categories.map((category) => (
                <li key={category}>
                  <Link
                    to={`/blog/category/${category
                      .toLowerCase()
                      .replace(" ", "-")}`}
                  >
                    {category}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          {/* <div className="sidebar-section">
            <h3 className="sidebar-heading">Subscribe</h3>
            <p>Stay up to date with our latest articles</p>
            <form className="subscription-form">
              <input
                type="email"
                placeholder="Your email address"
                required
                className="email-input"
              />
              <button type="submit" className="subscribe-btn">
                Subscribe
              </button>
            </form>
          </div> */}

          {/* <div className="sidebar-section">
            <h3 className="sidebar-heading">Follow Us</h3>
            <div className="social-links">
              <a href="#" className="social-link">
                Twitter
              </a>
              <a href="#" className="social-link">
                Facebook
              </a>
              <a href="#" className="social-link">
                LinkedIn
              </a>
              <a href="#" className="social-link">
                Instagram
              </a>
            </div>
          </div> */}
        </aside>
      </div>
    </div>
  );
};

export default BlogManagement;

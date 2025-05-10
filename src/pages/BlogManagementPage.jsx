import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/BlogMain.css";

// Import from utils
import { loadPostsFromStorage } from "../utils/blogStorage";

// Enhanced Blog Management Component
const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    // Load posts from localStorage when component mounts
    const savedPosts = loadPostsFromStorage();
    if (savedPosts && savedPosts.length > 0) {
      setPosts(savedPosts);
    }
  }, []);

  // Navigate to the create blog page
  const handleCreatePost = () => {
    navigate("/blog/create");
  };

  return (
    <div className="blog-management">
      <div className="blog-management-header">
        <h1>Blog Management</h1>
        <button className="add-post-button" onClick={handleCreatePost}>
          Write a story
        </button>
      </div>

      <EnhancedBlog
        posts={posts}
        activeCategory={activeCategory}
        setActiveCategory={setActiveCategory}
      />
    </div>
  );
};

// Enhanced Blog Component
const EnhancedBlog = ({ posts = [], activeCategory, setActiveCategory }) => {
  const [featuredPost, setFeaturedPost] = useState(null);
  const [sortedPosts, setSortedPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [popularPosts, setPopularPosts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const postsPerPage = 6;
  const navigate = useNavigate();

  useEffect(() => {
    if (posts.length > 0) {
      // Sort posts by date
      const sorted = [...posts].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );

      setSortedPosts(sorted);
      setFeaturedPost(sorted[0]);
      setRecentPosts(sorted.slice(1, 7));

      // For demo purposes, set some popular posts
      // In a real app, you would have metrics for this
      setPopularPosts(sorted.slice(0, 4));

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

  // Filter posts based on category and search term
  const filteredPosts = sortedPosts.filter((post) => {
    // Only show published posts (if status exists)
    const statusMatch = !post.status || post.status === "publish";

    // Filter by category
    const categoryMatch =
      activeCategory === "all" ||
      (post.categories && post.categories.includes(activeCategory));

    // Filter by search term
    const searchMatch =
      !searchTerm ||
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.excerpt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.tags &&
        post.tags.some((tag) =>
          tag.toLowerCase().includes(searchTerm.toLowerCase())
        ));

    return statusMatch && categoryMatch && searchMatch;
  });

  // Pagination logic
  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  // Handle search input
  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1); // Reset to first page on new search
  };

  // Handle write first post
  const handleWriteFirstPost = () => {
    navigate("/blog/create");
  };

  if (posts.length === 0) {
    return (
      <div className="blog-empty">
        <h2>No articles published yet</h2>
        <p>Be the first to share your thoughts and insights!</p>
        <button
          className="create-first-post-btn"
          onClick={handleWriteFirstPost}
        >
          Create Your First Post
        </button>
      </div>
    );
  }

  return (
    <div className="enhanced-blog-container">
      <header className="enhanced-blog-header">
        <h1>Stories & Insights</h1>
        <p className="blog-description">
          Thought-provoking articles on topics that matter
        </p>

        <div className="search-filter-container">
          <div className="search-bar">
            <input
              type="text"
              placeholder="Search articles..."
              value={searchTerm}
              onChange={handleSearchChange}
              className="search-input"
            />
          </div>

          <div className="category-filter">
            <button
              className={`category-btn ${
                activeCategory === "all" ? "active" : ""
              }`}
              onClick={() => {
                setActiveCategory("all");
                setCurrentPage(1);
              }}
            >
              All
            </button>
            {categories.map((category) => (
              <button
                key={category}
                className={`category-btn ${
                  activeCategory === category ? "active" : ""
                }`}
                onClick={() => {
                  setActiveCategory(category);
                  setCurrentPage(1);
                }}
              >
                {category}
              </button>
            ))}
          </div>
        </div>
      </header>

      {featuredPost &&
        activeCategory === "all" &&
        !searchTerm &&
        currentPage === 1 && (
          <section className="enhanced-featured-post">
            <div className="featured-image">
              <img src={featuredPost.image} alt={featuredPost.title} />
            </div>
            <div className="featured-content">
              <div className="post-meta">
                <span className="featured-label">Featured</span>
                <span className="post-date">
                  {new Date(featuredPost.date).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="reading-time">
                  {featuredPost.readingTime || "5"} min read
                </span>
              </div>

              <h2 className="featured-title">{featuredPost.title}</h2>

              {featuredPost.subtitle && (
                <h3 className="featured-subtitle">{featuredPost.subtitle}</h3>
              )}

              <p className="featured-excerpt">{featuredPost.excerpt}</p>

              <div className="post-categories">
                {featuredPost.categories &&
                  featuredPost.categories.map((category) => (
                    <span className="category-tag" key={category}>
                      {category}
                    </span>
                  ))}
              </div>

              <div className="post-author">
                <img
                  src={featuredPost.author?.avatar || "/default-avatar.png"}
                  alt={featuredPost.author?.name || "Author"}
                  className="author-avatar"
                />
                <div className="author-details">
                  <span className="author-name">
                    {featuredPost.author?.name || "Author"}
                  </span>
                </div>
              </div>

              <Link
                to={`/blog/${featuredPost.id}`}
                className="read-article-btn"
              >
                Read Full Article
              </Link>
            </div>
          </section>
        )}

      <div className="enhanced-blog-layout">
        <main className="blog-main-content">
          {currentPosts.length > 0 ? (
            <>
              <div className="articles-grid">
                {currentPosts.map((post) => (
                  <article className="article-card" key={post.id}>
                    <Link
                      to={`/blog/${post.id}`}
                      className="article-image-link"
                    >
                      <div className="article-image">
                        <img src={post.image} alt={post.title} />
                      </div>
                    </Link>

                    <div className="article-content">
                      <div className="article-meta">
                        <span className="post-date">
                          {new Date(post.date).toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                          })}
                        </span>
                        <span className="reading-time">
                          {post.readingTime || "4"} min read
                        </span>
                      </div>

                      <h3 className="article-title">
                        <Link to={`/blog/${post.id}`}>{post.title}</Link>
                      </h3>

                      <p className="article-excerpt">{post.excerpt}</p>

                      {post.categories && post.categories.length > 0 && (
                        <div className="article-categories">
                          {post.categories.map((category) => (
                            <span
                              key={category}
                              className="category-tag"
                              onClick={(e) => {
                                e.preventDefault();
                                setActiveCategory(category);
                                setCurrentPage(1);
                              }}
                            >
                              {category}
                            </span>
                          ))}
                        </div>
                      )}

                      <div className="article-footer">
                        <div className="author-info">
                          <img
                            src={post.author?.avatar || "/default-avatar.png"}
                            alt={post.author?.name || "Author"}
                            className="author-avatar-small"
                          />
                          <span className="author-name">
                            {post.author?.name || "Author"}
                          </span>
                        </div>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

              {/* Pagination */}
              {totalPages > 1 && (
                <div className="pagination">
                  <button
                    onClick={() => paginate(currentPage - 1)}
                    disabled={currentPage === 1}
                    className="pagination-btn prev"
                  >
                    Previous
                  </button>

                  <div className="page-numbers">
                    {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                      (number) => (
                        <button
                          key={number}
                          onClick={() => paginate(number)}
                          className={`page-number ${
                            currentPage === number ? "active" : ""
                          }`}
                        >
                          {number}
                        </button>
                      )
                    )}
                  </div>

                  <button
                    onClick={() => paginate(currentPage + 1)}
                    disabled={currentPage === totalPages}
                    className="pagination-btn next"
                  >
                    Next
                  </button>
                </div>
              )}
            </>
          ) : (
            <div className="no-results">
              <h2>No articles found</h2>
              <p>Try adjusting your search or category filters.</p>
              <button
                onClick={() => {
                  setSearchTerm("");
                  setActiveCategory("all");
                }}
                className="reset-filters-btn"
              >
                Reset Filters
              </button>
            </div>
          )}
        </main>

        <aside className="blog-sidebar">
          <div className="sidebar-section about-blog">
            <h3 className="sidebar-heading">About This Blog</h3>
            <p>
              Discover thought-provoking perspectives and insights on topics
              that matter. Join our community of readers and writers passionate
              about sharing ideas.
            </p>
          </div>

          <div className="sidebar-section popular-posts">
            <h3 className="sidebar-heading">Popular Articles</h3>
            <div className="popular-posts-list">
              {popularPosts.map((post) => (
                <div className="popular-post-item" key={post.id}>
                  <Link to={`/blog/${post.id}`} className="popular-post-link">
                    <h4>{post.title}</h4>
                    <div className="popular-post-meta">
                      <span className="popular-post-author">
                        {post.author?.name}
                      </span>
                      <span className="dot-separator">·</span>
                      <span className="popular-post-read-time">
                        {post.readingTime || "4"} min read
                      </span>
                    </div>
                  </Link>
                </div>
              ))}
            </div>
          </div>

          <div className="sidebar-section categories-section">
            <h3 className="sidebar-heading">Explore Topics</h3>
            <ul className="categories-list">
              {categories.map((category) => (
                <li key={category} className="category-item">
                  <button
                    onClick={() => {
                      setActiveCategory(category);
                      setCurrentPage(1);
                    }}
                    className={`category-link ${
                      activeCategory === category ? "active" : ""
                    }`}
                  >
                    {category}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* <div className="sidebar-section subscribe-section">
            <h3 className="sidebar-heading">Stay Updated</h3>
            <p>Get the latest articles delivered straight to your inbox.</p>
            <form className="subscription-form">
              <input
                type="email"
                placeholder="Your email address"
                required
                className="subscribe-email-input"
              />
              <button type="submit" className="subscribe-button">
                Subscribe
              </button>
            </form>
          </div> */}
        </aside>
      </div>
    </div>
  );
};

export default BlogManagement;

import React, { useState, useEffect } from "react";
import { Link, useNavigate } from "react-router-dom";
import WordPressService from "./wordPressApiService";
import WordPressAuthService from "./wordPressAuthService";
import "../styles/BlogMain.css";

// Function to decode HTML entities
const decodeHtmlEntities = (html) => {
  const txt = document.createElement("textarea");
  txt.innerHTML = html || "";
  return txt.value;
};

const BlogManagement = () => {
  const [posts, setPosts] = useState([]);
  const [activeCategory, setActiveCategory] = useState("all");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPosts = async () => {
      try {
        const params = WordPressAuthService.isAuthenticated()
          ? { status: "publish,draft" }
          : { status: "publish" };
        const { posts: fetchedPosts } = await WordPressService.getPosts(params);

        // Decode HTML entities in fetched posts
        const decodedPosts = fetchedPosts.map((post) => ({
          ...post,
          title: decodeHtmlEntities(post.title),
          subtitle: decodeHtmlEntities(post.subtitle || ""),
          excerpt: decodeHtmlEntities(post.excerpt || ""),
          categories: Array.isArray(post.categories)
            ? post.categories.map(decodeHtmlEntities)
            : typeof post.categories === "string"
            ? post.categories.split(",").map((cat) => decodeHtmlEntities(cat.trim()))
            : [],
          tags: Array.isArray(post.tags)
            ? post.tags.map(decodeHtmlEntities)
            : typeof post.tags === "string"
            ? post.tags.split(",").map((tag) => decodeHtmlEntities(tag.trim()))
            : [],
        }));
        setPosts(decodedPosts || []);
      } catch (error) {
        console.error("Error fetching posts:", error);
      }
    };
    fetchPosts();
  }, []);

  const handleCreatePost = () => {
    if (!WordPressAuthService.isAuthenticated()) {
      navigate("/wpLogin");
      return;
    }
    navigate("/blog/create");
  };

  return (
    <div className="blog-management">
      <div className="blog-management-header">
        <h1>Blog Management</h1>
        <button 
          className="add-post-button" 
          onClick={handleCreatePost}
        >
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
      const sorted = [...posts].sort(
        (a, b) => new Date(b.date) - new Date(a.date)
      );
      setSortedPosts(sorted);
      setFeaturedPost(sorted[0]);
      setRecentPosts(sorted.slice(1, 7));
      setPopularPosts(sorted.slice(0, 4));

      // Extract unique categories, ensuring they are decoded
      const allCategories = new Set();
      posts.forEach((post) => {
        const cats = Array.isArray(post.categories)
          ? post.categories
          : typeof post.categories === "string" && post.categories
          ? post.categories.split(",").map((cat) => cat.trim())
          : [];
        cats.forEach((category) => allCategories.add(decodeHtmlEntities(category)));
      });
      setCategories(Array.from(allCategories));
    }
  }, [posts]);

  const filteredPosts = sortedPosts.filter((post) => {
    const statusMatch =
      !WordPressAuthService.isAuthenticated() ? post.status === "publish" : true;
    const categoryMatch =
      activeCategory === "all" ||
      (Array.isArray(post.categories)
        ? post.categories.includes(activeCategory)
        : typeof post.categories === "string" &&
          post.categories
            .split(",")
            .map((cat) => decodeHtmlEntities(cat.trim()))
            .includes(activeCategory));
    const searchMatch =
      !searchTerm ||
      decodeHtmlEntities(post.title).toLowerCase().includes(searchTerm.toLowerCase()) ||
      decodeHtmlEntities(post.excerpt).toLowerCase().includes(searchTerm.toLowerCase()) ||
      (post.tags &&
        (Array.isArray(post.tags)
          ? post.tags.some((tag) =>
              decodeHtmlEntities(tag).toLowerCase().includes(searchTerm.toLowerCase())
            )
          : typeof post.tags === "string" &&
            post.tags
              .split(",")
              .map((tag) => decodeHtmlEntities(tag.trim()))
              .some((tag) => tag.toLowerCase().includes(searchTerm.toLowerCase()))));
    return statusMatch && categoryMatch && searchMatch;
  });

  const indexOfLastPost = currentPage * postsPerPage;
  const indexOfFirstPost = indexOfLastPost - postsPerPage;
  const currentPosts = filteredPosts.slice(indexOfFirstPost, indexOfLastPost);
  const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

  const paginate = (pageNumber) => setCurrentPage(pageNumber);

  const handleSearchChange = (e) => {
    setSearchTerm(e.target.value);
    setCurrentPage(1);
  };

  const handleWriteFirstPost = () => {
    navigate("/blog/create");
  };

  const getCategoriesArray = (categories) => {
    if (Array.isArray(categories)) {
      return categories.map(decodeHtmlEntities);
    } else if (typeof categories === "string" && categories) {
      return categories.split(",").map((cat) => decodeHtmlEntities(cat.trim())).filter(Boolean);
    }
    return [];
  };

  const handlePostNavigation = (postSlug) => {
    if (postSlug) {
      navigate(`/blog/${postSlug}`);
    }
  };

  if (posts.length === 0) {
    return (
      <div className="blog-empty">
        <h2>No articles published yet</h2>
        <p>Be the first to share your thoughts and insights!</p>
        <button className="create-first-post-btn" onClick={handleWriteFirstPost}>
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
              className={`category-btn ${activeCategory === "all" ? "active" : ""}`}
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
                className={`category-btn ${activeCategory === category ? "active" : ""}`}
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
              <img
                src={featuredPost.image || "/default-hero.png"}
                alt={decodeHtmlEntities(featuredPost.title) || "Featured Post"}
              />
            </div>
            <div className="featured-content">
              <div className="post-meta">
                <span className="featured-label">Featured</span>
                <span className="post-date">
                  {featuredPost.date
                    ? new Date(featuredPost.date).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })
                    : "Date unavailable"}
                </span>
                <span className="reading-time">
                  {featuredPost.readingTime || "5"} min read
                </span>
              </div>

              <h2 className="featured-title">
                {decodeHtmlEntities(featuredPost.title) || "Untitled"}
              </h2>

              {featuredPost.subtitle && (
                <h3 className="featured-subtitle">
                  {decodeHtmlEntities(featuredPost.subtitle)}
                </h3>
              )}

              <p className="featured-excerpt">
                {decodeHtmlEntities(featuredPost.excerpt) || ""}
              </p>

              <div className="post-categories">
                {getCategoriesArray(featuredPost.categories).map((category, index) => (
                  <span className="category-tag" key={index}>
                    {category}
                  </span>
                ))}
              </div>

              <div className="post-author">
                <img
                  src={featuredPost.author?.avatar || "/default-avatar.png"}
                  alt={decodeHtmlEntities(featuredPost.author?.name) || "Author"}
                  className="author-avatar"
                />
                <div className="author-details">
                  <span className="author-name">
                    {decodeHtmlEntities(featuredPost.author?.name) || "Author"}
                  </span>
                </div>
              </div>

              <button
                onClick={() => handlePostNavigation(featuredPost.slug)}
                className="read-article-btn"
              >
                Read Full Article
              </button>
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
                    <div
                      onClick={() => handlePostNavigation(post.slug)}
                      className="article-image-link"
                      style={{ cursor: "pointer" }}
                    >
                      <div className="article-image">
                        <img
                          src={post.image || "/default-hero.png"}
                          alt={decodeHtmlEntities(post.title) || "Article"}
                        />
                      </div>
                    </div>

                    <div className="article-content">
                      <div className="article-meta">
                        <span className="post-date">
                          {post.date
                            ? new Date(post.date).toLocaleDateString("en-US", {
                                month: "short",
                                day: "numeric",
                              })
                            : "Date unavailable"}
                        </span>
                        <span className="reading-time">
                          {post.readingTime || "4"} min read
                        </span>
                      </div>

                      <h3 className="article-title">
                        <button
                          onClick={() => handlePostNavigation(post.slug)}
                          style={{
                            background: "none",
                            border: "none",
                            padding: 0,
                            cursor: "pointer",
                            textAlign: "left",
                            color: "inherit",
                            fontSize: "inherit",
                            fontWeight: "inherit",
                            textDecoration: "none",
                          }}
                        >
                          {decodeHtmlEntities(post.title) || "Untitled"}
                        </button>
                      </h3>

                      <p className="article-excerpt">
                        {decodeHtmlEntities(post.excerpt) || ""}
                      </p>

                      {getCategoriesArray(post.categories).length > 0 && (
                        <div className="article-categories">
                          {getCategoriesArray(post.categories).map(
                            (category, index) => (
                              <span
                                key={index}
                                className="category-tag"
                                onClick={(e) => {
                                  e.preventDefault();
                                  e.stopPropagation();
                                  setActiveCategory(category);
                                  setCurrentPage(1);
                                }}
                                style={{ cursor: "pointer" }}
                              >
                                {category}
                              </span>
                            )
                          )}
                        </div>
                      )}

                      <div className="article-footer">
                        <div className="author-info">
                          <img
                            src={post.author?.avatar || "/default-avatar.png"}
                            alt={decodeHtmlEntities(post.author?.name) || "Author"}
                            className="author-avatar-small"
                          />
                          <span className="author-name">
                            {decodeHtmlEntities(post.author?.name) || "Author"}
                          </span>
                        </div>

                        <button
                          onClick={() => handlePostNavigation(post.slug)}
                          className="read-more-btn"
                        >
                          Read More
                        </button>
                        <button
                          onClick={() => navigate(`/blog/edit/${post.slug}`)}
                          className="edit-btn"
                        >
                          Edit
                        </button>
                      </div>
                    </div>
                  </article>
                ))}
              </div>

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
                  setCurrentPage(1);
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
                  <button
                    onClick={() => handlePostNavigation(post.slug)}
                    className="popular-post-link"
                    style={{
                      background: "none",
                      border: "none",
                      padding: 0,
                      cursor: "pointer",
                      textAlign: "left",
                      width: "100%",
                    }}
                  >
                    <h4>{decodeHtmlEntities(post.title) || "Untitled"}</h4>
                    <div className="popular-post-meta">
                      <span className="popular-post-author">
                        {decodeHtmlEntities(post.author?.name) || "Author"}
                      </span>
                      <span className="dot-separator">·</span>
                      <span className="popular-post-read-time">
                        {post.readingTime || "4"} min read
                      </span>
                    </div>
                  </button>
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
        </aside>
      </div>
    </div>
  );
};

export default BlogManagement;
// components/Blog/Blog.js
import React, { useState, useEffect } from "react";
import { Link, useParams } from "react-router-dom";
import "../styles/Blog.css";
import blogData from "../Data/BlogData";

const Blog = () => {
  const [featuredPosts, setFeaturedPosts] = useState([]);
  const [recentPosts, setRecentPosts] = useState([]);
  const [categories, setCategories] = useState([]);

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    // For this demo, we're using the imported blogData

    // Set featured posts (first 3)
    setFeaturedPosts(blogData.slice(0, 3));

    // Set recent posts (all posts, sorted by date)
    setRecentPosts(
      [...blogData].sort(
        (a, b) => new Date(b.publishDate) - new Date(a.publishDate)
      )
    );

    // Extract unique categories
    const allCategories = blogData.reduce((cats, post) => {
      post.categories.forEach((cat) => {
        if (!cats.includes(cat)) {
          cats.push(cat);
        }
      });
      return cats;
    }, []);

    setCategories(allCategories);
  }, []);

  return (
    <div className="blog-page">
      <div className="blog-hero">
        <div className="container">
          <h1>Our Blog</h1>
          <p>
            Insights, tutorials, and updates about report generation and data
            visualization
          </p>
        </div>
      </div>

      <div className="container">
        {/* Featured Posts */}
        <section className="featured-posts">
          <h2 className="section-title">Featured Posts</h2>
          <div className="featured-grid">
            {featuredPosts.map((post) => (
              <div className="featured-post" key={post.id}>
                <img src={post.image} alt={post.title} className="post-image" />
                <div className="post-content">
                  <div className="post-categories">
                    {post.categories.map((category) => (
                      <Link
                        to={`/blog/category/${category
                          .toLowerCase()
                          .replace(" ", "-")}`}
                        className="category-tag"
                        key={category}
                      >
                        {category}
                      </Link>
                    ))}
                  </div>
                  <h3 className="post-title">
                    <Link to={`/blog/post/${post.id}`}>{post.title}</Link>
                  </h3>
                  <p className="post-excerpt">{post.excerpt}</p>
                  <div className="post-meta">
                    <div className="author-info">
                      <img
                        src={post.author.avatar}
                        alt={post.author.name}
                        className="author-avatar"
                      />
                      <span className="author-name">{post.author.name}</span>
                    </div>
                    <span className="post-date">
                      {new Date(post.publishDate).toLocaleDateString("en-US", {
                        month: "long",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="blog-content-layout">
          <div className="main-content">
            {/* Recent Posts */}
            <section className="recent-posts">
              <h2 className="section-title">Recent Posts</h2>
              <div className="posts-list">
                {recentPosts.map((post) => (
                  <div className="post-card" key={post.id}>
                    <img
                      src={post.image}
                      alt={post.title}
                      className="post-image"
                    />
                    <div className="post-content">
                      <div className="post-categories">
                        {post.categories.map((category) => (
                          <Link
                            to={`/blog/category/${category
                              .toLowerCase()
                              .replace(" ", "-")}`}
                            className="category-tag"
                            key={category}
                          >
                            {category}
                          </Link>
                        ))}
                      </div>
                      <h3 className="post-title">
                        <Link to={`/blog/post/${post.id}`}>{post.title}</Link>
                      </h3>
                      <p className="post-excerpt">{post.excerpt}</p>
                      <div className="post-meta">
                        <div className="author-info">
                          <img
                            src={post.author.avatar}
                            alt={post.author.name}
                            className="author-avatar"
                          />
                          <span className="author-name">
                            {post.author.name}
                          </span>
                        </div>
                        <span className="post-date">
                          {new Date(post.publishDate).toLocaleDateString(
                            "en-US",
                            {
                              month: "long",
                              day: "numeric",
                              year: "numeric",
                            }
                          )}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
              <div className="load-more">
                <button className="load-more-btn">Load More</button>
              </div>
            </section>
          </div>

          <aside className="blog-sidebar">
            <div className="sidebar-section categories-section">
              <h3 className="sidebar-title">Categories</h3>
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

            <div className="sidebar-section newsletter-section">
              <h3 className="sidebar-title">Subscribe to Our Newsletter</h3>
              <p>Get the latest posts delivered right to your inbox</p>
              <form className="newsletter-form">
                <input type="email" placeholder="Your email address" required />
                <button type="submit">Subscribe</button>
              </form>
            </div>

            <div className="sidebar-section tags-section">
              <h3 className="sidebar-title">Popular Tags</h3>
              <div className="tags-cloud">
                <Link to="/blog/tag/data-visualization" className="tag">
                  Data Visualization
                </Link>
                <Link to="/blog/tag/reporting" className="tag">
                  Reporting
                </Link>
                <Link to="/blog/tag/analytics" className="tag">
                  Analytics
                </Link>
                <Link to="/blog/tag/excel" className="tag">
                  Excel
                </Link>
                <Link to="/blog/tag/csv" className="tag">
                  CSV
                </Link>
                <Link to="/blog/tag/charts" className="tag">
                  Charts
                </Link>
                <Link to="/blog/tag/automation" className="tag">
                  Automation
                </Link>
                <Link to="/blog/tag/tips" className="tag">
                  Tips
                </Link>
              </div>
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default Blog;

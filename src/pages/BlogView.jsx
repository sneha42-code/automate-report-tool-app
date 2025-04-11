import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getPostById, loadPostsFromStorage } from "../utils/blogStorage";
import "../styles/BlogView.css";

const BlogView = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const articleRef = useRef(null);

  useEffect(() => {
    // Load the post by ID
    const currentPost = getPostById(postId);

    if (!currentPost) {
      // Post not found, redirect to blog main page
      navigate("/blog");
      return;
    }

    setPost(currentPost);

    // Find related posts (with same categories)
    const allPosts = loadPostsFromStorage();
    const related = allPosts
      .filter(
        (p) =>
          p.id !== currentPost.id &&
          p.categories &&
          currentPost.categories &&
          p.categories.some((cat) => currentPost.categories.includes(cat))
      )
      .slice(0, 3);

    setRelatedPosts(related);

    // Find recommended posts (different algorithm, here just by date)
    const recommended = allPosts
      .filter(
        (p) => p.id !== currentPost.id && !related.find((r) => r.id === p.id)
      )
      .sort((a, b) => new Date(b.date) - new Date(a.date))
      .slice(0, 4);

    setRecommendedPosts(recommended);
    setLoading(false);

    // Scroll to top when post changes
    window.scrollTo(0, 0);
  }, [postId, navigate]);

  // Track reading progress
  useEffect(() => {
    const handleScroll = () => {
      if (articleRef.current) {
        const element = articleRef.current;
        const totalHeight = element.clientHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const currentPosition = scrollTop + windowHeight;
        const elementTop =
          window.pageYOffset + element.getBoundingClientRect().top;

        // Start counting from when the article comes into view
        if (scrollTop >= elementTop) {
          const currentProgress = Math.min(
            100,
            ((scrollTop - elementTop) / (totalHeight - windowHeight + 200)) *
              100
          );
          setProgress(currentProgress);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [post]);

  if (loading) {
    return (
      <div className="enhanced-loading">
        <div className="loading-spinner"></div>
        <p>Loading article...</p>
      </div>
    );
  }

  if (!post) {
    return null; // This should not happen due to the redirect in useEffect
  }

  // Function to render post content
  const renderContent = () => {
    // If post.content is a string, render it as paragraphs
    if (typeof post.content === "string") {
      return post.content.split("\n\n").map((paragraph, index) => (
        <p key={index} className="article-paragraph">
          {paragraph}
        </p>
      ));
    }

    // If post.content is an array of content blocks
    if (Array.isArray(post.content)) {
      return post.content.map((section, index) => {
        if (typeof section === "string") {
          return (
            <p key={index} className="article-paragraph">
              {section}
            </p>
          );
        }

        // If using the content block structure
        switch (section.type) {
          case "paragraph":
            return (
              <p key={index} className="article-paragraph">
                {section.content}
              </p>
            );
          case "heading":
            return (
              <h2 key={index} className="article-heading">
                {section.content}
              </h2>
            );
          case "subheading":
            return (
              <h3 key={index} className="article-subheading">
                {section.content}
              </h3>
            );
          case "image":
            return (
              <figure key={index} className="article-figure">
                <img
                  src={section.url}
                  alt={section.caption || ""}
                  className="article-image"
                />
                {section.caption && (
                  <figcaption className="article-caption">
                    {section.caption}
                  </figcaption>
                )}
              </figure>
            );
          case "quote":
            return (
              <blockquote key={index} className="article-quote">
                <p>"{section.content}"</p>
                {section.attribution && <cite>— {section.attribution}</cite>}
              </blockquote>
            );
          case "list":
            return (
              <ul key={index} className="article-list">
                {section.items.map((item, i) => (
                  <li key={i} className="article-list-item">
                    {item}
                  </li>
                ))}
              </ul>
            );
          default:
            return (
              <p key={index} className="article-paragraph">
                {JSON.stringify(section)}
              </p>
            );
        }
      });
    }

    // Fallback
    return <p className="article-paragraph">{post.content}</p>;
  };

  return (
    <div className="enhanced-article-container">
      {/* Reading Progress Bar */}
      <div className="reading-progress-container">
        <div
          className="reading-progress-bar"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <header className="enhanced-article-header">
        <div className="enhanced-article-meta">
          <span className="article-date">
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          <span className="article-reading-time">
            {post.readingTime || "5"} min read
          </span>
        </div>

        <h1 className="enhanced-article-title">{post.title}</h1>

        {post.subtitle && (
          <h2 className="enhanced-article-subtitle">{post.subtitle}</h2>
        )}

        <div className="enhanced-article-author">
          <img
            src={post.author?.avatar || "/default-avatar.png"}
            alt={post.author?.name || "Author"}
            className="enhanced-author-avatar"
          />
          <div className="enhanced-author-info">
            <span className="enhanced-author-name">
              {post.author?.name || "Author"}
            </span>
            {post.author?.title && (
              <span className="enhanced-author-title">{post.author.title}</span>
            )}
          </div>
        </div>

        <div className="enhanced-article-categories">
          {post.categories &&
            post.categories.map((category) => (
              <Link
                to={`/blog/category/${category
                  .toLowerCase()
                  .replace(" ", "-")}`}
                className="enhanced-category-tag"
                key={category}
              >
                {category}
              </Link>
            ))}
        </div>
      </header>

      <div className="enhanced-article-hero">
        <img
          src={post.image}
          alt={post.title}
          className="enhanced-article-hero-image"
        />
      </div>

      <div className="enhanced-article-layout">
        <aside className="enhanced-article-sidebar">
          <div className="sharing-toolbar">
            <button
              className="share-button"
              onClick={() => setShowTooltip(!showTooltip)}
            >
              <span className="share-icon">Share</span>
              {showTooltip && (
                <div className="share-tooltip">
                  <button className="share-option twitter">Twitter</button>
                  <button className="share-option facebook">Facebook</button>
                  <button className="share-option linkedin">LinkedIn</button>
                  <button className="share-option copy-link">Copy Link</button>
                </div>
              )}
            </button>
            <button className="bookmark-button">
              <span className="bookmark-icon">Save</span>
            </button>
          </div>
        </aside>

        <article className="enhanced-article-content" ref={articleRef}>
          <div className="enhanced-article-body">{renderContent()}</div>

          <div className="enhanced-article-tags">
            {post.tags && post.tags.length > 0 && (
              <div className="tags-container">
                {post.tags.map((tag) => (
                  <Link
                    to={`/blog/tag/${tag.toLowerCase().replace(" ", "-")}`}
                    className="article-tag"
                    key={tag}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          <div className="enhanced-author-bio">
            <img
              src={post.author?.avatar || "/default-avatar.png"}
              alt={post.author?.name || "Author"}
              className="bio-avatar"
            />
            <div className="bio-content">
              <h3 className="bio-name">{post.author?.name || "Author"}</h3>
              {post.author?.bio ? (
                <p className="bio-text">{post.author.bio}</p>
              ) : (
                <p className="bio-text">Writer and contributor to our blog.</p>
              )}
              {post.author?.social && (
                <div className="bio-social-links">
                  {post.author.social.twitter && (
                    <a
                      href={post.author.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link twitter"
                    >
                      Twitter
                    </a>
                  )}
                  {post.author.social.linkedin && (
                    <a
                      href={post.author.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="social-link linkedin"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              )}
              <button className="follow-button">Follow</button>
            </div>
          </div>

          <div className="article-engagement">
            <div className="article-reactions">
              <button className="reaction-button like">
                <span className="reaction-icon">👍</span>
                <span className="reaction-count">42</span>
              </button>
              <button className="reaction-button comment">
                <span className="reaction-icon">💬</span>
                <span className="reaction-count">12</span>
              </button>
            </div>
          </div>
        </article>
      </div>

      {relatedPosts.length > 0 && (
        <section className="enhanced-related-articles">
          <h2 className="related-heading">Related Articles</h2>
          <div className="related-articles-grid">
            {relatedPosts.map((relatedPost) => (
              <div className="related-article-card" key={relatedPost.id}>
                <Link
                  to={`/blog/${relatedPost.id}`}
                  className="related-article-link"
                >
                  <div className="related-article-image">
                    <img src={relatedPost.image} alt={relatedPost.title} />
                  </div>
                  <div className="related-article-content">
                    <h3 className="related-article-title">
                      {relatedPost.title}
                    </h3>
                    <p className="related-article-excerpt">
                      {relatedPost.excerpt}
                    </p>
                    <div className="related-article-meta">
                      <span className="related-article-author">
                        {relatedPost.author?.name}
                      </span>
                      <span className="dot-separator">·</span>
                      <span className="related-article-read-time">
                        {relatedPost.readingTime || "4"} min read
                      </span>
                    </div>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <section className="enhanced-recommended-section">
        <h2 className="recommended-heading">Recommended For You</h2>
        <div className="recommended-articles-grid">
          {recommendedPosts.map((recommendedPost) => (
            <div className="recommended-article-card" key={recommendedPost.id}>
              <Link
                to={`/blog/${recommendedPost.id}`}
                className="recommended-article-link"
              >
                <div className="recommended-article-image">
                  <img
                    src={recommendedPost.image}
                    alt={recommendedPost.title}
                  />
                </div>
                <div className="recommended-article-content">
                  <h3 className="recommended-article-title">
                    {recommendedPost.title}
                  </h3>
                  <div className="recommended-article-meta">
                    <span className="recommended-article-author">
                      {recommendedPost.author?.name}
                    </span>
                    <span className="dot-separator">·</span>
                    <span className="recommended-article-date">
                      {new Date(recommendedPost.date).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      )}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>
      {/* 
      <div className="newsletter-signup">
        <div className="newsletter-content">
          <h3 className="newsletter-heading">Enjoy this article?</h3>
          <p className="newsletter-description">
            Subscribe to our newsletter to get updates on new articles,
            insights, and more.
          </p>
          <form className="newsletter-form">
            <input
              type="email"
              placeholder="Your email address"
              className="newsletter-input"
              required
            />
            <button type="submit" className="newsletter-button">
              Subscribe
            </button>
          </form>
        </div>
      </div> */}

      <div className="enhanced-post-navigation">
        <Link to="/blog" className="back-to-blog-btn">
          ← Back to all articles
        </Link>
      </div>
    </div>
  );
};

export default BlogView;

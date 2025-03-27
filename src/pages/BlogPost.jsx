// components/Blog/BlogPost.js
import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import "../styles/BlogPost.css";
import blogData from "../Data/BlogData";

const BlogPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // In a real app, you would fetch this data from an API
    // For this demo, we're using the imported blogData

    const currentPost = blogData.find(
      (post) => post.id === parseInt(postId) || post.id === postId
    );

    if (!currentPost) {
      // Post not found, redirect to blog main page
      navigate("/blog");
      return;
    }

    setPost(currentPost);

    // Find related posts (same category)
    const related = blogData
      .filter(
        (p) =>
          p.id !== currentPost.id &&
          p.categories.some((cat) => currentPost.categories.includes(cat))
      )
      .slice(0, 3);

    setRelatedPosts(related);
    setLoading(false);
  }, [postId, navigate]);

  if (loading) {
    return (
      <div className="container">
        <div className="loading-spinner">Loading...</div>
      </div>
    );
  }

  if (!post) {
    return null; // This should not happen due to the redirect in useEffect
  }

  return (
    <div className="blog-post-page">
      <div
        className="post-hero"
        style={{ backgroundImage: `url(${post.image})` }}
      >
        <div className="container">
          <div className="post-hero-content">
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
            <h1>{post.title}</h1>
            <div className="post-meta">
              <div className="author-info">
                <img
                  src={post.author.avatar}
                  alt={post.author.name}
                  className="author-avatar"
                />
                <div className="author-details">
                  <span className="author-name">{post.author.name}</span>
                  <span className="author-title">{post.author.title}</span>
                </div>
              </div>
              <div className="post-details">
                <span className="post-date">
                  {new Date(post.publishDate).toLocaleDateString("en-US", {
                    month: "long",
                    day: "numeric",
                    year: "numeric",
                  })}
                </span>
                <span className="post-read-time">{post.readTime} min read</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      <div className="container">
        <div className="blog-post-layout">
          <article className="post-content">
            <div className="post-body">
              {/* Render post content sections */}
              {post.content.map((section, index) => {
                switch (section.type) {
                  case "paragraph":
                    return <p key={index}>{section.content}</p>;

                  case "heading":
                    return <h2 key={index}>{section.content}</h2>;

                  case "subheading":
                    return <h3 key={index}>{section.content}</h3>;

                  case "image":
                    return (
                      <figure key={index} className="post-figure">
                        <img src={section.url} alt={section.caption || ""} />
                        {section.caption && (
                          <figcaption>{section.caption}</figcaption>
                        )}
                      </figure>
                    );

                  case "quote":
                    return (
                      <blockquote key={index} className="post-quote">
                        <p>"{section.content}"</p>
                        {section.attribution && (
                          <cite>— {section.attribution}</cite>
                        )}
                      </blockquote>
                    );

                  case "list":
                    return (
                      <ul key={index} className="post-list">
                        {section.items.map((item, i) => (
                          <li key={i}>{item}</li>
                        ))}
                      </ul>
                    );

                  case "code":
                    return (
                      <pre key={index} className="code-block">
                        <code>{section.content}</code>
                      </pre>
                    );

                  default:
                    return null;
                }
              })}
            </div>

            <div className="post-tags">
              <h3>Tags:</h3>
              <div className="tags-list">
                {post.tags.map((tag) => (
                  <Link
                    to={`/blog/tag/${tag.toLowerCase().replace(" ", "-")}`}
                    className="tag"
                    key={tag}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            </div>

            <div className="post-author-bio">
              <img
                src={post.author.avatar}
                alt={post.author.name}
                className="author-avatar-large"
              />
              <div className="author-bio-content">
                <h3>{post.author.name}</h3>
                <p className="author-title">{post.author.title}</p>
                <p className="author-bio">{post.author.bio}</p>
                <div className="author-social">
                  {post.author.social.twitter && (
                    <a
                      href={post.author.social.twitter}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      Twitter
                    </a>
                  )}
                  {post.author.social.linkedin && (
                    <a
                      href={post.author.social.linkedin}
                      target="_blank"
                      rel="noopener noreferrer"
                    >
                      LinkedIn
                    </a>
                  )}
                </div>
              </div>
            </div>

            <div className="post-comments">
              <h3>Comments</h3>
              <div className="comments-section">
                {/* In a real app, you would implement comments functionality here */}
                <p className="comments-placeholder">
                  Comments are not available in this demo.
                </p>
              </div>
            </div>
          </article>

          <aside className="post-sidebar">
            <div className="sidebar-section sticky-sidebar">
              <div className="sidebar-section table-of-contents">
                <h3 className="sidebar-title">Table of Contents</h3>
                <ul className="toc-list">
                  {post.content
                    .filter((section) =>
                      ["heading", "subheading"].includes(section.type)
                    )
                    .map((section, index) => (
                      <li
                        key={index}
                        className={
                          section.type === "subheading" ? "toc-subitem" : ""
                        }
                      >
                        <a href={`#section-${index}`}>{section.content}</a>
                      </li>
                    ))}
                </ul>
              </div>

              <div className="sidebar-section share-section">
                <h3 className="sidebar-title">Share This Post</h3>
                <div className="share-buttons">
                  <button className="share-button twitter">Twitter</button>
                  <button className="share-button facebook">Facebook</button>
                  <button className="share-button linkedin">LinkedIn</button>
                  <button className="share-button copy-link">Copy Link</button>
                </div>
              </div>

              <div className="sidebar-section newsletter-section">
                <h3 className="sidebar-title">Subscribe to Our Newsletter</h3>
                <p>Get the latest posts delivered right to your inbox</p>
                <form className="newsletter-form">
                  <input
                    type="email"
                    placeholder="Your email address"
                    required
                  />
                  <button type="submit">Subscribe</button>
                </form>
              </div>
            </div>
          </aside>
        </div>

        {/* Related Posts */}
        <section className="related-posts">
          <h2 className="section-title">Related Posts</h2>
          <div className="related-posts-grid">
            {relatedPosts.map((post) => (
              <div className="related-post-card" key={post.id}>
                <img src={post.image} alt={post.title} className="post-image" />
                <div className="post-content">
                  <h3 className="post-title">
                    <Link to={`/blog/post/${post.id}`}>{post.title}</Link>
                  </h3>
                  <div className="post-meta">
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
      </div>
    </div>
  );
};

export default BlogPost;

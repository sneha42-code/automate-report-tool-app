import React, { useState, useEffect } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import { getPostById, loadPostsFromStorage } from "../utils/blogStorage";
import "../styles/BlogView.css";

const BlogPost = () => {
  const { postId } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [loading, setLoading] = useState(true);

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
    setLoading(false);
  }, [postId, navigate]);

  if (loading) {
    return <div className="loading">Loading post...</div>;
  }

  if (!post) {
    return null; // This should not happen due to the redirect in useEffect
  }

  // Function to render post content
  const renderContent = () => {
    // If post.content is a string, render it as paragraphs
    if (typeof post.content === "string") {
      return post.content
        .split("\n\n")
        .map((paragraph, index) => <p key={index}>{paragraph}</p>);
    }

    // If post.content is an array of content blocks
    if (Array.isArray(post.content)) {
      return post.content.map((section, index) => {
        if (typeof section === "string") {
          return <p key={index}>{section}</p>;
        }

        // If using the content block structure from the original code
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
                {section.caption && <figcaption>{section.caption}</figcaption>}
              </figure>
            );
          case "quote":
            return (
              <blockquote key={index} className="post-quote">
                <p>"{section.content}"</p>
                {section.attribution && <cite>— {section.attribution}</cite>}
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
          default:
            return <p key={index}>{JSON.stringify(section)}</p>;
        }
      });
    }

    // Fallback
    return <p>{post.content}</p>;
  };

  return (
    <div className="blog-post-container">
      <header className="post-header">
        <div className="post-meta">
          <span className="post-date">
            {new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            })}
          </span>
          {post.categories && (
            <div className="post-categories">
              {post.categories.map((category) => (
                <Link
                  to={`/blog/category/${category
                    .toLowerCase()
                    .replace(" ", "-")}`}
                  className="category"
                  key={category}
                >
                  {category}
                </Link>
              ))}
            </div>
          )}
        </div>
        <h1 className="post-title">{post.title}</h1>
        <div className="post-author">
          <img
            src={post.author?.avatar || "/default-avatar.png"}
            alt={post.author?.name || "Author"}
            className="author-avatar-large"
          />
          <div className="author-info">
            <span className="author-name">{post.author?.name || "Author"}</span>
            {post.author?.title && (
              <span className="author-title">{post.author.title}</span>
            )}
          </div>
        </div>
      </header>

      <div className="post-hero-image">
        <img src={post.image} alt={post.title} />
      </div>

      <div className="blog-post-layout">
        <article className="post-content">
          <div className="post-body">{renderContent()}</div>

          <div className="post-tags">
            {post.tags && post.tags.length > 0 && (
              <>
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
              </>
            )}
          </div>

          <div className="share-post">
            <h3>Share this post:</h3>
            <div className="share-buttons">
              <button className="share-button twitter">Twitter</button>
              <button className="share-button facebook">Facebook</button>
              <button className="share-button linkedin">LinkedIn</button>
              <button className="share-button email">Email</button>
            </div>
          </div>

          <div className="author-bio">
            <img
              src={post.author?.avatar || "/default-avatar.png"}
              alt={post.author?.name || "Author"}
              className="author-avatar-large"
            />
            <div className="bio-content">
              <h3>{post.author?.name || "Author"}</h3>
              {post.author?.bio && (
                <p className="bio-text">{post.author.bio}</p>
              )}
              {post.author?.social && (
                <div className="author-social-links">
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
              )}
            </div>
          </div>
        </article>

        <aside className="post-sidebar">
          <div className="sidebar-section">
            <h3 className="sidebar-heading">More from our blog</h3>
            <div className="sidebar-posts">
              {loadPostsFromStorage()
                .filter((p) => p.id !== post.id)
                .slice(0, 5)
                .map((p) => (
                  <div className="sidebar-post" key={p.id}>
                    <Link to={`/blog/${p.id}`}>
                      <h4>{p.title}</h4>
                    </Link>
                    <span className="post-date-small">
                      {new Date(p.date).toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                ))}
            </div>
          </div>

          <div className="sidebar-section">
            <h3 className="sidebar-heading">Subscribe</h3>
            <p>Get the latest posts delivered right to your inbox</p>
            <form className="sidebar-form">
              <input type="email" placeholder="Your email address" required />
              <button type="submit">Subscribe</button>
            </form>
          </div>
        </aside>
      </div>

      {relatedPosts.length > 0 && (
        <section className="related-posts">
          <h2>Related Posts</h2>
          <div className="related-posts-grid">
            {relatedPosts.map((relatedPost) => (
              <div className="related-post-card" key={relatedPost.id}>
                <Link to={`/blog/${relatedPost.id}`}>
                  <div className="related-post-image">
                    <img src={relatedPost.image} alt={relatedPost.title} />
                  </div>
                  <div className="related-post-content">
                    <h3>{relatedPost.title}</h3>
                    <p className="related-post-excerpt">
                      {relatedPost.excerpt}
                    </p>
                    <span className="read-more">Read more →</span>
                  </div>
                </Link>
              </div>
            ))}
          </div>
        </section>
      )}

      <div className="post-navigation">
        <Link to="/blog" className="back-to-blog">
          ← Back to Blog
        </Link>
      </div>
    </div>
  );
};

export default BlogPost;

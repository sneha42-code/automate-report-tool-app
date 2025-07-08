import React, { useState, useEffect, useRef } from "react";
import { Link, useParams, useNavigate } from "react-router-dom";
import WordPressService from "./wordPressApiService";
import CommentSystem from "./CommentSystem";
import LikeReactionSystem from "./LikeReactionSystem";
import "../styles/BlogView.css";

const BlogView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);
  const [relatedPosts, setRelatedPosts] = useState([]);
  const [recommendedPosts, setRecommendedPosts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [progress, setProgress] = useState(0);
  const [showTooltip, setShowTooltip] = useState(false);
  const articleRef = useRef(null);

  useEffect(() => {
    const fetchPost = async () => {
      try {
        setLoading(true);
        setError(null);
        
        if (!slug) {
          throw new Error('No post slug provided');
        }

        console.log('Fetching post with slug:', slug);
        
        // Decode the slug in case it has URL encoding
        const decodedSlug = decodeURIComponent(slug);
        console.log('Decoded slug:', decodedSlug);
        
        // Try to fetch post by slug
        let fetchedPost = null;
        
        try {
          fetchedPost = await WordPressService.getPostBySlug(decodedSlug);
        } catch (slugError) {
          console.warn('Failed to fetch by slug, trying original slug:', slugError);
          // Try with original slug if decoding failed
          if (decodedSlug !== slug) {
            fetchedPost = await WordPressService.getPostBySlug(slug);
          } else {
            throw slugError;
          }
        }
        
        if (!fetchedPost) {
          throw new Error(`Post with slug "${slug}" not found`);
        }
        
        console.log('Fetched post:', fetchedPost);
        setPost(fetchedPost);

        // Fetch related and recommended posts in parallel
        try {
          const [relatedPostsResult, recommendedPostsResult] = await Promise.allSettled([
            fetchRelatedPosts(fetchedPost),
            fetchRecommendedPosts(fetchedPost)
          ]);

          if (relatedPostsResult.status === 'fulfilled') {
            setRelatedPosts(relatedPostsResult.value);
          } else {
            console.warn('Error fetching related posts:', relatedPostsResult.reason);
            setRelatedPosts([]);
          }

          if (recommendedPostsResult.status === 'fulfilled') {
            setRecommendedPosts(recommendedPostsResult.value);
          } else {
            console.warn('Error fetching recommended posts:', recommendedPostsResult.reason);
            setRecommendedPosts([]);
          }
        } catch (sideContentError) {
          console.warn('Error fetching side content:', sideContentError);
        }

        setLoading(false);
        window.scrollTo(0, 0);
      } catch (error) {
        console.error("Error fetching post:", error);
        setError(error.message);
        setLoading(false);
      }
    };

    fetchPost();
  }, [slug]);

  // Helper function to fetch related posts
  const fetchRelatedPosts = async (post) => {
    try {
      const categoryId = Array.isArray(post.categories) 
        ? post.categories[0] 
        : typeof post.categories === 'string' 
          ? post.categories.split(',')[0]?.trim()
          : null;

      if (categoryId) {
        const related = await WordPressService.getPostsByCategory(categoryId, {
          per_page: 3,
        });
        
        return related.posts
          ?.filter((p) => p.id !== post.id)
          .slice(0, 3) || [];
      }
      return [];
    } catch (error) {
      console.warn('Error fetching related posts:', error);
      return [];
    }
  };

  // Helper function to fetch recommended posts
  const fetchRecommendedPosts = async (post) => {
    try {
      const recommended = await WordPressService.getPosts({
        per_page: 4,
        orderby: "date",
        order: "desc",
      });
      
      return recommended.posts
        ?.filter((p) => p.id !== post.id)
        .slice(0, 4) || [];
    } catch (error) {
      console.warn('Error fetching recommended posts:', error);
      return [];
    }
  };

  useEffect(() => {
    const handleScroll = () => {
      if (articleRef.current) {
        const element = articleRef.current;
        const totalHeight = element.clientHeight;
        const windowHeight = window.innerHeight;
        const scrollTop = window.scrollY || document.documentElement.scrollTop;
        const elementTop = window.pageYOffset + element.getBoundingClientRect().top;

        if (scrollTop >= elementTop && totalHeight > 0) {
          const currentProgress = Math.min(
            100,
            Math.max(0, ((scrollTop - elementTop) / (totalHeight - windowHeight + 200)) * 100)
          );
          setProgress(currentProgress);
        }
      }
    };

    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, [post]);

  const renderContent = () => {
    if (!post?.content) {
      return <p>No content available.</p>;
    }
    
    return (
      <div
        className="article-content-html"
        dangerouslySetInnerHTML={{ __html: post.content }}
      />
    );
  };

  const getCategoriesArray = (categories) => {
    if (Array.isArray(categories)) {
      return categories;
    } else if (typeof categories === 'string' && categories) {
      return categories.split(',').map(cat => cat.trim()).filter(Boolean);
    }
    return [];
  };

  const getTagsArray = (tags) => {
    if (Array.isArray(tags)) {
      return tags;
    } else if (typeof tags === 'string' && tags) {
      return tags.split(',').map(tag => tag.trim()).filter(Boolean);
    }
    return [];
  };

  // Loading state
  if (loading) {
    return (
      <div className="enhanced-loading">
        <div className="loading-spinner"></div>
        <p>Loading article...</p>
        {slug && <p>Searching for: "{decodeURIComponent(slug)}"</p>}
      </div>
    );
  }

  // Error state
  if (error) {
    return (
      <div className="enhanced-loading">
        <div className="error-message">
          <h2>Error loading article</h2>
          <p>{error}</p>
          <p>Slug: "{slug}"</p>
          <div className="error-actions">
            <Link to="/blog" className="back-to-blog-btn">
              ← Back to all articles
            </Link>
            <button 
              onClick={() => window.location.reload()} 
              className="retry-btn"
              style={{
                marginLeft: '1rem',
                padding: '0.5rem 1rem',
                backgroundColor: '#007cba',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Retry
            </button>
          </div>
        </div>
      </div>
    );
  }

  // No post found
  if (!post) {
    return (
      <div className="enhanced-loading">
        <div className="error-message">
          <h2>Article not found</h2>
          <p>The article you're looking for doesn't exist or has been removed.</p>
          <p>Searched for slug: "{slug}"</p>
          <Link to="/blog" className="back-to-blog-btn">
            ← Back to all articles
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="enhanced-article-container">
      <div className="reading-progress-container">
        <div
          className="reading-progress-bar"
          style={{ width: `${progress}%` }}
        ></div>
      </div>

      <header className="enhanced-article-header">
        <div className="enhanced-article-meta">
          <span className="article-date">
            {post.date ? new Date(post.date).toLocaleDateString("en-US", {
              month: "long",
              day: "numeric",
              year: "numeric",
            }) : 'Date unavailable'}
          </span>
          <span className="article-reading-time">
            {post.readingTime || "5"} min read
          </span>
        </div>

        <h1 className="enhanced-article-title">{post.title || 'Untitled'}</h1>

        {post.subtitle && (
          <h2 className="enhanced-article-subtitle">{post.subtitle}</h2>
        )}

        <div className="enhanced-article-author">
          <img
            src={post.author?.avatar || "/default-avatar.png"}
            alt={post.author?.name || "Author"}
            className="enhanced-author-avatar"
            onError={(e) => {
              e.target.src = "/default-avatar.png";
            }}
          />
          <div className="enhanced-author-info">
            <span className="enhanced-author-name">
              {post.author?.name || "Author"}
            </span>
          </div>
        </div>

        <div className="enhanced-article-categories">
          {getCategoriesArray(post.categories).map((category, index) => (
            <Link
              to={`/blog/category/${category.toLowerCase().replace(/\s+/g, "-")}`}
              className="enhanced-category-tag"
              key={index}
            >
              {category}
            </Link>
          ))}
        </div>
      </header>

      <div className="enhanced-article-hero">
        <img
          src={post.image || '/default-hero.png'}
          alt={post.title || 'Article image'}
          className="enhanced-article-hero-image"
          onError={(e) => {
            e.target.src = '/default-hero.png';
          }}
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
                  <button 
                    className="share-option twitter"
                    onClick={() => {
                      const url = window.location.href;
                      const text = post.title || 'Check out this article';
                      window.open(`https://twitter.com/intent/tweet?url=${encodeURIComponent(url)}&text=${encodeURIComponent(text)}`, '_blank');
                    }}
                  >
                    Twitter
                  </button>
                  <button 
                    className="share-option facebook"
                    onClick={() => {
                      const url = window.location.href;
                      window.open(`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(url)}`, '_blank');
                    }}
                  >
                    Facebook
                  </button>
                  <button 
                    className="share-option linkedin"
                    onClick={() => {
                      const url = window.location.href;
                      const title = post.title || 'Article';
                      window.open(`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(url)}&title=${encodeURIComponent(title)}`, '_blank');
                    }}
                  >
                    LinkedIn
                  </button>
                  <button 
                    className="share-option copy-link"
                    onClick={() => {
                      navigator.clipboard.writeText(window.location.href).then(() => {
                        alert('Link copied to clipboard!');
                      });
                    }}
                  >
                    Copy Link
                  </button>
                </div>
              )}
            </button>
             <button className="bookmark-button" onClick={() => navigate(`/blog/edit/${post.slug}`)}>
              <span className="bookmark-icon">Edit</span>
            </button>
          </div>
        </aside>

        <article className="enhanced-article-content" ref={articleRef}>
          <div className="enhanced-article-body">{renderContent()}</div>

          <div className="enhanced-article-tags">
            {getTagsArray(post.tags).length > 0 && (
              <div className="tags-container">
                {getTagsArray(post.tags).map((tag, index) => (
                  <Link
                    to={`/blog/tag/${tag.toLowerCase().replace(/\s+/g, "-")}`}
                    className="article-tag"
                    key={index}
                  >
                    {tag}
                  </Link>
                ))}
              </div>
            )}
          </div>

          {/* Like and Reaction System */}
          <div className="article-engagement-section">
            <LikeReactionSystem 
              postId={post.id} 
              showReactions={true}
              showCounts={true}
              size="large"
            />
          </div>

          <div className="enhanced-author-bio">
            <img
              src={post.author?.avatar || "/default-avatar.png"}
              alt={post.author?.name || "Author"}
              className="bio-avatar"
              onError={(e) => {
                e.target.src = "/default-avatar.png";
              }}
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

          {/* Comment System */}
          <div className="comments-section">
            <CommentSystem postId={post.id} />
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
                  to={`/blog/${relatedPost.slug}`}
                  className="related-article-link"
                >
                  <div className="related-article-image">
                    <img 
                      src={relatedPost.image || '/default-hero.png'} 
                      alt={relatedPost.title || 'Related article'}
                      onError={(e) => {
                        e.target.src = '/default-hero.png';
                      }}
                    />
                  </div>
                  <div className="related-article-content">
                    <h3 className="related-article-title">
                      {relatedPost.title || 'Untitled'}
                    </h3>
                    <p className="related-article-excerpt">
                      {relatedPost.excerpt || ''}
                    </p>
                    <div className="related-article-meta">
                      <span className="related-article-author">
                        {relatedPost.author?.name || 'Author'}
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
                to={`/blog/${recommendedPost.slug}`}
                className="recommended-article-link"
              >
                <div className="recommended-article-image">
                  <img
                    src={recommendedPost.image || '/default-hero.png'}
                    alt={recommendedPost.title || 'Recommended article'}
                    onError={(e) => {
                      e.target.src = '/default-hero.png';
                    }}
                  />
                </div>
                <div className="recommended-article-content">
                  <h3 className="recommended-article-title">
                    {recommendedPost.title || 'Untitled'}
                  </h3>
                  <div className="recommended-article-meta">
                    <span className="recommended-article-author">
                      {recommendedPost.author?.name || 'Author'}
                    </span>
                    <span className="dot-separator">·</span>
                    <span className="recommended-article-date">
                      {recommendedPost.date ? new Date(recommendedPost.date).toLocaleDateString(
                        "en-US",
                        {
                          month: "short",
                          day: "numeric",
                        }
                      ) : 'Date unavailable'}
                    </span>
                  </div>
                </div>
              </Link>
            </div>
          ))}
        </div>
      </section>

      <div className="enhanced-post-navigation">
        <Link to="/blog" className="back-to-blog-btn">
          ← Back to all articles
        </Link>
      </div>
    </div>
  );
};

export default BlogView;
import React from "react";
import { Link } from "react-router-dom";

const BlogManagementPage = ({ posts, featuredPost }) => {
  return (
    <div className="blog-management-page">
      {posts.map((post) => (
        <div key={post.id} className="blog-post">
          <Link to={`/blog/${post.slug}`} className="article-image-link">
            <img src={post.image} alt={post.title} />
          </Link>
          <h3 className="article-title">
            <Link to={`/blog/${post.slug}`}>{post.title}</Link>
          </h3>
          <p className="article-excerpt">{post.excerpt}</p>
          <Link to={`/blog/${post.slug}`} className="popular-post-link">
            Read Full Article
          </Link>
        </div>
      ))}
      <div className="featured-post">
        <h2>Featured Post</h2>
        <div className="blog-post">
          <Link to={`/blog/${featuredPost.slug}`} className="article-image-link">
            <img src={featuredPost.image} alt={featuredPost.title} />
          </Link>
          <h3 className="article-title">
            <Link to={`/blog/${featuredPost.slug}`}>{featuredPost.title}</Link>
          </h3>
          <p className="article-excerpt">{featuredPost.excerpt}</p>
          <Link to={`/blog/${featuredPost.slug}`} className="read-article-btn">
            Read Full Article
          </Link>
        </div>
      </div>
    </div>
  );
};

export default BlogManagementPage;
import React, { useEffect, useState } from "react";
import { useParams, useNavigate, Link } from "react-router-dom";
import { getPostBySlug } from "../utils/blogStorage";

const BlogView = () => {
  const { slug } = useParams();
  const navigate = useNavigate();
  const [post, setPost] = useState(null);

  useEffect(() => {
    // Load the post by slug
    const currentPost = getPostBySlug(slug);
    if (!currentPost) {
      navigate("/blog");
      return;
    }
    setPost(currentPost);
  }, [slug, navigate]);

  if (!post) {
    return <div>Loading...</div>;
  }

  return (
    <div>
      <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: '1rem' }}>
        <button
          onClick={() => navigate(`/blog/edit/${post.slug}`)}
          style={{
            backgroundColor: '#2196F3',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            padding: '8px 16px',
            cursor: 'pointer',
            fontWeight: 600
          }}
        >
          Edit
        </button>
      </div>
      <h1>{post.title}</h1>
      <div>{post.content}</div>
      <div>
        <h2>Recommended Posts</h2>
        <ul>
          {post.recommendedPosts.map((recommendedPost) => (
            <li key={recommendedPost.slug}>
              <Link to={`/blog/${recommendedPost.slug}`} className="recommended-article-link">
                {recommendedPost.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
      <div>
        <h2>Related Posts</h2>
        <ul>
          {post.relatedPosts.map((relatedPost) => (
            <li key={relatedPost.slug}>
              <Link to={`/blog/${relatedPost.slug}`} className="related-article-link">
                {relatedPost.title}
              </Link>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
};

export default BlogView;
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
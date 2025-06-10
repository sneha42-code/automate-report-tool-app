import React, { useState } from "react";
import { useHistory } from "react-router-dom";
import { createPost } from "../api/posts";

const BlogCreatePage = () => {
  const [formData, setFormData] = useState({
    title: "",
    content: "",
  });
  const history = useHistory();

  // When creating a new post, generate a slug from the title
  const generateSlug = (title) =>
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .trim()
      .replace(/\s+/g, "-");

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const newPost = {
      ...formData,
      slug: generateSlug(formData.title),
    };
    const success = await createPost(newPost);
    if (success) {
      // Redirect to the blog page or the new post
      history.push(`/blog/${newPost.slug}`);
    } else {
      // Handle error (e.g., show a message to the user)
      console.error("Failed to create post");
    }
  };

  return (
    <div>
      <h1>Create a New Post</h1>
      <form onSubmit={handleSubmit}>
        <div>
          <label>Title</label>
          <input
            type="text"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>
        <div>
          <label>Content</label>
          <textarea
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
          />
        </div>
        <button type="submit">Create Post</button>
      </form>
    </div>
  );
};

export default BlogCreatePage;
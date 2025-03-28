import React, { useState } from "react";
import "../styles/AddPostBlog.css";

const AddPostForm = ({ onAddPost }) => {
  const [formData, setFormData] = useState({
    title: "",
    excerpt: "",
    content: "",
    image: "",
    categories: "",
    authorName: "",
    authorAvatar: "",
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value,
    });
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    // Create a new post object
    const newPost = {
      id: Date.now(), // Simple way to generate a unique ID
      title: formData.title,
      excerpt: formData.excerpt,
      content: formData.content,
      image: formData.image,
      date: new Date().toISOString(),
      categories: formData.categories.split(",").map((cat) => cat.trim()),
      author: {
        name: formData.authorName,
        avatar: formData.authorAvatar || "/default-avatar.png",
      },
    };

    // Pass the new post to the parent component
    onAddPost(newPost);

    // Reset the form
    setFormData({
      title: "",
      excerpt: "",
      content: "",
      image: "",
      categories: "",
      authorName: "",
      authorAvatar: "",
    });
  };

  return (
    <div className="add-post-container">
      <h2>Add New Blog Post</h2>
      <form className="add-post-form" onSubmit={handleSubmit}>
        <div className="form-group">
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            value={formData.title}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="excerpt">Excerpt</label>
          <textarea
            id="excerpt"
            name="excerpt"
            value={formData.excerpt}
            onChange={handleChange}
            required
            rows="3"
            placeholder="A brief summary of your post"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="content">Content</label>
          <textarea
            id="content"
            name="content"
            value={formData.content}
            onChange={handleChange}
            required
            rows="8"
            placeholder="Your full blog post content"
          ></textarea>
        </div>

        <div className="form-group">
          <label htmlFor="image">Image URL</label>
          <input
            type="url"
            id="image"
            name="image"
            value={formData.image}
            onChange={handleChange}
            required
            placeholder="https://example.com/image.jpg"
          />
        </div>

        <div className="form-group">
          <label htmlFor="categories">Categories</label>
          <input
            type="text"
            id="categories"
            name="categories"
            value={formData.categories}
            onChange={handleChange}
            placeholder="Web Development, React, JavaScript (comma-separated)"
          />
        </div>

        <div className="form-group">
          <label htmlFor="authorName">Author Name</label>
          <input
            type="text"
            id="authorName"
            name="authorName"
            value={formData.authorName}
            onChange={handleChange}
            required
          />
        </div>

        <div className="form-group">
          <label htmlFor="authorAvatar">Author Avatar URL</label>
          <input
            type="url"
            id="authorAvatar"
            name="authorAvatar"
            value={formData.authorAvatar}
            onChange={handleChange}
            placeholder="https://example.com/avatar.jpg"
          />
        </div>

        <button type="submit" className="submit-button">
          Add Post
        </button>
      </form>
    </div>
  );
};

export default AddPostForm;

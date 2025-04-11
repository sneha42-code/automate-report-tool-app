import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addPost } from "../utils/blogStorage";
import "../styles/BlogCreate.css";

const BlogCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    excerpt: "",
    image: "",
    categories: "",
    tags: "",
    authorName: "",
    authorAvatar: "",
    authorBio: "",
    authorSocial: {
      twitter: "",
      linkedin: "",
    },
  });

  const [contentSections, setContentSections] = useState([
    { type: "paragraph", content: "" },
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [savingAs, setSavingAs] = useState("publish"); // "publish" or "draft"
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    const { name, value } = e.target;

    if (name.startsWith("authorSocial.")) {
      const socialField = name.split(".")[1];
      setFormData({
        ...formData,
        authorSocial: {
          ...formData.authorSocial,
          [socialField]: value,
        },
      });
    } else {
      setFormData({
        ...formData,
        [name]: value,
      });
    }
  };

  const handleSectionChange = (index, value) => {
    const updatedSections = [...contentSections];
    updatedSections[index].content = value;
    setContentSections(updatedSections);
  };

  const addSection = (type) => {
    let newSection;

    switch (type) {
      case "heading":
        newSection = { type: "heading", content: "" };
        break;
      case "subheading":
        newSection = { type: "subheading", content: "" };
        break;
      case "image":
        newSection = { type: "image", url: "", caption: "" };
        break;
      case "quote":
        newSection = { type: "quote", content: "", attribution: "" };
        break;
      case "list":
        newSection = { type: "list", items: [""] };
        break;
      default:
        newSection = { type: "paragraph", content: "" };
    }

    setContentSections([...contentSections, newSection]);
  };

  const removeSection = (index) => {
    const updatedSections = contentSections.filter((_, i) => i !== index);
    setContentSections(updatedSections);
  };

  const validateForm = () => {
    const newErrors = {};

    if (!formData.title.trim()) {
      newErrors.title = "Title is required";
    }

    if (!formData.excerpt.trim()) {
      newErrors.excerpt = "Excerpt is required";
    }

    if (!formData.image.trim()) {
      newErrors.image = "Featured image is required";
    }

    if (!formData.authorName.trim()) {
      newErrors.authorName = "Author name is required";
    }

    // Validate content sections
    const hasContent = contentSections.some((section) => {
      if (
        section.type === "paragraph" ||
        section.type === "heading" ||
        section.type === "subheading" ||
        section.type === "quote"
      ) {
        return section.content.trim() !== "";
      }
      if (section.type === "image") {
        return section.url && section.url.trim() !== "";
      }
      if (section.type === "list") {
        return section.items.some((item) => item.trim() !== "");
      }
      return false;
    });

    if (!hasContent) {
      newErrors.content = "At least one content section is required";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();

    if (!validateForm()) {
      // Scroll to the first error
      const firstError = document.querySelector(".error-message");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    setIsSaving(true);

    // Filter out empty sections
    const filteredSections = contentSections.filter(
      (section) =>
        (section.type === "paragraph" && section.content.trim() !== "") ||
        (section.type === "heading" && section.content.trim() !== "") ||
        (section.type === "subheading" && section.content.trim() !== "") ||
        (section.type === "quote" && section.content.trim() !== "") ||
        (section.type === "image" && section.url) ||
        (section.type === "list" &&
          section.items.some((item) => item.trim() !== ""))
    );

    // Create the new post object
    const newPost = {
      id: Date.now(),
      title: formData.title,
      subtitle: formData.subtitle,
      excerpt: formData.excerpt,
      content: filteredSections,
      image: formData.image,
      date: new Date().toISOString(),
      categories: formData.categories
        .split(",")
        .map((cat) => cat.trim())
        .filter((cat) => cat !== ""),
      tags: formData.tags
        .split(",")
        .map((tag) => tag.trim())
        .filter((tag) => tag !== ""),
      readingTime: calculateReadingTime(filteredSections),
      status: savingAs, // "publish" or "draft"
      author: {
        name: formData.authorName,
        avatar: formData.authorAvatar || "/default-avatar.png",
        bio: formData.authorBio,
        social: {
          twitter: formData.authorSocial.twitter,
          linkedin: formData.authorSocial.linkedin,
        },
      },
    };

    // Save the post
    const success = addPost(newPost);

    setIsSaving(false);

    if (success) {
      // Redirect to the blog page or the new post
      if (savingAs === "publish") {
        navigate(`/blog/${newPost.id}`);
      } else {
        navigate("/blog");
      }
    } else {
      // Handle error
      setErrors({
        ...errors,
        general: "Failed to save post. Please try again.",
      });
    }
  };

  // Calculate estimated reading time
  const calculateReadingTime = (sections) => {
    let wordCount = 0;

    sections.forEach((section) => {
      if (
        section.type === "paragraph" ||
        section.type === "heading" ||
        section.type === "subheading" ||
        section.type === "quote"
      ) {
        wordCount += section.content.split(/\s+/).length;
      } else if (section.type === "list") {
        section.items.forEach((item) => {
          wordCount += item.split(/\s+/).length;
        });
      }
    });

    // Average reading speed is about 200-250 words per minute
    const minutes = Math.ceil(wordCount / 200);
    return minutes < 1 ? 1 : minutes;
  };

  const renderSectionEditor = (section, index) => {
    switch (section.type) {
      case "heading":
        return (
          <div className="content-section heading-section" key={index}>
            <div className="section-controls">
              <span>Heading</span>
              <button type="button" onClick={() => removeSection(index)}>
                Remove
              </button>
            </div>
            <input
              type="text"
              value={section.content}
              onChange={(e) => handleSectionChange(index, e.target.value)}
              placeholder="Section Heading"
              className="heading-input"
            />
          </div>
        );
      case "subheading":
        return (
          <div className="content-section subheading-section" key={index}>
            <div className="section-controls">
              <span>Subheading</span>
              <button type="button" onClick={() => removeSection(index)}>
                Remove
              </button>
            </div>
            <input
              type="text"
              value={section.content}
              onChange={(e) => handleSectionChange(index, e.target.value)}
              placeholder="Subsection Heading"
              className="subheading-input"
            />
          </div>
        );
      case "image":
        return (
          <div className="content-section image-section" key={index}>
            <div className="section-controls">
              <span>Image</span>
              <button type="button" onClick={() => removeSection(index)}>
                Remove
              </button>
            </div>
            <input
              type="url"
              value={section.url || ""}
              onChange={(e) => {
                const updatedSections = [...contentSections];
                updatedSections[index].url = e.target.value;
                setContentSections(updatedSections);
              }}
              placeholder="Image URL"
              className="image-url-input"
            />
            <input
              type="text"
              value={section.caption || ""}
              onChange={(e) => {
                const updatedSections = [...contentSections];
                updatedSections[index].caption = e.target.value;
                setContentSections(updatedSections);
              }}
              placeholder="Image Caption (optional)"
              className="image-caption-input"
            />
            {section.url && (
              <div className="image-preview">
                <img src={section.url} alt="Preview" />
              </div>
            )}
          </div>
        );
      case "quote":
        return (
          <div className="content-section quote-section" key={index}>
            <div className="section-controls">
              <span>Quote</span>
              <button type="button" onClick={() => removeSection(index)}>
                Remove
              </button>
            </div>
            <textarea
              value={section.content}
              onChange={(e) => handleSectionChange(index, e.target.value)}
              placeholder="Quote text"
              className="quote-input"
              rows="3"
            ></textarea>
            <input
              type="text"
              value={section.attribution || ""}
              onChange={(e) => {
                const updatedSections = [...contentSections];
                updatedSections[index].attribution = e.target.value;
                setContentSections(updatedSections);
              }}
              placeholder="Attribution (optional)"
              className="quote-attribution-input"
            />
          </div>
        );
      case "list":
        return (
          <div className="content-section list-section" key={index}>
            <div className="section-controls">
              <span>List</span>
              <button type="button" onClick={() => removeSection(index)}>
                Remove
              </button>
            </div>
            {section.items.map((item, itemIndex) => (
              <div className="list-item-container" key={itemIndex}>
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const updatedSections = [...contentSections];
                    updatedSections[index].items[itemIndex] = e.target.value;
                    setContentSections(updatedSections);
                  }}
                  placeholder={`List item ${itemIndex + 1}`}
                  className="list-item-input"
                />
                <button
                  type="button"
                  onClick={() => {
                    const updatedSections = [...contentSections];
                    updatedSections[index].items = updatedSections[
                      index
                    ].items.filter((_, i) => i !== itemIndex);
                    setContentSections(updatedSections);
                  }}
                  className="remove-list-item"
                >
                  ×
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const updatedSections = [...contentSections];
                updatedSections[index].items.push("");
                setContentSections(updatedSections);
              }}
              className="add-list-item"
            >
              + Add List Item
            </button>
          </div>
        );
      default: // paragraph
        return (
          <div className="content-section paragraph-section" key={index}>
            <div className="section-controls">
              <span>Paragraph</span>
              <button type="button" onClick={() => removeSection(index)}>
                Remove
              </button>
            </div>
            <textarea
              value={section.content}
              onChange={(e) => handleSectionChange(index, e.target.value)}
              placeholder="Paragraph text"
              className="paragraph-input"
              rows="5"
            ></textarea>
          </div>
        );
    }
  };

  return (
    <div className="blog-create-container">
      <header className="blog-create-header">
        <h1>Create New Article</h1>
        <div className="header-actions">
          <button onClick={() => navigate("/blog")} className="cancel-button">
            Cancel
          </button>
        </div>
      </header>

      {errors.general && <div className="error-banner">{errors.general}</div>}

      <form className="blog-create-form" onSubmit={handleSubmit}>
        <div className="form-layout">
          <div className="main-form-content">
            <div className="form-group">
              <label htmlFor="title">Title</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a compelling title"
                className={`title-input ${errors.title ? "error-field" : ""}`}
              />
              {errors.title && (
                <span className="error-message">{errors.title}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="subtitle">Subtitle (optional)</label>
              <input
                type="text"
                id="subtitle"
                name="subtitle"
                value={formData.subtitle}
                onChange={handleChange}
                placeholder="A subtitle to complement your title"
                className="subtitle-input"
              />
            </div>

            <div className="form-group">
              <label htmlFor="excerpt">Excerpt</label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows="3"
                placeholder="A brief summary to appear in previews (150-200 characters recommended)"
                className={`excerpt-input ${
                  errors.excerpt ? "error-field" : ""
                }`}
              ></textarea>
              {errors.excerpt && (
                <span className="error-message">{errors.excerpt}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="image">Featured Image URL</label>
              <input
                type="url"
                id="image"
                name="image"
                value={formData.image}
                onChange={handleChange}
                placeholder="https://example.com/image.jpg"
                className={`image-input ${errors.image ? "error-field" : ""}`}
              />
              {errors.image && (
                <span className="error-message">{errors.image}</span>
              )}
              {formData.image && (
                <div className="image-preview featured-image-preview">
                  <img src={formData.image} alt="Featured preview" />
                </div>
              )}
            </div>

            <div className="form-group content-builder">
              <label>Content</label>
              {errors.content && (
                <span className="error-message">{errors.content}</span>
              )}
              <div className="content-sections">
                {contentSections.map((section, index) =>
                  renderSectionEditor(section, index)
                )}
              </div>

              <div className="add-section-controls">
                <button
                  type="button"
                  onClick={() => addSection("paragraph")}
                  className="add-section-btn"
                >
                  Add Paragraph
                </button>
                <button
                  type="button"
                  onClick={() => addSection("heading")}
                  className="add-section-btn"
                >
                  Add Heading
                </button>
                <button
                  type="button"
                  onClick={() => addSection("subheading")}
                  className="add-section-btn"
                >
                  Add Subheading
                </button>
                <button
                  type="button"
                  onClick={() => addSection("image")}
                  className="add-section-btn"
                >
                  Add Image
                </button>
                <button
                  type="button"
                  onClick={() => addSection("quote")}
                  className="add-section-btn"
                >
                  Add Quote
                </button>
                <button
                  type="button"
                  onClick={() => addSection("list")}
                  className="add-section-btn"
                >
                  Add List
                </button>
              </div>
            </div>
          </div>

          <div className="side-form-content">
            <div className="form-section">
              <h3>Publishing</h3>
              <div className="publishing-actions">
                <button
                  type="submit"
                  className="publish-button"
                  onClick={() => setSavingAs("publish")}
                  disabled={isSaving}
                >
                  {isSaving && savingAs === "publish"
                    ? "Publishing..."
                    : "Publish Article"}
                </button>
                <button
                  type="button"
                  className="save-draft-button"
                  onClick={(e) => {
                    e.preventDefault();
                    setSavingAs("draft");
                    handleSubmit(e);
                  }}
                  disabled={isSaving}
                >
                  {isSaving && savingAs === "draft"
                    ? "Saving..."
                    : "Save as Draft"}
                </button>
              </div>
            </div>

            <div className="form-section">
              <h3>Categories & Tags</h3>
              <div className="form-group">
                <label htmlFor="categories">Categories</label>
                <input
                  type="text"
                  id="categories"
                  name="categories"
                  value={formData.categories}
                  onChange={handleChange}
                  placeholder="Technology, Design, Business (comma-separated)"
                  className="categories-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="web-development, react, javascript (comma-separated)"
                  className="tags-input"
                />
              </div>
            </div>

            <div className="form-section">
              <h3>Author Information</h3>
              <div className="form-group">
                <label htmlFor="authorName">Name</label>
                <input
                  type="text"
                  id="authorName"
                  name="authorName"
                  value={formData.authorName}
                  onChange={handleChange}
                  className={`author-name-input ${
                    errors.authorName ? "error-field" : ""
                  }`}
                />
                {errors.authorName && (
                  <span className="error-message">{errors.authorName}</span>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="authorAvatar">Avatar URL</label>
                <input
                  type="url"
                  id="authorAvatar"
                  name="authorAvatar"
                  value={formData.authorAvatar}
                  onChange={handleChange}
                  placeholder="https://example.com/avatar.jpg"
                  className="author-avatar-input"
                />
                {formData.authorAvatar && (
                  <div className="avatar-preview">
                    <img
                      src={formData.authorAvatar}
                      alt="Author avatar preview"
                    />
                  </div>
                )}
              </div>

              <div className="form-group">
                <label htmlFor="authorBio">Short Bio</label>
                <textarea
                  id="authorBio"
                  name="authorBio"
                  value={formData.authorBio}
                  onChange={handleChange}
                  rows="3"
                  placeholder="A brief author bio"
                  className="author-bio-input"
                ></textarea>
              </div>

              <div className="form-group">
                <label htmlFor="authorSocial.twitter">Twitter Profile</label>
                <input
                  type="url"
                  id="authorSocial.twitter"
                  name="authorSocial.twitter"
                  value={formData.authorSocial.twitter}
                  onChange={handleChange}
                  placeholder="https://twitter.com/username"
                  className="social-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="authorSocial.linkedin">LinkedIn Profile</label>
                <input
                  type="url"
                  id="authorSocial.linkedin"
                  name="authorSocial.linkedin"
                  value={formData.authorSocial.linkedin}
                  onChange={handleChange}
                  placeholder="https://linkedin.com/in/username"
                  className="social-input"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogCreatePage;

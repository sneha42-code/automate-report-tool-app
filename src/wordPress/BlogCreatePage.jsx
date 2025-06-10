import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import WordPressService from "../wordPress/wordPressApiService";
import WordPressAuthService from "../wordPress/wordPressAuthService";
import "../styles/BlogCreate.css";

const BlogCreatePage = () => {
  const navigate = useNavigate();
  const [formData, setFormData] = useState({
    title: "",
    subtitle: "",
    excerpt: "",
    image: null,
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
  const [savingAs, setSavingAs] = useState("publish");
  const [errors, setErrors] = useState({});

  // Prefill author fields with logged-in user data
  useEffect(() => {
    const currentUser = WordPressAuthService.getCurrentUser();
    if (currentUser) {
      setFormData((prev) => ({
        ...prev,
        authorName: currentUser.displayName || currentUser.username || "",
        authorAvatar: currentUser.avatar || "",
        authorBio: currentUser.bio || "", // Adjust if bio is stored differently
        authorSocial: {
          twitter: currentUser.social?.twitter || "",
          linkedin: currentUser.social?.linkedin || "",
        },
      }));
    }
  }, []);

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

  const handleImageChange = (e) => {
    setFormData({
      ...formData,
      image: e.target.files[0],
    });
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
        newSection = { type: "image", file: null, caption: "" };
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
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.excerpt.trim()) newErrors.excerpt = "Excerpt is required";
    if (!formData.image) newErrors.image = "Featured image is required";
    if (!formData.authorName.trim()) newErrors.authorName = "Author name is required";

    const hasContent = contentSections.some((section) => {
      if (["paragraph", "heading", "subheading", "quote"].includes(section.type)) {
        return section.content.trim() !== "";
      }
      if (section.type === "image") {
        return section.file;
      }
      if (section.type === "list") {
        return section.items.some((item) => item.trim() !== "");
      }
      return false;
    });

    if (!hasContent) newErrors.content = "At least one content section is required";
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const convertSectionsToHTML = async () => {
    let htmlContent = "";
    for (const section of contentSections) {
      switch (section.type) {
        case "paragraph":
          if (section.content.trim())
            htmlContent += `<p>${section.content}</p>\n`;
          break;
        case "heading":
          if (section.content.trim())
            htmlContent += `<h2>${section.content}</h2>\n`;
          break;
        case "subheading":
          if (section.content.trim())
            htmlContent += `<h3>${section.content}</h3>\n`;
          break;
        case "image":
          if (section.file) {
            try {
              const media = await WordPressAuthService.uploadMedia(section.file, {
                caption: section.caption || "",
              });
              htmlContent += `<figure><img src="${media.url}" alt="${section.caption || ""}" />`;
              if (section.caption) htmlContent += `<figcaption>${section.caption}</figcaption>`;
              htmlContent += `</figure>\n`;
            } catch (error) {
              console.error("Error uploading image:", error);
            }
          }
          break;
        case "quote":
          if (section.content.trim())
            htmlContent += `<blockquote><p>${section.content}</p>${
              section.attribution ? `<cite>${section.attribution}</cite>` : ""
            }</blockquote>\n`;
          break;
        case "list":
          if (section.items.some((item) => item.trim())) {
            htmlContent += `<ul>\n${section.items
              .filter((item) => item.trim())
              .map((item) => `<li>${item}</li>`)
              .join("\n")}\n</ul>\n`;
          }
          break;
        default:
          break;
      }
    }
    return htmlContent;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      const firstError = document.querySelector(".error-message");
      if (firstError) {
        firstError.scrollIntoView({ behavior: "smooth", block: "center" });
      }
      return;
    }

    if (!WordPressAuthService.isAuthenticated()) {
      setErrors({ general: "Please log in to create a post." });
      navigate("/blog-management");
      return;
    }

    setIsSaving(true);
    try {
      // Upload featured image
      let featuredMediaId = null;
      if (formData.image) {
        const media = await WordPressAuthService.uploadMedia(formData.image, {
          title: formData.title,
        });
        featuredMediaId = media.id;
      }

      // Convert content sections to HTML
      const contentHTML = await convertSectionsToHTML();

      // Prepare post data
      const postData = {
        title: formData.title,
        subtitle: formData.subtitle,
        excerpt: formData.excerpt,
        content: contentHTML,
        status: savingAs,
        categories: formData.categories
          .split(",")
          .map((cat) => cat.trim())
          .filter((cat) => cat !== ""),
        tags: formData.tags
          .split(",")
          .map((tag) => tag.trim())
          .filter((tag) => tag !== ""),
        featured_media: featuredMediaId,
        meta: {
          subtitle: formData.subtitle,
        },
      };

      // Create post
      const token = WordPressAuthService.getToken();
      const newPost = await WordPressService.createPost(postData, token);

      setIsSaving(false);
      if (savingAs === "publish") {
        navigate(`/blog/${newPost.id}`);
      } else {
        navigate("/blog");
      }
    } catch (error) {
      setIsSaving(false);
      setErrors({
        general: error.message || "Failed to save post. Please try again.",
      });
    }
  };

  const calculateReadingTime = (content) => {
    const words = content.replace(/<[^>]*>/g, "").split(/\s+/).length;
    const minutes = Math.ceil(words / 200);
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
              type="file"
              accept="image/*"
              onChange={(e) => {
                const updatedSections = [...contentSections];
                updatedSections[index].file = e.target.files[0];
                setContentSections(updatedSections);
              }}
              className="image-file-input"
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
            {section.file && (
              <div className="image-preview">
                <img src={URL.createObjectURL(section.file)} alt="Preview" />
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
            />
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
      default:
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
            />
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
              />
              {errors.excerpt && (
                <span className="error-message">{errors.excerpt}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="image">Featured Image</label>
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className={`image-input ${errors.image ? "error-field" : ""}`}
              />
              {errors.image && (
                <span className="error-message">{errors.image}</span>
              )}
              {formData.image && (
                <div className="image-preview featured-image-preview">
                  <img src={URL.createObjectURL(formData.image)} alt="Featured preview" />
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
                />
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
import React, { useState, useEffect } from "react";
import { useNavigate, useParams } from "react-router-dom";
import WordPressService from "./wordPressApiService";
import WordPressAuthService from "./wordPressAuthService";
import { Edit, Save, X, Plus, Trash2, Image, Quote, List, Type, Heading } from 'lucide-react';
import "../styles/BlogEdit.css";

const BlogEditPage = () => {
  const navigate = useNavigate();
  const { slug } = useParams();
  const [post, setPost] = useState(null);
  const [loading, setLoading] = useState(true);
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
  const [successMessage, setSuccessMessage] = useState("");

  // Load the post for editing
  useEffect(() => {
    const loadPost = async () => {
      if (!slug) {
        setErrors({ general: "No post specified for editing" });
        setLoading(false);
        return;
      }

      if (!WordPressAuthService.isAuthenticated()) {
        navigate("/wplogin");
        return;
      }

      try {
        setLoading(true);
        const fetchedPost = await WordPressService.getPostBySlug(slug);
        
        if (!fetchedPost) {
          throw new Error("Post not found");
        }

        // Check if user can edit this post
        const currentUser = WordPressAuthService.getCurrentUser();
        const canEdit = 
          currentUser.roles?.includes('administrator') ||
          currentUser.roles?.includes('editor') ||
          fetchedPost.author?.name === currentUser.displayName;

        if (!canEdit) {
          setErrors({ general: "You don't have permission to edit this post" });
          setLoading(false);
          return;
        }

        setPost(fetchedPost);
        
        // Populate form data
        setFormData({
          title: fetchedPost.title || "",
          subtitle: fetchedPost.subtitle || "",
          excerpt: fetchedPost.excerpt || "",
          image: null, // We'll handle existing images separately
          categories: Array.isArray(fetchedPost.categories) 
            ? fetchedPost.categories.join(", ") 
            : (fetchedPost.categories || ""),
          tags: Array.isArray(fetchedPost.tags) 
            ? fetchedPost.tags.join(", ") 
            : (fetchedPost.tags || ""),
          authorName: fetchedPost.author?.name || currentUser.displayName || "",
          authorAvatar: fetchedPost.author?.avatar || currentUser.avatar || "",
          authorBio: fetchedPost.author?.bio || "",
          authorSocial: {
            twitter: fetchedPost.author?.social?.twitter || "",
            linkedin: fetchedPost.author?.social?.linkedin || "",
          },
        });

        // Parse content into sections
        const parsedSections = parseContentToSections(fetchedPost.content);
        setContentSections(parsedSections.length > 0 ? parsedSections : [{ type: "paragraph", content: "" }]);

      } catch (error) {
        console.error("Error loading post:", error);
        setErrors({ general: error.message || "Failed to load post" });
      } finally {
        setLoading(false);
      }
    };

    loadPost();
  }, [slug, navigate]);

  // Parse HTML content back to sections for editing
  const parseContentToSections = (htmlContent) => {
    if (!htmlContent) return [];

    const sections = [];
    const tempDiv = document.createElement('div');
    tempDiv.innerHTML = htmlContent;

    // Simple parsing - you might want to make this more sophisticated
    const elements = tempDiv.children;
    
    for (let element of elements) {
      switch (element.tagName.toLowerCase()) {
        case 'h2':
          sections.push({ type: "heading", content: element.textContent });
          break;
        case 'h3':
          sections.push({ type: "subheading", content: element.textContent });
          break;
        case 'blockquote':
          const cite = element.querySelector('cite');
          sections.push({ 
            type: "quote", 
            content: element.textContent.replace(cite?.textContent || '', '').trim(),
            attribution: cite?.textContent.replace('— ', '') || ""
          });
          break;
        case 'ul':
          const items = Array.from(element.querySelectorAll('li')).map(li => li.textContent);
          sections.push({ type: "list", items });
          break;
        case 'figure':
          const img = element.querySelector('img');
          const caption = element.querySelector('figcaption');
          if (img) {
            sections.push({ 
              type: "image", 
              url: img.src,
              caption: caption?.textContent || "",
              file: null
            });
          }
          break;
        case 'p':
        default:
          if (element.textContent.trim()) {
            sections.push({ type: "paragraph", content: element.textContent });
          }
          break;
      }
    }

    return sections;
  };

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
    setErrors(prev => ({ ...prev, [name]: "" }));
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
    if (!formData.authorName.trim()) newErrors.authorName = "Author name is required";

    const hasContent = contentSections.some((section) => {
      if (["paragraph", "heading", "subheading", "quote"].includes(section.type)) {
        return section.content.trim() !== "";
      }
      if (section.type === "image") {
        return section.file || section.url;
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
          } else if (section.url) {
            // Existing image
            htmlContent += `<figure><img src="${section.url}" alt="${section.caption || ""}" />`;
            if (section.caption) htmlContent += `<figcaption>${section.caption}</figcaption>`;
            htmlContent += `</figure>\n`;
          }
          break;
        case "quote":
          if (section.content.trim())
            htmlContent += `<blockquote><p>${section.content}</p>${
              section.attribution ? `<cite>— ${section.attribution}</cite>` : ""
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

    setIsSaving(true);
    try {
      // Upload featured image if new one is selected
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

      // Update post
      const updatedPost = await WordPressService.updatePost(post.id, postData);
      
      setSuccessMessage("Post updated successfully!");
      setIsSaving(false);
      
      // Navigate to the updated post
      setTimeout(() => {
        navigate(`/blog/${updatedPost.slug || slug}`);
      }, 1500);

    } catch (error) {
      setIsSaving(false);
      setErrors({
        general: error.message || "Failed to update post. Please try again.",
      });
    }
  };

  const renderSectionEditor = (section, index) => {
    switch (section.type) {
      case "heading":
        return (
          <div className="content-section heading-section" key={index}>
            <div className="section-controls">
              <div className="section-type">
                <Heading size={20} />
                <span>Heading</span>
              </div>
              <button type="button" onClick={() => removeSection(index)} className="remove-btn">
                <Trash2 size={16} />
                Remove
              </button>
            </div>
            <input
              type="text"
              value={section.content}
              onChange={(e) => handleSectionChange(index, e.target.value)}
              placeholder="Section Heading"
              className="section-input heading-input"
            />
          </div>
        );
      case "subheading":
        return (
          <div className="content-section subheading-section" key={index}>
            <div className="section-controls">
              <div className="section-type">
                <Type size={20} />
                <span>Subheading</span>
              </div>
              <button type="button" onClick={() => removeSection(index)} className="remove-btn">
                <Trash2 size={16} />
                Remove
              </button>
            </div>
            <input
              type="text"
              value={section.content}
              onChange={(e) => handleSectionChange(index, e.target.value)}
              placeholder="Subsection Heading"
              className="section-input subheading-input"
            />
          </div>
        );
      case "image":
        return (
          <div className="content-section image-section" key={index}>
            <div className="section-controls">
              <div className="section-type">
                <Image size={20} />
                <span>Image</span>
              </div>
              <button type="button" onClick={() => removeSection(index)} className="remove-btn">
                <Trash2 size={16} />
                Remove
              </button>
            </div>
            
            {section.url && !section.file && (
              <div className="existing-image">
                <img src={section.url} alt="Existing" className="existing-image-preview" />
                <p className="image-note">Current image - upload new to replace</p>
              </div>
            )}
            
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const updatedSections = [...contentSections];
                updatedSections[index].file = e.target.files[0];
                setContentSections(updatedSections);
              }}
              className="section-input image-file-input"
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
              className="section-input image-caption-input"
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
              <div className="section-type">
                <Quote size={20} />
                <span>Quote</span>
              </div>
              <button type="button" onClick={() => removeSection(index)} className="remove-btn">
                <Trash2 size={16} />
                Remove
              </button>
            </div>
            <textarea
              value={section.content}
              onChange={(e) => handleSectionChange(index, e.target.value)}
              placeholder="Quote text"
              className="section-input quote-input"
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
              className="section-input quote-attribution-input"
            />
          </div>
        );
      case "list":
        return (
          <div className="content-section list-section" key={index}>
            <div className="section-controls">
              <div className="section-type">
                <List size={20} />
                <span>List</span>
              </div>
              <button type="button" onClick={() => removeSection(index)} className="remove-btn">
                <Trash2 size={16} />
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
                  className="section-input list-item-input"
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
                  <X size={16} />
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
              <Plus size={16} />
              Add List Item
            </button>
          </div>
        );
      default:
        return (
          <div className="content-section paragraph-section" key={index}>
            <div className="section-controls">
              <div className="section-type">
                <Type size={20} />
                <span>Paragraph</span>
              </div>
              <button type="button" onClick={() => removeSection(index)} className="remove-btn">
                <Trash2 size={16} />
                Remove
              </button>
            </div>
            <textarea
              value={section.content}
              onChange={(e) => handleSectionChange(index, e.target.value)}
              placeholder="Paragraph text"
              className="section-input paragraph-input"
              rows="5"
            />
          </div>
        );
    }
  };

  if (loading) {
    return (
      <div className="loading-container">
        <div className="loading-spinner"></div>
        <p>Loading post for editing...</p>
      </div>
    );
  }

  return (
    <div className="blog-edit-container">
      <header className="blog-edit-header">
        <h1>
          <Edit size={28} />
          Edit Article
        </h1>
        <div className="header-actions">
          <button onClick={() => navigate(`/blog/${slug}`)} className="cancel-button">
            <X size={20} />
            Cancel
          </button>
        </div>
      </header>

      {errors.general && <div className="error-banner">{errors.general}</div>}
      {successMessage && <div className="success-banner">{successMessage}</div>}

      <form className="blog-edit-form" onSubmit={handleSubmit}>
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
                className={`form-input title-input ${errors.title ? "error-field" : ""}`}
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
                className="form-input subtitle-input"
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
                placeholder="A brief summary to appear in previews"
                className={`form-input excerpt-input ${
                  errors.excerpt ? "error-field" : ""
                }`}
              />
              {errors.excerpt && (
                <span className="error-message">{errors.excerpt}</span>
              )}
            </div>

            <div className="form-group">
              <label htmlFor="image">Featured Image</label>
              {post?.image && (
                <div className="current-featured-image">
                  <img src={post.image} alt="Current featured" />
                  <p className="image-note">Current featured image - upload new to replace</p>
                </div>
              )}
              <input
                type="file"
                id="image"
                name="image"
                accept="image/*"
                onChange={handleImageChange}
                className="form-input image-input"
              />
              {formData.image && (
                <div className="image-preview">
                  <img src={URL.createObjectURL(formData.image)} alt="New featured preview" />
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
                  <Type size={16} />
                  Add Paragraph
                </button>
                <button
                  type="button"
                  onClick={() => addSection("heading")}
                  className="add-section-btn"
                >
                  <Heading size={16} />
                  Add Heading
                </button>
                <button
                  type="button"
                  onClick={() => addSection("subheading")}
                  className="add-section-btn"
                >
                  <Type size={16} />
                  Add Subheading
                </button>
                <button
                  type="button"
                  onClick={() => addSection("image")}
                  className="add-section-btn"
                >
                  <Image size={16} />
                  Add Image
                </button>
                <button
                  type="button"
                  onClick={() => addSection("quote")}
                  className="add-section-btn"
                >
                  <Quote size={16} />
                  Add Quote
                </button>
                <button
                  type="button"
                  onClick={() => addSection("list")}
                  className="add-section-btn"
                >
                  <List size={16} />
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
                  {isSaving && savingAs === "publish" ? (
                    <div className="spinner"></div>
                  ) : (
                    <Save size={16} />
                  )}
                  {isSaving && savingAs === "publish"
                    ? "Updating..."
                    : "Update Article"}
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
                  {isSaving && savingAs === "draft" ? (
                    <div className="spinner"></div>
                  ) : (
                    <Save size={16} />
                  )}
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
                  className="form-input"
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
                  className="form-input"
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
                  className={`form-input ${
                    errors.authorName ? "error-field" : ""
                  }`}
                />
                {errors.authorName && (
                  <span className="error-message">{errors.authorName}</span>
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
                  className="form-input"
                />
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogEditPage;
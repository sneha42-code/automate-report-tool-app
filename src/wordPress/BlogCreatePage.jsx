import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import { 
  Save, 
  Eye, 
  Upload, 
  Plus, 
  X, 
  Image as ImageIcon, 
  Type, 
  Quote, 
  List, 
  Video, 
  Link2, 
  Code, 
  Minus,
  Calendar,
  Tag,
  Folder,
  User,
  Globe,
  Lock,
  Clock,
  AlertCircle,
  CheckCircle
} from "lucide-react";

// Import your actual WordPress services
import WordPressService from "../wordPress/wordPressApiService";
import WordPressAuthService from "../wordPress/wordPressAuthService";
import "../styles/BlogCreate.css";

const BlogCreatePage = () => {
  const navigate = useNavigate();
  const fileInputRef = useRef(null);
  
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
      instagram: "",
      website: ""
    },
    publishDate: "",
    status: "draft",
    password: "",
    slug: "",
    metaDescription: "",
    focusKeyword: ""
  });

  const [contentSections, setContentSections] = useState([
    { id: 1, type: "paragraph", content: "" }
  ]);

  const [isSaving, setIsSaving] = useState(false);
  const [savingAs, setSavingAs] = useState("draft");
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);
  const [wordCount, setWordCount] = useState(0);
  const [readingTime, setReadingTime] = useState(0);
  const [currentUser, setCurrentUser] = useState(null);

  // Content section types with their configurations
  const sectionTypes = {
    paragraph: { icon: Type, label: "Paragraph", color: "#3B82F6" },
    heading: { icon: Type, label: "Heading", color: "#8B5CF6" },
    subheading: { icon: Type, label: "Subheading", color: "#A855F7" },
    image: { icon: ImageIcon, label: "Image", color: "#10B981" },
    quote: { icon: Quote, label: "Quote", color: "#F59E0B" },
    list: { icon: List, label: "List", color: "#EF4444" },
    video: { icon: Video, label: "Video", color: "#EC4899" },
    code: { icon: Code, label: "Code Block", color: "#6B7280" },
    separator: { icon: Minus, label: "Separator", color: "#9CA3AF" },
    link: { icon: Link2, label: "Link Card", color: "#14B8A6" }
  };

  // Authentication and user data loading
  useEffect(() => {
    // Check authentication
    if (!WordPressAuthService.isAuthenticated()) {
      navigate('/wplogin');
      return;
    }

    // Load current user data
    const user = WordPressAuthService.getCurrentUser();
    if (user) {
      setCurrentUser(user);
      
      // Prefill author fields with WordPress user data
      setFormData(prev => ({
        ...prev,
        authorName: user.displayName || user.username || "",
        authorAvatar: user.avatar || "",
        authorBio: user.bio || "",
        authorSocial: {
          twitter: user.social?.twitter || "",
          linkedin: user.social?.linkedin || "",
          instagram: user.social?.instagram || "",
          website: user.social?.website || ""
        }
      }));
    }
  }, [navigate]);

  // Calculate word count and reading time
  useEffect(() => {
    const allText = contentSections
      .map(section => {
        if (section.type === 'paragraph' || section.type === 'heading' || section.type === 'subheading') {
          return section.content || '';
        }
        if (section.type === 'quote') {
          return section.content || '';
        }
        if (section.type === 'list' && section.items) {
          return section.items.join(' ');
        }
        return '';
      })
      .join(' ');
    
    const words = allText.trim().split(/\s+/).filter(word => word.length > 0);
    const count = words.length;
    setWordCount(count);
    setReadingTime(Math.ceil(count / 200)); // 200 words per minute average
  }, [contentSections]);

  // Auto-generate slug from title
  useEffect(() => {
    if (formData.title && !formData.slug) {
      const autoSlug = formData.title
        .toLowerCase()
        .replace(/[^a-z0-9\s-]/g, '')
        .replace(/\s+/g, '-')
        .substring(0, 50);
      setFormData(prev => ({ ...prev, slug: autoSlug }));
    }
  }, [formData.title]);

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    if (name.startsWith("authorSocial.")) {
      const socialField = name.split(".")[1];
      setFormData(prev => ({
        ...prev,
        authorSocial: {
          ...prev.authorSocial,
          [socialField]: value
        }
      }));
    } else {
      setFormData(prev => ({
        ...prev,
        [name]: type === 'checkbox' ? checked : value
      }));
    }
    setErrors(prev => ({ ...prev, [name]: "" }));
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 10 * 1024 * 1024) { // 10MB limit
        setErrors(prev => ({ ...prev, image: "Image size must be less than 10MB" }));
        return;
      }
      setFormData(prev => ({ ...prev, image: file }));
      setErrors(prev => ({ ...prev, image: "" }));
    }
  };

  const addSection = (type) => {
    const newId = Date.now();
    let newSection = { id: newId, type };

    switch (type) {
      case "heading":
      case "subheading":
      case "paragraph":
        newSection.content = "";
        break;
      case "image":
        newSection = { ...newSection, file: null, caption: "", alt: "", alignment: "center" };
        break;
      case "quote":
        newSection = { ...newSection, content: "", attribution: "", style: "default" };
        break;
      case "list":
        newSection = { ...newSection, items: [""], listType: "unordered" };
        break;
      case "video":
        newSection = { ...newSection, url: "", caption: "", autoplay: false };
        break;
      case "code":
        newSection = { ...newSection, content: "", language: "javascript" };
        break;
      case "separator":
        newSection = { ...newSection, style: "line" };
        break;
      case "link":
        newSection = { ...newSection, url: "", title: "", description: "" };
        break;
      default:
        newSection.content = "";
    }

    setContentSections(prev => [...prev, newSection]);
  };

  const updateSection = (id, updates) => {
    setContentSections(prev =>
      prev.map(section =>
        section.id === id ? { ...section, ...updates } : section
      )
    );
  };

  const removeSection = (id) => {
    setContentSections(prev => prev.filter(section => section.id !== id));
  };

  const moveSection = (id, direction) => {
    setContentSections(prev => {
      const index = prev.findIndex(section => section.id === id);
      if (
        (direction === 'up' && index === 0) ||
        (direction === 'down' && index === prev.length - 1)
      ) {
        return prev;
      }

      const newSections = [...prev];
      const newIndex = direction === 'up' ? index - 1 : index + 1;
      [newSections[index], newSections[newIndex]] = [newSections[newIndex], newSections[index]];
      return newSections;
    });
  };

  const validateForm = () => {
    const newErrors = {};
    
    if (!formData.title.trim()) newErrors.title = "Title is required";
    if (!formData.excerpt.trim()) newErrors.excerpt = "Excerpt is required";
    if (!formData.authorName.trim()) newErrors.authorName = "Author name is required";
    
    if (formData.status === 'password' && !formData.password.trim()) {
      newErrors.password = "Password is required for password-protected posts";
    }

    const hasContent = contentSections.some(section => {
      if (["paragraph", "heading", "subheading", "quote"].includes(section.type)) {
        return section.content?.trim();
      }
      if (section.type === "image") {
        return section.file;
      }
      if (section.type === "list") {
        return section.items?.some(item => item.trim());
      }
      if (section.type === "video") {
        return section.url?.trim();
      }
      if (section.type === "code") {
        return section.content?.trim();
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
          if (section.content?.trim()) {
            htmlContent += `<p>${section.content}</p>\n`;
          }
          break;
        case "heading":
          if (section.content?.trim()) {
            htmlContent += `<h2>${section.content}</h2>\n`;
          }
          break;
        case "subheading":
          if (section.content?.trim()) {
            htmlContent += `<h3>${section.content}</h3>\n`;
          }
          break;
        case "image":
          if (section.file) {
            try {
              const media = await WordPressAuthService.uploadMedia(section.file, {
                caption: section.caption || "",
                alt: section.alt || ""
              });
              htmlContent += `<figure class="wp-block-image align${section.alignment}">
                <img src="${media.url}" alt="${section.alt || ''}" />
                ${section.caption ? `<figcaption>${section.caption}</figcaption>` : ''}
              </figure>\n`;
            } catch (error) {
              console.error("Error uploading image:", error);
            }
          }
          break;
        case "quote":
          if (section.content?.trim()) {
            htmlContent += `<blockquote class="wp-block-quote ${section.style !== 'default' ? `is-style-${section.style}` : ''}">
              <p>${section.content}</p>
              ${section.attribution ? `<cite>${section.attribution}</cite>` : ''}
            </blockquote>\n`;
          }
          break;
        case "list":
          if (section.items?.some(item => item.trim())) {
            const tag = section.listType === 'ordered' ? 'ol' : 'ul';
            htmlContent += `<${tag} class="wp-block-list">\n${section.items
              .filter(item => item.trim())
              .map(item => `<li>${item}</li>`)
              .join('\n')}\n</${tag}>\n`;
          }
          break;
        case "video":
          if (section.url?.trim()) {
            // Convert YouTube/Vimeo URLs to embeddable format
            let embedUrl = section.url;
            if (section.url.includes('youtube.com/watch')) {
              const videoId = section.url.split('v=')[1]?.split('&')[0];
              embedUrl = `https://www.youtube.com/embed/${videoId}`;
            } else if (section.url.includes('vimeo.com/')) {
              const videoId = section.url.split('/').pop();
              embedUrl = `https://player.vimeo.com/video/${videoId}`;
            }
            
            htmlContent += `<figure class="wp-block-embed wp-block-embed-youtube">
              <div class="wp-block-embed__wrapper">
                <iframe src="${embedUrl}" frameborder="0" allowfullscreen ${section.autoplay ? 'autoplay' : ''}></iframe>
              </div>
              ${section.caption ? `<figcaption>${section.caption}</figcaption>` : ''}
            </figure>\n`;
          }
          break;
        case "code":
          if (section.content?.trim()) {
            htmlContent += `<pre class="wp-block-code"><code class="language-${section.language}">${section.content}</code></pre>\n`;
          }
          break;
        case "separator":
          htmlContent += `<hr class="wp-block-separator is-style-${section.style}" />\n`;
          break;
        case "link":
          if (section.url?.trim()) {
            htmlContent += `<div class="wp-block-group link-card">
              <div class="wp-block-group__inner-container">
                <h4><a href="${section.url}" target="_blank" rel="noopener noreferrer">${section.title || section.url}</a></h4>
                ${section.description ? `<p>${section.description}</p>` : ''}
              </div>
            </div>\n`;
          }
          break;
      }
    }
    return htmlContent;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      // Scroll to first error
      const firstError = document.querySelector('.error-field');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
      return;
    }

    if (!WordPressAuthService.isAuthenticated()) {
      setErrors({ general: "Please log in to create a post." });
      navigate("/wplogin");
      return;
    }

    setIsSaving(true);
    try {
      // Upload featured image first if present
      let featuredMediaId = null;
      if (formData.image) {
        const media = await WordPressAuthService.uploadMedia(formData.image, {
          title: formData.title,
        });
        featuredMediaId = media.id;
      }

      // Convert content sections to HTML
      const contentHTML = await convertSectionsToHTML();

      // Prepare post data for WordPress API
      const postData = {
        title: formData.title,
        content: contentHTML,
        excerpt: formData.excerpt,
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
          meta_description: formData.metaDescription,
          focus_keyword: formData.focusKeyword,
          author_bio: formData.authorBio,
          author_social: formData.authorSocial
        },
        // Set custom fields for additional data
        fields: {
          subtitle: formData.subtitle,
          author_social: formData.authorSocial
        }
      };

      // Add password if post is password protected
      if (formData.status === 'password' && formData.password) {
        postData.password = formData.password;
      }

      // Set publish date if specified
      if (formData.publishDate) {
        postData.date = formData.publishDate;
      }

      // Create post using WordPress API
      const token = WordPressAuthService.getToken();
      const newPost = await WordPressService.createPost(postData, token);

      setIsSaving(false);
      
      if (savingAs === "publish") {
        navigate(`/blog/${newPost.slug}`);
      } else {
        navigate("/blog");
      }
    } catch (error) {
      setIsSaving(false);
      console.error("Error creating post:", error);
      setErrors({
        general: error.message || "Failed to save post. Please try again.",
      });
    }
  };

  const renderSectionEditor = (section) => {
    const SectionIcon = sectionTypes[section.type]?.icon || Type;
    const sectionColor = sectionTypes[section.type]?.color || "#3B82F6";

    return (
      <div key={section.id} className="content-section" style={{ borderLeft: `4px solid ${sectionColor}` }}>
        <div className="section-header">
          <div className="section-info">
            <SectionIcon size={16} style={{ color: sectionColor }} />
            <span>{sectionTypes[section.type]?.label || section.type}</span>
          </div>
          <div className="section-controls">
            <button 
              type="button" 
              onClick={() => moveSection(section.id, 'up')}
              className="section-btn"
              title="Move up"
            >
              ↑
            </button>
            <button 
              type="button" 
              onClick={() => moveSection(section.id, 'down')}
              className="section-btn"
              title="Move down"
            >
              ↓
            </button>
            <button 
              type="button" 
              onClick={() => removeSection(section.id)}
              className="section-btn remove"
              title="Remove section"
            >
              <X size={14} />
            </button>
          </div>
        </div>

        <div className="section-content">
          {renderSectionContent(section)}
        </div>
      </div>
    );
  };

  const renderSectionContent = (section) => {
    switch (section.type) {
      case "paragraph":
        return (
          <textarea
            value={section.content || ""}
            onChange={(e) => updateSection(section.id, { content: e.target.value })}
            placeholder="Write your paragraph..."
            className="section-textarea"
            rows={4}
          />
        );

      case "heading":
        return (
          <input
            type="text"
            value={section.content || ""}
            onChange={(e) => updateSection(section.id, { content: e.target.value })}
            placeholder="Enter heading..."
            className="section-input heading"
          />
        );

      case "subheading":
        return (
          <input
            type="text"
            value={section.content || ""}
            onChange={(e) => updateSection(section.id, { content: e.target.value })}
            placeholder="Enter subheading..."
            className="section-input subheading"
          />
        );

      case "image":
        return (
          <div className="image-section">
            <input
              type="file"
              accept="image/*"
              onChange={(e) => {
                const file = e.target.files[0];
                if (file) updateSection(section.id, { file });
              }}
              className="file-input"
            />
            <div className="image-options">
              <input
                type="text"
                value={section.caption || ""}
                onChange={(e) => updateSection(section.id, { caption: e.target.value })}
                placeholder="Image caption (optional)"
                className="section-input"
              />
              <input
                type="text"
                value={section.alt || ""}
                onChange={(e) => updateSection(section.id, { alt: e.target.value })}
                placeholder="Alt text for accessibility"
                className="section-input"
              />
              <select
                value={section.alignment || "center"}
                onChange={(e) => updateSection(section.id, { alignment: e.target.value })}
                className="section-select"
              >
                <option value="left">Align Left</option>
                <option value="center">Align Center</option>
                <option value="right">Align Right</option>
              </select>
            </div>
            {section.file && (
              <div className="image-preview">
                <img src={URL.createObjectURL(section.file)} alt="Preview" />
              </div>
            )}
          </div>
        );

      case "quote":
        return (
          <div className="quote-section">
            <textarea
              value={section.content || ""}
              onChange={(e) => updateSection(section.id, { content: e.target.value })}
              placeholder="Enter quote text..."
              className="section-textarea"
              rows={3}
            />
            <div className="quote-options">
              <input
                type="text"
                value={section.attribution || ""}
                onChange={(e) => updateSection(section.id, { attribution: e.target.value })}
                placeholder="Attribution (optional)"
                className="section-input"
              />
              <select
                value={section.style || "default"}
                onChange={(e) => updateSection(section.id, { style: e.target.value })}
                className="section-select"
              >
                <option value="default">Default</option>
                <option value="large">Large</option>
                <option value="plain">Plain</option>
              </select>
            </div>
          </div>
        );

      case "list":
        return (
          <div className="list-section">
            <div className="list-options">
              <select
                value={section.listType || "unordered"}
                onChange={(e) => updateSection(section.id, { listType: e.target.value })}
                className="section-select"
              >
                <option value="unordered">Bullet List</option>
                <option value="ordered">Numbered List</option>
              </select>
            </div>
            {(section.items || [""]).map((item, index) => (
              <div key={index} className="list-item">
                <input
                  type="text"
                  value={item}
                  onChange={(e) => {
                    const newItems = [...(section.items || [""])];
                    newItems[index] = e.target.value;
                    updateSection(section.id, { items: newItems });
                  }}
                  placeholder={`Item ${index + 1}`}
                  className="section-input"
                />
                <button
                  type="button"
                  onClick={() => {
                    const newItems = (section.items || [""]).filter((_, i) => i !== index);
                    updateSection(section.id, { items: newItems });
                  }}
                  className="remove-item-btn"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => {
                const newItems = [...(section.items || [""]), ""];
                updateSection(section.id, { items: newItems });
              }}
              className="add-item-btn"
            >
              <Plus size={14} /> Add Item
            </button>
          </div>
        );

      case "video":
        return (
          <div className="video-section">
            <input
              type="url"
              value={section.url || ""}
              onChange={(e) => updateSection(section.id, { url: e.target.value })}
              placeholder="Video URL (YouTube, Vimeo, etc.)"
              className="section-input"
            />
            <input
              type="text"
              value={section.caption || ""}
              onChange={(e) => updateSection(section.id, { caption: e.target.value })}
              placeholder="Video caption (optional)"
              className="section-input"
            />
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={section.autoplay || false}
                onChange={(e) => updateSection(section.id, { autoplay: e.target.checked })}
              />
              Autoplay
            </label>
          </div>
        );

      case "code":
        return (
          <div className="code-section">
            <select
              value={section.language || "javascript"}
              onChange={(e) => updateSection(section.id, { language: e.target.value })}
              className="section-select"
            >
              <option value="javascript">JavaScript</option>
              <option value="html">HTML</option>
              <option value="css">CSS</option>
              <option value="python">Python</option>
              <option value="php">PHP</option>
              <option value="sql">SQL</option>
              <option value="json">JSON</option>
            </select>
            <textarea
              value={section.content || ""}
              onChange={(e) => updateSection(section.id, { content: e.target.value })}
              placeholder="Enter your code..."
              className="section-textarea code"
              rows={6}
              style={{ fontFamily: 'monospace' }}
            />
          </div>
        );

      case "separator":
        return (
          <div className="separator-section">
            <select
              value={section.style || "line"}
              onChange={(e) => updateSection(section.id, { style: e.target.value })}
              className="section-select"
            >
              <option value="line">Default</option>
              <option value="wide">Wide</option>
              <option value="dots">Dots</option>
            </select>
            <div className={`separator-preview separator-${section.style || 'line'}`}></div>
          </div>
        );

      case "link":
        return (
          <div className="link-section">
            <input
              type="url"
              value={section.url || ""}
              onChange={(e) => updateSection(section.id, { url: e.target.value })}
              placeholder="Link URL"
              className="section-input"
            />
            <input
              type="text"
              value={section.title || ""}
              onChange={(e) => updateSection(section.id, { title: e.target.value })}
              placeholder="Link title"
              className="section-input"
            />
            <textarea
              value={section.description || ""}
              onChange={(e) => updateSection(section.id, { description: e.target.value })}
              placeholder="Link description (optional)"
              className="section-textarea"
              rows={2}
            />
          </div>
        );

      default:
        return <div>Unknown section type</div>;
    }
  };

  // Show login prompt if not authenticated
  if (!WordPressAuthService.isAuthenticated()) {
    return (
      <div className="blog-create-container">
        <div className="auth-required">
          <AlertCircle size={48} color="#dc2626" />
          <h2>Authentication Required</h2>
          <p>You need to be logged in to create blog posts.</p>
          <button 
            onClick={() => navigate('/wplogin')}
            className="login-button"
          >
            Go to Login
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="blog-create-container">
      <div className="blog-create-header">
        <h1>Create New Article</h1>
        <div className="header-stats">
          <span className="stat-item">
            <Type size={16} />
            {wordCount} words
          </span>
          <span className="stat-item">
            <Clock size={16} />
            {readingTime} min read
          </span>
          {currentUser && (
            <span className="stat-item">
              <User size={16} />
              {currentUser.displayName}
            </span>
          )}
        </div>
        <div className="header-actions">
          <button
            type="button"
            onClick={() => setShowPreview(!showPreview)}
            className="preview-button"
          >
            <Eye size={16} />
            {showPreview ? 'Edit' : 'Preview'}
          </button>
          <button onClick={() => navigate("/blog")} className="cancel-button">
            Cancel
            
          </button>
        </div>
      </div>

      {errors.general && (
        <div className="error-banner">
          <AlertCircle size={20} />
          {errors.general}
        </div>
      )}

      <form className="blog-create-form" onSubmit={handleSubmit}>
        <div className="form-layout">
          <div className="main-form-content">
            {/* Title */}
            <div className="form-group">
              <label htmlFor="title">Title *</label>
              <input
                type="text"
                id="title"
                name="title"
                value={formData.title}
                onChange={handleChange}
                placeholder="Enter a compelling title"
                className={`title-input ${errors.title ? "error-field" : ""}`}
              />
              {errors.title && <span className="error-message">{errors.title}</span>}
            </div>

            {/* Subtitle */}
            <div className="form-group">
              <label htmlFor="subtitle">Subtitle</label>
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

            {/* Slug */}
            <div className="form-group">
              <label htmlFor="slug">URL Slug</label>
              <input
                type="text"
                id="slug"
                name="slug"
                value={formData.slug}
                onChange={handleChange}
                placeholder="url-friendly-slug"
                className="slug-input"
              />
              <small className="helper-text">
                Preview: /blog/{formData.slug || 'your-post-slug'}
              </small>
            </div>

            {/* Excerpt */}
            <div className="form-group">
              <label htmlFor="excerpt">Excerpt *</label>
              <textarea
                id="excerpt"
                name="excerpt"
                value={formData.excerpt}
                onChange={handleChange}
                rows="3"
                placeholder="A brief summary (150-200 characters recommended)"
                className={`excerpt-input ${errors.excerpt ? "error-field" : ""}`}
              />
              {errors.excerpt && <span className="error-message">{errors.excerpt}</span>}
              <small className="helper-text">
                {formData.excerpt.length}/200 characters
              </small>
            </div>

            {/* Featured Image */}
            <div className="form-group">
              <label htmlFor="image">Featured Image</label>
              <input
                type="file"
                id="image"
                accept="image/*"
                onChange={handleImageChange}
                className={`image-input ${errors.image ? "error-field" : ""}`}
                ref={fileInputRef}
              />
              {errors.image && <span className="error-message">{errors.image}</span>}
              {formData.image && (
                <div className="image-preview featured-image-preview">
                  <img src={URL.createObjectURL(formData.image)} alt="Featured preview" />
                  <button
                    type="button"
                    onClick={() => {
                      setFormData(prev => ({ ...prev, image: null }));
                      if (fileInputRef.current) fileInputRef.current.value = '';
                    }}
                    className="remove-image-btn"
                  >
                    <X size={16} />
                  </button>
                </div>
              )}
            </div>

            {/* Content Builder */}
            <div className="form-group content-builder">
              <label>Content *</label>
              {errors.content && <span className="error-message">{errors.content}</span>}
              
              <div className="content-sections">
                {contentSections.map(section => renderSectionEditor(section))}
              </div>

              <div className="add-section-controls">
                <h4>Add Content Block:</h4>
                <div className="section-buttons">
                  {Object.entries(sectionTypes).map(([type, config]) => {
                    const IconComponent = config.icon;
                    return (
                      <button
                        key={type}
                        type="button"
                        onClick={() => addSection(type)}
                        className="add-section-btn"
                        style={{ borderColor: config.color }}
                        title={`Add ${config.label}`}
                      >
                        <IconComponent size={16} style={{ color: config.color }} />
                        {config.label}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="side-form-content">
            {/* Publishing Options */}
            <div className="form-section">
              <h3><Globe size={18} /> Publishing</h3>
              
              <div className="form-group">
                <label htmlFor="status">Post Status</label>
                <select
                  id="status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  className="status-select"
                >
                  <option value="draft">Draft</option>
                  <option value="publish">Published</option>
                  <option value="private">Private</option>
                  <option value="password">Password Protected</option>
                </select>
              </div>

              {formData.status === 'password' && (
                <div className="form-group">
                  <label htmlFor="password">Password</label>
                  <input
                    type="password"
                    id="password"
                    name="password"
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="Enter password"
                    className={`password-input ${errors.password ? "error-field" : ""}`}
                  />
                  {errors.password && <span className="error-message">{errors.password}</span>}
                </div>
              )}

              <div className="form-group">
                <label htmlFor="publishDate">Publish Date</label>
                <input
                  type="datetime-local"
                  id="publishDate"
                  name="publishDate"
                  value={formData.publishDate}
                  onChange={handleChange}
                  className="date-input"
                />
                <small className="helper-text">
                  Leave empty to publish immediately
                </small>
              </div>

              <div className="publishing-actions">
                <button
                  type="submit"
                  className="publish-button"
                  onClick={() => setSavingAs("publish")}
                  disabled={isSaving}
                >
                  {isSaving && savingAs === "publish" ? (
                    <>
                      <div className="spinner"></div>
                      Publishing...
                    </>
                  ) : (
                    <>
                      <Globe size={16} />
                      Publish Article
                    </>
                  )}
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
                    <>
                      <div className="spinner"></div>
                      Saving...
                    </>
                  ) : (
                    <>
                      <Save size={16} />
                      Save as Draft
                    </>
                  )}
                </button>
              </div>
            </div>

            {/* Categories & Tags */}
            <div className="form-section">
              <h3><Folder size={18} /> Categories & Tags</h3>
              
              <div className="form-group">
                <label htmlFor="categories">Categories</label>
                <input
                  type="text"
                  id="categories"
                  name="categories"
                  value={formData.categories}
                  onChange={handleChange}
                  placeholder="Technology, Design, Business"
                  className="categories-input"
                />
                <small className="helper-text">Separate with commas</small>
              </div>

              <div className="form-group">
                <label htmlFor="tags">Tags</label>
                <input
                  type="text"
                  id="tags"
                  name="tags"
                  value={formData.tags}
                  onChange={handleChange}
                  placeholder="wordpress, react, javascript"
                  className="tags-input"
                />
                <small className="helper-text">Separate with commas</small>
              </div>
            </div>

            {/* SEO Settings */}
            <div className="form-section">
              <h3><Globe size={18} /> SEO Settings</h3>
              
              <div className="form-group">
                <label htmlFor="metaDescription">Meta Description</label>
                <textarea
                  id="metaDescription"
                  name="metaDescription"
                  value={formData.metaDescription}
                  onChange={handleChange}
                  placeholder="SEO meta description (160 characters max)"
                  className="meta-description-input"
                  rows="3"
                />
                <small className="helper-text">
                  {formData.metaDescription.length}/160 characters
                </small>
              </div>

              <div className="form-group">
                <label htmlFor="focusKeyword">Focus Keyword</label>
                <input
                  type="text"
                  id="focusKeyword"
                  name="focusKeyword"
                  value={formData.focusKeyword}
                  onChange={handleChange}
                  placeholder="Main SEO keyword"
                  className="focus-keyword-input"
                />
              </div>
            </div>

            {/* Author Information */}
            <div className="form-section">
              <h3><User size={18} /> Author Information</h3>
              
              <div className="form-group">
                <label htmlFor="authorName">Name *</label>
                <input
                  type="text"
                  id="authorName"
                  name="authorName"
                  value={formData.authorName}
                  onChange={handleChange}
                  className={`author-name-input ${errors.authorName ? "error-field" : ""}`}
                />
                {errors.authorName && <span className="error-message">{errors.authorName}</span>}
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
                    <img src={formData.authorAvatar} alt="Author avatar preview" />
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

              <h4>Social Media</h4>
              
              <div className="form-group">
                <label htmlFor="authorSocial.twitter">Twitter</label>
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
                <label htmlFor="authorSocial.linkedin">LinkedIn</label>
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

              <div className="form-group">
                <label htmlFor="authorSocial.instagram">Instagram</label>
                <input
                  type="url"
                  id="authorSocial.instagram"
                  name="authorSocial.instagram"
                  value={formData.authorSocial.instagram}
                  onChange={handleChange}
                  placeholder="https://instagram.com/username"
                  className="social-input"
                />
              </div>

              <div className="form-group">
                <label htmlFor="authorSocial.website">Website</label>
                <input
                  type="url"
                  id="authorSocial.website"
                  name="authorSocial.website"
                  value={formData.authorSocial.website}
                  onChange={handleChange}
                  placeholder="https://yourwebsite.com"
                  className="social-input"
                />
              </div>
            </div>

            {/* Post Analytics */}
            <div className="form-section">
              <h3><Type size={18} /> Content Stats</h3>
              
              <div className="stats-grid">
                <div className="stat-item">
                  <div className="stat-value">{wordCount}</div>
                  <div className="stat-label">Words</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{readingTime}</div>
                  <div className="stat-label">Min Read</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{contentSections.length}</div>
                  <div className="stat-label">Sections</div>
                </div>
                <div className="stat-item">
                  <div className="stat-value">{formData.excerpt.length}</div>
                  <div className="stat-label">Excerpt Chars</div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </form>
    </div>
  );
};

export default BlogCreatePage;
// utils/fileValidation.js

/**
 * File validation utilities for report generation tool
 */

// Allowed file types with their MIME types and extensions
const ALLOWED_FILE_TYPES = {
  // Spreadsheets
  "application/vnd.ms-excel": {
    extensions: [".xls"],
    category: "spreadsheet",
  },
  "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet": {
    extensions: [".xlsx"],
    category: "spreadsheet",
  },
  "application/vnd.oasis.opendocument.spreadsheet": {
    extensions: [".ods"],
    category: "spreadsheet",
  },
  "text/csv": {
    extensions: [".csv"],
    category: "spreadsheet",
  },
  // Text/Document files
  "application/msword": {
    extensions: [".doc"],
    category: "document",
  },
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document": {
    extensions: [".docx"],
    category: "document",
  },
  "application/pdf": {
    extensions: [".pdf"],
    category: "document",
  },
  "text/plain": {
    extensions: [".txt"],
    category: "document",
  },
  // Data files
  "application/json": {
    extensions: [".json"],
    category: "data",
  },
  "application/xml": {
    extensions: [".xml"],
    category: "data",
  },
  // Images
  "image/jpeg": {
    extensions: [".jpg", ".jpeg"],
    category: "image",
  },
  "image/png": {
    extensions: [".png"],
    category: "image",
  },
};

// Maximum file sizes by type (in bytes)
const MAX_FILE_SIZES = {
  spreadsheet: 10 * 1024 * 1024, // 10MB
  document: 20 * 1024 * 1024, // 20MB
  data: 5 * 1024 * 1024, // 5MB
  image: 5 * 1024 * 1024, // 5MB
};

/**
 * Get file extension from filename
 * @param {string} filename - Name of the file
 * @returns {string} File extension (lowercase, with dot)
 */
const getFileExtension = (filename) => {
  if (!filename) return "";
  return `.${filename.split(".").pop()}`.toLowerCase();
};

/**
 * Check if a file type is allowed
 * @param {File} file - File object to validate
 * @returns {boolean} Whether the file type is allowed
 */
const isFileTypeAllowed = (file) => {
  // First check MIME type
  if (file.type && ALLOWED_FILE_TYPES[file.type]) {
    return true;
  }

  // If MIME type check fails, check by extension
  const extension = getFileExtension(file.name);
  return Object.values(ALLOWED_FILE_TYPES).some((typeInfo) =>
    typeInfo.extensions.includes(extension)
  );
};

/**
 * Get the file category from its MIME type or extension
 * @param {File} file - File object to categorize
 * @returns {string|null} Category of the file or null if unknown
 */
const getFileCategory = (file) => {
  // Try to get category from MIME type
  if (file.type && ALLOWED_FILE_TYPES[file.type]) {
    return ALLOWED_FILE_TYPES[file.type].category;
  }

  // Try to get category from extension
  const extension = getFileExtension(file.name);
  for (const typeInfo of Object.values(ALLOWED_FILE_TYPES)) {
    if (typeInfo.extensions.includes(extension)) {
      return typeInfo.category;
    }
  }

  return null;
};

/**
 * Check if file size is within the allowed limit
 * @param {File} file - File object to validate
 * @returns {boolean} Whether the file size is allowed
 */
const isFileSizeAllowed = (file) => {
  const category = getFileCategory(file);
  if (!category) return false;

  return file.size <= MAX_FILE_SIZES[category];
};

/**
 * Get formatted list of allowed file types for display
 * @returns {string} Comma-separated list of allowed file extensions
 */
const getAllowedFileExtensionsForDisplay = () => {
  const extensions = new Set();
  Object.values(ALLOWED_FILE_TYPES).forEach((typeInfo) => {
    typeInfo.extensions.forEach((ext) => extensions.add(ext));
  });

  return Array.from(extensions).sort().join(", ");
};

/**
 * Get maximum file size for a category in readable format
 * @param {string} category - File category
 * @returns {string} Human-readable file size
 */
const getMaxFileSizeForDisplay = (category) => {
  if (!MAX_FILE_SIZES[category]) return "Unknown";

  const sizeInMB = MAX_FILE_SIZES[category] / (1024 * 1024);
  return `${sizeInMB} MB`;
};

/**
 * Validate a single file
 * @param {File} file - File object to validate
 * @returns {Object} Validation result with isValid and error properties
 */
const validateFile = (file) => {
  // Check file type
  if (!isFileTypeAllowed(file)) {
    return {
      isValid: false,
      error: `Invalid file type. Only ${getAllowedFileExtensionsForDisplay()} are allowed.`,
    };
  }

  // Check file size
  if (!isFileSizeAllowed(file)) {
    const category = getFileCategory(file);
    return {
      isValid: false,
      error: `File size exceeds the maximum allowed size (${getMaxFileSizeForDisplay(
        category
      )}).`,
    };
  }

  return {
    isValid: true,
    error: null,
  };
};

/**
 * Validate multiple files
 * @param {FileList|File[]} files - Array or FileList of files to validate
 * @returns {Object} Validation results with valid files, invalid files, and errors
 */
const validateFiles = (files) => {
  const validFiles = [];
  const invalidFiles = [];
  const errors = [];

  Array.from(files).forEach((file) => {
    const validation = validateFile(file);
    if (validation.isValid) {
      validFiles.push(file);
    } else {
      invalidFiles.push({
        file,
        error: validation.error,
      });
      errors.push(`${file.name}: ${validation.error}`);
    }
  });

  return {
    isValid: invalidFiles.length === 0,
    validFiles,
    invalidFiles,
    errors,
  };
};

/**
 * Get a human-readable file size string
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size string
 */
const formatFileSize = (bytes) => {
  if (bytes === 0) return "0 Bytes";

  const sizes = ["Bytes", "KB", "MB", "GB", "TB"];
  const i = Math.floor(Math.log(bytes) / Math.log(1024));

  return parseFloat((bytes / Math.pow(1024, i)).toFixed(2)) + " " + sizes[i];
};

export {
  validateFile,
  validateFiles,
  isFileTypeAllowed,
  isFileSizeAllowed,
  getFileCategory,
  getAllowedFileExtensionsForDisplay,
  getMaxFileSizeForDisplay,
  formatFileSize,
};

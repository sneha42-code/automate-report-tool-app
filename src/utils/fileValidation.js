// src/utils/fileValidation.js

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_FILE_EXTENSIONS = [".xlsx"]; // Only allow Excel files for attrition analysis

/**
 * Validates uploaded files against size and type restrictions
 * @param {FileList} files - The files to validate
 * @returns {Object} Validation result with valid files and error messages
 */
export const validateFiles = (files) => {
  const validFiles = [];
  const errors = [];

  // Check if files exist
  if (!files || files.length === 0) {
    errors.push("No files selected.");
    return { isValid: false, validFiles, errors };
  }

  // Validate each file
  Array.from(files).forEach((file) => {
    const fileExtension = "." + file.name.split(".").pop().toLowerCase();

    // Check file size
    if (file.size > MAX_FILE_SIZE) {
      errors.push(
        `File "${file.name}" exceeds the maximum size limit of 10MB.`
      );
    }
    // Check file type
    else if (!ALLOWED_FILE_EXTENSIONS.includes(fileExtension)) {
      errors.push(
        `File "${file.name}" has an invalid file type. Only Excel (.xlsx) files are allowed.`
      );
    }
    // File is valid
    else {
      validFiles.push(file);
    }
  });

  return {
    isValid: errors.length === 0,
    validFiles,
    errors,
  };
};

/**
 * Formats file size in a human-readable format
 * @param {number} bytes - Size in bytes
 * @returns {string} Formatted size with appropriate unit
 */
export const formatFileSize = (bytes) => {
  if (bytes < 1024) {
    return bytes + " B";
  } else if (bytes < 1024 * 1024) {
    return (bytes / 1024).toFixed(1) + " KB";
  } else {
    return (bytes / (1024 * 1024)).toFixed(1) + " MB";
  }
};

/**
 * Returns a formatted string of allowed file extensions for display
 * @returns {string} Formatted string of allowed file extensions
 */
export const getAllowedFileExtensionsForDisplay = () => {
  return ALLOWED_FILE_EXTENSIONS.join(", ") + " (Excel files)";
};

export default {
  validateFiles,
  formatFileSize,
  getAllowedFileExtensionsForDisplay,
};

import { BACKEND_URL } from '../api/axios';

/**
 * Resolves an equipment or avatar image path against the dynamic backend URL.
 * Supports absolute URLs, relative upload paths, and defaults.
 * 
 * @param {string} imagePath - The relative or absolute image path
 * @returns {string} - Complete valid URL for the image
 */
export const getImageUrl = (imagePath) => {
  if (!imagePath) return '';
  if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
    return imagePath;
  }
  const cleanPath = imagePath.startsWith('/') ? imagePath : `/${imagePath}`;
  return `${BACKEND_URL}${cleanPath}`;
};

// Cloudinary helper functions for image optimization
// This module provides utilities to generate optimized image URLs

/**
 * Cloudinary configuration
 * Replace 'your-cloud-name' with your actual Cloudinary cloud name
 */
const CLOUDINARY_CONFIG = {
  cloudName: process.env.CLOUDINARY_CLOUD_NAME || 'your-cloud-name',
  baseUrl: 'https://res.cloudinary.com'
};

/**
 * Generate a Cloudinary image URL with optimizations
 * @param {string} publicId - The public ID of the image in Cloudinary
 * @param {Object} options - Transformation options
 * @returns {string} Optimized Cloudinary URL
 */
export function cloudinaryUrl(publicId, options = {}) {
  const {
    width,
    height,
    crop = 'fill',
    quality = 'auto',
    format = 'auto',
    gravity = 'auto',
    fetchFormat,
    dpr = 'auto',
    ...otherOptions
  } = options;

  // Build transformation string
  const transformations = [];
  
  // Add dimensions
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  
  // Add crop mode
  if (crop) transformations.push(`c_${crop}`);
  
  // Add quality and format optimizations
  if (quality) transformations.push(`q_${quality}`);
  if (format) transformations.push(`f_${format}`);
  if (fetchFormat) transformations.push(`fetch_format_${fetchFormat}`);
  
  // Add gravity for smart cropping
  if (gravity) transformations.push(`g_${gravity}`);
  
  // Add device pixel ratio
  if (dpr) transformations.push(`dpr_${dpr}`);
  
  // Add any other custom transformations
  Object.entries(otherOptions).forEach(([key, value]) => {
    if (value) transformations.push(`${key}_${value}`);
  });

  const transformationString = transformations.join(',');
  
  return `${CLOUDINARY_CONFIG.baseUrl}/${CLOUDINARY_CONFIG.cloudName}/image/upload/${transformationString}/${publicId}`;
}

/**
 * Generate responsive image sources for different breakpoints
 * @param {string} publicId - The public ID of the image in Cloudinary
 * @param {Array} breakpoints - Array of breakpoint objects with width, height, media
 * @param {Object} baseOptions - Base transformation options
 * @returns {Array} Array of source objects for picture element
 */
export function responsiveImageSources(publicId, breakpoints, baseOptions = {}) {
  return breakpoints.map(breakpoint => {
    const { width, height, media, ...breakpointOptions } = breakpoint;
    const options = { ...baseOptions, width, height, ...breakpointOptions };
    
    return {
      srcset: cloudinaryUrl(publicId, options),
      media,
      width,
      height
    };
  });
}

/**
 * Generate srcset string for responsive images
 * @param {string} publicId - The public ID of the image in Cloudinary
 * @param {Array} widths - Array of width values
 * @param {Object} baseOptions - Base transformation options
 * @returns {string} Srcset string
 */
export function generateSrcset(publicId, widths, baseOptions = {}) {
  return widths
    .map(width => {
      const url = cloudinaryUrl(publicId, { ...baseOptions, width });
      return `${url} ${width}w`;
    })
    .join(', ');
}

/**
 * Generate a placeholder (blur-up) version of an image
 * @param {string} publicId - The public ID of the image in Cloudinary
 * @param {Object} options - Base options for the image
 * @returns {string} Low-quality placeholder URL
 */
export function generatePlaceholder(publicId, options = {}) {
  return cloudinaryUrl(publicId, {
    ...options,
    width: 50,
    quality: 30,
    format: 'auto',
    effect: 'blur:300'
  });
}

/**
 * Generate YouTube thumbnail URL via Cloudinary fetch
 * @param {string} videoId - YouTube video ID
 * @param {Object} options - Transformation options
 * @returns {string} Cloudinary URL for YouTube thumbnail
 */
export function youTubeThumbnail(videoId, options = {}) {
  const youtubeUrl = `https://img.youtube.com/vi/${videoId}/maxresdefault.jpg`;
  const {
    width = 384,
    height = 216,
    quality = 'auto',
    format = 'auto',
    ...otherOptions
  } = options;

  const transformations = [
    `w_${width}`,
    `h_${height}`,
    'c_fill',
    `q_${quality}`,
    `f_${format}`,
    ...Object.entries(otherOptions).map(([key, value]) => `${key}_${value}`)
  ].join(',');

  return `${CLOUDINARY_CONFIG.baseUrl}/${CLOUDINARY_CONFIG.cloudName}/image/fetch/${transformations}/${encodeURIComponent(youtubeUrl)}`;
}

/**
 * Predefined responsive breakpoints for the project
 */
export const RESPONSIVE_BREAKPOINTS = {
  hero: [
    { width: 640, height: 480, media: '(max-width: 640px)' },
    { width: 1024, height: 600, media: '(max-width: 1024px)' },
    { width: 1920, height: 1080, media: '(min-width: 1025px)' }
  ],
  problem: [
    { width: 400, height: 300, media: '(max-width: 640px)' },
    { width: 600, height: 400, media: '(max-width: 1024px)' },
    { width: 800, height: 533, media: '(min-width: 1025px)' }
  ],
  testimonials: [
    { width: 320, height: 180 }, // Mobile
    { width: 384, height: 216 }, // Desktop
  ]
};

/**
 * Common image optimization presets
 */
export const IMAGE_PRESETS = {
  hero: {
    quality: 'auto:good',
    format: 'auto',
    crop: 'fill',
    gravity: 'auto'
  },
  content: {
    quality: 'auto:good',
    format: 'auto',
    crop: 'fill',
    gravity: 'face'
  },
  thumbnail: {
    quality: 'auto:eco',
    format: 'auto',
    crop: 'fill',
    gravity: 'face'
  }
};
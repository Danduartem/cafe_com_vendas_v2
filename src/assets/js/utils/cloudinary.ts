/**
 * Cloudinary Image Optimization Utility
 * 
 * Generates optimized Cloudinary URLs with responsive parameters
 * Based on latest Cloudinary best practices for mobile performance
 */

export interface CloudinaryImageOptions {
  publicId: string;
  cloudName?: string;
  width?: number;
  height?: number;
  crop?: 'fill' | 'fit' | 'scale' | 'limit' | 'pad';
  gravity?: 'auto' | 'face' | 'faces' | 'center';
  quality?: 'auto' | 'auto:best' | 'auto:good' | 'auto:eco' | 'auto:low' | number;
  format?: 'auto' | 'webp' | 'avif' | 'jpg' | 'png';
  dpr?: 'auto' | number;
  responsive?: boolean;
  blur?: number;
  aspectRatio?: string;
}

export interface ResponsiveImageData {
  src: string;
  srcset: string;
  sizes?: string;
  loading?: 'lazy' | 'eager';
}

const DEFAULT_CLOUD_NAME = 'ds4dhbneq';

/**
 * Generates a Cloudinary URL with optimized transformations
 */
export function getCloudinaryUrl(options: CloudinaryImageOptions): string {
  const {
    publicId,
    cloudName = DEFAULT_CLOUD_NAME,
    width,
    height,
    crop = 'fill',
    gravity = 'auto',
    quality = 'auto',
    format = 'auto',
    dpr = 'auto',
    blur,
    aspectRatio
  } = options;

  const transformations: string[] = [];

  // Width and height
  if (width) transformations.push(`w_${width}`);
  if (height) transformations.push(`h_${height}`);
  
  // Aspect ratio (if specified)
  // Convert colon format to decimal if needed (e.g., "4:5" -> "0.8")
  if (aspectRatio) {
    let formattedRatio = aspectRatio;
    if (aspectRatio.includes(':')) {
      const [width, height] = aspectRatio.split(':').map(Number);
      if (!isNaN(width) && !isNaN(height) && height !== 0) {
        // For integer ratios, keep the colon format (e.g., "4:5")
        // For decimal ratios, convert to decimal (e.g., "1.618:1" -> "1.618")
        if (width % 1 !== 0 || height % 1 !== 0) {
          formattedRatio = (width / height).toString();
        }
      }
    }
    transformations.push(`ar_${formattedRatio}`);
  }
  
  // Crop and gravity
  transformations.push(`c_${crop}`);
  if (crop === 'fill' || crop === 'fit') {
    transformations.push(`g_${gravity}`);
  }
  
  // Quality and format (most important for performance)
  transformations.push(`q_${quality}`);
  transformations.push(`f_${format}`);
  
  // Device pixel ratio
  if (dpr) transformations.push(`dpr_${dpr}`);
  
  // Blur for placeholders
  if (blur) transformations.push(`e_blur:${blur}`);

  const transformation = transformations.join(',');
  return `https://res.cloudinary.com/${cloudName}/image/upload/${transformation}/${publicId}`;
}

/**
 * Generates responsive image data with srcset for different breakpoints
 * Optimized for mobile-first responsive design
 */
export function getResponsiveImageData(
  publicId: string,
  options: {
    cloudName?: string;
    sizes?: string;
    loading?: 'lazy' | 'eager';
    aspectRatio?: string;
    quality?: CloudinaryImageOptions['quality'];
    mobileQuality?: CloudinaryImageOptions['quality'];
  } = {}
): ResponsiveImageData {
  const {
    cloudName = DEFAULT_CLOUD_NAME,
    sizes = '(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw',
    loading = 'lazy',
    aspectRatio,
    quality = 'auto:good',
    mobileQuality = 'auto:eco'
  } = options;

  // Define breakpoints optimized for common device sizes
  const breakpoints = [
    { width: 320, quality: mobileQuality },  // Mobile small
    { width: 640, quality: mobileQuality },  // Mobile large
    { width: 768, quality: mobileQuality },  // Tablet
    { width: 1024, quality },                // Desktop small
    { width: 1536, quality },                // Desktop medium
    { width: 1920, quality }                 // Desktop large
  ];

  // Generate srcset
  const srcsetEntries = breakpoints.map(bp => {
    const url = getCloudinaryUrl({
      publicId,
      cloudName,
      width: bp.width,
      quality: bp.quality,
      aspectRatio,
      dpr: 'auto'
    });
    return `${url} ${bp.width}w`;
  });

  // Default src (mobile-first)
  const defaultSrc = getCloudinaryUrl({
    publicId,
    cloudName,
    width: 640,
    quality: mobileQuality,
    aspectRatio
  });

  return {
    src: defaultSrc,
    srcset: srcsetEntries.join(', '),
    sizes,
    loading
  };
}

/**
 * Generates a low-quality image placeholder (LQIP) URL
 * Used for blur-up effect while main image loads
 */
export function getPlaceholderUrl(
  publicId: string,
  cloudName: string = DEFAULT_CLOUD_NAME
): string {
  return getCloudinaryUrl({
    publicId,
    cloudName,
    width: 50,
    quality: 1,
    blur: 1000,
    format: 'auto'
  });
}

/**
 * Helper to determine if image should be lazy loaded
 * Hero and above-fold images should use eager loading
 */
export function shouldLazyLoad(sectionId: string): boolean {
  const eagerSections = ['hero', 's-hero', 'header'];
  return !eagerSections.includes(sectionId);
}
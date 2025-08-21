// Cloudinary integration component
// Handles dynamic URL updates and environment configuration

import type { Component } from '@/types/component.js';

// Image size constants for responsive optimization
interface ImageSize {
  WIDTH: number;
  HEIGHT: number;
  MAX_WIDTH?: number;
}

interface ImageSizes {
  MOBILE: ImageSize;
  DESKTOP: ImageSize;
  LARGE: ImageSize;
}

const IMAGE_SIZES: ImageSizes = {
  MOBILE: {
    MAX_WIDTH: 640,
    WIDTH: 640,
    HEIGHT: 480
  },
  DESKTOP: {
    MAX_WIDTH: 1024,
    WIDTH: 1024,
    HEIGHT: 600
  },
  LARGE: {
    WIDTH: 1920,
    HEIGHT: 1080
  }
};

export const CloudinaryComponent: Component = {
  init(): void {
    this.updateCloudinaryUrls();
  },

  /**
     * Update all Cloudinary URLs with the actual cloud name
     * This replaces 'your-cloud-name' placeholder with the real value
     */
  updateCloudinaryUrls(): void {
    // Get cloud name from global config (set in environment)
    const cloudName = window.CLOUDINARY_CLOUD_NAME || 'your-cloud-name';

    // Only proceed if we have a real cloud name
    if (cloudName === 'your-cloud-name') {
      console.warn('Cloudinary cloud name not configured. Using fallback images.');
      return;
    }

    // Update CSS background images
    this.updateBackgroundImages(cloudName);

    // Update img src attributes
    this.updateImageSources(cloudName);
  },

  /**
     * Update CSS background images for hero section
     */
  updateBackgroundImages(cloudName: string): void {
    // Find all elements with cloudinary background data attributes
    const bgElements = document.querySelectorAll('[data-cloudinary-bg]');

    bgElements.forEach(element => {
      const imageId = (element as HTMLElement).dataset.cloudinaryBg;
      if (imageId) {
        // Update CSS custom property for responsive backgrounds
        this.updateCSSBackgrounds(cloudName, imageId);
      }
    });
  },

  /**
     * Update img src attributes that use Cloudinary
     */
  updateImageSources(cloudName: string): void {
    // Find all images with Cloudinary URLs
    const images = document.querySelectorAll('img[src*="your-cloud-name"], source[srcset*="your-cloud-name"]');

    images.forEach(element => {
      if (element.tagName === 'IMG' && (element as HTMLImageElement).src) {
        (element as HTMLImageElement).src = (element as HTMLImageElement).src.replace(/your-cloud-name/g, cloudName);
      }

      if (element.tagName === 'SOURCE' && (element as HTMLSourceElement).srcset) {
        (element as HTMLSourceElement).srcset = (element as HTMLSourceElement).srcset.replace(/your-cloud-name/g, cloudName);
      }
    });
  },

  /**
     * Update CSS background image URLs by injecting new styles
     */
  updateCSSBackgrounds(_cloudName: string, _imageId: string): void {
    // No-op: hero background now uses Tailwind responsive bg utilities
    // Kept for backward compatibility if needed elsewhere
  },

  /**
     * Preload critical images for better performance
     */
  preloadCriticalImages(cloudName: string): void {
    // Preload hero image for current viewport
    const viewportWidth = window.innerWidth;
    let width, height;

    if (viewportWidth <= (IMAGE_SIZES.MOBILE.MAX_WIDTH || 640)) {
      width = IMAGE_SIZES.MOBILE.WIDTH;
      height = IMAGE_SIZES.MOBILE.HEIGHT;
    } else if (viewportWidth <= (IMAGE_SIZES.DESKTOP.MAX_WIDTH || 1024)) {
      width = IMAGE_SIZES.DESKTOP.WIDTH;
      height = IMAGE_SIZES.DESKTOP.HEIGHT;
    } else {
      width = IMAGE_SIZES.LARGE.WIDTH;
      height = IMAGE_SIZES.LARGE.HEIGHT;
    }

    const heroImageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_fill,q_auto,f_auto,g_auto/cafe_pnkngz`;

    // Create preload link
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = heroImageUrl;
    document.head.appendChild(link);
  }
};
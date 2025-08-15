// Cloudinary integration component
// Handles dynamic URL updates and environment configuration

export const CloudinaryComponent = {
  init() {
    this.updateCloudinaryUrls();
  },

  /**
     * Update all Cloudinary URLs with the actual cloud name
     * This replaces 'your-cloud-name' placeholder with the real value
     */
  updateCloudinaryUrls() {
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
  updateBackgroundImages(cloudName) {
    // Find all elements with cloudinary background data attributes
    const bgElements = document.querySelectorAll('[data-cloudinary-bg]');

    bgElements.forEach(element => {
      const imageId = element.dataset.cloudinaryBg;
      if (imageId) {
        // Update CSS custom property for responsive backgrounds
        this.updateCSSBackgrounds(cloudName, imageId);
      }
    });
  },

  /**
     * Update img src attributes that use Cloudinary
     */
  updateImageSources(cloudName) {
    // Find all images with Cloudinary URLs
    const images = document.querySelectorAll('img[src*="your-cloud-name"], source[srcset*="your-cloud-name"]');

    images.forEach(element => {
      if (element.tagName === 'IMG' && element.src) {
        element.src = element.src.replace(/your-cloud-name/g, cloudName);
      }

      if (element.tagName === 'SOURCE' && element.srcset) {
        element.srcset = element.srcset.replace(/your-cloud-name/g, cloudName);
      }
    });
  },

  /**
     * Update CSS background image URLs by injecting new styles
     */
  updateCSSBackgrounds(cloudName, imageId) {
    // Create dynamic CSS for responsive backgrounds with proper specificity
    const css = `
            /* Cloudinary responsive backgrounds - injected dynamically */
            @media (max-width: 640px) {
                .hero-bg[data-cloudinary-bg="${imageId}"] {
                    background-image: url('https://res.cloudinary.com/${cloudName}/image/upload/w_640,h_480,c_fill,q_auto,f_auto,g_auto/${imageId}') !important;
                }
            }
            
            @media (min-width: 641px) and (max-width: 1024px) {
                .hero-bg[data-cloudinary-bg="${imageId}"] {
                    background-image: url('https://res.cloudinary.com/${cloudName}/image/upload/w_1024,h_600,c_fill,q_auto,f_auto,g_auto/${imageId}') !important;
                }
            }
            
            @media (min-width: 1025px) {
                .hero-bg[data-cloudinary-bg="${imageId}"] {
                    background-image: url('https://res.cloudinary.com/${cloudName}/image/upload/w_1920,h_1080,c_fill,q_auto,f_auto,g_auto/${imageId}') !important;
                }
            }
        `;

    // Remove any existing Cloudinary styles first
    const existingStyle = document.querySelector('style[data-cloudinary="true"]');
    if (existingStyle) {
      existingStyle.remove();
    }

    // Inject the new CSS into the page
    const style = document.createElement('style');
    style.setAttribute('data-cloudinary', 'true');
    style.textContent = css;
    document.head.appendChild(style);

    console.log(`Cloudinary styles injected for ${imageId} using cloud: ${cloudName}`);
  },

  /**
     * Preload critical images for better performance
     */
  preloadCriticalImages(cloudName) {
    // Preload hero image for current viewport
    const viewportWidth = window.innerWidth;
    let width, height;

    if (viewportWidth <= 640) {
      width = 640;
      height = 480;
    } else if (viewportWidth <= 1024) {
      width = 1024;
      height = 600;
    } else {
      width = 1920;
      height = 1080;
    }

    const heroImageUrl = `https://res.cloudinary.com/${cloudName}/image/upload/w_${width},h_${height},c_fill,q_auto,f_auto,g_auto/cafe-hero`;

    // Create preload link
    const link = document.createElement('link');
    link.rel = 'preload';
    link.as = 'image';
    link.href = heroImageUrl;
    document.head.appendChild(link);
  }
};
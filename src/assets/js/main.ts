/**
 * Café com Vendas Landing Page - Entry Point
 * Premium landing page for female entrepreneurs
 *
 * Modular ES6 architecture with pure Tailwind CSS styling
 */

import { CafeComVendas } from './app.js';
import { ENV } from './config/constants.js';
import { logger } from '../../utils/logger.js';

// 2025 Best Practice: Vite preload error handling for dynamic imports
window.addEventListener('vite:preloadError', (event): void => {
  logger.warn('Chunk loading failed, implementing fallback...', event);
  // For production, consider more sophisticated error handling
  if (ENV.isProduction) {
    window.location.reload();
  }
});

// Set global Cloudinary configuration
window.CLOUDINARY_CLOUD_NAME = ENV.cloudinary.cloudName;

/**
 * Safari-compatible viewport height fallback
 * Sets --vh CSS variable for older Safari versions
 */
function setVhVariable(): void {
  const vh = window.innerHeight * 0.01;
  document.documentElement.style.setProperty('--vh', `${vh}px`);
}

let resizeRafId: number | undefined;

function scheduleVhUpdate(): void {
  if (resizeRafId) {
    window.cancelAnimationFrame(resizeRafId);
  }

  resizeRafId = window.requestAnimationFrame(() => {
    setVhVariable();
    resizeRafId = undefined;
  });
}

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', (): void => {
  // Initialize viewport height variable for Safari
  setVhVariable();
  
  // Update on resize and orientation change without forcing repeated reflow
  window.addEventListener('resize', scheduleVhUpdate);
  window.addEventListener('orientationchange', scheduleVhUpdate);
  
  // Initialize main application
  CafeComVendas.init().catch(error => {
    console.error('Failed to initialize application:', error);
  });
});

/**
 * Expose for debugging in development
 */
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  window.CafeComVendas = CafeComVendas;
}

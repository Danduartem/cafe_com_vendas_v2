/**
 * Café com Vendas Landing Page - Entry Point
 * Premium landing page for female entrepreneurs
 *
 * Modular ES6 architecture with pure Tailwind CSS styling
 */

import { CafeComVendas } from './app.js';
import { ENV } from './config/constants.js';
import '../../types/global/index.js'; // Import global types

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

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', (): void => {
  // Initialize viewport height variable for Safari
  setVhVariable();
  
  // Update on resize and orientation change
  window.addEventListener('resize', setVhVariable);
  window.addEventListener('orientationchange', setVhVariable);
  
  // Initialize main application
  CafeComVendas.init();
});

/**
 * Expose for debugging in development
 */
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  window.CafeComVendas = CafeComVendas;
}
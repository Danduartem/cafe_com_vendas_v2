/**
 * Café com Vendas Landing Page - Entry Point
 * Premium landing page for female entrepreneurs
 *
 * Modular ES6 architecture with pure Tailwind CSS styling
 */

import { CafeComVendas } from './app.js';
import { ENV } from '@/config/constants';
import '../../types/global/index.js'; // Import global types

// Set global Cloudinary configuration
window.CLOUDINARY_CLOUD_NAME = ENV.cloudinary.cloudName;

/**
 * Initialize application when DOM is ready
 */
document.addEventListener('DOMContentLoaded', (): void => {
  CafeComVendas.init();
});

/**
 * Expose for debugging in development
 */
if (typeof window !== 'undefined' && window.location.hostname === 'localhost') {
  window.CafeComVendas = CafeComVendas;
}
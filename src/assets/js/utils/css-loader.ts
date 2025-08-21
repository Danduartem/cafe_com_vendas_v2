/**
 * CSS Loading Utilities
 * CSP-compliant critical CSS loading
 */

import type { SafeElement } from '@/types/dom.js';

export const CSSLoader = {
  /**
   * Initialize critical CSS loading
   */
  init(): void {
    this.loadCriticalCSS();
  },

  /**
   * Load critical CSS when preload completes
   */
  loadCriticalCSS(): void {
    const preloadLink = document.getElementById('critical-css') as SafeElement<HTMLLinkElement>;
    if (!preloadLink) return;

    // Function to convert preload to stylesheet
    const convertToStylesheet = (): void => {
      // Create a new stylesheet link element
      const styleLink = document.createElement('link');
      styleLink.rel = 'stylesheet';
      styleLink.href = preloadLink.href;
      styleLink.id = 'tailwind-css';

      // Insert the stylesheet link
      document.head.appendChild(styleLink);

      // Remove the preload link to prevent duplication
      preloadLink.remove();
    };

    // Check if preload has already loaded
    if (preloadLink.sheet || (preloadLink as any).readyState === 'complete') {
      convertToStylesheet();
    } else {
      // Wait for preload to complete, then convert
      preloadLink.addEventListener('load', convertToStylesheet);
      preloadLink.addEventListener('error', convertToStylesheet);
    }
  }
};
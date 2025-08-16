/**
 * CSS Loading Utilities
 * CSP-compliant critical CSS loading
 */

export const CSSLoader = {
  /**
   * Initialize critical CSS loading
   */
  init() {
    this.loadCriticalCSS();
  },

  /**
   * Load critical CSS when preload completes
   */
  loadCriticalCSS() {
    const preloadLink = document.getElementById('critical-css');
    if (!preloadLink) return;

    // Function to convert preload to stylesheet
    const convertToStylesheet = () => {
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
    if (preloadLink.sheet || preloadLink.readyState === 'complete') {
      convertToStylesheet();
    } else {
      // Wait for preload to complete, then convert
      preloadLink.addEventListener('load', convertToStylesheet);
      preloadLink.addEventListener('error', convertToStylesheet);
    }
  }
};
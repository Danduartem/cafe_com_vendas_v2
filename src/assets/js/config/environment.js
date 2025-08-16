/**
 * Environment Configuration for Café com Vendas
 *
 * SECURITY NOTICE:
 * This file contains ONLY public/publishable keys that are safe to expose to the client-side.
 * Secret keys (Stripe secret, MailerLite API, etc.) are NEVER included here.
 * They should only be stored as environment variables on your server/hosting platform.
 */

// Detect environment
const isDevelopment = window.location.hostname === 'localhost' ||
                     window.location.hostname === '127.0.0.1' ||
                     window.location.hostname.includes('netlify.app') ||
                     window.location.port === '8888'; // Netlify dev default port

const isProduction = window.location.hostname === 'cafecomvendas.com';

// Environment-specific configuration
const config = {
  // Environment info
  environment: isDevelopment ? 'development' : 'production',
  isDevelopment,
  isProduction,

  // Formspree Configuration (Public - Safe to expose)
  formspree: {
    endpoint: `https://formspree.io/f/${import.meta.env.VITE_FORMSPREE_FORM_ID || 'xanbnrvp'}`,
    formId: import.meta.env.VITE_FORMSPREE_FORM_ID || 'xanbnrvp'
  },

  // Stripe Configuration (Publishable keys only - Safe to expose)
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY ||
      (isDevelopment ? 'pk_test_51QxTrfF2Zw0dHOvZoUHGr5nR068f9iuyuLrR86WW9gztjOkoRWgv1Q8cscSURSn45r1wX5qT2KKrj6sE2mD3a7CT009nkU8Wey' : '')
  },

  // Google Analytics
  analytics: {
    measurementId: 'G-XXXXXXXXXX' // Replace with actual GA4 measurement ID
  },

  // Google Tag Manager
  gtm: {
    containerId: import.meta.env.VITE_GTM_CONTAINER_ID || ''
  },

  // Contact Information (Public)
  contact: {
    email: 'team@cafecomvendas.com',
    whatsapp: '+351912345678'
  },

  // Cloudinary Configuration (Public)
  cloudinary: {
    cloudName: import.meta.env.VITE_CLOUDINARY_CLOUD_NAME || 'ds4dhbneq'
  },

  // API Endpoints (Client-side safe endpoints only)
  api: {
    spotsRemaining: '/api/spots-remaining',
    webhook: {
      formspree: '/.netlify/functions/formspree-webhook'
    }
  },

  // URLs and Tracking
  urls: {
    base: isProduction ? 'https://cafecomvendas.com' :
      (window.location.port === '8888' ? 'http://localhost:8888' : 'http://localhost:8080'),
    thankYou: '/obrigado',
    instagram: '/instagram',
    linkedin: '/linkedin'
  }
};

// Freeze configuration to prevent accidental modification
Object.freeze(config);

// Export for use in other modules
export default config;

// Also make available globally for debugging (development only)
if (isDevelopment) {
  window.CONFIG = config;
  console.log('🔧 Environment config loaded:', config.environment);
}
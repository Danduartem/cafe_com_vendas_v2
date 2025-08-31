/**
 * Environment Configuration for Café com Vendas
 *
 * SECURITY NOTICE:
 * This file contains ONLY public/publishable keys that are safe to expose to the client-side.
 * Secret keys (Stripe secret, MailerLite API, etc.) are NEVER included here.
 * They should only be stored as environment variables on your server/hosting platform.
 */

interface ImportMetaEnv {
  readonly VITE_STRIPE_PUBLIC_KEY?: string;
  readonly VITE_CLOUDINARY_CLOUD_NAME?: string;
}

// Extend the global ImportMeta interface
declare global {
  interface ImportMeta {
    readonly env: ImportMetaEnv;
  }
}

// Detect environment - safe for both Node.js (SSR) and browser contexts
const isBrowser = typeof window !== 'undefined';

const isDevelopment = isBrowser ? (
  window.location.hostname === 'localhost' ||
  window.location.hostname === '127.0.0.1' ||
  window.location.hostname.includes('netlify.app') ||
  ['8080', '8888'].includes(window.location.port)    // Eleventy dev (8080) or Netlify dev (8888)
) : (process.env.NODE_ENV !== 'production'); // Node.js fallback

const isProduction = isBrowser ? 
  (window.location.hostname === 'jucanamaximiliano.com.br') : 
  (process.env.NODE_ENV === 'production'); // Node.js fallback

/**
 * Environment configuration interface
 */
export interface EnvironmentConfig {
  environment: 'development' | 'production';
  isDevelopment: boolean;
  isProduction: boolean;
  stripe: {
    publishableKey: string;
  };
  contact: {
    email: string;
    whatsapp: string;
  };
  cloudinary: {
    cloudName: string;
  };
  crm: {
    companyId: string;
    boardId: string;
    columnId: string;
    apiUrl: string;
  };
  // Note: API endpoints can be added here when needed
  urls: {
    base: string;
    thankYou: string;
    instagram: string;
    linkedin: string;
  };
  [key: string]: unknown;
}

// Environment-specific configuration
const config: EnvironmentConfig = {
  // Environment info
  environment: isDevelopment ? 'development' : 'production',
  isDevelopment,
  isProduction,

  // Stripe Configuration (Publishable keys only - Safe to expose)
  stripe: {
    // Use a getter to allow dynamic evaluation for test environments
    get publishableKey(): string {
      // Proper fallback chain following Stripe best practices:
      // 1. Environment variable (production/build-time)
      // 2. Test-injected key (e2e testing only)
      // 3. Empty string (graceful degradation)
      
      // First try environment variable
      if (import.meta.env?.VITE_STRIPE_PUBLIC_KEY) {
        return import.meta.env.VITE_STRIPE_PUBLIC_KEY;
      }
      
      // In test environment, check for injected test key
      if (isBrowser && window.STRIPE_TEST_PUBLISHABLE_KEY) {
        return window.STRIPE_TEST_PUBLISHABLE_KEY;
      }
      
      // No key available - component should handle gracefully
      if (isBrowser) {
        console.warn('[Environment] No Stripe publishable key configured');
      }
      return '';
    }
  },

  // Contact Information (Public)
  contact: {
    email: 'contato@jucanamaximiliano.com.br',
    whatsapp: '+351912345678'
  },

  // Cloudinary Configuration (Public)
  cloudinary: {
    cloudName: import.meta.env?.VITE_CLOUDINARY_CLOUD_NAME ?? 'ds4dhbneq'
  },

  // CRM Configuration (URL only - IDs are server-side)
  crm: {
    companyId: '', // Server-side only (set via CRM_COMPANY_ID env var)
    boardId: '',   // Server-side only (set via CRM_BOARD_ID env var)
    columnId: '',  // Server-side only (set via CRM_COLUMN_ID env var)
    apiUrl: 'https://mocha-smoky.vercel.app/api/integrations/contact-card'
  },

  // Note: API endpoints can be added here when needed

  // URLs and Tracking
  urls: {
    // Base URL for API calls 
    // In production: use production domain
    // In development: detect if running under Netlify dev (port 54393) or Eleventy dev (port 8080)
    base: isProduction ? 'https://jucanamaximiliano.com.br' : (
      isBrowser ? (
        // Check if running under development server (both Eleventy 8080 and Netlify dev 8888)
        ['8080', '8888'].includes(window.location.port) ? window.location.origin : window.location.origin
      ) : 'http://localhost:8888'  // Default to Netlify dev port for backend
    ),
    thankYou: '/obrigado',
    instagram: '/instagram',
    linkedin: '/linkedin'
  }
};

// Freeze configuration to prevent accidental modification
Object.freeze(config);

// Export for use in other modules
export default config;

// Global types are now centralized in types/global.ts

// Also make available globally for debugging (development only)
if (isDevelopment && isBrowser) {
  // Cast to GlobalAppConfig for window assignment - both interfaces are structurally compatible
  window.CONFIG = config as unknown as typeof window.CONFIG;
}
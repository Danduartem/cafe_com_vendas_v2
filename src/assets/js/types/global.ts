/**
 * Global window interface augmentation
 * Defines all global variables and functions used throughout the application
 */

import type { EnvironmentConfig } from '@/config/environment.js';
import type { AnalyticsEventType } from '@/config/constants.js';

declare global {
  interface Window {
    // Application globals
    CafeComVendas?: any;
    CONFIG?: EnvironmentConfig;
    CLOUDINARY_CLOUD_NAME: string;

    // Analytics and tracking
    dataLayer: any[];
    gtag?: (...args: any[]) => void;
    ANALYTICS_EVENTS?: Record<string, AnalyticsEventType>;

    // External integrations
    Stripe?: any;
    PricingManager?: any;

    // Global functions
    openCheckout?: () => void;
    closeCheckout?: () => void;

    // Component toggle functions (used by onclick handlers)
    toggleFAQ?: (faqId: string) => void;
    toggleModal?: (modalId: string) => void;
    toggleAccordion?: (elementId: string) => void;

    // Performance and debugging
    performance: Performance & {
      mark(name: string): void;
    };
  }

  // Vite environment variables
  namespace ImportMeta {
    interface Env {
      VITE_STRIPE_PUBLIC_KEY?: string;
      VITE_FORMSPREE_FORM_ID?: string;
      VITE_CLOUDINARY_CLOUD_NAME?: string;
      [key: string]: string | undefined;
    }
  }

  // Global Stripe type
  const Stripe: any;
  
  // Google Analytics gtag function
  function gtag(...args: any[]): void;
}

// Export empty object to make this a module
export {};
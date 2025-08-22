/**
 * Global window interface augmentation
 * Defines all global variables and functions used throughout the application
 */

import type { EnvironmentConfig } from '@/config/environment.ts';
import type { AnalyticsEventType } from '@/config/constants.ts';

declare global {
  interface Window {
    // Application globals
    CafeComVendas?: Record<string, unknown>;
    CONFIG?: EnvironmentConfig;
    CLOUDINARY_CLOUD_NAME: string;

    // Analytics and tracking
    dataLayer: Record<string, unknown>[];
    ANALYTICS_EVENTS?: Record<string, AnalyticsEventType>;

    // External integrations
    Stripe?: unknown;
    PricingManager?: Record<string, unknown>;

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
  const Stripe: unknown;
}

// Export empty object to make this a module
export {};
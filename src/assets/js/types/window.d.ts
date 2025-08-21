/**
 * Global window type extensions for Café com Vendas
 * Defines types for GTM, analytics, and other window properties
 */

// Basic Stripe types
interface StripeInstance {
  elements: () => unknown;
  confirmPayment: (options: unknown) => Promise<unknown>;
}

declare global {
  interface Window {
    // Google Tag Manager
    dataLayer: Array<Record<string, unknown>>;
    gtag: (...args: unknown[]) => void;
    
    // GTM Debug utilities
    gtmDebug: {
      enabled: boolean;
      log: (...args: unknown[]) => void;
      table: (data: unknown) => void;
      warn: (...args: unknown[]) => void;
      error: (...args: unknown[]) => void;
      normalizeEnabled: boolean;
      events: unknown[];
    };
    
    // GTM Normalizer utilities
    gtmNormalizer: {
      normalizeString: (value: unknown, maxLength?: number, fallback?: string) => string;
      normalizeId: (id: unknown) => string;
      normalizeSection: (section: unknown) => string;
      normalizeAction: (action: unknown) => string;
      normalizeCategory: (category: unknown) => string;
      normalizePricingTier: (tier: unknown) => string;
    };
    
    // GTM Testing utilities
    gtmNormalizerTest: {
      (): void;
      runAll: () => void;
      testStrings: () => void;
      testSections: () => void;
      testActions: () => void;
      testPricingTiers: () => void;
      testIds: () => void;
    };
    gtmTest: {
      (): void;
      leadFormRaw: () => void;
    };
    gtmAnalyze: {
      (): void;
      checkCardinality: () => void;
    };
    
    // Stripe
    Stripe?: (publishableKey: string) => StripeInstance;
    
    // Checkout methods
    openCheckout?: () => void;
    closeCheckout?: () => void;
    
    // Vite HMR (development)
    __vitePreload?: (deps: string[]) => Promise<unknown[]>;
  }
  
  // Vite import.meta extensions
  interface ImportMeta {
    glob: (pattern: string, options?: { eager?: boolean }) => Record<string, () => Promise<unknown>>;
  }

  // Global functions for convenience
  function gtag(...args: unknown[]): void;
  var dataLayer: Array<Record<string, unknown>>;
}

export {};
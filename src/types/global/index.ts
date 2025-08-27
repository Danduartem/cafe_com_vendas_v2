// Global utility types and Window interface extensions

// GTM Data Layer event structure
export interface DataLayerEvent {
  event: string;
  [key: string]: unknown;
}

// Application configuration structure - matches EnvironmentConfig
export interface GlobalAppConfig {
  environment: 'development' | 'production';
  isDevelopment: boolean;
  isProduction: boolean;
  formspree: {
    endpoint: string;
    formId: string;
  };
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
  urls: {
    base: string;
    thankYou: string;
    instagram: string;
    linkedin: string;
  };
  [key: string]: unknown;
}

// Main application object structure
export interface CafeComVendasApp {
  Analytics: {
    track: (event: string, data?: Record<string, unknown>) => void;
    trackError: (type: string, error: Error, context?: Record<string, unknown>) => void;
  };
  Components: Record<string, unknown>;
  Utils: Record<string, unknown>;
  init(): void;
}

// Stripe constructor type - specific types defined in checkout component
export type StripeConstructor = (publishableKey: string) => unknown;

declare global {
  interface Window {
    dataLayer: DataLayerEvent[];
    Stripe?: StripeConstructor;
    CONFIG: GlobalAppConfig;
    ANALYTICS_EVENTS: Record<string, unknown>;
    CafeComVendas: CafeComVendasApp;
    CLOUDINARY_CLOUD_NAME: string;
  }
}

// Eleventy v3 configuration data types based on official documentation
export interface EleventyConfigData {
  eleventy: {
    env: {
      source: 'cli' | 'script';
      runMode: 'serve' | 'watch' | 'build';
      root: string;
      config: string;
    };
    version: string;
    directories: {
      input: string;
      includes: string;
      data: string;
      output: string;
    };
  };
  page?: {
    fileSlug: string;
    inputPath: string;
    outputPath: string;
    url: string;
  };
}

export {};
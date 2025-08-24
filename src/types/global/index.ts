// Global utility types and Window interface extensions
declare global {
  interface Window {
    dataLayer: any[];
    Stripe?: any;
    CONFIG: any;
    ANALYTICS_EVENTS: any;
    CafeComVendas: any;
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
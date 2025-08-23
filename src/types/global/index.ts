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

export {};
// Site configuration types
export interface AnalyticsConfig {
  gtmId: string;
}

export interface SiteData {
  name?: string;
  title: string;
  description: string;
  url: string;
  baseUrl: string;
  lang?: string;
  locale?: string;
  meta?: {
    author: string;
    keywords: string;
    twitterCard: string;
  };
  contact?: {
    whatsapp: string;
    email: string;
  };
  analytics: AnalyticsConfig;
  cloudinaryCloudName?: string;
}
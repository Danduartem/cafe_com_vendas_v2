import type { BaseSection } from './base';

export interface FAQSection extends BaseSection {
  id: 'faq';
  items: {
    id: string;
    question: string;
    answer: Record<string, unknown>;
    analytics_event: string;
    [key: string]: unknown;
  }[];
  contact: {
    whatsapp_url: string;
    whatsapp_name: string;
    whatsapp_phone: string;
    response_time: string;
  };
  legal_links: {
    text: string;
    url: string;
  }[];
}
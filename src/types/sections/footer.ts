import type { BaseSection, SectionCopy } from './base';

export interface FooterSection extends BaseSection {
  id: 'footer';
  copy: SectionCopy & {
    stats: Array<{
      value: number | string;
      label: string;
      counter: boolean;
    }>;
    brand: {
      name: string;
      tagline: string;
      description: string;
      guarantee: string;
    };
    navigation: {
      legal: Array<{
        label: string;
        url: string;
        external?: boolean;
      }>;
    };
    contact: {
      whatsapp: {
        number: string;
        message: string;
        url: string;
      };
      email: {
        address: string;
        url: string;
      };
      social: Array<{
        platform: string;
        username?: string;
        url: string;
      }>;
    };
    organization: {
      name: string;
      description: string;
      url: string;
      logo: string;
      phone: string;
      country: string;
      city: string;
      founderName: string;
      founderTitle: string;
    };
  };
}
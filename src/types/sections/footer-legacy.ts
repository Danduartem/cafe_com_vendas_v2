// Legacy footer structure types (separate from section-based footer)

export interface FooterStat {
  value: number | string;
  label: string;
  counter: boolean;
}

export interface FooterBrand {
  name: string;
  tagline: string;
  description: string;
  guarantee: string;
}

export interface FooterLink {
  label: string;
  url: string;
  external?: boolean;
}

export interface FooterContact {
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
}

export interface FooterOrganization {
  name: string;
  description: string;
  url: string;
  logo: string;
  phone: string;
  country: string;
  city: string;
  founderName: string;
  founderTitle: string;
}

export interface FooterCopyright {
  year: string;
  owner: string;
  text: string;
  madein?: string;
}

export interface FooterNavigation {
  legal: FooterLink[];
}

export interface FooterData {
  stats: FooterStat[];
  brand: FooterBrand;
  navigation: FooterNavigation;
  contact: FooterContact;
  organization: FooterOrganization;
  copyright: FooterCopyright;
}
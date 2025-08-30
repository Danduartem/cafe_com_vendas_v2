import type { BaseSection, SectionCopy } from './base.js';

export interface OfferSection extends BaseSection {
  id: 'offer';
  copy: SectionCopy & {
    pricing: {
      first_lot: {
        label: string;
        original_price: number;
        discounted_price: number;
        currency: string;
        capacity: number;
        bonuses: string[];
      };
      second_lot: {
        label: string;
        price: number;
        currency: string;
        capacity: number;
      };
    };
    includes: string[];
    guarantee: {
      type: string;
      claim: string;
      period: string;
      policy: string;
    };
  };
}
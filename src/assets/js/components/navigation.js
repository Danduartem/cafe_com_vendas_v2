/**
 * Navigation utilities for Café com Vendas
 * Handles smooth scrolling and navigation interactions
 */

import { CONFIG } from '../config/constants.js';
import { Analytics } from '../core/analytics.js';
import { safeQuery } from '../utils/index.js';

export const Navigation = {
  /**
     * Smooth scroll to next section
     */
  scrollToNext() {
    try {
      const explicitNext = safeQuery('#inscricao');
      if (explicitNext) {
        explicitNext.scrollIntoView({ behavior: 'smooth', block: 'start' });
        Analytics.track(CONFIG.analytics.events.SCROLL_INDICATOR, {
          event_category: 'Navigation',
          event_label: 'Hero to Inscricao'
        });
        return;
      }

      const heroSection = safeQuery('.hero-section') || safeQuery('#hero2-section');
      const nextSection = heroSection?.nextElementSibling;

      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
      }

      Analytics.track(CONFIG.analytics.events.SCROLL_INDICATOR, {
        event_category: 'Navigation',
        event_label: 'Hero Scroll Indicator'
      });
    } catch (error) {
      console.error('Error in scrollToNext:', error);
    }
  }
};
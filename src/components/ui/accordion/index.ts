/**
 * Platform Accordion Components for Café com Vendas
 * Reusable accordion patterns for FAQ and expandable content
 */

import { safeQuery, safeQueryAll } from '../../../utils/dom.js';
import { logger } from '../../../utils/logger.js';
import { Animations } from '../animations/index.js';

interface AccordionConfig {
  containerSelector: string;
  itemSelector: string;
  allowMultiple?: boolean;
  revealAnimation?: boolean;
  onToggle?: (item: HTMLDetailsElement, isOpen: boolean) => void;
}

export const PlatformAccordion = {
  /**
   * Initialize accordion behavior with native <details> elements
   */
  initializeNative(config: AccordionConfig): void {
    const container = safeQuery(config.containerSelector);
    const items = safeQueryAll<HTMLDetailsElement>(config.itemSelector);

    if (!container || !items.length) {
      logger.warn(`Accordion elements not found for ${config.containerSelector}`);
      return;
    }

    // Setup reveal animation if enabled
    if (config.revealAnimation) {
      this.setupRevealAnimation(Array.from(items));
    }

    // Setup accordion behavior
    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        const isOpen = item.open;

        // Close others if not allowing multiple
        if (isOpen && !config.allowMultiple) {
          items.forEach((other) => {
            if (other !== item && other.open) {
              other.open = false;
            }
          });
        }

        // Call custom toggle handler
        if (config.onToggle) {
          config.onToggle(item, isOpen);
        }
      }, { passive: true });
    });
  },

  /**
   * Setup reveal animation for accordion items
   */
  setupRevealAnimation(items: Element[]): void {
    Animations.prepareRevealElements(items, {
      transitionClasses: ['transition-all', 'duration-500', 'ease-out']
    });

    const observer = Animations.createObserver({
      callback: () => {
        // Reveal elements with staggered animation
        items.forEach((item, index) => {
          setTimeout(() => {
            item.classList.add('opacity-100', 'translate-y-0');
            item.classList.remove('opacity-0', 'translate-y-4');
          }, index * 100);
        });
      },
      once: true,
      rootMargin: '0px 0px -50px 0px'
    });

    // Observe the first item to trigger animation
    if (items.length > 0) {
      observer.observe(items[0]);
    }
  },

  /**
   * Create FAQ-specific accordion with analytics
   */
  createFAQ(config: Omit<AccordionConfig, 'onToggle'> & {
    trackAnalytics?: boolean;
  }): void {
    this.initializeNative({
      ...config,
      allowMultiple: false, // FAQ typically allows only one open
      onToggle: (item, isOpen) => {
        if (config.trackAnalytics) {
          const itemNumber = item.getAttribute('data-faq-item') || 'unknown';
          const questionText = item.querySelector('summary')?.textContent?.trim() || `FAQ ${itemNumber}`;

          // Import analytics dynamically to avoid circular dependency
          import('../../../analytics/index.js').then(({ AnalyticsHelpers }) => {
            AnalyticsHelpers.trackFAQ(itemNumber, isOpen, questionText);
          }).catch(() => {
            logger.debug('FAQ analytics tracking unavailable');
          });
        }
      }
    });
  },

  /**
   * Create general expandable content accordion
   */
  createExpandable(config: AccordionConfig): void {
    this.initializeNative({
      allowMultiple: true, // Allow multiple expanded by default
      ...config
    });
  }
};
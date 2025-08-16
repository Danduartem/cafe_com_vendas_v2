/**
 * About Section Component
 * Handles interactions and analytics for the presenter section
 */

import { safeQuery } from '../utils/index.js';
import { Analytics } from '../core/analytics.js';

export const About = {
  intersectionObserver: null,
  viewTracked: false,

  init() {
    this.setupIntersectionObserver();
    this.bindEvents();
  },

  bindEvents() {
    const container = safeQuery('#sobre');
    if (!container) return;

    // Track CTA clicks
    const cta = container.querySelector('[data-analytics-event="click_about_cta"]');
    if (cta) {
      cta.addEventListener('click', () => {
        Analytics.track('click_about_cta', {
          event_category: 'engagement',
          event_label: 'about_section',
          value: 1
        });
      });
    }

    // Track Instagram link clicks
    const instagram = container.querySelector('[data-analytics-event="click_about_instagram"]');
    if (instagram) {
      instagram.addEventListener('click', () => {
        Analytics.track('click_about_instagram', {
          event_category: 'social',
          event_label: 'instagram_profile',
          value: 1
        });
      });
    }

    // Smooth scroll for CTA
    const ctaLink = container.querySelector('a[href="#oferta"]');
    if (ctaLink) {
      ctaLink.addEventListener('click', (e) => {
        e.preventDefault();
        const target = safeQuery('#oferta');
        if (target) {
          target.scrollIntoView({
            behavior: 'smooth',
            block: 'start'
          });
        }
      });
    }
  },

  setupIntersectionObserver() {
    const section = safeQuery('#sobre');
    if (!section || this.viewTracked) return;

    const options = {
      root: null,
      rootMargin: '0px',
      threshold: 0.5 // Track when 50% of section is visible
    };

    this.intersectionObserver = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && !this.viewTracked) {
          this.viewTracked = true;
          Analytics.track('view_about_presenter', {
            event_category: 'engagement',
            event_label: 'section_view',
            value: 1
          });

          // Stop observing after tracking
          if (this.intersectionObserver) {
            this.intersectionObserver.disconnect();
          }
        }
      });
    }, options);

    this.intersectionObserver.observe(section);
  },

  // Cleanup method
  destroy() {
    if (this.intersectionObserver) {
      this.intersectionObserver.disconnect();
      this.intersectionObserver = null;
    }
    this.viewTracked = false;
  }
};
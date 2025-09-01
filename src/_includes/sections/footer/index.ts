/**
 * Footer Section Component
 * Handles interactive behaviors for the footer section
 */

import type { Component } from '../../../types/components/base.js';
import { safeQuery } from '../../../utils/dom.js';
import analytics, { AnalyticsHelpers } from '../../../analytics/index.js';

interface FooterComponent extends Component {
  bindEvents(): void;
  setupLegalLinks(): void;
  initSectionTracking(): void;
}

export const Footer: FooterComponent = {
  /**
   * Initialize footer section
   */
  init(): void {
    this.bindEvents();
    this.setupLegalLinks();
    this.initSectionTracking();
  },

  /**
   * Initialize section view tracking using standardized approach
   */
  initSectionTracking(): void {
    AnalyticsHelpers.initSectionTracking('footer', 0.3);
  },

  /**
   * Bind event listeners for footer section interactions
   */
  bindEvents(): void {
    const section = safeQuery('#s-footer');
    if (!section) {
      return;
    }

    // Section tracking is now handled by initSectionTracking()

    // Track legal link clicks
    const legalLinks = section.querySelectorAll('[data-legal-link]');
    legalLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const linkType = link.getAttribute('data-legal-link') || 'unknown';
        analytics.track('legal_link_click', {
          section: 'footer',
          element_type: 'legal_link',
          link_type: linkType,
          element_text: link.textContent?.trim() || 'unknown'
        });
      });
    });

    // Track contact information clicks
    const contactElements = section.querySelectorAll('[data-contact-info]');
    contactElements.forEach((element) => {
      element.addEventListener('click', () => {
        const contactType = element.getAttribute('data-contact-info') || 'unknown';
        analytics.track('contact_info_click', {
          section: 'footer',
          element_type: 'contact_info',
          contact_type: contactType
        });
      });
    });

    // Track social media links if present
    const socialLinks = section.querySelectorAll('[data-social-link]');
    socialLinks.forEach((link) => {
      link.addEventListener('click', () => {
        const platform = link.getAttribute('data-social-link') || 'unknown';
        analytics.track('social_link_click', {
          section: 'footer',
          element_type: 'social_link',
          platform
        });
      });
    });
  },

  /**
   * Setup legal links functionality
   */
  setupLegalLinks(): void {
    // Ensure legal links open in new tabs for external links
    const externalLinks = document.querySelectorAll('a[href^="http"]');
    externalLinks.forEach((link) => {
      if (!link.getAttribute('target')) {
        link.setAttribute('target', '_blank');
        link.setAttribute('rel', 'noopener noreferrer');
      }
    });

    // Handle internal legal page navigation
    const internalLegalLinks = document.querySelectorAll('a[href^="/"]');
    internalLegalLinks.forEach((link) => {
      const href = link.getAttribute('href');
      if (href && (href.includes('politica') || href.includes('termos') || href.includes('garantia'))) {
        link.addEventListener('click', () => {
          // Allow normal navigation, but track it
          const page = href.split('/').pop() || 'unknown';
          analytics.track('legal_page_navigation', {
            section: 'footer',
            element_type: 'internal_legal_link',
            page
          });
        });
      }
    });
  }
};
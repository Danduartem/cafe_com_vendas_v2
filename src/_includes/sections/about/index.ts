/**
 * About Section Component
 * Handles interactive behaviors for the about/authority section
 */

import { Analytics } from '../../../assets/js/core/analytics.js';
import { safeQuery } from '../../../assets/js/utils/dom.js';
import type { Component } from '../../../types/components/base.js';

interface AboutComponent extends Component {
  bindEvents(): void;
}

export const About: AboutComponent = {
  /**
   * Initialize about section
   */
  init(): void {
    this.bindEvents();
  },

  /**
   * Bind event listeners for about section interactions
   */
  bindEvents(): void {
    const section = safeQuery('#s-about');
    if (!section) {
      console.warn('About section not found');
      return;
    }

    // Track section visibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            Analytics.track('section_view', {
              event: 'section_view',
              event_category: 'Engagement',
              section: 'about',
              element_type: 'section_entry'
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(section);

    // Track interactions with presenter credentials
    const credentialItems = section.querySelectorAll('[data-credential]');
    credentialItems.forEach((item) => {
      item.addEventListener('click', () => {
        Analytics.track('credential_click', {
          event: 'credential_click',
          event_category: 'Engagement',
          section: 'about',
          element_type: 'credential_item',
          element_text: item.textContent?.trim().substring(0, 50) || 'unknown'
        });
      });
    });

    // Track photo interactions
    const presenterPhoto = section.querySelector('[data-presenter-photo]');
    if (presenterPhoto) {
      presenterPhoto.addEventListener('click', () => {
        Analytics.track('presenter_photo_click', {
          event: 'presenter_photo_click',
          event_category: 'Engagement',
          section: 'about',
          element_type: 'presenter_photo'
        });
      });
    }

    // Track authority building elements
    const authorityElements = section.querySelectorAll('[data-authority-element]');
    authorityElements.forEach((element) => {
      element.addEventListener('click', () => {
        Analytics.track('authority_element_click', {
          event: 'authority_element_click',
          event_category: 'Engagement',
          section: 'about',
          element_type: 'authority_element',
          element_text: element.textContent?.trim().substring(0, 50) || 'unknown'
        });
      });
    });
  }
};
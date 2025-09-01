/**
 * About Section Component
 * Handles interactive behaviors for the about/authority section
 */

import { safeQuery } from '../../../utils/dom.js';
import analytics, { AnalyticsHelpers } from '../../../analytics/index.js';
import type { Component } from '../../../types/components/base.js';

interface AboutComponent extends Component {
  bindEvents(): void;
  initSectionTracking(): void;
}

export const About: AboutComponent = {
  /**
   * Initialize about section
   */
  init(): void {
    this.bindEvents();
    this.initSectionTracking();
  },

  /**
   * Initialize section view tracking using standardized approach
   */
  initSectionTracking(): void {
    AnalyticsHelpers.initSectionTracking('about');
  },

  /**
   * Bind event listeners for about section interactions
   */
  bindEvents(): void {
    const section = safeQuery('#s-about');
    if (!section) {
      return;
    }

    // Track interactions with presenter credentials
    const credentialItems = section.querySelectorAll('[data-credential]');
    credentialItems.forEach((item) => {
      item.addEventListener('click', () => {
        analytics.track('credential_click', {
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
        analytics.track('presenter_photo_click', {
          section: 'about',
          element_type: 'presenter_photo'
        });
      });
    }

    // Track authority building elements
    const authorityElements = section.querySelectorAll('[data-authority-element]');
    authorityElements.forEach((element) => {
      element.addEventListener('click', () => {
        analytics.track('authority_element_click', {
          section: 'about',
          element_type: 'authority_element',
          element_text: element.textContent?.trim().substring(0, 50) || 'unknown'
        });
      });
    });
  }
};
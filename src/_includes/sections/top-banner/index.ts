/**
 * Top Banner Section Component
 * Handles countdown timer and interactive behaviors for the top banner
 */

import type { Component } from '@app-types/components/base.js';
import { safeQuery } from '@utils/dom.js';
import { Analytics } from '@/core/analytics.js';

interface TopBannerComponent extends Component {
  countdownInterval?: number;
  bindEvents(): void;
  initCountdown(): void;
  updateCountdown(eventDate: Date): void;
  updateCountdownElement(selector: string, value: number): void;
  handleCountdownExpired(): void;
  destroy(): void;
}

export const TopBanner: TopBannerComponent = {
  countdownInterval: undefined,

  /**
   * Initialize top banner section
   */
  init(): void {
    this.bindEvents();
    this.initCountdown();
  },

  /**
   * Bind event listeners for top banner interactions
   */
  bindEvents(): void {
    const section = safeQuery('#s-top-banner');
    if (!section) {
      return;
    }

    // Track banner visibility
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            Analytics.track('section_view', {
              event: 'section_view',
              event_category: 'Engagement',
              section: 'top-banner',
              element_type: 'section_entry'
            });
          }
        });
      },
      { threshold: 0.5 }
    );

    observer.observe(section);

    // Track banner CTA clicks
    const bannerCTA = section.querySelectorAll('[data-banner-cta]');
    bannerCTA.forEach((button) => {
      button.addEventListener('click', () => {
        Analytics.track('banner_cta_click', {
          event: 'banner_cta_click',
          event_category: 'Conversion',
          section: 'top-banner',
          element_type: 'banner_cta',
          element_text: button.textContent?.trim() || 'unknown'
        });
      });
    });

    // Track urgency message clicks
    const urgencyMessages = section.querySelectorAll('[data-urgency-message]');
    urgencyMessages.forEach((message) => {
      message.addEventListener('click', () => {
        Analytics.track('urgency_message_click', {
          event: 'urgency_message_click',
          event_category: 'Engagement',
          section: 'top-banner',
          element_type: 'urgency_message',
          element_text: message.textContent?.trim().substring(0, 50) || 'unknown'
        });
      });
    });
  },

  /**
   * Initialize countdown timer
   */
  initCountdown(): void {
    const countdownContainer = safeQuery('[data-countdown]');
    if (!countdownContainer) {
      return;
    }

    // Get event date from data attribute or set default
    const eventDateStr = countdownContainer.getAttribute('data-event-date');
    let eventDate: Date;

    if (eventDateStr) {
      eventDate = new Date(eventDateStr);
    } else {
      // Default: September 20, 2025, 9:00 AM Lisbon time
      eventDate = new Date('2025-09-20T09:00:00+01:00');
    }

    // Start countdown
    this.updateCountdown(eventDate);
    this.countdownInterval = window.setInterval(() => {
      this.updateCountdown(eventDate);
    }, 1000);

    // Track countdown view
    Analytics.track('countdown_view', {
      event: 'countdown_view',
      event_category: 'Engagement',
      section: 'top-banner',
      element_type: 'countdown_timer',
      event_date: eventDate.toISOString()
    });
  },

  /**
   * Update countdown display
   */
  updateCountdown(eventDate: Date): void {
    const now = new Date();
    const timeLeft = eventDate.getTime() - now.getTime();

    if (timeLeft <= 0) {
      this.handleCountdownExpired();
      return;
    }

    const days = Math.floor(timeLeft / (1000 * 60 * 60 * 24));
    const hours = Math.floor((timeLeft % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((timeLeft % (1000 * 60 * 60)) / (1000 * 60));
    const seconds = Math.floor((timeLeft % (1000 * 60)) / 1000);

    // Update countdown elements
    this.updateCountdownElement('[data-countdown-days]', days);
    this.updateCountdownElement('[data-countdown-hours]', hours);
    this.updateCountdownElement('[data-countdown-minutes]', minutes);
    this.updateCountdownElement('[data-countdown-seconds]', seconds);

    // Add urgency styling when time is running low
    if (days <= 1) {
      const countdownContainer = safeQuery('[data-countdown]');
      if (countdownContainer) {
        countdownContainer.classList.add('text-red-600', 'animate-pulse');
      }
    }
  },

  /**
   * Update individual countdown element
   */
  updateCountdownElement(selector: string, value: number): void {
    const element = safeQuery(selector);
    if (element) {
      element.textContent = value.toString().padStart(2, '0');
    }
  },

  /**
   * Handle countdown expiration
   */
  handleCountdownExpired(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }

    const countdownContainer = safeQuery('[data-countdown]');
    if (countdownContainer) {
      countdownContainer.innerHTML = '<span class="text-red-600 font-bold">EVENTO EM ANDAMENTO!</span>';
    }

    Analytics.track('countdown_expired', {
      event: 'countdown_expired',
      event_category: 'Event',
      section: 'top-banner',
      element_type: 'countdown_timer'
    });
  },

  /**
   * Cleanup method for when component is destroyed
   */
  destroy(): void {
    if (this.countdownInterval) {
      clearInterval(this.countdownInterval);
    }
  }
};
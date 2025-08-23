/**
 * Essential Analytics Tracking for Café com Vendas
 * Simple, maintainable event tracking
 */

import { normalizeEventPayload } from '@/utils/gtm-normalizer';

export const PlatformAnalytics = {
  /**
   * Track button/link clicks
   */
  trackClick(element: HTMLElement, eventType: string, location: string): void {
    if (!element || element.hasAttribute('data-tracked')) return;

    element.setAttribute('data-tracked', 'true');
    element.addEventListener('click', function(this: HTMLElement) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(normalizeEventPayload({
        event: eventType,
        location,
        text: this.textContent?.trim() || 'Click'
      }));
    });
  },

  /**
   * Track FAQ interactions
   */
  trackFAQ(itemNumber: string, isOpen: boolean, question: string): void {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(normalizeEventPayload({
      event: 'faq_toggle',
      action: isOpen ? 'open' : 'close',
      question,
      item: itemNumber
    }));
  },

  /**
   * Track form submissions & payments
   */
  trackConversion(event: string, data: Record<string, unknown>): void {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(normalizeEventPayload({
      event,
      timestamp: new Date().toISOString(),
      ...data
    }));
  },

  /**
   * Generic event tracking
   */
  track(eventName: string, data?: Record<string, unknown>): void {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(normalizeEventPayload({
      event: eventName,
      ...data
    }));
  }
};
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
  },

  /**
   * Track CTA clicks with both production and test event names
   */
  trackCTAClick(location: string, data?: Record<string, unknown>): void {
    window.dataLayer = window.dataLayer || [];
    
    // Fire GTM production event
    window.dataLayer.push(normalizeEventPayload({
      event: 'checkout_opened',
      source_section: location,
      timestamp: new Date().toISOString(),
      ...data
    }));
    
    // Fire test alias
    window.dataLayer.push(normalizeEventPayload({
      event: 'cta_click',
      location,
      timestamp: new Date().toISOString(),
      ...data
    }));
  },

  /**
   * Track section views with both production and test event names
   */
  trackSectionView(sectionName: string, data?: Record<string, unknown>): void {
    window.dataLayer = window.dataLayer || [];
    
    // Fire specific section event if available (for testimonials)
    if (sectionName === 'testimonials' || sectionName === 'social-proof') {
      window.dataLayer.push(normalizeEventPayload({
        event: 'view_testimonials_section',
        section_name: sectionName,
        timestamp: new Date().toISOString(),
        ...data
      }));
    }
    
    // Fire generic test alias
    window.dataLayer.push(normalizeEventPayload({
      event: 'section_view',
      section: sectionName,
      timestamp: new Date().toISOString(),
      ...data
    }));
  }
};
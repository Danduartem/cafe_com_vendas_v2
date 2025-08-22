/**
 * Platform Analytics Components for Café com Vendas
 * Reusable analytics tracking patterns used across sections
 */

import { normalizeEventPayload } from '@platform/lib/utils/gtm-normalizer.ts';

export const PlatformAnalytics = {
  /**
   * Track WhatsApp click events consistently across sections
   */
  trackWhatsAppClick(element: HTMLAnchorElement, location: string): void {
    if (!element || element.hasAttribute('data-gtm-tracked')) return;

    element.setAttribute('data-gtm-tracked', 'true');
    element.addEventListener('click', function(this: HTMLAnchorElement) {
      window.dataLayer = window.dataLayer || [];
      const whatsappPayload = normalizeEventPayload({
        event: 'whatsapp_click',
        link_url: this.href,
        link_text: this.textContent?.trim() || 'WhatsApp',
        location
      });
      window.dataLayer.push(whatsappPayload);
    });
  },

  /**
   * Track CTA button clicks with consistent event structure
   */
  trackCTAClick(element: HTMLElement, ctaType: string, location: string): void {
    if (!element || element.hasAttribute('data-gtm-tracked')) return;

    element.setAttribute('data-gtm-tracked', 'true');
    element.addEventListener('click', function(this: HTMLElement) {
      window.dataLayer = window.dataLayer || [];
      const ctaPayload = normalizeEventPayload({
        event: 'cta_click',
        cta_type: ctaType,
        location,
        button_text: this.textContent?.trim() || 'CTA'
      });
      window.dataLayer.push(ctaPayload);
    });
  },

  /**
   * Track FAQ engagement consistently
   */
  trackFAQToggle(itemNumber: string, isOpen: boolean, questionText: string): void {
    try {
      window.dataLayer = window.dataLayer || [];
      const faqPayload = normalizeEventPayload({
        event: 'faq_toggle',
        action: isOpen ? 'open' : 'close',
        question: questionText,
        faq_item: itemNumber
      });
      window.dataLayer.push(faqPayload);
    } catch (error) {
      console.debug('FAQ analytics tracking failed:', error);
    }
  },

  /**
   * Track scroll indicator usage across sections
   */
  trackScrollIndicator(fromSection: string, toSection: string): void {
    window.dataLayer = window.dataLayer || [];
    const scrollPayload = normalizeEventPayload({
      event: 'scroll_indicator_click',
      from_section: fromSection,
      to_section: toSection
    });
    window.dataLayer.push(scrollPayload);
  },

  /**
   * Track general section engagement with unified structure
   */
  trackSectionEngagement(sectionName: string, action: string, details?: Record<string, unknown>): void {
    window.dataLayer = window.dataLayer || [];
    const engagementPayload = normalizeEventPayload({
      event: 'section_engagement',
      section_name: sectionName,
      action,
      ...details
    });
    window.dataLayer.push(engagementPayload);
  },

  /**
   * Track UI interactions like button clicks, animations, etc.
   */
  trackUIInteraction(action: string, details?: Record<string, unknown>): void {
    window.dataLayer = window.dataLayer || [];
    const uiPayload = normalizeEventPayload({
      event: 'ui_interaction',
      action,
      timestamp: new Date().toISOString(),
      ...details
    });
    window.dataLayer.push(uiPayload);
  },

  /**
   * Track personalization events
   */
  trackPersonalization(action: string, details?: Record<string, unknown>): void {
    window.dataLayer = window.dataLayer || [];
    const personalizationPayload = normalizeEventPayload({
      event: 'personalization',
      action,
      timestamp: new Date().toISOString(),
      ...details
    });
    window.dataLayer.push(personalizationPayload);
  },

  /**
   * Track page views with enhanced data
   */
  trackPageView(page: string, details?: Record<string, unknown>): void {
    window.dataLayer = window.dataLayer || [];
    const pageViewPayload = normalizeEventPayload({
      event: 'page_view',
      page_name: page,
      timestamp: new Date().toISOString(),
      ...details
    });
    window.dataLayer.push(pageViewPayload);
  },

  /**
   * Track conversion events
   */
  trackConversion(action: string, details?: Record<string, unknown>): void {
    window.dataLayer = window.dataLayer || [];
    const conversionPayload = normalizeEventPayload({
      event: 'conversion',
      action,
      timestamp: new Date().toISOString(),
      ...details
    });
    window.dataLayer.push(conversionPayload);
  }
};
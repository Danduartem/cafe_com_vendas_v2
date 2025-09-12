/**
 * Offer Component for Café com Vendas
 * Handles MBWay toggle and deliverable animations
 */

import { CONFIG } from '../../../assets/js/config/constants.js';
import { safeQuery, safeQueryAll } from '../../../utils/dom.js';
import { Animations } from '../../../components/ui/index.js';
import analytics, { AnalyticsHelpers } from '../../../analytics/index.js';
import type { Component } from '../../../types/components/base.js';

interface OfferComponent extends Component {
  initMBWayToggle(): void;
  toggleMBWayInfo(): void;
  initDeliverableAnimations(): void;
  initSectionTracking(): void;
}

export const Offer: OfferComponent = {
  init() {
    try {
      this.initMBWayToggle();
      this.initDeliverableAnimations();
      this.initSectionTracking();
    } catch (error) {
      console.error('Error initializing Offer component:', error);
    }
  },

  initMBWayToggle() {
    // Bind click event listener to MBWay button
    const mbwayButton = safeQuery('#mbway-button');
    if (mbwayButton) {
      mbwayButton.addEventListener('click', this.toggleMBWayInfo.bind(this));
    }
  },

  toggleMBWayInfo() {
    const mbwayInfo = safeQuery('#mbway-info');
    const button = safeQuery('#mbway-button');

    if (!mbwayInfo || !button) return;

    const chevron = button.querySelector('svg:last-child');
    const isHidden = mbwayInfo.classList.contains('hidden');

    if (isHidden) {
      mbwayInfo.classList.remove('hidden', 'max-h-0', 'opacity-0');
      mbwayInfo.classList.add('max-h-48', 'opacity-100');
      button.setAttribute('aria-expanded', 'true');
      chevron?.classList.add('rotate-180');

      setTimeout(() => {
        const firstFocusable = mbwayInfo.querySelector('p');
        firstFocusable?.focus();
      }, CONFIG.animations.duration.normal);
    } else {
      mbwayInfo.classList.remove('max-h-48', 'opacity-100');
      mbwayInfo.classList.add('max-h-0', 'opacity-0');
      button.setAttribute('aria-expanded', 'false');
      chevron?.classList.remove('rotate-180');

      setTimeout(() => {
        mbwayInfo.classList.add('hidden');
      }, CONFIG.animations.duration.normal);
    }

    analytics.track('view_mbway_option', {
      section: 'offer',
      element_type: 'mbway_toggle',
      action: isHidden ? 'open' : 'close'
    });
  },

  initDeliverableAnimations() {
    const deliverableItems = Array.from(safeQueryAll('.deliverable-item'));
    if (!deliverableItems.length) return;

    Animations.prepareRevealElements(deliverableItems, {
      hiddenClasses: ['opacity-0', 'translate-y-2'],
      transitionClasses: ['transition-all', 'duration-400', 'ease-out']
    });

    const observer = Animations.createObserver({
      callback: (entry: IntersectionObserverEntry) => {
        if (entry.target.classList.contains('deliverable-item')) {
          entry.target.classList.remove('opacity-0', 'translate-y-2');
          entry.target.classList.add('opacity-100', 'translate-y-0');
        }
      },
      threshold: 0.15,
      rootMargin: '0px 0px -30px 0px'
    });

    deliverableItems.forEach(item => observer.observe(item));
  },

  /**
   * Initialize section view tracking for Offer section
   */
  initSectionTracking() {
    // Lower threshold to 30% visibility to ensure firing on tall sections
    AnalyticsHelpers.initSectionTracking('offer', 0.3);
  }
};

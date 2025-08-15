/**
 * Offer Component for Café com Vendas
 * Handles MBWay toggle and deliverable animations
 */

import { CONFIG } from '../config/constants.js';
import { Analytics } from '../core/analytics.js';
import { safeQuery, safeQueryAll, Animations } from '../utils/index.js';

export const Offer = {
  init() {
    try {
      this.initMBWayToggle();
      this.initDeliverableAnimations();
    } catch (error) {
      console.error('Error initializing Offer component:', error);
    }
  },

  initMBWayToggle() {
    // Make toggleMBWayInfo available globally for onclick handlers
    window.toggleMBWayInfo = this.toggleMBWayInfo.bind(this);
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

    Analytics.track('view_mbway_option', {
      event_category: 'Payment',
      event_label: 'MBWay Option Viewed',
      value: isHidden ? 1 : 0
    });
  },

  initDeliverableAnimations() {
    const deliverableItems = safeQueryAll('.deliverable-item');
    if (!deliverableItems.length) return;

    Animations.prepareRevealElements(deliverableItems, {
      hiddenClasses: ['opacity-0', 'translate-y-2'],
      transitionClasses: ['transition-all', 'duration-400', 'ease-out']
    });

    const observer = Animations.createObserver({
      callback: (entry) => {
        if (entry.target.classList.contains('deliverable-item')) {
          entry.target.classList.remove('opacity-0', 'translate-y-2');
          entry.target.classList.add('opacity-100', 'translate-y-0');
        }
      },
      threshold: 0.15,
      rootMargin: '0px 0px -30px 0px'
    });

    deliverableItems.forEach(item => observer.observe(item));
  }
};
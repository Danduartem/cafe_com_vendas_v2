/**
 * Animation utilities for Café com Vendas
 * Provides reusable animation functions using pure Tailwind CSS classes
 */

import { CONFIG } from '../config/constants.js';

export const Animations = {
  /**
     * Add reveal animation classes to elements
     */
  prepareRevealElements(elements, config = {}) {
    const {
      hiddenClasses = ['opacity-0', 'translate-y-4'],
      transitionClasses = ['transition-all', 'duration-700', 'ease-out']
    } = config;

    elements.forEach(element => {
      if (element) {
        element.classList.add(...hiddenClasses, ...transitionClasses);
      }
    });
  },

  /**
     * Reveal elements with staggered animation
     */
  revealElements(elements, config = {}) {
    const {
      visibleClasses = ['opacity-100', 'translate-y-0'],
      hiddenClasses = ['opacity-0', 'translate-y-4'],
      staggerDelay = CONFIG.animations.stagger,
      initialDelay = 0
    } = config;

    elements.forEach((element, index) => {
      if (element) {
        setTimeout(() => {
          element.classList.remove(...hiddenClasses);
          element.classList.add(...visibleClasses);
        }, initialDelay + (index * staggerDelay));
      }
    });
  },

  /**
     * Create intersection observer for animations
     */
  createObserver(options = {}) {
    const defaultOptions = {
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    };

    return new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting && options.callback) {
          options.callback(entry);
          if (options.once) {
            options.observer?.unobserve(entry.target);
          }
        }
      });
    }, { ...defaultOptions, ...options });
  },

  /**
     * Add scale animation on click
     */
  addClickFeedback(element, scaleClass = 'scale-95', duration = 100) {
    if (!element) return;

    element.addEventListener('click', function() {
      this.classList.add(scaleClass);
      setTimeout(() => {
        this.classList.remove(scaleClass);
      }, duration);
    });
  }
};
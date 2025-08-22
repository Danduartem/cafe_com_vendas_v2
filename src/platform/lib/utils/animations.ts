/**
 * Animation utilities for Café com Vendas
 * Provides reusable animation functions using pure Tailwind CSS classes
 */

import { CONFIG } from '../../../assets/js/config/constants.ts';

interface RevealConfig {
  hiddenClasses?: string[];
  transitionClasses?: string[];
  visibleClasses?: string[];
  stagger?: number;
  staggerDelay?: number;
  initialDelay?: number;
}

interface ObserverConfig {
  callback?: (entry: IntersectionObserverEntry, index?: number) => void;
  once?: boolean;
  threshold?: number;
  rootMargin?: string;
  observer?: IntersectionObserver;
}

export const Animations = {
  /**
     * Add reveal animation classes to elements
     */
  prepareRevealElements(elements: Element[], config: RevealConfig = {}): void {
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
  revealElements(elements: Element[], config: RevealConfig = {}): void {
    const {
      visibleClasses = ['opacity-100', 'translate-y-0'],
      hiddenClasses = ['opacity-0', 'translate-y-4'],
      staggerDelay = CONFIG.animations.delay.normal,
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
  createObserver(options: ObserverConfig = {}) {
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
  addClickFeedback(element: Element | null, scaleClass: string = 'scale-95', duration: number = 100): void {
    if (!element) return;

    element.addEventListener('click', function(this: Element) {
      this.classList.add(scaleClass);
      setTimeout(() => {
        this.classList.remove(scaleClass);
      }, duration);
    });
  }
};
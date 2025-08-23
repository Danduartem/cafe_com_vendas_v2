/**
 * Animation Components for Café com Vendas
 * Reusable animation utilities using pure Tailwind CSS classes
 * Used across multiple sections for consistent animations
 */

import type {
  RevealConfig,
  ObserverConfig,
  SafeElement
} from '@/types/index';

/**
 * Configuration for reveal animations
 */
interface PrepareRevealConfig {
  hiddenClasses?: string[];
  transitionClasses?: string[];
}

/**
 * Configuration for revealing elements
 */
interface RevealElementsConfig extends RevealConfig {
  visibleClasses?: string[];
  hiddenClasses?: string[];
  staggerDelay?: number;
}

export const Animations = {
  /**
   * Add reveal animation classes to elements
   */
  prepareRevealElements(
    elements: (Element | null)[],
    config: PrepareRevealConfig = {}
  ): void {
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
  revealElements(
    elements: (Element | null)[],
    config: RevealElementsConfig = {}
  ): void {
    const {
      visibleClasses = ['opacity-100', 'translate-y-0'],
      hiddenClasses = ['opacity-0', 'translate-y-4'],
      staggerDelay = 150,
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
  createObserver(options: ObserverConfig): IntersectionObserver {
    const defaultOptions: IntersectionObserverInit = {
      threshold: options.threshold ?? 0.1,
      rootMargin: options.rootMargin ?? '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry, index) => {
        if (entry.isIntersecting && options.callback) {
          options.callback(entry, index);
          if (options.once) {
            observer.unobserve(entry.target);
          }
        }
      });
    }, defaultOptions);

    return observer;
  },

  /**
   * Add scale animation on click
   */
  addClickFeedback(
    element: SafeElement,
    scaleClass: string = 'scale-95',
    duration: number = 100
  ): void {
    if (!element) return;

    element.addEventListener('click', function(this: HTMLElement) {
      this.classList.add(scaleClass);
      setTimeout(() => {
        this.classList.remove(scaleClass);
      }, duration);
    });
  }
};
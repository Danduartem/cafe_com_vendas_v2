/**
 * Vision Section Component
 * Handles interactive behaviors and refined animations for the vision section
 */

import type { Component } from '../../../types/components/base.js';
import { safeQuery } from '../../../assets/js/utils/dom.js';
import { Analytics } from '../../../assets/js/core/analytics.js';

interface VisionComponent extends Component {
  bindEvents(): void;
  animateElements(): void;
  handleReducedMotion(): void;
}

// Enhanced motion preferences handling
const prefersReducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

export const Vision: VisionComponent = {
  /**
   * Initialize vision section with enhanced accessibility
   */
  init(): void {
    this.handleReducedMotion();
    this.animateElements();
    this.bindEvents();
    
    // Listen for motion preference changes
    prefersReducedMotion.addEventListener('change', () => {
      this.handleReducedMotion();
    });
  },
  
  /**
   * Handle reduced motion preferences
   */
  handleReducedMotion(): void {
    const section = safeQuery('#s-vision');
    if (!section) return;
    
    if (prefersReducedMotion.matches) {
      // Disable animations for users who prefer reduced motion
      const animatedElements = section.querySelectorAll('[data-reveal], [data-reveal-item]');
      animatedElements.forEach((element) => {
        const el = element as HTMLElement;
        el.style.transition = 'none';
        el.classList.remove('opacity-0', 'translate-y-3');
        el.classList.add('opacity-100');
      });
    }
  },

  /**
   * Handle entrance animations with sophisticated timing and easing
   */
  animateElements(): void {
    const section = safeQuery('#s-vision');
    if (!section) return;

    // Enhanced intersection observer with optimized thresholds
    const animationObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const target = entry.target as HTMLElement;
            
            // Animate main reveal elements with refined cubic-bezier timing
            if (target.hasAttribute('data-reveal')) {
              // Use next frame for smoother animation start
              requestAnimationFrame(() => {
                requestAnimationFrame(() => {
                  target.classList.add('opacity-100');
                  target.classList.remove('opacity-0', 'translate-y-3');
                  // Add completion callback for chaining
                  target.addEventListener('transitionend', () => {
                    target.setAttribute('data-animation-complete', 'true');
                  }, { once: true });
                });
              });
            }
            
            // Enhanced stagger animation with progressive timing
            if (target === section) {
              const listItems = section.querySelectorAll('[data-reveal-item]');
              listItems.forEach((item, index) => {
                const delay = 150 + (index * 65); // Progressive 65ms stagger
                setTimeout(() => {
                  const element = item as HTMLElement;
                  element.classList.add('opacity-100');
                  element.classList.remove('opacity-0');
                  // Add subtle scale animation on reveal
                  element.style.transform = 'scale(1.02)';
                  setTimeout(() => {
                    element.style.transform = 'scale(1)';
                  }, 150);
                }, delay);
              });
            }
            
            animationObserver.unobserve(target);
          }
        });
      },
      { threshold: 0.12, rootMargin: '0px 0px -30px 0px' }
    );

    // Observe main section for list items
    animationObserver.observe(section);

    // Set initial state and observe reveal elements
    const revealElements = section.querySelectorAll('[data-reveal]');
    revealElements.forEach((element) => {
      const el = element as HTMLElement;
      // Add opacity-0 and subtle translate if not already present
      if (!el.classList.contains('opacity-0') && !el.classList.contains('opacity-100')) {
        el.classList.add('opacity-0', 'translate-y-3');
      }
      animationObserver.observe(el);
    });

    // Enhanced initial state for list items with micro-interaction setup
    const listItems = section.querySelectorAll('[data-reveal-item]');
    listItems.forEach((item) => {
      const element = item as HTMLElement;
      if (!element.classList.contains('opacity-0') && !element.classList.contains('opacity-100')) {
        element.classList.add('opacity-0');
      }
      
      // Add sophisticated transition classes with staggered delays
      if (!element.classList.contains('transition-all')) {
        element.classList.add('transition-all', 'duration-200', 'ease-out');
      }
      
      // Add enhanced hover interactions
      element.addEventListener('mouseenter', () => {
        if (element.getAttribute('data-animation-complete')) {
          element.style.transform = 'translateX(4px)';
        }
      });
      
      element.addEventListener('mouseleave', () => {
        element.style.transform = 'translateX(0)';
      });
      
      // Add focus interactions for keyboard navigation
      element.addEventListener('focus', () => {
        element.style.transform = 'translateX(4px)';
        element.style.backgroundColor = 'rgba(246, 246, 246, 0.5)';
      });
      
      element.addEventListener('blur', () => {
        element.style.transform = 'translateX(0)';
        element.style.backgroundColor = 'transparent';
      });
    });
  },

  /**
   * Bind enhanced event listeners with advanced interaction tracking
   */
  bindEvents(): void {
    const section = safeQuery('#s-vision');
    if (!section) {
      console.warn('Vision section not found');
      return;
    }

    // Enhanced section visibility tracking with scroll depth
    const visibilityObserver = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            const scrollDepth = Math.round((window.scrollY / document.body.scrollHeight) * 100);
            Analytics.track('section_view', {
              event: 'section_view',
              event_category: 'Engagement',
              section: 'vision',
              element_type: 'section_entry',
              scroll_depth: scrollDepth,
              intersection_ratio: Math.round(entry.intersectionRatio * 100)
            });
            visibilityObserver.unobserve(entry.target);
          }
        });
      },
      { threshold: [0.25, 0.5, 0.75] }
    );

    visibilityObserver.observe(section);

    // Enhanced interaction tracking for list items with engagement metrics
    const listItems = section.querySelectorAll('[data-reveal-item]');
    let itemInteractionCount = 0;
    
    listItems.forEach((item, index) => {
      let hoverStartTime: number;
      
      // Track hover engagement duration
      item.addEventListener('mouseenter', () => {
        hoverStartTime = Date.now();
      });
      
      item.addEventListener('mouseleave', () => {
        if (hoverStartTime) {
          const hoverDuration = Date.now() - hoverStartTime;
          if (hoverDuration > 1000) { // Only track meaningful engagement
            Analytics.track('vision_outcome_engagement', {
              event: 'vision_outcome_hover',
              event_category: 'Engagement',
              section: 'vision',
              element_type: 'vision_outcome',
              element_index: index,
              engagement_duration: hoverDuration,
              element_text: item.textContent?.trim().substring(0, 50) || 'unknown'
            });
          }
        }
      });
      
      // Enhanced click tracking
      item.addEventListener('click', () => {
        itemInteractionCount++;
        Analytics.track('vision_outcome_click', {
          event: 'vision_outcome_click',
          event_category: 'Engagement',
          section: 'vision',
          element_type: 'vision_outcome',
          element_index: index,
          total_interactions: itemInteractionCount,
          element_text: item.textContent?.trim().substring(0, 50) || 'unknown'
        });
      });
      
      // Track focus for accessibility
      item.addEventListener('focus', () => {
        Analytics.track('vision_outcome_focus', {
          event: 'vision_outcome_focus',
          event_category: 'Accessibility',
          section: 'vision',
          element_index: index,
          navigation_method: 'keyboard'
        });
      });
    });
    
    // Track CTA interactions
    const ctaElement = section.querySelector('[data-analytics-event="click_vision_cta"]');
    if (ctaElement) {
      ctaElement.addEventListener('click', () => {
        Analytics.track('vision_cta_click', {
          event: 'click_vision_cta',
          event_category: 'Conversion',
          section: 'vision',
          total_vision_outcome_interactions: itemInteractionCount,
          user_engagement_level: itemInteractionCount > 3 ? 'high' : itemInteractionCount > 0 ? 'medium' : 'low'
        });
      });
    }
  }
};
/**
 * Hero Component for Café com Vendas
 * Handles hero section animations, interactions, and scroll indicator
 */

import { CONFIG } from '@/config/constants';
import { safeQuery } from '@utils/dom.js';
import { Animations } from '@components/ui/index.js';

export const Hero = {
  init() {
    try {
      this.initAnimations();
      this.initInteractions();
      this.initScrollIndicator();
    } catch (error) {
      console.error('Error initializing Hero component:', error);
    }
  },

  initAnimations() {
    const heroSection = safeQuery('#s-hero');
    if (!heroSection) return;

    // Get elements in visual hierarchy order for proper stagger
    const h1Element = heroSection.querySelector('h1');
    const subheadElement = heroSection.querySelector('p[class*="italic"]');
    const ctaElement = heroSection.querySelector('.hero-cta-primary');
    const badgeElement = heroSection.querySelector('.hero-badge');
    const noticeElement = heroSection.querySelector('[role="status"]');
    const secondaryCtaElement = heroSection.querySelector('a[class*="underline"]');
    const scrollIndicator = heroSection.querySelector('.hero-scroll-indicator');

    // Group elements for staggered reveal (H1 → CTA → Proof triangle)
    const primaryElements = [h1Element, subheadElement, ctaElement].filter(Boolean);
    const proofElements = [badgeElement, noticeElement].filter(Boolean);
    const supportingElements = [secondaryCtaElement, scrollIndicator].filter(Boolean);

    // Prepare all elements
    const allElements = [...primaryElements, ...proofElements, ...supportingElements];
    Animations.prepareRevealElements(allElements);

    const observer = Animations.createObserver({
      callback: () => {
        // Reveal primary triangle elements with 60ms stagger
        Animations.revealElements(primaryElements, {
          initialDelay: 150,
          staggerDelay: 60
        });
        
        // Reveal proof elements after primary
        setTimeout(() => {
          Animations.revealElements(proofElements, {
            staggerDelay: 40
          });
        }, 350);
        
        // Reveal supporting elements last
        setTimeout(() => {
          Animations.revealElements(supportingElements, {
            staggerDelay: 80
          });
        }, 500);
      },
      once: true,
      rootMargin: '0px 0px -10% 0px'
    });

    observer.observe(heroSection);
  },

  initScrollIndicator() {
    const scrollIndicatorBtn = safeQuery('#scroll-indicator-btn');
    if (!scrollIndicatorBtn) return;

    // Hide scroll indicator on very short viewports (replaces CSS media query)
    const checkViewportHeight = () => {
      if (window.innerHeight <= 600) {
        scrollIndicatorBtn.classList.add('!hidden');
      } else {
        scrollIndicatorBtn.classList.remove('!hidden');
      }
    };

    checkViewportHeight();
    window.addEventListener('resize', checkViewportHeight);

    scrollIndicatorBtn.addEventListener('click', () => {
      // Scroll directly to the vision section (next section after hero)
      const visionSection = safeQuery('#s-vision');
      if (visionSection) {
        visionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }

      // Fallback: find next sibling section
      const heroSection = safeQuery('#s-hero');
      const nextSection = heroSection?.nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
      }
    });

    // Enhanced interactions
    scrollIndicatorBtn.addEventListener('mouseenter', function(this: HTMLElement) {
      const svg = this.querySelector('svg');
      if (svg) {
        svg.classList.remove('animate-bounce');
        svg.classList.add('animate-pulse');
      }
    });

    scrollIndicatorBtn.addEventListener('mouseleave', function(this: HTMLElement) {
      const svg = this.querySelector('svg');
      if (svg) {
        svg.classList.remove('animate-pulse');
        svg.classList.add('animate-bounce');
      }
    });

    // Keyboard navigation
    scrollIndicatorBtn.addEventListener('keydown', function(this: HTMLElement, e: Event) {
      if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
        e.preventDefault();

        // Scroll directly to the problem section (next section after hero)
        const visionSection = safeQuery('#s-vision');
        if (visionSection) {
          visionSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
        } else {
          // Fallback: find next sibling section
          const heroSection = safeQuery('#s-hero');
          const nextSection = heroSection?.nextElementSibling;
          if (nextSection) {
            nextSection.scrollIntoView({ behavior: 'smooth' });
          }
        }

        this.classList.add('scale-110');
        setTimeout(() => this.classList.remove('scale-110'), CONFIG.animations.duration.fast);
      }
    });
  },

  initInteractions() {
    const heroCtaButton = safeQuery('.hero-cta-primary');
    if (!heroCtaButton) return;

    // Enhanced hover with arrow animation
    const arrow = heroCtaButton.querySelector('svg');
    
    heroCtaButton.addEventListener('mouseenter', function(this: HTMLElement) {
      // Arrow slides right on hover
      if (arrow) {
        arrow.style.transform = 'translateX(2px)';
      }
    });

    heroCtaButton.addEventListener('mouseleave', function(this: HTMLElement) {
      // Arrow returns to original position
      if (arrow) {
        arrow.style.transform = 'translateX(0)';
      }
    });

    // Click feedback with proper timing
    heroCtaButton.addEventListener('click', function(this: HTMLElement) {
      // Active state is handled by active:scale-[0.98] in Tailwind
      Animations.addClickFeedback(this);
    });

    // Keyboard feedback
    heroCtaButton.addEventListener('keydown', function(this: HTMLElement, e: Event) {
      if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
        e.preventDefault();
        this.click();
      }
    });
  },

};
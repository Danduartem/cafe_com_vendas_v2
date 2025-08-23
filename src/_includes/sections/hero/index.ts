/**
 * Hero Component for Café com Vendas
 * Handles hero section animations, interactions, and scroll indicator
 */

import { CONFIG } from '../../../assets/js/config/constants';
import { safeQuery } from '../../../assets/js/utils/dom';
import { Animations } from '../../../components/ui/index';
// Inline minimal smooth scroll to avoid importing removed navigation module

export const Hero = {
  init() {
    try {
      this.initAnimations();
      this.initInteractions();
      this.initScrollIndicator();
      this.initWhatsAppButton();
    } catch (error) {
      console.error('Error initializing Hero component:', error);
    }
  },

  initAnimations() {
    const heroSection = safeQuery('#s-hero');
    if (!heroSection) return;

    const animatableElements = [
      heroSection.querySelector('.hero-accent'),
      heroSection.querySelector('h1'),
      heroSection.querySelector('p[class*="italic"]'),
      heroSection.querySelector('.hero-badge'),
      heroSection.querySelector('p[class*="font-century"]'),
      heroSection.querySelector('.hero-cta-primary'),
      heroSection.querySelector('a[class*="underline"]'),
      heroSection.querySelector('.hero-scroll-indicator')
    ].filter(Boolean);

    Animations.prepareRevealElements(animatableElements);

    const observer = Animations.createObserver({
      callback: () => {
        Animations.revealElements(animatableElements, {
          initialDelay: 300
        });
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
      // Scroll directly to the problem section (next section after hero)
      const problemSection = safeQuery('#s-problem');
      if (problemSection) {
        problemSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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
        const problemSection = safeQuery('#s-problem');
        if (problemSection) {
          problemSection.scrollIntoView({ behavior: 'smooth', block: 'start' });
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

    // Hover effects
    heroCtaButton.addEventListener('mouseenter', function(this: HTMLElement) {
      this.classList.add('scale-105');
    });

    heroCtaButton.addEventListener('mouseleave', function(this: HTMLElement) {
      this.classList.remove('scale-105');
    });

    // Click feedback
    Animations.addClickFeedback(heroCtaButton);

    // Keyboard feedback
    heroCtaButton.addEventListener('keydown', function(this: HTMLElement, e: Event) {
      if ((e as KeyboardEvent).key === 'Enter' || (e as KeyboardEvent).key === ' ') {
        Animations.addClickFeedback(this);
      }
    });
  },

  initWhatsAppButton() {
    const whatsappButton = safeQuery('#whatsapp-button');
    if (!whatsappButton) return;

    // Animate entrance
    setTimeout(() => {
      whatsappButton.classList.remove('opacity-0', 'translate-y-4');
      whatsappButton.classList.add('opacity-100', 'translate-y-0');
    }, 500);

    // Add WhatsApp click tracking using platform analytics
    const whatsappLink = whatsappButton.querySelector('a[href*="wa.me"]') as HTMLAnchorElement;
    if (whatsappLink) {
      import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
        PlatformAnalytics.trackClick(whatsappLink, 'whatsapp_click', 'floating_button');
      }).catch(() => {
        console.debug('WhatsApp analytics tracking unavailable');
      });
    }
  }
};
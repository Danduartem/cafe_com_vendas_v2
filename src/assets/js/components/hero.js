/**
 * Hero Component for Café com Vendas
 * Handles hero section animations, interactions, and scroll indicator
 */

import { CONFIG } from '../config/constants.js';
import { safeQuery, Animations } from '../utils/index.js';
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
    const heroSection = safeQuery('#hero');
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

    scrollIndicatorBtn.addEventListener('click', () => {
      const explicitNext = safeQuery('#inscricao');
      if (explicitNext) {
        explicitNext.scrollIntoView({ behavior: 'smooth', block: 'start' });
        return;
      }
      const heroSection = safeQuery('#hero');
      const nextSection = heroSection?.nextElementSibling;
      if (nextSection) {
        nextSection.scrollIntoView({ behavior: 'smooth' });
      } else {
        window.scrollTo({ top: window.innerHeight, behavior: 'smooth' });
      }
    });

    // Enhanced interactions
    scrollIndicatorBtn.addEventListener('mouseenter', function() {
      const svg = this.querySelector('svg');
      if (svg) {
        svg.classList.remove('animate-bounce');
        svg.classList.add('animate-pulse');
      }
    });

    scrollIndicatorBtn.addEventListener('mouseleave', function() {
      const svg = this.querySelector('svg');
      if (svg) {
        svg.classList.remove('animate-pulse');
        svg.classList.add('animate-bounce');
      }
    });

    // Keyboard navigation
    scrollIndicatorBtn.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        const heroSection = safeQuery('#hero');
        const nextSection = heroSection?.nextElementSibling;
        if (nextSection) {
          nextSection.scrollIntoView({ behavior: 'smooth' });
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
    heroCtaButton.addEventListener('mouseenter', function() {
      this.classList.add('scale-105');
    });

    heroCtaButton.addEventListener('mouseleave', function() {
      this.classList.remove('scale-105');
    });

    // Click feedback
    Animations.addClickFeedback(heroCtaButton);

    // Keyboard feedback
    heroCtaButton.addEventListener('keydown', function(e) {
      if (e.key === 'Enter' || e.key === ' ') {
        Animations.addClickFeedback(this);
      }
    });
  },

  initWhatsAppButton() {
    const whatsappButton = safeQuery('#whatsapp-button');
    if (!whatsappButton) return;

    setTimeout(() => {
      whatsappButton.classList.remove('opacity-0', 'translate-y-4');
      whatsappButton.classList.add('opacity-100', 'translate-y-0');
    }, 500);
  }
};
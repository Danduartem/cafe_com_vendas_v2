/**
 * Hero Component for Café com Vendas
 * Handles hero section animations, interactions, and scroll indicator
 */

import { CONFIG } from '@/config/constants.js';
import { safeQuery, Animations, normalizeEventPayload } from '@/utils/index.js';
import type { Component } from '@/types/component.js';
import type { WhatsAppClickEvent } from '@/types/analytics.js';

export const Hero: Component = {
  init(): void {
    try {
      this.initAnimations();
      this.initInteractions();
      this.initScrollIndicator();
      this.initWhatsAppButton();
    } catch (error) {
      console.error('Error initializing Hero component:', error);
    }
  },

  initAnimations(): void {
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

  initScrollIndicator(): void {
    const scrollIndicatorBtn = safeQuery('#scroll-indicator-btn');
    if (!scrollIndicatorBtn) return;

    // Hide scroll indicator on very short viewports
    const checkViewportHeight = (): void => {
      if (window.innerHeight <= 600) {
        scrollIndicatorBtn.classList.add('!hidden');
      } else {
        scrollIndicatorBtn.classList.remove('!hidden');
      }
    };

    checkViewportHeight();
    window.addEventListener('resize', checkViewportHeight);

    scrollIndicatorBtn.addEventListener('click', (): void => {
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
    scrollIndicatorBtn.addEventListener('mouseenter', function(): void {
      const svg = this.querySelector('svg');
      if (svg) {
        svg.classList.remove('animate-bounce');
        svg.classList.add('animate-pulse');
      }
    });

    scrollIndicatorBtn.addEventListener('mouseleave', function(): void {
      const svg = this.querySelector('svg');
      if (svg) {
        svg.classList.remove('animate-pulse');
        svg.classList.add('animate-bounce');
      }
    });

    // Keyboard navigation
    scrollIndicatorBtn.addEventListener('keydown', function(e: KeyboardEvent): void {
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

  initInteractions(): void {
    const heroCtaButton = safeQuery('.hero-cta-primary');
    if (!heroCtaButton) return;

    // Hover effects
    heroCtaButton.addEventListener('mouseenter', function(): void {
      this.classList.add('scale-105');
    });

    heroCtaButton.addEventListener('mouseleave', function(): void {
      this.classList.remove('scale-105');
    });

    // Click feedback
    Animations.addClickFeedback(heroCtaButton);

    // Keyboard feedback
    heroCtaButton.addEventListener('keydown', function(e: KeyboardEvent): void {
      if (e.key === 'Enter' || e.key === ' ') {
        Animations.addClickFeedback(this);
      }
    });
  },

  initWhatsAppButton(): void {
    const whatsappButton = safeQuery('#whatsapp-button');
    if (!whatsappButton) return;

    // Animate entrance
    setTimeout(() => {
      whatsappButton.classList.remove('opacity-0', 'translate-y-4');
      whatsappButton.classList.add('opacity-100', 'translate-y-0');
    }, 500);

    // Add WhatsApp click tracking
    const whatsappLink = whatsappButton.querySelector('a[href*="wa.me"]');
    if (whatsappLink && !whatsappLink.hasAttribute('data-gtm-tracked')) {
      whatsappLink.setAttribute('data-gtm-tracked', 'true'); // Prevent duplicate listeners

      whatsappLink.addEventListener('click', function(): void {
        // Push WhatsApp click event to dataLayer
        window.dataLayer = window.dataLayer || [];
        const whatsappPayload = normalizeEventPayload({
          event: 'whatsapp_click',
          link_url: this.href,
          link_text: this.textContent?.trim() ?? 'WhatsApp',
          location: 'floating_button'
        } as WhatsAppClickEvent);
        window.dataLayer.push(whatsappPayload);
      });
    }
  }
};
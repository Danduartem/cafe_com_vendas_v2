/**
 * Footer Component for Café com Vendas
 * Handles premium footer interactions, animations, and effects
 */

import { CONFIG } from '../config/constants.js';
import { Analytics } from '../core/analytics.js';
import { safeQuery, safeQueryAll } from '../utils/dom.js';
import { Animations } from '../utils/animations.js';
import { throttle } from '../utils/throttle.js';
import { normalizeEventPayload } from '../utils/gtm-normalizer.js';

export const Footer = {
  init() {
    try {
      this.initFloatingPatterns();
      this.initMagneticHover();
      this.enhanceWhatsAppButton();
      this.initScrollGradient();
      this.initFooterReveal();
      this.enhanceEmailLink();
      this.addPremiumFocusStates();
    } catch (error) {
      console.error('Error initializing Footer component:', error);
    }
  },

  initFloatingPatterns() {
    const patterns = safeQueryAll('#footer .absolute.opacity-5 > div');
    const delayClasses = ['delay-0', 'delay-1000', 'delay-[2000ms]', 'delay-[3000ms]'];

    patterns.forEach((pattern, index) => {
      // Apply Tailwind animation and delay classes
      pattern.classList.add('animate-pulse', delayClasses[index % delayClasses.length]);

      pattern.addEventListener('mouseenter', () => {
        pattern.classList.add('scale-110', 'transition-transform', 'duration-500');
      });

      pattern.addEventListener('mouseleave', () => {
        pattern.classList.remove('scale-110');
      });
    });
  },

  initMagneticHover() {
    const magneticElements = safeQueryAll('#footer a, #footer .group');

    magneticElements.forEach(element => {
      element.addEventListener('mouseenter', function() {
        this.classList.add('magnetic-hover');

        const glowDiv = document.createElement('div');
        glowDiv.className = 'absolute inset-0 bg-gold-500/10 rounded-2xl blur-lg opacity-0 transition-opacity duration-500';
        this.classList.add('relative');
        this.appendChild(glowDiv);

        setTimeout(() => {
          glowDiv.classList.remove('opacity-0');
          glowDiv.classList.add('opacity-100');
        }, 50);
      });

      element.addEventListener('mouseleave', function() {
        const glow = this.querySelector('.bg-gold-500\\/10');
        if (glow) {
          glow.classList.add('opacity-0');
          setTimeout(() => glow.remove(), 500);
        }
      });
    });
  },

  enhanceWhatsAppButton() {
    const whatsappBtn = safeQuery('#footer .whatsapp-pulse');
    if (!whatsappBtn) return;

    whatsappBtn.addEventListener('mouseenter', () => {
      this.createParticleEffect(whatsappBtn);
    });

    whatsappBtn.addEventListener('click', function(e) {
      const rect = this.getBoundingClientRect();
      const ripple = document.createElement('div');
      const size = Math.max(rect.width, rect.height) * 1.5;
      const x = e.clientX - rect.left - size / 2;
      const y = e.clientY - rect.top - size / 2;

      // Apply pure Tailwind classes including size and position
      ripple.className = `absolute rounded-full bg-green-400/30 pointer-events-none animate-ping w-[${size}px] h-[${size}px] left-[${x}px] top-[${y}px]`;

      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      // Fixed: Use consistent WhatsApp event name with normalization
      window.dataLayer = window.dataLayer || [];
      const whatsappPayload = normalizeEventPayload({
        event: 'whatsapp_click',
        link_url: this.href || '', // Will be normalized
        link_text: this.textContent?.trim() || 'WhatsApp', // Will be normalized to 50 chars
        location: 'footer' // Will be normalized
      });
      window.dataLayer.push(whatsappPayload);
    });
  },

  createParticleEffect(element) {
    for (let i = 0; i < 6; i++) {
      const particle = document.createElement('div');
      const leftPos = Math.random() * 100;
      const delayMs = Math.random() * 2000;

      // Apply pure Tailwind classes for positioning and animation
      particle.className = `absolute w-1 h-1 bg-gold-400/60 rounded-full animate-bounce left-[${leftPos}%] delay-[${delayMs}ms]`;
      element.classList.add('relative');
      element.appendChild(particle);

      setTimeout(() => particle.remove(), 8000);
    }
  },

  initScrollGradient() {
    const footer = safeQuery('#footer');
    if (!footer) return;

    const scrollHandler = throttle(() => {
      const scrollPercent = Math.min(
        window.scrollY / (document.body.scrollHeight - window.innerHeight), 1
      );

      if (scrollPercent > 0.8) {
        footer.classList.remove('bg-gradient-to-br');
        footer.classList.add('bg-gradient-to-bl');
      } else if (scrollPercent > 0.4) {
        footer.classList.remove('bg-gradient-to-bl', 'bg-gradient-to-br');
        footer.classList.add('bg-gradient-to-b');
      } else {
        footer.classList.remove('bg-gradient-to-b', 'bg-gradient-to-bl');
        footer.classList.add('bg-gradient-to-br');
      }
    }, CONFIG.performance.throttleMs);

    window.addEventListener('scroll', scrollHandler, { passive: true });
  },

  initFooterReveal() {
    const footerSections = safeQueryAll('#footer [data-reveal]');
    if (!footerSections.length) return;

    Animations.prepareRevealElements(footerSections, {
      hiddenClasses: ['opacity-0', 'translate-y-8'],
      transitionClasses: ['transition-all', 'duration-700', 'ease-out']
    });

    const observer = Animations.createObserver({
      callback: (entry, index) => {
        setTimeout(() => {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-8');

          // Trigger counter animation
          if (entry.target.querySelector('[data-counter]')) {
            setTimeout(this.animateCounters, 200);
          }
        }, index * 200);
      },
      once: true,
      threshold: 0.1,
      rootMargin: '0px 0px -100px 0px'
    });

    footerSections.forEach(section => observer.observe(section));
  },

  animateCounters() {
    const counters = safeQueryAll('[data-counter]');

    counters.forEach(counter => {
      const target = parseInt(counter.getAttribute('data-counter'));
      const increment = target / 60;
      let current = 0;

      const timer = setInterval(() => {
        current += increment;
        counter.textContent = Math.ceil(current);

        if (current >= target) {
          counter.textContent = target;
          clearInterval(timer);
        }
      }, CONFIG.performance.throttleMs);
    });
  },

  enhanceEmailLink() {
    const emailLink = safeQuery('#footer a[href^="mailto:"]');
    if (!emailLink) return;

    emailLink.addEventListener('click', function() {
      const originalText = this.innerHTML;
      this.innerHTML = '<span class="text-green-400">✓ Email copiado!</span>';

      navigator.clipboard.writeText('support@cafecomvendas.com').catch(() => {});

      setTimeout(() => {
        this.innerHTML = originalText;
      }, 2000);

      Analytics.track('footer_email_click');
    });
  },

  addPremiumFocusStates() {
    const footerLinks = safeQueryAll('#footer a, #footer button');
    footerLinks.forEach(link => {
      link.classList.add('footer-link');

      link.addEventListener('focus', function() {
        this.classList.add('ring-2', 'ring-gold-400', 'ring-offset-2', 'ring-offset-navy-900');
      });

      link.addEventListener('blur', function() {
        this.classList.remove('ring-2', 'ring-gold-400', 'ring-offset-2', 'ring-offset-navy-900');
      });
    });
  }
};
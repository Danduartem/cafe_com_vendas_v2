/**
 * Testimonials Component for Café com Vendas
 * Handles native carousel with video card effects
 */

import { CONFIG } from '../config/constants.js';
import { Analytics } from '../core/analytics.js';
import { safeQuery, safeQueryAll, Animations, debounce } from '../utils/index.js';

// Constants for carousel layout
const CAROUSEL_GAP_DEFAULT = 24; // Default gap between slides in pixels

export const Testimonials = {
  init() {
    try {
      this.initTestimonialsCarousel();
      this.initVideoCardEffects();
    } catch (error) {
      console.error('Error initializing Testimonials component:', error);
    }
  },

  initTestimonialsCarousel() {
    const carousel = safeQuery('.testimonials-carousel');
    const slides = safeQueryAll('.carousel-slide');
    const prevButton = safeQuery('[data-carousel-prev]');
    const nextButton = safeQuery('[data-carousel-next]');
    const paginationContainer = safeQuery('[data-carousel-pagination]');

    if (!carousel || !slides.length) {
      console.warn('Testimonials carousel elements not found');
      return;
    }

    let currentIndex = 0;

    const createPagination = () => {
      if (!paginationContainer) return;

      paginationContainer.innerHTML = '';

      for (let i = 0; i < slides.length; i++) {
        const dot = document.createElement('button');
        dot.className = 'w-2 h-2 rounded-full bg-navy-800/20 transition-all duration-300 hover:bg-navy-800/40';
        dot.setAttribute('type', 'button');
        dot.setAttribute('aria-label', `Ir para testemunho ${i + 1}`);
        dot.setAttribute('aria-current', 'false');
        dot.addEventListener('click', () => this.goToSlide(i));
        paginationContainer.appendChild(dot);
      }
      this.updatePagination();
    };

    this.updatePagination = () => {
      if (!paginationContainer) return;

      const dots = paginationContainer.querySelectorAll('button');

      dots.forEach((dot, index) => {
        if (index === currentIndex) {
          dot.classList.remove('bg-navy-800/20');
          dot.classList.add('bg-navy-800', 'w-6');
          dot.setAttribute('aria-current', 'true');
        } else {
          dot.classList.remove('bg-navy-800', 'w-6');
          dot.classList.add('bg-navy-800/20');
          dot.setAttribute('aria-current', 'false');
        }
      });
    };

    const scrollToSlide = (index) => {
      if (slides[index]) {
        // Use native scroll for smooth behavior
        slides[index].scrollIntoView({
          behavior: 'smooth',
          block: 'nearest',
          inline: 'start'
        });
      }
    };

    this.updateNavigationButtons = () => {
      if (!prevButton || !nextButton) return;

      if (currentIndex <= 0) {
        prevButton.classList.add('opacity-50', 'cursor-not-allowed');
        prevButton.disabled = true;
      } else {
        prevButton.classList.remove('opacity-50', 'cursor-not-allowed');
        prevButton.disabled = false;
      }

      if (currentIndex >= slides.length - 1) {
        nextButton.classList.add('opacity-50', 'cursor-not-allowed');
        nextButton.disabled = true;
      } else {
        nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
        nextButton.disabled = false;
      }
    };

    this.goToSlide = (index) => {
      currentIndex = Math.max(0, Math.min(index, slides.length - 1));
      scrollToSlide(currentIndex);
      this.updatePagination();
      this.updateNavigationButtons();

      Analytics.track(CONFIG.analytics.events.TESTIMONIAL_VIEW, {
        slide_index: currentIndex + 1,
        total_slides: slides.length
      });
    };

    const initCarousel = () => {
      // Add scroll-snap classes to carousel
      carousel.classList.add('snap-x', 'snap-mandatory', 'scroll-smooth');

      // Add snap classes to slides
      slides.forEach(slide => {
        slide.classList.add('snap-start', 'flex-shrink-0');
      });

      createPagination();
      this.updateNavigationButtons();
    };

    // Handle scroll events to update current index
    const handleScroll = debounce(() => {
      const scrollLeft = carousel.scrollLeft;
      const slideWidth = slides[0].offsetWidth;
      const gap = parseInt(window.getComputedStyle(carousel.firstElementChild).gap) || CAROUSEL_GAP_DEFAULT;

      // Calculate which slide is most visible
      const newIndex = Math.round(scrollLeft / (slideWidth + gap));
      if (newIndex !== currentIndex) {
        currentIndex = newIndex;
        this.updatePagination();
        this.updateNavigationButtons();
      }
    }, 100);

    carousel.addEventListener('scroll', handleScroll, { passive: true });

    // Event listeners
    prevButton?.addEventListener('click', () => this.goToSlide(currentIndex - 1));
    nextButton?.addEventListener('click', () => this.goToSlide(currentIndex + 1));

    // Touch support is handled by native scroll

    initCarousel();
    this.trackSectionView();
  },

  initTouchSupport(carouselTrack, currentIndex) {
    let startX = 0;
    let isDragging = false;

    carouselTrack.addEventListener('touchstart', (e) => {
      startX = e.touches[0].clientX;
      isDragging = true;
    }, { passive: true });

    carouselTrack.addEventListener('touchmove', (e) => {
      if (!isDragging) return;
      e.preventDefault();
    }, { passive: false });

    carouselTrack.addEventListener('touchend', (e) => {
      if (!isDragging) return;

      const endX = e.changedTouches[0].clientX;
      const diff = startX - endX;

      if (Math.abs(diff) > 50) {
        if (diff > 0) {
          this.goToSlide(currentIndex + 1);
        } else {
          this.goToSlide(currentIndex - 1);
        }
      }

      isDragging = false;
    }, { passive: true });
  },

  initVideoCardEffects() {
    const videoCards = safeQueryAll('[data-video-card]');

    videoCards.forEach(card => {
      card.addEventListener('mouseenter', function() {
        this.classList.add('-translate-y-1');
      }, { passive: true });

      card.addEventListener('mouseleave', function() {
        this.classList.remove('-translate-y-1');
      }, { passive: true });
    });
  },

  trackSectionView() {
    const observer = Animations.createObserver({
      callback: () => {
        Analytics.track('view_testimonials_section');
      },
      once: true,
      threshold: 0.3
    });

    const socialProofSection = safeQuery('#social-proof');
    if (socialProofSection) {
      observer.observe(socialProofSection);
    }
  }
};
/**
 * Testimonials Component for Café com Vendas
 * Handles native carousel with video card effects
 */

import { CONFIG } from '../config/constants.js';
import { Analytics } from '../core/analytics.js';
import { safeQuery, safeQueryAll, calculateSlidesPerView, Animations, debounce } from '../utils/index.js';

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
    const carouselContainer = safeQuery('.testimonials-carousel-container');
    const carouselTrack = safeQuery('[data-carousel-track]');
    const slides = safeQueryAll('.carousel-slide');
    const prevButton = safeQuery('[data-carousel-prev]');
    const nextButton = safeQuery('[data-carousel-next]');
    const paginationContainer = safeQuery('[data-carousel-pagination]');

    if (!carouselContainer || !carouselTrack || !slides.length) {
      console.warn('Testimonials carousel elements not found');
      return;
    }

    let currentIndex = 0;
    let slidesPerView = 1;

    const calculateSlidesPerViewLocal = () => {
      const containerWidth = carouselContainer.offsetWidth;
      slidesPerView = calculateSlidesPerView(containerWidth);
    };

    const createPagination = () => {
      if (!paginationContainer) return;

      paginationContainer.innerHTML = '';
      const totalPages = Math.ceil(slides.length / Math.floor(slidesPerView));

      for (let i = 0; i < totalPages; i++) {
        const dot = document.createElement('button');
        dot.className = 'w-2 h-2 rounded-full bg-navy-800/20 transition-all duration-300 hover:bg-navy-800/40';
        dot.setAttribute('type', 'button');
        dot.setAttribute('aria-label', `Ir para página ${i + 1} dos testemunhos`);
        dot.setAttribute('aria-current', 'false');
        dot.addEventListener('click', () => this.goToSlide(i * Math.floor(slidesPerView)));
        paginationContainer.appendChild(dot);
      }
      this.updatePagination();
    };

    this.updatePagination = () => {
      if (!paginationContainer) return;

      const dots = paginationContainer.querySelectorAll('button');
      const activePage = Math.floor(currentIndex / Math.floor(slidesPerView));

      dots.forEach((dot, index) => {
        if (index === activePage) {
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

    const updateCarousel = () => {
      // Use predefined data position for pure CSS approach
      carouselTrack.setAttribute('data-position', currentIndex);
      carouselTrack.classList.add('carousel-track');
      this.updatePagination();
      this.updateNavigationButtons();
    };

    this.updateNavigationButtons = () => {
      if (!prevButton || !nextButton) return;

      const maxIndex = slides.length - Math.floor(slidesPerView);

      if (currentIndex <= 0) {
        prevButton.classList.add('opacity-50', 'cursor-not-allowed');
        prevButton.disabled = true;
      } else {
        prevButton.classList.remove('opacity-50', 'cursor-not-allowed');
        prevButton.disabled = false;
      }

      if (currentIndex >= maxIndex) {
        nextButton.classList.add('opacity-50', 'cursor-not-allowed');
        nextButton.disabled = true;
      } else {
        nextButton.classList.remove('opacity-50', 'cursor-not-allowed');
        nextButton.disabled = false;
      }
    };

    this.goToSlide = (index) => {
      const maxIndex = slides.length - Math.floor(slidesPerView);
      currentIndex = Math.max(0, Math.min(index, maxIndex));
      updateCarousel();

      Analytics.track(CONFIG.analytics.events.TESTIMONIAL_VIEW, {
        slide_index: currentIndex + 1,
        total_slides: slides.length
      });
    };

    const initCarousel = () => {
      calculateSlidesPerViewLocal();
      slides.forEach(slide => {
        // Use responsive Tailwind classes instead of dynamic widths
        slide.classList.add('flex-shrink-0');
        // Ensure slides have the correct responsive width classes already in HTML
      });
      createPagination();
      updateCarousel();
    };

    // Event listeners
    prevButton?.addEventListener('click', () => this.goToSlide(currentIndex - 1));
    nextButton?.addEventListener('click', () => this.goToSlide(currentIndex + 1));

    // Touch support
    this.initTouchSupport(carouselTrack, currentIndex);

    // Resize handler
    const handleResize = debounce(() => {
      calculateSlidesPerViewLocal();
      createPagination();

      const maxIndex = slides.length - Math.floor(slidesPerView);
      if (currentIndex > maxIndex) {
        currentIndex = maxIndex;
      }

      updateCarousel();
    }, 250);

    window.addEventListener('resize', handleResize, { passive: true });

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
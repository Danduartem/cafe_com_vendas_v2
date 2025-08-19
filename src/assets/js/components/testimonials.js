/**
 * Testimonials Component for Café com Vendas
 * Handles native carousel with video card effects
 */

import { safeQuery, safeQueryAll, Animations, debounce, normalizeEventPayload } from '../utils/index.js';

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
    const elements = this.getCarouselElements();
    if (!this.validateCarouselElements(elements)) return;

    this.setupCarouselState(elements);
    this.setupCarouselBehavior(elements);
    this.bindCarouselEvents(elements);
    this.trackSectionView();
  },

  getCarouselElements() {
    return {
      carousel: safeQuery('.testimonials-carousel'),
      slides: safeQueryAll('.carousel-slide'),
      prevButton: safeQuery('[data-carousel-prev]'),
      nextButton: safeQuery('[data-carousel-next]'),
      paginationContainer: safeQuery('[data-carousel-pagination]')
    };
  },

  validateCarouselElements(elements) {
    if (!elements.carousel || !elements.slides.length) {
      console.warn('Testimonials carousel elements not found');
      return false;
    }
    return true;
  },

  setupCarouselState(elements) {
    this.currentIndex = 0;
    this.carouselElements = elements;

    // Add scroll-snap classes to carousel
    elements.carousel.classList.add('snap-x', 'snap-mandatory', 'scroll-smooth');

    // Add snap classes to slides
    elements.slides.forEach(slide => {
      slide.classList.add('snap-start', 'flex-shrink-0');
    });
  },

  setupCarouselBehavior(elements) {
    this.createCarouselPagination(elements);
    this.updateNavigationButtons(elements);
  },

  createCarouselPagination(elements) {
    if (!elements.paginationContainer) return;

    elements.paginationContainer.innerHTML = '';

    for (let i = 0; i < elements.slides.length; i++) {
      const dot = this.createPaginationDot(i);
      elements.paginationContainer.appendChild(dot);
    }
    this.updatePagination(elements);
  },

  createPaginationDot(index) {
    const dot = document.createElement('button');
    dot.className = 'w-2 h-2 rounded-full bg-navy-800/20 transition-all duration-300 hover:bg-navy-800/40';
    dot.setAttribute('type', 'button');
    dot.setAttribute('aria-label', `Ir para testemunho ${index + 1}`);
    dot.setAttribute('aria-current', 'false');
    dot.addEventListener('click', () => this.goToSlide(index));
    return dot;
  },

  bindCarouselEvents(elements) {
    // Handle scroll events to update current index
    const handleScroll = debounce(() => {
      this.handleCarouselScroll(elements);
    }, 100);

    elements.carousel.addEventListener('scroll', handleScroll, { passive: true });

    // Navigation button events
    elements.prevButton?.addEventListener('click', () => this.goToSlide(this.currentIndex - 1));
    elements.nextButton?.addEventListener('click', () => this.goToSlide(this.currentIndex + 1));
  },

  handleCarouselScroll(elements) {
    const scrollLeft = elements.carousel.scrollLeft;
    const slideWidth = elements.slides[0].offsetWidth;
    const gap = parseInt(window.getComputedStyle(elements.carousel.firstElementChild).gap) || CAROUSEL_GAP_DEFAULT;

    // Calculate which slide is most visible
    const newIndex = Math.round(scrollLeft / (slideWidth + gap));
    if (newIndex !== this.currentIndex) {
      this.currentIndex = newIndex;
      this.updatePagination(elements);
      this.updateNavigationButtons(elements);
    }
  },

  updatePagination(elements) {
    if (!elements.paginationContainer) return;

    const dots = elements.paginationContainer.querySelectorAll('button');

    dots.forEach((dot, index) => {
      if (index === this.currentIndex) {
        dot.classList.remove('bg-navy-800/20');
        dot.classList.add('bg-navy-800', 'w-6');
        dot.setAttribute('aria-current', 'true');
      } else {
        dot.classList.remove('bg-navy-800', 'w-6');
        dot.classList.add('bg-navy-800/20');
        dot.setAttribute('aria-current', 'false');
      }
    });
  },

  updateNavigationButtons(elements) {
    if (!elements.prevButton || !elements.nextButton) return;

    // Update previous button
    this.toggleButtonState(elements.prevButton, this.currentIndex <= 0);

    // Update next button
    this.toggleButtonState(elements.nextButton, this.currentIndex >= elements.slides.length - 1);
  },

  toggleButtonState(button, isDisabled) {
    if (isDisabled) {
      button.classList.add('opacity-50', 'cursor-not-allowed');
      button.disabled = true;
    } else {
      button.classList.remove('opacity-50', 'cursor-not-allowed');
      button.disabled = false;
    }
  },

  goToSlide(index) {
    if (!this.carouselElements) return;

    this.currentIndex = Math.max(0, Math.min(index, this.carouselElements.slides.length - 1));
    this.scrollToSlide(this.currentIndex);
    this.updatePagination(this.carouselElements);
    this.updateNavigationButtons(this.carouselElements);

    // Track testimonial slide view for GTM
    const testimonialId = this.carouselElements.slides[this.currentIndex]?.getAttribute('data-testimonial-id') || 
                         `tst_${String(this.currentIndex + 1).padStart(2, '0')}`;
    window.dataLayer = window.dataLayer || [];
    const testimonialPayload = normalizeEventPayload({
      event: 'view_testimonial_slide',
      testimonial_id: testimonialId, // Will be normalized
      position: this.currentIndex + 1 // 1-based index (number, not normalized)
    });
    window.dataLayer.push(testimonialPayload);
  },

  scrollToSlide(index) {
    const slide = this.carouselElements.slides[index];
    if (slide) {
      slide.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
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
        // Track testimonials section view for GTM
        window.dataLayer = window.dataLayer || [];
        const sectionPayload = normalizeEventPayload({
          event: 'view_testimonials_section',
          section: 'testimonials' // Will be normalized
        });
        window.dataLayer.push(sectionPayload);
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
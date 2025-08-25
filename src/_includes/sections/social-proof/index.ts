/**
 * Social Proof Section Component for Café com Vendas
 * Co-located with template and schema
 * Handles testimonials carousel and video functionality
 */

import { safeQuery, safeQueryAll } from '@/utils/dom';
import { Animations } from '../../../components/ui';
import { debounce } from '@/utils/throttle';
import { embedYouTubeVideo } from '../../../utils/youtube.js';
import type { Component } from '../../../types/components/base.js';

// Constants for carousel layout
const CAROUSEL_GAP_DEFAULT = 24;

interface CarouselElements {
  carousel: HTMLElement | null;
  slides: HTMLElement[];
  prevButton: HTMLElement | null;
  nextButton: HTMLElement | null;
  paginationContainer: HTMLElement | null;
}

interface SocialProofComponent extends Component {
  currentIndex: number;
  carouselElements: CarouselElements | null;
  initTestimonialsCarousel(): void;
  initYouTubeVideos(): void;
  getCarouselElements(): CarouselElements;
  validateCarouselElements(elements: CarouselElements): boolean;
  setupCarouselState(elements: CarouselElements): void;
  setupCarouselBehavior(elements: CarouselElements): void;
  bindCarouselEvents(elements: CarouselElements): void;
  trackSectionView(): void;
  createCarouselPagination(elements: CarouselElements): void;
  createPaginationDot(index: number): HTMLButtonElement;
  updateNavigationButtons(elements: CarouselElements): void;
  updatePagination(elements: CarouselElements): void;
  handleCarouselScroll(elements: CarouselElements): void;
  goToSlide(index: number): void;
  toggleButtonState(button: HTMLElement, isDisabled: boolean): void;
  scrollToSlide(index: number): void;
  handleVideoClick(event: Event): void;
}

export const SocialProof: SocialProofComponent = {
  currentIndex: 0,
  carouselElements: null,

  init(): void {
    try {
      this.initTestimonialsCarousel();
      this.initYouTubeVideos();
    } catch (error) {
      console.error('Error initializing Social Proof section:', error);
    }
  },

  initTestimonialsCarousel(): void {
    const elements = this.getCarouselElements();
    if (!this.validateCarouselElements(elements)) return;

    this.setupCarouselState(elements);
    this.setupCarouselBehavior(elements);
    this.bindCarouselEvents(elements);
    this.trackSectionView();
  },

  getCarouselElements(): CarouselElements {
    return {
      carousel: safeQuery('.testimonials-carousel') as HTMLElement | null,
      slides: Array.from(safeQueryAll('.carousel-slide')).filter((el): el is HTMLElement => el instanceof HTMLElement),
      prevButton: safeQuery('[data-carousel-prev]') as HTMLElement | null,
      nextButton: safeQuery('[data-carousel-next]') as HTMLElement | null,
      paginationContainer: safeQuery('[data-carousel-pagination]') as HTMLElement | null
    };
  },

  validateCarouselElements(elements: CarouselElements): boolean {
    if (!elements.carousel || !elements.slides.length) {
      console.warn('Testimonials carousel elements not found');
      return false;
    }
    return true;
  },

  setupCarouselState(elements: CarouselElements): void {
    this.currentIndex = 0;
    this.carouselElements = elements;

    // Add scroll-snap classes to carousel
    elements.carousel?.classList.add('snap-x', 'snap-mandatory', 'scroll-smooth');

    // Add snap classes to slides
    elements.slides.forEach(slide => {
      slide.classList.add('snap-start', 'flex-shrink-0');
    });
  },

  setupCarouselBehavior(elements: CarouselElements): void {
    this.createCarouselPagination(elements);
    this.updateNavigationButtons(elements);
  },

  createCarouselPagination(elements: CarouselElements): void {
    if (!elements.paginationContainer) return;

    elements.paginationContainer.innerHTML = '';

    for (let i = 0; i < elements.slides.length; i++) {
      const dot = this.createPaginationDot(i);
      elements.paginationContainer.appendChild(dot);
    }
    this.updatePagination(elements);
  },

  createPaginationDot(index: number): HTMLButtonElement {
    const dot = document.createElement('button');
    dot.className = 'w-2 h-2 rounded-full bg-navy-800/20 transition-all duration-300 hover:bg-navy-800/40';
    dot.setAttribute('type', 'button');
    dot.setAttribute('aria-label', `Ir para testemunho ${index + 1}`);
    dot.setAttribute('aria-current', 'false');
    dot.addEventListener('click', () => this.goToSlide(index));
    return dot;
  },

  bindCarouselEvents(elements: CarouselElements): void {
    // Handle scroll events to update current index
    const handleScroll = debounce(() => {
      this.handleCarouselScroll(elements);
    }, 100);

    elements.carousel?.addEventListener('scroll', handleScroll, { passive: true });

    // Navigation button events
    elements.prevButton?.addEventListener('click', () => this.goToSlide(this.currentIndex - 1));
    elements.nextButton?.addEventListener('click', () => this.goToSlide(this.currentIndex + 1));
  },

  handleCarouselScroll(elements: CarouselElements): void {
    if (!elements.carousel || !elements.slides.length) return;

    const scrollLeft = elements.carousel.scrollLeft;
    const slideWidth = elements.slides[0].offsetWidth;
    const firstChild = elements.carousel.firstElementChild;
    const gap = firstChild ? parseInt(window.getComputedStyle(firstChild).gap) || CAROUSEL_GAP_DEFAULT : CAROUSEL_GAP_DEFAULT;

    // Calculate which slide is most visible
    const newIndex = Math.round(scrollLeft / (slideWidth + gap));
    if (newIndex !== this.currentIndex) {
      this.currentIndex = newIndex;
      this.updatePagination(elements);
      this.updateNavigationButtons(elements);
    }
  },

  updatePagination(elements: CarouselElements): void {
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

  updateNavigationButtons(elements: CarouselElements): void {
    if (!elements.prevButton || !elements.nextButton) return;

    // Update previous button
    this.toggleButtonState(elements.prevButton, this.currentIndex <= 0);

    // Update next button
    this.toggleButtonState(elements.nextButton, this.currentIndex >= elements.slides.length - 1);
  },

  toggleButtonState(button: HTMLElement, isDisabled: boolean): void {
    if (isDisabled) {
      button.classList.add('opacity-50', 'cursor-not-allowed');
      (button as HTMLButtonElement).disabled = true;
    } else {
      button.classList.remove('opacity-50', 'cursor-not-allowed');
      (button as HTMLButtonElement).disabled = false;
    }
  },

  goToSlide(index: number): void {
    if (!this.carouselElements) return;

    this.currentIndex = Math.max(0, Math.min(index, this.carouselElements.slides.length - 1));
    this.scrollToSlide(this.currentIndex);
    this.updatePagination(this.carouselElements);
    this.updateNavigationButtons(this.carouselElements);

    // Track testimonial slide view using platform analytics
    const testimonialId = this.carouselElements.slides[this.currentIndex]?.getAttribute('data-testimonial-id') ??
                         `tst_${String(this.currentIndex + 1).padStart(2, '0')}`;

    import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
      PlatformAnalytics.track('section_engagement', {
        section: 'testimonials',
        action: 'slide_view',
        testimonial_id: testimonialId,
        position: this.currentIndex + 1
      });
    }).catch(() => {
      console.debug('Slide view analytics tracking unavailable');
    });
  },

  scrollToSlide(index: number): void {
    if (!this.carouselElements) return;

    const slide = this.carouselElements.slides[index];
    if (slide) {
      slide.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start'
      });
    }
  },

  /**
   * Initializes YouTube video functionality with click-to-play
   * Uses modern YouTube IFrame API with lazy loading
   */
  initYouTubeVideos(): void {
    // Find all play buttons for YouTube videos
    const playButtons = safeQueryAll('.youtube-play-btn');
    
    playButtons.forEach(button => {
      // Add click handler for video embedding
      button.addEventListener('click', (event) => {
        this.handleVideoClick(event);
      });
    });

    // Add hover effects to video cards
    const videoCards = safeQueryAll('[data-video-card]');
    videoCards.forEach(card => {
      // Add platform animations for better UX
      Animations.addClickFeedback(card, 'scale-105');

      card.addEventListener('mouseenter', function(this: HTMLElement) {
        this.classList.add('-translate-y-1');
      }, { passive: true });

      card.addEventListener('mouseleave', function(this: HTMLElement) {
        this.classList.remove('-translate-y-1');
      }, { passive: true });
    });
  },

  /**
   * Handles YouTube video play button clicks
   * Replaces thumbnail with embedded YouTube player
   */
  handleVideoClick(event: Event): void {
    event.preventDefault();
    event.stopPropagation();

    const button = event.currentTarget as HTMLElement;
    const videoContainer = button.closest('.youtube-embed') as HTMLElement;
    
    if (!videoContainer) {
      console.error('YouTube video container not found');
      return;
    }

    const videoId = videoContainer.getAttribute('data-video-id');
    if (!videoId) {
      console.error('YouTube video ID not found');
      return;
    }

    // Show loading state
    button.innerHTML = `
      <svg class="w-16 h-16 text-white animate-spin" fill="none" viewBox="0 0 24 24" aria-hidden="true">
        <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
        <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
      </svg>
    `;
    button.setAttribute('aria-label', 'Carregando vídeo...');

    // Embed the YouTube video and handle the promise properly
    embedYouTubeVideo(videoContainer, videoId).catch((error) => {
      console.error('Failed to embed YouTube video:', error);
      
      // Reset button state on error
      button.innerHTML = `
        <svg class="w-16 h-16 text-white drop-shadow-lg" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
          <path d="M8 5v14l11-7z"/>
        </svg>
      `;
      button.setAttribute('aria-label', 'Reproduzir testemunho em vídeo');
    });

    // Track analytics for video interaction
    import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
      PlatformAnalytics.track('section_engagement', {
        section: 'testimonials',
        action: 'video_embed_started',
        video_id: videoId
      });
    }).catch(() => {
      console.debug('Video embed analytics tracking unavailable');
    });
  },

  trackSectionView(): void {
    const observer = Animations.createObserver({
      callback: () => {
        import('../../../components/ui/analytics').then(({ PlatformAnalytics }) => {
          PlatformAnalytics.track('section_engagement', {
            section: 'testimonials',
            action: 'section_view'
          });
        }).catch(() => {
          console.debug('Section view analytics tracking unavailable');
        });
      },
      once: true,
      threshold: 0.3
    });

    const socialProofSection = safeQuery('#s-social-proof');
    if (socialProofSection) {
      observer.observe(socialProofSection);
    }
  }
};
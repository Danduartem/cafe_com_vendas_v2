/**
 * FAQ Component for Café com Vendas
 * Handles premium FAQ system with accordion functionality
 */

import { CONFIG } from '../config/constants.js';
import { Analytics } from '../core/analytics.js';
import { safeQuery, safeQueryAll, Animations } from '../utils/index.js';

export const FAQ = {
  init() {
    try {
      this.initializePremiumFAQSystem();
    } catch (error) {
      console.error('Error initializing FAQ component:', error);
    }
  },

  initializePremiumFAQSystem() {
    const faqContainer = safeQuery('[data-faq-container]');
    const faqItems = safeQueryAll('[data-faq-item]');

    if (!faqContainer || !faqItems.length) {
      console.warn('FAQ elements not found - FAQ functionality disabled');
      return;
    }

    // Make toggleFAQ available globally for onclick handlers
    window.toggleFAQ = this.toggleFAQ.bind(this);

    // Event delegation
    faqContainer.addEventListener('click', this.handleFAQClick.bind(this), { passive: false });
    faqContainer.addEventListener('keydown', this.handleFAQKeydown.bind(this), { passive: false });

    // Initialize animations and interactions
    this.initializeFAQRevealAnimation(faqItems);
    this.initializeFAQHoverEffects(faqItems);
    this.initializeFAQKeyboardNavigation(faqContainer);
  },

  toggleFAQ(faqId) {
    // Debounce rapid clicks
    if (this.isAnimating) return;
    this.isAnimating = true;
    setTimeout(() => { this.isAnimating = false; }, CONFIG.animations.duration.normal);

    try {
      const faqNumber = faqId.split('-')[1];
      const answerElement = safeQuery(`#faq-answer-${faqNumber}`);
      const iconElement = safeQuery(`#faq-icon-${faqNumber}`);
      const cardElement = answerElement?.closest('[data-faq-item]');
      const buttonElement = cardElement?.querySelector('[data-faq-toggle]');

      if (!answerElement || !iconElement || !buttonElement || !cardElement) {
        console.error(`FAQ elements not found for ID: ${faqId}`);
        return;
      }

      const isCurrentlyOpen = !answerElement.classList.contains('max-h-0');

      // Close other FAQs (accordion behavior)
      this.closeOtherFAQs(cardElement);

      if (!isCurrentlyOpen) {
        this.openFAQ(answerElement, iconElement, buttonElement, cardElement);
        Analytics.trackFAQEngagement(faqId, true);
      } else {
        this.closeFAQ(answerElement, iconElement, buttonElement);
        Analytics.trackFAQEngagement(faqId, false);
      }

      Analytics.track('faq_toggle', {
        event_category: 'FAQ',
        event_label: faqId,
        action: isCurrentlyOpen ? 'close' : 'open'
      });

    } catch (error) {
      console.error('Error in toggleFAQ function:', error);
    }
  },

  closeOtherFAQs(currentCard) {
    const allFAQContainers = safeQueryAll('[data-faq-item]');
    allFAQContainers.forEach(faqContainer => {
      if (faqContainer !== currentCard) {
        const otherAnswer = faqContainer.querySelector('[id^="faq-answer-"]');
        const otherIcon = faqContainer.querySelector('[id^="faq-icon-"]');
        const otherButton = faqContainer.querySelector('[data-faq-toggle]');

        if (otherAnswer && !otherAnswer.classList.contains('max-h-0')) {
          otherAnswer.classList.add('max-h-0', 'opacity-0');
          otherAnswer.classList.remove('max-h-96', 'opacity-100');
          otherIcon?.classList.remove('rotate-45');
          otherButton?.setAttribute('aria-expanded', 'false');
        }
      }
    });
  },

  openFAQ(answerElement, iconElement, buttonElement, cardElement) {
    answerElement.classList.remove('max-h-0', 'opacity-0');
    answerElement.classList.add('max-h-96', 'opacity-100');
    buttonElement.setAttribute('aria-expanded', 'true');
    iconElement.classList.add('rotate-45');

    // Premium micro-interaction
    cardElement.classList.add('scale-[1.02]');
    setTimeout(() => {
      cardElement.classList.remove('scale-[1.02]');
    }, 200);

    // Focus management
    setTimeout(() => {
      const firstFocusableElement = answerElement.querySelector('a, button, [tabindex]');
      firstFocusableElement?.focus({ preventScroll: true });
    }, CONFIG.animations.duration.normal);
  },

  closeFAQ(answerElement, iconElement, buttonElement) {
    answerElement.classList.remove('max-h-96', 'opacity-100');
    answerElement.classList.add('max-h-0', 'opacity-0');
    buttonElement.setAttribute('aria-expanded', 'false');
    iconElement.classList.remove('rotate-45');
    buttonElement.focus({ preventScroll: true });
  },

  handleFAQClick(event) {
    const faqToggleButton = event.target.closest('[data-faq-toggle]');
    if (!faqToggleButton) return;

    event.preventDefault();
    const faqId = faqToggleButton.getAttribute('data-faq-toggle');
    if (faqId) this.toggleFAQ(faqId);
  },

  handleFAQKeydown(event) {
    const faqToggleButton = event.target.closest('[data-faq-toggle]');
    if (!faqToggleButton) return;

    const faqId = faqToggleButton.getAttribute('data-faq-toggle');

    switch (event.key) {
    case 'Enter':
    case ' ':
    case 'Spacebar':
      event.preventDefault();
      if (faqId) this.toggleFAQ(faqId);
      break;
    case 'ArrowDown':
      event.preventDefault();
      this.focusNextFAQButton(faqToggleButton);
      break;
    case 'ArrowUp':
      event.preventDefault();
      this.focusPreviousFAQButton(faqToggleButton);
      break;
    case 'Home':
      event.preventDefault();
      this.focusFirstFAQButton();
      break;
    case 'End':
      event.preventDefault();
      this.focusLastFAQButton();
      break;
    }
  },

  initializeFAQRevealAnimation(faqItems) {
    Animations.prepareRevealElements(faqItems, {
      transitionClasses: ['transition-all', 'duration-500', 'ease-out']
    });

    const observer = Animations.createObserver({
      callback: (entry, index) => {
        setTimeout(() => {
          entry.target.classList.add('opacity-100', 'translate-y-0');
          entry.target.classList.remove('opacity-0', 'translate-y-4');
        }, index * 100);
      },
      once: true,
      rootMargin: '0px 0px -50px 0px'
    });

    faqItems.forEach(item => observer.observe(item));
  },

  initializeFAQHoverEffects(faqItems) {
    faqItems.forEach(item => {
      const button = item.querySelector('[data-faq-toggle]');
      if (!button) return;

      button.addEventListener('focus', () => {
        item.classList.add('ring-2', 'ring-burgundy-400', 'ring-opacity-50');
      }, { passive: true });

      button.addEventListener('blur', () => {
        item.classList.remove('ring-2', 'ring-burgundy-400', 'ring-opacity-50');
      }, { passive: true });
    });
  },

  initializeFAQKeyboardNavigation(faqContainer) {
    const firstFAQButton = faqContainer.querySelector('[data-faq-toggle]');
    firstFAQButton?.setAttribute('tabindex', '0');

    const allFAQButtons = faqContainer.querySelectorAll('[data-faq-toggle]');
    allFAQButtons.forEach((button, index) => {
      if (index > 0) button.setAttribute('tabindex', '-1');
    });
  },

  focusNextFAQButton(currentButton) {
    const allButtons = [...safeQueryAll('[data-faq-toggle]')];
    const currentIndex = allButtons.indexOf(currentButton);
    const nextButton = allButtons[currentIndex + 1] || allButtons[0];
    this.updateFAQTabIndex(currentButton, nextButton);
    nextButton.focus();
  },

  focusPreviousFAQButton(currentButton) {
    const allButtons = [...safeQueryAll('[data-faq-toggle]')];
    const currentIndex = allButtons.indexOf(currentButton);
    const prevButton = allButtons[currentIndex - 1] || allButtons[allButtons.length - 1];
    this.updateFAQTabIndex(currentButton, prevButton);
    prevButton.focus();
  },

  focusFirstFAQButton() {
    const firstButton = safeQuery('[data-faq-toggle]');
    const currentFocused = safeQuery('[data-faq-toggle][tabindex="0"]');
    if (currentFocused && firstButton) {
      this.updateFAQTabIndex(currentFocused, firstButton);
      firstButton.focus();
    }
  },

  focusLastFAQButton() {
    const allButtons = [...safeQueryAll('[data-faq-toggle]')];
    const lastButton = allButtons[allButtons.length - 1];
    const currentFocused = safeQuery('[data-faq-toggle][tabindex="0"]');
    if (currentFocused && lastButton) {
      this.updateFAQTabIndex(currentFocused, lastButton);
      lastButton.focus();
    }
  },

  updateFAQTabIndex(previousButton, nextButton) {
    previousButton?.setAttribute('tabindex', '-1');
    nextButton?.setAttribute('tabindex', '0');
  }
};
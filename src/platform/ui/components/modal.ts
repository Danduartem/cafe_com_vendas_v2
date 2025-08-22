/**
 * Platform Modal Components for Café com Vendas
 * Reusable modal utilities for consistent modal behavior
 */

import { safeQuery } from '@platform/lib/utils/dom.ts';

interface ModalConfig {
  modalId: string;
  contentSelector?: string;
  closeButtonSelector?: string;
  lockScroll?: boolean;
  escapeToClose?: boolean;
  backdropToClose?: boolean;
  focusFirstInput?: boolean;
  animationDuration?: number;
}

export class PlatformModal {
  private config: Required<ModalConfig>;
  private scrollPosition: number = 0;
  private isScrollLocked: boolean = false;

  constructor(config: ModalConfig) {
    this.config = {
      contentSelector: `#${config.modalId} [data-modal-content]`,
      closeButtonSelector: `#${config.modalId} [data-modal-close]`,
      lockScroll: true,
      escapeToClose: true,
      backdropToClose: true,
      focusFirstInput: false,
      animationDuration: 300,
      ...config
    };

    this.init();
  }

  private init(): void {
    this.bindEvents();
  }

  private bindEvents(): void {
    // Close button
    const closeButton = safeQuery(this.config.closeButtonSelector);
    closeButton?.addEventListener('click', this.close.bind(this));

    // Backdrop click
    if (this.config.backdropToClose) {
      const modal = safeQuery(`#${this.config.modalId}`);
      modal?.addEventListener('click', (e) => {
        if (e.target === modal) this.close();
      });
    }

    // Escape key
    if (this.config.escapeToClose) {
      document.addEventListener('keydown', (e) => {
        if (e.key === 'Escape' && this.isOpen()) {
          this.close();
        }
      });
    }

    // Safety unlock scroll on page unload
    window.addEventListener('beforeunload', () => {
      this.unlockScroll();
    });
  }

  open(): void {
    const modal = safeQuery(`#${this.config.modalId}`);
    const modalContent = safeQuery(this.config.contentSelector);

    if (!modal || !modalContent) return;

    // Show modal
    modal.classList.remove('hidden');

    // Animate modal in
    requestAnimationFrame(() => {
      modalContent.classList.remove('scale-95', 'opacity-0');
      modalContent.classList.add('scale-100', 'opacity-100');
    });

    // Lock scroll if enabled
    if (this.config.lockScroll) {
      this.lockScroll();
    }

    // Focus first input if enabled
    if (this.config.focusFirstInput) {
      setTimeout(() => {
        const firstInput = modal.querySelector('input, textarea, select') as HTMLElement;
        firstInput?.focus();
      }, this.config.animationDuration);
    }
  }

  close(): void {
    const modal = safeQuery(`#${this.config.modalId}`);
    const modalContent = safeQuery(this.config.contentSelector);

    if (!modal || !modalContent) return;

    // Animate modal out
    modalContent.classList.remove('scale-100', 'opacity-100');
    modalContent.classList.add('scale-95', 'opacity-0');

    // Hide modal after animation
    setTimeout(() => {
      modal.classList.add('hidden');
      if (this.config.lockScroll) {
        this.unlockScroll();
      }
    }, this.config.animationDuration);
  }

  isOpen(): boolean {
    const modal = safeQuery(`#${this.config.modalId}`);
    return modal ? !modal.classList.contains('hidden') : false;
  }

  private lockScroll(): void {
    if (this.isScrollLocked) return;

    // Store current scroll position
    this.scrollPosition = window.pageYOffset || document.documentElement.scrollTop || document.body.scrollTop || 0;

    // Apply scroll lock using pure Tailwind classes
    document.body.classList.add('fixed', 'inset-x-0', 'overflow-hidden');

    // Set the top offset to maintain visual position
    const topOffset = -this.scrollPosition;
    document.body.style.top = `${topOffset}px`;

    this.isScrollLocked = true;
  }

  private unlockScroll(): void {
    if (!this.isScrollLocked) return;

    // Remove scroll lock classes
    document.body.classList.remove('fixed', 'inset-x-0', 'overflow-hidden');

    // Clear the top offset style
    document.body.style.top = '';

    // Restore scroll position
    window.scrollTo(0, this.scrollPosition);

    this.isScrollLocked = false;
    this.scrollPosition = 0;
  }
}

/**
 * Utility functions for modal management
 */
export const PlatformModalUtils = {
  /**
   * Create a simple modal instance with sensible defaults
   */
  createModal(modalId: string, config: Partial<ModalConfig> = {}): PlatformModal {
    return new PlatformModal({ modalId, ...config });
  },

  /**
   * Setup modal trigger buttons
   */
  setupTriggers(triggerSelector: string, modalInstance: PlatformModal): void {
    document.addEventListener('click', (e) => {
      const trigger = (e.target as HTMLElement).closest(triggerSelector);
      if (trigger) {
        e.preventDefault();
        modalInstance.open();
      }
    });
  }
};
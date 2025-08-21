/**
 * Banner Component for Café com Vendas
 * Handles top banner height calculations for layout
 */

import { safeQuery } from '@/utils/index.js';
import type { Component } from '@/types/component.js';

interface BannerComponent extends Component {
  setupHeightVariable(): void;
}

export const Banner: BannerComponent = {
  init(): void {
    try {
      this.setupHeightVariable();
    } catch (error) {
      console.error('Error initializing Banner component:', error);
    }
  },

  setupHeightVariable(): void {
    const updateScrollMargins = (): void => {
      const banner = safeQuery('#topBanner');
      if (!banner) return;

      const height = (banner as HTMLElement).offsetHeight || 56;
      const sections = document.querySelectorAll('[data-scroll-offset]');

      // Apply Tailwind scroll margin classes based on banner height
      sections.forEach((section): void => {
        // Remove existing scroll margin classes
        section.className = section.className.replace(/scroll-mt-\[[\d.]+px\]/g, '');
        // Add new scroll margin class with current banner height
        section.classList.add(`scroll-mt-[${height}px]`);
      });
    };

    window.addEventListener('load', updateScrollMargins);
    window.addEventListener('resize', updateScrollMargins);
    setTimeout(updateScrollMargins, 500);
  }
};
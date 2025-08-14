/**
 * Banner Component for Café com Vendas
 * Handles top banner height calculations for layout
 */

import { safeQuery } from '../utils/index.js';

export const Banner = {
    init() {
        try {
            this.setupHeightVariable();
        } catch (error) {
            console.error('Error initializing Banner component:', error);
        }
    },
    
    setupHeightVariable() {
        const updateScrollMargins = () => {
            const banner = safeQuery('#topBanner');
            if (!banner) return;
            
            const height = banner.offsetHeight || 56;
            const sections = document.querySelectorAll('[data-scroll-offset]');
            
            // Apply Tailwind scroll margin classes based on banner height
            sections.forEach(section => {
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
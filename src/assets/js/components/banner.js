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
        const setTopBannerHeightVar = () => {
            const banner = safeQuery('#topBanner');
            if (!banner) return;
            
            const height = banner.offsetHeight || 56;
            document.documentElement.style.setProperty('--top-banner-h', height + 'px');
        };
        
        window.addEventListener('load', setTopBannerHeightVar);
        window.addEventListener('resize', setTopBannerHeightVar);
        setTimeout(setTopBannerHeightVar, 500);
    }
};
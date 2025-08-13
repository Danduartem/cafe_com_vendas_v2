/**
 * YouTube Component for Café com Vendas
 * Handles YouTube embed loading and interactions
 */

import { Analytics } from '../core/analytics.js';
import { safeQueryAll } from '../utils/index.js';

export const YouTube = {
    init() {
        try {
            this.initializeEmbeds();
        } catch (error) {
            console.error('Error initializing YouTube component:', error);
        }
    },
    
    initializeEmbeds() {
        const youtubeEmbeds = safeQueryAll('.youtube-embed');
        
        youtubeEmbeds.forEach(embed => {
            const playButton = embed.querySelector('.youtube-play-btn');
            const videoId = embed.dataset.videoId;
            
            if (playButton && videoId) {
                playButton.addEventListener('click', () => {
                    this.loadVideo(embed, videoId);
                }, { passive: true });
            }
        });
    },
    
    loadVideo(embed, videoId) {
        const iframe = document.createElement('iframe');
        iframe.className = 'absolute inset-0 w-full h-full';
        iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?autoplay=1&rel=0&modestbranding=1&controls=1&disablekb=1&fs=1&iv_load_policy=3&playsinline=1`;
        iframe.frameBorder = '0';
        iframe.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay';
        iframe.allowFullscreen = true;
        iframe.title = 'Testemunho - Café com Vendas';
        
        embed.innerHTML = '';
        embed.appendChild(iframe);
        
        Analytics.track(`youtube_video_play_${videoId}`);
    }
};
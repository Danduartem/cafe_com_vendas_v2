/**
 * YouTube Component for Café com Vendas
 * Handles YouTube embed loading and interactions
 */

import { safeQueryAll } from '../utils/dom.js';
import { normalizeEventPayload } from '../utils/gtm-normalizer.js';

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

    // Track video play for GTM
    const videoTitle = embed.getAttribute('data-video-title') || `YouTube Video ${videoId}`;
    window.dataLayer = window.dataLayer || [];
    const videoPayload = normalizeEventPayload({
      event: 'video_play',
      video_title: videoTitle, // Will be normalized to 50 chars
      percent_played: 0 // Initial play at 0% (number, not normalized)
    });
    window.dataLayer.push(videoPayload);
  }
};
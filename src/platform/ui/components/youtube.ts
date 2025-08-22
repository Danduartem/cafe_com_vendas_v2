/**
 * Platform YouTube Component
 * Handles YouTube embed loading with lazy loading and analytics
 */

import { safeQueryAll } from '@platform/lib/utils/dom.ts';
import { normalizeEventPayload } from '@platform/lib/utils/gtm-normalizer.ts';

interface YouTubeConfig {
  containerSelector?: string;
  autoplay?: boolean;
  trackAnalytics?: boolean;
}

export const PlatformYouTube = {
  /**
   * Initialize YouTube embeds with lazy loading
   */
  init(config: YouTubeConfig = {}): void {
    const {
      containerSelector = '.youtube-embed',
      autoplay = true,
      trackAnalytics = true
    } = config;

    const embeds = safeQueryAll(containerSelector);

    embeds.forEach(embed => {
      const playButton = embed.querySelector('.youtube-play-btn');
      const videoId = (embed as HTMLElement).dataset.videoId;

      if (playButton && videoId) {
        playButton.addEventListener('click', () => {
          this.loadVideo(embed, videoId, { autoplay, trackAnalytics });
        }, { passive: true });
      }
    });
  },

  /**
   * Load YouTube video iframe
   */
  loadVideo(
    container: Element,
    videoId: string,
    options: { autoplay?: boolean; trackAnalytics?: boolean } = {}
  ): void {
    const { autoplay = true, trackAnalytics = true } = options;

    const iframe = document.createElement('iframe');
    iframe.className = 'absolute inset-0 w-full h-full';
    iframe.src = `https://www.youtube-nocookie.com/embed/${videoId}?${new URLSearchParams({
      autoplay: autoplay ? '1' : '0',
      rel: '0',
      modestbranding: '1',
      controls: '1',
      disablekb: '1',
      fs: '1',
      iv_load_policy: '3',
      playsinline: '1'
    }).toString()}`;
    iframe.frameBorder = '0';
    iframe.allow = 'accelerometer; clipboard-write; encrypted-media; gyroscope; picture-in-picture; autoplay';
    iframe.allowFullscreen = true;
    iframe.title = container.getAttribute('data-video-title') || 'Video';

    // Replace container content with iframe
    container.innerHTML = '';
    container.appendChild(iframe);

    // Track video play event
    if (trackAnalytics) {
      this.trackVideoPlay(videoId, iframe.title);
    }
  },

  /**
   * Track video play event via GTM
   */
  trackVideoPlay(videoId: string, title: string): void {
    window.dataLayer = window.dataLayer || [];
    const payload = normalizeEventPayload({
      event: 'video_play',
      video_id: videoId,
      video_title: title,
      video_provider: 'youtube',
      percent_played: 0
    });
    window.dataLayer.push(payload);
  }
};
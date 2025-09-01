/**
 * YouTube IFrame API Utility for Café com Vendas
 * Implements lazy-loading and modern best practices for YouTube video embedding
 * Based on YouTube IFrame API v3 documentation (2024/2025)
 * 
 * Note: YouTube API uses 'any' types which are necessary for external API integration
 */

/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-call */
/* eslint-disable @typescript-eslint/no-unsafe-return */

import { logger } from './logger.js';

// Global YouTube API types
declare global {
  interface Window {
    YT: any;
    onYouTubeIframeAPIReady: () => void;
  }
}

interface YouTubePlayerConfig {
  videoId: string;
  container: HTMLElement;
  width?: number;
  height?: number;
  onReady?: (event: any) => void;
  onStateChange?: (event: any) => void;
  onError?: (event: any) => void;
}

interface YouTubeUtility {
  apiLoaded: boolean;
  playersMap: Map<string, any>;
  loadAPI(): Promise<void>;
  createPlayer(config: YouTubePlayerConfig): Promise<any>;
  destroyPlayer(containerId: string): void;
  isAPIReady(): boolean;
  handleStateChange(event: any, videoId: string): void;
  handleError(event: any, videoId: string): void;
  trackVideoPlay(videoId: string): void;
  showVideoError(videoId: string, errorMsg: string): void;
}

export const YouTube: YouTubeUtility = {
  apiLoaded: false,
  playersMap: new Map(),

  /**
   * Lazy-loads the YouTube IFrame API
   * Only loads once, subsequent calls return existing promise
   */
  loadAPI(): Promise<void> {
    if (this.apiLoaded) {
      return Promise.resolve();
    }

    if (typeof window.YT !== 'undefined' && window.YT?.Player) {
      this.apiLoaded = true;
      return Promise.resolve();
    }

    return new Promise((resolve, reject) => {
      // Set global callback for YouTube API
      window.onYouTubeIframeAPIReady = () => {
        this.apiLoaded = true;
        resolve();
      };

      // Create and insert script tag
      const tag = document.createElement('script');
      tag.src = 'https://www.youtube.com/iframe_api';
      tag.onerror = () => reject(new Error('Failed to load YouTube API'));
      
      const firstScriptTag = document.getElementsByTagName('script')[0];
      if (firstScriptTag?.parentNode) {
        firstScriptTag.parentNode.insertBefore(tag, firstScriptTag);
      } else {
        document.head.appendChild(tag);
      }
    });
  },

  /**
   * Creates a YouTube player instance with modern best practices
   */
  async createPlayer(config: YouTubePlayerConfig): Promise<any> {
    const { videoId, container, width = 640, height = 360, onReady, onStateChange, onError } = config;

    // Ensure API is loaded
    await this.loadAPI();

    if (!window.YT?.Player) {
      throw new Error('YouTube API not available');
    }

    // Clean up existing player if present
    const containerId = container.id || container.getAttribute('data-video-id') || `yt-${Date.now()}`;
    this.destroyPlayer(containerId);

    // Create player with modern playerVars
    const player = new window.YT.Player(container, {
      width,
      height,
      videoId,
      playerVars: {
        'playsinline': 1,
        'autoplay': 1,
        'rel': 0, // Don't show related videos from other channels
        'modestbranding': 1, // Minimal YouTube branding
        // REQUIRED by YouTube IFrame API for security (per official docs 2024/2025)
        // Note: Will show harmless postMessage warnings in localhost (HTTP vs HTTPS)
        // These warnings are expected and will NOT appear in production with HTTPS
        'origin': window.location.origin
      },
      events: {
        'onReady': (event: any) => {
          logger.debug(`YouTube player ready for video: ${videoId}`);
          onReady?.(event);
        },
        'onStateChange': (event: any) => {
          this.handleStateChange(event, videoId);
          onStateChange?.(event);
        },
        'onError': (event: any) => {
          logger.error(`YouTube player error for video ${videoId}:`, event.data);
          this.handleError(event, videoId);
          onError?.(event);
        }
      }
    });

    // Store player reference
    this.playersMap.set(containerId, player);

    return player;
  },

  /**
   * Handles YouTube player state changes
   */
  handleStateChange(event: any, videoId: string): void {
    const states = {
      '-1': 'unstarted',
      '0': 'ended',
      '1': 'playing',
      '2': 'paused',
      '3': 'buffering',
      '5': 'cued'
    };

    const stateName = states[event.data as keyof typeof states] || 'unknown';
    logger.debug(`YouTube player state changed: ${stateName} for video ${videoId}`);

    // Track video play event for analytics
    if (event.data === 1) { // Playing state
      this.trackVideoPlay(videoId);
    }
  },

  /**
   * Handles YouTube player errors
   */
  handleError(event: any, videoId: string): void {
    const errors = {
      '2': 'Invalid parameter value (malformed video ID)',
      '5': 'HTML5 player error',
      '100': 'Video not found, removed, or private',
      '101': 'Video not allowed in embedded players'
    };

    const errorMsg = errors[event.data as keyof typeof errors] || `Unknown error code: ${event.data}`;
    logger.error(`YouTube error for video ${videoId}: ${errorMsg}`);

    // Optionally show user-friendly error message
    this.showVideoError(videoId, errorMsg);
  },

  /**
   * Track video play event using existing analytics system
   */
  trackVideoPlay(videoId: string): void {
    // Import analytics dynamically to avoid circular dependencies
    import('../analytics/index.js').then(({ default: analytics }) => {
      analytics.track('section_engagement', {
        section: 'testimonials',
        action: 'video_play',
        video_id: videoId
      });
    }).catch(() => {
      logger.debug('Video play analytics tracking unavailable');
    });
  },

  /**
   * Shows user-friendly error message when video fails to load
   */
  showVideoError(videoId: string, errorMsg: string): void {
    const containers = document.querySelectorAll(`[data-video-id="${videoId}"]`);
    containers.forEach(container => {
      const errorDiv = document.createElement('div');
      errorDiv.className = 'absolute inset-0 flex items-center justify-center bg-black/80 text-white p-4 text-center rounded-2xl';
      errorDiv.innerHTML = `
        <div>
          <p class="text-sm mb-2">Não foi possível carregar o vídeo</p>
          <p class="text-xs opacity-75">${errorMsg}</p>
        </div>
      `;
      container.appendChild(errorDiv);
    });
  },

  /**
   * Destroys a YouTube player instance and cleans up references
   */
  destroyPlayer(containerId: string): void {
    const player = this.playersMap.get(containerId);
    if (player && typeof player.destroy === 'function') {
      try {
        player.destroy();
      } catch (error) {
        logger.warn(`Error destroying YouTube player: ${String(error)}`);
      }
    }
    this.playersMap.delete(containerId);
  },

  /**
   * Checks if the YouTube API is ready for use
   */
  isAPIReady(): boolean {
    return this.apiLoaded && typeof window.YT !== 'undefined' && window.YT.Player;
  }
};

/**
 * Convenience function to embed a YouTube video by replacing a thumbnail
 * This is the main function that will be called from the social proof component
 */
export async function embedYouTubeVideo(container: HTMLElement, videoId: string): Promise<void> {
  if (!container || !videoId) {
    logger.error('embedYouTubeVideo: Missing container or videoId');
    return;
  }

  try {
    // Get container dimensions from the current layout
    const containerRect = container.getBoundingClientRect();
    const width = containerRect.width || 640;
    const height = containerRect.height || 360;

    // Clear the container content (remove thumbnail)
    container.innerHTML = '';

    // Set container ID for tracking
    const containerId = `youtube-${videoId}`;
    container.id = containerId;

    // Create the player
    await YouTube.createPlayer({
      videoId,
      container,
      width: Math.floor(width),
      height: Math.floor(height),
      onReady: (_event) => {
        // Add any custom ready handling here
        container.classList.add('youtube-player-ready');
      },
      onStateChange: (event) => {
        // Add any custom state change handling here
        if (event.data === 1) { // Playing
          container.classList.add('youtube-playing');
        }
      }
    });

  } catch (error) {
    logger.error('Failed to embed YouTube video:', error);
    YouTube.showVideoError(videoId, 'Erro ao carregar o player do YouTube');
  }
}
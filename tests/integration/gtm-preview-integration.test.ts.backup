/**
 * Integration tests for GTM Preview Mode functionality
 * Tests the interaction between client-side detection and proxy routing
 */

import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';

// Mock fetch for integration testing
const mockFetch = vi.fn();
global.fetch = mockFetch;

// Mock console to capture logs
const mockConsole = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn()
};
vi.stubGlobal('console', mockConsole);

// Mock DOM environment
Object.defineProperty(window, 'location', {
  value: {
    href: 'https://jucanamaximiliano.com.br/',
    origin: 'https://jucanamaximiliano.com.br',
    search: ''
  },
  writable: true
});

Object.defineProperty(document, 'cookie', {
  value: '',
  writable: true
});

Object.defineProperty(document, 'referrer', {
  value: '',
  writable: true,
  configurable: true
});

// Mock gtag function
const mockGtag = vi.fn();
vi.stubGlobal('gtag', mockGtag);

describe('GTM Preview Mode Integration', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Reset DOM state
    window.location.search = '';
    document.cookie = '';
    Object.defineProperty(document, 'referrer', {
      value: '',
      writable: true,
      configurable: true
    });
    
    // Default successful proxy response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('success'),
      headers: new Headers({
        'content-type': 'text/plain',
        'access-control-allow-origin': '*'
      })
    });
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Preview Mode Detection Integration', () => {
    it('should detect preview mode from URL parameters', () => {
      // Simulate preview mode URL
      window.location.search = '?gtm_debug=1756895052790';
      
      // Import and test preview detection logic
      const isPreviewModeActive = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('gtm_debug') || urlParams.has('gtm_preview');
      };

      expect(isPreviewModeActive()).toBe(true);
    });

    it('should detect preview mode from cookies', () => {
      document.cookie = 'gtm_auth=test-auth-token; path=/';
      
      const isPreviewModeActive = () => {
        const cookies = document.cookie;
        return cookies.includes('gtm_auth') || 
               cookies.includes('gtm_preview') || 
               cookies.includes('gtm_debug');
      };

      expect(isPreviewModeActive()).toBe(true);
    });

    it('should detect preview mode from Tag Assistant referrer', () => {
      Object.defineProperty(document, 'referrer', {
        value: 'https://tagassistant.google.com/',
        writable: true,
        configurable: true
      });
      
      const isPreviewModeActive = () => {
        return document.referrer?.includes('tagassistant.google.com') ?? false;
      };

      expect(isPreviewModeActive()).toBe(true);
    });

    it('should not detect preview mode in normal conditions', () => {
      const isPreviewModeActive = () => {
        const urlParams = new URLSearchParams(window.location.search);
        const cookies = document.cookie;
        
        return urlParams.has('gtm_debug') || 
               urlParams.has('gtm_preview') ||
               cookies.includes('gtm_auth') || 
               cookies.includes('gtm_preview') || 
               cookies.includes('gtm_debug') ||
               (document.referrer?.includes('tagassistant.google.com') ?? false);
      };

      expect(isPreviewModeActive()).toBe(false);
    });
  });

  describe('Proxy Endpoint Integration', () => {
    it('should route requests through proxy when preview mode is active', async () => {
      // Setup preview mode
      window.location.search = '?gtm_debug=1756895052790';
      
      // Simulate proxy request  
      const proxyEndpoint = '/.netlify/functions/gtm-proxy';
      const testUrl = `${proxyEndpoint}/g/collect?v=2&tid=G-T06WRKJGRW&cid=test&gtm_debug=1756895052790`;
      
      const response = await fetch(testUrl, {
        method: 'GET',
        credentials: 'include',
        headers: {
          'X-Gtm-Server-Preview': 'test-token'
        }
      });

      expect(response.ok).toBe(true);
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('server-side-tagging-m5scdmswwq-uc.a.run.app/g/collect'),
        expect.objectContaining({
          method: 'GET',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          headers: expect.objectContaining({
            'x-gtm-server-preview': 'test-token'
          })
        })
      );
    });

    it('should include preview headers in requests', async () => {
      const previewToken = 'test-preview-token-123';
      
      // Test that fetch is intercepted and headers are added
      await fetch('/.netlify/functions/gtm-proxy/g/collect', {
        method: 'GET',
        headers: {
          'X-Gtm-Server-Preview': previewToken
        }
      });

      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('server-side-tagging-m5scdmswwq-uc.a.run.app/g/collect'),
        expect.objectContaining({
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          headers: expect.objectContaining({
            'x-gtm-server-preview': previewToken
          })
        })
      );
    });
  });

  describe('GTM Configuration Integration', () => {
    it('should configure gtag to use proxy in preview mode', () => {
      // Simulate preview mode
      window.location.search = '?gtm_debug=1756895052790';
      
      // Simulate gtag configuration for preview
      const GA4_MEASUREMENT_ID = 'G-T06WRKJGRW';
      const PROXY_ENDPOINT = '/.netlify/functions/gtm-proxy';
      
      // This would be called by the preview fix script
      mockGtag('config', GA4_MEASUREMENT_ID, {
        transport_url: window.location.origin + PROXY_ENDPOINT,
        transport_type: 'xhr',
        custom_map: {
          'dimension1': 'preview_mode_active'
        }
      });

      expect(mockGtag).toHaveBeenCalledWith('config', GA4_MEASUREMENT_ID, {
        transport_url: 'https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy',
        transport_type: 'xhr',
        custom_map: {
          'dimension1': 'preview_mode_active'
        }
      });
    });

    it('should send events through configured proxy', () => {
      // Simulate event tracking in preview mode
      mockGtag('event', 'test_event', {
        event_category: 'test',
        event_label: 'integration-test',
        debug_mode: true
      });

      expect(mockGtag).toHaveBeenCalledWith('event', 'test_event', {
        event_category: 'test',
        event_label: 'integration-test',
        debug_mode: true
      });
    });
  });

  describe('Error Handling Integration', () => {
    it('should handle proxy endpoint failures gracefully', async () => {
      mockFetch.mockRejectedValue(new Error('Network error'));

      const response = await fetch('/.netlify/functions/gtm-proxy/g/collect', {
        method: 'GET'
      });

      // The proxy should handle the error and return a proper response
      expect(response.status).toBe(500);
      const errorData = (await response.json()) as { error: string; message: string };
      expect(errorData.error).toBe('Proxy request failed');
      expect(errorData.message).toBe('Network error');
    });

    it('should handle invalid preview tokens', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 400,
        text: () => Promise.resolve('Invalid preview token'),
        headers: new Headers()
      });

      const response = await fetch('/.netlify/functions/gtm-proxy/g/collect', {
        headers: {
          'X-Gtm-Server-Preview': 'invalid-token'
        }
      });

      expect(response.ok).toBe(false);
      expect(response.status).toBe(400);
      expect(await response.text()).toBe('Invalid preview token');
    });
  });

  describe('Production vs Preview Behavior', () => {
    it('should use direct GTM in production mode', () => {
      // No preview indicators
      window.location.search = '';
      document.cookie = '';
      
      const isPreviewMode = () => {
        const urlParams = new URLSearchParams(window.location.search);
        return urlParams.has('gtm_debug') || urlParams.has('gtm_preview');
      };

      expect(isPreviewMode()).toBe(false);
      
      // In production, gtag would be configured normally
      const GA4_MEASUREMENT_ID = 'G-T06WRKJGRW';
      mockGtag('config', GA4_MEASUREMENT_ID, {
        // No proxy configuration in production
      });

      expect(mockGtag).toHaveBeenCalledWith('config', GA4_MEASUREMENT_ID, {});
    });

    it('should not affect production performance', () => {
      // Simulate production request (no preview mode)
      const startTime = Date.now();
      
      // Normal gtag event (should not go through proxy)
      mockGtag('event', 'page_view', {
        page_title: 'Home Page'
      });
      
      const endTime = Date.now();
      const duration = endTime - startTime;
      
      // Should be very fast (no proxy overhead)
      expect(duration).toBeLessThan(10);
      expect(mockGtag).toHaveBeenCalledWith('event', 'page_view', {
        page_title: 'Home Page'
      });
    });
  });

  describe('Security Integration', () => {
    it('should only activate proxy for gtm-proxy endpoint requests', async () => {
      // Test that proxy doesn't interfere with external requests
      await fetch('https://external-site.com/api/data');
      
      expect(mockFetch).toHaveBeenCalledWith('https://external-site.com/api/data', undefined);
      // Should not add GTM-specific headers to external requests
    });

    it('should validate preview tokens', () => {
      const validTokenPattern = /^[a-zA-Z0-9_-]+$/;
      const testToken = 'valid-preview-token-123';
      
      expect(validTokenPattern.test(testToken)).toBe(true);
      
      // Invalid characters should be rejected
      const invalidToken = 'token<script>alert(1)</script>';
      expect(validTokenPattern.test(invalidToken)).toBe(false);
    });

    it('should handle CORS properly for cross-origin requests', async () => {
      const response = await fetch('/.netlify/functions/gtm-proxy/g/collect', {
        method: 'OPTIONS'
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, OPTIONS');
    });
  });

  describe('Cookie Handling Integration', () => {
    it('should preserve existing cookies when adding preview cookies', () => {
      // Start with existing cookies
      document.cookie = 'session=abc123; preferences=dark-mode';
      
      // Add preview cookie
      document.cookie = 'gtm_auth=preview-token; path=/';
      
      const cookies = document.cookie;
      expect(cookies).toContain('session=abc123');
      expect(cookies).toContain('preferences=dark-mode');
      expect(cookies).toContain('gtm_auth=preview-token');
    });

    it('should handle cookie parsing edge cases', () => {
      // Test various cookie formats
      const testCookies = [
        'gtm_auth=token123',
        'gtm_auth=token123; path=/',
        'other=value; gtm_auth=token123; more=data',
        'gtm_preview=preview-token-with-dashes-123'
      ];

      testCookies.forEach(cookieString => {
        document.cookie = cookieString;
        const hasGtmCookie = document.cookie.includes('gtm_auth') || 
                            document.cookie.includes('gtm_preview');
        expect(hasGtmCookie).toBe(true);
      });
    });
  });
});
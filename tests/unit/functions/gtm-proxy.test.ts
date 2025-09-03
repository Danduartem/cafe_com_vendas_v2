/**
 * Unit tests for GTM Proxy Function
 * Tests the core functionality of the Server GTM preview mode fix
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import gtmProxy, { isPreviewModeRequest, buildTargetUrl, buildForwardedHeaders } from '../../../netlify/functions/gtm-proxy.js';

// Mock the shared-utils module
vi.mock('../../../netlify/functions/shared-utils.js', () => ({
  withTimeout: vi.fn().mockImplementation(async (promise: Promise<unknown>) => promise),
  SHARED_TIMEOUTS: {
    external_api: 5000
  }
}));

// Mock fetch globally
const mockFetch = vi.fn();
global.fetch = mockFetch;

describe('GTM Proxy Function', () => {
  let mockRequest: Request;

  beforeEach(() => {
    vi.clearAllMocks();
    
    mockRequest = new Request('https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect', {
      method: 'GET',
      headers: {}
    });

    // Default successful Server GTM response
    mockFetch.mockResolvedValue({
      ok: true,
      status: 200,
      text: () => Promise.resolve('success'),
      headers: new Headers([
        ['content-type', 'text/plain'],
        ['access-control-allow-origin', '*']
      ])
    });
  });

  describe('Preview Mode Detection', () => {
    it('should detect preview mode from gtm_debug parameter', () => {
      const request = new Request('https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect?gtm_debug=1756895052790');
      
      expect(isPreviewModeRequest(request)).toBe(true);
    });

    it('should detect preview mode from _dbg parameter', () => {
      const request = new Request('https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect?_dbg=1');
      
      expect(isPreviewModeRequest(request)).toBe(true);
    });

    it('should detect preview mode from X-Gtm-Server-Preview header', () => {
      const request = new Request('https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect', {
        headers: { 'x-gtm-server-preview': 'test-token' }
      });
      
      expect(isPreviewModeRequest(request)).toBe(true);
    });

    it('should detect preview mode from gtm_auth cookie', () => {
      // Mock Request object with proper header behavior
      const mockRequest = {
        url: 'https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect',
        headers: {
          get: vi.fn((name: string) => {
            if (name === 'cookie') return 'gtm_auth=test-auth; other=value';
            if (name === 'x-gtm-server-preview') return null;
            return null;
          })
        }
      } as unknown as Request;
      
      expect(isPreviewModeRequest(mockRequest)).toBe(true);
    });

    it('should detect preview mode from gtm_preview cookie', () => {
      // Mock Request object with proper header behavior
      const mockRequest = {
        url: 'https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect',
        headers: {
          get: vi.fn((name: string) => {
            if (name === 'cookie') return 'session=123; gtm_preview=test-preview';
            if (name === 'x-gtm-server-preview') return null;
            return null;
          })
        }
      } as unknown as Request;
      
      expect(isPreviewModeRequest(mockRequest)).toBe(true);
    });

    it('should not detect preview mode without any indicators', () => {
      expect(isPreviewModeRequest(mockRequest)).toBe(false);
    });
  });

  describe('URL Building', () => {
    it('should build correct URL for /g/collect endpoint', () => {
      const request = new Request('https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect?v=2&tid=G-T06WRKJGRW&cid=test-client');

      const url = buildTargetUrl(request, false);
      expect(url).toBe('https://server-side-tagging-178683125768.us-central1.run.app/g/collect?v=2&tid=G-T06WRKJGRW&cid=test-client');
    });

    it('should build correct URL for /mp/collect endpoint', () => {
      const request = new Request('https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/mp/collect?measurement_id=G-T06WRKJGRW&api_secret=test-secret');

      const url = buildTargetUrl(request, false);
      expect(url).toBe('https://server-side-tagging-178683125768.us-central1.run.app/mp/collect?measurement_id=G-T06WRKJGRW&api_secret=test-secret');
    });

    it('should handle missing query parameters', () => {
      const request = new Request('https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect');

      const url = buildTargetUrl(request, false);
      expect(url).toBe('https://server-side-tagging-178683125768.us-central1.run.app/g/collect');
    });

    it('should route to preview server when in preview mode', () => {
      const request = new Request('https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect?v=2&tid=G-T06WRKJGRW&gtm_debug=1');

      const url = buildTargetUrl(request, true);
      expect(url).toBe('https://server-side-tagging-preview-178683125768.us-central1.run.app/g/collect?v=2&tid=G-T06WRKJGRW&gtm_debug=1');
    });

    it('should route to production server when not in preview mode', () => {
      const request = new Request('https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect?v=2&tid=G-T06WRKJGRW');

      const url = buildTargetUrl(request, false);
      expect(url).toBe('https://server-side-tagging-178683125768.us-central1.run.app/g/collect?v=2&tid=G-T06WRKJGRW');
    });
  });

  describe('Header Forwarding', () => {
    it('should forward essential headers', () => {
      // Mock Request object with proper header behavior
      const mockRequest = {
        url: 'https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect',
        headers: {
          get: vi.fn((name: string) => {
            const headers: Record<string, string> = {
              'user-agent': 'Mozilla/5.0 Test Browser',
              'accept': 'text/html,application/xhtml+xml',
              'accept-language': 'en-US,en;q=0.9',
              'referer': 'https://example.com',
              'cookie': 'session=123; gtm_auth=test',
              'x-gtm-server-preview': 'preview-token'
            };
            return headers[name] || null;
          })
        }
      } as unknown as Request;

      const headers = buildForwardedHeaders(mockRequest);
      
      expect(headers['user-agent']).toBe('Mozilla/5.0 Test Browser');
      expect(headers['accept']).toBe('text/html,application/xhtml+xml');
      expect(headers['accept-language']).toBe('en-US,en;q=0.9');
      expect(headers['referer']).toBe('https://example.com');
      expect(headers['cookie']).toBe('session=123; gtm_auth=test');
      expect(headers['x-gtm-server-preview']).toBe('preview-token');
    });

    it('should set proper origin and forwarded headers', () => {
      const request = new Request('https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect');

      const headers = buildForwardedHeaders(request);
      
      expect(headers['Origin']).toBe('https://jucanamaximiliano.com.br');
      expect(headers['X-Forwarded-Proto']).toBe('https');
      expect(headers['X-Forwarded-Host']).toBe('jucanamaximiliano.com.br');
    });

    it('should handle missing headers gracefully', () => {
      const headers = buildForwardedHeaders(mockRequest);
      
      expect(headers['Origin']).toBe('https://jucanamaximiliano.com.br');
      expect(headers['X-Forwarded-Proto']).toBe('https');
      expect(headers['X-Forwarded-Host']).toBe('jucanamaximiliano.com.br');
    });
  });

  describe('CORS Handling', () => {
    it('should handle OPTIONS preflight requests', async () => {
      const request = new Request('https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect', {
        method: 'OPTIONS'
      });

      const response = await gtmProxy(request);

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('X-Gtm-Server-Preview');
      expect(await response.text()).toBe('');
    });

    it('should reject unsupported HTTP methods', async () => {
      const request = new Request('https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect', {
        method: 'DELETE'
      });

      const response = await gtmProxy(request);

      expect(response.status).toBe(405);
      expect(response.headers.get('Allow')).toBe('GET, POST, OPTIONS');
    });
  });

  describe('Request Proxying', () => {
    it('should proxy GET request to preview server when in preview mode', async () => {
      const request = new Request('https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect?v=2&tid=G-T06WRKJGRW&cid=test-client&gtm_debug=1756895052790', {
        method: 'GET',
        headers: {
          'user-agent': 'Test Browser',
          'x-gtm-server-preview': 'test-token'
        }
      });

      const response = await gtmProxy(request);

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('success');
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

      // Verify fetch was called with preview URL
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('server-side-tagging-preview-178683125768.us-central1.run.app/g/collect'),
        expect.objectContaining({
          method: 'GET',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          headers: expect.objectContaining({
            'user-agent': 'Test Browser',
            'x-gtm-server-preview': 'test-token'
          })
        })
      );
    });

    it('should proxy GET request to production server when not in preview mode', async () => {
      const request = new Request('https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect?v=2&tid=G-T06WRKJGRW&cid=test-client', {
        method: 'GET',
        headers: {
          'user-agent': 'Test Browser'
        }
      });

      const response = await gtmProxy(request);

      expect(response.status).toBe(200);
      expect(await response.text()).toBe('success');
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');

      // Verify fetch was called with production URL
      expect(mockFetch).toHaveBeenCalledWith(
        expect.stringContaining('server-side-tagging-178683125768.us-central1.run.app/g/collect'),
        expect.objectContaining({
          method: 'GET',
          // eslint-disable-next-line @typescript-eslint/no-unsafe-assignment
          headers: expect.objectContaining({
            'user-agent': 'Test Browser'
          })
        })
      );
    });

    it('should proxy POST request with body', async () => {
      const request = new Request('https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect', {
        method: 'POST',
        body: JSON.stringify({ event: 'test_event' }),
        headers: { 'content-type': 'application/json' }
      });

      await gtmProxy(request);

      expect(mockFetch).toHaveBeenCalledWith(
        expect.any(String),
        expect.objectContaining({
          method: 'POST',
          body: JSON.stringify({ event: 'test_event' })
        })
      );
    });

    it('should handle Server GTM errors', async () => {
      mockFetch.mockResolvedValue({
        ok: false,
        status: 500,
        text: () => Promise.resolve('Internal Server Error'),
        headers: new Headers()
      });

      const response = await gtmProxy(mockRequest);

      expect(response.status).toBe(500);
      expect(await response.text()).toBe('Internal Server Error');
    });

    it('should handle network errors', async () => {
      mockFetch.mockRejectedValue(new Error('Network failure'));

      const response = await gtmProxy(mockRequest);

      expect(response.status).toBe(500);
      const responseBody = JSON.parse(await response.text()) as { error: string; message: string };
      expect(responseBody.error).toBe('Proxy request failed');
      expect(responseBody.message).toBe('Network failure');
    });
  });

  describe('Preview Mode Logging', () => {
    it('should log preview mode detection', async () => {
      const consoleSpy = vi.spyOn(console, 'log');
      
      const request = new Request('https://jucanamaximiliano.com.br/.netlify/functions/gtm-proxy/g/collect?gtm_debug=1756895052790', {
        headers: { 'user-agent': 'Test Browser' }
      });

      await gtmProxy(request);

      expect(consoleSpy).toHaveBeenCalledWith(
        expect.stringContaining('[GTM Proxy] Preview mode detected'),
        expect.any(Object)
      );
    });

    it('should not log for non-preview requests', async () => {
      const consoleSpy = vi.spyOn(console, 'log');

      await gtmProxy(mockRequest);

      expect(consoleSpy).not.toHaveBeenCalledWith(
        expect.stringContaining('[GTM Proxy] Preview mode detected'),
        expect.any(Object)
      );
    });
  });

  describe('Response Headers', () => {
    it('should include proper CORS headers in response', async () => {
      const response = await gtmProxy(mockRequest);

      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('*');
      expect(response.headers.get('Access-Control-Allow-Methods')).toBe('GET, POST, OPTIONS');
      expect(response.headers.get('Access-Control-Allow-Headers')).toContain('X-Gtm-Server-Preview');
    });

    it('should forward response headers from Server GTM', async () => {
      mockFetch.mockResolvedValue({
        ok: true,
        status: 200,
        text: () => Promise.resolve('success'),
        headers: new Headers([
          ['content-type', 'application/json'],
          ['cache-control', 'no-cache'],
          ['custom-header', 'should-not-be-forwarded']
        ])
      });

      const response = await gtmProxy(mockRequest);

      expect(response.headers.get('content-type')).toBe('application/json');
      expect(response.headers.get('cache-control')).toBe('no-cache');
      expect(response.headers.get('custom-header')).toBeNull();
    });
  });
});
/**
 * GTM Proxy Function
 * 
 * Solves Server GTM preview mode issue by proxying requests through first-party domain.
 * This allows preview mode cookies to be properly included in cross-site requests.
 * 
 * Problem: Modern browsers block third-party cookies in cross-site requests,
 * preventing Server GTM preview mode from working when gtag.js sends data
 * from website domain to Server GTM container domain.
 * 
 * Solution: Route requests through our own domain to maintain first-party context.
 * 
 * Updated to follow Netlify 2025 best practices with Request/Response API.
 */

import { withTimeout, SHARED_TIMEOUTS } from './shared-utils.js';

/**
 * Server GTM container configuration
 */
const SERVER_GTM_CONFIG = {
  endpoint: 'https://server-side-tagging-m5scdmswwq-uc.a.run.app',
  paths: {
    collect: '/g/collect',
    mpCollect: '/mp/collect'
  },
  timeout: SHARED_TIMEOUTS.external_api
} as const;

/**
 * Headers that should be forwarded from client to Server GTM
 */
const FORWARDED_HEADERS = [
  'user-agent',
  'accept',
  'accept-language',
  'accept-encoding',
  'referer',
  'x-forwarded-for',
  'x-real-ip',
  'x-gtm-server-preview', // Custom preview header
  'cookie' // Important for preview mode
] as const;

/**
 * Headers that should be returned from Server GTM to client
 */
const RESPONSE_HEADERS = [
  'content-type',
  'cache-control',
  'access-control-allow-origin',
  'access-control-allow-methods',
  'access-control-allow-headers',
  'access-control-max-age'
] as const;

/**
 * Detect if this request is in preview mode
 */
function isPreviewModeRequest(request: Request): boolean {
  const url = new URL(request.url);
  const searchParams = url.searchParams;
  
  // Check for GTM debug parameter
  if (searchParams.has('gtm_debug') || searchParams.get('_dbg') === '1') {
    return true;
  }
  
  // Check for preview header
  if (request.headers.get('x-gtm-server-preview')) {
    return true;
  }
  
  // Check for preview cookies in the cookie header
  const cookies = request.headers.get('cookie') || '';
  if (cookies.includes('gtm_auth') || 
      cookies.includes('gtm_preview') || 
      cookies.includes('gtm_debug')) {
    return true;
  }
  
  return false;
}

/**
 * Build the target URL for Server GTM
 */
function buildTargetUrl(request: Request): string {
  const url = new URL(request.url);
  const pathname = url.pathname;
  
  // Determine the correct Server GTM endpoint
  let targetPath: string = SERVER_GTM_CONFIG.paths.collect; // Default to /g/collect
  
  if (pathname.includes('/mp/collect')) {
    targetPath = SERVER_GTM_CONFIG.paths.mpCollect;
  }
  
  const baseUrl = `${SERVER_GTM_CONFIG.endpoint}${targetPath}`;
  
  // Forward query parameters
  const searchParams = url.searchParams.toString();
  return searchParams ? `${baseUrl}?${searchParams}` : baseUrl;
}

/**
 * Build request headers to forward to Server GTM
 */
function buildForwardedHeaders(request: Request): Record<string, string> {
  const headers: Record<string, string> = {};
  
  // Forward essential headers
  for (const headerName of FORWARDED_HEADERS) {
    const value = request.headers.get(headerName);
    if (value) {
      headers[headerName] = value;
    }
  }
  
  // Set proper origin for Server GTM
  const url = new URL(request.url);
  headers['Origin'] = url.origin;
  
  // Add proxy identification
  headers['X-Forwarded-Proto'] = 'https';
  headers['X-Forwarded-Host'] = url.host;
  
  return headers;
}

/**
 * Build response headers to return to client
 */
function buildResponseHeaders(serverResponse: Response): Record<string, string> {
  const headers: Record<string, string> = {};
  
  // Forward response headers from Server GTM
  for (const headerName of RESPONSE_HEADERS) {
    const value = serverResponse.headers.get(headerName);
    if (value) {
      headers[headerName] = value;
    }
  }
  
  // Ensure CORS is properly configured
  headers['Access-Control-Allow-Origin'] = '*';
  headers['Access-Control-Allow-Methods'] = 'GET, POST, OPTIONS';
  headers['Access-Control-Allow-Headers'] = 'Content-Type, X-Gtm-Server-Preview, User-Agent, Referer';
  
  return headers;
}

/**
 * Main GTM proxy handler using modern Netlify Functions API
 */
export default async function gtmProxy(request: Request): Promise<Response> {
  try {
    // Handle CORS preflight requests
    if (request.method === 'OPTIONS') {
      return new Response('', {
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
          'Access-Control-Allow-Headers': 'Content-Type, X-Gtm-Server-Preview, User-Agent, Referer',
          'Access-Control-Max-Age': '86400'
        }
      });
    }
    
    // Only handle GET and POST requests
    if (!['GET', 'POST'].includes(request.method)) {
      return new Response('Method Not Allowed', {
        status: 405,
        headers: { 
          'Allow': 'GET, POST, OPTIONS',
          'Content-Type': 'text/plain'
        }
      });
    }
    
    const isPreview = isPreviewModeRequest(request);
    const targetUrl = buildTargetUrl(request);
    const forwardedHeaders = buildForwardedHeaders(request);
    
    // Log preview mode detection for debugging
    if (isPreview) {
      console.log('[GTM Proxy] Preview mode detected, forwarding request:', {
        method: request.method,
        targetUrl: targetUrl.substring(0, 100) + '...',
        hasPreviewHeader: !!request.headers.get('x-gtm-server-preview'),
        hasDebugParam: new URL(request.url).searchParams.has('gtm_debug'),
        hasCookies: !!request.headers.get('cookie')
      });
    }
    
    // Get request body for POST requests
    const requestBody = request.method === 'POST' 
      ? await request.text() 
      : undefined;
    
    // Forward the request to Server GTM
    const serverResponse = await withTimeout(
      fetch(targetUrl, {
        method: request.method,
        headers: forwardedHeaders,
        body: requestBody
      }),
      SERVER_GTM_CONFIG.timeout,
      'GTM Proxy request'
    );
    
    // Get response body
    const responseBody = await serverResponse.text();
    const responseHeaders = buildResponseHeaders(serverResponse);
    
    // Log successful proxy for preview mode
    if (isPreview) {
      console.log('[GTM Proxy] Request forwarded successfully:', {
        status: serverResponse.status,
        responseSize: responseBody.length,
        timestamp: new Date().toISOString()
      });
    }
    
    return new Response(responseBody, {
      status: serverResponse.status,
      headers: responseHeaders
    });
    
  } catch (error) {
    console.error('[GTM Proxy] Error forwarding request:', error);
    
    // Return a proper error response
    return new Response(JSON.stringify({
      error: 'Proxy request failed',
      message: error instanceof Error ? error.message : 'Unknown error',
      timestamp: new Date().toISOString()
    }), {
      status: 500,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      }
    });
  }
}

/**
 * Export utility functions for testing
 */
export { isPreviewModeRequest, buildTargetUrl, buildForwardedHeaders };
import type { RateLimitResult } from '../types';

const CANONICAL_DOMAIN = 'https://jucanamaximiliano.com.br';
const WWW_CANONICAL = 'https://www.jucanamaximiliano.com.br';

const ALLOWED_ORIGINS = new Set<string>([
  CANONICAL_DOMAIN,
  WWW_CANONICAL,
  'http://localhost:8080', // Eleventy dev
  'http://localhost:8888', // Netlify dev
]);

export function isPreviewOrigin(origin: string | null): boolean {
  if (!origin) return false;
  try {
    const host = new URL(origin).hostname;
    return host.endsWith('.netlify.app');
  } catch {
    return false;
  }
}

export function getAllowedOrigin(origin: string | null): string {
  if (origin && (ALLOWED_ORIGINS.has(origin) || isPreviewOrigin(origin))) {
    return origin;
  }
  return CANONICAL_DOMAIN;
}

export function buildCorsHeaders(origin: string | null): Record<string, string> {
  const allowOrigin = getAllowedOrigin(origin);
  return {
    'Access-Control-Allow-Origin': allowOrigin,
    'Access-Control-Allow-Headers': 'Content-Type, X-Idempotency-Key',
    'Access-Control-Allow-Methods': 'POST, OPTIONS',
    'Access-Control-Allow-Credentials': 'false',
    'Content-Type': 'application/json'
  };
}

export function attachRateLimitHeaders(
  headers: Record<string, string>,
  rate: RateLimitResult,
  config: { windowMs: number; env: 'development' | 'production' }
): Record<string, string> {
  return {
    ...headers,
    'X-RateLimit-Limit': (rate.remaining + (rate.allowed ? 1 : 0)).toString(),
    'X-RateLimit-Remaining': rate.remaining.toString(),
    'X-RateLimit-Window': (config.windowMs / 1000).toString(),
    'X-RateLimit-Environment': config.env
  };
}


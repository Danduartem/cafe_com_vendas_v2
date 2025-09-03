import { describe, it, expect } from 'vitest';
import { getAllowedOrigin, isPreviewOrigin } from '../../../netlify/functions/lib/cors.js';

describe('CORS helpers', () => {
  it('allows canonical domain', () => {
    const o = 'https://jucanamaximiliano.com.br';
    expect(getAllowedOrigin(o)).toBe(o);
  });

  it('allows www canonical domain', () => {
    const o = 'https://www.jucanamaximiliano.com.br';
    expect(getAllowedOrigin(o)).toBe(o);
  });

  it('allows localhost dev origins', () => {
    expect(getAllowedOrigin('http://localhost:8080')).toBe('http://localhost:8080');
    expect(getAllowedOrigin('http://localhost:8888')).toBe('http://localhost:8888');
  });

  it('allows Netlify preview apps', () => {
    const o = 'https://preview-123--my-site.netlify.app';
    expect(isPreviewOrigin(o)).toBe(true);
    expect(getAllowedOrigin(o)).toBe(o);
  });

  it('falls back to canonical for unknown origins', () => {
    const o = 'https://evil.example.com';
    expect(getAllowedOrigin(o)).toBe('https://jucanamaximiliano.com.br');
  });
});


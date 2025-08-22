/**
 * Test setup file for Vitest
 * Configures global test environment and utilities
 */

import { vi, beforeEach } from 'vitest';

// Mock window.dataLayer for analytics tests
Object.defineProperty(window, 'dataLayer', {
  value: [],
  writable: true,
  configurable: true
});

// Mock console methods to avoid noise in tests
const consoleMock = {
  log: vi.fn(),
  error: vi.fn(),
  warn: vi.fn(),
  info: vi.fn(),
  debug: vi.fn()
};

vi.stubGlobal('console', consoleMock);

// Reset mocks before each test
beforeEach(() => {
  vi.clearAllMocks();
  (window as unknown as { dataLayer: unknown[] }).dataLayer = [];
});
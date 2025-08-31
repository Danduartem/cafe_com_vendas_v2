/**
 * MSW Server Setup for Testing
 * Configures Mock Service Worker to intercept HTTP requests during tests
 */

import { setupServer } from 'msw/node';
import mailerliteHandlers from './mailerlite.js';
import crmHandlers from './crm.js';

// Create server instance with all integration handlers
export const server = setupServer(...mailerliteHandlers, ...crmHandlers);

import { beforeAll, afterEach, afterAll } from 'vitest';

// Test lifecycle hooks
export function setupMockServer() {
  // Start server before all tests
  beforeAll(() => {
    server.listen({ 
      onUnhandledRequest: 'bypass' // Let all unhandled requests pass through
    });
  });

  // Reset handlers between tests
  afterEach(() => {
    server.resetHandlers();
  });

  // Clean up after all tests
  afterAll(() => {
    server.close();
  });
}

// Helper to add custom handlers for specific tests
export function mockApiResponse(handler: Parameters<typeof server.use>[0]) {
  server.use(handler);
}

export default server;
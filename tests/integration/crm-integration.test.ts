/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-unsafe-call */

/**
 * Integration Tests for CRM API Endpoints
 * Tests the crm-integration Netlify function with various error scenarios
 */

import { describe, it, expect, vi, beforeEach } from 'vitest';
import { setupMockServer, mockApiResponse } from '../mocks/server.js';
import { createCustomCRMHandler, resetCRMCircuitBreaker } from '../mocks/crm.js';

// Setup MSW server
setupMockServer();

// Mock environment variables for CRM configuration
vi.stubEnv('CRM_COMPANY_ID', 'test-company-123');
vi.stubEnv('CRM_BOARD_ID', 'test-board-456');
vi.stubEnv('CRM_COLUMN_ID', 'test-column-789');
vi.stubEnv('CRM_API_URL', 'https://mocha-smoky.vercel.app/api/integrations/contact-card');

describe('CRM Integration Endpoint', () => {
  const apiUrl = 'http://localhost:8888/.netlify/functions/crm-integration';
  
  // Test data
  const validCRMData = {
    name: 'João Silva',
    phone: '+351912345678',
    amount: '180.00',
    title: 'Lead from Café com Vendas',
    obs: 'Interested in Standard ticket',
    contact_tags: ['lead', 'event-interest']
  };

  beforeEach(() => {
    resetCRMCircuitBreaker();
    vi.clearAllMocks();
  });

  describe('Successful CRM Integration', () => {
    it('should successfully send lead to CRM', async () => {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080'
        },
        body: JSON.stringify(validCRMData)
      });

      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        crm: expect.objectContaining({
          success: expect.any(Boolean),
          contactId: expect.any(String)
        }),
        circuitBreaker: expect.objectContaining({
          state: expect.stringMatching(/CLOSED|OPEN|HALF_OPEN/)
        })
      });
    });

    it('should include circuit breaker status in response', async () => {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080'
        },
        body: JSON.stringify(validCRMData)
      });

      const data = await response.json();
      
      expect(data.circuitBreaker).toBeDefined();
      expect(data.circuitBreaker).toMatchObject({
        name: 'crm-api',
        state: expect.stringMatching(/CLOSED|OPEN|HALF_OPEN/),
        failureCount: expect.any(Number),
        successCount: expect.any(Number),
        totalCalls: expect.any(Number)
      });
    });
  });

  describe('Validation and Input Errors', () => {
    it('should reject request with missing required fields', async () => {
      const invalidData = {
        // Missing required fields: name, phone, amount
        title: 'Incomplete Lead'
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080'
        },
        body: JSON.stringify(invalidData)
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data).toMatchObject({
        error: 'Validation failed',
        details: expect.arrayContaining([
          expect.stringMatching(/Missing or invalid required field: name/),
          expect.stringMatching(/Missing or invalid required field: phone/),
          expect.stringMatching(/Missing or invalid required field: amount/)
        ])
      });
    });

    it('should reject request with invalid amount format', async () => {
      const invalidAmountData = {
        ...validCRMData,
        amount: 'invalid-amount'
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080'
        },
        body: JSON.stringify(invalidAmountData)
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.details).toContainEqual('Invalid amount format (expected: "180.00")');
    });

    it('should reject request with XSS attempts', async () => {
      const xssData = {
        ...validCRMData,
        name: '<script>alert("xss")</script>',
        obs: 'javascript:alert("malicious")'
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080'
        },
        body: JSON.stringify(xssData)
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.details).toContainEqual('Request contains potentially malicious content');
    });

    it('should sanitize and validate phone numbers', async () => {
      const phoneTestData = {
        ...validCRMData,
        phone: '  +351 (912) 345-678  ' // Should be sanitized
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080'
        },
        body: JSON.stringify(phoneTestData)
      });

      // Should pass validation after sanitization
      expect(response.ok).toBe(true);
    });

    it('should reject phone numbers that are too short or too long', async () => {
      const shortPhoneData = {
        ...validCRMData,
        phone: '123'
      };

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080'
        },
        body: JSON.stringify(shortPhoneData)
      });

      expect(response.status).toBe(400);
      
      const data = await response.json();
      expect(data.details).toContainEqual(expect.stringMatching(/Phone number must be between \d+ and \d+ digits/));
    });
  });

  describe('CRM API Error Handling', () => {
    it('should handle CRM authentication errors gracefully', async () => {
      // Use custom handler for auth error
      mockApiResponse(createCustomCRMHandler('auth-error'));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080'
        },
        body: JSON.stringify(validCRMData)
      });

      // Function should still return success (non-blocking)
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        crm: expect.objectContaining({
          success: false,
          reason: expect.any(String)
        }),
        circuitBreaker: expect.objectContaining({
          state: expect.stringMatching(/CLOSED|OPEN|HALF_OPEN/)
        })
      });
    });

    it('should handle CRM rate limiting errors', async () => {
      mockApiResponse(createCustomCRMHandler('rate-limit'));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080'
        },
        body: JSON.stringify(validCRMData)
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        crm: expect.objectContaining({
          success: false,
          reason: expect.any(String)
        }),
        circuitBreaker: expect.objectContaining({
          state: expect.stringMatching(/CLOSED|OPEN|HALF_OPEN/)
        })
      });
    });

    it('should handle CRM server errors', async () => {
      mockApiResponse(createCustomCRMHandler('server-error'));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080'
        },
        body: JSON.stringify(validCRMData)
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        crm: expect.objectContaining({
          success: false,
          reason: expect.any(String)
        }),
        circuitBreaker: expect.objectContaining({
          state: expect.stringMatching(/CLOSED|OPEN|HALF_OPEN/)
        })
      });
    });

    it('should handle CRM timeout errors', async () => {
      mockApiResponse(createCustomCRMHandler('timeout'));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080'
        },
        body: JSON.stringify(validCRMData)
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        crm: expect.objectContaining({
          success: false,
          reason: expect.any(String)
        }),
        circuitBreaker: expect.objectContaining({
          state: expect.stringMatching(/CLOSED|OPEN|HALF_OPEN/)
        })
      });
    });

    it('should handle network errors', async () => {
      mockApiResponse(createCustomCRMHandler('network-error'));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080'
        },
        body: JSON.stringify(validCRMData)
      });

      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data).toMatchObject({
        success: true,
        crm: expect.objectContaining({
          success: false
        }),
        circuitBreaker: expect.objectContaining({
          state: expect.stringMatching(/CLOSED|OPEN|HALF_OPEN/)
        })
      });
    });
  });

  describe('Circuit Breaker Behavior', () => {
    it('should open circuit after multiple failures', async () => {
      mockApiResponse(createCustomCRMHandler('circuit-breaker'));

      let circuitOpened = false;

      // Simulate 5+ failures to trigger circuit breaker
      for (let i = 0; i < 6; i++) {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:8080'
          },
          body: JSON.stringify({
            ...validCRMData,
            name: `Test User ${i}`
          })
        });

        const data = await response.json();
        
        if (data.circuitBreaker.state === 'OPEN') {
          circuitOpened = true;
        }
        
        // Check if circuit breaker reason is mentioned
        if (data.crm?.reason?.includes('Circuit breaker')) {
          circuitOpened = true;
        }
      }

      expect(circuitOpened).toBe(true);
    });

    it('should include circuit breaker metrics', async () => {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080'
        },
        body: JSON.stringify(validCRMData)
      });

      const data = await response.json();
      
      expect(data.circuitBreaker).toMatchObject({
        name: 'crm-api',
        state: expect.any(String),
        failureCount: expect.any(Number),
        successCount: expect.any(Number),
        totalCalls: expect.any(Number),
        lastFailureTime: expect.anything()
      });
    });
  });

  describe('Rate Limiting', () => {
    it('should enforce rate limits per IP', async () => {
      const requests = Array(12).fill(null).map((_, i) => ({
        ...validCRMData,
        name: `User ${i}`,
        phone: `+35191234567${i}`
      }));

      let rateLimitHit = false;

      for (const requestData of requests) {
        const response = await fetch(apiUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Origin': 'http://localhost:8080',
            'X-Forwarded-For': '192.168.1.100'
          },
          body: JSON.stringify(requestData)
        });

        if (response.status === 429) {
          rateLimitHit = true;
          
          const data = await response.json();
          expect(data).toMatchObject({
            error: 'Rate limit exceeded',
            retryAfter: expect.any(Number)
          });
          
          expect(response.headers.get('Retry-After')).toBeDefined();
          break;
        }
      }

      expect(rateLimitHit).toBe(true);
    });
  });

  describe('Configuration Error Scenarios', () => {
    it('should handle missing CRM configuration gracefully', async () => {
      // Temporarily remove CRM config
      const originalConfig = {
        companyId: process.env.CRM_COMPANY_ID,
        boardId: process.env.CRM_BOARD_ID,
        columnId: process.env.CRM_COLUMN_ID
      };

      vi.stubEnv('CRM_COMPANY_ID', '');
      vi.stubEnv('CRM_BOARD_ID', '');
      vi.stubEnv('CRM_COLUMN_ID', '');

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080'
        },
        body: JSON.stringify(validCRMData)
      });

      expect(response.ok).toBe(true);
      
      const data = await response.json();
      expect(data.crm).toMatchObject({
        success: false,
        reason: 'CRM not configured'
      });

      // Restore config
      vi.stubEnv('CRM_COMPANY_ID', originalConfig.companyId);
      vi.stubEnv('CRM_BOARD_ID', originalConfig.boardId);
      vi.stubEnv('CRM_COLUMN_ID', originalConfig.columnId);
    });
  });

  describe('CORS and Security', () => {
    it('should handle CORS preflight requests', async () => {
      const response = await fetch(apiUrl, {
        method: 'OPTIONS',
        headers: {
          'Origin': 'http://localhost:8080',
          'Access-Control-Request-Method': 'POST',
          'Access-Control-Request-Headers': 'Content-Type'
        }
      });

      expect(response.status).toBe(200);
      expect(response.headers.get('Access-Control-Allow-Origin')).toBeDefined();
      expect(response.headers.get('Access-Control-Allow-Methods')).toContain('POST');
    });

    it('should reject non-POST methods', async () => {
      const methods = ['GET', 'PUT', 'DELETE', 'PATCH'];
      
      for (const method of methods) {
        const response = await fetch(apiUrl, {
          method,
          headers: {
            'Origin': 'http://localhost:8080'
          }
        });

        expect(response.status).toBe(405);
        
        const data = await response.json();
        expect(data.error).toMatch(/method not allowed/i);
      }
    });

    it('should handle unauthorized origins appropriately', async () => {
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'https://evil-site.com'
        },
        body: JSON.stringify(validCRMData)
      });

      // Should still process but with restricted CORS headers
      expect(response.headers.get('Access-Control-Allow-Origin')).toBe('https://jucanamaximiliano.com.br');
    });
  });

  describe('Non-blocking Integration Behavior', () => {
    it('should always return success even when CRM fails', async () => {
      mockApiResponse(createCustomCRMHandler('server-error'));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080'
        },
        body: JSON.stringify(validCRMData)
      });

      // Critical: Always returns 200 to not block checkout
      expect(response.ok).toBe(true);
      expect(response.status).toBe(200);
      
      const data = await response.json();
      expect(data.success).toBe(true);
    });

    it('should provide detailed CRM failure information for debugging', async () => {
      mockApiResponse(createCustomCRMHandler('server-error'));

      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Origin': 'http://localhost:8080'
        },
        body: JSON.stringify(validCRMData)
      });

      const data = await response.json();
      
      expect(data.crm).toMatchObject({
        success: false,
        reason: expect.any(String),
        recoverable: expect.any(Boolean)
      });
      
      // Should indicate whether error is recoverable
      expect(['recoverable', 'not recoverable']).toContain(data.crm.recoverable ? 'recoverable' : 'not recoverable');
    });
  });
});
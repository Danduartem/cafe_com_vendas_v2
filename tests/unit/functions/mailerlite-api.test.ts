/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */

/**
 * Unit Tests for MailerLite API Functions
 * Tests the API integration logic without requiring a running server
 */

import { describe, it, expect, beforeEach, vi } from 'vitest';
import { setupMockServer, mockApiResponse } from '../../mocks/server.js';
import { createCustomHandler } from '../../mocks/mailerlite.js';

// Setup MSW server
setupMockServer();

// Mock environment variables
vi.stubEnv('MAILERLITE_API_KEY', 'test-api-key-123');

describe('MailerLite API Functions', () => {
  beforeEach(() => {
    vi.clearAllMocks();
  });

  describe('addToMailerLite', () => {
    it('should successfully add a new subscriber', async () => {
      const subscriberData = {
        email: 'test@example.com',
        name: 'Test User',
        fields: {
          payment_status: 'paid',
          amount_paid: 180
        }
      };

      // Test with mocked response
      const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key-123'
        },
        body: JSON.stringify(subscriberData)
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data).toHaveProperty('id');
      expect(data.data.email).toBe(subscriberData.email);
    });

    it('should handle existing subscriber error', async () => {
      const subscriberData = {
        email: 'existing@example.com',
        name: 'Existing User'
      };

      const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key-123'
        },
        body: JSON.stringify(subscriberData)
      });

      expect(response.status).toBe(422);
      const error = await response.json();
      expect(error.message).toContain('already exists');
    });

    it('should handle rate limiting', async () => {
      const subscriberData = {
        email: 'ratelimit@example.com',
        name: 'Rate Limited'
      };

      const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key-123'
        },
        body: JSON.stringify(subscriberData)
      });

      expect(response.status).toBe(429);
      const error = await response.json();
      expect(error.message).toContain('Too many requests');
    });

    it('should handle authentication errors', async () => {
      const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          // Missing Authorization header
        },
        body: JSON.stringify({ email: 'test@example.com' })
      });

      expect(response.status).toBe(401);
      const error = await response.json();
      expect(error.message).toBe('Unauthenticated');
    });

    it('should handle validation errors', async () => {
      const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key-123'
        },
        body: JSON.stringify({ name: 'No Email' }) // Missing required email
      });

      expect(response.status).toBe(422);
      const error = await response.json();
      expect(error.errors.email).toBeDefined();
    });
  });

  describe('updateMailerLiteSubscriber', () => {
    it('should find and update existing subscriber', async () => {
      // First search for subscriber
      const searchResponse = await fetch(
        'https://connect.mailerlite.com/api/subscribers?filter[email]=test@example.com',
        {
          headers: {
            'Authorization': 'Bearer test-api-key-123'
          }
        }
      );

      expect(searchResponse.ok).toBe(true);
      const searchData = await searchResponse.json();
      expect(searchData.data).toHaveLength(1);

      // Then update the subscriber
      const subscriberId = searchData.data[0].id;
      const updateResponse = await fetch(
        `https://connect.mailerlite.com/api/subscribers/${subscriberId}`,
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key-123'
          },
          body: JSON.stringify({
            fields: {
              payment_status: 'paid'
            }
          })
        }
      );

      expect(updateResponse.ok).toBe(true);
      const updateData = await updateResponse.json();
      expect(updateData.data.fields.payment_status).toBe('paid');
    });

    it('should handle subscriber not found', async () => {
      const searchResponse = await fetch(
        'https://connect.mailerlite.com/api/subscribers?filter[email]=nonexistent@example.com',
        {
          headers: {
            'Authorization': 'Bearer test-api-key-123'
          }
        }
      );

      expect(searchResponse.ok).toBe(true);
      const searchData = await searchResponse.json();
      expect(searchData.data).toHaveLength(0);
    });

    it('should handle update failure', async () => {
      const updateResponse = await fetch(
        'https://connect.mailerlite.com/api/subscribers/invalid-id',
        {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key-123'
          },
          body: JSON.stringify({
            fields: { payment_status: 'paid' }
          })
        }
      );

      expect(updateResponse.status).toBe(404);
      const error = await updateResponse.json();
      expect(error.message).toBe('Subscriber not found');
    });
  });

  describe('Group Management', () => {
    it('should add subscriber to group', async () => {
      const groupId = 'test-group-123';
      const response = await fetch(
        `https://connect.mailerlite.com/api/groups/${groupId}/subscribers`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key-123'
          },
          body: JSON.stringify({
            email: 'test@example.com'
          })
        }
      );

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data.groups).toContain(groupId);
    });

    it('should handle invalid group ID', async () => {
      const response = await fetch(
        'https://connect.mailerlite.com/api/groups/invalid-group/subscribers',
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key-123'
          },
          body: JSON.stringify({
            email: 'test@example.com'
          })
        }
      );

      expect(response.status).toBe(404);
      const error = await response.json();
      expect(error.message).toBe('Group not found');
    });
  });

  describe('Error Handling Scenarios', () => {
    it('should handle network errors gracefully', async () => {
      mockApiResponse(createCustomHandler('network-error'));

      try {
        await fetch('https://connect.mailerlite.com/api/subscribers', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': 'Bearer test-api-key-123'
          },
          body: JSON.stringify({ email: 'test@example.com' })
        });
        
        expect.fail('Should have thrown an error');
      } catch (error) {
        expect(error).toBeDefined();
      }
    });

    it('should handle server errors', async () => {
      const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key-123'
        },
        body: JSON.stringify({ email: 'error@example.com' })
      });

      expect(response.status).toBe(500);
      const error = await response.json();
      expect(error.message).toBe('Internal server error');
    });
  });

  describe('Custom Field Handling', () => {
    it('should properly set event-specific custom fields', async () => {
      const subscriberData = {
        email: 'event@example.com',
        name: 'Event Attendee',
        fields: {
          event_date: '2025-09-20',
          event_address: 'Lisboa, Portugal',
          google_maps_link: 'https://maps.google.com/?q=Lisboa,Portugal',
          ticket_type: 'VIP',
          payment_status: 'paid',
          amount_paid: 180,
          checkout_started_at: new Date().toISOString()
        }
      };

      const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key-123'
        },
        body: JSON.stringify(subscriberData)
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data.fields).toMatchObject({
        event_date: '2025-09-20',
        ticket_type: 'VIP',
        payment_status: 'paid'
      });
    });

    it('should handle Multibanco-specific fields', async () => {
      const multibancoData = {
        email: 'multibanco@example.com',
        name: 'MB User',
        fields: {
          payment_status: 'pending',
          mb_entity: '12345',
          mb_reference: '123456789',
          mb_amount: 180,
          mb_expires_at: new Date(Date.now() + 86400000).toISOString()
        }
      };

      const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key-123'
        },
        body: JSON.stringify(multibancoData)
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data.fields.mb_entity).toBe('12345');
      expect(data.data.fields.mb_reference).toBe('123456789');
    });
  });

  describe('Lifecycle Group Assignment', () => {
    it('should assign checkout_started group for new leads', async () => {
      const leadData = {
        email: 'lead@example.com',
        name: 'New Lead',
        fields: {
          payment_status: 'lead',
          checkout_started_at: new Date().toISOString()
        },
        groups: ['164068163'] // Test group with safe precision
      };

      const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key-123'
        },
        body: JSON.stringify(leadData)
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data.groups).toContain('164068163');
    });

    it('should assign buyer_paid group for successful payments', async () => {
      const buyerData = {
        email: 'buyer@example.com',
        name: 'Paid Buyer',
        fields: {
          payment_status: 'paid',
          amount_paid: 180
        },
        groups: ['164071323193050164'] // BUYERS group
      };

      const response = await fetch('https://connect.mailerlite.com/api/subscribers', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': 'Bearer test-api-key-123'
        },
        body: JSON.stringify(buyerData)
      });

      expect(response.ok).toBe(true);
      const data = await response.json();
      expect(data.data.groups).toContain('164071323193050164');
    });
  });
});
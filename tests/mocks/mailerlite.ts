/* eslint-disable @typescript-eslint/no-unsafe-assignment */
/* eslint-disable @typescript-eslint/no-unsafe-member-access */
/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/restrict-template-expressions */

/**
 * MailerLite API Mock Handlers for Testing
 * Uses MSW (Mock Service Worker) to intercept and mock API calls
 */

import { http, HttpResponse } from 'msw';

// Mock subscriber data for testing
export const mockSubscriber = {
  id: 'test-subscriber-123',
  email: 'test@example.com',
  name: 'Test User',
  status: 'active',
  fields: {
    phone: '+351912345678',
    payment_status: 'lead',
    lead_id: 'test-lead-123'
  },
  groups: ['164068163344925725'],
  created_at: '2024-01-01T10:00:00Z',
  updated_at: '2024-01-01T10:00:00Z'
};

// Mock API responses
export const mockResponses = {
  // Successful subscriber creation
  subscriberCreated: {
    data: {
      id: mockSubscriber.id,
      email: mockSubscriber.email,
      status: 'active',
      source: 'api',
      subscribed_at: new Date().toISOString(),
      fields: mockSubscriber.fields,
      groups: mockSubscriber.groups
    }
  },

  // Subscriber already exists error
  subscriberExists: {
    message: 'The email address already exists.',
    errors: {
      email: ['The email address already exists.']
    }
  },

  // Validation error
  validationError: {
    message: 'The given data was invalid.',
    errors: {
      email: ['The email field is required.'],
      name: ['The name field must be a string.']
    }
  },

  // Rate limit error
  rateLimitError: {
    message: 'Too many requests',
    errors: {
      rate_limit: ['Rate limit exceeded. Please retry after 60 seconds.']
    }
  },

  // Server error
  serverError: {
    message: 'Internal server error',
    errors: {}
  },

  // Search results
  searchResults: {
    data: [mockSubscriber],
    links: {
      first: 'https://connect.mailerlite.com/api/subscribers?page=1',
      last: 'https://connect.mailerlite.com/api/subscribers?page=1',
      prev: null,
      next: null
    },
    meta: {
      current_page: 1,
      from: 1,
      last_page: 1,
      per_page: 25,
      to: 1,
      total: 1
    }
  },

  // Empty search results
  emptySearchResults: {
    data: [],
    links: {
      first: 'https://connect.mailerlite.com/api/subscribers?page=1',
      last: 'https://connect.mailerlite.com/api/subscribers?page=1',
      prev: null,
      next: null
    },
    meta: {
      current_page: 1,
      from: null,
      last_page: 1,
      per_page: 25,
      to: null,
      total: 0
    }
  },

  // Subscriber update response
  subscriberUpdated: {
    data: {
      ...mockSubscriber,
      fields: {
        ...mockSubscriber.fields,
        payment_status: 'paid',
        amount_paid: 180
      },
      updated_at: new Date().toISOString()
    }
  }
};

// MailerLite API Mock Handlers
export const mailerliteHandlers = [
  // POST /api/subscribers - Create subscriber
  http.post('https://connect.mailerlite.com/api/subscribers', async ({ request }) => {
    const authHeader = request.headers.get('Authorization');
    
    // Check authentication
    if (!authHeader?.startsWith('Bearer ')) {
      return new HttpResponse(
        JSON.stringify({ message: 'Unauthenticated' }),
        { status: 401 }
      );
    }

    const body = await request.json() as any;

    // Simulate validation errors
    if (!body.email) {
      return new HttpResponse(
        JSON.stringify(mockResponses.validationError),
        { status: 422 }
      );
    }

    // Simulate duplicate subscriber
    if (body.email === 'existing@example.com') {
      return new HttpResponse(
        JSON.stringify(mockResponses.subscriberExists),
        { status: 422 }
      );
    }

    // Simulate rate limiting
    if (body.email === 'ratelimit@example.com') {
      return new HttpResponse(
        JSON.stringify(mockResponses.rateLimitError),
        { status: 429 }
      );
    }

    // Simulate server error
    if (body.email === 'error@example.com') {
      return new HttpResponse(
        JSON.stringify(mockResponses.serverError),
        { status: 500 }
      );
    }

    // Successful creation
    return HttpResponse.json({
      data: {
        id: `subscriber-${Date.now()}`,
        email: body.email,
        name: body.name || '',
        status: body.status || 'active',
        fields: body.fields || {},
        groups: body.groups || [],
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      }
    });
  }),

  // GET /api/subscribers - Search subscribers
  http.get('https://connect.mailerlite.com/api/subscribers', ({ request }) => {
    const url = new URL(request.url);
    const emailFilter = url.searchParams.get('filter[email]');
    const authHeader = request.headers.get('Authorization');

    // Check authentication
    if (!authHeader?.startsWith('Bearer ')) {
      return new HttpResponse(
        JSON.stringify({ message: 'Unauthenticated' }),
        { status: 401 }
      );
    }

    // Return empty results for non-existent email
    if (emailFilter === 'nonexistent@example.com') {
      return HttpResponse.json(mockResponses.emptySearchResults);
    }

    // Return search results
    return HttpResponse.json(mockResponses.searchResults);
  }),

  // PUT /api/subscribers/:id - Update subscriber
  http.put('https://connect.mailerlite.com/api/subscribers/:id', async ({ params, request }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');

    // Check authentication
    if (!authHeader?.startsWith('Bearer ')) {
      return new HttpResponse(
        JSON.stringify({ message: 'Unauthenticated' }),
        { status: 401 }
      );
    }

    const body = await request.json() as any;

    // Return not found for invalid ID
    if (id === 'invalid-id') {
      return new HttpResponse(
        JSON.stringify({ message: 'Subscriber not found' }),
        { status: 404 }
      );
    }

    // Return updated subscriber
    return HttpResponse.json({
      data: {
        id: id as string,
        email: mockSubscriber.email,
        name: body.name || mockSubscriber.name,
        status: body.status || mockSubscriber.status,
        fields: { ...mockSubscriber.fields, ...body.fields },
        groups: body.groups || mockSubscriber.groups,
        updated_at: new Date().toISOString()
      }
    });
  }),

  // DELETE /api/subscribers/:id - Delete subscriber
  http.delete('https://connect.mailerlite.com/api/subscribers/:id', ({ params, request }) => {
    const { id } = params;
    const authHeader = request.headers.get('Authorization');

    // Check authentication
    if (!authHeader?.startsWith('Bearer ')) {
      return new HttpResponse(
        JSON.stringify({ message: 'Unauthenticated' }),
        { status: 401 }
      );
    }

    // Return not found for invalid ID
    if (id === 'invalid-id') {
      return new HttpResponse(
        JSON.stringify({ message: 'Subscriber not found' }),
        { status: 404 }
      );
    }

    // Successful deletion
    return new HttpResponse(null, { status: 204 });
  }),

  // POST /api/groups/:groupId/subscribers - Add subscriber to group
  http.post('https://connect.mailerlite.com/api/groups/:groupId/subscribers', async ({ params, request }) => {
    const { groupId } = params;
    const authHeader = request.headers.get('Authorization');

    // Check authentication
    if (!authHeader?.startsWith('Bearer ')) {
      return new HttpResponse(
        JSON.stringify({ message: 'Unauthenticated' }),
        { status: 401 }
      );
    }

    const body = await request.json() as any;

    // Return group not found for invalid group ID
    if (groupId === 'invalid-group') {
      return new HttpResponse(
        JSON.stringify({ message: 'Group not found' }),
        { status: 404 }
      );
    }

    // Successful addition to group
    return HttpResponse.json({
      data: {
        email: body.email,
        groups: [groupId as string],
        added_at: new Date().toISOString()
      }
    });
  })
];

// Helper to create custom handlers for specific test scenarios
export function createCustomHandler(scenario: 'timeout' | 'network-error' | 'slow-response' | 'rate-limit' | 'server-error') {
  switch (scenario) {
    case 'timeout':
      return http.post('https://connect.mailerlite.com/api/subscribers', async () => {
        // Simulate timeout by never resolving
        await new Promise(() => { /* Intentionally never resolves to simulate timeout */ });
      });
    
    case 'network-error':
      return http.post('https://connect.mailerlite.com/api/subscribers', () => {
        return HttpResponse.error();
      });
    
    case 'slow-response':
      return http.post('https://connect.mailerlite.com/api/subscribers', async () => {
        // Simulate slow response
        await new Promise(resolve => setTimeout(resolve, 3000));
        return HttpResponse.json(mockResponses.subscriberCreated);
      });

    case 'rate-limit':
      return http.post('https://connect.mailerlite.com/api/subscribers', () => {
        return new HttpResponse(
          JSON.stringify(mockResponses.rateLimitError),
          { status: 429 }
        );
      });

    case 'server-error':
      return http.post('https://connect.mailerlite.com/api/subscribers', () => {
        return new HttpResponse(
          JSON.stringify(mockResponses.serverError),
          { status: 500 }
        );
      });
    
    default:
      throw new Error(`Unknown scenario: ${scenario}`);
  }
}

// Export all handlers as default
export default mailerliteHandlers;
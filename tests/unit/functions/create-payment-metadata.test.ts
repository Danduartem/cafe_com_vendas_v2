import { describe, it, expect, vi, beforeEach } from 'vitest';

// Capture arguments passed to paymentIntents.create
const captured: { args?: Record<string, unknown> } = {};

vi.mock('stripe', () => {
  class MockStripe {
    customers = {
      list: vi.fn(() => Promise.resolve({ data: [] as unknown[] })),
      update: vi.fn((_id: string, data: Record<string, unknown>) => Promise.resolve({ id: 'cus_123', ...data })),
      create: vi.fn((data: Record<string, unknown>) => Promise.resolve({ id: 'cus_123', ...data }))
    };
    paymentIntents = {
      create: vi.fn((data: Record<string, unknown>, _opts?: unknown) => {
        captured.args = data;
        return Promise.resolve({ id: 'pi_123', client_secret: 'cs_123' });
      })
    };
  }
  return { default: MockStripe };
});

describe('create-payment-intent metadata', () => {
  beforeEach(() => {
    process.env.STRIPE_SECRET_KEY = 'sk_test_123';
  });

  it('attaches event_id and user_session_id to Stripe metadata', async () => {
    const handler = (await import('../../../netlify/functions/create-payment-intent.ts')).default as (req: Request) => Promise<Response>;

    const payload = {
      event_id: '550e8400-e29b-41d4-a716-446655440000',
      user_session_id: '550e8400-e29b-41d4-a716-446655440001',
      full_name: 'Maria Silva',
      email: 'maria@example.com',
      phone: '+351912345678',
      currency: 'eur',
      amount: 18000
    };

    const req = new Request('http://localhost/.netlify/functions/create-payment-intent', {
      method: 'POST',
      headers: new Headers({
        'content-type': 'application/json',
        'origin': 'http://localhost:8080'
      }),
      body: JSON.stringify(payload)
    });

    const res = await handler(req);
    expect(res.status).toBe(200);

    // Ensure metadata contains IDs
    const args = captured.args as Record<string, unknown>;
    expect(args).toBeTruthy();
    const metadata = (args.metadata ?? {}) as Record<string, unknown>;
    expect(metadata).toBeTruthy();
    expect(metadata.event_id).toBe(payload.event_id);
    expect(metadata.user_session_id).toBe(payload.user_session_id);
  });
});

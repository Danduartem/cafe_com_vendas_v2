import { describe, it, expect, vi, beforeEach } from 'vitest';

// Capture arguments passed to paymentIntents.create
const captured: { args?: any } = {};

vi.mock('stripe', () => {
  class MockStripe {
    customers = {
      list: vi.fn(async () => ({ data: [] })),
      update: vi.fn(async (_id: string, data: any) => ({ id: 'cus_123', ...data })),
      create: vi.fn(async (data: any) => ({ id: 'cus_123', ...data }))
    };
    paymentIntents = {
      create: vi.fn(async (data: any, _opts?: any) => {
        captured.args = data;
        return { id: 'pi_123', client_secret: 'cs_123' };
      })
    };
    constructor(_key: string) {}
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
    expect(captured.args).toBeTruthy();
    expect(captured.args.metadata).toBeTruthy();
    expect(captured.args.metadata.event_id).toBe(payload.event_id);
    expect(captured.args.metadata.user_session_id).toBe(payload.user_session_id);
  });
});

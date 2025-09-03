import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { ServerGTMClient, createServerGTMClient, sendPurchaseToGA4 } from '../../../netlify/functions/server-gtm.js';

describe('ServerGTMClient', () => {
  beforeEach(() => {
    vi.resetModules();
  });

  it('validates purchase events', () => {
    const invalid = ServerGTMClient.validatePurchaseEvent({
      // @ts-expect-error testing invalid payload
      client_id: '',
      // missing required fields
    });
    expect(invalid.valid).toBe(false);
    expect(invalid.errors.length).toBeGreaterThan(0);
  });

  it('createServerGTMClient returns null when SGTM_ENDPOINT missing', () => {
    const backup = process.env.SGTM_ENDPOINT;
    delete process.env.SGTM_ENDPOINT;
    const client = createServerGTMClient();
    expect(client).toBeNull();
    if (backup) process.env.SGTM_ENDPOINT = backup;
  });

  it('sendPurchaseToGA4 uses SGTM endpoint and returns success', async () => {
    const backup = process.env.SGTM_ENDPOINT;
    process.env.SGTM_ENDPOINT = 'https://gtm.example.com';

    const fetchSpy = vi.spyOn(globalThis, 'fetch' as unknown as keyof typeof globalThis).mockImplementation(async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = input.toString();
      expect(url).toBe('https://gtm.example.com/mp/collect');
      expect(init?.method).toBe('POST');
      expect(init?.headers).toMatchObject({ 'Content-Type': 'application/json' });
      return new Response('{}', { status: 200 });
    }) as unknown as typeof fetch;

    const result = await sendPurchaseToGA4({
      event_name: 'purchase',
      client_id: 'cid_123',
      transaction_id: 'txn_123',
      value: 100,
      currency: 'EUR',
      items: [
        { item_id: 'sku_1', item_name: 'Ticket', quantity: 1, price: 100, currency: 'EUR' }
      ]
    });

    expect(result.success).toBe(true);
    fetchSpy.mockRestore();
    if (backup) process.env.SGTM_ENDPOINT = backup; else delete process.env.SGTM_ENDPOINT;
  });
});


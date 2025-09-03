import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import {
  CustomerCacheManager,
  CUSTOMER_CACHE_TTL,
  MAX_CUSTOMER_CACHE_SIZE
} from '../../../netlify/functions/lib/customer-cache.js';

// Minimal customer factory
function createCustomer(email: string) {
  return {
    id: `cus_${Math.random().toString(36).slice(2, 10)}`,
    email
  } as unknown as import('stripe').Stripe.Customer;
}

describe('CustomerCacheManager', () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it('stores and retrieves customers within TTL', () => {
    const email = 'user@example.com';
    const customer = createCustomer(email);

    CustomerCacheManager.set(email, customer, Date.now());
    const got = CustomerCacheManager.get(email, Date.now());
    expect(got).not.toBeNull();
    expect(got?.id).toBe(customer.id);
  });

  it('expires entries after TTL', () => {
    const email = 'expire@example.com';
    const now = Date.now();
    CustomerCacheManager.set(email, createCustomer(email), now);

    vi.setSystemTime(now + CUSTOMER_CACHE_TTL + 1);
    const got = CustomerCacheManager.get(email, Date.now());
    expect(got).toBeNull();
  });

  it('does not exceed max cache size (evicts oldest)', () => {
    const base = Date.now();
    for (let i = 0; i < MAX_CUSTOMER_CACHE_SIZE + 5; i++) {
      CustomerCacheManager.set(`u${i}@example.com`, createCustomer(`u${i}@example.com`), base + i);
    }
    const stats = CustomerCacheManager.getStats();
    expect(stats.size).toBeLessThanOrEqual(MAX_CUSTOMER_CACHE_SIZE);
  });
});


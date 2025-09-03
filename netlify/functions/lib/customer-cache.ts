import Stripe from 'stripe';

interface CustomerCacheEntry {
  customer: Stripe.Customer;
  timestamp: number;
  lastAccessed: number;
}

const customerCache = new Map<string, CustomerCacheEntry>();

export const CUSTOMER_CACHE_TTL = 10 * 60 * 1000; // 10 minutes
export const MAX_CUSTOMER_CACHE_SIZE = 1000; // Maximum number of cached customers

export class CustomerCacheManager {
  static cleanExpiredEntries(now: number = Date.now()): void {
    for (const [email, entry] of customerCache.entries()) {
      if (now - entry.timestamp > CUSTOMER_CACHE_TTL) {
        customerCache.delete(email);
      }
    }
  }

  static evictOldestIfNeeded(): void {
    if (customerCache.size >= MAX_CUSTOMER_CACHE_SIZE) {
      // Remove oldest 10% of entries
      const entries = Array.from(customerCache.entries())
        .sort((a, b) => a[1].timestamp - b[1].timestamp);

      const toRemove = Math.floor(MAX_CUSTOMER_CACHE_SIZE * 0.1);
      for (let i = 0; i < toRemove && i < entries.length; i++) {
        customerCache.delete(entries[i][0]);
      }
    }
  }

  static get(email: string, now: number = Date.now()): Stripe.Customer | null {
    const entry = customerCache.get(email);
    if (!entry) return null;

    if (now - entry.timestamp > CUSTOMER_CACHE_TTL) {
      customerCache.delete(email);
      return null;
    }

    // Update access time for LRU behavior
    entry.lastAccessed = now;
    return entry.customer;
  }

  static set(email: string, customer: Stripe.Customer, now: number = Date.now()): void {
    this.cleanExpiredEntries(now);
    this.evictOldestIfNeeded();

    customerCache.set(email, {
      customer,
      timestamp: now,
      lastAccessed: now
    });
  }

  static invalidate(email: string): void {
    customerCache.delete(email);
  }

  static getStats() {
    return {
      size: customerCache.size,
      maxSize: MAX_CUSTOMER_CACHE_SIZE,
      ttl: CUSTOMER_CACHE_TTL
    };
  }
}

export default CustomerCacheManager;


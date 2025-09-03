import { describe, it, expect } from 'vitest';
import { validatePaymentRequest } from '../../../netlify/functions/lib/validation.js';
import type { PaymentIntentRequest } from '../../../netlify/functions/types.js';

function uuid() {
  return '11111111-1111-4111-8111-111111111111';
}

describe('validatePaymentRequest', () => {
  it('accepts a valid request and sanitizes data', () => {
    const payload: PaymentIntentRequest = {
      event_id: uuid(),
      user_session_id: uuid(),
      full_name: ' Maria Silva ',
      email: ' MARIA@EXAMPLE.COM ',
      phone: ' +351 912 345 678 ',
      amount: 18000,
      currency: 'EUR'
    };
    const result = validatePaymentRequest(payload);

    expect(result.isValid).toBe(true);
    expect(result.errors).toEqual([]);
    expect(result.sanitized?.full_name).toBe('Maria Silva');
    expect(result.sanitized?.email).toBe('maria@example.com');
    expect(result.sanitized?.amount).toBe(18000);
    expect(result.sanitized?.currency).toBe('eur');
  });

  it('rejects invalid email and phone', () => {
    const payload: PaymentIntentRequest = {
      event_id: uuid(),
      user_session_id: uuid(),
      full_name: 'A',
      email: 'not-an-email',
      phone: 'abc'
    };
    const result = validatePaymentRequest(payload);

    expect(result.isValid).toBe(false);
    expect(result.errors.join(' ')).toMatch(/Name must be between|Invalid email|Phone number/);
  });

  it('rejects bad currency and out-of-range amount', () => {
    const payload: PaymentIntentRequest = {
      event_id: uuid(),
      user_session_id: uuid(),
      full_name: 'Maria Silva',
      email: 'maria@example.com',
      phone: '+351912345678',
      amount: 1,
      currency: 'XYZ'
    };
    const result = validatePaymentRequest(payload);

    expect(result.isValid).toBe(false);
    expect(result.errors.some(e => e.includes('Amount must be'))).toBe(true);
    expect(result.errors.some(e => e.includes('Currency must be'))).toBe(true);
  });
});

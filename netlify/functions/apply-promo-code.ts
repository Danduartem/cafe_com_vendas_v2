/**
 * Netlify Function: Apply Promo Code to existing PaymentIntent
 * Validates a Stripe Promotion Code and updates the PaymentIntent amount safely.
 * Works with Payment Element flow where the PI is created before confirmation.
 */

import Stripe from 'stripe';
import { buildCorsHeaders } from './lib/cors.js';
import { withTimeout, SHARED_TIMEOUTS } from './shared-utils.js';

interface ApplyPromoRequest {
  payment_intent_id?: string;
  promo_code?: string;
}

export default async (request: Request): Promise<Response> => {
  const origin = request.headers.get('origin');
  const headers = buildCorsHeaders(origin);
  headers['Access-Control-Allow-Headers'] = 'Content-Type';
  headers['Access-Control-Allow-Methods'] = 'POST, OPTIONS';

  if (request.method === 'OPTIONS') {
    return new Response('', { status: 200, headers });
  }

  if (request.method !== 'POST') {
    return new Response(JSON.stringify({ error: 'Method not allowed' }), { status: 405, headers });
  }

  try {
    if (!process.env.STRIPE_SECRET_KEY) {
      throw new Error('Stripe secret key not configured');
    }

    const stripe = new Stripe(process.env.STRIPE_SECRET_KEY ?? null, {
      timeout: 30000,
      maxNetworkRetries: 2,
      telemetry: false
    });

    const body = (await request.json()) as ApplyPromoRequest;
    const paymentIntentId = (body.payment_intent_id || '').trim();
    const promoCode = (body.promo_code || '').trim();

    if (!paymentIntentId || !promoCode) {
      return new Response(JSON.stringify({ error: 'Missing payment_intent_id or promo_code' }), { status: 400, headers });
    }

    // Retrieve PaymentIntent to read current amount and currency
    const paymentIntent = await withTimeout(
      stripe.paymentIntents.retrieve(paymentIntentId),
      SHARED_TIMEOUTS.stripe_api,
      'Retrieve PaymentIntent'
    );

    if (paymentIntent.status === 'succeeded' || paymentIntent.status === 'canceled') {
      return new Response(JSON.stringify({ error: `PaymentIntent is ${paymentIntent.status}` }), { status: 400, headers });
    }

    const currency = paymentIntent.currency.toLowerCase();
    const originalAmount = paymentIntent.amount; // in cents

    // Look up active Promotion Code
    const promoList = await withTimeout(
      stripe.promotionCodes.list({ code: promoCode, active: true, limit: 1 }),
      SHARED_TIMEOUTS.stripe_api,
      'List Promotion Codes'
    );

    const promo = promoList.data[0];
    if (!promo?.coupon || promo.coupon.valid === false) {
      return new Response(JSON.stringify({ error: 'Invalid or inactive promotion code' }), { status: 400, headers });
    }

    // Validate restrictions
    const restrictions = promo.restrictions;
    if (restrictions?.minimum_amount && restrictions.minimum_amount_currency?.toLowerCase() === currency) {
      if (originalAmount < restrictions.minimum_amount) {
        return new Response(JSON.stringify({ error: 'Order amount does not meet minimum for this code' }), { status: 400, headers });
      }
    }

    // Compute discounted amount
    let discountedAmount = originalAmount;
    let discountType: 'percent' | 'amount' | 'none' = 'none';
    let discountValue = 0; // in cents

    const coupon = promo.coupon;
    if (typeof coupon.percent_off === 'number') {
      const pct = coupon.percent_off / 100;
      const calc = Math.floor(originalAmount * (1 - pct));
      discountedAmount = Math.max(50, calc); // minimum 50 cents
      discountType = 'percent';
      discountValue = originalAmount - discountedAmount;
    } else if (typeof coupon.amount_off === 'number') {
      if (!coupon.currency || coupon.currency.toLowerCase() !== currency) {
        return new Response(JSON.stringify({ error: 'Coupon currency does not match' }), { status: 400, headers });
      }
      discountedAmount = Math.max(50, originalAmount - coupon.amount_off);
      discountType = 'amount';
      discountValue = originalAmount - discountedAmount;
    } else {
      return new Response(JSON.stringify({ error: 'Unsupported coupon type' }), { status: 400, headers });
    }

    // Update PaymentIntent amount and metadata
    const newMetadata = {
      ...(paymentIntent.metadata || {}),
      coupon_code: promo.code,
      coupon_id: String(coupon.id),
      discount_type: discountType,
      discount_value: String(discountValue), // cents
      discounted_from: String(originalAmount) // cents
    } as Record<string, string>;

    const updated = await withTimeout(
      stripe.paymentIntents.update(paymentIntentId, {
        amount: discountedAmount,
        metadata: newMetadata
      }),
      SHARED_TIMEOUTS.stripe_api,
      'Update PaymentIntent amount'
    );

    return new Response(JSON.stringify({
      success: true,
      payment_intent_id: updated.id,
      client_secret: updated.client_secret,
      currency: updated.currency,
      original_amount: originalAmount,
      discounted_amount: discountedAmount,
      discount_applied: discountValue > 0,
      coupon: {
        code: promo.code,
        id: coupon.id,
        percent_off: coupon.percent_off || null,
        amount_off: coupon.amount_off || null
      }
    }), { status: 200, headers });

  } catch (error) {
    const message = error instanceof Error ? error.message : 'Unknown error';
    return new Response(JSON.stringify({ error: message }), { status: 500, headers });
  }
};

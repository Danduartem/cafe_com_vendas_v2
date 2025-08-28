/**
 * TypeScript interfaces for Stripe API responses
 * Used to replace unsafe `any` types in payment processing
 */

// Base interfaces for Stripe objects
export interface StripeMetadata {
  [key: string]: string | undefined;
  session_id?: string;
  lead_id?: string;
}

export interface StripeMultibancoDetails {
  entity: string;
  reference: string;
  expires_at?: number;
  hosted_voucher_url?: string;
}

export interface StripeNextAction {
  type: string;
  multibanco_display_details?: StripeMultibancoDetails;
  [key: string]: unknown;
}

export interface StripeCharge {
  id: string;
  amount: number;
  currency: string;
  status: string;
  metadata: StripeMetadata;
  [key: string]: unknown;
}

export interface StripePaymentIntent {
  id: string;
  status: 'requires_payment_method' | 'requires_confirmation' | 'requires_action' | 'processing' | 'requires_capture' | 'canceled' | 'succeeded';
  amount: number;
  currency: string;
  metadata: StripeMetadata;
  next_action?: StripeNextAction;
  latest_charge?: string | StripeCharge;
  client_secret: string;
  [key: string]: unknown;
}

// Type guards for safe type checking
export function isStripePaymentIntent(obj: unknown): obj is StripePaymentIntent {
  return (
    typeof obj === 'object' &&
    obj !== null &&
    'id' in obj &&
    'status' in obj &&
    'amount' in obj &&
    'currency' in obj
  );
}

export function hasMultibancoDetails(paymentIntent: StripePaymentIntent): boolean {
  return (
    paymentIntent.next_action?.type === 'multibanco_display_details' &&
    paymentIntent.next_action.multibanco_display_details !== undefined
  );
}

export function getMultibancoDetails(paymentIntent: StripePaymentIntent): StripeMultibancoDetails | null {
  if (!hasMultibancoDetails(paymentIntent)) {
    return null;
  }
  return paymentIntent.next_action!.multibanco_display_details!;
}

// Helper functions for safe property access
export function getPaymentIntentId(obj: unknown): string {
  if (isStripePaymentIntent(obj)) {
    return obj.id;
  }
  return 'unknown';
}

export function getPaymentIntentStatus(obj: unknown): string {
  if (isStripePaymentIntent(obj)) {
    return obj.status;
  }
  return 'unknown';
}

export function getPaymentIntentAmount(obj: unknown): number | undefined {
  if (isStripePaymentIntent(obj)) {
    return obj.amount;
  }
  return undefined;
}

export function getPaymentIntentMetadata(obj: unknown): StripeMetadata {
  if (isStripePaymentIntent(obj)) {
    return obj.metadata;
  }
  return {};
}
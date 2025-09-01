# 🏗️ Enhanced Integration Architecture - Implementation Roadmap

## 📋 Overview

This roadmap implements the enterprise-grade improvements identified in your architecture review, transforming your current system into a consent-first, attribution-accurate, and highly resilient platform.

## 🎯 Current vs Enhanced State

### Current State ✅
- UTM persistence in sessionStorage
- MailerLite integration at Step-1  
- Rich behavior tracking
- CRM circuit breaker protection
- Lead ID generation

### Enhanced State 🚀
- **Global event_id** propagated across all systems
- **CRM as source of truth** for all contacts
- **Server-side GTM** for accurate purchase attribution
- **Consent-first** data collection
- **Enhanced MailerLite fields** for better segmentation
- **Stripe event.id idempotency** for webhook deduplication

---

## 📅 Implementation Phases

## Phase 1: Foundation (Week 1) - Immediate Impact

### 1.1 Global Event ID System

#### Files to Modify:
- `src/utils/event-tracking.ts` (NEW)
- `src/_includes/sections/checkout/index.ts`
- `netlify/functions/mailerlite-lead.ts`
- `netlify/functions/create-payment-intent.ts`

#### Implementation:

**1.1.1 Create Event ID Utility**

```typescript
// src/utils/event-tracking.ts (NEW FILE)
export interface EventContext {
  event_id: string;
  created_at: string;
  user_session_id: string;
}

export class EventTracker {
  private static instance: EventTracker;
  private eventContext: EventContext | null = null;

  static getInstance(): EventTracker {
    if (!EventTracker.instance) {
      EventTracker.instance = new EventTracker();
    }
    return EventTracker.instance;
  }

  generateEventContext(): EventContext {
    if (this.eventContext) {
      return this.eventContext;
    }

    this.eventContext = {
      event_id: this.generateUUID(),
      created_at: new Date().toISOString(),
      user_session_id: this.getOrCreateSessionId()
    };

    return this.eventContext;
  }

  getEventId(): string | null {
    return this.eventContext?.event_id || null;
  }

  private generateUUID(): string {
    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, (c) => {
      const r = Math.random() * 16 | 0;
      const v = c === 'x' ? r : (r & 0x3 | 0x8);
      return v.toString(16);
    });
  }

  private getOrCreateSessionId(): string {
    let sessionId = sessionStorage.getItem('user_session_id');
    if (!sessionId) {
      sessionId = this.generateUUID();
      sessionStorage.setItem('user_session_id', sessionId);
    }
    return sessionId;
  }
}
```

**1.1.2 Update Checkout Component**

```typescript
// Add to checkout/index.ts in handleLeadSubmit method:

import { EventTracker } from '../../../utils/event-tracking.js';

async handleLeadSubmit(event: Event): Promise<void> {
  // ... existing code ...

  // Generate event_id at Step-1 (replaces leadId generation)
  const eventTracker = EventTracker.getInstance();
  const eventContext = eventTracker.generateEventContext();
  this.leadId = eventContext.event_id; // Keep compatibility

  const mailerlitePayload = {
    // ... existing fields ...
    
    // Add event tracking
    event_id: eventContext.event_id,
    user_session_id: eventContext.user_session_id,
    lead_created_at: eventContext.created_at,
    checkout_started_at: eventContext.created_at,
    
    // ... rest of payload
  };
}
```

### 1.2 CRM Upsert at Step-1

#### Implementation:

**1.2.1 Update Lead Capture Function**

```typescript
// netlify/functions/mailerlite-lead.ts - Add CRM call

import { sendToCRM } from './crm-integration.js'; // Import CRM function

export default async (request: Request): Promise<Response> => {
  // ... existing validation ...

  // 1. MailerLite (existing)
  const mailerliteResult = await sendToMailerLite(sanitizedPayload);

  // 2. CRM Upsert (NEW)
  const crmPayload = {
    event_id: sanitizedPayload.event_id,
    name: sanitizedPayload.full_name,
    email: sanitizedPayload.email,
    phone: sanitizedPayload.phone,
    amount: "0", // Lead stage, no payment yet
    lead_status: "lead",
    lead_created_at: sanitizedPayload.lead_created_at,
    utm_source: sanitizedPayload.utm_source,
    utm_medium: sanitizedPayload.utm_medium,
    utm_campaign: sanitizedPayload.utm_campaign,
    utm_content: sanitizedPayload.utm_content,
    utm_term: sanitizedPayload.utm_term
  };

  const crmResult = await sendToCRM(crmPayload);

  return new Response(JSON.stringify({
    success: true,
    event_id: sanitizedPayload.event_id,
    mailerlite: mailerliteResult,
    crm: {
      success: crmResult.success,
      contact_id: crmResult.contactId,
      reason: crmResult.reason
    }
  }), { status: 200, headers });
};
```

### 1.3 Enhanced MailerLite Fields

#### Implementation:

**1.3.1 Update MailerLite Types**

```typescript
// netlify/functions/types.ts - Add new fields

export interface EnhancedMailerLitePayload {
  // Existing fields...
  
  // Event tracking (NEW)
  event_id: string;
  user_session_id: string;
  lead_created_at: string;
  checkout_started_at?: string;
  
  // Payment status (NEW)
  payment_status: 'lead' | 'paid' | 'refunded';
  
  // Consent (NEW)
  marketing_consent: boolean;
  consent_method: 'modal' | 'checkbox' | 'implied';
  consent_timestamp: string;
  consent_ip: string;
  
  // CRM reference (NEW)
  crm_contact_id?: string;
}
```

---

## Phase 2: Attribution & Compliance (Week 2-3)

### 2.1 Consent Management System

#### Files to Create/Modify:
- `src/components/ui/consent-modal/` (NEW)
- `src/utils/consent-manager.ts` (NEW)
- `src/analytics/index.ts`

#### Implementation:

**2.1.1 Consent Manager Utility**

```typescript
// src/utils/consent-manager.ts (NEW FILE)
export interface ConsentData {
  marketing_consent: boolean;
  analytics_consent: boolean;
  consent_method: 'modal' | 'checkbox' | 'implied';
  consent_timestamp: string;
  consent_ip?: string;
  consent_version: string;
}

export class ConsentManager {
  private static STORAGE_KEY = 'user_consent';
  private static CONSENT_VERSION = '1.0';

  static hasConsent(): boolean {
    const consent = this.getConsent();
    return consent?.marketing_consent || false;
  }

  static getConsent(): ConsentData | null {
    const stored = localStorage.getItem(this.STORAGE_KEY);
    if (!stored) return null;
    
    try {
      return JSON.parse(stored) as ConsentData;
    } catch {
      return null;
    }
  }

  static setConsent(consent: Partial<ConsentData>): void {
    const consentData: ConsentData = {
      marketing_consent: consent.marketing_consent || false,
      analytics_consent: consent.analytics_consent || false,
      consent_method: consent.consent_method || 'modal',
      consent_timestamp: new Date().toISOString(),
      consent_version: this.CONSENT_VERSION,
      ...consent
    };

    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(consentData));

    // Dispatch event for analytics to respond
    window.dispatchEvent(new CustomEvent('consentUpdated', {
      detail: consentData
    }));
  }

  static shouldShowModal(): boolean {
    return !this.getConsent();
  }
}
```

**2.1.2 Update Analytics to Gate by Consent**

```typescript
// src/analytics/index.ts - Add consent gating

import { ConsentManager } from '../utils/consent-manager.js';

// Gate analytics initialization
export async function initializeAnalytics(): Promise<void> {
  // Listen for consent changes
  window.addEventListener('consentUpdated', (event) => {
    const consent = (event as CustomEvent).detail;
    if (consent.marketing_consent) {
      this.enableTracking();
    } else {
      this.disableTracking();
    }
  });

  // Only initialize if consent exists
  if (ConsentManager.hasConsent()) {
    await this.enableTracking();
  }
}

private async enableTracking(): Promise<void> {
  await analytics.init();
  // ... existing initialization
}

private disableTracking(): void {
  // Stop all tracking, clear dataLayer, etc.
}
```

### 2.2 Server-Side GTM Setup

#### Implementation:

**2.2.1 Create Server GTM Function**

```typescript
// netlify/functions/server-gtm.ts (NEW FILE)
import { EventTracker } from '../src/utils/event-tracking.js';

interface ServerGTMEvent {
  event_name: string;
  client_id: string;
  event_id: string;
  value?: number;
  currency?: string;
  items?: Array<{
    item_id: string;
    item_name: string;
    price: number;
    quantity: number;
  }>;
  user_data?: {
    email_address?: string;
    phone_number?: string;
  };
}

export async function sendServerGTMEvent(eventData: ServerGTMEvent): Promise<void> {
  const SGTM_ENDPOINT = process.env.SGTM_ENDPOINT;
  if (!SGTM_ENDPOINT) {
    console.warn('Server GTM endpoint not configured');
    return;
  }

  try {
    await fetch(SGTM_ENDPOINT, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        ...eventData,
        timestamp_micros: Date.now() * 1000,
      })
    });
  } catch (error) {
    console.error('Server GTM error:', error);
  }
}
```

**2.2.2 Update Webhook to Use Server GTM**

```typescript
// netlify/functions/stripe-webhook.ts - Add sGTM call

import { sendServerGTMEvent } from './server-gtm.js';

// In webhook handler after payment confirmation:
await sendServerGTMEvent({
  event_name: 'purchase',
  client_id: paymentIntent.metadata.user_session_id,
  event_id: paymentIntent.metadata.event_id,
  value: paymentIntent.amount / 100,
  currency: paymentIntent.currency,
  items: [{
    item_id: 'cafe-com-vendas-ticket',
    item_name: 'Café com Vendas - Lisbon 2025',
    price: paymentIntent.amount / 100,
    quantity: 1
  }],
  user_data: {
    email_address: await hashEmail(paymentIntent.metadata.email),
    phone_number: await hashPhone(paymentIntent.metadata.phone)
  }
});
```

### 2.3 Enhanced Stripe Metadata

#### Implementation:

```typescript
// netlify/functions/create-payment-intent.ts - Enhance metadata

export default async (request: Request): Promise<Response> => {
  // ... existing code ...

  const paymentIntent = await stripe.paymentIntents.create({
    amount: priceInCents,
    currency: 'eur',
    metadata: {
      // Event tracking (NEW)
      event_id: requestBody.event_id,
      user_session_id: requestBody.user_session_id,
      
      // Contact info
      email: requestBody.email,
      phone: requestBody.phone,
      full_name: requestBody.full_name,
      
      // CRM reference (NEW)
      crm_contact_id: requestBody.crm_contact_id,
      
      // Product info (NEW)
      product_id: 'cafe-com-vendas-ticket',
      product_name: 'Café com Vendas - Lisbon 2025',
      
      // Attribution (NEW)
      utm_source: requestBody.utm_source || '',
      utm_medium: requestBody.utm_medium || '',
      utm_campaign: requestBody.utm_campaign || '',
      utm_content: requestBody.utm_content || '',
      utm_term: requestBody.utm_term || '',
      
      // Consent (NEW)
      marketing_consent: requestBody.marketing_consent.toString(),
      consent_timestamp: requestBody.consent_timestamp
    }
  });
}
```

---

## Phase 3: Resilience (Week 4)

### 3.1 Stripe Event ID Idempotency

#### Implementation:

```typescript
// netlify/functions/stripe-webhook.ts - Use event.id

// In-memory store for processed events (consider Redis for production)
const processedEvents = new Set<string>();

export default async (request: Request): Promise<Response> => {
  // ... webhook verification ...

  const event = stripe.webhooks.constructEvent(body, signature, webhookSecret);
  
  // Idempotency check using Stripe event.id
  if (processedEvents.has(event.id)) {
    console.log(`Event ${event.id} already processed, skipping`);
    return new Response('OK', { status: 200 });
  }

  try {
    // Process event
    await handlePaymentSuccess(event);
    
    // Mark as processed
    processedEvents.add(event.id);
    
    return new Response('OK', { status: 200 });
  } catch (error) {
    // Don't mark as processed on error - allow retry
    console.error('Webhook processing failed:', error);
    return new Response('Error', { status: 500 });
  }
};
```

### 3.2 Dead Letter Queue

#### Implementation:

```typescript
// netlify/functions/dlq-handler.ts (NEW FILE)
interface FailedWebhook {
  event_id: string;
  event_type: string;
  payload: unknown;
  failed_at: string;
  retry_count: number;
  max_retries: number;
  error: string;
}

export class DeadLetterQueue {
  private static failedEvents: FailedWebhook[] = [];

  static addFailedEvent(event: FailedWebhook): void {
    this.failedEvents.push(event);
    
    // Attempt retry if under max retries
    if (event.retry_count < event.max_retries) {
      setTimeout(() => {
        this.retryEvent(event);
      }, this.calculateBackoff(event.retry_count));
    }
  }

  private static calculateBackoff(retryCount: number): number {
    // Exponential backoff: 1s, 2s, 4s, 8s, 16s
    return Math.pow(2, retryCount) * 1000;
  }

  private static async retryEvent(event: FailedWebhook): Promise<void> {
    try {
      // Attempt to reprocess the webhook
      await this.processWebhookEvent(event.payload);
      
      // Remove from failed events if successful
      this.failedEvents = this.failedEvents.filter(e => e.event_id !== event.event_id);
      
    } catch (error) {
      // Increment retry count
      event.retry_count++;
      event.error = error instanceof Error ? error.message : 'Unknown error';
      
      if (event.retry_count >= event.max_retries) {
        console.error(`Event ${event.event_id} exhausted all retries`);
        // Could send alert, log to external system, etc.
      }
    }
  }
}
```

---

## 🧪 Testing Strategy

### Phase 1 Testing
- [ ] Verify event_id generation and propagation
- [ ] Confirm CRM receives leads at Step-1
- [ ] Validate enhanced MailerLite field population

### Phase 2 Testing  
- [ ] Test consent modal flow
- [ ] Verify analytics gating by consent
- [ ] Confirm server GTM purchase events

### Phase 3 Testing
- [ ] Test webhook idempotency with duplicate events
- [ ] Verify DLQ retry mechanism
- [ ] Performance test under load

## 📊 Success Metrics

- **Attribution Accuracy**: 95%+ purchase events tracked server-side
- **Data Consistency**: event_id present in all systems
- **Consent Compliance**: 100% analytics gated by consent
- **System Resilience**: <1% webhook failures with DLQ
- **CRM Coverage**: 100% leads captured (not just payments)

## 🚨 Rollback Plan

Each phase includes rollback strategies:
- Feature flags for new functionality
- Database migrations are reversible  
- Gradual rollout with monitoring
- Ability to disable enhanced features

## 📝 Environment Variables

Add to `.env`:

```env
# Server GTM (Phase 2)
SGTM_ENDPOINT=https://your-sgtm-domain.com/collect

# Enhanced CRM (Phase 1) 
CRM_ENABLE_LEAD_CAPTURE=true

# Consent Management (Phase 2)
CONSENT_VERSION=1.0
REQUIRE_CONSENT=true

# Dead Letter Queue (Phase 3)
DLQ_MAX_RETRIES=5
DLQ_BACKOFF_MULTIPLIER=2
```

---

## 🤝 Support & Next Steps

1. **Review this roadmap** and adjust priorities based on business needs
2. **Set up staging environment** for testing each phase
3. **Configure monitoring** for new data flows
4. **Train team** on new consent and event_id patterns

This implementation transforms your architecture into an enterprise-grade system with bulletproof attribution, privacy compliance, and operational resilience.
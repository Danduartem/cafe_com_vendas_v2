# 🏗️ Café com Vendas - System Architecture

## 📊 Integration Architecture Diagrams

This directory contains the complete system architecture and integration maps for the Café com Vendas platform, showing both current state and enhanced enterprise-grade architecture.

### 📁 Files

- **`complete-integrations.mmd`** - Current system integrations (as implemented)
- **`enhanced-integrations.mmd`** - Enhanced enterprise architecture with event_id tracking, consent management, and server-side analytics
- **`IMPLEMENTATION_ROADMAP.md`** - Step-by-step guide for implementing the enhanced architecture

### 🔍 How to View the Diagram

#### Option 1: VS Code (Recommended)
1. Install the "Mermaid Preview" extension in VS Code
2. Open `complete-integrations.mmd`
3. Right-click and select "Preview Mermaid Diagram" or press `Cmd+K V`

#### Option 2: Online Viewer
1. Visit [Mermaid Live Editor](https://mermaid.live/)
2. Copy the content from `complete-integrations.mmd`
3. Paste into the editor to see the rendered diagram

#### Option 3: GitHub
- GitHub automatically renders `.mmd` files in repositories

## 🔄 Current vs Enhanced Architecture

### Current State (`complete-integrations.mmd`)
Your existing system with solid foundations:
- ✅ Webhook-driven truth from Stripe
- ✅ UTM persistence in sessionStorage  
- ✅ CRM protection (circuit breaker + rate limiting)
- ✅ MailerLite integration at Step-1
- ✅ Rich behavioral tracking

### Enhanced State (`enhanced-integrations.mmd`)
Enterprise-grade improvements for scale:
- 🆕 **Global event_id** propagated across all systems
- 🆕 **CRM as source of truth** - upserted at Step-1, not just payment
- 🆕 **Server-side GTM** - purchase events bypass ad blockers
- 🆕 **Consent-first architecture** - GDPR compliant analytics gating
- 🆕 **Enhanced MailerLite fields** - payment_status, consent data, timestamps
- 🆕 **Stripe event.id idempotency** - prevents duplicate webhooks
- 🆕 **Dead Letter Queue** - resilient webhook processing

### 🎯 Key Integration Points

## 1. 📋 Custom CRM System (Business Operations)
- **API**: `mocha-smoky.vercel.app/api/integrations/contact-card`
- **Purpose**: Deal pipeline and contact management
- **Features**:
  - Circuit breaker pattern for resilience
  - Rate limiting (10 requests/10min per IP)
  - Non-blocking architecture
  - Kanban-style board organization

## 2. 💳 Payment Processing (Stripe)
- **Flow**: Checkout Modal → Payment Intent → Webhook → CRM + Email
- **Supported Methods**: Credit Cards, Multibanco (Portugal)
- **Amount**: €180 (configured in `src/_data/site.ts`)

## 3. 📧 Email Automation (MailerLite)
- **Lifecycle Groups**:
  - `LEADS` - New signups
  - `PAID` - Completed payments
  - `WAITLIST` - Overflow registrations
  - `EVENT_ATTENDEES` - Confirmed attendees
- **Automation**: Welcome series, reminders, follow-ups

## 4. 📊 Analytics Ecosystem
- **Hub**: Google Tag Manager (GTM-T63QRLFT)
- **Platforms**: Google Analytics 4, Facebook Pixel
- **Tracking**:
  - Conversion events (`payment_completed` → `purchase`)
  - Engagement metrics (scroll depth, video progress)
  - Performance monitoring (Core Web Vitals)
  - Error tracking with deduplication

## 5. 🎥 Media Integration
- **YouTube IFrame API**: Testimonial videos with progress tracking
- **Cloudinary CDN**: Optimized image delivery
- **Google Fonts**: Typography loading

## 6. ⚡ Serverless Functions (Netlify)
```
netlify/functions/
├── create-payment-intent.ts    # Stripe payment setup
├── stripe-webhook.ts           # Payment confirmation handler
├── mailerlite-lead.ts          # Lead capture
└── crm-integration.ts          # CRM deal creation
```

## 7. 🔒 Security & Infrastructure
- **CSP Headers**: Stripe-compliant Content Security Policy
- **CORS**: Configured for production domains
- **Rate Limiting**: API protection
- **Circuit Breakers**: Failure isolation

### 🔄 Data Flow Examples

#### Purchase Flow
```
1. User clicks "Buy" → Checkout Modal opens
2. Step 1: Lead form → MailerLite API (LEADS group)
3. Step 2: Payment → Stripe Payment Elements
4. Payment success → Webhook triggered
5. Webhook updates:
   - MailerLite (LEADS → PAID group)
   - CRM (Create deal with €180 amount)
   - Analytics (purchase event)
6. User redirected → Thank You page
```

#### CRM Integration Flow
```
1. Payment webhook received
2. CRM function checks rate limits
3. Circuit breaker evaluates health
4. If healthy → Send to CRM API
5. If unhealthy → Fail silently (non-blocking)
6. Deal created in pipeline
```

### 🚨 Important Notes

1. **Non-Blocking Architecture**: CRM and email failures don't block payments
2. **Resilience Patterns**: Circuit breakers prevent cascade failures
3. **Data Consistency**: Webhook retries ensure eventual consistency
4. **Security First**: All sensitive operations in serverless functions
5. **Analytics Coverage**: Every user interaction is tracked

### 🛠️ Environment Variables

Required environment variables for integrations:

```env
# Stripe
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# MailerLite
MAILERLITE_API_KEY=eyJ0eXAi...
MAILERLITE_GROUP_ID=cafe-com-vendas

# CRM (Custom)
CRM_COMPANY_ID=...
CRM_BOARD_ID=...
CRM_COLUMN_ID=...
CRM_API_URL=https://mocha-smoky.vercel.app/api/integrations/contact-card
CRM_API_KEY=... (if required)

# Analytics
VITE_GTM_CONTAINER_ID=GTM-T63QRLFT

# Media
VITE_CLOUDINARY_CLOUD_NAME=ds4dhbneq
```

### 📈 Monitoring & Debugging

1. **Analytics Debug**: Set `ENV.isDevelopment = true` in browser console
2. **CRM Status**: Check circuit breaker status in function logs
3. **Payment Issues**: Review Stripe webhook logs in dashboard
4. **Email Delivery**: Monitor MailerLite dashboard for bounces

### 🔗 External Documentation

- [Stripe API](https://docs.stripe.com/api)
- [MailerLite API](https://developers.mailerlite.com/docs)
- [Google Tag Manager](https://developers.google.com/tag-manager)
- [YouTube IFrame API](https://developers.google.com/youtube/iframe_api_reference)
- [Netlify Functions](https://docs.netlify.com/functions/overview/)

---

## 🚀 Implementation Path

To implement the enhanced architecture:

1. **Review Enhanced Diagram**: Open `enhanced-integrations.mmd` to see the target state
2. **Follow Implementation Guide**: Use `IMPLEMENTATION_ROADMAP.md` for step-by-step instructions
3. **Phase-by-Phase Approach**: 
   - **Phase 1 (Week 1)**: Global event_id + CRM upsert at Step-1
   - **Phase 2 (Week 2-3)**: Consent management + Server-side GTM
   - **Phase 3 (Week 4)**: Idempotency + Dead Letter Queue

### 📈 Expected Benefits

- **95%+ attribution accuracy** via server-side tracking
- **100% GDPR compliance** with consent-first approach  
- **Single source of truth** for all customer data in CRM
- **Zero duplicate transactions** with proper idempotency
- **Enterprise-grade resilience** with circuit breakers and DLQ

### 🎯 Quick Wins (Can implement immediately)

1. **Global event_id**: Unifies tracking across all systems
2. **CRM lead capture**: Doubles your contact coverage
3. **Enhanced MailerLite fields**: Better segmentation and automation

---

Last Updated: January 2025
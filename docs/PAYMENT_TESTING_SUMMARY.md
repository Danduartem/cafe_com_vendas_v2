# 💳 Payment Testing — Quick Checklist

> Minimal run‑sheet for validating the checkout flow end‑to‑end in **test mode**. Card numbers and edge cases live in `docs/STRIPE_TEST_CARDS.md`. This doc avoids duplication and focuses on **what to do** and **what to verify**.

---

## 0) Scope

* Flow: **open checkout → confirm (3DS when required) → success / friendly error**
* Tech: Netlify Functions (`create-payment-intent`, `stripe-webhook`), Stripe test keys, GTM/GA4 mapping
* Event canon: push **`payment_completed`** to `dataLayer` → GTM maps to GA4 **`purchase`**

---

## 1) Before you start

* [ ] Test keys set: `.env`

  ```bash
  STRIPE_PUBLISHABLE_KEY=pk_test_...
  STRIPE_SECRET_KEY=sk_test_...
  STRIPE_WEBHOOK_SECRET=whsec_...
  ```
* [ ] Stripe **Dashboard → Test mode** toggled on
* [ ] Local dev running

  ```bash
  npm run dev
  # If functions require a local proxy, run Netlify Dev in another terminal
  # netlify dev
  ```
* [ ] Open **DevTools → Console & Network**
* [ ] Have `docs/STRIPE_TEST_CARDS.md` open for card numbers

---

## 2) Scenarios to run

* [ ] **EU / 3DS approval path** (Portugal card) → successful confirmation
* [ ] **Brazil success path** → successful confirmation
* [ ] **Multibanco delayed payment** (Portugal bank transfer) → voucher generated + async webhook
* [ ] **Decline path** (insufficient funds or generic decline) → clear error + retry possible
* [ ] **3DS challenge cancel** → user sees non‑blocking guidance and can retry
* [ ] **Mobile viewport** (≈375px) → form usable, no layout shifts
* [ ] **Optional**: Manual refund in Dashboard (verifies post‑purchase flows/receipts)

> See concrete cards & 3DS behavior in `docs/STRIPE_TEST_CARDS.md`.

---

## 3) What to expect (per scenario)

* **UI**

  * Checkout opens without blocking the page
  * 3DS modal shows when required; success returns to app
  * On error, user‑friendly message (no raw Stripe codes) + retry CTA
* **Analytics**

  * On success, site pushes to `dataLayer`:

    ```json
    {
      "event": "payment_completed",
      "transaction_id": "pi_...",
      "value": 180,
      "currency": "EUR",
      "items": [{ "item_id": "SKU_CCV_PT_2025", "quantity": 1 }],
      "pricing_tier": "early_bird"
    }
    ```
  * GTM maps **`payment_completed` → GA4 `purchase`**
* **Backend**

  * `payment_intent.succeeded` received by `stripe-webhook`
  * For Multibanco: `checkout.session.async_payment_succeeded` received
  * No unhandled errors in function logs

---

## 4) How to verify quickly

### A) Stripe Dashboard

* **Payments**: intent shows `Succeeded` (or relevant failure)
* **Developers → Webhooks**: deliveries to your endpoint are **2xx**

### B) Local logs

* **Create PI** function prints request + amount (no secrets)
* **Webhook** function logs `payment_intent.succeeded` with the PI id

### C) GTM / GA4

* **GTM Preview**: event `payment_completed` fires with payload above
* **GA4 Realtime**: event **`purchase`** appears with matching `transaction_id` and value

---

## 5) Success criteria (pass/fail)

* ✅ 3DS flows complete; cancel shows recoverable UI
* ✅ `payment_completed` fired once per successful purchase
* ✅ GA4 `purchase` received with `transaction_id`, `value`, `currency`, `items`
* ✅ Webhook processed `payment_intent.succeeded` with **2xx**
* ✅ Mobile form is usable; no major CLS; no console errors

---

## 6) Troubleshooting

* **No `purchase` in GA4** → check GTM trigger for `payment_completed`; confirm GA4 event name is `purchase`
* **Webhook 400/401** → verify `STRIPE_WEBHOOK_SECRET` and endpoint path in Netlify/Stripe settings
* **3DS hangs** → ensure you’re in **Test mode** and using the correct 3DS card
* **Duplicate analytics** → ensure the `payment_completed` push happens **after** confirmation and only once

---

## 7) Links

* Cards & 3DS: `docs/STRIPE_TEST_CARDS.md`
* GTM setup & configuration: `docs/SETUP.md` (Third-Party Integrations section)

---

## 8) Multibanco-specific testing

### ⚠️ **IMPORTANT: Use Netlify Dev Environment**
Multibanco testing requires the full backend integration. Always use:
```bash
npm run netlify:dev  # Port 8888 (NOT port 8080)
```

### A) Stripe Dashboard Configuration
1. **Enable Multibanco**: Payment methods → Enable Multibanco
2. **Verify webhook endpoints**: Ensure both events are configured:
   - `checkout.session.completed` (immediate processing)
   - `checkout.session.async_payment_succeeded` (delayed completion)
3. **Test webhook delivery**: Use Stripe CLI to monitor webhook events

### B) Complete Multibanco Test Workflow

#### Step 1: Initiate Payment
1. Open checkout modal on `localhost:8888`
2. Fill lead form with test data
3. Select **Multibanco** as payment method
4. Submit payment form

#### Step 2: Verify Immediate Processing
- ✅ Modal shows "Referência Multibanco gerada!"
- ✅ Entity and reference numbers are displayed
- ✅ `checkout.session.completed` webhook fires (check Stripe CLI)
- ✅ Redirect to `/thank-you` with Multibanco parameters
- ✅ Thank-you page shows pending payment instructions

#### Step 3: Simulate Payment Completion
1. **In Stripe Dashboard**: Go to Payments → Find the processing payment
2. **Manual completion**: Click "Simulate completion" or use test webhook
3. **Webhook verification**: `checkout.session.async_payment_succeeded` should fire
4. **MailerLite integration**: Customer should be added with `paid` status

#### Step 4: Verify Final State
- ✅ Webhook logs show successful fulfillment
- ✅ No duplicate processing (idempotency check)
- ✅ Customer receives confirmation email
- ✅ Analytics events fire correctly

### C) Expected Webhook Sequence
```
1. checkout.session.completed (status: processing)
   → Customer added to MailerLite with "pending_payment"
   → Voucher instructions email sent
   
2. checkout.session.async_payment_succeeded (status: paid)
   → Customer updated to "paid" status
   → Fulfillment triggers
   → Confirmation email sent
```

### D) Common Issues & Solutions

**Issue**: "Price mismatch" in thank-you page
- **Solution**: Verify centralized pricing in `src/_data/site.ts`
- **Check**: All components use `basePrice` from site data

**Issue**: Webhook not firing
- **Solution**: Verify Netlify dev server is running on port 8888
- **Check**: Stripe webhook secret is configured in `.env`

**Issue**: Duplicate fulfillment
- **Solution**: Check fulfillment tracking logs
- **Verify**: Idempotency keys are working correctly

**Issue**: Missing Multibanco details
- **Solution**: Check `next_action.multibanco_display_details` in payment intent
- **Fallback**: Generic pending payment message should display

### E) Manual Test Checklist

**Multibanco Flow** ✅
- [ ] Payment modal opens without errors
- [ ] Multibanco option appears for Portuguese customers
- [ ] Voucher details display correctly (entity + reference)
- [ ] Redirect includes all necessary URL parameters
- [ ] Thank-you page shows appropriate pending state
- [ ] Webhook sequence completes successfully
- [ ] Final fulfillment triggers without duplicates
- [ ] Customer receives both instruction and confirmation emails

**Error Handling** ✅
- [ ] Missing voucher details show generic pending message
- [ ] Failed payments display retry options
- [ ] Network errors don't break the user experience
- [ ] Webhook failures don't prevent duplicate processing

**Analytics Tracking** ✅
- [ ] `payment_processing` event fires on Multibanco initiation
- [ ] `payment_completed` event fires only after async success
- [ ] Lead ID and payment method are tracked correctly

---

## 9) Development Environment Setup

### Required Environment Variables
```bash
# .env (ensure these are configured)
STRIPE_SECRET_KEY=sk_test_...
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_WEBHOOK_SECRET=whsec_... # From Stripe CLI or webhook endpoint
MAILERLITE_API_KEY=your_api_key # For fulfillment testing
```

### Stripe CLI Setup
```bash
# Terminal 1: Start development server
npm run netlify:dev

# Terminal 2: Forward webhooks to local server
stripe listen --forward-to localhost:8888/.netlify/functions/stripe-webhook
```

### Browser DevTools Debugging

**Console logs to monitor**:
- `Payment processing initiated` (checkout component)
- `Multibanco payment detected` (thank-you component)
- `Webhook received` (Netlify function logs)
- Analytics events in `dataLayer`

**Network tab verification**:
- Payment intent creation: `POST /.netlify/functions/create-payment-intent`
- Webhook delivery: `POST /.netlify/functions/stripe-webhook`
- MailerLite integration: `POST https://connect.mailerlite.com/api/subscribers`

## 10) Notes for contributors

* **Always test Multibanco on port 8888** - port 8080 lacks backend integration
* Keep this page a **checklist**, not a card database—add new cards only to `STRIPE_TEST_CARDS.md`
* If you change event names or payloads, update the GTM docs **in the same PR**
* For Multibanco changes, test both immediate voucher generation and delayed confirmation
* **Price changes**: Update only `basePrice` in `src/_data/site.ts` - all components inherit from this

---

*Last updated: 2025-08-28*

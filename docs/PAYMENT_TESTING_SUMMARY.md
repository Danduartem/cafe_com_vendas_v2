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

## 8) Notes for contributors

* Keep this page a **checklist**, not a card database—add new cards only to `STRIPE_TEST_CARDS.md`
* If you change event names or payloads, update the GTM docs **in the same PR**

---

*Last updated: 2025-08-25*

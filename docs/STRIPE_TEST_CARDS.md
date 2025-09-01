# 💳 Stripe Test Cards — Café com Vendas (Test Mode)

> **Minimal, copy‑paste friendly.** Use these in **test mode** only. Pair with `PAYMENT_TESTING_SUMMARY.md` for the checklist and success criteria.

---

## TL;DR (most used)

* **Global success (Visa)**: `4242 4242 4242 4242`
  Use any future expiry (e.g., `12/34`), any CVC (e.g., `123`).
* **Portugal / EU — requires 3DS**: `4000 0062 0000 0007`
  Triggers authentication challenge (3D Secure). Approve to simulate a real EU flow.
* **Brazil success (Visa BR)**: `4000 0007 6000 0002`
* **Decline (generic)**: `4000 0000 0000 0002`
* **Decline (insufficient funds)**: `4000 0000 0000 9995`

> These cover 95% of our tests: success + EU 3DS + BR + two failure paths.

## 🏦 Multibanco (Portugal Bank Transfer)

**Payment Method**: Multibanco (appears automatically for Portuguese customers)
**Currency**: EUR only
**Behavior**: Generates voucher with entity/reference numbers; payment confirmed via bank transfer (can take several days)

**What to verify**:
* Customer receives voucher with entity and reference numbers
* `checkout.session.async_payment_succeeded` webhook fires when payment completes
* MailerLite integration triggers on delayed payment success
* Order fulfillment waits for async payment confirmation

> **Note**: Multibanco testing requires using Stripe's test environment. The payment shows as "processing" until manually completed in Stripe Dashboard.

---

## How to use (Payment Element)

1. Open the checkout in **test mode**.
2. Paste a number above, set a **future expiry** (`MM/YY`) and any **CVC** (`3 digits`).
3. Complete the flow:

   * For **3DS** cards, approve or cancel the challenge to test both outcomes.
   * On success, ensure we push `payment_completed` to `dataLayer` + server-side GTM tracking (enhanced plugin system maps to GA4 `purchase` with attribution).

> Need the exact run‑sheet? See `docs/PAYMENT_TESTING_SUMMARY.md`.

---

## EU 3D Secure (Portugal)

**Card**: `4000 0062 0000 0007`
**Behavior**: Always requires a 3DS challenge.
**What to verify**:

* Challenge appears and completes; user returns to our page in a success state.
* Cancel path shows a friendly, recoverable UI and allows retry.
* On success only, `payment_completed` is pushed once.

---

## Brazil Flow (success)

**Card**: `4000 0007 6000 0002`
**Behavior**: Authorizes and captures without 3DS.
**Verify**: Success UI, webhook `payment_intent.succeeded`, GA4 `purchase`.

---

## Global Success (no 3DS)

**Card**: `4242 4242 4242 4242`
**Behavior**: Straight success; useful for happy‑path regression.

---

## Common Fails (simulate error UI)

* **Generic decline** → `4000 0000 0000 0002`
  Expect a clear error message and a visible retry CTA.
* **Insufficient funds** → `4000 0000 0000 9995`
  Same handling as above; ensure analytics **does not** fire on failure (plugin system includes error tracking for debugging).

> Keep failure handling **polite** and **actionable**. Do not surface raw Stripe error codes to users.

---

## Notes

* Use **future** expiry dates (e.g., `12/34`) and any 3‑digit CVC unless a scenario needs otherwise.
* These numbers are **test only**; never use real card data during development.
* For additional edge cases (incorrect CVC, processing error, etc.), extend locally as needed—avoid bloating this doc.

---

*Last updated: 2025-08-25*

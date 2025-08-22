# Security Best Practices — Café com Vendas

> Canonical, **minimal** security baseline for this repo. Matches our rules: **TypeScript‑only**, **Tailwind‑only**, **no inline styles/handlers**, analytics via **GTM → GA4** (typed), and **lazy‑loaded** third‑party.

---

## TL;DR (what to actually do)

* ✅ **No inline scripts or styles**. Use TS modules and Tailwind classes only.
* ✅ **Strict CSP** headers; whitelist Stripe + GTM domains; prefer **nonce‑based** loading over `'unsafe-inline'`.
* ✅ **Client never sees secrets** (Stripe **secret key** stays server‑side only).
* ✅ **Sanitize** any HTML you must inject; otherwise prefer `textContent`.
* ✅ **Load third‑party only on intent** (e.g., load `stripe.js` at checkout open).
* ✅ **Lock dependencies** (`npm ci`), keep versions current, avoid `eval`/`new Function`.

---

## 1) Content Security Policy (CSP)

### Recommended CSP (strict, production)

Add these headers at the edge (Netlify) for all pages. Adjust GA/GTM domains if needed.

```
Content-Security-Policy: \
  default-src 'self'; \
  base-uri 'none'; \
  object-src 'none'; \
  frame-ancestors 'none'; \
  img-src 'self' data: https:; \
  style-src 'self'; \
  font-src 'self' data:; \
  script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com; \
  connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://api.stripe.com https://o.stripe.com; \
  frame-src https://js.stripe.com; \
  form-action 'self';
```

> If you bootstrap GTM with the **default inline snippet**, you must either: (a) add a **nonce** to that inline script and use `script-src 'self' 'nonce-<value>' ...`, or (b) allow `'unsafe-inline'` for scripts (not recommended). This repo prefers **nonced** loading and **no inline** code.

### Netlify headers example (`netlify/_headers`)

```
/*
  Content-Security-Policy: default-src 'self'; base-uri 'none'; object-src 'none'; frame-ancestors 'none'; img-src 'self' data: https:; style-src 'self'; font-src 'self' data:; script-src 'self' https://www.googletagmanager.com https://www.google-analytics.com https://js.stripe.com; connect-src 'self' https://www.google-analytics.com https://www.googletagmanager.com https://api.stripe.com https://o.stripe.com; frame-src https://js.stripe.com; form-action 'self'
  Referrer-Policy: strict-origin-when-cross-origin
  Permissions-Policy: geolocation=(), microphone=(), camera=(), interest-cohort=()
  X-Content-Type-Options: nosniff
  X-Frame-Options: DENY
```

> If you need a **nonce‑based** approach, wire it via an Edge Function that sets a per‑request nonce in headers/HTML and adds `script-src 'nonce-…'`. Keep this doc minimal: implement only if you keep GTM inline.

---

## 2) Stripe (secure usage)

* **Secret key** (`STRIPE_SECRET_KEY`) only in server context (Netlify Functions). Never expose to client.
* **Publishable key** (`STRIPE_PUBLISHABLE_KEY`) may be used in the browser.
* **Load `https://js.stripe.com/v3/` lazily** on checkout open; never on first paint.
* Create **Payment Intents** server‑side; **confirm** client‑side using the Payment Element; handle 3DS as needed.
* Verify **webhooks** with `STRIPE_WEBHOOK_SECRET`; respond **2xx** quickly.

---

## 3) DOM, Inputs & Sanitization

* Prefer **`textContent`** over `innerHTML` for user‑visible strings.
* If HTML insertion is required, use a small allowlist sanitizer (tags/attrs you explicitly permit).
* Validate all inputs server‑side (length, type, format); reject unexpected fields.
* For links with `target="_blank"`, add `rel="noopener noreferrer"`.

**Tiny helper (TS)**

```ts
export function safeSetText(el: Element | null, value: unknown): void {
  if (!el) return;
  el.textContent = String(value ?? '');
}
```

---

## 4) Third‑party & Analytics

* **No raw `gtag()`** calls in templates; use the **typed analytics helper** → `dataLayer` → GTM → GA4.
* Canonical purchase mapping: **`payment_completed`** (dataLayer) → GA4 **`purchase`**.
* Avoid unneeded SDKs; prefer platform APIs (Fetch, DOM, Intl) first.

---

## 5) Dependencies & Build

* Use `npm ci` in CI to ensure a reproducible tree; commit `package-lock.json`.
* Keep libraries updated (see `VERSION_AWARENESS.md`); avoid deprecated APIs.
* Do **not** use `eval`, `new Function`, or dynamic script strings.
* Treat warnings as errors in CI for type/lint.

---

## 6) Environment & Secrets

* Keep secrets in environment variables (Netlify Site settings). Never commit `.env`.
* In client code, read only **non‑secret** vars via Vite’s `import.meta.env.*` (or your ENV bridge); never expose server secrets.

---

## 7) Clickjacking & Forms

* Block framing site‑wide (`X-Frame-Options: DENY` and `frame-ancestors 'none'`).
* `form-action 'self'` in CSP to limit where forms can submit.

---

## 8) Minimal PR security checklist

* [ ] No inline scripts/styles added
* [ ] CSP allowlist unchanged or reduced; any additions justified
* [ ] Stripe keys handled correctly (secret server‑side only)
* [ ] Inputs validated/sanitized where needed; no unsafe `innerHTML`
* [ ] Third‑party loaded lazily; no heavy SDKs by default
* [ ] `payment_completed` → GA4 `purchase` contract preserved

---

*Last updated: 2025‑08‑22*

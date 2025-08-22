# Development Guidelines — Café com Vendas

> Pragmatic, **minimal** patterns for day‑to‑day coding. Canonical rules live in `coding-standards.md`; accessibility details live in `ACCESSIBILITY_GUIDELINES.md`. This file shows **how** to implement features the repo’s way: **TypeScript‑first**, **Tailwind‑only**, **ESM imports use `.js`**.

---

## TL;DR

* **TS‑only** sources; imports use **`.js`** in specifiers (ESM TS emit).
* **No inline styles/handlers** — state via Tailwind classes + `classList`.
* **A11y first** — semantic HTML, keyboard support, ARIA only when needed.
* **Perf** — lazy‑load third‑party, responsive images (Cloudinary), small bundles.
* **Analytics** — push normalized events; dataLayer event **`payment_completed` → GA4 `purchase`**.
* **Keep diffs small and verifiable** — run type/lint/tests before commit.

---

## 1) New Section Pattern (template + logic)

### Template (`src/_includes/sections/hero/index.njk`)

```njk
<section id="hero" class="relative isolate py-20 lg:py-28" aria-label="Hero">
  <div class="container mx-auto px-4">
    <h1 class="text-balance text-4xl/tight lg:text-6xl font-semibold">
      Café com Vendas — Lisboa
    </h1>
    <p class="mt-4 max-w-prose text-lg opacity-90">
      Escala o teu negócio sem burnout.
    </p>
    <div class="mt-8 flex gap-3">
      <a href="#s-offer" class="btn btn-primary" data-analytics-event="cta_primary">Quero participar</a>
      <button type="button" class="btn btn-ghost" data-reveal id="learn-more">Saber mais</button>
    </div>
  </div>
</section>
```

### Logic (`src/_includes/sections/hero/index.ts`)

```ts
// Note: imports keep `.js` extensions in this repo
import { q } from '../../../assets/js/lib/dom.js';
import { track } from '../../../assets/js/core/analytics.js';

export const HeroSection = {
  init(): void {
    const btn = q<HTMLButtonElement>('#learn-more');
    btn?.addEventListener('click', () => {
      document.getElementById('problem')?.scrollIntoView({ behavior: 'smooth' });
      track('checkout_opened', { source: 'hero' }); // example engagement
    });
  }
};
```

> Place each new section under `src/_includes/sections/<name>/{index.njk,index.ts}`. Keep the template semantic; do not add inline `onclick` or styles.

---

## 2) Components (platform UI)

### Accessible accordion (`src/platform/ui/components/accordion.ts`)

```ts
export class Accordion {
  constructor(private root: HTMLElement) {}

  init(): void {
    this.root.addEventListener('click', (e: Event) => {
      const t = e.target as HTMLElement | null;
      if (t?.matches('[data-accordion-trigger]')) this.toggle(t);
    });
  }

  private toggle(trigger: HTMLElement): void {
    const panel = trigger.nextElementSibling as HTMLElement | null;
    if (!panel) return;
    const expanded = trigger.getAttribute('aria-expanded') === 'true';
    trigger.setAttribute('aria-expanded', (!expanded).toString());
    panel.classList.toggle('hidden'); // Tailwind-only state change
  }
}
```

**Template usage**

```njk
<div data-accordion>
  <button type="button" data-accordion-trigger aria-expanded="false"
          class="w-full text-left py-3">Pergunta</button>
  <div class="hidden" role="region">Resposta…</div>
</div>
```

> Keyboard model: Enter/Space toggles; focus ring via Tailwind (`focus:ring-4`). See full patterns in `ACCESSIBILITY_GUIDELINES.md`.

---

## 3) Forms (validation, a11y, submit)

```njk
<form id="lead-form" novalidate class="space-y-4">
  <label class="block">
    <span class="block">Email</span>
    <input type="email" name="email" autocomplete="email" required
           class="input" aria-describedby="email-error" />
  </label>
  <div id="email-error" role="alert" aria-live="polite" class="sr-only"></div>
  <button type="submit" class="btn btn-primary">Quero saber mais</button>
</form>
```

```ts
import { q } from '../../assets/js/lib/dom.js';
import { track } from '../../assets/js/core/analytics.js';

export function initLeadForm(): void {
  const form = q<HTMLFormElement>('#lead-form');
  form?.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fd = new FormData(form);
    const email = String(fd.get('email') || '').trim();

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      showError('email-error', 'Introduza um e-mail válido.');
      form.querySelector<HTMLInputElement>('input[name=email]')?.setAttribute('aria-invalid', 'true');
      return;
    }

    try {
      // Example: Netlify Function that writes to MailerLite/CRM
      const res = await fetch('/.netlify/functions/mailerlite-lead', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email })
      });
      if (!res.ok) throw new Error('Network error');
      track('lead_form_submitted', { source_section: 'hero' });
      // UX: show success state / navigate to thank-you
    } catch (err) {
      showError('email-error', 'Não foi possível enviar. Tente novamente.');
    }
  });
}

function showError(id: string, msg: string): void {
  const el = document.getElementById(id);
  if (!el) return;
  el.classList.remove('sr-only');
  el.textContent = msg;
}
```

> Always label inputs, announce errors politely, and avoid color‑only cues.

---

## 4) Lazy‑load third‑party (Stripe example)

```ts
export const Checkout = {
  stripeLoaded: false as boolean,
  loadPromise: null as Promise<void> | null,

  async ensureStripe(): Promise<void> {
    if (this.stripeLoaded) return;
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      const s = document.createElement('script');
      s.src = 'https://js.stripe.com/v3/';
      s.async = true;
      s.onload = () => { this.stripeLoaded = true; resolve(); };
      s.onerror = () => reject(new Error('Failed to load Stripe'));
      document.head.appendChild(s);
    });

    return this.loadPromise;
  },

  async open(): Promise<void> {
    await this.ensureStripe();
    // continue with modal/Payment Intent fetch
  }
};
```

> Only load Stripe when the user shows purchase intent (CTA → checkout). This keeps initial JS small and improves LCP/FID.

---

## 5) Reveal animations (IntersectionObserver)

```ts
export function initReveal(root: ParentNode = document): void {
  const els = Array.from(root.querySelectorAll<HTMLElement>('[data-reveal]'));
  if (!els.length) return;

  els.forEach((el) => el.classList.add('opacity-0', 'translate-y-2'));

  const io = new IntersectionObserver((entries) => {
    for (const e of entries) if (e.isIntersecting) {
      e.target.classList.remove('opacity-0', 'translate-y-2');
      e.target.classList.add('opacity-100', 'translate-y-0', 'transition-all', 'duration-300');
      io.unobserve(e.target);
    }
  }, { threshold: 0.1, rootMargin: '0px 0px -50px 0px' });

  els.forEach((el) => io.observe(el));
}
```

> Add `motion-reduce:transition-none motion-reduce:transform-none` classes where appropriate. Do not use inline styles or keyframes here.

---

## 6) Analytics (typed + normalized)

```ts
// Minimal, repo-aligned wrapper
type EventName =
  | 'gtm_init'
  | 'checkout_opened'
  | 'payment_completed'
  | 'lead_form_submitted'
  | 'faq_toggle'
  | 'faq_meaningful_engagement'
  | 'scroll_depth'
  | 'video_play';

function normalize(v: unknown): unknown {
  if (typeof v !== 'string') return v;
  return v.toLowerCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_\- ]+/g, '')
    .slice(0, 50)
    .trim() || 'other';
}

export function track(name: EventName, payload: Record<string, unknown> = {}): void {
  const norm = Object.fromEntries(Object.entries(payload).map(([k, v]) => [k, normalize(v)]));
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event: name, ...norm });
}
```

* dataLayer event **`payment_completed`** must map to GA4 **`purchase`** (see GTM docs).
* Avoid inline GA/gtag; use the typed helper and GTM container.

---

## 7) Performance patterns

* **Images**: use Cloudinary helpers (`clImage`, `clThumb`) to generate responsive URLs; include `width`/`height` to avoid CLS.
* **Code splitting**: prefer dynamic `import()` for heavy/rare paths.
* **Fonts**: self‑host, `font-display: swap`; preload only if critical.
* **Cache**: let Netlify/CDN handle immutable assets; avoid busting URLs unnecessarily.

---

## 8) Security patterns

* **CSP‑friendly**: no inline scripts or event handlers.
* **Sanitize** any HTML insertion; prefer `textContent` otherwise.
* **External links**: with `target="_blank"` add `rel="noopener noreferrer"`.
* **Third‑party**: load on demand only (Stripe, YouTube IFrame API, etc.).

---

## 9) Directory placement (quick)

* New **section** → `src/_includes/sections/<name>/{index.njk,index.ts}`
* New **UI component** → `src/platform/ui/components/*`
* New **data adapter** → `src/_data/*.ts`
* Long explanations → `docs/*.md` (link from code, don’t inline)

---

## 10) Testing & verification

* **Manual**: keyboard tour, quick VoiceOver pass, zoom 200%.
* **Automated**: `npm run type-check && npm run lint && npm run test` (unit/Vitest) and `npm run test:e2e` (Playwright).
* **Visual**: use the existing Playwright visual tests for changed sections.
* **Lighthouse**: run locally for UI/perf changes (aim: Perf ≥ 90, A11y ≥ 95).

---

## 11) Before you commit (micro‑checklist)

* [ ] No inline styles/handlers; Tailwind classes only.
* [ ] Types are strict; no `any` snuck in.
* [ ] A11y basics: labels, focus, contrast, keyboard paths.
* [ ] Events use the canonical names (e.g., `payment_completed`).
* [ ] `npm run type-check && npm run lint` are green.

---

*Last updated: 2025‑08‑22*

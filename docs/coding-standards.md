# Coding Standards — Café com Vendas

> **Canonical rules** for this repo. Keep it **simple, strict, TypeScript‑first, Tailwind‑only**. Examples below reflect our ESM rule: **import specifiers use `.js` extensions**, even though we write `.ts` files.

---

## 0) Scope & Goals

* **Clarity over cleverness.** Small, readable functions.
* **Safety first.** Type safety, CSP, no inline handlers/styles.
* **Consistency.** One obvious way to do things.

---

## 1) Zero‑Tolerance Rules

* **TypeScript‑only**: no `.js` sources. Do not commit generated JS.
* **No `any`** (incl. implicit). Justify rare exceptions with a comment.
* **No inline styles or HTML event handlers** (e.g., `style=""`, `onclick=""`).
* **No hardcoded design values** (colors/spacing/fonts). Use tokens + Tailwind.
* **No direct `innerHTML` with untrusted data**. Prefer `textContent`. If HTML is required, sanitize via an allowlist utility.

---

## 2) TypeScript Standards

* **ESM imports**: use **`.js`** in specifiers.

  ```ts
  import { safeQuery } from '../lib/utils/dom.js';
  import type { AnalyticsPayload } from '../assets/js/types/analytics.js';
  ```
* **Exports**: Named exports for utilities; default export for one‑class modules if it improves DX.
* **Type imports**: `import type` for types.
* **Null safety**: handle `null|undefined` explicitly; prefer early returns.
* **Readonly**: prefer `readonly` props & arrays when appropriate.
* **Enums**: avoid unless you need runtime enums; use union types for simple cases.

**Type‑safe DOM helpers**

```ts
// lib/utils/dom.ts
export function q<T extends HTMLElement>(sel: string, root: ParentNode = document): T | null {
  return root.querySelector<T>(sel);
}
export function qa<T extends HTMLElement>(sel: string, root: ParentNode = document): T[] {
  return Array.from(root.querySelectorAll<T>(sel));
}
```

**Global window augmentation**

```ts
// assets/js/types/window.d.ts
export {}; // ensure module
declare global {
  interface Window {
    scrollToOffer?: () => void;
  }
}
```

---

## 3) File & Naming Conventions

```
files: kebab-case.ts         (e.g., scroll-tracker.ts)
classes/interfaces: PascalCase
constants: UPPER_SNAKE_CASE
sections: src/_includes/sections/<section>/{index.njk,index.ts}
platform ui: src/platform/ui/components/<component>.ts
adapters: src/_data/*.ts
```

---

## 4) Styling (Tailwind v4, tokens)

* **Tailwind v4 only** (CSS‑first, `@theme`). No `tailwind.config.js`.
* **Zero inline CSS**. Visual/state changes via class toggles.
* **Design tokens** → generated CSS variables → Tailwind utilities.
* **Motion**: add `motion-reduce:*` fallbacks.

**State via classes (never inline styles)**

```ts
el.classList.add('opacity-0', 'pointer-events-none');
el.classList.remove('opacity-0');
```

---

## 5) Components

### Co‑located Sections

```ts
// _includes/sections/hero/index.ts
export const HeroSection = {
  init(): void {
    (window as Window & { scrollToOffer: () => void }).scrollToOffer = this.scrollToOffer.bind(this);
  },
  scrollToOffer(): void {
    document.getElementById('offer')?.scrollIntoView({ behavior: 'smooth' });
  }
};
```

### Platform UI Components

```ts
// platform/ui/components/accordion.ts
export class Accordion {
  constructor(private root: HTMLElement) {}
  init(): void {
    this.root.addEventListener('click', (e: Event) => {
      const t = e.target as HTMLElement;
      if (t?.matches('[data-accordion-trigger]')) this.toggle(t);
    });
  }
  private toggle(trigger: HTMLElement): void {
    const panel = trigger.nextElementSibling as HTMLElement | null;
    panel?.classList.toggle('hidden');
  }
}
```

---

## 6) Accessibility (canonical rules)

* **Semantic first**; ARIA only when needed.
* **Keyboard complete**: Tab order, visible focus, ESC closes modals.
* **Contrast AA**; do not ship low‑contrast states.
* **Forms**: labeled, polite error announcements, no color‑only cues.
* **Reference**: see `docs/ACCESSIBILITY_GUIDELINES.md` for full patterns.

---

## 7) Analytics (typed, normalized)

* Use the typed Analytics helper; do **not** inline GA/gtag snippets in templates.
* **Event canon**: `payment_completed` in `dataLayer` → GA4 `purchase`.
* Normalize strings (lowercase, stripped accents, bounded length) before pushing.

```ts
// assets/js/core/analytics.ts
export type EventName =
  | 'gtm_init'
  | 'checkout_opened'
  | 'payment_completed'
  | 'lead_form_submitted'
  | 'scroll_depth'
  | 'faq_toggle'
  | 'faq_meaningful_engagement'
  | 'video_play';

export function track(name: EventName, payload: Record<string, unknown> = {}): void {
  const data = normalize(payload);
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({ event: name, ...data });
}

function normalize(obj: Record<string, unknown>): Record<string, unknown> {
  const clean = (v: unknown) =>
    typeof v === 'string'
      ? v
          .toLowerCase()
          .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
          .replace(/[^a-z0-9_\- ]+/g, '')
          .slice(0, 50)
          .trim() || 'other'
      : v;
  return Object.fromEntries(Object.entries(obj).map(([k, v]) => [k, clean(v)]));
}
```

---

## 8) Security

* **CSP‑friendly**: no inline scripts/handlers.
* **No eval / new Function**.
* **Sanitize** any HTML insertion (allowlist). Prefer `textContent`.
* **External links** with `target="_blank"` must include `rel="noopener noreferrer"`.
* **Third‑party** (Stripe, etc.) loads **on demand** only.

---

## 9) Performance

* **Lazy‑load** third‑party scripts (Stripe) and non‑critical media.
* **Tree‑shakable** imports; avoid heavy libs.
* **Responsive images** via Cloudinary helpers; include width/height to avoid CLS.

---

## 10) Quality Gates (must pass before commit)

* `npm run type-check` → **0 errors**
* `npm run lint` → **0 errors**
* Add/update tests when behavior changes (unit/e2e/visual as appropriate)
* For UI/perf changes, run Lighthouse locally (aim: Perf ≥ 90, A11y ≥ 95)

---

## 11) Commit & PR Hygiene

* Keep diffs **small and single‑purpose**.
* Use conventional commits (e.g., `feat:`, `fix:`, `docs:`).
* Document noteworthy decisions inline or in PR description (why > what).

---

**This file is the single source of truth for code standards.** Other docs should link here instead of restating rules.

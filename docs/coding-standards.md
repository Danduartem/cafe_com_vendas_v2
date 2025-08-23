# Coding Standards — Café com Vendas

> **Canonical rules** for this repo. Keep it **simple, strict, TypeScript‑first, Tailwind‑only**. Examples reflect current patterns: **safe DOM utilities**, **platform organization**, and **ESM imports with `.js` extensions**.

---

## 0) Scope & Goals

* **Clarity over cleverness.** Small, readable functions.
* **Safety first.** Type safety, CSP, no inline handlers/styles.
* **Consistency.** One obvious way to do things.

---

## 1) Zero‑Tolerance Rules

* **TypeScript‑first**: `.ts` sources throughout for complete type safety.
* **No `any`** (incl. implicit). Justify rare exceptions with a comment.
* **No inline styles or HTML event handlers** (e.g., `style=""`, `onclick=""`).
* **No hardcoded design values** (colors/spacing/fonts). Use `@theme` tokens + Tailwind.
* **No direct `innerHTML` with untrusted data**. Prefer `textContent`. If HTML is required, sanitize via an allowlist utility.

---

## 2) TypeScript Standards

* **ESM imports**: use **`.js`** in specifiers with path aliases where configured.

  ```ts
  import { safeQuery } from '@/utils/dom';
  import type { AnalyticsEvent } from '@types/analytics.ts';
  import { PlatformAnalytics } from '@components/ui/analytics';
  ```
* **Exports**: Named exports for utilities; default export for configs only.
* **Type imports**: `import type` for types.
* **Null safety**: handle `null|undefined` explicitly; prefer early returns.
* **Readonly**: prefer `readonly` props & arrays when appropriate.
* **Enums**: avoid unless you need runtime enums; use union types for simple cases.

**Safe DOM helpers (current pattern)**

```ts
// src/platform/lib/utils/dom.ts
export function safeQuery(selector: string, context: Document | Element = document): Element | null {
  try {
    return context.querySelector(selector);
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return null;
  }
}

export function safeQueryAll(selector: string, context: Document | Element = document): NodeListOf<Element> {
  try {
    return context.querySelectorAll(selector);
  } catch (error) {
    console.warn(`Invalid selector: ${selector}`, error);
    return document.createDocumentFragment().querySelectorAll(selector);
  }
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
sections: src/_includes/sections/<section>/{index.njk,index.ts,schema.ts?}
platform ui: src/platform/ui/components/<component>.ts
adapters: src/_data/*.ts
utilities: src/platform/lib/utils/<util>.ts
types: src/assets/js/types/<category>.ts
```

---

## 4) Styling (Tailwind v4, tokens)

* **Tailwind v4 only** (CSS‑first, `@theme`). No `tailwind.config.js`.
* **Zero inline CSS**. Visual/state changes via class toggles.
* **Design tokens**: embedded in `src/assets/css/main.css` `@theme` block.
* **Source scanning**: `@source` directive tells Tailwind where to find classes.
* **Motion**: add `motion-reduce:*` fallbacks.

**State via classes (never inline styles)**

```ts
// Hide/show elements
el.classList.add('opacity-0', 'pointer-events-none');
el.classList.remove('opacity-0');

// Animations and transforms
el.classList.add('scale-105', 'transition-transform', 'duration-300');
el.classList.remove('scale-105');
```

---

## 5) Components

### Co‑located Sections (current pattern)

```ts
// src/_includes/sections/hero/index.ts
import { safeQuery } from '@/utils/dom';
import { PlatformAnimations } from '@components/ui';

export const Hero = {
  init() {
    this.initAnimations();
    this.initInteractions();
    this.initScrollIndicator();
    this.initWhatsAppButton();
  },

  initAnimations() {
    const heroSection = safeQuery('#s-hero');
    if (!heroSection) return;

    const elements = [
      heroSection.querySelector('.hero-accent'),
      heroSection.querySelector('h1'),
      heroSection.querySelector('.hero-cta-primary')
    ].filter(Boolean);

    PlatformAnimations.prepareRevealElements(elements);
    // ... animation logic
  }
};
```

### Platform UI Components (current pattern)

```ts
// src/platform/ui/components/accordion.ts
import { safeQuery, safeQueryAll } from '@/utils/dom';

export const PlatformAccordion = {
  initializeNative(config: AccordionConfig): void {
    const container = safeQuery(config.containerSelector);
    const items = safeQueryAll(config.itemSelector) as NodeListOf<HTMLDetailsElement>;

    if (!container || !items.length) {
      console.warn(`Accordion elements not found for ${config.containerSelector}`);
      return;
    }

    items.forEach((item) => {
      item.addEventListener('toggle', () => {
        const isOpen = item.open;
        config.onToggle?.(item, isOpen);
      }, { passive: true });
    });
  }
};
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

* Use **PlatformAnalytics** for simple tracking or **Analytics** for comprehensive tracking.
* **Event canon**: `payment_completed` in `dataLayer` → GA4 `purchase`.
* Auto-normalize strings via `gtm-normalizer` utility.

**Simple tracking (current pattern)**

```ts
// src/platform/ui/components/analytics.ts
import { normalizeEventPayload } from '@/utils/gtm-normalizer';

export const PlatformAnalytics = {
  trackClick(element: HTMLElement, eventType: string, location: string): void {
    if (!element || element.hasAttribute('data-tracked')) return;
    
    element.setAttribute('data-tracked', 'true');
    element.addEventListener('click', function(this: HTMLElement) {
      window.dataLayer = window.dataLayer || [];
      window.dataLayer.push(normalizeEventPayload({
        event: eventType,
        location,
        text: this.textContent?.trim() || 'Click'
      }));
    });
  },

  track(eventName: string, data?: Record<string, unknown>): void {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push(normalizeEventPayload({
      event: eventName,
      ...data
    }));
  }
};
```

**Comprehensive tracking with types**

```ts
// src/assets/js/core/analytics.ts
export const Analytics: AnalyticsInterface = {
  track<T extends AnalyticsEvent>(eventName: T['event'], parameters: Omit<T, 'event'> = {}): void {
    window.dataLayer = window.dataLayer || [];
    window.dataLayer.push({
      event: eventName,
      timestamp: new Date().toISOString(),
      ...parameters
    });
  }
};
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

* `npm run type-check` → **0 errors** (TypeScript 5.9+)
* `npm run lint` → **0 errors** (ESLint 9+ flat config)
* `npm run test:all` → all tests pass (Vitest + Playwright)
* For UI/perf changes, run Lighthouse locally (aim: Perf ≥ 90, A11y ≥ 95)
* Functions deploy successfully: `npm run dev:backend` works

---

## 11) Commit & PR Hygiene

* Keep diffs **small and single‑purpose**.
* Use conventional commits (e.g., `feat:`, `fix:`, `docs:`).
* Document noteworthy decisions inline or in PR description (why > what).

---

**This file is the single source of truth for code standards.** Other docs should link here instead of restating rules.

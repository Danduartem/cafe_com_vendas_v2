# Performance Monitoring — Café com Vendas

> Short, practical guide to keep performance **measurable and green**. Lab = Lighthouse. Field = Web Vitals via GTM/GA4. Repo rules apply: **TypeScript‑first**, **Tailwind‑only**, **ESM imports use `.js` for local paths**.

---

## 🎯 Targets (what “good” means)

* **Lighthouse (mobile)**: **Performance ≥ 90**
* **Accessibility**: **≥ 95** (tracked elsewhere)
* **Core Web Vitals (field)**:

  * **LCP** < 2.5s
  * **INP** < 200ms
  * **CLS** < 0.10

> We don’t hard‑code brag metrics here; we measure continuously and keep hitting the targets above.

---

## 🔎 What we measure

**Lab (pre‑merge & local)**

* Lighthouse in Chrome DevTools on key pages (home, checkout/CTA, thank‑you)

**Field (real users)**

* Web Vitals (LCP, INP, CLS, TTFB, FID) sent to **dataLayer → GTM → GA4**

---

## 📡 Field collection: Web Vitals → dataLayer

Create/ensure `src/assets/js/core/web-vitals.ts` with this minimal bridge:

```ts
import { onCLS, onFID, onLCP, onINP, onTTFB } from 'web-vitals';

type Wv = { name: string; value: number; id: string; rating?: 'good'|'needs-improvement'|'poor' };

function push(metric: Wv): void {
  (window as any).dataLayer = (window as any).dataLayer || [];
  (window as any).dataLayer.push({
    event: 'web_vitals',
    name: metric.name,
    value: metric.value,
    id: metric.id,
    rating: metric.rating || undefined
  });
}

[onCLS, onFID, onLCP, onINP, onTTFB].forEach((api) => api((m: any) => push(m)));
```

Load it once on pages where you want field data (e.g., globally in your main entry). **Do not** call `gtag()` directly; we standardize on GTM.

---

## 🏷️ GTM/GA4 mapping (one event)

* **Custom Event Trigger**: `web_vitals`
* **GA4 Event**: `web_vitals`
* **Parameters**: `name`, `value`, `id`, `rating` (as GA4 event parameters). Create matching **Data Layer Variables** in GTM.

> Keep it one event type to reduce cardinality. Slice by `name` in GA4 Explorations (LCP/INP/CLS…).

---

## 🧪 Lab checks (quick, every PR)

1. Open page in Chrome → **DevTools → Lighthouse → Mobile**
2. Disable throttling only when debugging; run with defaults for comparable scores
3. Check **Performance ≥ 90**; if below, see remediation below

Optional script to remind yourself:

```bash
# macOS (open DevTools Lighthouse automatically)
# No strict automation here to keep the doc simple and tool‑agnostic.
```

---

## 🛠️ Common remediations (keep it simple)

* **Hero & media**: use Cloudinary URLs with explicit `width`/`height`; lazy‑load non‑LCP images
* **Third‑party**: **lazy‑load Stripe** (only on checkout open) and any heavy embeds
* **CSS/JS size**: ship minimal entry; code‑split long‑tail features; avoid heavy libs
* **Fonts**: self‑host, `font-display: swap`; preload only if measurably beneficial
* **DOM work**: avoid layout thrash; batch class toggles; prefer CSS transitions

See `docs/CLOUDINARY_SETUP.md` and `docs/coding-standards.md` for concrete patterns.

---

## ✅ Verification checklist (before merge)

* [ ] Lighthouse (mobile) ≥ 90 on changed pages
* [ ] No unexpected **layout shifts** (CLS) during interactions
* [ ] `stripe.js` not requested until user shows purchase intent
* [ ] No large, unused libraries added to the main bundle
* [ ] Web Vitals event (`web_vitals`) present in GTM Preview at least once

---

## 🔍 Post‑deploy sanity checks

* **GA4 Realtime**: `web_vitals` events flowing; parameters populated
* **Stripe Dashboard**: no unusual latency during confirmation
* **Netlify Analytics/Logs**: error rate not elevated

---

## 🧯 Troubleshooting quickies

* **No `web_vitals` events** → confirm the bridge script is loaded once; GTM trigger is active
* **Low LCP** → inspect LCP element in Performance panel; reduce hero size or defer non‑critical CSS/JS
* **High INP** → find long tasks in Performance; debounce listeners; avoid heavy synchronous work
* **CLS spikes** → ensure intrinsic sizes and reserve space; avoid injecting banners above content

---

## 📚 Related docs

* `docs/CLOUDINARY_SETUP.md`
* `docs/GTM_CONFIGURATION_REFERENCE.md`
* `docs/GTM_SETUP_GUIDE.md`
* `docs/coding-standards.md`

---

*Last updated: 2025‑08‑22*

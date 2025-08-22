# Accessibility Guidelines — Café com Vendas

> Canonical rules to reach and keep **WCAG 2.1 AA** while staying fast and simple. This file supersedes older accessibility notes and consolidates duplicated guidance into a single source. (Tailwind‑only + TypeScript‑first rules stay in effect.)

---

## TL;DR (what actually matters)

* **Use semantic HTML first** (landmarks, headings, lists). Add ARIA only when native elements can’t express the intent.
* **Keyboard must work everywhere** (Tab/Shift+Tab order, visible focus ring, Escape to close modals, Space/Enter to activate controls).
* **Color contrast AA**: text ≥ 4.5:1 (≥ 3:1 for large text). Don’t ship low‑contrast UI.
* **No inline styles; Tailwind only** for state and motion (honor `prefers-reduced-motion`).
* **Forms**: label every field, announce errors politely, never rely on color alone.
* **Test before merge**: keyboard walkthrough, VoiceOver quick pass, Lighthouse A11y ≥ 95 (desktop & mobile).

---

## Targets & Definitions

* **Standard**: WCAG **2.1 AA** (site‑wide).
* **Lighthouse Accessibility**: **≥ 95** (local dev & preview).
* **Focus outline**: always visible on interactive elements (buttons/links/inputs).
* **Touch targets**: minimum **44×44px** and at least **8px** spacing.

---

## Landmarks, Language & Headings

* Use landmarks: `<header>`, `<nav>`, `<main id="main">`, `<footer>`.
* Add a **skip link** as the first focusable element:

  ```html
  <a href="#main" class="sr-only focus:not-sr-only focus:outline-none focus:ring-4">Saltar para o conteúdo</a>
  ```
* Set page language on `<html lang="pt-PT">`.
* Keep heading hierarchy logical (`h1` → `h2` → `h3`…), one **visible** `h1` per page/route.

---

## Keyboard & Focus Management

* All controls must be reachable with **Tab**, in a sensible order.
* **Focus states**: never rely on color alone—use Tailwind rings (e.g., `focus:ring-4`).
* **Escape** closes modals, menus, and dialogs; restore focus to the opener.
* Don’t trap focus unless inside a modal/dialog; when you do, create a focus trap and loop.
* Avoid global `outline: none;`. Tailwind focus utilities only.

---

## Color & Contrast

* **Text**: ≥ **4.5:1** (normal), ≥ **3:1** (≥ 18pt or 14pt bold).
* Don’t use brand colors below AA thresholds on backgrounds.
* Prefer tokenized colors (design tokens) rather than hardcoded hex values.

**Practical checks**

* Test dark overlays and gradient backgrounds with real copy.
* Footer and low‑contrast regions: pick token values already verified for AA.

---

## Motion, Media & Images

* Respect **reduced motion**:

  ```html
  <div class="transition-all duration-300 motion-reduce:transition-none motion-reduce:transform-none">
    <!-- animated content -->
  </div>
  ```
* Provide captions or transcripts for essential video content.
* For decorative images, set `alt=""` and `aria-hidden="true"`; informative images need meaningful `alt`.
* Use responsive images (`<picture>`/`srcset`); prefer the Cloudinary pipeline already configured.

---

## Forms & Errors

* Every input has a `<label for>`, or an explicit `aria-label`.
* Mark required fields and explain the rule near the control.
* Show errors **inline**, near the field, and announce them:

  ```html
  <div id="email-error" role="alert" aria-live="polite" class="mt-2 text-red-600">
    Introduza um e-mail válido.
  </div>
  ```
* Use clear input types (`type="email"`, `type="tel"`) and attributes (`autocomplete`, `aria-invalid`).
* Never rely on color alone for error states; combine color + text/icon.

---

## Components: Accessible Patterns

### Buttons vs Links

* **Links** navigate; **buttons** act.
* Don’t use `<div role="button">`. Use `<button type="button">` (or `type="submit"`).

### Modals

* Wrap in a dialog container; add `aria-modal="true"` and a focus trap.
* On open: move focus to the dialog; on close: return focus to the trigger.

### Accordion / FAQ

* Use buttons with `aria-expanded` and `aria-controls` pointing at the content region ID.
* Content region: `role="region"` + `aria-labelledby="trigger-id"`.

### Carousels & Pagination Dots

* **Simple pagination dots** (preferred): plain buttons with `aria-label="Ir para slide X"` and `aria-current="true"` on the active item. This avoids tab semantics when there is no real “tabpanel”.
* **True tabs** (only if you expose panels): then and only then use `role="tablist"`, `role="tab"`, and matching `role="tabpanel"` with `aria-controls`. Document the keyboard model (Left/Right to switch, Tab to move into panel).

**Dot example (correct, simple)**

```ts
// TypeScript (Tailwind-only) — simple dots, no tab roles
const btn = document.createElement('button');
btn.type = 'button';
btn.className = 'h-2.5 w-2.5 rounded-full bg-neutral-400 aria-[current=true]:bg-neutral-900';
btn.setAttribute('aria-label', `Ir para slide ${i + 1}`);
btn.setAttribute('aria-current', active ? 'true' : 'false');
```

---

## Touch Targets & Spacing

* Minimum **44×44px** interactive area; keep **8px** spacing between adjacent targets to prevent accidental taps.
* Don’t attach click events to tiny icons without padding.

---

## “Zero‑Inline‑CSS” & Tailwind‑Only

* Change visual state via **classList** (Tailwind utilities), never via `element.style`.
* No inline `style=""` attributes; animation/state done with utility classes.
* Follow the **TypeScript‑first + Tailwind‑only** repo standard at all times.

---

## Testing & Validation

### Manual (quick, every PR)

1. **Keyboard tour**: Tab through header → hero → CTAs → footer; check visible focus and order.
2. **Screen reader spot‑check**: macOS **VoiceOver** (⌘+F5) or NVDA; verify landmark navigation and control names.
3. **Zoom**: 200%—layout must remain usable; content must not be cut off.
4. **Color‑only states**: ensure an additional cue exists (icon/text/shape).

### Automated (lightweight)

* **Lighthouse** in Chrome DevTools → **Accessibility ≥ 95** on mobile and desktop.
* Optional: integrate into CI alongside existing perf checks.

---

## “Before Merge” Checklist

* [ ] Landmarks and headings are present and logical.
* [ ] All interactive elements reachable by keyboard; focus is **visible**.
* [ ] No invalid ARIA; every `aria-*` points to an existing element.
* [ ] Contrast passes AA in all states (including hover/focus/disabled).
* [ ] Forms are labeled, errors announced, and don’t rely on color alone.
* [ ] Motion respects `prefers-reduced-motion`.
* [ ] Lighthouse Accessibility ≥ 95 on the modified pages.

---

## Notes on Source of Truth

* This file is the **canonical accessibility reference**. Other docs should link here rather than restate A11y rules to avoid drift.
* Styling and implementation constraints (TypeScript‑only, Tailwind‑only) live in **`coding-standards.md`** and remain enforceable by humans and agents.

---

*Last updated: 2025‑08‑22*

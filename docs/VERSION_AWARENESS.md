# Version Awareness — Café com Vendas

> Keep changes **safe, current, and minimal** by checking the *actual installed versions* before coding. This doc is short by design and aligned with our Claude‑first workflow.

---

## TL;DR

* **Always run** `/project:version-check` before touching APIs or writing new code.
* **Fetch exact‑version docs** via Context7 and code to what’s installed, not memory.
* **Prefer tiny, reversible diffs**; if an API changed, isolate the change and verify with tests.
* **Imports** in TS use **`.js` extensions** (ESM emit). Sources are **`.ts` only**.

---

## What we’re on (source of truth: README)

| Area                  | Current          | Notes                                                          |
| --------------------- | ---------------- | -------------------------------------------------------------- |
| **Node.js**           | LTS (per README) | Use `npm ci` for reproducible installs.                        |
| **TypeScript**        | 5.9.x            | Strict; no implicit `any`.                                     |
| **Vite**              | 7.1.x            | Use `import.meta.glob({ eager: true })`.                       |
| **Eleventy**          | 3.1.x            | ESM config in **`.eleventy.ts`** with `export default`.        |
| **Tailwind CSS**      | 4.1.x            | **CSS‑first**; no `tailwind.config.js`; use `@theme` + tokens. |
| **PostCSS**           | 8.5.x            | Autoprefixer, minimal plugins.                                 |
| **Stripe (Node SDK)** | 18.4.x           | Payment Intents + Methods; lazy‑load `stripe.js` in UI.        |
| **Playwright**        | 1.55.x           | E2E + optional visual snapshots.                               |
| **GA4/GTM**           | –                | dataLayer **`payment_completed` → GA4 `purchase`**.            |

> If the README changes, update this table in the same commit.

---

## Default Flow (use this every time)

1. **Probe versions**

* Run `/project:version-check` (shows installed versions + fetches docs).
* Skim breaking changes sections for any library you’ll touch.

2. **Plan a tiny diff**

* Propose with `/project:plan-then-apply "<one small change>"`.

3. **Code to installed APIs**

* Follow our standards (TS‑only, Tailwind‑only, ESM imports use `.js`).

4. **Verify locally**

* `npm run type-check && npm run lint && npm test`
* If UI changed, run Playwright + quick Lighthouse.

---

## Known Deprecations & Gotchas

* **Vite 7**: `globEager` removed — use `import.meta.glob({ eager: true })`.
* **Tailwind v4**: No `tailwind.config.js`. Configure tokens in CSS via `@theme`; design tokens pipeline emits `_tokens.generated.css` consumed by Tailwind utilities.
* **Eleventy 3**: ESM default; config in **`.eleventy.ts`** with `export default`. Avoid CommonJS patterns.
* **Stripe**: Use **Payment Intents**/**Payment Element** patterns; do **not** load `stripe.js` on first paint — lazy‑load on checkout open.
* **Analytics**: Use typed helper; never inline GA snippets; **event canon** is `payment_completed` in dataLayer mapped to GA4 `purchase`.

---

## Upgrade Recipe (safe, minimal)

1. Create a branch `chore/upgrade-<lib>-to-<version>`.
2. `/project:version-check` → read migration notes for that lib.
3. `npm run outdated` → confirm target update.
4. Update one dependency at a time (or a **small coherent set**), then:

   * Fix type errors.
   * Run unit + e2e tests.
   * Verify Dev build + a quick Lighthouse.
5. Commit with a conventional message; open PR with a 1‑paragraph migration note.

Rollback rule: if tests break and the fix isn’t obvious in 30 minutes, revert and open a tracking issue.

---

## Compatibility Patterns

* **Imports in TS**: `import { x } from './module.js'` (compile to ESM JS).
* **Sections**: `src/_includes/sections/<name>/{index.njk,index.ts}`; no inline styles or handlers.
* **Design tokens**: `design/tokens.json` → `scripts/build-tokens.ts` → `_tokens.generated.css` → Tailwind.
* **Analytics**: Push **typed**, **normalized** events; do not change event names without updating GTM docs.

---

## Decision Matrix — Add/Replace a Library

* **Size**: will this add >10KB gzipped to the main bundle? If yes, reconsider.
* **Native first**: can the platform API (Fetch, DOM, Intl) do it instead?
* **DX vs Lock‑in**: does this API create migration debt?
* **SSR/SSG safety**: is it browser‑only or safe at build time?
* **A11y impact**: does it obstruct keyboard/screen readers?

Only add if it passes **3+** of the above and fails none critically.

---

## Quick Checks (copy/paste)

**See what changed since last install**

```bash
npm ci --dry-run
npm run outdated
```

**List top‑level versions**

```bash
node -p "Object.entries(require('./package.json').dependencies).sort()"
```

**Find usage of a removed API** (example: `globEager`)

```bash
rg -n "globEager" src scripts
```

---

## PR Acceptance Criteria (versioned changes)

* [ ] `/project:version-check` output pasted or summarized in the PR.
* [ ] API changes documented (1 paragraph) in the PR description.
* [ ] `npm run type-check && npm run lint && npm test` green.
* [ ] If build tooling/styles affected, short Lighthouse note attached.

---

*Last updated: 2025‑08‑22*

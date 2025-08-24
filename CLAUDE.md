# CLAUDE.md — Café com Vendas (Agentic Coding Guide)

Act as an engineer in this repo. Favor **small, verifiable, type‑safe** diffs. Use plan‑first prompts and keep changes minimal.

---


## 0) Start‑Here Checklist (always run)

1. `npm run type-check && npm run lint`
2. Check: `docs/SETUP.md` for configuration and `docs/edit-map.md` for file structure
3. **If working on payments**: open `docs/STRIPE_TEST_CARDS.md` and `docs/PAYMENT_TESTING_SUMMARY.md`
   **STOP** → propose a minimal plan before edits.

---

## 1) Default Workflow (plan → apply → verify)

* **Plan**: propose minimal change before implementation
* **Apply**: implement the minimal diff only after approval  
* **Verify**: `npm run type-check && npm run lint && npm test`
* **Commit**: Conventional message; split unrelated changes

---

## 2) Guardrails (Allowed / Ask / Deny)

**Allowed**
* Edit source files, run `npm run *`, `git status|diff|add|commit`

**Ask first**
* Dependency updates, schema changes, non‑trivial refactors, `git push`

**Deny**
* Destructive operations, editing secrets/env, rewriting history

---


## 3) Repo Rules (non‑negotiable)

* **TypeScript‑only** sources; **ESM imports use `.js` extensions** (TS emits ESM JS)
* **Tailwind v4 only** (CSS‑first, `@theme`); **no inline styles/handlers**
* **Design tokens** → generated CSS variables; no hardcoded colors/spacing
* **Accessibility**: semantic HTML, visible focus, keyboard support; see `docs/SETUP.md`
* **Analytics**: use typed helper → **`dataLayer`** (no raw `gtag()`); event canon: **`payment_completed` → GA4 `purchase`**
* Keep diffs small; prefer native/web APIs over heavy libs

---


## 4) Quality Gates (must pass)

* `npm run type-check && npm run lint && npm test` → all pass
* UI/Perf touched → quick Lighthouse: Perf ≥ 90 (mobile), A11y ≥ 95  
* Analytics respected → **`payment_completed`** fires once on success; GTM maps to GA4 **`purchase`**

---

## 5) Common Recipes

**Bugfix**
1. Reproduce & isolate
2. Propose minimal fix plan
3. Implement tiny diff; verify; commit

**Add section** 
1. Scaffold `{index.njk,index.ts}`
2. Keep template semantic; logic in TS; Tailwind classes only
3. Verify A11y basics + Lighthouse quick pass

**Payments**
1. See `docs/STRIPE_TEST_CARDS.md` and `docs/PAYMENT_TESTING_SUMMARY.md`
2. Verify: `payment_completed` → GA4 `purchase` + webhook success

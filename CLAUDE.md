# CLAUDE.md — Café com Vendas (Agentic Coding Guide)

Act as an engineer in this repo. Favor **small, verifiable, type‑safe** diffs. Use plan‑first prompts and keep changes minimal.

---

## 0) Start‑Here Checklist (always run)

1. `npm run versions` → show installed packages
2. `npm run outdated` → check for updates
3. `npm run type-check` and `npm run lint`
4. Skim: `docs/coding-standards.md`, `docs/architecture-overview.md`, `docs/ACCESSIBILITY_GUIDELINES.md`
5. `/project:version-check` (fetch exact‑version docs; see `docs/VERSION_AWARENESS.md`)
6. **If working on payments**: open `docs/STRIPE_TEST_CARDS.md` and `docs/PAYMENT_TESTING_SUMMARY.md`
   **STOP** → propose a minimal plan before edits.

---

## 1) Default Workflow (plan → apply → verify)

* **Plan**: `/project:plan-then-apply "<one small change>"`
* **Apply**: implement the minimal diff only after approval
* **Verify**: `npm run type-check && npm run lint && npm test`
* **Commit**: Conventional message; split unrelated changes

---

## 2) Guardrails (Allowed / Ask / Deny)

**Allowed**

* Edit source/docs, run `npm run *`, `git status|diff|add|commit`

**Ask first**

* Dependency updates, schema/content model changes, non‑trivial refactors, `git push`

**Deny**

* `sudo *`, `rm -rf *`, rewriting history, editing secrets/env, destructive data ops

---

## 3) Repo Rules (non‑negotiable)

* **TypeScript‑only** sources; **ESM imports use `.js` extensions** (TS emits ESM JS)
* **Tailwind v4 only** (CSS‑first, `@theme`); **no inline styles/handlers**
* **Design tokens** → generated CSS variables; no hardcoded colors/spacing
* **Accessibility**: semantic HTML, visible focus, keyboard support; see `docs/ACCESSIBILITY_GUIDELINES.md`
* **Analytics**: use typed helper → **`dataLayer`** (no raw `gtag()`); event canon: **`payment_completed` → GA4 `purchase`**
* Keep diffs small; prefer native/web APIs over heavy libs

---

## 4) Version Awareness (read before coding)

Run `/project:version-check` and code to the installed APIs (not memory). See `docs/VERSION_AWARENESS.md`.

**Known deprecations / patterns**

* **Vite 7+**: replace `globEager` with `import.meta.glob({ eager: true })`
* **Eleventy 3+**: ESM config in `.eleventy.ts` using `export default`
* **Tailwind v4**: no `tailwind.config.js`; configure via CSS `@theme` + tokens
* **Stripe**: Payment Intents + Payment Element; **lazy‑load** `stripe.js`

---

## 5) File Placement & Naming

* New **section** → `src/_includes/sections/<name>/{index.njk,index.ts}`
* New **UI component** → `src/platform/ui/components/<component>.ts`
* **Data adapters** → `src/_data/*.ts`
* Long explanations → `docs/*.md` (link; don’t inline)

---

## 6) Quality Gates (must pass)

* `npm run type-check` → 0 errors
* `npm run lint` → 0 errors
* Tests green (unit/e2e/visual when applicable)
* UI/Perf touched → quick Lighthouse: Perf ≥ 90 (mobile), A11y ≥ 95
* Analytics respected → **`payment_completed`** fires once on success; GTM maps to GA4 **`purchase`**

---

## 7) Common Recipes

**Bugfix**

1. Reproduce & isolate
2. `/project:plan-then-apply "fix: <symptom> with minimal change"`
3. Implement tiny diff; verify; commit

**Update libs**

1. `/project:version-check` → read notes
2. Update a small, coherent set
3. Fix types; run tests; commit

**Add section**

1. Scaffold `{index.njk,index.ts}`
2. Keep template semantic; logic in TS; Tailwind classes only
3. Verify A11y basics + Lighthouse quick pass

**Payments**

1. Use **test mode**; cards in `docs/STRIPE_TEST_CARDS.md`
2. On success: push `payment_completed` with `{ transaction_id, value, currency, items, pricing_tier }`
3. Verify GTM maps to GA4 `purchase`; webhook sees `payment_intent.succeeded`

---

## 8) CI / Headless

Use Claude headless for non‑interactive checks:

```bash
claude -p "/project:version-check" --output-format stream-json
claude -p "/project:plan-then-apply 'small fix: …'" --dry-run
```

Keep runs **idempotent** and **minimal**. **Fail on type errors.**

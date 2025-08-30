# CLAUDE.md — Café com Vendas (Agentic Coding Guide)

Act as an engineer in this repo. Favor **small, verifiable, type‑safe** diffs. Use plan‑first prompts and keep changes minimal.

---

## Context7 Documentation Integration 🚀

**ALWAYS use latest documentation**: This project has Context7 MCP configured. When working with libraries:
1. Use `mcp__context7__resolve-library-id` with the library name (e.g., "stripe", "eleventy", "tailwindcss")
2. Then use `mcp__context7__get-library-docs` with the resolved ID
3. This prevents using deprecated APIs and ensures current best practices

**Automated reminders**: Hooks will remind you to check docs when editing relevant files.

## 0) Start‑Here Checklist (always run)

1. `npm run type-check && npm run lint`
2. Check: `docs/SETUP.md` for configuration and `docs/DEVELOPMENT.md` for file structure
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

* **TypeScript‑only** sources; **path aliases always** with `.js` extensions (ESM compliance)
* **Tailwind v4 only** (CSS‑first, `@theme`); **no inline styles/handlers**
* **Design tokens** → generated CSS variables; no hardcoded colors/spacing
* **Accessibility**: semantic HTML, visible focus, keyboard support; see `docs/SETUP.md`
* **Analytics**: use typed helper → **`dataLayer`** (no raw `gtag()`); event canon: **`payment_completed` → GA4 `purchase`**
* Keep diffs small; prefer native/web APIs over heavy libs

---


## 4) Quality Gates (must pass)

* `npm run type-check && npm run lint && npm test` → all pass
* UI/Perf touched → quick Lighthouse: Perf ≥ 90 (mobile), A11y ≥ 95  
  - **Use**: `npm run lighthouse -- https://your-url.com` (saves to `reports/` folder)
* Analytics respected → **`payment_completed`** fires once on success; GTM maps to GA4 **`purchase`**

---

## 5) Visual Development

### Design Principles
- Comprehensive design checklist in `docs/design/design-principles.md`
- Brand style guide in `docs/design/style-guide.md`
- When making visual (front-end, UI/UX) changes, always refer to these files for guidance

### Quick Visual Check
IMMEDIATELY after implementing any front-end change:
1. **Identify what changed** - Review the modified components/pages
2. **Navigate to affected pages** - Use `mcp__playwright__browser_navigate` to visit each changed view
3. **Verify design compliance** - Compare against `docs/design/design-principles.md` and `docs/design/style-guide.md`
4. **Validate feature implementation** - Ensure the change fulfills the user's specific request
5. **Check acceptance criteria** - Review any provided context files or requirements
6. **Capture evidence** - Take full page screenshot at desktop viewport (1440px) of each changed view
7. **Check for errors** - Run `mcp__playwright__browser_console_messages`

This verification ensures changes meet design standards and user requirements.

### Comprehensive Design Review
Invoke the `@design-review` subagent for thorough design validation when:
- Completing significant UI/UX features
- Before finalizing PRs with visual changes
- Needing comprehensive accessibility and responsiveness testing
---

## 6) Common Recipes

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

---

## 7) Browser Testing & UI Validation Protocol

### Development Environment Investigation (Required First Step)
* **Check running servers**: `lsof -ti:8888` vs `lsof -ti:8080`
  - Port 8888 = Netlify dev (backend integration) ← **Use for payment/backend testing**
  - Port 8080 = Vite dev (frontend only) ← Avoid for integration tests
* **Verify setup**: Reference `netlify.toml` and `docs/SETUP.md` for configuration
* **Always start with correct environment** before browser testing

### Playwright MCP Tool Selection Strategy
* **`browser_snapshot()`**: Primary tool for interactions (structured accessibility tree)
  - Use for: element targeting, form filling, button clicking, navigation
  - Returns: element references, text content, semantic structure
  - Token efficient for interactions
* **`browser_take_screenshot()`**: Visual confirmation and documentation only
  - Use for: visual validation, design compliance, bug documentation
  - Returns: visual image (cannot perform actions)
  - Essential for UI/UX validation
* **Decision Matrix**:
  - **Interaction only** → `browser_snapshot()`
  - **Visual documentation only** → `browser_take_screenshot()`
  - **UI testing & validation** → **Both** (snapshot for interaction + screenshot for visual confirmation)

### Optimal Testing Workflow
1. **Navigate** to correct environment (8888 for backend integration)
2. **Targeted snapshot** of component/modal (not full page landing content)
3. **Perform interactions** using element references from snapshot
4. **Visual confirmation** via screenshot of changes/results
5. **Debug context** via `browser_console_messages()` when needed

### Token Optimization Through Smart Targeting
* **Component targeting**: Snapshot specific modals/forms instead of entire landing pages
* **Reference reuse**: Use single snapshot for multiple interactions on same component
* **Strategic combination**: Structured accessibility data + visual confirmation
* **Focus areas**: Target checkout modals, forms, and interactive components rather than marketing content

---

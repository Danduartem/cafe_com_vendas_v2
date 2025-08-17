---
name: "deps:update (pro)"
summary: "Update project dependencies safely with a clear plan and verifiable steps"
risk: "medium"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(npm:*), Bash(pnpm:*), Bash(yarn:*), Bash(git:*)
max-edit-scope: 200
review-mode: "plan-then-apply"
---

# 1) Intent
Goal: Update Café com Vendas landing page dependencies safely to latest **minor/patch** versions. Prioritize Eleventy, Vite, Tailwind CSS, and Stripe SDK compatibility.
Non-Goals: No broad refactors or framework migrations. Maintain landing page functionality and Portuguese event integration.

# 2) Inputs
Optional:
- `mode`: "safe" (default, minors/patches) | "majors-preview" | "majors-allow"
- `include`: comma list to prioritize (e.g., "stripe,vite,@11ty/eleventy")
- `exclude`: comma list to skip (e.g., "tailwindcss" - requires careful migration)
- `pre-audit`: true|false (default: true) - run Lighthouse before updates
- `post-audit`: true|false (default: true) - verify performance after updates
- `test-stripe`: true|false (default: false) - test payment integration after updates
- `notes`: constraints (e.g., "keep Node 22+", "maintain Eleventy ESM compatibility")

# 3) Auto-Discovery (light)
Detect:
- Package manager: npm (package-lock.json, npm scripts)
- Landing page stack: Eleventy 3.x (ESM), Vite 7.x, Tailwind CSS v4, PostCSS
- Payment integration: Stripe SDK, Netlify Functions
- Build tools: cross-env, design tokens generation script
- Development: ESLint, Lighthouse auditing, live reload
- Scripts: `dev`, `build`, `tokens:build`, `lighthouse`, `lint`
- Node requirements: package.json#engines (Node 22.17.1+)

# 4) Constraints & Guardrails
- Default **minor/patch only** to maintain landing page stability
- Preserve landing page functionality and Stripe payment integration
- Keep diffs ≤ `max-edit-scope` (lockfile churn excluded)
- Respect Node 22.17.1+ requirement for optimal Vite performance
- Bundle updates: Eleventy + plugins, Vite + CSS plugins, Stripe SDK compatibility
- No Tailwind CSS v4 config changes without explicit approval
- Maintain Eleventy 3.x ESM compatibility throughout updates
- Preserve design token build process and CSS generation

# 5) Method
1) **Pre-audit**: run `npm run lighthouse` to capture baseline performance if enabled
2) **Assess**: read current versions, compute latest safe targets; enumerate majors available
3) **Plan**: group updates by risk (build tools → CSS → payment → dev tools)
4) **Patch**: update version ranges in package.json preserving existing range style
5) **Install**: run `npm install` and `npm dedupe` to update lockfile
6) **Verify**: run `npm run build`, `npm run lint`, `npm run tokens:build`
7) **Post-audit**: run Lighthouse again to verify no performance regression
8) **Test**: validate Stripe integration if `test-stripe=true`
9) **Report**: show from→to table, performance comparison, majors deferred

# 6) Output Contract (strict)

## PLAN
- Manager & workspace detection.
- Packages to update (from → to), grouped by risk.
- Majors available (preview or allowed).
- Estimated changed lines (≤ `max-edit-scope`, excluding lockfiles).

## PATCH
- Minimal diffs of only the changed dependency lines in each affected `package.json`.

## COMMANDS
- Pre-audit (if enabled):
  - `npm run lighthouse` to capture baseline performance
- Install & update:
  - `npm install` to apply package.json changes
  - `npm dedupe` to optimize dependency tree
- Landing page verification:
  - `npm run build` to ensure static site generation works
  - `npm run tokens:build` to verify design token generation
  - `npm run lint` to check code quality
  - `npm run lighthouse` to compare performance (if post-audit enabled)
- Stripe integration test (if enabled):
  - Test payment intent creation and webhook handling

## NOTES
- **Landing page impact**: Performance regression analysis (before/after Lighthouse scores)
- **Dependency hotspots**: Eleventy ESM compatibility, Vite plugins, PostCSS processors
- **Skipped updates**: Tailwind CSS v4 (manual migration required), major Eleventy changes
- **Payment integration**: Stripe SDK compatibility maintained, webhook signature validation
- **Follow-ups**: Major version migration guides (Eleventy 4.x, Vite 8.x, Tailwind CSS v5)
- **Docs update**: Run `/update-documentation` to sync CLAUDE.md with new versions
- **Rollback**: `git restore package.json package-lock.json && npm install` to revert changes

# 7) Decision Rules
- Package manager: npm (confirmed by package-lock.json presence)
- Range style: preserve existing caret (^) ranges for flexibility
- Priority order: Vite/build tools → CSS/design → Stripe/payment → dev tools → utilities
- Performance threshold: reject updates causing >5% Lighthouse score regression
- Compatibility: maintain Node 22.17.1+ and Eleventy 3.x ESM requirements
- If scope exceeds cap, prioritize build tools and payment integration first

# 8) Examples
- `deps:update (pro)` - safe minor/patch updates with performance auditing
- `deps:update (pro) include="stripe,vite" test-stripe=true` - prioritize payment and build tools
- `deps:update (pro) mode=majors-preview` - preview major version upgrades
- `deps:update (pro) exclude="tailwindcss" notes="maintain v4 config"` - skip Tailwind updates

# 9) Review Checklist
- [ ] Only minor/patch unless `mode=majors-allow`
- [ ] Range styles preserved; peers updated together
- [ ] Engines respected; no silent Node bump
- [ ] Build/lint/typecheck/test commands provided
- [ ] Monorepo handled correctly; dedupe suggested
- [ ] Diff small, surgical; no code refactors
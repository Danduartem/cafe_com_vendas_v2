---
name: "docs:update (pro)"
summary: "Audit and update ALL repo documentation to reflect current code and workflows"
risk: "low"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(git:*), Bash(npm:*), Bash(pnpm:*), Bash(yarn:*)
max-edit-scope: 600
review-mode: "plan-then-apply"
---

# 1) Intent
Goal: Identify stale or missing information and update documentation across the repository so it matches the current code, scripts, env vars, and deployment flows.
Non-Goals: Do not change runtime behavior, build config, or project architecture. No broad rewrites; prefer surgical edits that reduce drift and duplication.

# 2) Inputs
Required:
- none (defaults to repo root)

Optional:
- `target`: path/glob to limit scope (default: entire repo)
- `audience`: "dev" | "user" | "ops" (default: dev)
- `include`: comma list of doc types to focus (e.g., "README,CLAUDE,CONTRIBUTING,ENV,DEPLOY,API,CHANGELOG")
- `exclude`: paths/globs to skip
- `tone`: "neutral" | "friendly" | "enterprise" (default: neutral)
- `brand`: tokens or style file for names/links
- `notes`: extra guidance (e.g., keep CLI examples pnpm-first)

# 3) Project Auto-Discovery (light)
Detect conventions and facts to sync:
- Package manager & scripts: `package.json` (`scripts`, `engines`, workspaces), `pnpm-lock.yaml`, `yarn.lock`, `package-lock.json`
- Build & frameworks: `vite.config.*`, Eleventy config, Rollup/Webpack files
- CSS/system: `tailwind.config.*`, tokens (`tokens.json`, `*.css` variables), PostCSS
- Lint/format/test: `eslint.*`, `prettier.*`, `*.rc`, test folders & commands
- Deployment: Netlify/Vercel/CI configs, `Dockerfile`, `compose.*`, GitHub Actions
- Env: `.env.example`, `.env.*`, required keys present in code
- Docs surface: `README.*`, `docs/**`, `CLAUDE.md`, `CONTRIBUTING.*`, `SECURITY.*`, `CHANGELOG.*`
- Integrations: Stripe payment, GTM analytics, Netlify Functions, Cloudinary images—derive keys/steps from code and `scripts`
- Café com Vendas specifics: event data, design tokens, Portuguese content, testimonials

Use findings ONLY to align docs—do not modify configs unless a minor fix is required to make docs truthful.

# 4) Constraints & Guardrails
- Accuracy over verbosity; remove duplication; prefer single-source tables (scripts/env).
- Structure > prose: use headings, short paragraphs, bullet lists, and tables.
- Keep READMEs scannable; line length ~100 chars; wrap code fences properly.
- Add sections only if missing; don’t rename files unless obviously broken.
- Respect audience: 
  - **dev** → setup, scripts, env, architecture, deploy
  - **user** → install/use, configuration, troubleshooting
  - **ops** → env, deploy, observability, rollbacks
- Accessibility & inclusive language; avoid marketing fluff in technical docs.
- Scope cap: ≤ 600 lines changed total; prioritize highest-drift docs first.

# 5) Method (How to Think)
1) **Assess**: Build a drift map by comparing discovered facts vs. current docs; list gaps and contradictions.
2) **Plan**: Choose minimal edits that fix drift; define target files/sections; avoid cross-file duplication.
3) **Apply**: Patch docs with concise tables and checklists (scripts/env/deploy). Insert “Updated on <date>” footers where helpful.
4) **Verify**: Ensure commands run across npm/pnpm/yarn; check intra-repo links; confirm env keys match code usage.

# 6) Output Contract (Strict)

## PLAN
- Bullet list of each doc to touch, the drift found, and the exact sections to add/replace.
- Estimated changed lines (keep under `max-edit-scope`).

## PATCH
- Provide diffs or fully replaced blocks per file in this order:
  1) README.* 
  2) docs/** 
  3) CLAUDE.md 
  4) CONTRIBUTING.* 
  5) .env.example (if needed) 
  6) CHANGELOG.* (only if correcting obvious errors)
- Keep edits surgical; use tables for `scripts` and `env`.

## COMMANDS
- If repo has docs build: `npm|pnpm|yarn run docs:build`
- Suggested verification: `git diff --stat` and `markdownlint`/`prettier --check` if present.
- Suggested commit command (do not auto-commit):
  - `git commit -m "docs: sync README and docs with current build, env, and deploy"`

## NOTES
- Risks/tradeoffs (e.g., ambiguous env names) and follow-ups (e.g., add diagrams later).
- List any assumptions (clearly marked) and TODOs where info was missing.

# 7) Decision Rules
- If `package.json#scripts` changed vs README → regenerate **Scripts** table (name → description → command).
- If code references `process.env.*` not listed in docs → update `.env.example` and README **Environment**.
- If Eleventy/Vite/Tailwind present → include **Build & Dev** steps; note Node 22.17.1+ requirement.
- If Netlify Functions exist → document webhook endpoints and environment setup.
- If Stripe integration found → add payment testing section with test cards.
- If `info/DATA_*.json` files exist → sync event details, pricing, and Portuguese content in docs.
- If design tokens in `info/DATA_design_tokens.json` → document token build process.
- If landing page structure → add conversion optimization and accessibility sections.
- If CHANGELOG uses Conventional Commits → don't fabricate entries; only fix headings/links if objectively wrong.

# 8) Examples (Invocation)
- `docs:update (pro)` - full documentation audit for Café com Vendas
- `docs:update (pro) include=README,CLAUDE,ENV` - focus on core project docs
- `docs:update (pro) audience=dev notes="npm only, Node 22+"` - developer-focused
- `docs:update (pro) target=info/** notes="sync event data and design tokens"`

# 9) Review Checklist for Café com Vendas
- [ ] README includes: Landing page overview, Eleventy+Vite+Tailwind stack, npm scripts, Stripe testing
- [ ] `.env.example` has: VITE_STRIPE_PUBLIC_KEY, STRIPE_SECRET_KEY, VITE_GTM_CONTAINER_ID, CLOUDINARY_CLOUD_NAME
- [ ] Scripts table reflects actual npm commands (no pnpm/yarn references)
- [ ] CLAUDE.md synced with: current dependency versions, performance targets, design token process
- [ ] Event documentation matches: info/DATA_event.json (dates, pricing, location)
- [ ] Design token process documented: build-tokens.js script and CSS generation
- [ ] Netlify deployment covered: Functions setup, environment variables, preview URLs
- [ ] Portuguese content guidelines preserved and documented
- [ ] Accessibility targets documented: WCAG AA compliance, Lighthouse scores >95
- [ ] No marketing content in technical docs; focus on development workflow
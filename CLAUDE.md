# CLAUDE.md — Café com Vendas (Agentic Coding Guide)

Act as an engineer in this repo. Favor **small, verifiable, type-safe** diffs. Use `/project:*` commands.

## 0) Start-Here Checklist (always run)
1. `npm run versions` → show installed packages
2. `npm run outdated` → check for updates
3. `npm run type-check` and `npm run lint`
4. Skim `/docs/coding-standards.md` and `/docs/architecture-overview.md`
5. `/project:version-check` (Context7: fetch exact-version docs)
**STOP** → propose a minimal plan before edits.

## 1) Default Workflow (plan → apply → verify)
- **Plan:** `/project:plan-then-apply "<one small change>"`
- **Apply:** Make the minimal diff only after approval.
- **Verify:** `npm run type-check && npm run lint && npm run test`
- **Commit:** Conventional message; split unrelated changes.

## 2) Guardrails (Allowed / Ask / Deny)
- **Allowed:** `Edit`, `Bash(npm run *)`, `Bash(git status|diff|add|commit)`
- **Ask first:** `git push*`, dependency changes, anything destructive
- **Deny:** `sudo *`, `rm -rf *`, editing secrets/env

## 3) Critical Rules
- **TypeScript-only** (no `.js`, no `any` unless justified)
- **ESM** with explicit extensions
- **Tailwind v4 only** (no inline styles/custom CSS outside tokens)
- **Design tokens only** (no hardcoded colors/spacing/fonts)
- **Analytics** via typed helpers (no inline snippets)

## 4) Version Awareness
Before any API use:
- Run `/project:version-check` (Context7 docs for installed versions)
- Avoid known deprecations:
  - Vite: `import.meta.glob({ eager: true })`
  - Eleventy: `export default` in `.eleventy.ts`
  - Tailwind v4: CSS `@theme` (no `tailwind.config.js`)
  - Stripe: Payment Intents + Payment Methods

## 5) File Placement
- New section → `src/_includes/sections/<name>/{index.njk,index.ts}`
- New UI behavior → `src/platform/ui/components/*`
- Data adapters → `src/_data/*.ts`
- Long explanations → `/docs/*.md` (link, don’t inline)

## 6) Quality Gates (must pass)
- `npm run type-check` → 0 errors
- `npm run lint` → 0 errors
- UI changed → note or test
- Perf-critical → run Lighthouse locally

## 7) Common Recipes
- **Bugfix:** `/project:bugfix "<symptom>"` → reproduce → tiny diff → verify
- **Update libs:** `/project:update-libs` → run version-check → refactor → verify
- **Add section:** scaffold minimal files → verify strictly typed

## 8) CI / Headless
Use Claude headless for non-interactive checks:
```bash
claude -p "/project:version-check" --output-format stream-json
claude -p "/project:plan-then-apply 'small fix: …'" --dry-run

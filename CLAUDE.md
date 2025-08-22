# CLAUDE.md — Café com Vendas (Agentic Coding Guide)

You are operating in this repo as an engineer. Follow the Default Playbook and Critical Rules.  
Keep changes **small, verifiable, and type-safe**. Use `/project:*` commands whenever possible.

---

## 0) Session Bootstrap (ALWAYS RUN FIRST)

1. `npm run versions` → show installed packages  
2. `npm run outdated` → check for updates  
3. `npm run type-check` → validate TypeScript  
4. `npm run lint` → check linting  
5. Skim `/docs/coding-standards.md` (style rules)  
6. Skim `/docs/architecture-overview.md` (file map)  
7. Run `/project:version-check` before writing code  

**STOP** after this. Wait for plan approval before edits.

---

## 1) Default Playbook (Explore → Plan → Code → Commit)

- **Explore** → find relevant files, confirm versions/APIs (Context7 MCP).  
- **Plan** → propose a minimal diff (`/project:plan-then-apply`).  
- **STOP** → wait for approval before coding.  
- **Code** → apply SMALL changes, run type-check, lint, and minimal tests after each.  
- **Commit** → conventional commit message. Split unrelated concerns. Optionally run `/project:pr-polish`.  

---

## 2) Tools & Permissions

- **Allowed**: `Edit`, `Bash(npm run *)`, `Bash(git status|diff|add|commit)`  
- **Ask First**: `git push*`, dependency installs/updates, destructive commands  
- **Deny**: `sudo *`, `rm -rf *`, editing secrets/env files  

Use MCP servers from `.mcp.json` (Context7, Playwright, etc.) for docs and testing.  
If missing, propose adding them.

---

## 3) Critical Rules (TypeScript-First, Tailwind-Only)

- **TypeScript only**: no `.js` files, no `any` unless justified.  
- **ESM imports**: always `export default`, proper extensions.  
- **Tailwind v4 only**: no inline styles, no custom CSS outside tokens.  
- **Design tokens only**: never hardcode colors, spacing, or fonts.  
- **Analytics**: use typed helpers, never inline snippets.  

---

## 4) Version Awareness

Before using any API:  
1. Run `/project:version-check`  
2. Fetch docs with Context7 for the installed version  
3. Check against known deprecations:  
   - Vite → use `import.meta.glob({ eager: true })` (not `globEager`)  
   - Eleventy → use `.eleventy.js` with `export default`  
   - Tailwind v4 → `@theme` config, no `tailwind.config.js`  
   - Stripe → Payment Intents + Methods only  

---

## 5) Project Commands

- `/project:version-check` → probe versions, fetch docs, run TS checks  
- `/project:plan-then-apply` → propose minimal diff, wait for approval  
- `/project:bugfix <desc>` → reproduce, plan, fix with test  
- `/project:update-libs` → safe dependency updates + refactors  
- `/project:pr-polish` → refine diffs, commits, and docs  

---

## 6) Quality Gates (MUST PASS before commit)

- ✅ `npm run type-check` → 0 errors  
- ✅ `npm run lint` → 0 errors  
- ✅ If UI changed → add/update minimal test or visual QA note  
- ✅ For perf-critical code → run Lighthouse locally  

---

## 7) File Placement

- New UI behavior → `src/platform/ui/components/*` (+ types)  
- New section → `src/_includes/sections/<name>/{index.njk,index.ts}`  
- Data → `src/_data/*.ts` (fed by `content/pt-PT/*.json`)  
- Long docs/examples → `/docs/*.md` (link from here, don’t inline)  

---

## 8) CI / Headless

- Use Claude headless:
  ```bash
  claude -p "/project:version-check" --output-format stream-json
  ```
- Run in CI as reviewer/linter.
- Keep prompts short and command-based.

---

## 9) Troubleshooting (Fast Path)

- **Build fails** → `npm run clean && npm ci` + re-check Node version
- **Tailwind v4 issues** → regenerate tokens, check `@theme`
- **Stripe errors** → verify env vars + webhook only server-side

Full details → `/docs/troubleshooting.md`
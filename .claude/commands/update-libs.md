---
name: "deps:update (pro)"
summary: "Update project dependencies safely with a clear plan and verifiable steps"
risk: "medium"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(npm:*), Bash(pnpm:*), Bash(yarn:*), Bash(git:*)
max-edit-scope: 200
review-mode: "plan-then-apply"
---

# 1) Intent
Goal: Bring dependencies to the latest **minor/patch** by default with minimal risk, then preview majors. Keep behavior/build output unchanged.
Non-Goals: No broad refactors or framework migrations. Do not silently apply major upgrades unless explicitly allowed.

# 2) Inputs
Optional:
- `mode`: "safe" (default, minors/patches) | "majors-preview" | "majors-allow"
- `include`: comma list to prioritize (e.g., "vite,eslint,@types/*")
- `exclude`: comma list to skip (e.g., "tailwindcss,eleventy")
- `workspace`: "auto" | "root" | "all" (monorepos)
- `manager`: "auto" | "npm" | "pnpm" | "yarn"
- `notes`: constraints (e.g., "keep Node 18", "don’t touch Tailwind config")

# 3) Auto-Discovery (light)
Detect:
- Manager/lockfile: `pnpm-lock.yaml` | `yarn.lock` | `package-lock.json`
- Workspaces: `package.json#workspaces`, `pnpm-workspace.yaml`, `packages/*`
- Tooling: Vite/Rollup/Webpack, Eleventy, Tailwind, ESLint/Prettier, TypeScript
- Scripts: `build`, `dev`, `lint`, `typecheck`, `test`
- Engines: `package.json#engines`, `.nvmrc`, `.node-version`

# 4) Constraints & Guardrails
- Default **minor/patch only**; list majors separately unless `mode="majors-allow"`.
- Only change `package.json` version ranges (+ lockfiles via install). Preserve existing range style (`^`, `~`, exact).
- Keep diffs ≤ `max-edit-scope` (lockfile churn excluded).
- Respect engines (do not bump Node).
- Peer-dep bundles move together: TypeScript + @types, ESLint core + official plugins, Vite + official plugins.
- No config rewrites unless a minor requires a 1-line change—explain why.

# 5) Method
1) **Assess**: read current versions, compute latest safe targets; enumerate majors available.
2) **Plan**: group updates by risk (types → lint/format → bundler → UI libs → runtime).
3) **Patch**: update version ranges in the relevant `package.json`(s); do not pin if project uses ranges.
4) **Verify**: provide install/dedupe + `build`/`lint`/`typecheck`/`test` commands if present.
5) **Report**: show from→to table and majors deferred with brief notes.

# 6) Output Contract (strict)

## PLAN
- Manager & workspace detection.
- Packages to update (from → to), grouped by risk.
- Majors available (preview or allowed).
- Estimated changed lines (≤ `max-edit-scope`, excluding lockfiles).

## PATCH
- Minimal diffs of only the changed dependency lines in each affected `package.json`.

## COMMANDS
- Install & dedupe (choose 1 set based on detection; alternatives as comments):
  - npm: `npm install` ; `npm dedupe`
  - pnpm: `pnpm install` ; `pnpm dedupe`
  - yarn: `yarn install`
- Sanity checks if scripts exist:
  - `npm|pnpm|yarn run build`
  - `npm|pnpm|yarn run lint`
  - `npm|pnpm|yarn run typecheck`
  - `npm|pnpm|yarn run test -w`
- Optional (monorepo): workspace-wide dedupe/update hints.

## NOTES
- Peer-dep hotspots to watch (ESLint plugins, @types, Vite plugins).
- Skipped updates & why (engines/peers).
- Follow-ups: migration guides to consult for majors (names only).
- **Docs follow-through**: if versions are documented, add a line for `docs:update (pro)` to sync CLAUDE.md/version manifest.
- **Rollback**: `git restore -SW :/ && git clean -fd` to discard `package.json` changes and remove lockfile/node_modules; then reinstall.

# 7) Decision Rules
- Manager: `pnpm-lock.yaml` → pnpm; else `yarn.lock` → yarn; else npm.
- Workspace: if detected and `workspace!="root"`, operate across packages; else root only.
- Range style: keep existing style; if exact pins, bump exact safely.
- Order of application: types → lint/format → bundler → UI libs → runtime.
- If scope would exceed cap, apply top-impact groups and stop with a note.

# 8) Examples
- `deps:update (pro)`
- `deps:update (pro) mode=majors-preview include="vite,eslint,@types/*"`
- `deps:update (pro) workspace=all notes="keep Node 18"`

# 9) Review Checklist
- [ ] Only minor/patch unless `mode=majors-allow`
- [ ] Range styles preserved; peers updated together
- [ ] Engines respected; no silent Node bump
- [ ] Build/lint/typecheck/test commands provided
- [ ] Monorepo handled correctly; dedupe suggested
- [ ] Diff small, surgical; no code refactors
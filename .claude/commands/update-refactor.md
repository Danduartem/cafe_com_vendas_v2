---
name: "refactor:smart (pro)"
summary: "Behavior-safe clarity refactors + optional compatibility fixes after dependency updates"
risk: "medium"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(npm:*), Bash(pnpm:*), Bash(yarn:*)
max-edit-scope: 350
review-mode: "plan-then-apply"
---

# 1) Intent
Goal: Improve code clarity, consistency, and maintainability **without changing behavior** (mode=clarity). When requested, apply **minimal, targeted compatibility fixes** required by recent library updates (mode=compat).
Non-Goals: No new features or architectural rewrites. No visual or API changes unless strictly required by compat.

# 2) Inputs
Optional:
- `mode`: "clarity" (default) | "compat" | "both"
- `target`: file/dir/glob to focus (default: src/** plus relevant configs)
- `preserve`: files/globs never to change
- `style`: preferences (e.g., "early-returns, camelCase, 8px spacing")
- `notes`: hints (e.g., "focus hero", "avoid regex changes")

# 3) Auto-Discovery (light)
Detect:
- Package manager & workspaces (pnpm/yarn/npm; monorepo layout)
- Tooling & configs: vite/rollup/webpack, Eleventy, Tailwind/PostCSS, ESLint/Prettier, TS (tsconfig paths)
- Recently updated libs (from package.json + lockfile timings) for likely compat edits:
  - ESM/CJS import shape; renamed exports/options
  - Tailwind/Vite/Eleventy plugin option or filename changes
- Conventions: folder structure, component patterns, hooks/utilities, tokens

# 4) Constraints & Guardrails
- **Behavior-safe by default**; compat mode may alter imports/options only to satisfy new APIs.
- Keep diffs ≤ `max-edit-scope`. Prefer many small fixes over broad rewrites.
- Respect existing lint/format; don’t fight local rules.
- A11y intact (headings, labels/roles, contrast, prefers-reduced-motion).
- No new deps; do not remove public exports; avoid cross-cutting refactors.
- Config edits only when a dependency update requires it—explain why.

# 5) Method (How to Think)
1) **Assess**
   - Clarity: find smells (deep nesting, long funcs, unclear names, duplication, dead code).
   - Compat: grep for deprecated imports/options; validate configs against updated libs.
2) **Plan**
   - Minimal, surgical edits per file with reasons; annotate `[clarity]` or `[compat]`.
   - Prioritize: import/option fixes → types/signatures → readability (early returns, extracts).
3) **Apply**
   - Small patches: rename locals, extract ≤10–15 line helpers, flatten if/else, dedupe code.
   - Compat: 1:1 import/option updates; add short comments if behavior might differ.
4) **Verify**
   - Provide commands for build/lint/typecheck/tests; ensure they’re expected to pass.

# 6) Refactoring Scope (choose applicable)
- **Build Tool Optimizations** *(compat-first)*: update Vite/Rollup/Webpack/E11ty options, modern import patterns for tree-shaking, asset handling touch-ups.
- **Framework Enhancements**: adopt current idioms without behavior change; modern config syntax only if required by updates.
- **CSS/Styling Modernization**: dedupe utilities, enforce spacing scale, remove deprecated classes, keep responsive patterns intact.
- **JavaScript/TypeScript Modernization**: early returns, clearer names, safe ES6+ (no behavior changes), better error paths; fix `import type` usage in TS.
- **Performance Touches**: trim dead code, lazy-load where already supported, split code only if existing infra supports it (no new infra).

# 7) Output Contract (strict)

## PLAN
- Bulleted changes by file with rationale; tag `[clarity]` or `[compat]`.
- Estimated lines changed per file and total (≤ `max-edit-scope`).

## PATCH
- Unified diffs for changed regions only, file-by-file, compact and readable.

## COMMANDS
- Auto-detect manager; equivalents as comments:
  - `npm|pnpm|yarn run lint`
  - `npm|pnpm|yarn run typecheck` (if TS)
  - `npm|pnpm|yarn run build`
  - `npm|pnpm|yarn run test -w` (if present)

## NOTES
- Behavior risk areas & quick manual checks to validate.
- Follow-ups outside scope (e.g., deeper decomposition, design system unification).
- **Rollback**: list files touched; `git restore -SW <files>` to revert; re-run install/build if configs changed.

# 8) Decision Rules
- **Naming**: improve locals; keep export names stable; prefer intent-revealing names.
- **Control Flow**: prefer early returns; avoid reordering with side effects.
- **Helpers**: extract small pure helpers colocated with usage; avoid cross-module churn.
- **Imports**:
  - Compat: update default/named shapes; drop unused; align to ESM if project already ESM.
  - Clarity: sort/dedupe; prefer aliased/absolute paths if tsconfig paths exist.
- **Types**: replace obvious `any` with minimal precise types; don’t change public types.
- **Tailwind/HTML**: keep semantic landmarks; enforce consistent spacing and line length (60–75ch).
- **Configs**: only when required by updated libs; keep the smallest workable change.

# 9) Examples (Invocation)
- `refactor:smart (pro)`
- `refactor:smart (pro) mode=clarity target=src/sections/hero.*`
- `refactor:smart (pro) mode=compat notes="vite plugin options renamed"`
- `refactor:smart (pro) mode=both preserve=src/legacy/**`

# 10) Review Checklist
- [ ] Build/lint/typecheck/tests expected to pass
- [ ] Public APIs unchanged; compat only adjusts imports/options
- [ ] Functions shorter/shallower; names clearer; dead code removed
- [ ] A11y intact; spacing & hierarchy consistent
- [ ] Diffs are surgical, commented where intent might be unclear
- [ ] Total changes ≤ scope cap; risks called out in NOTES
- [ ] is in compliance with the /CLAUDE.md file
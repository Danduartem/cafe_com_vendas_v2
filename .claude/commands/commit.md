---
name: "commit:smart (fast)"
summary: "Ultra-fast Conventional Commit(s) with optional preview/plan"
risk: "low"
allowed-tools: Read, Grep, Bash(git:*)
max-edit-scope: 0              # this command must not edit files, only craft commits
---

# 1) Intent
Goal: Stage all changes with `git add -A` then convert into a small set of clean,
Conventional Commits (default: 1) with precise types and scopes.
Non-Goals: Do not modify files, reformat code, bump versions, or change build config. No combining unrelated topics.

# 2) Inputs
Required:
- none (stages all changes with git add -A, then operates on staged diff)

Optional:
- `scope-preferences`: comma list to prefer (e.g., "hero,forms,checkout,tailwind,eleventy,vite")
- `type-allowlist`: override allowed types (default: feat, fix, docs, refactor, test, chore, build, perf, ci)
- `issue`: number or text to reference (e.g., "#123")
- `max-commits`: default 3
- `notes`: hints like “split refactor vs copy changes”
- `fast`: true|false (default: true) → when true, do a single, best-effort commit without PLAN/PREVIEW
- `subject`: override auto-generated subject (≤72 chars)
- `type`: force a type (e.g., `fix`, `feat`) if obvious
- `scope`: force a scope (short, e.g., `hero`, `build`)

# 3) Project Auto-Discovery (light)
- Detect commit conventions: commitlint config (`commitlint.config.*`), conventional-changelog config, or `semantic-release` hints.
- Detect workspaces/monorepo: package.json workspaces or pnpm/yarn workspaces → suggest package-scoped commits.
- Read `.editorconfig`/README style to confirm 72-char subject and wrapped body.

# 4) Constraints & Guardrails
- **Conventional Commits 1.0.0** format:
  - `type(scope): subject` (subject ≤ 72 chars, imperative: “add”, “fix”, “refactor”)
  - Body wrapped at ~72 chars; explain why, not just what.
  - Footer for metadata (`Refs: #123`, `BREAKING CHANGE:`) as needed.
- Automatically stage all changes with `git add -A` at start; no manual staging required.
- If staged diff mixes topics beyond `max-commits`, produce a **SPLIT PLAN**.
- Scopes should be short and meaningful (e.g., `hero`, `forms`, `checkout`, `tailwind`, `vite`, `eleventy`, `build`).

# 5) Method (How to Think)
Fast path (default):
1) Run `git add -A`.
2) Create ONE Conventional Commit from staged diff:
   - Type: infer from changes (fix if a11y/security/build fixes; perf; docs; chore; feat last).
   - Scope: infer from dominant folder (e.g., `hero`, `offer`, `build`, `tailwind`).
   - Subject: concise imperative summary (≤72 chars); use `subject` input if provided.
   - Body: short rationale (“why”), notable files.

Full path (when `fast=false` or `max-commits>1`):
1) Stage with `git add -A`.
2) Inspect staged diff; cluster into 1–3 logical groups.
3) Compose Conventional Commit for each; keep subjects crisp; add brief rationale.
4) Validate against any discovered commitlint rules; adjust type/scope if necessary.

# 6) Output Contract (Strict)
If `fast=true` AND `max-commits=1`:
- Provide only COMMANDS (single `git commit` with subject/body), no PLAN/PREVIEW.

If `fast=false` OR multiple commits:
- PLAN: bullet list of groups (type + scope) and files per group.
- PREVIEW: exact messages for each group (subject + body, wrapped).
- COMMANDS: exact `git commit` lines for each group.
  - If split needed: add helper commands to stage subsets (non-destructive).

# 7) Decision Rules
- **Docs-only** → `docs(scope?): subject`
- **Config-only** → `chore` or `build`
- **Formatting only** → `style`
- **A11y/Security** → `fix`
- **CSS behavior change** → `feat` or `fix`
- **Breaking** → add `!` and footer
- Prefer short scopes (e.g., `hero`, `offer`, `build`, `tailwind`)

# 8) Examples (Invocation)
- `commit:smart (fast)`
- `commit:smart (fast) fast=false max-commits=2`
- `commit:smart (fast) scope-preferences="hero,forms,checkout" issue="#42" max-commits=2`
- `commit:smart (fast) notes="split refactor from copy edits"`

# 9) Review Checklist
- [ ] Subject ≤ 72 chars, imperative mood
- [ ] Types align with rules; scopes concise and relevant
- [ ] Bodies explain **why**, wrapped at ~72 chars
- [ ] Commits are orthogonal (no mixed concerns)
- [ ] No file edits performed; only commit instructions produced
- [ ] Optional: includes SPLIT PLAN if topics exceed `max-commits`

## IMPORTANT: CLEAN COMMITS
- **DO NOT** include any Claude Code attribution lines
- **DO NOT** include "🤖 Generated with [Claude Code]" references
- **DO NOT** include "Co-Authored-By: Claude" lines
- Commits should appear as if written by the developer directly
- Keep commit messages clean, professional, and attribution-free
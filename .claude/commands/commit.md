---
name: "commit:smart (pro)"
summary: "Turn staged changes into 1–3 Conventional Commits with clear scopes"
risk: "low"
allowed-tools: Read, Grep, Bash(git:*)
max-edit-scope: 0              # this command must not edit files, only craft commits
review-mode: "plan-then-apply"
---

# 1) Intent
Goal: Convert CURRENT STAGED changes into a small set of clean, Conventional Commits (preferably 1–3) with precise types and scopes.
Non-Goals: Do not modify files, stage new files, reformat code, bump versions, or change build config. No combining unrelated topics.

# 2) Inputs
Required:
- none (operates on current staged diff)

Optional:
- `scope-preferences`: comma list to prefer (e.g., "hero,forms,checkout,tailwind,eleventy,vite")
- `type-allowlist`: override allowed types (default: feat, fix, docs, refactor, test, chore, build, perf, ci)
- `issue`: number or text to reference (e.g., "#123")
- `max-commits`: default 3
- `notes`: hints like “split refactor vs copy changes”

# 3) Project Auto-Discovery (light)
- Detect commit conventions: commitlint config (`commitlint.config.*`), conventional-changelog config, or `semantic-release` hints.
- Detect workspaces/monorepo: package.json workspaces or pnpm/yarn workspaces → suggest package-scoped commits.
- Read `.editorconfig`/README style to confirm 72-char subject and wrapped body.

# 4) Constraints & Guardrails
- **Conventional Commits 1.0.0** format:
  - `type(scope): subject` (subject ≤ 72 chars, imperative: “add”, “fix”, “refactor”)
  - Body wrapped at ~72 chars; explain why, not just what.
  - Footer for metadata (`Refs: #123`, `BREAKING CHANGE:`) as needed.
- No edits to unstaged files; do not stage/unstage automatically.
- If staged diff mixes topics beyond `max-commits`, produce a **SPLIT PLAN**.
- Scopes should be short and meaningful (e.g., `hero`, `forms`, `checkout`, `tailwind`, `vite`, `eleventy`, `build`).
- Type selection rules (guidance):
  - `feat`: new user-visible capability (component/section/option).
  - `fix`: bug or visual defect correction (including a11y).
  - `refactor`: restructure without behavior change (rename, extract).
  - `docs`: README/MD/docs only.
  - `style`: whitespace/format only (no prod code changes) — rarely used.
  - `chore/build/ci`: infra, configs, scripts; not user-facing.
  - `test`: tests only.
  - `perf`: measurable performance boost without behavior change.

# 5) Method (How to Think)
1) **Assess**: Inspect `git diff --staged --name-only` and `git diff --staged` to identify topics (by directory, feature, or intent).
2) **Cluster**: Group staged changes into at most `max-commits` coherent topics.
3) **Choose** type + scope per group using the rules above; keep subjects crisp and imperative.
4) **Compose** bodies: rationale (why), impact, notable files; wrap at ~72 chars.
5) **Validate** against any discovered commitlint rules; adjust type/scope if necessary.

# 6) Output Contract (Strict)

## PLAN
- Bullet list of groups (type + scope) and which files belong to each.
- If groups > `max-commits`, include a **SPLIT PLAN** with suggested file subsets per commit.

## PREVIEW
- Show the exact commit messages for each group:
  - Subject line
  - Body (wrapped)
  - Optional footer (`Refs:`, `BREAKING CHANGE:`) - NO AI attribution or co-author lines

## COMMANDS
- Provide exact commands to execute each commit **from current stage only**, e.g.:
  - `git commit -m "type(scope): subject" -m "Body..."`
- If a SPLIT PLAN is needed, include **helper commands** to unstage/restage (non-destructive), e.g.:
  - `git restore --staged <files>` then `git add <subset>` then `git commit ...`
  - or recommend `git add -p` for interactive chunking

## IMPORTANT: CLEAN COMMITS
- **DO NOT** include any Claude Code attribution lines
- **DO NOT** include "🤖 Generated with [Claude Code]" references
- **DO NOT** include "Co-Authored-By: Claude" lines
- Commits should appear as if written by the developer directly
- Keep commit messages clean, professional, and attribution-free

## NOTES
- Risks, tradeoffs, or ambiguities (e.g., “these CSS changes alter layout → choose feat vs fix depending on intent”)
- Follow-ups if commitlint will reject certain types

# 7) Decision Rules
- **Docs-only** changes → `docs(scope?): subject`
- **Config-only** (eslint, prettier, vite, eleventy) → `chore` or `build` (if build output changes)
- **Pure formatting** (no behavior) → `style`
- **A11y fixes** (labels, roles, tab order) → `fix`
- **CSS that changes look/behavior** → `feat` (new capability) or `fix` (bug), not `style`
- **Breaking** public API or contract → add "!" in header and "BREAKING CHANGE:" in body
- If monorepo/package detected, prefer package name as scope (e.g., `feat(web): ...`)

# 8) Examples (Invocation)
- `commit:smart (pro)`
- `commit:smart (pro) scope-preferences="hero,forms,checkout" issue="#42" max-commits=2`
- `commit:smart (pro) notes="split refactor from copy edits"`

# 9) Review Checklist
- [ ] Subjects ≤ 72 chars, imperative mood
- [ ] Types align with rules; scopes concise and relevant
- [ ] Bodies explain **why**, wrapped at ~72 chars
- [ ] Commits are orthogonal (no mixed concerns)
- [ ] No file edits performed; only commit instructions produced
- [ ] Optional: includes SPLIT PLAN if topics exceed `max-commits`
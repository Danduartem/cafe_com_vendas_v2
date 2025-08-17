---
name: "push:smart (fast)"
summary: "Fast, safe push with minimal checks; optional rebase/PR"
risk: "medium"
allowed-tools: Bash(git:*), Bash(gh:*), Read
max-edit-scope: 0
review-mode: "plan-then-apply"
---

# 1) Intent
Goal: Push the **current branch** to the remote safely for Café com Vendas Netlify deployment:
- default: fast-forward push with Netlify preview generation
- guard protected branches, never force unless explicitly allowed
- validate environment variables for Stripe integration
- optionally open a Pull Request with Netlify preview link

Non-Goals: No code edits, no auto-merge to main, no version bumping.

# 2) Inputs
Optional:
- `remote`: git remote name (default: origin)
- `branch`: branch to push (default: current)
- `protected`: comma list (default: "main,master,release/*")
- `rebase`: true|false (default: false)   # faster by default
- `run-checks`: true|false (default: false)   # fast by default; opt-in checks
- `allow-force`: false|true (default: false)  # uses --force-with-lease, never --force
- `create-pr`: "no" | "auto" (default: no)
- `pr-base`: target base branch (default: main)
- `check-env`: true|false (default: true)   # validate Stripe env vars
- `netlify-preview`: true|false (default: true)   # generate preview URL
- `test-stripe`: true|false (default: false)   # run Stripe webhook tests
- `notes`: extra guidance

# 3) Auto-Discovery (light)
- Current branch, tracking status, ahead/behind: `git status -sb`, `git rev-parse --abbrev-ref HEAD`
- Remote existence & upstream: `git remote -v`, `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
- New commits to push: `git log --oneline @{u}..HEAD` (if upstream exists)
- Detect GitHub CLI (`gh`) for PR creation
- Netlify CLI availability: `netlify --version`
- Environment variables: check `.env.local` for Stripe keys
- Netlify Functions: validate `netlify/functions/` directory

# 4) Constraints & Guardrails
- **Protected branches**: refuse direct push to protected unless explicitly allowed (and still no force).
- **Clean working tree**: if unstaged changes, suggest committing first.
- **Environment validation**: check required Stripe env vars if `check-env=true`.
- **Netlify Functions**: validate syntax of webhook functions before push.
- **Fast-forward first**: `git fetch` then optional `git rebase <upstream>` if behind (only if `rebase=true`).
- **Force**: only `--force-with-lease` and only if `allow-force=true`.
- **Checks**: run landing page specific checks if `run-checks=true`.

# 5) Method (How to Think)
1) Assess state (cleanliness, upstream, ahead/behind, protected-branch rules).
2) If `check-env=true`: validate Stripe environment variables are set.
3) If Netlify Functions exist: validate syntax and webhook signatures.
4) If behind and `rebase=true`: fetch + rebase; on conflicts, stop with instructions.
5) Show commits that will be pushed with Netlify deployment impact.
6) If `run-checks=true`: run build/lint/lighthouse when scripts exist; abort on failure.
7) Push safely; on first push, set upstream.
8) If `netlify-preview=true`: generate and show preview URL.
9) If `create-pr=auto`: open PR with Netlify preview link.

# 6) Output Contract (Strict)
## PLAN
- Remote/branch; protected-branch decision; ahead/behind status
- Commits to push (short log) with Netlify deployment impact
- Environment variables validation status
- Whether checks will run; whether PR and preview will be created

## COMMANDS
- Environment validation (if enabled):
  - Check for `VITE_STRIPE_PUBLIC_KEY`, `STRIPE_SECRET_KEY`, `VITE_GTM_CONTAINER_ID`
- Netlify Functions validation (if exists):
  - `node -c netlify/functions/create-payment-intent.js`
  - `node -c netlify/functions/stripe-webhook.js`
- Fast path default:
  - `git push` (or `git push --set-upstream <remote> HEAD` if no upstream)
- If behind and `rebase=true`:
  - `git fetch` then `git rebase <upstream>` → then `git push`
- Netlify preview generation:
  - `netlify open --site` or provide branch preview URL
- If `create-pr=auto` and `gh` exists:
  - `gh pr create --fill --base <pr-base> --body "Preview: [preview-url]"`

## NOTES
- Netlify deployment status and preview URL
- How to resolve rebase conflicts
- Environment variable setup if missing
- When (and when not) to use `allow-force`
- Stripe webhook testing instructions for preview environment

# 7) Decision Rules
- If branch matches any `protected` pattern → refuse unless explicitly allowed; suggest PR instead.
- If no upstream → use `git push --set-upstream <remote> HEAD`.
- If behind and `rebase=false` → either abort or suggest `rebase=true` for fast-forward.
- If checks fail → abort; do not push.
- Prefer minimal commands in fast path to keep the workflow snappy.
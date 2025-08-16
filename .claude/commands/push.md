---
name: "push:smart (fast)"
summary: "Fast, safe push with minimal checks; optional rebase/PR"
risk: "medium"
allowed-tools: Bash(git:*), Bash(gh:*), Read
max-edit-scope: 0
review-mode: "plan-then-apply"
---

# 1) Intent
Goal: Push the **current branch** to the remote safely and quickly:
- default: fast-forward push, skip checks (opt-in)
- guard protected branches, never force unless explicitly allowed
- optionally open a Pull Request if configured

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
- `notes`: extra guidance

# 3) Auto-Discovery (light)
- Current branch, tracking status, ahead/behind: `git status -sb`, `git rev-parse --abbrev-ref HEAD`
- Remote existence & upstream: `git remote -v`, `git rev-parse --abbrev-ref --symbolic-full-name @{u}`
- New commits to push: `git log --oneline @{u}..HEAD` (if upstream exists)
- Detect GitHub CLI (`gh`) for PR creation

# 4) Constraints & Guardrails
- **Protected branches**: refuse direct push to protected unless explicitly allowed (and still no force).
- **Clean working tree**: if unstaged changes, suggest committing first.
- **Fast-forward first**: `git fetch` then optional `git rebase <upstream>` if behind (only if `rebase=true`).
- **Force**: only `--force-with-lease` and only if `allow-force=true`.
- **Checks**: run only if `run-checks=true`; abort on failures.

# 5) Method (How to Think)
1) Assess state (cleanliness, upstream, ahead/behind, protected-branch rules).
2) If behind and `rebase=true`: fetch + rebase; on conflicts, stop with instructions.
3) Show commits that will be pushed.
4) If `run-checks=true`: run build/lint/typecheck/tests when scripts exist; abort on failure.
5) Push safely; on first push, set upstream. Optionally open PR.

# 6) Output Contract (Strict)
## PLAN
- Remote/branch; protected-branch decision; ahead/behind status
- Commits to push (short log)
- Whether checks will run; whether PR will be created

## COMMANDS
- Fast path default:
  - `git push` (or `git push --set-upstream <remote> HEAD` if no upstream)
- If behind and `rebase=true`:
  - `git fetch` then `git rebase <upstream>` → then `git push`
- If `create-pr=auto` and `gh` exists:
  - `gh pr create --fill --base <pr-base>`

## NOTES
- How to resolve rebase conflicts
- When (and when not) to use `allow-force`
- Next steps (open PR manually if `gh` missing)

# 7) Decision Rules
- If branch matches any `protected` pattern → refuse unless explicitly allowed; suggest PR instead.
- If no upstream → use `git push --set-upstream <remote> HEAD`.
- If behind and `rebase=false` → either abort or suggest `rebase=true` for fast-forward.
- If checks fail → abort; do not push.
- Prefer minimal commands in fast path to keep the workflow snappy.
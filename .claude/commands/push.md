---
name: "push:smart (pro)"
summary: "Safely push the current branch with checks, rebase, protected-branch guard, and optional PR"
risk: "medium"
allowed-tools: Bash(git:*), Bash(gh:*), Read
max-edit-scope: 0
review-mode: "plan-then-apply"
---

# 1) Intent
Goal: Push the **current branch** to the remote safely:
- ensure clean state, run checks (optional), fast-forward safe (rebase by default)
- guard protected branches, never force unless explicitly allowed
- optionally open a Pull Request if configured

Non-Goals: No code edits, no auto-merge to main, no version bumping.

# 2) Inputs
Optional:
- `remote`: git remote name (default: origin)
- `branch`: branch to push (default: current)
- `protected`: comma list (default: "main,master,release/*")
- `rebase`: true|false (default: true)
- `run-checks`: true|false (default: true)   # build/lint/typecheck/tests if available
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
- **Clean working tree**: refuse if unstaged/unstashed changes (suggest staging/commit first).
- **Fast-forward first**: `git fetch` then optional `git rebase <upstream>` if behind.
- **Force**: only `--force-with-lease` and only if `allow-force=true`.
- **Checks**: if `run-checks=true`, run build/lint/typecheck/tests when scripts exist; abort on failures.
- **No tag pushes** unless explicitly requested (out of scope here).

# 5) Method (How to Think)
1) Assess state (cleanliness, upstream, ahead/behind, protected-branch rules).
2) If behind and `rebase=true`: fetch + rebase; on conflicts, stop with instructions.
3) Show commits that will be pushed.
4) If `run-checks=true`: run standard checks; abort on failure.
5) Push safely; on first push, set upstream. Optionally open PR.

# 6) Output Contract (Strict)

## PLAN
- Remote/branch; protected-branch decision; ahead/behind status
- Commits to push (short log)
- Whether checks will run; whether PR will be created

## COMMANDS
- Fetch/rebase (if needed)
- The exact `git push` command (with `--set-upstream` if first push)
- Optional PR command (if `create-pr=auto` and `gh` exists)

## NOTES
- How to resolve rebase conflicts
- When (and when not) to use `allow-force`
- Next steps (open PR manually if `gh` missing)

# 7) Decision Rules
- If branch matches any `protected` pattern → refuse unless `create-pr=auto` (push allowed to feature branch, not to main).
- If no upstream → use `git push --set-upstream <remote> HEAD`.
- If behind and `rebase=false` → abort with suggestion to pull/rebase.
- If checks fail → abort; do not push.
- If `allow-force=true` → use `--force-with-lease` only (never `--force`).

# 8) Examples (Invocation)
- `push:smart (pro)`                          # safe default to origin, current branch
- `push:smart (pro) run-checks=false`         # skip checks
- `push:smart (pro) create-pr=auto pr-base=main`
- `push:smart (pro) allow-force=true`         # uses --force-with-lease

# 9) Review Checklist
- [ ] Working tree clean (no unstaged/unstashed changes)
- [ ] Not pushing directly to protected branch (or explicitly allowed)
- [ ] Ahead-of-upstream commits reviewed (short log shown)
- [ ] Rebased cleanly / fast-forward safe
- [ ] Checks passed (if enabled)
- [ ] Push command is minimal, no accidental tags or extra refs
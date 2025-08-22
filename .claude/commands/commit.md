/commit (lightweight)
---
description: Fast, staged-only conventional commit with optional verification.
argument-hint: [message] [--full|--no-verify]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git restore:*), Bash(git commit:*), Bash(npm run *), Bash(node .claude/scripts/*)
model: claude-3-7-sonnet
---

# /commit

Create a smart conventional commit from **staged changes**.
Defaults to **fast mode** (no full typecheck). Use `--full` for CI-grade checks or `--no-verify` to skip checks.

## Usage
/commit                      # staged-only, fast verify
/commit "msg"                # force description
/commit --full               # run typed ESLint + tsc (slower)
/commit --no-verify          # skip all gates

## Context (small + staged-only)
- Branch: !`git branch --show-current`
- Staged files: !`git diff --name-only --cached`
- Staged summary: !`git diff --cached --stat`

## Your task
1) If nothing is staged:
   - Stage only tracked changes in src/config by default: `git add -u src config || true`.
   - Re-print staged files and continue.

2) Quick gates (FAST by default):
   - Compute the staged file list: `git diff --name-only --cached --diff-filter=ACMR`.
   - If the list contains any `.(ts|tsx|js|mjs|cjs)` files, run **staged-only ESLint with cache**:
     ```
     FILES=$(git diff --name-only --cached --diff-filter=ACMR | grep -E '\.(ts|tsx|js|mjs|cjs) || true)
     [ -n "$FILES" ] && npm run lint:staged -- $FILES
     ```
   - Skip type-check unless `--full` is present *or* staged TS files touch `src/` boundaries.

3) If `--full` is passed:
   - Run `npm run type-check` (incremental) and `npm run lint:typed` (src only, cache).

4) Generate a **conventional + emoji** commit message from the staged diff and file paths.
   - Keep subject ≤ 72 chars, body as bullets when helpful.
   - If unrelated changes are detected, propose split commits (but proceed with the best single split if trivial).

5) Commit:
   - `git commit -m "<emoji> <type>: <description>" -m "<body if any>"`

## Rules for message type
- ✨ feat | 🐛 fix | 📝 docs | 🎨 style | ♻️ refactor | ⚡ perf | 🧪 test | 🔧 chore | 💳 stripe | 🌍 i18n | 📊 analytics | ♿ a11y
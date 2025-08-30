#!/usr/bin/env bash
set -euo pipefail

# ---- Config ----
MAX_FILES=${MAX_FILES:-200}   # keep it snappy; skip if too many
# File globs to consider for formatting (tailored for Café com Vendas)
PATTERN='\.(ts|tsx|js|jsx|mjs|cjs|json|css|scss|pcss|md|mdx|html|njk|yml|yaml)$'

# ---- Find recently changed files (tracked + modified) ----
# We prefer unstaged working changes produced by Claude's Write/Edit.
# Fallback to any modified tracked files if needed.
CANDIDATES=()
while IFS= read -r line; do
  [[ -n "$line" ]] && CANDIDATES+=("$line")
done < <(git diff --name-only | grep -E "$PATTERN" || true)

# If nothing captured (e.g., edits were staged by a prior step), fall back:
if [ ${#CANDIDATES[@]} -eq 0 ]; then
  while IFS= read -r line; do
    [[ -n "$line" ]] && CANDIDATES+=("$line")
  done < <(git ls-files -m | grep -E "$PATTERN" || true)
fi

# Nothing to format
if [ ${#CANDIDATES[@]} -eq 0 ]; then
  exit 0
fi

# Cap to avoid long runs
if [ ${#CANDIDATES[@]} -gt $MAX_FILES ]; then
  echo "⚠️  Skipping auto-format: too many changed files (${#CANDIDATES[@]} > $MAX_FILES)."
  exit 0
fi

# ---- Format using project's ESLint configuration ----
# This project uses ESLint with autofix - no Biome or Prettier configured

# Format JS/TS files with ESLint (primary formatter for this project)
JS_TS_FILES=()
for f in "${CANDIDATES[@]}"; do
  if [[ "$f" =~ \.(ts|tsx|js|jsx|mjs|cjs)$ ]]; then
    JS_TS_FILES+=("$f")
  fi
done

if [ ${#JS_TS_FILES[@]} -gt 0 ]; then
  # Use the project's lint:fix script for consistency
  if command -v npm >/dev/null 2>&1; then
    # Parallel execution for better performance with many files
    if [ ${#JS_TS_FILES[@]} -gt 10 ]; then
      # Split files into chunks for parallel processing
      printf '%s\n' "${JS_TS_FILES[@]}" | xargs -n 5 -P 4 -I {} npx eslint --fix {} 2>/dev/null || true
    else
      # Standard execution for smaller file counts
      npx eslint --fix "${JS_TS_FILES[@]}" 2>/dev/null || true
    fi
  fi
fi

# For other file types (JSON, CSS, MD, etc.), we could add prettier if needed
# but keeping minimal for now since the project doesn't have it configured

exit 0
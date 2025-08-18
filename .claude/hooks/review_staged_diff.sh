#!/usr/bin/env bash
set -euo pipefail
MODEL="${MODEL:-claude-3-7-sonnet}"

DIFF="$(git diff --cached || true)"
if [ -z "${DIFF}" ]; then
  echo "No staged changes."
  exit 0
fi

printf '%s\n' \
"You are concise and high-signal. Output bullets only. If nothing critical, say 'LGTM'.

Review the staged diff. Call out:
- correctness risks & edge cases
- performance concerns
- missing tests
- security/i18n/accessibility if relevant

--- STAGED DIFF ---
${DIFF}" \
| claude --model "$MODEL"

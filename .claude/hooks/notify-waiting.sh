#!/usr/bin/env bash
set -euo pipefail

# Read JSON payload piped from Claude Code
MESSAGE="$(jq -r '.message // ""' < /dev/stdin)"

# Match common cases where Claude needs input
if echo "$MESSAGE" | grep -qiE 'waiting for your input|needs your permission|requires permission'; then
  # macOS
  if command -v osascript >/dev/null 2>&1; then
    /usr/bin/osascript -e \
      'display notification "Claude is waiting for your input" with title "Claude Code" sound name "Glass"'
  # Linux
  elif command -v notify-send >/dev/null 2>&1; then
    notify-send "Claude Code" "Claude is waiting for your input"
  # Windows (PowerShell + BurntToast module)
  elif command -v powershell.exe >/dev/null 2>&1; then
    powershell.exe -Command \
      "New-BurntToastNotification -Text 'Claude Code','Claude is waiting for your input'"
  else
    # Fallback: simple terminal bell
    printf '\a'
  fi
fi

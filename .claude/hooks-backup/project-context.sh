#!/bin/bash
# Enhanced project context with dynamic event information
# Shows real-time project status for Café com Vendas

# Function for colored output
green() { echo -e "\033[32m$1\033[0m"; }
yellow() { echo -e "\033[33m$1\033[0m"; }
blue() { echo -e "\033[34m$1\033[0m"; }

# Calculate days until event (September 20, 2025)
EVENT_DATE="2025-09-20"
TODAY=$(date +%Y-%m-%d)

# Check if date command supports -d flag (Linux) or -j flag (macOS)
if date -d "2025-01-01" >/dev/null 2>&1; then
    # Linux date command
    DAYS_UNTIL=$(( ($(date -d "$EVENT_DATE" +%s) - $(date -d "$TODAY" +%s)) / 86400 ))
elif date -j -f "%Y-%m-%d" "2025-01-01" >/dev/null 2>&1; then
    # macOS date command
    DAYS_UNTIL=$(( ($(date -j -f "%Y-%m-%d" "$EVENT_DATE" +%s) - $(date -j -f "%Y-%m-%d" "$TODAY" +%s)) / 86400 ))
else
    # Fallback for other systems
    DAYS_UNTIL="?"
fi

# Get current branch
BRANCH=$(git branch --show-current 2>/dev/null || echo "unknown")

# Check build status
BUILD_STATUS="⚠️ unknown"
if [[ -d "_site" ]]; then
    BUILD_STATUS="✅ ready"
elif [[ -f "package.json" ]]; then
    BUILD_STATUS="🔄 needs build"
fi

# Get current price from event data (fallback if file doesn't exist)
PRICE="€2,500"
if [[ -f "info/DATA_event.json" ]]; then
    EXTRACTED_PRICE=$(grep -o '"currentPrice"[[:space:]]*:[[:space:]]*"[^"]*"' info/DATA_event.json 2>/dev/null | cut -d'"' -f4)
    [[ -n "$EXTRACTED_PRICE" ]] && PRICE="$EXTRACTED_PRICE"
fi

# Show enhanced project context
echo "☕ $(blue '[Café com Vendas]') Landing Page Development"
echo "📅 Event: Sept 20, 2025 ($(yellow "$DAYS_UNTIL days")) | 💰 Price: $(green "$PRICE")"
echo "🎯 Target: Portuguese female entrepreneurs | 🎫 8 premium spots"
echo "🌿 Branch: $(yellow "$BRANCH") | 🏗️  Build: $BUILD_STATUS"
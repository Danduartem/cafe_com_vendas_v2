#!/bin/bash

# Check Library Versions Hook
# Runs at session start to identify libraries that should use Context7

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
PACKAGE_JSON="$PROJECT_DIR/package.json"

# ANSI colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m'

if [[ ! -f "$PACKAGE_JSON" ]]; then
    exit 0
fi

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "📚 PROJECT LIBRARIES - Use Context7 for Latest Documentation"
echo "────────────────────────────────────────────────────────────────────"
echo ""
echo "This project uses the following libraries. When working with these,"
echo "use Context7 MCP to ensure you have the latest documentation:"
echo ""

# Parse package.json and list relevant libraries
# Core Framework & Build Tools
echo -e "${BLUE}━━━ Core Framework & Build Tools ━━━${NC}"

if grep -q '"@11ty/eleventy"' "$PACKAGE_JSON"; then
    VERSION=$(grep '"@11ty/eleventy"' "$PACKAGE_JSON" | sed 's/.*: *"\([^"]*\)".*/\1/')
    echo -e "  ${GREEN}✓${NC} Eleventy $VERSION ${YELLOW}(SSG - check for v3 features)${NC}"
    echo "    → mcp__context7__resolve-library-id: 'eleventy'"
fi

if grep -q '"vite"' "$PACKAGE_JSON"; then
    VERSION=$(grep '"vite"' "$PACKAGE_JSON" | sed 's/.*: *"\([^"]*\)".*/\1/')
    echo -e "  ${GREEN}✓${NC} Vite $VERSION ${YELLOW}(Build tool - check plugin APIs)${NC}"
    echo "    → mcp__context7__resolve-library-id: 'vite'"
fi

if grep -q '"typescript"' "$PACKAGE_JSON"; then
    VERSION=$(grep '"typescript"' "$PACKAGE_JSON" | sed 's/.*: *"\([^"]*\)".*/\1/')
    echo -e "  ${GREEN}✓${NC} TypeScript $VERSION"
    echo "    → mcp__context7__resolve-library-id: 'typescript'"
fi

# Styling
echo ""
echo -e "${BLUE}━━━ Styling & UI ━━━${NC}"

if grep -q '"tailwindcss"' "$PACKAGE_JSON"; then
    VERSION=$(grep '"tailwindcss"' "$PACKAGE_JSON" | sed 's/.*: *"\([^"]*\)".*/\1/')
    echo -e "  ${GREEN}✓${NC} Tailwind CSS $VERSION ${YELLOW}(v4 - CSS-first, @theme directive!)${NC}"
    echo "    → mcp__context7__resolve-library-id: 'tailwindcss'"
fi

if grep -q '"@tailwindcss/vite"' "$PACKAGE_JSON"; then
    VERSION=$(grep '"@tailwindcss/vite"' "$PACKAGE_JSON" | sed 's/.*: *"\([^"]*\)".*/\1/')
    echo -e "  ${GREEN}✓${NC} Tailwind Vite Plugin $VERSION"
fi

# Payment & Commerce
echo ""
echo -e "${BLUE}━━━ Payment & Commerce (CRITICAL) ━━━${NC}"

if grep -q '"stripe"' "$PACKAGE_JSON"; then
    VERSION=$(grep '"stripe"' "$PACKAGE_JSON" | head -1 | sed 's/.*: *"\([^"]*\)".*/\1/')
    echo -e "  ${GREEN}✓${NC} Stripe Server SDK $VERSION ${YELLOW}⚠️  Revenue-critical${NC}" 
    echo "    → mcp__context7__resolve-library-id: 'stripe'"
fi

if grep -q '"@stripe/stripe-js"' "$PACKAGE_JSON"; then
    VERSION=$(grep '"@stripe/stripe-js"' "$PACKAGE_JSON" | sed 's/.*: *"\([^"]*\)".*/\1/')
    echo -e "  ${GREEN}✓${NC} Stripe Client SDK $VERSION ${YELLOW}⚠️  Checkout flows${NC}"
    echo "    → Check: https://docs.stripe.com/stripe-js"
fi

# Testing
echo ""
echo -e "${BLUE}━━━ Testing & Quality ━━━${NC}"

if grep -q '"vitest"' "$PACKAGE_JSON"; then
    VERSION=$(grep '"vitest"' "$PACKAGE_JSON" | sed 's/.*: *"\([^"]*\)".*/\1/')
    echo -e "  ${GREEN}✓${NC} Vitest $VERSION"
    echo "    → mcp__context7__resolve-library-id: 'vitest'"
fi

if grep -q '"@playwright/test"' "$PACKAGE_JSON"; then
    VERSION=$(grep '"@playwright/test"' "$PACKAGE_JSON" | sed 's/.*: *"\([^"]*\)".*/\1/')
    echo -e "  ${GREEN}✓${NC} Playwright $VERSION"
    echo "    → mcp__context7__resolve-library-id: 'playwright'"
fi

# Deployment & Functions
echo ""
echo -e "${BLUE}━━━ Deployment & Serverless ━━━${NC}"

if grep -q '"@netlify/functions"' "$PACKAGE_JSON"; then
    VERSION=$(grep '"@netlify/functions"' "$PACKAGE_JSON" | sed 's/.*: *"\([^"]*\)".*/\1/')
    echo -e "  ${GREEN}✓${NC} Netlify Functions $VERSION"
    echo "    → mcp__context7__resolve-library-id: 'netlify'"
fi

echo ""
echo "HOW TO USE CONTEXT7:"
echo "1. Call mcp__context7__resolve-library-id with libraryName"
echo "2. Use the returned ID with mcp__context7__get-library-docs"
echo "3. This ensures you're using the latest patterns, not deprecated ones"
echo ""
echo "════════════════════════════════════════════════════════════════════"
echo ""
#!/bin/bash

# Session Information Hook
# Comprehensive session-start info: library versions + external API reminders
# Combines and optimizes former check-library-versions.sh + external-apis-check.sh

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"
PACKAGE_JSON="$PROJECT_DIR/package.json"
CACHE_DIR="$PROJECT_DIR/.claude/.cache"
CACHE_FILE="$CACHE_DIR/session-info.cache"

# ANSI colors
BLUE='\033[0;34m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
MAGENTA='\033[0;35m'
NC='\033[0m'

# Exit early if no package.json
if [[ ! -f "$PACKAGE_JSON" ]]; then
    exit 0
fi

# Create cache directory if needed
mkdir -p "$CACHE_DIR" 2>/dev/null || true

# Check if we need to regenerate cache (package.json newer than cache)
if [[ -f "$CACHE_FILE" && "$PACKAGE_JSON" -ot "$CACHE_FILE" ]]; then
    # Use cached output
    cat "$CACHE_FILE"
    exit 0
fi

# Generate fresh output and cache it
{
    echo ""
    echo "════════════════════════════════════════════════════════════════════"
    echo "📚 PROJECT LIBRARIES - Use Context7 for Latest Documentation"
    echo "────────────────────────────────────────────────────────────────────"
    echo ""
    echo "This project uses the following libraries. When working with these,"
    echo "use Context7 MCP to ensure you have the latest documentation:"
    echo ""

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

    echo ""
    echo "HOW TO USE CONTEXT7 (TOKEN-OPTIMIZED):"
    echo "1. Call mcp__context7__resolve-library-id with libraryName"
    echo "2. Use mcp__context7__get-library-docs with TARGETED tokens + topic:"
    echo ""
    echo "   📊 RECOMMENDED TOKEN LIMITS (70% reduction from 10K default):"
    echo "   • Stripe: 2500-3000 tokens (revenue-critical accuracy)"
    echo "   • Tailwind CSS: 1500 tokens (focus on v4 utilities)"
    echo "   • Eleventy: 2000-2500 tokens (templates + build patterns)"
    echo "   • TypeScript: 2000 tokens (type patterns + features)"
    echo "   • Vite: 2000 tokens (build config + plugins)"
    echo "   • Vitest/Playwright: 2000-2500 tokens (testing patterns)"
    echo ""
    echo "   🎯 USE TARGETED TOPICS for maximum efficiency:"
    echo "   • Instead of: mcp__context7__get-library-docs --libraryId='/stripe/stripe-node'"
    echo "   • Use: mcp__context7__get-library-docs --libraryId='/stripe/stripe-node' --tokens=2500 --topic='checkout sessions'"
    echo ""
    echo "3. This ensures latest patterns with controlled token usage"

    echo ""
    echo "════════════════════════════════════════════════════════════════════"

    echo ""
    echo "🌐 EXTERNAL APIs - Critical Business Dependencies"
    echo "────────────────────────────────────────────────────────────────────"
    echo ""
    echo -e "${RED}⚠️  IMPORTANT: External API changes can break production features!${NC}"

    # Payment Processing
    echo ""
    echo -e "${MAGENTA}━━━ 💳 Payment Processing (REVENUE CRITICAL) ━━━${NC}"
    echo -e "  ${GREEN}◆${NC} Stripe API"
    echo "    → Docs: https://docs.stripe.com/api"
    echo "    → Changelog: https://docs.stripe.com/changelog"
    echo "    → ${YELLOW}Check: Webhook versions, payment intents, checkout sessions${NC}"
    echo "    → ${RED}Impact: Broken checkout = lost revenue${NC}"

    # Email Marketing
    echo ""
    echo -e "${MAGENTA}━━━ 📧 Email Marketing & Automation ━━━${NC}"
    echo -e "  ${GREEN}◆${NC} MailerLite API"
    echo "    → Docs: https://developers.mailerlite.com/docs"
    echo "    → ${YELLOW}Check: Subscriber endpoints, automation triggers${NC}"
    echo "    → ${RED}Impact: Failed lead capture, broken automation${NC}"

    # Form Processing
    echo ""
    echo -e "${MAGENTA}━━━ 📝 Form Processing ━━━${NC}"
    echo -e "  ${GREEN}◆${NC} Formspree API"
    echo "    → Docs: https://help.formspree.io/hc/en-us/sections/360003491454"
    echo "    → ${YELLOW}Check: Form endpoints, validation rules${NC}"
    echo "    → ${RED}Impact: Lost form submissions, no fallback${NC}"

    # Media & Content
    echo ""
    echo -e "${MAGENTA}━━━ 🎥 Media & Content Delivery ━━━${NC}"
    echo -e "  ${GREEN}◆${NC} YouTube IFrame API"
    echo "    → Docs: https://developers.google.com/youtube/iframe_api_reference"
    echo "    → ${YELLOW}Check: Player parameters, event handlers${NC}"
    echo "    → ${RED}Impact: Broken video embeds, no playback${NC}"
    echo -e "  ${GREEN}◆${NC} Cloudinary API"
    echo "    → Docs: https://cloudinary.com/documentation"
    echo "    → ${YELLOW}Check: Transformation URLs, upload presets${NC}"
    echo "    → ${RED}Impact: Missing images, poor performance${NC}"

    # Analytics & Tracking
    echo ""
    echo -e "${MAGENTA}━━━ 📊 Analytics & Conversion Tracking ━━━${NC}"
    echo -e "  ${GREEN}◆${NC} Google Tag Manager (GTM)"
    echo "    → Docs: https://developers.google.com/tag-manager"
    echo "    → ${YELLOW}Check: dataLayer structure, event names${NC}"
    echo "    → ${RED}Impact: Lost conversion data, broken tracking${NC}"
    echo -e "  ${GREEN}◆${NC} Google Analytics 4 (GA4)"
    echo "    → Docs: https://developers.google.com/analytics/devguides/collection/ga4"
    echo "    → ${YELLOW}Check: Event parameters, ecommerce tracking${NC}"
    echo "    → ${RED}Impact: No insights, can't measure ROI${NC}"

    # SEO & Performance
    echo ""
    echo -e "${MAGENTA}━━━ 🔍 SEO & Performance ━━━${NC}"
    echo -e "  ${GREEN}◆${NC} Schema.org Structured Data"
    echo "    → Docs: https://schema.org/docs/gs.html"
    echo "    → Validator: https://validator.schema.org/"
    echo "    → ${YELLOW}Check: Event markup, LocalBusiness schema${NC}"
    echo "    → ${RED}Impact: Poor SEO, missing rich snippets${NC}"
    echo -e "  ${GREEN}◆${NC} Google Fonts API"
    echo "    → Docs: https://developers.google.com/fonts/docs/getting_started"
    echo "    → ${YELLOW}Check: Font loading strategies, performance${NC}"
    echo "    → ${RED}Impact: Layout shifts, slow load times${NC}"

    # Deployment & Infrastructure
    echo ""
    echo -e "${MAGENTA}━━━ 🚀 Deployment & Infrastructure ━━━${NC}"
    echo -e "  ${GREEN}◆${NC} Netlify API"
    echo "    → Docs: https://docs.netlify.com/api/get-started/"
    echo "    → Functions: https://docs.netlify.com/functions/overview/"
    echo "    → ${YELLOW}Check: Build hooks, function signatures${NC}"
    echo "    → ${RED}Impact: Failed deployments, broken functions${NC}"

    echo ""
    echo "────────────────────────────────────────────────────────────────────"
    echo -e "${YELLOW}📋 API Documentation Checklist:${NC}"
    echo "1. Check official changelogs for breaking changes"
    echo "2. Verify webhook/callback URLs are still valid"
    echo "3. Test API keys and authentication methods"
    echo "4. Review deprecation notices and migration guides"
    echo "5. Update API version headers where applicable"
    echo ""
    echo -e "${BLUE}💡 TIP: Use WebFetch or WebSearch to check latest API docs${NC}"
    echo -e "${BLUE}   Example: WebFetch(url: 'https://docs.stripe.com/changelog')${NC}"
    echo ""
    echo "════════════════════════════════════════════════════════════════════"
    echo ""
} | tee "$CACHE_FILE"

exit 0
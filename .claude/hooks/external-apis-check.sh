#!/bin/bash

# External APIs Documentation Check Hook
# Monitors business-critical external APIs that can affect functionality

set -euo pipefail

PROJECT_DIR="${CLAUDE_PROJECT_DIR:-$(pwd)}"

# ANSI colors
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
MAGENTA='\033[0;35m'
NC='\033[0m'

echo ""
echo "════════════════════════════════════════════════════════════════════"
echo "🌐 EXTERNAL APIs - Critical Business Dependencies"
echo "────────────────────────────────────────────────────────────────────"
echo ""
echo -e "${RED}⚠️  IMPORTANT: External API changes can break production features!${NC}"
echo ""

# Payment Processing
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
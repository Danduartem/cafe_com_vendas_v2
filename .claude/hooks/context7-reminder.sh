#!/bin/bash

# Context7 Documentation Reminder Hook
# Reminds to use Context7 MCP for latest documentation when editing code

set -euo pipefail

# Only run for certain file types and tools
TOOL_NAME="${1:-}"
FILE_PATH="${2:-}"

# Skip if not a relevant tool
if [[ "$TOOL_NAME" != "Edit" && "$TOOL_NAME" != "MultiEdit" && "$TOOL_NAME" != "Write" ]]; then
    exit 0
fi

# Skip if no file path
if [[ -z "$FILE_PATH" ]]; then
    exit 0
fi

# Check file extension
case "$FILE_PATH" in
    *.ts|*.tsx|*.js|*.jsx|*.json|*.css)
        # Detect which library might be relevant based on file content
        LIBRARIES_TO_CHECK=""
        
        # Check for specific imports or patterns - focus on critical/external APIs
        if [[ "$FILE_PATH" == *"stripe"* ]] || [[ "$FILE_PATH" == *"payment"* ]] || [[ "$FILE_PATH" == *"checkout"* ]]; then
            LIBRARIES_TO_CHECK="stripe"
            echo "   🔴 REVENUE-CRITICAL: Use Context7 for latest Stripe patterns"
            echo "   📋 Quick check: https://docs.stripe.com/changelog"
        elif [[ "$FILE_PATH" == *"mailer"* ]] || [[ "$FILE_PATH" == *"email"* ]] || [[ "$FILE_PATH" == *"subscribe"* ]]; then
            echo "   📧 MailerLite API: https://developers.mailerlite.com/docs"
            echo "   ⚠️  Check subscriber endpoints for changes"
        elif [[ "$FILE_PATH" == *"youtube"* ]] || [[ "$FILE_PATH" == *"video"* ]] || [[ "$FILE_PATH" == *"player"* ]]; then
            echo "   🎥 YouTube API: https://developers.google.com/youtube/iframe_api_reference"
        elif [[ "$FILE_PATH" == *"analytics"* ]] || [[ "$FILE_PATH" == *"gtm"* ]] || [[ "$FILE_PATH" == *"dataLayer"* ]]; then
            echo "   📊 GTM/GA4: Verify dataLayer event structure"
        elif [[ "$FILE_PATH" == *"schema"* ]] || [[ "$FILE_PATH" == *"structured-data"* ]] || [[ "$FILE_PATH" == *"seo"* ]]; then
            echo "   🔍 Schema.org: Test at https://validator.schema.org/"
        elif [[ "$FILE_PATH" == *"cloudinary"* ]] || [[ "$FILE_PATH" == *"image"* ]] || [[ "$FILE_PATH" == *"media"* ]]; then
            echo "   🖼️ Cloudinary API: https://cloudinary.com/documentation"
        # Context7-supported libraries (reduce verbosity, covered in session-start)
        elif [[ "$FILE_PATH" == *"eleventy"* ]] || [[ "$FILE_PATH" == *".11ty."* ]] || [[ "$FILE_PATH" == *"_includes"* ]]; then
            LIBRARIES_TO_CHECK="eleventy"
        elif [[ "$FILE_PATH" == *"test"* ]] || [[ "$FILE_PATH" == *"spec"* ]] || [[ "$FILE_PATH" == *"e2e"* ]]; then
            LIBRARIES_TO_CHECK="vitest playwright"
        elif [[ "$FILE_PATH" == *"tailwind"* ]] || [[ "$FILE_PATH" == *.css ]]; then
            LIBRARIES_TO_CHECK="tailwindcss"
        elif [[ "$FILE_PATH" == *"vite"* ]] || [[ "$FILE_PATH" == *"config"* ]]; then
            LIBRARIES_TO_CHECK="vite"
        fi
        
        if [[ -n "$LIBRARIES_TO_CHECK" ]]; then
            echo ""
            echo "💡 CONTEXT7 REMINDER: Consider checking latest docs for: $LIBRARIES_TO_CHECK"
            echo "   Use: mcp__context7__resolve-library-id then mcp__context7__get-library-docs"
        fi
        ;;
esac

exit 0
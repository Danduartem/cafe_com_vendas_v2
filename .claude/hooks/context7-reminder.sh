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
    *.ts|*.tsx|*.js|*.jsx|*.json|*.css|*.njk|*.md|*.config.js|*.config.ts)
        # Detect which library might be relevant based on file content
        LIBRARIES_TO_CHECK=""
        
        # Check for specific imports or patterns - focus on critical/external APIs
        if [[ "$FILE_PATH" == *"stripe"* ]] || [[ "$FILE_PATH" == *"payment"* ]] || [[ "$FILE_PATH" == *"checkout"* ]]; then
            LIBRARIES_TO_CHECK="stripe"
            echo "   🔴 REVENUE-CRITICAL: Use Context7 for latest Stripe patterns"
            echo "   💡 Context7 Quick: mcp__context7__resolve-library-id 'stripe'"
            
            # Detect specific Stripe patterns for targeted topics
            if [[ "$FILE_PATH" == *"checkout"* ]] || [[ "$FILE_PATH" == *"session"* ]]; then
                echo "   🎯 Suggested topic: 'checkout sessions and payment methods' (2500 tokens)"
            elif [[ "$FILE_PATH" == *"webhook"* ]] || [[ "$FILE_PATH" == *"event"* ]]; then
                echo "   🎯 Suggested topic: 'webhook verification and event handling' (2000 tokens)"
            elif [[ "$FILE_PATH" == *"subscription"* ]] || [[ "$FILE_PATH" == *"billing"* ]]; then
                echo "   🎯 Suggested topic: 'subscription lifecycle and billing' (3000 tokens)"
            else
                echo "   🎯 Suggested topic: 'payment intents and checkout patterns' (2500 tokens)"
            fi
            echo "   📋 Fallback check: https://docs.stripe.com/changelog"
        elif [[ "$FILE_PATH" == *"mailer"* ]] || [[ "$FILE_PATH" == *"email"* ]] || [[ "$FILE_PATH" == *"subscribe"* ]]; then
            echo "   📧 MailerLite API: https://developers.mailerlite.com/docs"
            echo "   ⚠️  Check subscriber endpoints for changes"
        elif [[ "$FILE_PATH" == *"youtube"* ]] || [[ "$FILE_PATH" == *"video"* ]] || [[ "$FILE_PATH" == *"player"* ]]; then
            echo "   🎥 YouTube API: https://developers.google.com/youtube/iframe_api_reference"
        # External APIs with Context7 integration (frequent API changes)
        elif [[ "$FILE_PATH" == *"segment"* ]] || [[ "$FILE_PATH" == *"twilio"* ]] || [[ "$FILE_PATH" == *"track("* ]]; then
            LIBRARIES_TO_CHECK="twilio-segment"
            echo "   📊 Context7 Quick: mcp__context7__resolve-library-id 'twilio'"
            echo "   🎯 Suggested topic: 'analytics tracking and event patterns' (2000 tokens)"
            echo "   ⚡ Focus: Segment integration, event tracking, user identification"
        elif [[ "$FILE_PATH" == *"netlify"* ]] || [[ "$FILE_PATH" == *"functions/"* ]] || [[ "$FILE_PATH" == *".netlify/"* ]]; then
            LIBRARIES_TO_CHECK="netlify"
            echo "   🚀 Context7 Quick: mcp__context7__resolve-library-id 'netlify'"
            if [[ "$FILE_PATH" == *"functions"* ]] || [[ "$FILE_PATH" == *"serverless"* ]]; then
                echo "   🎯 Suggested topic: 'serverless functions and edge handlers' (2500 tokens)"
            else
                echo "   🎯 Suggested topic: 'deployment and build configuration' (2000 tokens)"
            fi
            echo "   ⚡ Focus: Functions API, build hooks, deployment patterns"
        elif [[ "$FILE_PATH" == *"firecrawl"* ]] || [[ "$FILE_PATH" == *"scrape"* ]] || [[ "$FILE_PATH" == *"crawl"* ]]; then
            LIBRARIES_TO_CHECK="firecrawl"
            echo "   🕷️ Context7 Quick: mcp__context7__resolve-library-id 'firecrawl'"
            echo "   🎯 Suggested topic: 'scraping and extraction patterns' (2000 tokens)"
            echo "   ⚡ Focus: API rate limits, markdown extraction, batch operations"
        # General external APIs (static documentation links)
        elif [[ "$FILE_PATH" == *"analytics"* ]] || [[ "$FILE_PATH" == *"gtm"* ]] || [[ "$FILE_PATH" == *"dataLayer"* ]]; then
            echo "   📊 GTM/GA4: Verify dataLayer event structure"
        elif [[ "$FILE_PATH" == *"schema"* ]] || [[ "$FILE_PATH" == *"structured-data"* ]] || [[ "$FILE_PATH" == *"seo"* ]]; then
            echo "   🔍 Schema.org: Test at https://validator.schema.org/"
        elif [[ "$FILE_PATH" == *"cloudinary"* ]] || [[ "$FILE_PATH" == *"image"* ]] || [[ "$FILE_PATH" == *"media"* ]]; then
            echo "   🖼️ Cloudinary API: https://cloudinary.com/documentation"
        # High-impact configuration libraries (frequent API changes)
        elif [[ "$FILE_PATH" == *"eslint"* ]] || [[ "$FILE_PATH" == *".eslintrc"* ]] || [[ "$FILE_PATH" == "eslint.config."* ]]; then
            LIBRARIES_TO_CHECK="eslint"
            echo "   📦 Context7 Quick: mcp__context7__resolve-library-id 'eslint'"
            if [[ "$FILE_PATH" == *"config"* ]] || [[ "$FILE_PATH" == *".eslintrc"* ]]; then
                echo "   🎯 Suggested topic: 'flat config and v9 migration patterns' (2000 tokens)"
            else
                echo "   🎯 Suggested topic: 'typescript-eslint integration' (2000 tokens)"
            fi
            echo "   ⚡ Focus: Flat config format, TypeScript integration"
        elif [[ "$FILE_PATH" == *"tsconfig"* ]] || [[ "$FILE_PATH" == *"typescript"* && "$FILE_PATH" == *"config"* ]]; then
            LIBRARIES_TO_CHECK="typescript"
            echo "   📦 Context7 Quick: mcp__context7__resolve-library-id 'typescript'"
            echo "   🎯 Suggested topic: 'compiler options and strict mode' (1500 tokens)"
            echo "   ⚡ Focus: Latest compiler options, module resolution"
        elif [[ "$FILE_PATH" == *"msw"* ]] || [[ "$FILE_PATH" == *"mock"* ]] || [[ "$FILE_PATH" == *"mocks"* ]]; then
            LIBRARIES_TO_CHECK="msw"
            echo "   📦 Context7 Quick: mcp__context7__resolve-library-id 'msw'"
            echo "   🎯 Suggested topic: 'request handlers and mocking patterns' (2000 tokens)"
            echo "   ⚡ Focus: v2 API changes, browser/node compatibility"
        # Context7-supported libraries with targeted guidance
        elif [[ "$FILE_PATH" == *"eleventy"* ]] || [[ "$FILE_PATH" == *".11ty."* ]] || [[ "$FILE_PATH" == *"_includes"* ]]; then
            LIBRARIES_TO_CHECK="eleventy"
            echo "   📦 Context7 Quick: mcp__context7__resolve-library-id 'eleventy'"
            if [[ "$FILE_PATH" == *"_includes"* ]] || [[ "$FILE_PATH" == *.njk ]]; then
                echo "   🎯 Suggested topic: 'template syntax and data cascade' (2000 tokens)"
            elif [[ "$FILE_PATH" == *"config"* ]] || [[ "$FILE_PATH" == *".11ty."* ]]; then
                echo "   🎯 Suggested topic: 'build configuration and optimization' (2500 tokens)"
            else
                echo "   🎯 Suggested topic: 'eleventy v3 features and patterns' (2000 tokens)"
            fi
        elif [[ "$FILE_PATH" == *"test"* ]] || [[ "$FILE_PATH" == *"spec"* ]] || [[ "$FILE_PATH" == *"e2e"* ]]; then
            LIBRARIES_TO_CHECK="vitest playwright"
            if [[ "$FILE_PATH" == *"e2e"* ]] || [[ "$FILE_PATH" == *"playwright"* ]]; then
                echo "   📦 Context7 Quick: mcp__context7__resolve-library-id 'playwright'"
                echo "   🎯 Suggested topic: 'browser automation and selectors' (2500 tokens)"
            else
                echo "   📦 Context7 Quick: mcp__context7__resolve-library-id 'vitest'"
                echo "   🎯 Suggested topic: 'testing patterns and mocking' (2000 tokens)"
            fi
        elif [[ "$FILE_PATH" == *"tailwind"* ]] || [[ "$FILE_PATH" == *.css ]]; then
            LIBRARIES_TO_CHECK="tailwindcss"
            echo "   📦 Context7 Quick: mcp__context7__resolve-library-id 'tailwindcss'"
            echo "   🎯 Suggested topic: 'v4 utility classes and theme patterns' (1500 tokens)"
            echo "   ⚡ Focus: CSS-first approach, @theme directive, new utilities"
        elif [[ "$FILE_PATH" == *"vite"* ]] || [[ "$FILE_PATH" == *"config"* ]]; then
            LIBRARIES_TO_CHECK="vite"
            echo "   📦 Context7 Quick: mcp__context7__resolve-library-id 'vite'"
            if [[ "$FILE_PATH" == *"config"* ]]; then
                echo "   🎯 Suggested topic: 'build configuration and plugins' (2000 tokens)"
            else
                echo "   🎯 Suggested topic: 'HMR and development patterns' (1500 tokens)"
            fi
        fi
        
        # Add content-aware topic detection for even more precision
        if [[ -n "$LIBRARIES_TO_CHECK" ]] && [[ -f "$FILE_PATH" ]]; then
            echo ""
            echo "💡 ENHANCED CONTEXT7: Token-optimized targeting for $LIBRARIES_TO_CHECK"
            
            # Advanced pattern detection from file content
            CONTENT=$(head -20 "$FILE_PATH" 2>/dev/null || true)
            
            if [[ "$CONTENT" =~ PaymentIntent|checkout|stripe\.checkout ]]; then
                echo "   🔍 Detected: Payment Intent patterns"
                echo "   🎯 Refined topic: 'payment intents and confirmation' (2000 tokens)"
            elif [[ "$CONTENT" =~ webhook|stripe\.webhooks|constructEvent ]]; then
                echo "   🔍 Detected: Webhook handling patterns"
                echo "   🎯 Refined topic: 'webhook signature verification' (1800 tokens)"
            elif [[ "$CONTENT" =~ @apply|theme\(|@theme ]]; then
                echo "   🔍 Detected: Tailwind v4 patterns"
                echo "   🎯 Refined topic: 'theme function and apply directive' (1200 tokens)"
            elif [[ "$CONTENT" =~ eslint|@typescript-eslint|flatConfig|languageOptions ]]; then
                echo "   🔍 Detected: ESLint configuration patterns"
                echo "   🎯 Refined topic: 'flat config migration and typescript rules' (1800 tokens)"
            elif [[ "$CONTENT" =~ import.*vitest|describe\(|test\(|expect\( ]]; then
                echo "   🔍 Detected: Vitest test patterns"
                echo "   🎯 Refined topic: 'test configuration and assertions' (1500 tokens)"
            elif [[ "$CONTENT" =~ msw|setupServer|rest\.|http\.|handlers ]]; then
                echo "   🔍 Detected: MSW API mocking patterns"
                echo "   🎯 Refined topic: 'v2 handler setup and request matching' (1800 tokens)"
            elif [[ "$CONTENT" =~ compilerOptions|moduleResolution|strict|target ]]; then
                echo "   🔍 Detected: TypeScript compiler configuration"
                echo "   🎯 Refined topic: 'compiler options and module resolution' (1200 tokens)"
            elif [[ "$CONTENT" =~ analytics\.track|segment|identify\(|page\( ]]; then
                echo "   🔍 Detected: Segment/Twilio analytics patterns"
                echo "   🎯 Refined topic: 'event tracking and user identification' (1800 tokens)"
            elif [[ "$CONTENT" =~ netlify|Handler|event\,|context\, ]]; then
                echo "   🔍 Detected: Netlify Functions patterns"
                echo "   🎯 Refined topic: 'serverless function handlers and deployment' (2000 tokens)"
            elif [[ "$CONTENT" =~ FirecrawlApp|scrape|crawl|extract ]]; then
                echo "   🔍 Detected: Firecrawl API patterns"
                echo "   🎯 Refined topic: 'web scraping and data extraction' (1800 tokens)"
            fi
            
            echo "   ⚡ TOKEN OPTIMIZATION: Use specific topics above to get 70% fewer tokens"
            echo "   📖 Standard flow: mcp__context7__resolve-library-id → mcp__context7__get-library-docs"
        elif [[ -n "$LIBRARIES_TO_CHECK" ]]; then
            echo ""
            echo "💡 CONTEXT7 REMINDER: Use token-optimized targeting for: $LIBRARIES_TO_CHECK"
            echo "   📖 Flow: mcp__context7__resolve-library-id → mcp__context7__get-library-docs + tokens param"
        fi
        ;;
esac

exit 0
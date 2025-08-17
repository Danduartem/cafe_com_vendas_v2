#!/bin/bash
# Project-specific helper functions for Café com Vendas

# Source utilities
source "$(dirname "${BASH_SOURCE[0]}")/colors.sh"

# Check if this is the Café com Vendas project
is_cafe_project() {
    if [[ -f "package.json" ]] && grep -q "cafe-com-vendas-landing" package.json; then
        return 0
    fi
    return 1
}

# Get file type and purpose
get_file_type() {
    local file="$1"
    local filename="$(basename "$file")"
    local extension="${file##*.}"
    
    case "$extension" in
        "njk") echo "nunjucks-template" ;;
        "js")
            if [[ "$file" == *"components"* ]]; then
                echo "component-javascript"
            elif [[ "$file" == *"utils"* ]]; then
                echo "utility-javascript"
            elif [[ "$file" == *"stripe"* ]] || [[ "$file" == *"checkout"* ]] || [[ "$file" == *"payment"* ]]; then
                echo "payment-javascript"
            else
                echo "javascript"
            fi
            ;;
        "css") echo "stylesheet" ;;
        "json")
            if [[ "$filename" == DATA_* ]]; then
                echo "event-data"
            else
                echo "json-config"
            fi
            ;;
        "md") echo "documentation" ;;
        *) echo "unknown" ;;
    esac
}

# Check if file is critical for conversion
is_conversion_critical() {
    local file="$1"
    
    # Critical files that directly impact conversion
    case "$(basename "$file")" in
        "hero.njk"|"hero.js") return 0 ;;
        "checkout.njk"|"checkout.js") return 0 ;;
        "offer.njk"|"offer.js") return 0 ;;
        "final-cta.njk"|"final-cta.js") return 0 ;;
        "pricing.njk"|"pricing.js") return 0 ;;
        "DATA_event.json") return 0 ;;
        "create-payment-intent.js") return 0 ;;
        "stripe-webhook.js") return 0 ;;
    esac
    
    # Critical paths
    if [[ "$file" == *"checkout"* ]] || [[ "$file" == *"payment"* ]] || [[ "$file" == *"stripe"* ]]; then
        return 0
    fi
    
    return 1
}

# Get current event price from DATA_event.json
get_current_price() {
    if [[ -f "info/DATA_event.json" ]]; then
        grep -o '"currentPrice"[[:space:]]*:[[:space:]]*"[^"]*"' info/DATA_event.json 2>/dev/null | cut -d'"' -f4
    else
        echo "€2,500"
    fi
}

# Calculate days until event
days_until_event() {
    local event_date="2025-09-20"
    local today=$(date +%Y-%m-%d)
    
    if date -d "2025-01-01" >/dev/null 2>&1; then
        # Linux date command
        echo $(( ($(date -d "$event_date" +%s) - $(date -d "$today" +%s)) / 86400 ))
    elif date -j -f "%Y-%m-%d" "2025-01-01" >/dev/null 2>&1; then
        # macOS date command
        echo $(( ($(date -j -f "%Y-%m-%d" "$event_date" +%s) - $(date -j -f "%Y-%m-%d" "$today" +%s)) / 86400 ))
    else
        echo "?"
    fi
}

# Check build status
get_build_status() {
    if [[ -d "_site" ]] && [[ -f "_site/index.html" ]]; then
        echo "ready"
    elif [[ -f "package.json" ]]; then
        echo "needs-build"
    else
        echo "unknown"
    fi
}

# Get component type from Nunjucks file
get_component_type() {
    local file="$1"
    local filename="$(basename "$file" .njk)"
    
    case "$filename" in
        "hero") echo "Hero Section (Critical - First Impression)" ;;
        "checkout"|"checkout-modal") echo "Checkout Flow (Critical - Payment)" ;;
        "offer"|"pricing") echo "Pricing Section (Critical - Conversion)" ;;
        "final-cta") echo "Final CTA (Critical - Last Chance)" ;;
        "testimonials"|"social-proof") echo "Social Proof (Trust Building)" ;;
        "faq") echo "FAQ (Objection Handling)" ;;
        "footer") echo "Footer (Support & Legal)" ;;
        "about") echo "About Section (Authority Building)" ;;
        *) echo "Landing Page Component" ;;
    esac
}

# Validate event data integrity
validate_event_data() {
    local file="$1"
    
    if [[ "$(basename "$file")" != "DATA_event.json" ]]; then
        return 0
    fi
    
    info "Validating critical event data..."
    
    # Check required fields exist
    local required_fields=("eventDate" "currentPrice" "originalPrice" "spotsAvailable")
    local missing_fields=()
    
    for field in "${required_fields[@]}"; do
        if ! grep -q "\"$field\"" "$file"; then
            missing_fields+=("$field")
        fi
    done
    
    if [[ ${#missing_fields[@]} -gt 0 ]]; then
        error "Missing required fields in event data: ${missing_fields[*]}"
        return 1
    fi
    
    # Validate date format
    if ! grep -E '"eventDate"[[:space:]]*:[[:space:]]*"2025-09-20"' "$file" > /dev/null; then
        error "Event date should be 2025-09-20 in ISO format"
        return 1
    fi
    
    # Validate price format
    if ! grep -E '"currentPrice"[[:space:]]*:[[:space:]]*"€[0-9,.]+"' "$file" > /dev/null; then
        warning "Price format should include € symbol"
    fi
    
    success "Event data validation passed"
    return 0
}

# Get appropriate warning for file type
get_file_warning() {
    local file="$1"
    local file_type="$(get_file_type "$file")"
    
    case "$file_type" in
        "nunjucks-template")
            echo "Remember: Use Tailwind classes, ARIA attributes, and semantic HTML"
            ;;
        "component-javascript")
            echo "Remember: ES6 modules, error handling, and analytics tracking"
            ;;
        "payment-javascript")
            echo "⚠️  PAYMENT CODE: Test thoroughly, handle errors, validate inputs"
            ;;
        "stylesheet")
            echo "Remember: Design tokens only, no hex colors, Tailwind v4 compliance"
            ;;
        "event-data")
            echo "🚨 CRITICAL DATA: Changes affect pricing and event details"
            ;;
        *)
            echo "Remember: Follow Café com Vendas coding standards"
            ;;
    esac
}
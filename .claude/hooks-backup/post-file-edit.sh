#!/bin/bash
# Intelligent post-edit validation for Café com Vendas
# File-type aware validation and compliance checking

# Source utilities
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/utils/colors.sh"
source "$SCRIPT_DIR/utils/validators.sh"
source "$SCRIPT_DIR/utils/project-helpers.sh"

# Exit if not Café com Vendas project
if ! is_cafe_project; then
    exit 0
fi

# Get the edited file path (passed as argument or detect from context)
FILE_PATH="${1:-}"
if [[ -z "$FILE_PATH" ]]; then
    cafe_log "info" "File edited - running general validation"
    FILE_PATH="."
fi

# Skip if it's a directory
if [[ -d "$FILE_PATH" ]]; then
    exit 0
fi

# Get file information
FILE_TYPE="$(get_file_type "$FILE_PATH")"
FILE_NAME="$(basename "$FILE_PATH")"

cafe_log "info" "File edited: $FILE_NAME ($(blue "$FILE_TYPE"))"

# Type-specific validation
case "$FILE_TYPE" in
    "nunjucks-template")
        check "Validating Nunjucks template..."
        check_tailwind_compliance "$FILE_PATH"
        check_design_tokens "$FILE_PATH"
        check_accessibility "$FILE_PATH"
        validate_portuguese_content "$FILE_PATH"
        echo "🎨 $(get_file_warning "$FILE_PATH")"
        ;;
        
    "component-javascript"|"javascript")
        check "Validating JavaScript module..."
        check_api_security "$FILE_PATH"
        check_file_size "$FILE_PATH" 50  # 50KB limit for JS files
        
        # Check for console.log statements
        if grep -q 'console\.log' "$FILE_PATH"; then
            warning "console.log found in $FILE_NAME - remove before production"
        fi
        
        # Check for proper error handling in payment code
        if [[ "$FILE_TYPE" == *"payment"* ]] && ! grep -q 'catch\|try' "$FILE_PATH"; then
            warning "Payment code should include error handling"
        fi
        
        echo "📦 $(get_file_warning "$FILE_PATH")"
        ;;
        
    "payment-javascript")
        check "Validating PAYMENT CODE..."
        check_api_security "$FILE_PATH"
        
        # Extra security checks for payment files
        if ! grep -q 'stripe.webhooks.constructEvent\|webhook' "$FILE_PATH"; then
            warning "Webhook signature validation recommended"
        fi
        
        if ! grep -q 'catch\|try' "$FILE_PATH"; then
            error "Payment code MUST include error handling"
        fi
        
        success "Payment validation complete"
        echo "💳 $(get_file_warning "$FILE_PATH")"
        ;;
        
    "stylesheet")
        check "Validating CSS compliance..."
        check_tailwind_compliance "$FILE_PATH"
        check_design_tokens "$FILE_PATH"
        
        # Check for Tailwind v4 compliance
        if grep -q '@import.*tailwind' "$FILE_PATH"; then
            info "Tailwind CSS imports detected"
        fi
        
        echo "💄 $(get_file_warning "$FILE_PATH")"
        ;;
        
    "event-data")
        check "Validating CRITICAL event data..."
        validate_json "$FILE_PATH"
        validate_event_data "$FILE_PATH"
        
        if [[ "$FILE_NAME" == "DATA_event.json" ]]; then
            error "🚨 CRITICAL: Event data modified - review pricing and dates!"
            info "Current price: $(get_current_price)"
            info "Days until event: $(days_until_event)"
        fi
        
        echo "📅 $(get_file_warning "$FILE_PATH")"
        ;;
        
    "json-config")
        check "Validating JSON configuration..."
        validate_json "$FILE_PATH"
        echo "⚙️  JSON configuration updated"
        ;;
        
    *)
        cafe_log "info" "File type: $FILE_TYPE"
        echo "📝 $(get_file_warning "$FILE_PATH")"
        ;;
esac

# Special handling for conversion-critical files
if is_conversion_critical "$FILE_PATH"; then
    warning "🎯 CONVERSION CRITICAL: $(get_component_type "$FILE_PATH")"
    info "Test thoroughly before deployment"
fi

# Final message
success "File validation complete"
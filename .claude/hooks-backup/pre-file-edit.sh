#!/bin/bash
# Intelligent pre-edit context for Café com Vendas
# Shows file-specific warnings and guidance

# Source utilities
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/utils/colors.sh"
source "$SCRIPT_DIR/utils/project-helpers.sh"

# Exit if not Café com Vendas project
if ! is_cafe_project; then
    exit 0
fi

# Get the file being edited
FILE_PATH="${1:-}"
if [[ -z "$FILE_PATH" ]] || [[ -d "$FILE_PATH" ]]; then
    cafe_log "info" "Editing file in Café com Vendas project..."
    exit 0
fi

# Get file information
FILE_TYPE="$(get_file_type "$FILE_PATH")"
FILE_NAME="$(basename "$FILE_PATH")"

# Show context-aware editing message
case "$FILE_TYPE" in
    "nunjucks-template")
        COMPONENT_TYPE="$(get_component_type "$FILE_PATH")"
        cafe_log "info" "✏️  Editing template: $(yellow "$FILE_NAME")"
        info "Component: $COMPONENT_TYPE"
        ;;
        
    "payment-javascript")
        cafe_log "warning" "⚠️  Editing PAYMENT CODE: $(red "$FILE_NAME")"
        warning "🚨 Test thoroughly with Stripe test cards after changes"
        ;;
        
    "event-data")
        cafe_log "error" "🚨 Editing CRITICAL EVENT DATA: $(red "$FILE_NAME")"
        error "Changes affect pricing and event details across the site!"
        info "Current price: $(get_current_price)"
        info "Days until event: $(days_until_event)"
        ;;
        
    "component-javascript")
        cafe_log "info" "📦 Editing component: $(blue "$FILE_NAME")"
        ;;
        
    "stylesheet")
        cafe_log "info" "💄 Editing stylesheet: $(purple "$FILE_NAME")"
        info "Remember: Use design tokens only, no hex colors"
        ;;
        
    *)
        cafe_log "info" "✏️  Editing: $(cyan "$FILE_NAME") ($(blue "$FILE_TYPE"))"
        ;;
esac

# Special warnings for conversion-critical files
if is_conversion_critical "$FILE_PATH"; then
    warning "🎯 CONVERSION CRITICAL: Changes impact revenue!"
    info "Test thoroughly on mobile (primary traffic source)"
fi
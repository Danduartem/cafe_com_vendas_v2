#!/bin/bash
# Lightweight post-edit validation for Café com Vendas
# Essential checks only - comprehensive validation available manually

SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/utils/colors.sh"
source "$SCRIPT_DIR/utils/project-helpers.sh"

# Exit if not Café com Vendas project
if ! is_cafe_project; then exit 0; fi

FILE_PATH="${1:-}"
if [[ -z "$FILE_PATH" ]] || [[ -d "$FILE_PATH" ]]; then exit 0; fi

FILE_TYPE="$(get_file_type "$FILE_PATH")"
FILE_NAME="$(basename "$FILE_PATH")"

# Quick essential checks only
case "$FILE_TYPE" in
    "payment-javascript")
        if ! grep -q 'catch\|try' "$FILE_PATH"; then
            error "💳 Payment code missing error handling"
        fi
        ;;
    "event-data")
        if [[ "$FILE_NAME" == "DATA_event.json" ]]; then
            warning "🚨 Event data modified - verify pricing/dates"
        fi
        ;;
esac

# Conversion-critical file warning
if is_conversion_critical "$FILE_PATH"; then
    warning "🎯 Conversion-critical file: Test thoroughly"
fi

success "✅ $(get_component_type "$FILE_PATH")"
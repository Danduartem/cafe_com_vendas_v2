#!/bin/bash
# Intelligent post-create validation for Café com Vendas
# File-type aware creation guidelines and setup

# Source utilities
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/utils/colors.sh"
source "$SCRIPT_DIR/utils/validators.sh"
source "$SCRIPT_DIR/utils/project-helpers.sh"

# Exit if not Café com Vendas project
if ! is_cafe_project; then
    exit 0
fi

# Get the created file path
FILE_PATH="${1:-}"
if [[ -z "$FILE_PATH" ]] || [[ -d "$FILE_PATH" ]]; then
    cafe_log "info" "File created in Café com Vendas project"
    exit 0
fi

# Get file information
FILE_TYPE="$(get_file_type "$FILE_PATH")"
FILE_NAME="$(basename "$FILE_PATH")"

cafe_log "success" "File created: $FILE_NAME ($(green "$FILE_TYPE"))"

# Type-specific creation guidance
case "$FILE_TYPE" in
    "nunjucks-template")
        success "Nunjucks template created"
        info "Template best practices:"
        info "  • Use semantic HTML elements"
        info "  • Include ARIA labels for interactive elements"
        info "  • Apply Tailwind classes only (no inline styles)"
        info "  • Ensure WCAG AA contrast ratios (4.5:1)"
        info "  • Add data-analytics attributes for tracking"
        
        # Check if it's a component
        COMPONENT_TYPE="$(get_component_type "$FILE_PATH")"
        if [[ "$COMPONENT_TYPE" != "Landing Page Component" ]]; then
            warning "Creating: $COMPONENT_TYPE"
        fi
        ;;
        
    "component-javascript"|"javascript")
        success "JavaScript module created"
        info "JavaScript best practices:"
        info "  • Use ES6 module syntax (import/export)"
        info "  • Include proper error handling (try/catch)"
        info "  • Add JSDoc comments for functions"
        info "  • Use design tokens for any styles"
        info "  • Implement proper event cleanup"
        
        if [[ "$FILE_TYPE" == "component-javascript" ]]; then
            info "Component structure:"
            info "  • Export object with init() method"
            info "  • Use safeQuery() for DOM selection"
            info "  • Bind events in init method"
            info "  • Follow existing component patterns"
        fi
        ;;
        
    "payment-javascript")
        warning "🚨 PAYMENT CODE CREATED"
        info "Payment security requirements:"
        info "  • NEVER log sensitive payment data"
        info "  • Use test API keys during development"
        info "  • Implement robust error handling"
        info "  • Validate all inputs before processing"
        info "  • Use webhook signature verification"
        info "  • Follow PCI compliance guidelines"
        error "⚠️  Test thoroughly with Stripe test cards"
        ;;
        
    "stylesheet")
        success "CSS file created"
        info "CSS best practices:"
        info "  • Use @theme for Tailwind v4 configuration"
        info "  • Reference design tokens only (no hex colors)"
        info "  • Follow mobile-first responsive design"
        info "  • Ensure proper contrast for accessibility"
        info "  • Use CSS custom properties from tokens"
        ;;
        
    "event-data")
        error "🚨 CRITICAL EVENT DATA FILE CREATED"
        warning "This file controls pricing, dates, and event details!"
        info "Required fields:"
        info "  • eventDate: '2025-09-20'"
        info "  • currentPrice: '€2,500'"
        info "  • spotsAvailable: 8"
        info "  • location: 'Lisbon, Portugal'"
        error "⚠️  Changes to this file affect the entire funnel"
        ;;
        
    "json-config")
        success "JSON configuration created"
        validate_json "$FILE_PATH"
        info "Ensure proper JSON syntax and structure"
        ;;
        
    "documentation")
        success "Documentation file created"
        info "Keep documentation updated with code changes"
        ;;
        
    *)
        success "File created successfully"
        info "$(get_file_warning "$FILE_PATH")"
        ;;
esac

# Special guidance for conversion-critical files
if is_conversion_critical "$FILE_PATH"; then
    error "🎯 CONVERSION CRITICAL FILE CREATED"
    warning "This file directly impacts revenue generation!"
    info "Component: $(get_component_type "$FILE_PATH")"
    info "• Test on mobile devices (primary traffic)"
    info "• Validate with Portuguese users"
    info "• Monitor performance impact"
    info "• A/B test any major changes"
fi

# Final WCAG AA reminder
info "Remember: WCAG AA compliance required (4.5:1 contrast ratio)"
success "Ready for Café com Vendas development! ☕"
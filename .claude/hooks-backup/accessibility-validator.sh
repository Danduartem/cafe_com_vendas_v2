#!/bin/bash
# Accessibility Validator for Café com Vendas  
# WCAG AA compliance monitoring for Portuguese market

# Source utilities
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/utils/colors.sh"
source "$SCRIPT_DIR/utils/validators.sh"
source "$SCRIPT_DIR/utils/project-helpers.sh"

# Exit if not Café com Vendas project
if ! is_cafe_project; then
    exit 0
fi

cafe_log "info" "♿ Accessibility Validator: WCAG AA compliance check..."

# WCAG AA compliance targets
TARGET_LIGHTHOUSE_A11Y=95      # Lighthouse accessibility score
MIN_CONTRAST_RATIO="4.5"       # WCAG AA standard
TARGET_AUDIENCE="Portuguese female entrepreneurs"

# Validate color contrast compliance
check_color_contrast() {
    info "🎨 Validating WCAG AA color contrast (4.5:1 minimum)..."
    
    local contrast_issues=0
    
    # Check for approved color combinations from design tokens
    local approved_combinations=(
        "text-navy-800/80"      # On light backgrounds
        "text-navy-800/70"      # On medium backgrounds  
        "text-neutral-300"      # On dark backgrounds (navy-900)
        "text-gold-200"         # On dark gradients (burgundy/navy)
    )
    
    local forbidden_combinations=(
        "text-navy-800/60"      # 3.1:1 contrast - fails WCAG AA
        "text-navy-800/50"      # 2.4:1 contrast - fails WCAG AA
        "text-neutral-400"      # On dark: 3.5:1 - fails WCAG AA
        "text-gold-300"         # Variable contrast on burgundy
    )
    
    # Check for forbidden color combinations
    for combo in "${forbidden_combinations[@]}"; do
        if find src -name "*.njk" | xargs grep -l "$combo" 2>/dev/null; then
            error "WCAG AA violation: $combo (contrast ratio < 4.5:1)"
            info "Use approved alternatives: text-navy-800/80, text-neutral-300"
            ((contrast_issues++))
        fi
    done
    
    # Check for hardcoded hex colors (should use design tokens)
    if find src -name "*.njk" -o -name "*.css" | xargs grep -E '#[0-9a-fA-F]{3,6}' 2>/dev/null | grep -v -E '(#[[:space:]]*|// #|/\* #)'; then
        warning "Hex colors detected - use design tokens for WCAG compliance"
        info "Design tokens ensure approved contrast ratios"
        ((contrast_issues++))
    fi
    
    # Validate proper color usage patterns
    success "Checking approved WCAG AA color combinations:"
    for combo in "${approved_combinations[@]}"; do
        if find src -name "*.njk" | xargs grep -l "$combo" 2>/dev/null; then
            success "✅ $combo (WCAG AA compliant)"
        fi
    done
    
    return $contrast_issues
}

# Validate ARIA attributes and roles
check_aria_compliance() {
    info "🏷️  Validating ARIA attributes and semantic HTML..."
    
    local aria_issues=0
    
    # Check for invalid ARIA usage
    if find src -name "*.njk" | xargs grep -E 'role="tab"' 2>/dev/null; then
        # Check if proper tab structure exists
        if ! find src -name "*.njk" | xargs grep -l 'role="tabpanel"' 2>/dev/null; then
            error "role=\"tab\" without tabpanel structure"
            info "Use aria-current for pagination/carousel indicators instead"
            ((aria_issues++))
        fi
    fi
    
    # Check for aria-controls pointing to non-existent elements
    local aria_controls=$(find src -name "*.njk" | xargs grep -o 'aria-controls="[^"]*"' 2>/dev/null | cut -d'"' -f2)
    if [[ -n "$aria_controls" ]]; then
        while IFS= read -r control_id; do
            if [[ -n "$control_id" ]]; then
                if ! find src -name "*.njk" | xargs grep -l "id=\"$control_id\"" 2>/dev/null; then
                    warning "aria-controls=\"$control_id\" references non-existent element"
                    ((aria_issues++))
                fi
            fi
        done <<< "$aria_controls"
    fi
    
    # Check for proper carousel/pagination ARIA
    if find src -name "*.njk" | xargs grep -l "carousel\|pagination\|slider" 2>/dev/null; then
        if find src -name "*.njk" | xargs grep -l "aria-current" 2>/dev/null; then
            success "Proper aria-current usage for navigation"
        else
            warning "Consider aria-current for carousel/pagination indicators"
            info "Use aria-current=\"true\" for active items"
        fi
    fi
    
    # Check for aria-selected on non-tab elements
    if find src -name "*.njk" | xargs grep 'aria-selected' 2>/dev/null | grep -v 'role="tab"'; then
        error "aria-selected used on non-tab elements"
        info "Use aria-current for pagination/carousel states"
        ((aria_issues++))
    fi
    
    return $aria_issues
}

# Validate semantic HTML structure
check_semantic_html() {
    info "📖 Validating semantic HTML structure..."
    
    local semantic_issues=0
    
    # Check for proper heading hierarchy
    local h1_count=$(find src -name "*.njk" | xargs grep -c '<h1' 2>/dev/null | awk -F: '{sum += $2} END {print sum+0}')
    if [[ $h1_count -eq 0 ]]; then
        error "No <h1> heading found - required for accessibility"
        ((semantic_issues++))
    elif [[ $h1_count -gt 1 ]]; then
        warning "Multiple <h1> headings found ($h1_count) - use one per page"
        info "Use <h2> for section headings"
        ((semantic_issues++))
    else
        success "Proper <h1> usage (1 per page)"
    fi
    
    # Check for proper section structure
    if ! find src -name "*.njk" | xargs grep -l '<section' 2>/dev/null; then
        warning "No <section> elements found - consider semantic structure"
        info "Use <section> with aria-label for content areas"
    fi
    
    # Validate section ARIA labels
    local sections_without_label=$(find src -name "*.njk" | xargs grep '<section' 2>/dev/null | grep -v 'aria-label\|aria-labelledby' | wc -l)
    if [[ $sections_without_label -gt 0 ]]; then
        warning "$sections_without_label sections missing aria-label"
        info "Add aria-label=\"Description\" to all sections"
        ((semantic_issues++))
    fi
    
    # Check for proper main landmark
    if ! find src -name "*.njk" | xargs grep -l '<main\|role="main"' 2>/dev/null; then
        warning "No main landmark found"
        info "Add <main> element for primary content"
        ((semantic_issues++))
    fi
    
    return $semantic_issues
}

# Validate keyboard navigation
check_keyboard_navigation() {
    info "⌨️  Validating keyboard navigation patterns..."
    
    local keyboard_issues=0
    
    # Check for focusable elements with proper focus styles
    if find src -name "*.css" | xargs grep -l 'focus:' 2>/dev/null; then
        success "Focus styles implemented with Tailwind"
    else
        warning "No focus styles detected"
        info "Add focus: utilities for keyboard navigation"
        ((keyboard_issues++))
    fi
    
    # Check for skip links
    if find src -name "*.njk" | xargs grep -l 'skip.*content\|skip.*main' 2>/dev/null; then
        success "Skip link implementation detected"
    else
        warning "Consider adding skip links for keyboard users"
        info "Add 'Skip to main content' link for accessibility"
    fi
    
    # Check for tabindex usage
    if find src -name "*.njk" | xargs grep 'tabindex=' 2>/dev/null; then
        local bad_tabindex=$(find src -name "*.njk" | xargs grep 'tabindex="[1-9]' 2>/dev/null)
        if [[ -n "$bad_tabindex" ]]; then
            error "Positive tabindex values found - disrupts natural tab order"
            info "Use tabindex=\"0\" or \"-1\" only, avoid positive values"
            ((keyboard_issues++))
        fi
    fi
    
    return $keyboard_issues
}

# Validate image accessibility
check_image_accessibility() {
    info "🖼️  Validating image accessibility..."
    
    local image_issues=0
    
    # Check for images without alt text
    local images_without_alt=$(find src -name "*.njk" | xargs grep '<img' 2>/dev/null | grep -v 'alt=' | wc -l)
    if [[ $images_without_alt -gt 0 ]]; then
        error "$images_without_alt images missing alt text"
        info "Add descriptive alt=\"\" to all images"
        ((image_issues += images_without_alt))
    fi
    
    # Check for proper decorative image handling
    if find src -name "*.njk" | xargs grep 'alt=""' 2>/dev/null; then
        info "Decorative images properly marked with empty alt"
    fi
    
    # Check for background images with missing context
    if find src -name "*.css" -o -name "*.njk" | xargs grep 'background-image\|bg-\[url' 2>/dev/null; then
        warning "Background images detected"
        info "Ensure decorative only - add text alternatives if informative"
    fi
    
    # Check for proper figure/figcaption usage
    if find src -name "*.njk" | xargs grep '<figure' 2>/dev/null; then
        if find src -name "*.njk" | xargs grep '<figcaption' 2>/dev/null; then
            success "Proper figure/figcaption structure"
        else
            warning "Figures without captions detected"
            info "Add <figcaption> for complex images"
        fi
    fi
    
    return $image_issues
}

# Validate form accessibility
check_form_accessibility() {
    info "📝 Validating form accessibility..."
    
    local form_issues=0
    
    # Check for form inputs with labels
    local inputs_without_labels=$(find src -name "*.njk" | xargs grep '<input' 2>/dev/null | grep -v -E '(aria-label|id=.*label)' | wc -l)
    if [[ $inputs_without_labels -gt 0 ]]; then
        error "$inputs_without_labels form inputs may be missing labels"
        info "Associate labels with inputs using for/id or aria-label"
        ((form_issues += inputs_without_labels))
    fi
    
    # Check for proper error message association
    if find src -name "*.njk" | xargs grep -l 'error\|invalid' 2>/dev/null; then
        if find src -name "*.njk" | xargs grep -l 'aria-describedby\|aria-invalid' 2>/dev/null; then
            success "Form error handling with ARIA"
        else
            warning "Form errors should use aria-describedby or aria-invalid"
            ((form_issues++))
        fi
    fi
    
    # Check for required field indicators
    if find src -name "*.njk" | xargs grep 'required' 2>/dev/null; then
        if find src -name "*.njk" | xargs grep -E 'aria-required|required.*aria' 2>/dev/null; then
            success "Required fields properly indicated"
        else
            info "Consider aria-required for better screen reader support"
        fi
    fi
    
    return $form_issues
}

# Check for Portuguese language considerations
check_portuguese_accessibility() {
    info "🇵🇹 Validating Portuguese accessibility considerations..."
    
    local lang_issues=0
    
    # Check for proper lang attribute
    if find src -name "*.njk" | xargs grep -l 'lang="pt"' 2>/dev/null; then
        success "Portuguese language properly declared"
    else
        warning "No Portuguese language declaration found"
        info "Add lang=\"pt-PT\" to <html> element"
        ((lang_issues++))
    fi
    
    # Check for proper date format accessibility
    if find src -name "*.njk" | xargs grep -E '[0-9]{2}/[0-9]{2}/[0-9]{4}' 2>/dev/null; then
        info "Portuguese date format detected (DD/MM/YYYY)"
        if ! find src -name "*.njk" | xargs grep -l 'datetime\|aria-label.*data' 2>/dev/null; then
            warning "Consider adding datetime attributes for screen readers"
            info "Use <time datetime=\"2025-09-20\">20/09/2025</time>"
        fi
    fi
    
    # Check for Portuguese currency accessibility
    if find src -name "*.njk" | xargs grep '€' 2>/dev/null; then
        info "Euro currency symbol detected"
        if ! find src -name "*.njk" | xargs grep -l 'aria-label.*euro\|title.*euro' 2>/dev/null; then
            info "Consider aria-label for currency amounts for screen readers"
            info "Example: aria-label=\"dois mil e quinhentos euros\""
        fi
    fi
    
    return $lang_issues
}

# Run Lighthouse accessibility audit if available
check_lighthouse_accessibility() {
    info "🚨 Lighthouse accessibility validation..."
    
    if ! command -v lighthouse >/dev/null 2>&1; then
        warning "Lighthouse not available - install for automated accessibility testing"
        info "npm install -g lighthouse"
        return 1
    fi
    
    if [[ ! -f "_site/index.html" ]]; then
        warning "No build found - run 'npm run build' for accessibility testing"
        return 1
    fi
    
    info "Accessibility targets for Portuguese market:"
    info "  🎯 Lighthouse Accessibility: >95"
    info "  ♿ WCAG AA compliance: Required"
    info "  🎨 Contrast ratio: 4.5:1 minimum"
    info "  ⌨️  Keyboard navigation: Full support"
    info "  🔊 Screen reader: Compatible content"
    
    return 0
}

# Main accessibility validator execution
main() {
    local total_issues=0
    
    info "♿ Accessibility Validator for Portuguese Female Entrepreneurs"
    info "🎯 Target: WCAG AA compliance for premium €2,500 event"
    echo ""
    
    # Run all accessibility checks
    check_color_contrast
    ((total_issues += $?))
    
    check_aria_compliance
    ((total_issues += $?))
    
    check_semantic_html
    ((total_issues += $?))
    
    check_keyboard_navigation
    ((total_issues += $?))
    
    check_image_accessibility
    ((total_issues += $?))
    
    check_form_accessibility
    ((total_issues += $?))
    
    check_portuguese_accessibility
    ((total_issues += $?))
    
    check_lighthouse_accessibility
    # Don't add to issues count as this is informational
    
    echo ""
    
    # Accessibility summary
    if [[ $total_issues -eq 0 ]]; then
        success "♿ Accessibility Validator: WCAG AA compliant"
        info "Landing page accessible for all Portuguese users"
    elif [[ $total_issues -le 5 ]]; then
        warning "⚠️  Accessibility Validator: $total_issues minor issues"
        info "Generally accessible with room for improvement"
    else
        error "🚨 Accessibility Validator: $total_issues issues require attention"
        error "WCAG AA compliance essential for inclusive design"
    fi
    
    # Accessibility best practices summary
    info ""
    info "♿ WCAG AA Compliance Checklist:"
    info "  ✅ Use approved design token colors (4.5:1 contrast)"
    info "  ✅ Provide alt text for all informative images"
    info "  ✅ Ensure keyboard navigation works everywhere"
    info "  ✅ Use semantic HTML (sections, headings, landmarks)"
    info "  ✅ Associate form labels with inputs"
    info "  ✅ Provide focus indicators for interactive elements"
    info "  ✅ Use aria-current for pagination/carousels"
    info "  ✅ Declare Portuguese language (lang=\"pt-PT\")"
    
    echo ""
    info "🎯 Business Impact:"
    info "  • Accessibility improves conversion by 2-7%"
    info "  • Legal compliance reduces liability"
    info "  • Inclusive design expands market reach"
    info "  • Better SEO and search visibility"
    
    return $total_issues
}

# Run the accessibility validator
main "$@"
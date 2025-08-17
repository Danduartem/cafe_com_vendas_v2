#!/bin/bash
# Common validation functions for Café com Vendas hooks

# Source color utilities
source "$(dirname "${BASH_SOURCE[0]}")/colors.sh"

# Validate if file exists
validate_file_exists() {
    local file="$1"
    if [[ ! -f "$file" ]]; then
        error "File not found: $file"
        return 1
    fi
    return 0
}

# Check for Tailwind CSS compliance (no inline styles)
check_tailwind_compliance() {
    local file="$1"
    if [[ ! -f "$file" ]]; then return 0; fi
    
    # Check for inline styles
    if grep -q 'style=' "$file"; then
        error "Inline styles detected in $file - use Tailwind classes only"
        return 1
    fi
    
    # Check for !important (discouraged in Tailwind)
    if grep -q '!important' "$file"; then
        warning "!important found in $file - consider using Tailwind utilities"
    fi
    
    return 0
}

# Validate design token usage (no hex colors)
check_design_tokens() {
    local file="$1"
    if [[ ! -f "$file" ]]; then return 0; fi
    
    # Check for hex colors
    if grep -E '#[0-9a-fA-F]{3,6}' "$file" | grep -v -E '(#[[:space:]]*|// #|/\* #)'; then
        warning "Hex colors found in $file - use design tokens instead"
        return 1
    fi
    
    return 0
}

# Check for exposed API keys
check_api_security() {
    local file="$1"
    if [[ ! -f "$file" ]]; then return 0; fi
    
    # Check for exposed Stripe keys
    if grep -E '(sk_live_|pk_live_)' "$file"; then
        error "LIVE Stripe API key detected in $file - security risk!"
        return 1
    fi
    
    # Check for other sensitive patterns
    if grep -E '(password|secret|key).*[=:].*["\'][^"\']{20,}' "$file"; then
        warning "Potential secret detected in $file - verify not exposed"
    fi
    
    return 0
}

# Validate JSON syntax
validate_json() {
    local file="$1"
    if [[ ! -f "$file" ]]; then return 0; fi
    
    if ! python -m json.tool "$file" > /dev/null 2>&1; then
        error "Invalid JSON syntax in $file"
        return 1
    fi
    
    return 0
}

# Check file size impact on performance
check_file_size() {
    local file="$1"
    local max_size="$2"  # in KB
    
    if [[ ! -f "$file" ]]; then return 0; fi
    
    local size_bytes=$(wc -c < "$file")
    local size_kb=$((size_bytes / 1024))
    
    if [[ $size_kb -gt ${max_size:-100} ]]; then
        warning "Large file: $file (${size_kb}KB) - may impact performance"
        return 1
    fi
    
    return 0
}

# Validate accessibility attributes
check_accessibility() {
    local file="$1"
    if [[ ! -f "$file" ]]; then return 0; fi
    
    local issues=0
    
    # Check for images without alt text
    if grep -E '<img[^>]*>' "$file" | grep -v 'alt=' > /dev/null; then
        warning "Images without alt text found in $file"
        ((issues++))
    fi
    
    # Check for links without accessible text
    if grep -E '<a[^>]*href[^>]*></a>' "$file" > /dev/null; then
        warning "Empty links found in $file - add accessible text"
        ((issues++))
    fi
    
    # Check for form inputs without labels
    if grep -E '<input[^>]*>' "$file" | grep -v -E '(aria-label|id=.*label)' > /dev/null; then
        warning "Form inputs may be missing labels in $file"
        ((issues++))
    fi
    
    return $issues
}

# Check for Portuguese content integrity
validate_portuguese_content() {
    local file="$1"
    if [[ ! -f "$file" ]]; then return 0; fi
    
    # Check for common Portuguese patterns
    if grep -q -E '(café|empresárias|setembro|Lisboa)' "$file"; then
        info "Portuguese content detected in $file"
    fi
    
    # Check for date format consistency (DD/MM/YYYY for Portugal)
    if grep -E '[0-9]{2}/[0-9]{2}/[0-9]{4}' "$file" | grep -v -E '(20/09/2025|setembro)' > /dev/null; then
        warning "Date format in $file - ensure Portuguese format (DD/MM/YYYY)"
    fi
    
    return 0
}
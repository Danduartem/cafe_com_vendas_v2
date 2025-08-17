#!/bin/bash
# Stripe Security Guard for Café com Vendas
# Payment security monitoring and PCI compliance validation

# Source utilities
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/utils/colors.sh"
source "$SCRIPT_DIR/utils/validators.sh"
source "$SCRIPT_DIR/utils/project-helpers.sh"

# Exit if not Café com Vendas project
if ! is_cafe_project; then
    exit 0
fi

cafe_log "info" "💳 Stripe Guard: Monitoring payment security..."

# Payment security configuration
EVENT_PRICE_EUR=2500        # Current event price
WEBHOOK_ENDPOINT="/.netlify/functions/stripe-webhook"
REQUIRED_STRIPE_VERSION="18.4.0"

# Check Stripe API key security
check_stripe_keys() {
    info "🔐 Validating Stripe API key security..."
    
    local security_issues=0
    
    # Check for exposed live keys in code
    if find . -name "*.js" -o -name "*.njk" -o -name "*.json" | xargs grep -l "sk_live_\|pk_live_" 2>/dev/null; then
        error "🚨 CRITICAL: Live Stripe keys found in code!"
        error "This is a major security vulnerability"
        info "Move all keys to environment variables immediately"
        ((security_issues += 10))  # High severity
    fi
    
    # Check for hardcoded test keys (still bad practice)
    if find . -name "*.js" -o -name "*.njk" | xargs grep -l "sk_test_\|pk_test_" 2>/dev/null; then
        warning "Test Stripe keys hardcoded in files"
        info "Use environment variables even for test keys"
        ((security_issues++))
    fi
    
    # Validate environment variable usage
    if find . -name "*.js" | xargs grep -l "process\.env\.*STRIPE\|import\.meta\.env\.*STRIPE" 2>/dev/null; then
        success "Environment variables used for Stripe keys"
    else
        error "No environment variable usage detected for Stripe"
        info "Use VITE_STRIPE_PUBLIC_KEY and STRIPE_SECRET_KEY"
        ((security_issues++))
    fi
    
    # Check .env files are not committed
    if [[ -f ".env" ]] || [[ -f ".env.local" ]]; then
        if git ls-files --error-unmatch .env .env.local 2>/dev/null; then
            error "Environment files are tracked by Git!"
            info "Add .env* to .gitignore immediately"
            ((security_issues += 5))  # High severity
        fi
    fi
    
    return $security_issues
}

# Validate webhook security
check_webhook_security() {
    info "🔗 Validating webhook security..."
    
    local webhook_issues=0
    
    # Check for webhook signature verification
    local webhook_file="netlify/functions/stripe-webhook.js"
    if [[ -f "$webhook_file" ]]; then
        if grep -q "stripe.webhooks.constructEvent\|webhookSecret" "$webhook_file"; then
            success "Webhook signature verification implemented"
        else
            error "Webhook signature verification missing!"
            info "Use stripe.webhooks.constructEvent() for security"
            ((webhook_issues += 3))  # High severity
        fi
        
        # Check for proper error handling
        if ! grep -q "catch\|try" "$webhook_file"; then
            warning "Webhook missing error handling"
            info "Add try/catch blocks for robust webhook processing"
            ((webhook_issues++))
        fi
        
        # Check for idempotency handling
        if ! grep -q "idempotency\|duplicate" "$webhook_file"; then
            warning "Consider idempotency handling in webhook"
            info "Prevent duplicate processing of webhook events"
        fi
    else
        warning "Webhook file not found: $webhook_file"
        info "Stripe webhook endpoint should be implemented"
        ((webhook_issues++))
    fi
    
    return $webhook_issues
}

# Validate payment flow integrity
check_payment_flow() {
    info "💰 Validating payment flow integrity..."
    
    local flow_issues=0
    
    # Check payment intent creation
    local payment_file="netlify/functions/create-payment-intent.js"
    if [[ -f "$payment_file" ]]; then
        # Validate amount matches event price
        if grep -q "amount.*250000\|amount.*2500.*100" "$payment_file"; then
            success "Payment amount matches event price (€2,500)"
        else
            error "Payment amount validation needed"
            info "Ensure amount = €$EVENT_PRICE_EUR * 100 (cents)"
            ((flow_issues++))
        fi
        
        # Check for proper currency
        if grep -q "currency.*eur\|currency.*EUR" "$payment_file"; then
            success "EUR currency specified correctly"
        else
            warning "Currency validation needed - should be EUR"
            ((flow_issues++))
        fi
        
        # Validate error handling
        if ! grep -q "catch\|try" "$payment_file"; then
            error "Payment intent creation missing error handling"
            info "Add comprehensive error handling for payment failures"
            ((flow_issues++))
        fi
        
        # Check for input validation
        if ! grep -q "validation\|validate\|sanitize" "$payment_file"; then
            warning "Input validation recommended"
            info "Validate email, amount, and other inputs"
        fi
        
    else
        error "Payment intent creation file missing: $payment_file"
        info "Create Netlify function for secure payment processing"
        ((flow_issues += 2))
    fi
    
    return $flow_issues
}

# Check PCI compliance patterns
check_pci_compliance() {
    info "🛡️  Checking PCI compliance patterns..."
    
    local compliance_issues=0
    
    # Check for sensitive data logging
    if find . -name "*.js" | xargs grep -l "console\.log.*card\|console\.log.*payment" 2>/dev/null; then
        error "Potential payment data logging detected!"
        info "NEVER log sensitive payment information"
        ((compliance_issues += 3))
    fi
    
    # Check for client-side card data handling
    if find src -name "*.js" | xargs grep -l "cardNumber\|cardnumber\|card_number" 2>/dev/null; then
        warning "Client-side card data handling detected"
        info "Use Stripe Elements for secure card collection"
        ((compliance_issues++))
    fi
    
    # Validate HTTPS enforcement
    if find . -name "*.js" | xargs grep -l "http://.*stripe\|http://.*payment" 2>/dev/null; then
        error "HTTP URLs found in payment code - use HTTPS only"
        ((compliance_issues++))
    fi
    
    # Check for proper session handling
    if find . -name "*.js" | xargs grep -l "sessionStorage.*payment\|localStorage.*card" 2>/dev/null; then
        warning "Sensitive data in browser storage detected"
        info "Avoid storing payment data in browser storage"
        ((compliance_issues++))
    fi
    
    return $compliance_issues
}

# Validate Stripe integration best practices
check_stripe_integration() {
    info "⚡ Checking Stripe integration patterns..."
    
    local integration_issues=0
    
    # Check for proper Stripe.js loading
    if find src -name "*.js" | xargs grep -l "stripe.*loadStripe\|new Stripe" 2>/dev/null; then
        # Check for lazy loading pattern
        if find src -name "*.js" | xargs grep -l "loadStripeScript\|stripeLoadPromise" 2>/dev/null; then
            success "Lazy loading pattern detected for Stripe.js"
        else
            warning "Consider lazy loading Stripe.js (saves 187KB)"
            info "Load Stripe.js only when user shows payment intent"
        fi
    fi
    
    # Check Stripe version
    if [[ -f "package.json" ]]; then
        local stripe_version=$(grep '"stripe"' package.json | grep -o '[0-9][0-9.]*' | head -1)
        if [[ -n "$stripe_version" ]]; then
            info "Stripe version: $stripe_version"
            # Simple version comparison (major.minor)
            local major_minor=$(echo "$stripe_version" | cut -d. -f1-2)
            local required_major_minor=$(echo "$REQUIRED_STRIPE_VERSION" | cut -d. -f1-2)
            if [[ "$major_minor" != "$required_major_minor" ]]; then
                warning "Stripe version ($stripe_version) differs from recommended ($REQUIRED_STRIPE_VERSION)"
            fi
        fi
    fi
    
    # Check for proper error messages
    if find src -name "*.js" | xargs grep -l "payment.*failed\|payment.*error" 2>/dev/null; then
        success "Payment error handling implemented"
    else
        warning "Payment error handling not detected"
        info "Implement user-friendly error messages"
        ((integration_issues++))
    fi
    
    return $integration_issues
}

# Monitor test card usage patterns
check_test_cards() {
    info "🧪 Checking test card patterns..."
    
    # Check for hardcoded test cards (development artifact)
    if find . -name "*.js" -o -name "*.md" -o -name "*.njk" | xargs grep -l "4242.*4242\|4000.*0007" 2>/dev/null; then
        info "Test card numbers found in documentation/code"
        info "Ensure these are for testing only"
    fi
    
    # Validate test environment detection
    if find src -name "*.js" | xargs grep -l "test.*environment\|NODE_ENV.*test" 2>/dev/null; then
        success "Test environment detection implemented"
    else
        warning "Consider adding test environment checks"
        info "Prevent accidental live payments in development"
    fi
    
    return 0
}

# Validate pricing consistency
check_pricing_consistency() {
    info "💶 Validating pricing consistency..."
    
    local pricing_issues=0
    
    # Check event data consistency
    local current_price=$(get_current_price)
    if [[ "$current_price" == "€2,500" ]] || [[ "$current_price" == "2500" ]]; then
        success "Event pricing consistent: $current_price"
    else
        warning "Event price mismatch: $current_price (expected: €2,500)"
        ((pricing_issues++))
    fi
    
    # Check payment amount in code
    if find netlify/functions -name "*.js" 2>/dev/null | xargs grep -l "250000" 2>/dev/null; then
        success "Payment amount in cents matches price (€2,500 = 250000 cents)"
    else
        warning "Payment amount validation needed"
        info "Verify amount = €2,500 * 100 = 250000 cents"
        ((pricing_issues++))
    fi
    
    return $pricing_issues
}

# Main Stripe guard execution
main() {
    local total_issues=0
    
    info "💳 Stripe Security Guard for €$EVENT_PRICE_EUR premium event"
    info "🎯 Target: 8 premium spots with secure payment processing"
    echo ""
    
    # Run all security checks
    check_stripe_keys
    ((total_issues += $?))
    
    check_webhook_security
    ((total_issues += $?))
    
    check_payment_flow
    ((total_issues += $?))
    
    check_pci_compliance
    ((total_issues += $?))
    
    check_stripe_integration
    ((total_issues += $?))
    
    check_test_cards
    ((total_issues += $?))
    
    check_pricing_consistency
    ((total_issues += $?))
    
    echo ""
    
    # Security summary
    if [[ $total_issues -eq 0 ]]; then
        success "🛡️  Stripe Guard: Payment security validated"
        info "Premium payment flow secured for €2,500 event"
    elif [[ $total_issues -le 3 ]]; then
        warning "⚠️  Stripe Guard: $total_issues minor issues detected"
        info "Payment security mostly compliant"
    else
        error "🚨 Stripe Guard: $total_issues security issues require immediate attention"
        error "High-value payments (€2,500) require robust security"
    fi
    
    # Payment security reminders
    info ""
    info "🔒 Payment Security Checklist:"
    info "  ✅ Use environment variables for all API keys"
    info "  ✅ Implement webhook signature verification"
    info "  ✅ Never log sensitive payment data"
    info "  ✅ Use HTTPS for all payment communications"
    info "  ✅ Validate payment amounts match event price"
    info "  ✅ Test with Portuguese payment methods"
    info "  ✅ Handle payment errors gracefully"
    
    echo ""
    info "📋 Stripe Test Cards for Portugal:"
    info "  🇵🇹 4000 0062 0000 0007 (Visa with 3D Secure)"
    info "  🇧🇷 4000 0007 6000 0002 (Brazil Visa)"
    info "  🌍 4242 4242 4242 4242 (Global success)"
    
    return $total_issues
}

# Run the Stripe guard
main "$@"
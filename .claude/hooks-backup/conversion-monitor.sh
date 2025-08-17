#!/bin/bash
# Conversion Monitor for Café com Vendas
# Overall conversion funnel health and optimization monitoring

# Source utilities
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/utils/colors.sh"
source "$SCRIPT_DIR/utils/validators.sh"
source "$SCRIPT_DIR/utils/project-helpers.sh"

# Exit if not Café com Vendas project
if ! is_cafe_project; then
    exit 0
fi

cafe_log "info" "🎯 Conversion Monitor: Analyzing funnel optimization..."

# Conversion optimization targets
TARGET_MOBILE_TRAFFIC=80       # 80% mobile traffic expected
TARGET_CONVERSION_RATE=2.5     # 2.5% target conversion rate
PREMIUM_PRICE_EUR=2500         # High-value conversion
TARGET_REVENUE_PER_VISITOR=62.5 # €2,500 × 2.5% conversion rate

# Analyze conversion funnel components
check_conversion_funnel() {
    info "📊 Analyzing conversion funnel components..."
    
    local funnel_issues=0
    local funnel_score=100
    
    # Check critical conversion components
    local critical_components=(
        "hero.njk:Hero Section"
        "offer.njk:Pricing Offer"
        "checkout.njk:Checkout Flow"
        "final-cta.njk:Final CTA"
        "testimonials.njk:Social Proof"
    )
    
    info "Checking critical conversion components:"
    for component_info in "${critical_components[@]}"; do
        local file="${component_info%%:*}"
        local name="${component_info##*:}"
        
        if [[ -f "src/_includes/components/$file" ]]; then
            success "✅ $name component exists"
            
            # Check for conversion optimization patterns
            local file_path="src/_includes/components/$file"
            local patterns_found=0
            
            # Check for CTA buttons
            if grep -q -E 'button|btn|cta' "$file_path"; then
                ((patterns_found++))
            fi
            
            # Check for urgency/scarcity
            if grep -q -E 'limit|spot|dia|urgente|restam|último' "$file_path"; then
                ((patterns_found++))
            fi
            
            # Check for social proof elements
            if grep -q -E 'testimonial|review|client|empresária' "$file_path"; then
                ((patterns_found++))
            fi
            
            if [[ $patterns_found -ge 2 ]]; then
                success "  Conversion patterns: Strong ($patterns_found/3)"
            elif [[ $patterns_found -eq 1 ]]; then
                warning "  Conversion patterns: Moderate ($patterns_found/3)"
                ((funnel_score -= 5))
            else
                error "  Conversion patterns: Weak ($patterns_found/3)"
                ((funnel_issues++))
                ((funnel_score -= 15))
            fi
        else
            error "❌ Missing critical component: $name"
            ((funnel_issues += 2))
            ((funnel_score -= 25))
        fi
    done
    
    info "Conversion funnel score: $funnel_score/100"
    return $funnel_issues
}

# Check mobile conversion optimization
check_mobile_optimization() {
    info "📱 Checking mobile conversion optimization..."
    
    local mobile_issues=0
    
    # Check for mobile-first design patterns
    if find src -name "*.css" -o -name "*.njk" | xargs grep -l 'mobile\|sm:|md:|lg:' 2>/dev/null; then
        success "Mobile-responsive design detected"
    else
        warning "Limited mobile optimization detected"
        info "Mobile users are $TARGET_MOBILE_TRAFFIC% of Portuguese traffic"
        ((mobile_issues++))
    fi
    
    # Check for touch-friendly CTA buttons
    if find src -name "*.njk" | xargs grep -E 'py-[3-9]|px-[4-9]|touch|tap' 2>/dev/null; then
        success "Touch-friendly button sizing detected"
    else
        warning "Consider larger touch targets for mobile conversion"
        info "Minimum 44px touch targets recommended"
        ((mobile_issues++))
    fi
    
    # Check for mobile payment optimization
    if find src -name "*.js" | xargs grep -l 'mobile\|touch\|stripe.*mobile' 2>/dev/null; then
        success "Mobile payment considerations found"
    else
        warning "Ensure mobile payment flow is optimized"
        info "Mobile payments critical for €$PREMIUM_PRICE_EUR conversions"
        ((mobile_issues++))
    fi
    
    # Check for mobile performance patterns
    if find src -name "*.njk" | xargs grep -l 'loading="lazy"\|decoding="async"' 2>/dev/null; then
        success "Mobile performance optimizations detected"
    else
        warning "Consider lazy loading for mobile performance"
        info "Performance directly impacts mobile conversion rates"
        ((mobile_issues++))
    fi
    
    return $mobile_issues
}

# Analyze Portuguese market conversion factors
check_portuguese_market_optimization() {
    info "🇵🇹 Analyzing Portuguese market conversion factors..."
    
    local market_issues=0
    
    # Check for Portuguese cultural elements
    local cultural_elements=(
        "café"           # Coffee culture
        "empresárias"    # Female entrepreneurs
        "transformação"  # Transformation language
        "garantia"       # Guarantee/trust
        "Lisboa"         # Local relevance
    )
    
    local cultural_score=0
    for element in "${cultural_elements[@]}"; do
        if find src -name "*.njk" | xargs grep -l "$element" 2>/dev/null; then
            ((cultural_score++))
        fi
    done
    
    if [[ $cultural_score -ge 4 ]]; then
        success "Strong Portuguese market alignment ($cultural_score/5)"
    elif [[ $cultural_score -ge 2 ]]; then
        warning "Moderate Portuguese market alignment ($cultural_score/5)"
        info "Consider more local cultural elements"
        ((market_issues++))
    else
        error "Weak Portuguese market alignment ($cultural_score/5)"
        info "Add more Portuguese cultural relevance for better conversion"
        ((market_issues += 2))
    fi
    
    # Check for proper Portuguese formatting
    if find src -name "*.njk" | xargs grep -E '€[0-9,]+|[0-9]+/[0-9]+/2025' 2>/dev/null; then
        success "Portuguese formatting patterns detected"
    else
        warning "Ensure proper Portuguese number/date formatting"
        ((market_issues++))
    fi
    
    # Check for trust signals for Portuguese market
    local trust_signals=0
    if find src -name "*.njk" | xargs grep -l -E 'testimon|review|client|result' 2>/dev/null; then
        ((trust_signals++))
    fi
    if find src -name "*.njk" | xargs grep -l -E 'garantia|devolução|satisfação' 2>/dev/null; then
        ((trust_signals++))
    fi
    if find src -name "*.njk" | xargs grep -l -E 'segur|privac|protect' 2>/dev/null; then
        ((trust_signals++))
    fi
    
    if [[ $trust_signals -ge 2 ]]; then
        success "Adequate trust signals for Portuguese market"
    else
        warning "Consider more trust signals for high-value Portuguese conversions"
        info "€$PREMIUM_PRICE_EUR requires strong trust building"
        ((market_issues++))
    fi
    
    return $market_issues
}

# Check conversion tracking and analytics
check_conversion_tracking() {
    info "📈 Validating conversion tracking setup..."
    
    local tracking_issues=0
    
    # Check for analytics implementation
    if find src -name "*.js" | xargs grep -l 'gtm\|analytics\|track' 2>/dev/null; then
        success "Analytics tracking implementation detected"
        
        # Check for conversion events
        if find src -name "*.js" | xargs grep -l 'conversion\|purchase\|signup\|checkout' 2>/dev/null; then
            success "Conversion event tracking found"
        else
            warning "No conversion event tracking detected"
            info "Track key conversion events for optimization"
            ((tracking_issues++))
        fi
    else
        error "No analytics tracking detected"
        info "Analytics essential for €$PREMIUM_PRICE_EUR conversion optimization"
        ((tracking_issues += 2))
    fi
    
    # Check for data attributes for tracking
    if find src -name "*.njk" | xargs grep -l 'data-analytics\|data-track\|data-event' 2>/dev/null; then
        success "Analytics data attributes implemented"
    else
        warning "Consider data attributes for granular conversion tracking"
        ((tracking_issues++))
    fi
    
    # Check for A/B testing readiness
    if find src -name "*.js" -o -name "*.njk" | xargs grep -l 'variant\|test\|experiment' 2>/dev/null; then
        success "A/B testing infrastructure detected"
    else
        info "Consider A/B testing infrastructure for conversion optimization"
    fi
    
    return $tracking_issues
}

# Validate payment conversion flow
check_payment_conversion_flow() {
    info "💳 Analyzing payment conversion flow..."
    
    local payment_issues=0
    
    # Check for proper payment flow components
    if [[ -f "netlify/functions/create-payment-intent.js" ]]; then
        success "Payment intent creation configured"
        
        # Check for proper error handling
        if grep -q 'catch\|error\|failed' netlify/functions/create-payment-intent.js; then
            success "Payment error handling implemented"
        else
            error "Payment error handling missing"
            info "Robust error handling critical for €$PREMIUM_PRICE_EUR conversions"
            ((payment_issues += 2))
        fi
    else
        error "Payment intent creation missing"
        ((payment_issues += 3))
    fi
    
    # Check for payment security indicators
    if find src -name "*.njk" | xargs grep -l -E 'secure|segur|ssl|encrypt|stripe' 2>/dev/null; then
        success "Payment security messaging found"
    else
        warning "Consider security messaging for high-value payments"
        info "Security trust crucial for €$PREMIUM_PRICE_EUR transactions"
        ((payment_issues++))
    fi
    
    # Check for payment method variety
    if find src -name "*.js" | xargs grep -l 'card\|visa\|mastercard\|payment_method' 2>/dev/null; then
        success "Payment method handling implemented"
    else
        warning "Ensure multiple payment methods for conversion optimization"
        ((payment_issues++))
    fi
    
    return $payment_issues
}

# Check urgency and scarcity elements
check_urgency_scarcity() {
    info "⏰ Checking urgency and scarcity elements..."
    
    local urgency_issues=0
    local urgency_score=0
    
    # Check for countdown elements
    if find src -name "*.js" -o -name "*.njk" | xargs grep -l -E 'countdown|timer|dias|horas' 2>/dev/null; then
        success "Countdown/timer elements detected"
        ((urgency_score++))
    else
        warning "No countdown elements found"
        info "Countdown to $EXPECTED_EVENT_DATE creates urgency"
        ((urgency_issues++))
    fi
    
    # Check for spot scarcity
    local spots_current=$(get_current_price | head -1)  # Placeholder - would need proper spot tracking
    if find src -name "*.njk" | xargs grep -l -E 'spot|vaga|limit|restam|só.*[0-9]' 2>/dev/null; then
        success "Scarcity messaging detected"
        ((urgency_score++))
    else
        warning "Limited scarcity messaging found"
        info "8 spots available - use scarcity for conversion boost"
        ((urgency_issues++))
    fi
    
    # Check for time-limited offers
    if find src -name "*.njk" | xargs grep -l -E 'offer|oferta|desconto|limite.*tempo' 2>/dev/null; then
        success "Time-limited offer elements found"
        ((urgency_score++))
    else
        info "Consider time-limited offers for increased urgency"
    fi
    
    # Check for social proof urgency
    if find src -name "*.njk" | xargs grep -l -E 'recente|hoje|agora|just.*joined' 2>/dev/null; then
        success "Social proof urgency detected"
        ((urgency_score++))
    else
        info "Consider recent social proof for urgency"
    fi
    
    info "Urgency/scarcity score: $urgency_score/4"
    return $urgency_issues
}

# Calculate overall conversion health score
calculate_conversion_health() {
    info "🎯 Calculating overall conversion health score..."
    
    local health_score=100
    local critical_factors=0
    
    # Component weights for conversion impact
    local performance_weight=20    # Performance impacts conversion heavily
    local mobile_weight=25        # Mobile is 80% of traffic
    local trust_weight=20         # Trust crucial for high-value sales
    local urgency_weight=15       # Urgency drives immediate action
    local tracking_weight=20      # Tracking enables optimization
    
    # Calculate weighted score (simplified version)
    info "Conversion health factors:"
    info "  📱 Mobile optimization: High impact (80% traffic)"
    info "  🎯 Portuguese market fit: High impact (cultural relevance)"
    info "  💳 Payment flow: Critical impact (€$PREMIUM_PRICE_EUR value)"
    info "  ⏰ Urgency/scarcity: Medium impact (drives action)"
    info "  📊 Analytics tracking: Medium impact (enables optimization)"
    
    # Revenue calculation
    local estimated_monthly_visitors=1000  # Conservative estimate
    local estimated_conversions=$(echo "$estimated_monthly_visitors * $TARGET_CONVERSION_RATE / 100" | bc -l 2>/dev/null || echo "25")
    local estimated_revenue=$(echo "$estimated_conversions * $PREMIUM_PRICE_EUR" | bc -l 2>/dev/null || echo "62500")
    
    info ""
    info "💰 Revenue Impact Analysis:"
    info "  📊 Estimated monthly visitors: $estimated_monthly_visitors"
    info "  🎯 Target conversion rate: $TARGET_CONVERSION_RATE%"
    info "  💸 Estimated monthly conversions: ${estimated_conversions%.*}"
    info "  💰 Estimated monthly revenue: €${estimated_revenue%.*}"
    info "  📈 Revenue per visitor: €$TARGET_REVENUE_PER_VISITOR"
    
    return 0
}

# Main conversion monitor execution
main() {
    local total_issues=0
    
    info "🎯 Conversion Monitor for Café com Vendas Premium Event"
    info "💰 Target: €$PREMIUM_PRICE_EUR × 8 spots = €20,000 potential revenue"
    info "🇵🇹 Market: Portuguese female entrepreneurs"
    echo ""
    
    # Run all conversion health checks
    check_conversion_funnel
    ((total_issues += $?))
    
    check_mobile_optimization
    ((total_issues += $?))
    
    check_portuguese_market_optimization
    ((total_issues += $?))
    
    check_conversion_tracking
    ((total_issues += $?))
    
    check_payment_conversion_flow
    ((total_issues += $?))
    
    check_urgency_scarcity
    ((total_issues += $?))
    
    calculate_conversion_health
    
    echo ""
    
    # Conversion health summary
    if [[ $total_issues -eq 0 ]]; then
        success "🎯 Conversion Monitor: Optimal conversion setup"
        info "Landing page optimized for €$PREMIUM_PRICE_EUR conversions"
    elif [[ $total_issues -le 3 ]]; then
        warning "⚠️  Conversion Monitor: $total_issues optimization opportunities"
        info "Good conversion setup with room for improvement"
    elif [[ $total_issues -le 6 ]]; then
        warning "⚠️  Conversion Monitor: $total_issues issues affecting conversion"
        info "Moderate conversion setup - address issues for better results"
    else
        error "🚨 Conversion Monitor: $total_issues critical conversion issues"
        error "Significant conversion optimization needed for revenue maximization"
    fi
    
    # Conversion optimization recommendations
    info ""
    info "🚀 Conversion Optimization Priorities:"
    info "  1. 📱 Mobile optimization (80% of traffic)"
    info "  2. 🇵🇹 Portuguese cultural alignment (market fit)"
    info "  3. 💳 Payment flow security (€2,500 trust factor)"
    info "  4. ⏰ Urgency messaging (September 20 deadline)"
    info "  5. 🎯 Scarcity messaging (8 spots available)"
    info "  6. 📊 Conversion tracking (optimization data)"
    
    echo ""
    info "💡 High-Impact Conversion Tactics:"
    info "  • Exit-intent popup with discount"
    info "  • Live chat support for €2,500 questions"
    info "  • Payment plan options for accessibility"
    info "  • Portuguese customer testimonials"
    info "  • Mobile-optimized checkout flow"
    info "  • Countdown timer to event date"
    info "  • Limited spots scarcity messaging"
    
    echo ""
    success "Conversion monitoring complete - revenue optimization ready! 💰"
    
    return $total_issues
}

# Run the conversion monitor
main "$@"
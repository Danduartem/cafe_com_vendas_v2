#!/bin/bash
# Event Data Sentinel for Café com Vendas
# Critical event data monitoring and integrity validation

# Source utilities
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/utils/colors.sh"
source "$SCRIPT_DIR/utils/validators.sh"
source "$SCRIPT_DIR/utils/project-helpers.sh"

# Exit if not Café com Vendas project
if ! is_cafe_project; then
    exit 0
fi

cafe_log "info" "📅 Event Data Sentinel: Monitoring critical event data..."

# Event constants for validation
EXPECTED_EVENT_DATE="2025-09-20"
EXPECTED_LOCATION="Lisboa"  # Portuguese for Lisbon
EXPECTED_SPOTS=8
EXPECTED_PRICE_EUR=2500
EXPECTED_CURRENCY="€"
EVENT_NAME="Café com Vendas"

# Validate core event data integrity
check_event_data_integrity() {
    info "🔍 Validating core event data integrity..."
    
    local integrity_issues=0
    local event_file="info/DATA_event.json"
    
    if [[ ! -f "$event_file" ]]; then
        error "Critical event data file missing: $event_file"
        return 10  # Critical error
    fi
    
    # Validate JSON syntax first
    if ! validate_json "$event_file"; then
        error "Event data JSON syntax error - site will break!"
        return 10  # Critical error
    fi
    
    info "Checking critical event fields..."
    
    # Check event date
    local event_date=$(grep -o '"eventDate"[[:space:]]*:[[:space:]]*"[^"]*"' "$event_file" 2>/dev/null | cut -d'"' -f4)
    if [[ "$event_date" != "$EXPECTED_EVENT_DATE" ]]; then
        error "Event date mismatch: '$event_date' (expected: $EXPECTED_EVENT_DATE)"
        error "This affects countdown timers and urgency messaging"
        ((integrity_issues += 5))  # High severity
    else
        success "Event date correct: $event_date"
    fi
    
    # Check current price
    local current_price=$(grep -o '"currentPrice"[[:space:]]*:[[:space:]]*"[^"]*"' "$event_file" 2>/dev/null | cut -d'"' -f4)
    if [[ ! "$current_price" =~ €.*2.*500|2.*500.*€ ]]; then
        error "Price format issue: '$current_price' (expected: €2,500 or similar)"
        error "This affects payment processing and pricing display"
        ((integrity_issues += 5))  # High severity
    else
        success "Price format valid: $current_price"
    fi
    
    # Check spots available
    local spots=$(grep -o '"spotsAvailable"[[:space:]]*:[[:space:]]*[0-9]*' "$event_file" 2>/dev/null | grep -o '[0-9]*$')
    if [[ "$spots" != "$EXPECTED_SPOTS" ]]; then
        warning "Spots available changed: $spots (expected: $EXPECTED_SPOTS)"
        info "Verify this is intentional - affects scarcity messaging"
        ((integrity_issues++))
    else
        success "Spots available: $spots"
    fi
    
    # Check location
    local location=$(grep -o '"location"[[:space:]]*:[[:space:]]*"[^"]*"' "$event_file" 2>/dev/null | cut -d'"' -f4)
    if [[ ! "$location" =~ Lisboa|Lisbon ]]; then
        warning "Location format: '$location' (expected to include Lisboa/Lisbon)"
        info "Ensure Portuguese audience can recognize location"
        ((integrity_issues++))
    else
        success "Location specified: $location"
    fi
    
    return $integrity_issues
}

# Check date calculations and countdown logic
check_date_calculations() {
    info "📊 Validating date calculations and countdown logic..."
    
    local date_issues=0
    
    # Calculate days until event
    local days_until=$(days_until_event)
    if [[ "$days_until" == "?" ]]; then
        warning "Date calculation failed - check date utility functions"
        ((date_issues++))
    elif [[ $days_until -lt 0 ]]; then
        error "Event date is in the past! ($days_until days)"
        error "Update event date or adjust messaging for past events"
        ((date_issues += 5))
    elif [[ $days_until -eq 0 ]]; then
        warning "Event is TODAY - verify urgency messaging is appropriate"
    elif [[ $days_until -le 7 ]]; then
        info "Event in $days_until days - HIGH URGENCY messaging appropriate"
    elif [[ $days_until -le 30 ]]; then
        info "Event in $days_until days - moderate urgency messaging"
    else
        info "Event in $days_until days - early bird messaging appropriate"
    fi
    
    # Check for consistent date formatting across templates
    if find src -name "*.njk" | xargs grep -l '[0-9]/[0-9]/202[0-9]' 2>/dev/null; then
        info "Date formatting found in templates"
        # Check for Portuguese date format (DD/MM/YYYY)
        if find src -name "*.njk" | xargs grep -E '[0-9]{1,2}/[0-9]{1,2}/202[0-9]' 2>/dev/null | grep -v '20/09/2025'; then
            warning "Date format validation needed - ensure Portuguese format (DD/MM/YYYY)"
            info "Event date should display as 20/09/2025 for Portuguese audience"
            ((date_issues++))
        fi
    fi
    
    return $date_issues
}

# Validate pricing consistency across the site
check_pricing_consistency() {
    info "💰 Validating pricing consistency across all components..."
    
    local pricing_issues=0
    
    # Get current price from event data
    local event_price=$(get_current_price)
    info "Event price from data: $event_price"
    
    # Check for hardcoded prices in templates
    local hardcoded_prices=()
    while IFS= read -r line; do
        if [[ -n "$line" ]]; then
            hardcoded_prices+=("$line")
        fi
    done < <(find src -name "*.njk" | xargs grep -E '€[0-9,.]+(\.00)?|\$[0-9,.]+(\.00)?|[0-9,.]+ euros?' 2>/dev/null | grep -v '{{ event' | head -10)
    
    if [[ ${#hardcoded_prices[@]} -gt 0 ]]; then
        warning "Hardcoded prices found in templates:"
        for price_line in "${hardcoded_prices[@]}"; do
            warning "  $price_line"
        done
        info "Use {{ event.currentPrice }} for consistency"
        ((pricing_issues++))
    else
        success "No hardcoded prices detected - using data layer"
    fi
    
    # Check payment processing amount consistency
    if [[ -f "netlify/functions/create-payment-intent.js" ]]; then
        local payment_amount=$(grep -o 'amount.*[0-9][0-9][0-9][0-9][0-9][0-9]' netlify/functions/create-payment-intent.js 2>/dev/null | grep -o '[0-9][0-9][0-9][0-9][0-9][0-9]')
        if [[ "$payment_amount" == "250000" ]]; then
            success "Payment amount matches €2,500 (250000 cents)"
        else
            error "Payment amount mismatch: $payment_amount cents"
            error "Should be 250000 cents for €2,500"
            ((pricing_issues += 3))
        fi
    fi
    
    # Check for pricing tiers consistency
    if grep -q '"originalPrice"' info/DATA_event.json 2>/dev/null; then
        local original_price=$(grep -o '"originalPrice"[[:space:]]*:[[:space:]]*"[^"]*"' info/DATA_event.json 2>/dev/null | cut -d'"' -f4)
        info "Original price: $original_price"
        info "Current price: $event_price"
        
        # Validate discount calculation
        if [[ -n "$original_price" && -n "$event_price" ]]; then
            info "Price tiers configured - validate discount messaging"
        fi
    fi
    
    return $pricing_issues
}

# Check Portuguese language consistency
check_portuguese_consistency() {
    info "🇵🇹 Validating Portuguese language and cultural consistency..."
    
    local language_issues=0
    
    # Check for consistent Portuguese terminology
    local portuguese_terms=(
        "empresárias"    # female entrepreneurs
        "transformação"  # transformation
        "setembro"       # September
        "vendas"         # sales
        "Lisboa"         # Lisbon
        "garantia"       # guarantee
    )
    
    local missing_terms=0
    for term in "${portuguese_terms[@]}"; do
        if ! find src -name "*.njk" | xargs grep -l "$term" 2>/dev/null; then
            ((missing_terms++))
        fi
    done
    
    if [[ $missing_terms -gt 3 ]]; then
        warning "Limited Portuguese content detected"
        info "Ensure content is properly localized for Portuguese audience"
        ((language_issues++))
    else
        success "Portuguese terminology appropriately used"
    fi
    
    # Check for currency format consistency
    if find src -name "*.njk" | xargs grep '€' 2>/dev/null; then
        success "Euro currency symbol used correctly"
    else
        warning "No Euro currency symbols found"
        info "Ensure pricing displays € symbol for European audience"
        ((language_issues++))
    fi
    
    # Check for proper Portuguese date format usage
    if find src -name "*.njk" | xargs grep -E '20/09/2025|setembro.*2025' 2>/dev/null; then
        success "Portuguese date format detected"
    else
        warning "Consider Portuguese date format (DD/MM/YYYY)"
        info "September 20, 2025 → 20/09/2025 for Portuguese users"
    fi
    
    return $language_issues
}

# Validate guarantee and terms consistency
check_guarantee_consistency() {
    info "🛡️  Validating guarantee and terms consistency..."
    
    local guarantee_issues=0
    
    # Check for guarantee terms in event data
    if grep -q '"guarantee"' info/DATA_event.json 2>/dev/null; then
        local guarantee_period=$(grep -o '"guarantee"[[:space:]]*:[[:space:]]*"[^"]*"' info/DATA_event.json 2>/dev/null | cut -d'"' -f4)
        success "Guarantee period specified: $guarantee_period"
        
        # Check for consistency in templates
        if find src -name "*.njk" | xargs grep -l "garantia\|guarantee" 2>/dev/null; then
            success "Guarantee messaging found in templates"
        else
            warning "Guarantee in data but not prominently displayed"
            info "Consider adding guarantee messaging to build trust"
            ((guarantee_issues++))
        fi
    else
        warning "No guarantee terms found in event data"
        info "Consider adding guarantee period for increased conversions"
        ((guarantee_issues++))
    fi
    
    # Check for consistent terms and conditions
    if find src -name "*.njk" | xargs grep -l "termos\|conditions\|legal" 2>/dev/null; then
        success "Legal terms referenced"
    else
        warning "No legal terms references found"
        info "Ensure legal compliance for Portuguese market"
        ((guarantee_issues++))
    fi
    
    return $guarantee_issues
}

# Monitor critical file dependencies  
check_file_dependencies() {
    info "🔗 Checking event data file dependencies..."
    
    local dependency_issues=0
    
    # Check if templates properly reference event data
    local templates_using_event=$(find src -name "*.njk" | xargs grep -l '{{ event\.' 2>/dev/null | wc -l)
    if [[ $templates_using_event -eq 0 ]]; then
        error "No templates referencing event data!"
        error "Event data changes won't be reflected on site"
        ((dependency_issues += 5))
    else
        success "$templates_using_event templates properly use event data"
    fi
    
    # Check data layer integration
    if [[ -f "src/_data/event.js" ]]; then
        if grep -q "DATA_event.json" src/_data/event.js 2>/dev/null; then
            success "Event data properly integrated in Eleventy data layer"
        else
            warning "Event data layer may not be loading JSON file"
            ((dependency_issues++))
        fi
    else
        error "Event data layer missing: src/_data/event.js"
        ((dependency_issues += 3))
    fi
    
    # Check for backup data consistency
    if find info -name "*avatar*" -o -name "*testimonial*" | xargs grep -l "2025-09-20\|setembro\|€2.*500" 2>/dev/null; then
        info "Event details referenced in related data files"
    else
        warning "Event details may not be consistent across all data files"
        info "Verify avatar and testimonial data align with event"
    fi
    
    return $dependency_issues
}

# Check for conversion-impacting changes
check_conversion_impact() {
    info "🎯 Assessing conversion impact of event data changes..."
    
    local impact_issues=0
    
    # Check if we can determine recent changes
    if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
        local event_data_changed=false
        
        # Check if event data files were recently modified
        if git diff --name-only HEAD~1 2>/dev/null | grep -q "info/DATA_event.json"; then
            event_data_changed=true
        fi
        
        if [[ "$event_data_changed" == true ]]; then
            error "🚨 CRITICAL: Event data was recently modified!"
            error "This has HIGH conversion impact - verify all changes"
            info "Components affected by event data changes:"
            info "  • Hero section (price, date display)"
            info "  • Offer section (pricing, scarcity)"
            info "  • Payment processing (amount validation)"
            info "  • Countdown timers (urgency messaging)"
            info "  • FAQ (date, location references)"
            ((impact_issues += 3))
        fi
    fi
    
    # Check for mismatched urgency messaging
    local days_until=$(days_until_event)
    if [[ "$days_until" =~ ^[0-9]+$ ]]; then
        if [[ $days_until -le 7 ]]; then
            if ! find src -name "*.njk" | xargs grep -l "últimos\|final\|urgente\|agora" 2>/dev/null; then
                warning "High urgency period ($days_until days) but no urgent messaging"
                info "Consider adding final days urgency messaging"
                ((impact_issues++))
            fi
        elif [[ $days_until -ge 60 ]]; then
            if find src -name "*.njk" | xargs grep -l "últimos dias\|final\|urgente" 2>/dev/null; then
                warning "Urgent messaging but event is $days_until days away"
                info "Adjust messaging to match actual timeline"
                ((impact_issues++))
            fi
        fi
    fi
    
    return $impact_issues
}

# Main event data sentinel execution
main() {
    local total_issues=0
    
    info "📅 Event Data Sentinel for $EVENT_NAME"
    info "🎯 Date: $EXPECTED_EVENT_DATE | 💰 Price: €$EXPECTED_PRICE_EUR | 🎫 Spots: $EXPECTED_SPOTS"
    echo ""
    
    # Run all event data validations
    check_event_data_integrity
    ((total_issues += $?))
    
    check_date_calculations
    ((total_issues += $?))
    
    check_pricing_consistency
    ((total_issues += $?))
    
    check_portuguese_consistency
    ((total_issues += $?))
    
    check_guarantee_consistency
    ((total_issues += $?))
    
    check_file_dependencies
    ((total_issues += $?))
    
    check_conversion_impact
    ((total_issues += $?))
    
    echo ""
    
    # Event data summary
    if [[ $total_issues -eq 0 ]]; then
        success "📅 Event Data Sentinel: All systems operational"
        info "Event data integrity validated for premium €$EXPECTED_PRICE_EUR experience"
    elif [[ $total_issues -le 5 ]]; then
        warning "⚠️  Event Data Sentinel: $total_issues issues detected"
        info "Event data mostly consistent with minor issues"
    else
        error "🚨 Event Data Sentinel: $total_issues critical issues found"
        error "Event data inconsistencies can severely impact conversions"
    fi
    
    # Event data monitoring summary
    info ""
    info "📊 Event Data Monitoring Summary:"
    info "  📅 Event Date: $(days_until_event) days until $(blue "$EXPECTED_EVENT_DATE")"
    info "  💰 Current Price: $(get_current_price)"
    info "  🎯 Target: 8 premium spots for Portuguese female entrepreneurs"
    info "  🇵🇹 Market: Portugal (Lisboa) with Euro pricing"
    
    echo ""
    info "🔄 Data Integrity Checklist:"
    info "  ✅ Validate event date matches across all templates"
    info "  ✅ Ensure pricing consistency (display vs payment)"
    info "  ✅ Verify Portuguese localization (dates, currency)"
    info "  ✅ Check countdown and urgency messaging alignment"
    info "  ✅ Validate payment processing amounts"
    info "  ✅ Test guarantee and terms consistency"
    
    return $total_issues
}

# Run the event data sentinel
main "$@"
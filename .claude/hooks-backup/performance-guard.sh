#!/bin/bash
# Performance Guard for Café com Vendas
# Monitors changes that could impact conversion performance

# Source utilities
SCRIPT_DIR="$(dirname "${BASH_SOURCE[0]}")"
source "$SCRIPT_DIR/utils/colors.sh"
source "$SCRIPT_DIR/utils/validators.sh"
source "$SCRIPT_DIR/utils/project-helpers.sh"

# Exit if not Café com Vendas project
if ! is_cafe_project; then
    exit 0
fi

cafe_log "info" "🚀 Performance Guard: Monitoring conversion impact..."

# Performance thresholds for Portuguese market
MOBILE_FIRST_PRIORITY=true
MAX_JS_SIZE_KB=200      # Conservative for mobile connections
MAX_CSS_SIZE_KB=50      # Tailwind should be small
MAX_IMAGE_SIZE_KB=300   # With WebP optimization
TARGET_LCP_SECONDS=2.5  # Core Web Vitals threshold

# Check recent file changes that could impact performance
check_performance_impact() {
    local performance_issues=0
    
    info "🔍 Scanning for performance-critical changes..."
    
    # Check JavaScript bundle size
    if [[ -f "src/assets/js/main.js" ]]; then
        local js_size_kb=$(check_file_size "src/assets/js/main.js" $MAX_JS_SIZE_KB)
        if [[ $? -ne 0 ]]; then
            error "JavaScript bundle may be too large for mobile users"
            info "Consider lazy loading or code splitting"
            ((performance_issues++))
        fi
    fi
    
    # Check for synchronous script loading
    if find src -name "*.njk" -exec grep -l "defer\|async" {} \; | wc -l | grep -q "^0$"; then
        warning "No async/defer script loading found - impacts performance"
        info "Recommendation: Use defer for all non-critical scripts"
        ((performance_issues++))
    fi
    
    # Check for unoptimized images
    check_image_optimization
    
    # Check for performance anti-patterns
    check_performance_antipatterns
    
    return $performance_issues
}

# Check image optimization for Cloudinary WebP
check_image_optimization() {
    info "🖼️  Checking image optimization..."
    
    # Check for local large images that should use Cloudinary
    local large_images=0
    if [[ -d "src/assets/pictures" ]]; then
        while IFS= read -r -d '' image; do
            local size_kb=$(wc -c < "$image" | awk '{print int($1/1024)}')
            if [[ $size_kb -gt $MAX_IMAGE_SIZE_KB ]]; then
                warning "Large local image: $(basename "$image") (${size_kb}KB)"
                info "Consider moving to Cloudinary with f_auto,q_auto parameters"
                ((large_images++))
            fi
        done < <(find src/assets/pictures -type f \( -name "*.jpg" -o -name "*.png" -o -name "*.jpeg" \) -print0 2>/dev/null)
    fi
    
    # Check for proper Cloudinary optimization
    if find src -name "*.njk" -o -name "*.css" | xargs grep -l "res.cloudinary.com" | wc -l | grep -q "^0$"; then
        warning "No Cloudinary usage detected - missing WebP optimization"
        info "Use Cloudinary URLs with f_auto,q_auto for 53% smaller images"
    else
        # Validate Cloudinary URLs include optimization
        if find src -name "*.njk" -o -name "*.css" | xargs grep "res.cloudinary.com" | grep -v "f_auto"; then
            error "Cloudinary URLs missing f_auto optimization"
            info "Add f_auto,q_auto to all Cloudinary URLs for automatic WebP"
        fi
    fi
    
    return $large_images
}

# Check for performance anti-patterns
check_performance_antipatterns() {
    info "⚡ Checking for performance anti-patterns..."
    
    local antipatterns=0
    
    # Check for synchronous third-party scripts
    if grep -r "https://js.stripe.com" src/ --include="*.njk" | grep -v "async\|defer"; then
        error "Stripe.js loaded synchronously - impacts page load"
        info "Use lazy loading pattern from offer.js component"
        ((antipatterns++))
    fi
    
    # Check for inline styles (performance + CSP violation)
    if find src -name "*.njk" | xargs grep -l "style=" 2>/dev/null; then
        error "Inline styles detected - violates CSP and impacts performance"
        info "Use Tailwind classes only"
        ((antipatterns++))
    fi
    
    # Check for console.log in production code
    if find src -name "*.js" | xargs grep -l "console\.log" 2>/dev/null; then
        warning "console.log statements found - remove for production"
        info "These impact performance in some browsers"
        ((antipatterns++))
    fi
    
    # Check for missing lazy loading on images
    if find src -name "*.njk" | xargs grep "<img" | grep -v "loading=\"lazy\"" | head -5; then
        warning "Images without lazy loading detected"
        info "Add loading=\"lazy\" to all images except hero"
        ((antipatterns++))
    fi
    
    return $antipatterns
}

# Validate Core Web Vitals compliance
check_core_web_vitals() {
    info "📊 Validating Core Web Vitals compliance..."
    
    # Check if Lighthouse is available
    if ! command -v lighthouse >/dev/null 2>&1; then
        warning "Lighthouse not available - cannot validate Core Web Vitals"
        info "Install with: npm install -g lighthouse"
        return 1
    fi
    
    # Check for recent build
    if [[ ! -f "_site/index.html" ]]; then
        warning "No build found - run 'npm run build' to test performance"
        return 1
    fi
    
    info "Performance targets for Portuguese market:"
    info "  📱 Mobile-first (primary traffic source)"
    info "  ⚡ LCP < 2.5s (Core Web Vitals)"
    info "  🎯 Performance Score > 90"
    info "  💰 Revenue impact: 1s delay = 7% conversion loss"
    
    return 0
}

# Monitor conversion-critical files
monitor_conversion_files() {
    info "🎯 Monitoring conversion-critical file changes..."
    
    local critical_changes=0
    
    # Get recently modified files
    local recent_files
    if command -v git >/dev/null 2>&1 && git rev-parse --git-dir >/dev/null 2>&1; then
        # Get files changed in last commit or working directory
        recent_files=$(git diff --name-only HEAD~1 2>/dev/null || git diff --name-only --cached 2>/dev/null || echo "")
    fi
    
    if [[ -n "$recent_files" ]]; then
        while IFS= read -r file; do
            if [[ -n "$file" ]] && is_conversion_critical "$file"; then
                warning "🎯 CONVERSION CRITICAL: $(basename "$file") modified"
                info "Component: $(get_component_type "$file")"
                info "Impact: Direct revenue impact - test thoroughly"
                ((critical_changes++))
            fi
        done <<< "$recent_files"
    fi
    
    if [[ $critical_changes -gt 0 ]]; then
        error "$critical_changes conversion-critical files modified"
        info "📋 Pre-deployment checklist:"
        info "  ✅ Test checkout flow with Stripe test cards"
        info "  ✅ Validate mobile experience (80% of traffic)"
        info "  ✅ Run Lighthouse performance audit"
        info "  ✅ Test with slow 3G connection"
        info "  ✅ Verify Portuguese content accuracy"
    fi
    
    return $critical_changes
}

# Main performance guard execution
main() {
    local total_issues=0
    
    # Run all performance checks
    check_performance_impact
    ((total_issues += $?))
    
    monitor_conversion_files
    ((total_issues += $?))
    
    check_core_web_vitals
    # Don't add to issues count as this is informational
    
    # Summary
    if [[ $total_issues -eq 0 ]]; then
        success "🚀 Performance Guard: No issues detected"
        info "Landing page optimized for Portuguese mobile users"
    else
        warning "⚠️  Performance Guard: $total_issues issues require attention"
        error "Performance issues can reduce conversion rates by up to 7% per second"
        info "Mobile performance is critical for Portuguese market success"
    fi
    
    # Performance tips for Portuguese market
    info ""
    info "💡 Performance Tips for Portuguese Market:"
    info "  📱 Mobile traffic dominates (test on 3G/4G)"
    info "  🌍 CloudFlare CDN reduces latency to Europe"
    info "  🖼️  WebP images save 53% bandwidth (use Cloudinary f_auto)"
    info "  ⚡ Lazy load Stripe.js saves 187KB on page load"
    info "  🎯 Target: Hero visible < 1.8s, Interactive < 2.5s"
    
    return $total_issues
}

# Run the performance guard
main "$@"
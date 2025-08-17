#!/bin/bash
# Configuration for Café com Vendas hooks

# Hook verbosity levels
HOOK_MODE="${CAFE_HOOK_MODE:-light}"  # light, full, silent

# Performance settings
ENABLE_PERFORMANCE_CHECKS="${CAFE_PERFORMANCE_CHECKS:-false}"
ENABLE_ACCESSIBILITY_CHECKS="${CAFE_A11Y_CHECKS:-false}"
ENABLE_SECURITY_CHECKS="${CAFE_SECURITY_CHECKS:-true}"

# Quick check if we should run comprehensive validation
should_run_full_validation() {
    [[ "$HOOK_MODE" == "full" ]] || [[ -n "$CAFE_FULL_VALIDATION" ]]
}

# Check if specific validation type is enabled
is_validation_enabled() {
    local validation_type="$1"
    case "$validation_type" in
        "performance") [[ "$ENABLE_PERFORMANCE_CHECKS" == "true" ]] ;;
        "accessibility") [[ "$ENABLE_ACCESSIBILITY_CHECKS" == "true" ]] ;;
        "security") [[ "$ENABLE_SECURITY_CHECKS" == "true" ]] ;;
        *) return 1 ;;
    esac
}
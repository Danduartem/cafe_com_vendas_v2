#!/bin/bash
# Color output utilities for Café com Vendas hooks

# Color functions for consistent output
red() { echo -e "\033[31m$1\033[0m"; }
green() { echo -e "\033[32m$1\033[0m"; }
yellow() { echo -e "\033[33m$1\033[0m"; }
blue() { echo -e "\033[34m$1\033[0m"; }
purple() { echo -e "\033[35m$1\033[0m"; }
cyan() { echo -e "\033[36m$1\033[0m"; }
bold() { echo -e "\033[1m$1\033[0m"; }

# Status indicators
success() { echo "$(green '✅') $1"; }
warning() { echo "$(yellow '⚠️ ') $1"; }
error() { echo "$(red '❌') $1"; }
info() { echo "$(blue 'ℹ️ ') $1"; }
check() { echo "$(cyan '🔍') $1"; }

# Café com Vendas branded log function
cafe_log() {
    local level="$1"
    local message="$2"
    local timestamp="$(date +'%H:%M:%S')"
    
    case "$level" in
        "success") echo "[$(blue "$timestamp")] $(success "$message")" ;;
        "warning") echo "[$(blue "$timestamp")] $(warning "$message")" ;;
        "error") echo "[$(blue "$timestamp")] $(error "$message")" ;;
        "info") echo "[$(blue "$timestamp")] $(info "$message")" ;;
        "check") echo "[$(blue "$timestamp")] $(check "$message")" ;;
        *) echo "[$(blue "$timestamp")] ☕ [Café com Vendas] $message" ;;
    esac
}
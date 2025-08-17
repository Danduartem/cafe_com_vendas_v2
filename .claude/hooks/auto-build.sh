#!/bin/bash
# Café com Vendas landing page build automation
# Optimized for Eleventy + Vite + Tailwind CSS + design tokens

# Function to log with timestamp
log() {
    echo "[$(date +'%H:%M:%S')] 🔧 [Auto-build] $1"
}

# Check if this is the Café com Vendas project
if [[ ! -f package.json ]] || ! grep -q "cafe-com-vendas-landing" package.json; then
    log "⚠️  Not a Café com Vendas project, skipping auto-build"
    exit 0
fi

# Landing page specific build sequence
if [[ -f package.json ]] && grep -q '"build"' package.json; then
    log "🏗️  Starting landing page build sequence..."
    
    # Step 1: Build design tokens (critical for CSS)
    if grep -q '"tokens:build"' package.json; then
        log "🎨 Building design tokens..."
        npm run tokens:build 2>/dev/null || log "❌ Token build failed"
    fi
    
    # Step 2: Build CSS with PostCSS and Tailwind
    if grep -q '"build:css"' package.json; then
        log "💄 Building Tailwind CSS..."
        npm run build:css 2>/dev/null || log "❌ CSS build failed"
    fi
    
    # Step 3: Build JavaScript with Vite
    if grep -q '"build:js"' package.json; then
        log "📦 Building JavaScript with Vite..."
        npm run build:js 2>/dev/null || log "❌ JS build failed"
    fi
    
    # Step 4: Build static site with Eleventy
    if grep -q '"eleventy"' package.json; then
        log "🏛️  Building static site with Eleventy..."
        npm run eleventy 2>/dev/null || log "❌ Eleventy build failed"
    fi
    
    # Check if _site directory was created
    if [[ -d "_site" ]]; then
        log "✅ Landing page build complete - ready for deployment"
        
        # Optional: Quick validation
        if [[ -f "_site/index.html" ]]; then
            log "📄 Index page generated successfully"
        else
            log "⚠️  Index page missing - check build"
        fi
    else
        log "❌ Build failed - no _site directory created"
    fi
else
    log "⚠️  No build script found in package.json"
fi
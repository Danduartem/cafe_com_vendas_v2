#!/usr/bin/env bash
# Café com Vendas – landing page build automation
# Works with Eleventy + Vite + Tailwind (v3 or v4) + design tokens

set -euo pipefail

# ---------- logging ----------
log() { printf '[%(%H:%M:%S)T] 🔧 [Auto-build] %s\n' -1 "$1"; }
ok()  { printf '[%(%H:%M:%S)T] ✅ [Auto-build] %s\n' -1 "$1"; }
warn(){ printf '[%(%H:%M:%S)T] ⚠️  [Auto-build] %s\n' -1 "$1"; }
err() { printf '[%(%H:%M:%S)T] ❌ [Auto-build] %s\n' -1 "$1"; }

# ---------- timers & trap ----------
START_TS=$(date +%s)
trap 'code=$?; dur=$(( $(date +%s) - START_TS )); 
      if [ $code -ne 0 ]; then err "Build failed in ${dur}s (exit $code)"; else ok "Build finished in ${dur}s"; fi; exit $code' EXIT

# ---------- project guard (opt-out with CAFE_SKIP_GUARD=1) ----------
if [[ "${CAFE_SKIP_GUARD:-0}" != "1" ]]; then
  if [[ ! -f package.json ]] || ! grep -q '"cafe-com-vendas-landing"' package.json; then
    warn "Not a Café com Vendas project (set CAFE_SKIP_GUARD=1 to bypass). Skipping."
    exit 0
  fi
fi

# ---------- package manager detection ----------
pm_cmd() {
  if [ -f pnpm-lock.yaml ] || grep -q '"packageManager": "pnpm' package.json 2>/dev/null; then
    echo pnpm
  elif [ -f yarn.lock ] || grep -q '"packageManager": "yarn' package.json 2>/dev/null; then
    echo yarn
  else
    echo npm
  fi
}
PM=$(pm_cmd)

run_script() {
  local script="$1" ; shift || true
  case "$PM" in
    pnpm) pnpm -s run "$script" "$@" ;;
    yarn) yarn -s "$script" "$@" ;;
    npm)  npm  run -s "$script" "$@" ;;
  esac
}

has_script() {
  # portable check without jq
  grep -q "\"$1\"" package.json 2>/dev/null || return 1
}

# ---------- env sanity ----------
command -v node >/dev/null || { err "Node.js not found"; exit 1; }
node -v | grep -Eq '^v1[68]\.' || warn "Node v16/18+ recommended (found $(node -v))"

# ---------- build pipeline ----------
log "Using package manager: $PM"

# Tokens (optional)
if has_script "tokens:build"; then
  log "🎨 Building design tokens..."
  if ! run_script tokens:build; then err "Token build failed"; exit 2; fi
else
  warn "No tokens:build script; skipping"
fi

# CSS (Tailwind/PostCSS or Tailwind v4 CLI)
if has_script "build:css"; then
  log "💄 Building CSS..."
  if ! run_script build:css; then err "CSS build failed"; exit 3; fi
else
  warn "No build:css script; skipping"
fi

# JS (Vite or equivalent)
if has_script "build:js"; then
  log "📦 Building JavaScript..."
  if ! run_script build:js; then err "JS build failed"; exit 4; fi
else
  warn "No build:js script; skipping"
fi

# Eleventy (prefer a script alias; fallback to npx if needed)
if has_script "eleventy"; then
  log "🏛️  Building static site with Eleventy (script)..."
  if ! run_script eleventy; then err "Eleventy build failed"; exit 5; fi
elif npx --yes @11ty/eleventy -v >/dev/null 2>&1; then
  log "🏛️  Building static site with Eleventy (npx)..."
  if ! npx --yes @11ty/eleventy; then err "Eleventy build failed"; exit 5; fi
else
  warn "Eleventy not found; skipping"
fi

# ---------- outputs ----------
if [[ -d "_site" ]]; then
  ok "Landing page build complete – ready for deploy"
  if [[ -f "_site/index.html" ]]; then
    ok "📄 Index page generated"
  else
    warn "Index page missing – check Eleventy input/output config"
  fi
else
  err "No _site directory created"
  exit 6
fi

# Version Awareness System

This document describes the version awareness system implemented to ensure Claude Code always uses the correct, up-to-date library APIs.

## Problem Solved

Claude Code's training data may contain outdated library APIs, leading to:
- Code that uses deprecated or non-existent functions
- Incompatibility issues with installed package versions
- Time wasted refactoring code to use modern APIs
- Build failures due to API mismatches

## Solution Overview

We've implemented a comprehensive version awareness system that:
1. **Checks installed versions** before writing any code
2. **Fetches current documentation** via Context7 MCP
3. **Validates API compatibility** with TypeScript
4. **Tests critical APIs** to ensure they exist
5. **Identifies deprecated patterns** and suggests alternatives

## Components

### 1. Enhanced CLAUDE.md Guidelines
- Added "Version Awareness Protocol" section
- Mandatory pre-code checklist
- Banned patterns list for common outdated APIs
- Context7 integration instructions

### 2. New `/version-check` Command
Location: `.claude/commands/version-check.md`

Features:
- Displays all installed package versions
- Fetches documentation via Context7 for exact versions
- Runs TypeScript type checking
- Identifies deprecated patterns
- Suggests modern API alternatives

Usage:
```bash
/version-check              # Full check with docs
/version-check --quick      # Just show versions
/version-check vite         # Check specific package
```

### 3. TypeScript API Verification Script
Location: `scripts/verify-apis.ts`

Purpose:
- Validates that APIs used in code actually exist
- Checks for deprecated patterns
- Provides modern alternatives
- Fails CI/CD if outdated APIs are detected

Run with: `npm run verify-apis`

### 4. API Test Suite
Location: `scripts/test-apis.ts`

Purpose:
- Quick tests for critical APIs
- Validates Vite 7.x, Stripe 18.x, ESM, and TypeScript configs
- Ensures modern patterns are available
- Catches API breaking changes

Run with: `npm run test-apis`

### 5. Enhanced TypeScript Configuration
Location: `tsconfig.json`

Changes:
- Strict type checking enabled
- Checks JavaScript files too
- Validates library types (skipLibCheck: false)
- Includes all project files for comprehensive checking

### 6. Updated Package.json Scripts
New scripts added:
- `npm run verify-apis` - Run API verification
- `npm run test-apis` - Run API tests
- `npm run type-check` - TypeScript validation

## Workflow

### For Every Coding Session

1. **Start with version check:**
   ```bash
   /version-check
   ```

2. **Before writing code:**
   - Check package.json for exact versions
   - Use Context7 to fetch docs for those versions
   - Review banned patterns list

3. **After writing code:**
   ```bash
   npm run type-check
   npm run verify-apis
   npm run test-apis
   ```

### When Updating Dependencies

1. **Use the enhanced `/update` command:**
   - Automatically runs version-check first
   - Fetches new documentation
   - Refactors code to use new APIs
   - Validates with TypeScript

## Context7 MCP Integration

Context7 MCP is crucial for getting up-to-date documentation:

### How to Use:
```typescript
// 1. Resolve library ID
mcp__context7__resolve-library-id('vite')

// 2. Get documentation
mcp__context7__get-library-docs('/vitejs/vite', { 
  tokens: 1000,
  topic: 'config'
})
```

### Benefits:
- Real-time documentation for exact versions
- No reliance on outdated training data
- Version-specific API examples
- Breaking change notifications

## Banned Patterns

### Vite (v7.x)
- ❌ `import.meta.globEager` → ✅ `import.meta.glob({ eager: true })`
- ❌ `optimizeDeps.entries` → ✅ `optimizeDeps.include`

### Eleventy (v3.x)
- ❌ `module.exports` → ✅ `export default`
- ❌ `.eleventy.cjs` → ✅ `.eleventy.js` (ESM)

### Tailwind CSS (v4.x)
- ❌ `tailwind.config.js` → ✅ CSS `@theme` configuration
- ❌ JavaScript config → ✅ Pure CSS configuration

### Stripe (v18.x)
- ❌ Charges API → ✅ Payment Intents API
- ❌ Sources → ✅ Payment Methods

## CI/CD Integration

Add to your CI pipeline:
```yaml
- name: Check Types
  run: npm run type-check
  
- name: Verify APIs
  run: npm run verify-apis
  
- name: Test APIs
  run: npm run test-apis
```

## Benefits

1. **Accuracy**: Code always uses correct APIs for installed versions
2. **Speed**: No time wasted on refactoring outdated code
3. **Reliability**: TypeScript catches API mismatches at compile time
4. **Documentation**: Always have access to current, version-specific docs
5. **Confidence**: Know that generated code will work with your dependencies

## Maintenance

- Keep banned patterns list updated when upgrading major versions
- Run `/version-check` at the start of each coding session
- Update Context7 MCP regularly for latest documentation sources
- Review and update test suites when adding new dependencies

## Troubleshooting

### "API not found" errors
1. Run `/version-check` to sync documentation
2. Check package.json for actual installed version
3. Use Context7 to get correct API for that version

### TypeScript errors
1. Run `npm run type-check` to see specific issues
2. Check tsconfig.json includes all necessary files
3. Ensure @types packages are installed

### Deprecated API warnings
1. Run `npm run verify-apis` to identify patterns
2. Check the modern alternatives suggested
3. Update code to use recommended APIs
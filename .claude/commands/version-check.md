# /version-check

Check installed package versions and fetch latest documentation via Context7 MCP.

## Usage
```
/version-check              # Full version check with docs
/version-check --quick      # Just show versions, skip docs
/version-check [package]    # Check specific package
```

## What it does

### Version Discovery
1. Reads package.json for exact versions
2. Shows current installed versions
3. Identifies outdated packages
4. Runs TypeScript type checking

### Documentation Fetching
1. Uses Context7 MCP to fetch docs for installed versions
2. Prioritizes exact version matches
3. Caches documentation for session
4. Highlights API changes between versions

### API Validation
1. Runs `npm run type-check` to validate TypeScript
2. Scans for deprecated API patterns
3. Suggests modern alternatives
4. Creates version context for session

## Workflow

### Phase 1: Version Analysis
- Read package.json dependencies
- Run `npm run versions` for installed packages
- Run `npm run outdated` to check for updates
- Display version summary table

### Phase 2: Documentation Sync
- For each critical dependency (Vite, Eleventy, Tailwind, Stripe):
  - Use Context7 to resolve library ID
  - Fetch documentation for exact version
  - Note any breaking changes or new features
  - Cache docs for current session

### Phase 3: Code Validation
- Run TypeScript type checking
- Scan for deprecated patterns:
  - Vite: `import.meta.globEager`, old plugin APIs
  - Eleventy: CommonJS patterns, callback filters
  - Tailwind: JavaScript config patterns
  - Stripe: Legacy checkout, Sources API
- Generate report of issues found

### Phase 4: Recommendations
- List modern API alternatives
- Suggest refactoring priorities
- Show migration examples
- Provide Context7 doc links

## Output Format

```
📦 Version Check Report
═══════════════════════

Current Versions:
┌─────────────────┬──────────┬──────────┬─────────┐
│ Package         │ Current  │ Latest   │ Status  │
├─────────────────┼──────────┼──────────┼─────────┤
│ vite            │ 7.1.2    │ 7.1.3    │ ⚠️ Minor │
│ @11ty/eleventy  │ 3.1.2    │ 3.1.2    │ ✅ Current│
│ tailwindcss     │ 4.1.12   │ 4.1.12   │ ✅ Current│
│ stripe          │ 18.4.0   │ 18.4.0   │ ✅ Current│
└─────────────────┴──────────┴──────────┴─────────┘

📚 Documentation Status:
✅ Vite 7.x docs loaded (939 snippets available)
✅ Eleventy 3.x docs loaded (ESM patterns confirmed)
✅ Tailwind v4 docs loaded (CSS-first config)
✅ Stripe docs loaded (Payment Intents API)

🔍 Deprecated Patterns Found: 0

✅ TypeScript Validation: PASSED
```

## Key Dependencies to Check

Priority packages that must be version-aware:
- **vite**: Build tool, frequent API changes
- **@11ty/eleventy**: SSG, v3 has breaking changes
- **tailwindcss**: v4 uses CSS-first config
- **stripe**: Payment API, version-locked
- **typescript**: Type checking accuracy
- **postcss**: CSS processing pipeline

## Integration with Other Commands

- **/update**: Runs version-check before updating
- **/dev**: Suggests running version-check if outdated
- **/build**: Validates versions before production build
- **/commit**: Includes version info in commit if updated

## Examples

```bash
# Full check at session start
/version-check

# Quick check before coding
/version-check --quick

# Check specific package
/version-check vite

# After dependency update
/version-check --validate
```

## Error Handling

- Missing Context7: Falls back to reading local docs
- Type check failures: Shows specific API issues
- Network errors: Uses cached documentation
- Version mismatches: Warns and suggests update
# /version-check — Version Awareness Command

Run a full dependency + docs check. Use this at **start of every coding session** or after any dependency update.

---

## Workflow

### Phase 1 — Version Analysis
1. `npm run versions`
2. `npm run outdated`
3. Show summary table (package | current | latest | status)

### Phase 2 — Documentation Sync (via Context7 MCP)
For each key dependency:
- Vite, Eleventy, TailwindCSS, Stripe, TypeScript, PostCSS
Steps:
1. `mcp__context7__resolve-library-id("<pkg>")`
2. `mcp__context7__get-library-docs(<id>, version=<exact>)`
3. Confirm docs cached for session

### Phase 3 — API Validation
1. `npm run type-check`
2. Scan repo for known deprecated patterns:
   - Vite: `globEager`, old plugin APIs
   - Eleventy: CommonJS config, callback filters
   - Tailwind: `tailwind.config.js`
   - Stripe: Charges API, Sources API
3. Mark ✅ or ⚠️ for each pattern found

### Phase 4 — Report
Output in fixed structure:


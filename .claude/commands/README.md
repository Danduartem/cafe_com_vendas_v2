# 🚀 Claude Commands

Simple, practical commands for everyday development tasks. Each command runs in <30 seconds with sensible defaults.

## Quick Reference

| Command | Purpose | Usage | Time |
|---------|---------|-------|------|
| `/deploy` | Deploy to Netlify | `/deploy` | 30s |
| `/commit` | Smart git commit with quality gates | `/commit` | 8s |
| `/push` | Safe git push with PR creation | `/push` | 5s |
| `/test` | Unified testing (unit/visual/payment) | `/test --all` | 20s |
| `/lighthouse` | Performance & accessibility audit | `/lighthouse` | 20s |
| `/update` | Safe dependency updates | `/update` | 20s |
| `/project:plan-then-apply` | Plan-first development | Plan-first workflow | 5s |

## Daily Workflow

### Morning Start
```bash
npm run dev:netlify # Unified dev server (recommended - includes payment functions)
# OR
npm run dev         # Standard dev server (static only, now uses port 8888)
```

### Before Lunch
```bash
/commit           # Save morning work (includes type-check + lint)
/push             # Share with team
```

### After Changes
```bash
npm run build     # Test production build (use npm directly)
/lighthouse --quick # Check performance
```

### End of Day
```bash
/commit           # Save work (quality gates included)
/push --pr        # Create pull request
/deploy --preview # Deploy preview
```

## Command Details

### 🚀 Deployment

#### `/deploy` - Deploy to Netlify
Deploys to production with checks.
```bash
/deploy         # Production deploy
/deploy --preview # Preview deploy
```

### 📝 Git Operations

#### `/commit` - Smart Commit
Creates conventional commits with emojis.
```bash
/commit         # Auto-stage and commit
/commit --no-verify # Skip checks
```

#### `/push` - Safe Push
Pushes with safety checks.
```bash
/push           # Push current branch
/push --pr      # Create pull request
```

### 🔍 Quality & Testing

#### `/test` - Unified Test Suite
Unified testing with Vitest, Playwright, and Stripe integration.
```bash
/test             # Unit tests
/test --visual    # Playwright tests  
/test --payment   # Stripe integration tests
/test --all       # Everything
```

#### `/lighthouse` - Web Audit
Complete Lighthouse audit (performance, SEO, accessibility).
```bash
/lighthouse       # Full audit
/lighthouse --mobile # Mobile only
```


### 🔄 Maintenance

#### `/update` - Update Dependencies
Updates packages safely.
```bash
/update         # Minor/patch only
/update --major # Include majors
```

#### `/project:plan-then-apply` - Plan-First Workflow
Core command for minimal, type-safe changes.
```bash
/project:plan-then-apply "add feature X"
```

## Common Scenarios

### Feature Development
```bash
npm run dev             # Start working (use npm directly)
# Make changes...
/test                   # Run tests  
/commit                 # Save progress (includes type-check + lint)
npm run build           # Verify build (use npm directly)
/lighthouse --quick     # Check performance
/push --pr              # Create PR
```

### Bug Fix
```bash
/project:plan-then-apply "fix: resolve payment issue"
# Apply the fix...
/test --payment         # Verify payment fix
/commit                 # Commit fix (includes quality gates)
/push                   # Push changes
```

### Performance Optimization
```bash
/lighthouse             # Baseline metrics
# Make optimizations...
npm run build           # Production build (use npm directly)
/lighthouse             # Compare metrics
/commit                 # Save improvements
```

### TypeScript-First Development
```bash
npm run type-check --watch # Continuous type checking (use npm directly)
# Code with full type safety...
npm run lint --fix         # Auto-fix style issues (use npm directly) 
/test --watch              # Live testing
/commit                    # Quality-assured commit (includes type-check + lint)
```

## Tips & Tricks

### Speed Tips
- Use `npm run dev` for daily development (fastest)
- Run `/lighthouse --quick` for quick performance checks
- Use `npm run type-check --watch` for continuous validation
- Use `/commit` without staging (auto-stages all)

### Safety Tips
- Quality gates are automatic in `/commit` (type-check + lint + tests)
- Always `npm run build` before `/deploy`
- Use `/push --pr` for important changes
- Run `/test --payment` after Stripe updates

### Quality Tips
- Use `/project:plan-then-apply` for all changes (TypeScript-first)
- Run `/lighthouse` after major changes
- Use `npm run lint --fix` to auto-resolve style issues
- Keep `npm run type-check --watch` running while coding
- **Auto-formatting**: Files are automatically formatted when Claude edits them (via PostToolUse hook)

## Environment Variables

Required for some commands:
```bash
# Stripe (for /test --payment)
VITE_STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...

# Netlify (for /deploy)
NETLIFY_AUTH_TOKEN=...
NETLIFY_SITE_ID=...
```

## Troubleshooting

| Issue | Solution |
|-------|----------|
| `npm run dev` port in use | Kill process: `lsof -ti:8888 \| xargs kill` |
| `/commit` fails | Check quality gates: `npm run type-check && npm run lint` |
| `npm run build` fails | Check Node version (needs 22+), run quality gates first |
| `/test` fails | Check specific test type: `/test --visual` or `/test --payment` |
| `/deploy` fails | Verify Netlify token and environment variables |
| `/test --payment` fails | Check Stripe keys in environment |
| `/lighthouse` timeout | Use `--quick` flag for performance only |

## Command Options

Most commands support options:
- `--help` - Show help
- `--dry-run` - Preview without executing
- `--verbose` - Detailed output
- `--quiet` - Minimal output

Example:
```bash
/deploy --dry-run        # Preview what would deploy
/update --verbose        # Show all package changes
/lighthouse --quiet      # Just show scores
/test --payment          # Test Stripe integration
npm run lint --fix       # Auto-fix style issues (use npm directly)
npm run type-check --watch # Continuous type checking (use npm directly)
```

---

**Pro tip**: Quality gates are built into `/commit`, then chain high-value commands:
```bash
/commit && npm run build && /lighthouse && /deploy
```

**Core Quality Pipeline**: Built into `/commit` automatically:
```bash
/commit  # Includes: type-check + lint + auto-stage + smart commit message
```

**Need help?** Each command shows help with:
```bash
/[command] --help
```
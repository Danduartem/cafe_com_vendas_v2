# 🚀 Claude Commands

Simple, practical commands for everyday development tasks. Each command runs in <30 seconds with sensible defaults.

## Quick Reference

| Command | Purpose | Usage | Time |
|---------|---------|-------|------|
| `/dev` | Start dev server | `/dev` | 3s |
| `/build` | Production build | `/build` | 15s |
| `/deploy` | Deploy to Netlify | `/deploy` | 30s |
| `/commit` | Smart git commit | `/commit` | 5s |
| `/push` | Safe git push | `/push` | 5s |
| `/update` | Update dependencies | `/update` | 20s |
| `/lighthouse` | Full web audit | `/lighthouse` | 20s |
| `/test-payment` | Test Stripe | `/test-payment` | 10s |
| `/lint` | TypeScript linting | `/lint` | 5s |
| `/type-check` | Type validation | `/type-check` | 5s |
| `/test` | Run all tests | `/test` | 15s |
| `/project:plan-then-apply` | Plan changes | Plan-first workflow | 5s |

## Daily Workflow

### Morning Start
```bash
/dev              # Start development
```

### Before Lunch
```bash
/commit           # Save morning work
/push             # Share with team
```

### After Changes
```bash
/type-check       # Validate TypeScript
/lint             # Check code quality
/build            # Test production build
/lighthouse --quick # Check performance
```

### End of Day
```bash
/commit           # Save work
/push --pr        # Create pull request
/deploy --preview # Deploy preview
```

## Command Details

### 🔧 Development

#### `/dev` - Start Development
Starts local server with hot reload.
```bash
/dev            # Default port 8080
/dev --open     # Open browser
```

#### `/build` - Production Build
Creates optimized production build.
```bash
/build          # Build to _site/
/build --analyze # Show bundle stats
```

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

### 🔍 Quality Checks

#### `/type-check` - TypeScript Validation
Validates TypeScript without emitting files.
```bash
/type-check       # Check all types
/type-check --watch # Continuous checking
```

#### `/lint` - Code Quality
ESLint validation with auto-fix.
```bash
/lint             # Check code style
/lint --fix       # Auto-fix issues
```

#### `/test` - Test Suite
Unified testing with Vitest and Playwright.
```bash
/test             # Unit tests
/test --visual    # Playwright tests
/test --all       # Everything
```

#### `/lighthouse` - Web Audit
Complete Lighthouse audit (performance, SEO, accessibility).
```bash
/lighthouse       # Full audit
/lighthouse --mobile # Mobile only
```

#### `/test-payment` - Payment Testing
Tests Stripe integration.
```bash
/test-payment     # Basic test
/test-payment --full # All scenarios
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
/dev                    # Start working
# Make changes...
/type-check             # Validate types
/lint                   # Check code quality
/test                   # Run tests
/commit                 # Save progress
/build                  # Verify build
/lighthouse --quick     # Check performance
/push --pr              # Create PR
```

### Bug Fix
```bash
/project:plan-then-apply "fix: resolve payment issue"
# Apply the fix...
/type-check && /lint && /test  # Quality gates
/test-payment           # Verify fix
/commit                 # Commit fix
/push                   # Push changes
```

### Performance Optimization
```bash
/lighthouse             # Baseline metrics
# Make optimizations...
/build                  # Production build
/lighthouse             # Compare metrics
/commit                 # Save improvements
```

### TypeScript-First Development
```bash
/type-check --watch     # Continuous type checking
# Code with full type safety...
/lint --fix             # Auto-fix style issues
/test --watch           # Live testing
/commit                 # Quality-assured commit
```

## Tips & Tricks

### Speed Tips
- Use `/dev` for daily development (fastest)
- Run `/lighthouse --quick` for quick performance checks
- Use `/type-check --watch` for continuous validation
- Use `/commit` without staging (auto-stages all)

### Safety Tips
- Always run quality gates: `/type-check && /lint && /test`
- Always `/build` before `/deploy`
- Use `/push --pr` for important changes
- Run `/test-payment` after Stripe updates

### Quality Tips
- Use `/project:plan-then-apply` for all changes (TypeScript-first)
- Run `/lighthouse` after major changes
- Use `/lint --fix` to auto-resolve style issues
- Keep `/type-check --watch` running while coding

## Environment Variables

Required for some commands:
```bash
# Stripe (for /test-payment)
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
| `/dev` port in use | Kill process: `lsof -ti:8080 \| xargs kill` |
| `/type-check` fails | Run `npm run type-check` to see detailed errors |
| `/lint` fails | Use `/lint --fix` to auto-resolve issues |
| `/build` fails | Check Node version (needs 22+), run quality gates first |
| `/test` fails | Check unit tests vs visual tests separately |
| `/deploy` fails | Verify Netlify token and environment variables |
| `/test-payment` fails | Check Stripe keys in environment |
| `/lighthouse` timeout | Use `--quick` flag for performance only |

## Command Options

Most commands support options:
- `--help` - Show help
- `--dry-run` - Preview without executing
- `--verbose` - Detailed output
- `--quiet` - Minimal output

Example:
```bash
/deploy --dry-run     # Preview what would deploy
/update --verbose     # Show all package changes
/lighthouse --quiet   # Just show scores
/lint --fix           # Auto-fix style issues
/type-check --watch   # Continuous type checking
```

---

**Pro tip**: Commands are designed to be chainable following TypeScript-first quality gates:
```bash
/type-check && /lint && /test && /build && /lighthouse && /deploy
```

**Core Quality Pipeline**: Always run these three together:
```bash
/type-check && /lint && /test
```

**Need help?** Each command shows help with:
```bash
/[command] --help
```
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
| `/perf` | Performance audit | `/perf` | 20s |
| `/test-payment` | Test Stripe | `/test-payment` | 10s |
| `/audit` | Conversion audit | `/audit` | 15s |
| `/sync` | Sync documentation | `/sync` | 10s |

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
/build            # Test production build
/perf --quick     # Check performance
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

#### `/perf` - Performance Audit
Runs Lighthouse performance audit.
```bash
/perf           # Full audit
/perf --mobile  # Mobile only
```

#### `/audit` - Conversion Audit
Checks conversion optimization.
```bash
/audit          # Full audit
/audit --mobile # Mobile focus
```

#### `/test-payment` - Test Payments
Tests Stripe integration.
```bash
/test-payment   # Basic test
/test-payment --full # All scenarios
```

### 🔄 Maintenance

#### `/update` - Update Dependencies
Updates packages safely.
```bash
/update         # Minor/patch only
/update --major # Include majors
```

#### `/sync` - Sync Documentation
Updates docs to match code.
```bash
/sync           # Update all docs
/sync --check   # Check only
```

## Common Scenarios

### Feature Development
```bash
/dev                    # Start working
# Make changes...
/commit                 # Save progress
/build                  # Verify build
/perf --quick          # Check performance
/push --pr             # Create PR
```

### Bug Fix
```bash
/dev                    # Reproduce issue
# Fix bug...
/test-payment          # Verify fix
/commit                # Commit fix
/push                  # Push changes
/deploy --preview      # Test in preview
```

### Performance Optimization
```bash
/perf                  # Baseline metrics
# Make optimizations...
/build                 # Production build
/perf                  # Compare metrics
/commit               # Save improvements
```

### Dependency Updates
```bash
/update               # Update packages
/build                # Verify build
/test-payment         # Test payments
/perf                 # Check performance
/commit               # Commit updates
```

## Tips & Tricks

### Speed Tips
- Use `/dev` for daily development (fastest)
- Run `/perf --quick` for quick checks
- Use `/commit` without staging (auto-stages all)

### Safety Tips
- Always `/build` before `/deploy`
- Use `/push --pr` for important changes
- Run `/test-payment` after Stripe updates

### Quality Tips
- Run `/audit` weekly
- Check `/perf` after major changes
- Use `/sync` to keep docs current

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
| `/build` fails | Check Node version (needs 22+) |
| `/deploy` fails | Verify Netlify token |
| `/test-payment` fails | Check Stripe keys |
| `/perf` timeout | Use `--quick` flag |

## Command Options

Most commands support options:
- `--help` - Show help
- `--dry-run` - Preview without executing
- `--verbose` - Detailed output
- `--quiet` - Minimal output

Example:
```bash
/deploy --dry-run   # Preview what would deploy
/update --verbose   # Show all package changes
/perf --quiet      # Just show scores
```

---

**Pro tip**: Commands are designed to be chainable:
```bash
/build && /perf && /deploy
```

**Need help?** Each command shows help with:
```bash
/[command] --help
```
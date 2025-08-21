# /update

Update dependencies and refactor code to use latest features.

## Usage
```
/update                  # Update all dependencies (safe)
/update --deps          # Dependencies only
/update --refactor      # Refactor code only
/update --major         # Include major versions
```

## What it does

### Dependency Updates (default)
1. Runs `/version-check` first to understand current state
2. Checks outdated packages with `npm outdated`
3. Fetches documentation via Context7 for new versions
4. Updates to latest minor/patch versions
5. Runs TypeScript validation with `npm run type-check`
6. Runs API verification with `npm run verify-apis`
7. Runs build to verify compatibility
8. Shows changelog summary with breaking changes

### Code Refactoring
1. Scans for deprecated API patterns
2. Updates to latest syntax based on fetched docs
3. Removes deprecated patterns identified by verify-apis
4. Optimizes imports using modern patterns
5. Improves performance patterns per latest docs
6. Validates all changes with TypeScript

## Safety Features
- Runs `/version-check` to establish baseline
- Creates backup branch first
- Only minor/patch by default
- TypeScript validation at each step
- API compatibility verification
- Validates build output
- Can rollback if needed

## Examples
```bash
# Safe update (minor/patch)
/update

# Update deps + refactor
/update --deps --refactor

# Preview major updates
/update --major --dry-run
```

## Key Dependencies
- Eleventy 3.x (ESM)
- Vite 7.x
- Tailwind CSS v4
- Stripe SDK
- PostCSS/Autoprefixer
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
1. Checks outdated packages
2. Updates to latest minor/patch
3. Runs build to verify
4. Tests key features
5. Shows changelog summary

### Code Refactoring
1. Updates to latest syntax
2. Removes deprecated patterns
3. Optimizes imports
4. Improves performance patterns

## Safety Features
- Creates backup branch first
- Only minor/patch by default
- Runs full test suite
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
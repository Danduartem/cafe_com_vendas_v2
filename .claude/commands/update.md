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
1. **Version Check**: Runs `/project:version-check` to establish baseline
2. **Outdated Analysis**: `npm run outdated` to identify update candidates
3. **Documentation Sync**: Context7 fetches exact-version docs for major dependencies
4. **Safe Updates**: `npm run update` for minor/patch versions only
5. **API Validation**: `npm run verify-apis` to catch deprecated patterns
6. **Quality Gates**: `npm run type-check && npm run lint && npm run test`
7. **Build Verification**: `npm run build` to ensure production compatibility
8. **Change Summary**: Documents what was updated and any breaking changes

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
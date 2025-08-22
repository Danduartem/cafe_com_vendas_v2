# /lint

TypeScript ESLint validation with auto-fix capabilities.

## Usage
```
/lint                    # Check all TypeScript files
/lint --fix              # Auto-fix issues where possible
/lint --watch            # Watch mode (continuous checking)
```

## What it does
1. Runs ESLint on all `.ts` files in the project
2. Validates TypeScript code style and patterns
3. Checks for potential bugs and anti-patterns
4. Enforces coding standards from `eslint.config.ts`
5. Can automatically fix many issues

## Key Checks
- **TypeScript**: Proper typing, no `any` usage
- **Code Quality**: Unused variables, unreachable code
- **Style**: Consistent formatting, import organization
- **Best Practices**: Modern ES6+ patterns, proper async/await
- **Project Rules**: ESM imports with `.js` extensions

## Examples
```bash
# Quick lint check
/lint

# Fix auto-fixable issues
/lint --fix

# Continuous checking while coding
/lint --watch
```

## Integration
- Part of quality gate: `npm run type-check && npm run lint && npm test`
- Pre-commit hook validation
- CI/CD pipeline checks
- Works with your TypeScript-first approach

## Output
✅ No ESLint errors found
⚠️  3 warnings (auto-fixable with --fix)
❌ 2 errors need manual fixing
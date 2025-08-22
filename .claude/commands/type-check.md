# /type-check

TypeScript compilation validation without code generation.

## Usage
```
/type-check              # Check all TypeScript files once
/type-check --watch      # Continuous type checking
/type-check --strict     # Extra strict mode validation
```

## What it does
1. Validates TypeScript compilation without emitting files
2. Checks type safety across entire codebase
3. Verifies interface contracts and type definitions
4. Ensures import/export compatibility
5. Validates ESM module resolution

## Key Validations
- **Type Safety**: No type errors, proper interfaces
- **Import Resolution**: ESM imports with `.js` extensions work
- **API Contracts**: Stripe, Analytics, DOM types correct
- **Data Flow**: Content JSON → _data adapters → templates
- **Module System**: Proper ESM TypeScript compilation

## Examples
```bash
# Quick type check (part of quality gates)
/type-check

# Watch mode while coding
/type-check --watch

# Extra strict validation
/type-check --strict
```

## CLAUDE.md Integration
- **Critical Quality Gate**: "Zero compilation errors enforced"
- **TypeScript-First**: Core requirement for all changes
- **Plan-Apply-Verify**: Run after each code change
- **Version Awareness**: Validate after dependency updates

## Output
✅ TypeScript compilation successful (0 errors)
❌ Found 3 type errors in src/platform/ui/components/
📄 src/assets/js/types/analytics.ts(42,15): Property 'value' missing
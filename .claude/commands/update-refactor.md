---
name: "refactor:smart (pro)"
summary: "Behavior-safe clarity refactors + optional compatibility fixes after dependency updates"
risk: "medium"
allowed-tools: Read, Write, Edit, Grep, Glob, Bash(npm:*), Bash(pnpm:*), Bash(yarn:*)
max-edit-scope: 350
review-mode: "plan-then-apply"
---

# 1) Intent
Goal: Improve Café com Vendas landing page code clarity, conversion optimization, and WCAG AA compliance **without changing core functionality**. Focus on landing page best practices and Portuguese market optimization.
Non-Goals: No major design changes or conversion flow modifications. Maintain premium event branding and messaging integrity.

# 2) Inputs
Optional:
- `mode`: "clarity" (default) | "compat" | "conversion" | "a11y"
- `target`: file/dir/glob to focus (default: src/assets/js/components/*)
- `preserve`: files/globs never to change (e.g., "info/DATA_*")
- `focus`: "hero" | "testimonials" | "pricing" | "forms" | "checkout" | "all"
- `notes`: hints (e.g., "improve mobile CTA", "optimize payment flow")

# 3) Auto-Discovery (light)
Detect:
- Landing page architecture: Eleventy templates, Vite JS bundling, Tailwind CSS v4
- Component structure: hero, testimonials, pricing, FAQ, CTA sections
- Conversion elements: form handling, Stripe integration, analytics tracking
- Design system: JSON tokens, CSS custom properties, component patterns
- Accessibility patterns: ARIA roles, keyboard navigation, color contrast
- Portuguese content: DATA_event.json, copy library, i18n considerations
- Mobile optimization: responsive patterns, touch interactions, performance

# 4) Constraints & Guardrails
- **Conversion-safe refactoring**: Never break payment flow or CTA functionality
- **Pure Tailwind CSS enforcement**: No inline styles, use utility classes only
- **WCAG AA compliance**: Maintain 4.5:1 contrast ratios and keyboard accessibility
- **Portuguese content preservation**: Never modify event details or pricing
- **Mobile-first approach**: Ensure all changes work on mobile devices
- **Performance maintenance**: No changes that degrade Lighthouse scores
- **Design token compliance**: Use only approved colors from JSON tokens
- Keep diffs ≤ `max-edit-scope`. Prefer conversion-focused improvements.

# 5) Method (How to Think)
1) **Assess**
   - Clarity: find smells (deep nesting, long funcs, unclear names, duplication, dead code).
   - Compat: grep for deprecated imports/options; validate configs against updated libs.
2) **Plan**
   - Minimal, surgical edits per file with reasons; annotate `[clarity]` or `[compat]`.
   - Prioritize: import/option fixes → types/signatures → readability (early returns, extracts).
3) **Apply**
   - Small patches: rename locals, extract ≤10–15 line helpers, flatten if/else, dedupe code.
   - Compat: 1:1 import/option updates; add short comments if behavior might differ.
4) **Verify**
   - Provide commands for build/lint/typecheck/tests; ensure they’re expected to pass.

# 6) Landing Page Refactoring Scope

- **Conversion Optimization**: improve CTA clarity, form UX, trust signal placement, checkout flow
- **Accessibility Enhancement**: ARIA roles, keyboard navigation, color contrast, screen reader support
- **Mobile Experience**: touch targets, responsive behavior, performance on mobile devices
- **Component Modularity**: extract reusable hero patterns, testimonial components, form handlers
- **Performance Optimization**: lazy loading, image optimization, script efficiency, CSS cleanup
- **Design System Compliance**: enforce token usage, consistent spacing, proper typography scale
- **Portuguese UX Patterns**: cultural considerations, number formatting, payment preferences
- **Analytics Integration**: clean event tracking, conversion funnel optimization, GTM compliance

# 7) Output Contract (strict)

## PLAN
- Bulleted changes by file with rationale; tag `[clarity]` or `[compat]`.
- Estimated lines changed per file and total (≤ `max-edit-scope`).

## PATCH
- Unified diffs for changed regions only, file-by-file, compact and readable.

## COMMANDS
- Landing page validation:
  - `npm run lint` to check code quality
  - `npm run build` to verify static site generation
  - `npm run tokens:build` to ensure design token generation
  - `npm run lighthouse` to validate performance impact (if available)

## NOTES
- Behavior risk areas & quick manual checks to validate.
- Follow-ups outside scope (e.g., deeper decomposition, design system unification).
- **Rollback**: list files touched; `git restore -SW <files>` to revert; re-run install/build if configs changed.

# 8) Decision Rules
- **Naming**: improve locals; keep export names stable; prefer intent-revealing names.
- **Control Flow**: prefer early returns; avoid reordering with side effects.
- **Helpers**: extract small pure helpers colocated with usage; avoid cross-module churn.
- **Imports**:
  - Compat: update default/named shapes; drop unused; align to ESM if project already ESM.
  - Clarity: sort/dedupe; prefer aliased/absolute paths if tsconfig paths exist.
- **Types**: replace obvious `any` with minimal precise types; don’t change public types.
- **Tailwind/HTML**: keep semantic landmarks; enforce consistent spacing and line length (60–75ch).
- **Configs**: only when required by updated libs; keep the smallest workable change.

# 9) Examples (Invocation)
- `refactor:smart (pro)` - general landing page improvements
- `refactor:smart (pro) focus="hero" mode="conversion"` - optimize hero section for conversion
- `refactor:smart (pro) mode="a11y" target="src/assets/js/components/*"` - accessibility improvements
- `refactor:smart (pro) focus="checkout" notes="improve Stripe payment flow"`

# 10) Review Checklist
- [ ] Build/lint/typecheck/tests expected to pass
- [ ] Public APIs unchanged; compat only adjusts imports/options
- [ ] Functions shorter/shallower; names clearer; dead code removed
- [ ] A11y intact; spacing & hierarchy consistent
- [ ] Diffs are surgical, commented where intent might be unclear
- [ ] Total changes ≤ scope cap; risks called out in NOTES
- [ ] is in compliance with the /CLAUDE.md file
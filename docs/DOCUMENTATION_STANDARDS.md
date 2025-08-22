# Documentation Standards — Café com Vendas

> **Canonical naming conventions** for all documentation files in the `docs/` directory. Ensures consistency, discoverability, and developer experience.

---

## Naming Convention Rules

### Primary Pattern

**SCREAMING_SNAKE_CASE** for setup/reference docs, **kebab-case** for conceptual docs

### File Categories & Examples

#### 1. Setup & Configuration: `{SYSTEM}_{PURPOSE}.md`
```
CLOUDINARY_SETUP.md
GTM_SETUP_GUIDE.md
STRIPE_SETUP.md
ANALYTICS_CONFIGURATION.md
```

#### 2. Reference & Guidelines: `{DOMAIN}_GUIDELINES.md` or `{DOMAIN}_REFERENCE.md`
```
ACCESSIBILITY_GUIDELINES.md
SECURITY_BEST_PRACTICES.md
GTM_CONFIGURATION_REFERENCE.md
API_REFERENCE.md
```

#### 3. Testing & Debugging: `{SYSTEM}_TEST_{TYPE}.md`
```
STRIPE_TEST_CARDS.md
PAYMENT_TESTING_SUMMARY.md
E2E_TEST_GUIDE.md
PERFORMANCE_MONITORING.md
```

#### 4. Meta & Process: `{SCOPE}_AWARENESS.md` or `{SCOPE}_STANDARDS.md`
```
VERSION_AWARENESS.md
DOCUMENTATION_STANDARDS.md
DEVELOPMENT_GUIDELINES.md
```

#### 5. Architectural & Conceptual: `{concept}-{detail}.md`
```
architecture-overview.md
coding-standards.md
data-flow.md
deployment-workflow.md
```

#### 6. Tools & Utilities: `{tool}-{purpose}.md`
```
edit-map.md
debug-guide.md
build-optimization.md
```

---

## Benefits

* **Visual Grouping**: UPPERCASE files are immediately recognizable as actionable guides
* **Alphabetical Sorting**: Related files naturally cluster together in file explorers
* **Consistency**: Aligns with project's TypeScript naming (UPPER_SNAKE_CASE constants, kebab-case files)
* **Developer Experience**: Document type is identifiable at a glance

---

## Examples in Context

**When creating new docs:**

```bash
# Setup guide for new service
docs/MAILERLITE_SETUP.md

# Reference for existing system  
docs/STRIPE_WEBHOOKS_REFERENCE.md

# Testing documentation
docs/LIGHTHOUSE_TEST_GUIDE.md

# Architectural deep-dive
docs/state-management.md

# Process documentation
docs/deployment-checklist.md
```

---

## Enforcement

* **Required**: All new documentation must follow this convention
* **Code Review**: Naming convention adherence is part of PR checklist
* **IDE Integration**: Consider adding file templates that include proper naming

---

*This standard is referenced in `CLAUDE.md` and enforced during development.*
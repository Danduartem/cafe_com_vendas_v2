# Coding Standards

> **TypeScript-First Development Standards for Café com Vendas**
> 
> This document establishes mandatory coding standards for maintaining code quality, consistency, and type safety across the project.

## 🚨 Zero Tolerance Policies

### TypeScript-Only Development
**ABSOLUTE REQUIREMENT - NO EXCEPTIONS**

- ❌ **NEVER** create or modify `.js` files - TypeScript only (`.ts`)
- ❌ **NEVER** use `any` type without explicit justification
- ❌ **NEVER** bypass TypeScript compilation
- ✅ **ALWAYS** use proper TypeScript interfaces and types
- ✅ **ALWAYS** run `npm run type-check` before committing
- ✅ **ALWAYS** import with `.js` extension (TypeScript/ESM convention)

### Pure Tailwind CSS Enforcement
**ABSOLUTE REQUIREMENT - NO EXCEPTIONS**

- ❌ **NEVER** use `element.style.*` in JavaScript
- ❌ **NEVER** write custom CSS in `<style>` blocks
- ❌ **NEVER** use `style=""` inline attributes
- ❌ **NEVER** create custom CSS properties outside design tokens
- ✅ **ALWAYS** use `element.classList.add/remove()` for state changes
- ✅ **ALWAYS** use Tailwind utilities: `max-h-*`, `rotate-*`, `transition-*`, `duration-*`
- ✅ **ALWAYS** scan all JavaScript for `style.` before submitting

## 📝 File Naming Conventions

### TypeScript Files
```
✅ my-component.ts          (kebab-case for components)
✅ analytics.ts             (lowercase for utilities)
✅ global.ts               (lowercase for types)
✅ ComponentInterface.ts    (PascalCase for interface files)
```

### Template Files
```
✅ index.njk               (Nunjucks templates)
✅ layout.njk              (layout templates)
✅ component-name.njk      (kebab-case for components)
```

### Directory Structure
```
✅ components/             (plural, lowercase)
✅ utils/                  (plural, lowercase)
✅ types/                  (plural, lowercase)
✅ section-name/           (kebab-case for sections)
```

## 🏗️ Architecture Patterns

### Component Structure (Co-located Sections)
```typescript
// src/_includes/sections/my-section/index.ts
import type { Component } from '../../assets/js/types/component.js';

export const MySection: Component = {
    init(): void {
        this.bindEvents();
        // Make methods available globally for onclick handlers
        (window as any).toggleMySection = this.toggle.bind(this);
    },
    
    bindEvents(): void {
        // Event binding logic
    },
    
    toggle(elementId: string): void {
        // Pure Tailwind class manipulation only
        const element = document.getElementById(elementId);
        if (!element) return;
        
        element.classList.toggle('hidden');
        element.classList.toggle('max-h-0');
        element.classList.toggle('max-h-96');
    }
};
```

### Legacy Component Structure
```typescript
// src/assets/js/components/my-component.ts
import { safeQuery } from '../utils/index.js';
import type { Component } from '../types/component.js';

export const MyComponent: Component = {
    init(): void {
        this.bindEvents();
    },
    
    bindEvents(): void {
        const container = safeQuery('#my-component');
        if (!container) return;
        
        container.addEventListener('click', this.handleClick.bind(this));
    },
    
    handleClick(event: Event): void {
        const target = event.target as HTMLElement;
        // Type-safe event handling
    }
};
```

## 🎯 TypeScript Standards

### Type Definitions
```typescript
// Always define interfaces for component props
interface ComponentConfig {
    readonly containerId: string;
    readonly autoInit?: boolean;
    readonly debug?: boolean;
}

// Use readonly for immutable data
interface DesignTokens {
    readonly colors: {
        readonly primary: string;
        readonly secondary: string;
    };
}

// Prefer union types over enums for simple constants
type EventType = 'click' | 'scroll' | 'resize';
```

### Import/Export Patterns
```typescript
// Use named exports for utilities
export const safeQuery = (selector: string): HTMLElement | null => {
    return document.querySelector(selector);
};

// Use default exports for main components
export default class PaymentProcessor {
    // Implementation
}

// Always use .js extension for imports
import { safeQuery } from '../utils/index.js';
import type { Component } from '../types/component.js';
```

### Error Handling
```typescript
// Always handle potential null/undefined
const element = safeQuery('#my-element');
if (!element) {
    console.warn('Element not found:', '#my-element');
    return;
}

// Use type guards for runtime checks
function isHTMLElement(node: Node): node is HTMLElement {
    return node.nodeType === Node.ELEMENT_NODE;
}

// Prefer early returns over nested conditions
function processElement(id: string): void {
    const element = document.getElementById(id);
    if (!element) return;
    
    if (!element.classList.contains('active')) return;
    
    // Process element
}
```

## 🎨 CSS/Styling Standards

### Tailwind Class Usage
```html
<!-- ✅ Correct: Pure Tailwind utilities -->
<div class="transition-all duration-300 hover:scale-105 bg-navy-600">

<!-- ❌ Wrong: Custom styles -->
<div style="background: #1a365d; transform: scale(1.05);">

<!-- ✅ Correct: Design token classes -->
<div class="bg-navy-600 text-burgundy-500">

<!-- ❌ Wrong: Hardcoded colors -->
<div class="bg-blue-800 text-red-600">
```

### Animation Standards
```typescript
// ✅ Correct: Tailwind class manipulation
element.classList.add('animate-pulse');
element.classList.remove('animate-pulse');

// ✅ Correct: Custom transitions with Tailwind
element.classList.toggle('translate-x-full');
element.classList.toggle('opacity-0');

// ❌ Wrong: Direct style manipulation
element.style.animation = 'pulse 2s infinite';
element.style.transform = 'translateX(100%)';
```

### State Management
```typescript
// ✅ Correct: Class-based state
const toggleVisibility = (element: HTMLElement): void => {
    element.classList.toggle('hidden');
    element.classList.toggle('opacity-0');
    element.setAttribute('aria-hidden', 
        element.classList.contains('hidden').toString()
    );
};

// ❌ Wrong: Style-based state
const toggleVisibility = (element: HTMLElement): void => {
    element.style.display = element.style.display === 'none' ? 'block' : 'none';
};
```

## 📊 Data Flow Standards

### Content Management
```typescript
// ✅ Correct: Load from structured data
import type { EventData } from '../types/global.js';

// Data flows from content/pt-PT/*.json → src/_data/*.ts → templates
const event: EventData = {
    title: eventData.title,
    price: eventData.pricing.early_bird,
    date: new Date(eventData.date)
};

// ❌ Wrong: Hardcoded values
const price = "297€";
const date = "20 de Setembro";
```

### Design Token Usage
```typescript
// ✅ Correct: Use generated token classes
const applyTheme = (element: HTMLElement): void => {
    element.classList.add('bg-navy-600', 'text-gold-400');
};

// ❌ Wrong: Hardcoded colors
const applyTheme = (element: HTMLElement): void => {
    element.style.backgroundColor = '#1a365d';
    element.style.color = '#fbbf24';
};
```

## 🔧 Development Workflow

### Pre-commit Checklist
- [ ] `npm run type-check` passes
- [ ] `npm run lint` passes
- [ ] No `style.` usage in TypeScript files
- [ ] No hardcoded colors/values
- [ ] All imports use `.js` extension
- [ ] Design tokens used for styling

### Code Review Standards
1. **Type Safety**: All functions have proper type signatures
2. **Pure Tailwind**: No custom CSS or inline styles
3. **Error Handling**: Null checks and type guards present
4. **Performance**: No unnecessary DOM queries or calculations
5. **Accessibility**: ARIA attributes and semantic HTML

### Testing Requirements
```typescript
// Type-safe test utilities
import type { ComponentConfig } from '../src/assets/js/types/config.js';

const createMockConfig = (): ComponentConfig => ({
    containerId: 'test-container',
    autoInit: false,
    debug: true
});
```

## 🚫 Anti-patterns to Avoid

### JavaScript/TypeScript
```typescript
// ❌ Wrong: Any type usage
const data: any = fetchData();

// ✅ Correct: Proper typing
interface ApiResponse {
    readonly status: number;
    readonly data: unknown;
}
const response: ApiResponse = await fetchData();

// ❌ Wrong: Direct DOM style manipulation
element.style.display = 'none';

// ✅ Correct: Class-based visibility
element.classList.add('hidden');

// ❌ Wrong: Inline event handlers with complex logic
<button onclick="if(condition) { /* complex logic */ }">

// ✅ Correct: Dedicated event handlers
<button onclick="handleButtonClick('target-id')">
```

### HTML/Templates
```html
<!-- ❌ Wrong: Inline styles -->
<div style="background: linear-gradient(45deg, #ff0000, #00ff00);">

<!-- ✅ Correct: Utility classes -->
<div class="bg-gradient-to-br from-burgundy-500 to-navy-600">

<!-- ❌ Wrong: Missing semantic structure -->
<div class="big-text">Título</div>

<!-- ✅ Correct: Semantic HTML -->
<h2 class="text-4xl font-lora font-semibold">Título</h2>
```

## 📋 Quality Gates

### Build Pipeline Requirements
1. **TypeScript Compilation**: Zero errors, warnings allowed
2. **Linting**: ESLint passes with project configuration
3. **Type Checking**: `npm run type-check` must pass
4. **Build Success**: `npm run build` completes successfully

### Performance Standards
- **Bundle Size**: JavaScript < 100KB gzipped
- **CSS Size**: Tailwind output < 50KB after purging
- **Type Safety**: 100% TypeScript coverage
- **Lighthouse**: Performance > 90, Accessibility > 95

### Code Metrics
- **Cyclomatic Complexity**: < 10 per function
- **File Size**: < 300 lines per TypeScript file
- **Function Length**: < 50 lines per function
- **Parameter Count**: < 5 parameters per function

## 🔄 Refactoring Guidelines

### When to Refactor
- Adding third parameter to function (create interface)
- File exceeds 300 lines (split into modules)
- Duplicate logic appears 3+ times (extract utility)
- Complex conditional logic (use type guards/enum)

### Refactoring Patterns
```typescript
// Before: Multiple parameters
function createButton(text: string, color: string, size: string, disabled: boolean) {
    // Implementation
}

// After: Interface-based configuration
interface ButtonConfig {
    readonly text: string;
    readonly color: 'navy' | 'burgundy' | 'gold';
    readonly size: 'sm' | 'md' | 'lg';
    readonly disabled?: boolean;
}

function createButton(config: ButtonConfig): HTMLButtonElement {
    // Implementation
}
```

## 📚 Resources

### Internal Documentation
- [`CLAUDE.md`](../CLAUDE.md) - Project guidelines and context
- [`docs/architecture-overview.md`](./architecture-overview.md) - System architecture
- [`docs/VERSION_AWARENESS.md`](./VERSION_AWARENESS.md) - Version management

### External Standards
- [TypeScript Handbook](https://www.typescriptlang.org/docs/)
- [Tailwind CSS Documentation](https://tailwindcss.com/docs)
- [Conventional Commits](https://www.conventionalcommits.org/)
- [WCAG 2.1 AA Guidelines](https://www.w3.org/WAI/WCAG21/quickref/)

---

**Last Updated**: August 2025  
**Version**: 2.0 (TypeScript-First Architecture)  
**Maintainer**: Development Team
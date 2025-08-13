# Component Development Template

## Modular ES6 + Pure Tailwind Implementation Guide

This template covers the complete component creation process using our modular JavaScript architecture with Vite bundling and pure Tailwind CSS styling.

## Pure Tailwind Implementation Checklist

### 1. Pre-Implementation Planning
Before writing any code, answer these questions:

**Animation/Interaction Planning:**
- [ ] What states does this component have? (open/closed, active/inactive, etc.)
- [ ] Can I represent each state with different Tailwind class combinations?
- [ ] What Tailwind transition utilities will I use? (`transition-*`, `duration-*`, `ease-*`)
- [ ] What Tailwind transform utilities will I need? (`rotate-*`, `scale-*`, `translate-*`)

**State Management Planning:**
- [ ] Will I toggle classes with `element.classList.add/remove/toggle()`?
- [ ] Are there height animations? Use `max-h-0` to `max-h-*` with `overflow-hidden`
- [ ] Are there rotation animations? Use `rotate-0` to `rotate-*`
- [ ] Are there opacity changes? Use `opacity-0` to `opacity-100`

### 2. HTML Template Structure
```njk
<!-- Component Section -->
<section id="component-name" aria-label="Description" class="py-16 lg:py-20">
  <div class="container mx-auto px-4 max-w-4xl">
    
    <!-- Interactive elements with ALL possible states as classes -->
    <button 
      type="button"
      class="transition-all duration-300 ease-in-out transform hover:scale-105"
      onclick="toggleComponent('element-id')"
      aria-expanded="false"
      data-analytics-event="component_interaction"
    >
      <svg class="w-5 h-5 transform transition-transform duration-200">
        <!-- SVG content -->
      </svg>
    </button>
    
    <!-- Animated content with initial state classes -->
    <div 
      id="element-id" 
      class="hidden overflow-hidden transition-all duration-300 ease-in-out max-h-0"
      role="region"
    >
      <!-- Content -->
    </div>
    
  </div>
</section>
```

### 3. JavaScript Module Template

Create your component as an ES6 module in `src/assets/js/components/`:

```javascript
// src/assets/js/components/my-component.js

import { CONFIG } from '../config/constants.js';
import { Analytics } from '../core/analytics.js';
import { safeQuery, safeQueryAll, Animations } from '../utils/index.js';

export const MyComponent = {
    init() {
        try {
            this.initializeComponent();
            this.bindEvents();
            this.initAnimations();
        } catch (error) {
            console.error('Error initializing MyComponent:', error);
        }
    },
    
    initializeComponent() {
        // Make toggle function available globally for onclick handlers
        window.toggleMyComponent = this.toggleComponent.bind(this);
        
        // Component setup logic here
        const componentElement = safeQuery('#my-component');
        if (!componentElement) {
            console.warn('MyComponent element not found');
            return;
        }
    },
    
    bindEvents() {
        // Event delegation and binding
        const container = safeQuery('#my-component');
        if (!container) return;
        
        container.addEventListener('click', this.handleClick.bind(this), { passive: false });
        container.addEventListener('keydown', this.handleKeydown.bind(this), { passive: false });
    },
    
    handleClick(event) {
        const toggleButton = event.target.closest('[data-toggle]');
        if (!toggleButton) return;
        
        event.preventDefault();
        const elementId = toggleButton.getAttribute('data-toggle');
        if (elementId) this.toggleComponent(elementId);
    },
    
    handleKeydown(event) {
        if (event.key === 'Enter' || event.key === ' ') {
            event.preventDefault();
            this.handleClick(event);
        }
    },
    
    toggleComponent(elementId) {
        const element = safeQuery(`#${elementId}`);
        const button = safeQuery(`[data-toggle="${elementId}"]`);
        
        if (!element || !button) {
            console.error(`Component elements not found for: ${elementId}`);
            return;
        }
        
        const isHidden = element.classList.contains('hidden');
        
        if (isHidden) {
            // Show state - ADD classes for visible state
            element.classList.remove('hidden', 'max-h-0', 'opacity-0');
            element.classList.add('max-h-96', 'opacity-100');
            button.setAttribute('aria-expanded', 'true');
        } else {
            // Hide state - ADD classes for hidden state
            element.classList.remove('max-h-96', 'opacity-100');
            element.classList.add('max-h-0', 'opacity-0');
            button.setAttribute('aria-expanded', 'false');
            
            // After transition, fully hide
            setTimeout(() => {
                element.classList.add('hidden');
            }, CONFIG.animations.duration.normal);
        }
        
        // Analytics tracking
        Analytics.track('component_toggle', {
            event_category: 'Component',
            event_label: elementId,
            action: isHidden ? 'open' : 'close'
        });
    },
    
    initAnimations() {
        const animatableElements = safeQueryAll('#my-component [data-reveal]');
        if (!animatableElements.length) return;
        
        Animations.prepareRevealElements(animatableElements);
        
        const observer = Animations.createObserver({
            callback: () => {
                Animations.revealElements(animatableElements, {
                    initialDelay: 200
                });
            },
            once: true,
            threshold: 0.1
        });
        
        const componentSection = safeQuery('#my-component');
        if (componentSection) {
            observer.observe(componentSection);
        }
    }
};
```

### 4. Component Registration

Add your component to `src/assets/js/app.js`:

```javascript
// src/assets/js/app.js

import { MyComponent } from './components/my-component.js';

export const CafeComVendas = {
    initializeComponents() {
        const components = [
            { name: 'Hero', component: Hero },
            { name: 'Banner', component: Banner },
            { name: 'MyComponent', component: MyComponent }, // Add your component here
            // ... other components
        ];
        
        components.forEach(({ name, component }) => {
            try {
                if (component && typeof component.init === 'function') {
                    component.init();
                    console.log(`✓ ${name} component initialized`);
                }
            } catch (error) {
                console.error(`✗ Failed to initialize ${name} component:`, error);
            }
        });
    }
};
```

### 5. Development & Build Process

With Vite, your component is automatically included in the build:

```bash
# Development (with hot reload)
npm run dev

# Production build (minified + optimized)
npm run build
```

Vite handles:
- ✅ ES6 module bundling
- ✅ Tree shaking (unused code removal)  
- ✅ Minification in production
- ✅ Source maps in development
- ✅ Hot module replacement

### 6. MANDATORY Final Check
**BEFORE submitting any component, scan for these VIOLATIONS:**

❌ **Forbidden Patterns:**
```javascript
// NEVER DO THIS:
element.style.height = '200px';
element.style.transform = 'rotate(45deg)';
element.style.maxHeight = element.scrollHeight + 'px';
element.style.opacity = '0';
```

```html
<!-- NEVER DO THIS: -->
<div style="color: red;">
<style>
  .custom-class { color: red; }
</style>
```

✅ **Correct Patterns:**
```javascript
// ALWAYS DO THIS:
element.classList.add('h-48');
element.classList.add('rotate-45');
element.classList.remove('max-h-0');
element.classList.add('max-h-96');
element.classList.toggle('opacity-100');
```

### 7. Common Tailwind Animation Patterns
```html
<!-- Height animations -->
class="overflow-hidden transition-all duration-300 max-h-0" <!-- closed -->
class="overflow-hidden transition-all duration-300 max-h-96" <!-- open -->

<!-- Rotation animations -->
class="transform transition-transform duration-200 rotate-0" <!-- initial -->
class="transform transition-transform duration-200 rotate-45" <!-- rotated -->

<!-- Opacity animations -->
class="transition-opacity duration-300 opacity-0" <!-- hidden -->
class="transition-opacity duration-300 opacity-100" <!-- visible -->

<!-- Scale animations -->
class="transform transition-transform duration-200 scale-100" <!-- normal -->
class="transform transition-transform duration-200 scale-105" <!-- hover -->
```

### 8. Test Checklist
- [ ] Component works without any console errors
- [ ] All animations are smooth using Tailwind transitions
- [ ] No inline styles are applied during runtime
- [ ] Analytics events fire correctly
- [ ] Accessibility attributes update properly
- [ ] Component passes the violation scan
- [ ] ES6 imports/exports work correctly
- [ ] Component initializes properly in the build pipeline
- [ ] Hot reload works during development
- [ ] Component is tree-shaken in production build

### 9. Vite Integration Benefits

Our unified Vite build system provides several advantages:

**🚀 Development Experience:**
- **Hot Module Replacement**: JS and CSS changes update instantly without page reload
- **Fast Startup**: Instant server start compared to traditional bundlers
- **Source Maps**: Easy debugging with proper file/line mapping
- **Error Overlay**: Clear error messages in the browser during development

**🏗️ Build Optimization:**
- **Tree Shaking**: Unused component code is automatically removed
- **Code Splitting**: Components can be loaded on-demand if needed
- **Minification**: JavaScript is compressed for production
- **Bundle Analysis**: Clear visibility into what's included in the final build

**📦 Asset Management:**
- **CSS Integration**: Import Tailwind CSS directly in JavaScript if needed
- **Asset Processing**: Images, fonts, and other assets are optimized
- **Cache Busting**: Automatic file hashing for proper caching
- **Single Build Command**: One command builds everything (CSS + JS)

**Example CSS Import** (if needed):
```javascript
// In your component, you can import CSS directly
import '../css/component-specific.css';
```

### 10. Architecture Best Practices

**✅ Do's:**
- Keep components focused on single responsibility
- Use shared utilities from `utils/` folder
- Leverage the centralized `CONFIG` and `Analytics`
- Follow the consistent component structure pattern
- Use descriptive component and method names
- Import only what you need for better tree-shaking

**❌ Don'ts:**
- Don't create large monolithic components
- Don't bypass the centralized analytics system
- Don't hardcode configuration values
- Don't create global functions outside the component pattern
- Don't import entire utility libraries when you only need specific functions

---

**Remember: If you find yourself writing `element.style.` or thinking "I need custom CSS", STOP and find the Tailwind utility class solution instead.**

**New Rule: Always create components as ES6 modules following the established pattern. Vite will handle the bundling, optimization, and browser compatibility automatically.**
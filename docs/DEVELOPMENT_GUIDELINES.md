# 🛠️ Development Guidelines - Café com Vendas

Comprehensive development patterns and code examples following security best practices and performance optimization.

## 🎯 Development Philosophy

### **Core Principles**
1. **Security First**: No inline scripts, strict CSP compliance
2. **Performance Optimized**: Lazy loading, minimal bundles
3. **Accessibility Complete**: ARIA compliance, 95/100+ score
4. **Pure Tailwind**: Zero custom CSS, utility-first approach
5. **Modular Architecture**: ES6 components, clean separation

## 🏗️ Component Creation Pattern

### **1. HTML Template** (`src/_includes/components/my-component.njk`)
```html
<section id="my-component" aria-label="Component Description" class="relative py-16" data-reveal>
  
  <!-- ✅ CORRECT: No inline handlers -->
  <button id="action-button" 
          class="px-6 py-3 bg-burgundy-700 text-white rounded-xl hover:bg-burgundy-800 transition-colors duration-300"
          aria-label="Perform action"
          data-analytics-event="button_click">
    Click Me
  </button>
  
  <!-- ✅ CORRECT: Proper ARIA for interactive elements -->
  <div class="carousel-pagination flex space-x-2" 
       role="tablist" 
       aria-label="Navigation indicators"
       data-carousel-pagination>
    <!-- Tabs created dynamically with proper ARIA -->
  </div>
  
  <!-- ✅ CORRECT: Semantic HTML with accessibility -->
  <div id="expandable-content" 
       class="hidden overflow-hidden transition-all duration-300 max-h-0"
       role="region"
       aria-labelledby="action-button"
       aria-expanded="false">
    <p>Content that expands...</p>
  </div>
  
</section>
```

### **2. JavaScript Component** (`src/assets/js/components/my-component.js`)
```javascript
/**
 * My Component for Café com Vendas
 * Secure, accessible, and performant implementation
 */

import { CONFIG } from '../config/constants.js';
import { Analytics } from '../core/analytics.js';
import { safeQuery, safeQueryAll, Animations } from '../utils/index.js';

export const MyComponent = {
  // Component state
  isExpanded: false,
  thirdPartyLoaded: false,
  loadPromise: null,

  init() {
    try {
      this.bindEvents();
      this.initAnimations();
      this.setupAccessibility();
    } catch (error) {
      console.error('Error initializing MyComponent:', error);
    }
  },

  bindEvents() {
    // ✅ SECURE: Event delegation for dynamic elements
    const button = safeQuery('#action-button');
    if (button) {
      button.addEventListener('click', this.handleClick.bind(this));
      button.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    // ✅ SECURE: Form handling
    const form = safeQuery('#my-form');
    form?.addEventListener('submit', this.handleSubmit.bind(this));
  },

  setupAccessibility() {
    // ✅ ARIA: Create proper tab navigation
    const paginationContainer = safeQuery('[data-carousel-pagination]');
    if (paginationContainer) {
      this.createPaginationTabs(paginationContainer);
    }
  },

  createPaginationTabs(container) {
    const totalTabs = 5; // Example
    container.innerHTML = '';

    for (let i = 0; i < totalTabs; i++) {
      const tab = document.createElement('button');
      
      // ✅ ARIA: Required attributes for tablist children
      tab.setAttribute('role', 'tab');
      tab.setAttribute('aria-selected', 'false');
      tab.setAttribute('aria-controls', `panel-${i}`);
      tab.setAttribute('aria-label', `Go to slide ${i + 1}`);
      tab.setAttribute('tabindex', '-1');
      
      // ✅ TAILWIND: Pure utility classes
      tab.className = 'w-3 h-3 rounded-full bg-navy-800/20 transition-all duration-300 hover:bg-navy-800/40';
      
      // ✅ SECURE: Event listener (not inline)
      tab.addEventListener('click', () => this.goToSlide(i));
      
      container.appendChild(tab);
    }

    // Set first tab as active
    this.updateTabStates(0);
  },

  updateTabStates(activeIndex) {
    const tabs = safeQueryAll('[role="tab"]');
    tabs.forEach((tab, index) => {
      const isActive = index === activeIndex;
      
      // ✅ ARIA: Update states
      tab.setAttribute('aria-selected', isActive.toString());
      tab.setAttribute('tabindex', isActive ? '0' : '-1');
      
      // ✅ TAILWIND: Visual state with classes
      if (isActive) {
        tab.classList.remove('bg-navy-800/20');
        tab.classList.add('bg-navy-800', 'w-8');
      } else {
        tab.classList.remove('bg-navy-800', 'w-8');
        tab.classList.add('bg-navy-800/20');
      }
    });
  },

  async handleClick(event) {
    event.preventDefault();
    
    // ✅ PERFORMANCE: Lazy load expensive scripts
    if (!this.thirdPartyLoaded) {
      await this.loadThirdPartyScript();
    }
    
    this.toggleExpanded();
    
    // ✅ ANALYTICS: Track user interaction
    Analytics.track('component_action', {
      event_category: 'UI',
      event_label: 'Button Click',
      value: this.isExpanded ? 1 : 0
    });
  },

  handleKeydown(event) {
    // ✅ ACCESSIBILITY: Keyboard support
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      this.handleClick(event);
    }
  },

  async handleSubmit(event) {
    event.preventDefault();
    
    const formData = new FormData(event.target);
    
    try {
      // ✅ SECURITY: Validate and sanitize
      const validatedData = this.validateFormData(formData);
      await this.submitForm(validatedData);
    } catch (error) {
      console.error('Form submission error:', error);
      this.showError(error.message);
    }
  },

  validateFormData(formData) {
    const data = {
      email: formData.get('email')?.trim(),
      name: formData.get('name')?.trim()
    };

    // ✅ SECURITY: Input validation
    if (!data.email || !this.isValidEmail(data.email)) {
      throw new Error('Please enter a valid email address');
    }

    if (!data.name || data.name.length < 2) {
      throw new Error('Please enter your full name');
    }

    // ✅ SECURITY: Sanitize inputs
    return {
      email: this.sanitizeInput(data.email),
      name: this.sanitizeInput(data.name)
    };
  },

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length < 255;
  },

  sanitizeInput(input) {
    return input
      .replace(/[<>]/g, '') // Remove HTML
      .substring(0, 1000); // Limit length
  },

  async loadThirdPartyScript() {
    if (this.loadPromise) return this.loadPromise;

    this.loadPromise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = 'https://example.com/api.js';
      script.async = true;
      
      script.onload = () => {
        this.thirdPartyLoaded = true;
        resolve();
      };
      
      script.onerror = () => {
        reject(new Error('Failed to load third-party script'));
      };
      
      document.head.appendChild(script);
    });

    return this.loadPromise;
  },

  toggleExpanded() {
    const content = safeQuery('#expandable-content');
    const button = safeQuery('#action-button');
    
    if (!content || !button) return;

    this.isExpanded = !this.isExpanded;

    // ✅ TAILWIND: Pure class manipulation (no inline styles)
    if (this.isExpanded) {
      content.classList.remove('hidden', 'max-h-0');
      content.classList.add('max-h-96', 'opacity-100');
      button.setAttribute('aria-expanded', 'true');
    } else {
      content.classList.remove('max-h-96', 'opacity-100');
      content.classList.add('max-h-0', 'opacity-0');
      button.setAttribute('aria-expanded', 'false');
      
      // Hide after transition
      setTimeout(() => {
        content.classList.add('hidden');
      }, CONFIG.animations.duration.normal);
    }
  },

  initAnimations() {
    // ✅ PERFORMANCE: Intersection Observer for reveal animations
    const elements = safeQueryAll('#my-component [data-reveal]');
    if (!elements.length) return;

    Animations.prepareRevealElements(elements);

    const observer = Animations.createObserver({
      callback: (entry) => {
        entry.target.classList.remove('opacity-0', 'translate-y-4');
        entry.target.classList.add('opacity-100', 'translate-y-0');
      },
      threshold: 0.1,
      rootMargin: '0px 0px -50px 0px'
    });

    elements.forEach(element => observer.observe(element));
  },

  showError(message) {
    // ✅ ACCESSIBILITY: Proper error announcement
    const errorDiv = document.createElement('div');
    errorDiv.setAttribute('role', 'alert');
    errorDiv.setAttribute('aria-live', 'polite');
    errorDiv.className = 'fixed top-4 right-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded-xl z-50';
    errorDiv.textContent = message;

    document.body.appendChild(errorDiv);

    // Auto-remove after 5 seconds
    setTimeout(() => {
      errorDiv.remove();
    }, 5000);
  }
};
```

### **3. Component Registration** (`src/assets/js/app.js`)
```javascript
import { MyComponent } from './components/my-component.js';

export const CafeComVendas = {
  init() {
    this.initializeComponents();
  },

  initializeComponents() {
    const components = [
      MyComponent,
      // ... other components
    ];

    components.forEach(component => {
      try {
        component.init();
      } catch (error) {
        console.error(`Failed to initialize component:`, error);
      }
    });
  }
};
```

## 🔒 Security Code Patterns

### **❌ NEVER DO THIS**
```html
<!-- SECURITY VIOLATION: Inline handlers -->
<button onclick="doSomething()">Click</button>
<form onsubmit="return handleSubmit()">

<!-- SECURITY VIOLATION: Inline scripts -->
<script>
  window.config = { api: 'value' };
</script>

<!-- PERFORMANCE VIOLATION: Global third-party loading -->
<script src="https://js.stripe.com/v3/"></script>
```

```javascript
// PERFORMANCE VIOLATION: Direct style manipulation
element.style.display = 'block';
element.style.height = '200px';

// ACCESSIBILITY VIOLATION: Missing ARIA
button.setAttribute('role', 'tab'); // Missing aria-selected, aria-controls
```

### **✅ ALWAYS DO THIS**
```javascript
// ✅ SECURE: External event handling
export const Component = {
  init() {
    const button = safeQuery('#my-button');
    button?.addEventListener('click', this.handleClick.bind(this));
  },
  
  handleClick(event) {
    // Secure handling
  }
};

// ✅ PERFORMANCE: Lazy script loading
async loadWhenNeeded() {
  if (!this.scriptLoaded) {
    await this.loadScript('https://example.com/api.js');
  }
}

// ✅ TAILWIND: Pure class manipulation
element.classList.add('block', 'h-48');
element.classList.remove('hidden');

// ✅ ACCESSIBILITY: Complete ARIA implementation
tab.setAttribute('role', 'tab');
tab.setAttribute('aria-selected', 'false');
tab.setAttribute('aria-controls', 'panel-1');
tab.setAttribute('tabindex', '-1');
```

## 🎨 Styling Guidelines

### **Pure Tailwind Approach**
```javascript
// ✅ CORRECT: Tailwind utilities for state changes
const showModal = () => {
  modal.classList.remove('hidden', 'opacity-0', 'scale-95');
  modal.classList.add('opacity-100', 'scale-100');
};

const hideModal = () => {
  modal.classList.remove('opacity-100', 'scale-100');
  modal.classList.add('opacity-0', 'scale-95');
  
  setTimeout(() => {
    modal.classList.add('hidden');
  }, 300); // Match Tailwind transition duration
};

// ✅ CORRECT: Responsive classes
element.classList.add('w-full', 'md:w-1/2', 'lg:w-1/3');

// ✅ CORRECT: Animation utilities
element.classList.add('transition-all', 'duration-300', 'ease-out');
element.classList.add('hover:scale-105', 'hover:shadow-lg');
```

## 📊 Performance Patterns

### **Lazy Loading Implementation**
```javascript
export const LazyLoader = {
  scriptCache: new Map(),
  
  async loadScript(url) {
    if (this.scriptCache.has(url)) {
      return this.scriptCache.get(url);
    }
    
    const promise = new Promise((resolve, reject) => {
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.onload = resolve;
      script.onerror = reject;
      document.head.appendChild(script);
    });
    
    this.scriptCache.set(url, promise);
    return promise;
  }
};

// Usage example
export const CheckoutComponent = {
  async openModal() {
    // Load Stripe only when user shows purchase intent
    if (!this.stripeLoaded) {
      await LazyLoader.loadScript('https://js.stripe.com/v3/');
      this.stripe = Stripe(ENV.stripe.publishableKey);
      this.stripeLoaded = true;
    }
    // Continue with modal...
  }
};
```

## ♿ Accessibility Patterns

### **Interactive Element Creation**
```javascript
const createAccessibleButton = (label, action) => {
  const button = document.createElement('button');
  
  // Required accessibility attributes
  button.setAttribute('aria-label', label);
  button.setAttribute('type', 'button');
  
  // Keyboard support
  button.addEventListener('click', action);
  button.addEventListener('keydown', (event) => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      action(event);
    }
  });
  
  return button;
};

const createTabNavigation = (tabs) => {
  tabs.forEach((tab, index) => {
    // Arrow key navigation
    tab.addEventListener('keydown', (event) => {
      let targetIndex;
      
      switch (event.key) {
        case 'ArrowLeft':
          targetIndex = index > 0 ? index - 1 : tabs.length - 1;
          break;
        case 'ArrowRight':
          targetIndex = index < tabs.length - 1 ? index + 1 : 0;
          break;
        case 'Home':
          targetIndex = 0;
          break;
        case 'End':
          targetIndex = tabs.length - 1;
          break;
        default:
          return;
      }
      
      event.preventDefault();
      tabs[targetIndex].focus();
      tabs[targetIndex].click();
    });
  });
};
```

## 🧪 Testing Patterns

### **Component Testing Checklist**
```javascript
// Development testing helper
const testComponent = (componentName) => {
  console.group(`🧪 Testing ${componentName}`);
  
  // Security tests
  console.log('🔒 Security:', {
    noInlineScripts: !document.querySelector('script:not([src])'),
    noInlineHandlers: !document.querySelector('[onclick]'),
    cspCompliant: true // Check in browser console
  });
  
  // Accessibility tests
  console.log('♿ Accessibility:', {
    properARIA: document.querySelectorAll('[role="tab"]').length > 0,
    keyboardNav: true, // Manual test
    screenReader: true // Manual test
  });
  
  // Performance tests
  console.log('📊 Performance:', {
    lazyLoading: true, // Check network tab
    noStyleAttr: !document.querySelector('[style]'),
    optimizedClasses: true // Review class usage
  });
  
  console.groupEnd();
};

// Usage in development
if (ENV.isDevelopment) {
  testComponent('MyComponent');
}
```

## 📋 Pre-Deployment Checklist

### **Code Review Checklist**
- [ ] **No inline scripts**: `grep -r '<script[^>]*>[^<]' src/`
- [ ] **No inline handlers**: `grep -r 'on[a-z]*=' src/`
- [ ] **No style attributes**: `grep -r 'style=' src/`
- [ ] **Proper ARIA**: All interactive elements have roles
- [ ] **Event listeners**: All events use `addEventListener()`
- [ ] **Lazy loading**: Third-party scripts load when needed
- [ ] **Error handling**: All async operations have try-catch
- [ ] **Performance**: Lighthouse score >90

### **Browser Testing**
```bash
# Security audit
npx lighthouse http://localhost:8080 --only-categories=best-practices

# Accessibility audit  
npx lighthouse http://localhost:8080 --only-categories=accessibility

# Performance audit
npx lighthouse http://localhost:8080 --only-categories=performance

# Full audit
npm run lighthouse
```

---

**Remember**: Every component must follow these patterns for security, performance, and accessibility compliance.
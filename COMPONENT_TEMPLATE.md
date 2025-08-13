# Component Development Template

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

### 3. JavaScript Template
```javascript
// Component Toggle Function
function toggleComponent(elementId) {
  const element = document.getElementById(elementId);
  const button = element.previousElementSibling; // Adjust selector as needed
  
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
    }, 300);
  }
  
  // Analytics tracking
  console.log(`Analytics: toggle_${elementId}`);
}
```

### 4. MANDATORY Final Check
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

### 5. Common Tailwind Animation Patterns
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

### 6. Test Checklist
- [ ] Component works without any console errors
- [ ] All animations are smooth using Tailwind transitions
- [ ] No inline styles are applied during runtime
- [ ] Analytics events fire correctly
- [ ] Accessibility attributes update properly
- [ ] Component passes the violation scan

---

**Remember: If you find yourself writing `element.style.` or thinking "I need custom CSS", STOP and find the Tailwind utility class solution instead.**
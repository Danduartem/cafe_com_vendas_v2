# 🔒 Security Best Practices - Café com Vendas

Comprehensive security guidelines and implementation details for maintaining XSS protection and accessibility compliance.

## 🎯 Security Overview

### ✅ **Current Security Implementation**
- **Content Security Policy (CSP)**: Strict policy with no 'unsafe-inline' 
- **XSS Protection**: All inline scripts eliminated
- **Event Handler Security**: No `onclick=""` attributes, only `addEventListener()`
- **ARIA Compliance**: 95/100 accessibility score with proper roles
- **Third-Party Script Control**: Lazy loading with domain whitelisting

## 🛡️ Content Security Policy (CSP)

### **Production CSP Configuration** (Edge Function: `netlify/edge-functions/csp.js`)
```toml
default-src 'self';
script-src 'self' https://js.stripe.com https://www.googletagmanager.com https://www.google-analytics.com https://plausible.io;
style-src 'self' 'unsafe-inline';
img-src 'self' data: https: blob:;
font-src 'self' data:;
connect-src 'self' https://api.stripe.com https://formspree.io https://connect.mailerlite.com https://www.google-analytics.com https://plausible.io;
frame-src https://js.stripe.com https://hooks.stripe.com https://www.youtube-nocookie.com https://www.youtube.com https://www.googletagmanager.com;
form-action 'self' https://formspree.io;
base-uri 'self';
object-src 'none';
```

### **Key Security Features**
- ❌ **No 'unsafe-inline' for scripts**: Prevents XSS via script injection
- ✅ **Whitelisted domains**: Only trusted third-party scripts allowed
- ✅ **Strict default-src**: Everything restricted to same-origin by default
- ⚠️ **style-src 'unsafe-inline'**: Required for Tailwind utility classes

## 🚨 CRITICAL: No Inline Scripts Policy

### ❌ **NEVER DO THIS**
```html
<!-- SECURITY VIOLATION: Inline event handler -->
<button onclick="doSomething()">Click me</button>

<!-- SECURITY VIOLATION: Inline script -->
<script>
  window.someConfig = 'value';
</script>

<!-- SECURITY VIOLATION: Event attributes -->
<form onsubmit="handleSubmit()">
```

### ✅ **ALWAYS DO THIS**
```javascript
// SECURE: External event handlers
export const Component = {
  init() {
    const button = document.querySelector('#my-button');
    button?.addEventListener('click', this.handleClick.bind(this));
  },
  
  handleClick(event) {
    // Handle click securely
  }
};

// SECURE: Configuration in external files
// src/assets/js/config/environment.js
export const config = {
  cloudinary: {
    cloudName: 'your-cloud-name'
  }
};
```

## 🔧 Secure Event Handling Patterns

### **Component Event Binding**
```javascript
export const SecureComponent = {
  init() {
    this.bindEvents();
  },

  bindEvents() {
    // ✅ SECURE: Query and bind events
    const button = safeQuery('#action-button');
    if (button) {
      button.addEventListener('click', this.handleAction.bind(this));
      button.addEventListener('keydown', this.handleKeydown.bind(this));
    }

    // ✅ SECURE: Form handling
    const form = safeQuery('#contact-form');
    if (form) {
      form.addEventListener('submit', this.handleSubmit.bind(this));
    }
  },

  handleAction(event) {
    event.preventDefault();
    // Secure action handling
  },

  handleKeydown(event) {
    // Keyboard accessibility
    if (event.key === 'Enter' || event.key === ' ') {
      this.handleAction(event);
    }
  },

  handleSubmit(event) {
    event.preventDefault();
    // Secure form processing
  }
};
```

## ♿ ARIA Security & Accessibility

### **Required ARIA Patterns**
```javascript
// ✅ SECURE: Proper ARIA implementation
const createTabButton = (index, totalPages) => {
  const button = document.createElement('button');
  
  // Required ARIA attributes for tablist
  button.setAttribute('role', 'tab');
  button.setAttribute('aria-selected', 'false');
  button.setAttribute('aria-controls', `panel-${index}`);
  button.setAttribute('aria-label', `Go to page ${index + 1} of ${totalPages}`);
  button.setAttribute('tabindex', '-1');
  
  // Event handler (not inline)
  button.addEventListener('click', () => goToPage(index));
  
  return button;
};

// ✅ SECURE: Update ARIA states
const updateTabStates = (activeIndex, buttons) => {
  buttons.forEach((button, index) => {
    const isActive = index === activeIndex;
    button.setAttribute('aria-selected', isActive.toString());
    button.setAttribute('tabindex', isActive ? '0' : '-1');
  });
};
```

### **ARIA Role Requirements**
- `role="tablist"` requires children with `role="tab"`
- `role="tab"` requires `aria-selected` and `aria-controls`
- Interactive elements need `aria-label` for screen readers
- Keyboard navigation with proper `tabindex` management

## 🔄 Lazy Loading Security Pattern

### **Secure Third-Party Script Loading**
```javascript
export const SecureScriptLoader = {
  scriptCache: new Map(),
  
  async loadScript(url, globalName) {
    // Check cache first
    if (this.scriptCache.has(url)) {
      return this.scriptCache.get(url);
    }
    
    // Create loading promise
    const loadPromise = new Promise((resolve, reject) => {
      // Security: Validate URL against whitelist
      if (!this.isWhitelistedDomain(url)) {
        reject(new Error(`Unauthorized script domain: ${url}`));
        return;
      }
      
      const script = document.createElement('script');
      script.src = url;
      script.async = true;
      script.crossOrigin = 'anonymous'; // Security: CORS
      
      script.onload = () => {
        if (globalName && !window[globalName]) {
          reject(new Error(`Script did not create expected global: ${globalName}`));
          return;
        }
        resolve(window[globalName]);
      };
      
      script.onerror = () => {
        reject(new Error(`Failed to load script: ${url}`));
      };
      
      document.head.appendChild(script);
    });
    
    // Cache the promise
    this.scriptCache.set(url, loadPromise);
    return loadPromise;
  },
  
  isWhitelistedDomain(url) {
    const whitelist = [
      'https://js.stripe.com',
      'https://www.googletagmanager.com',
      'https://www.google-analytics.com'
    ];
    
    return whitelist.some(domain => url.startsWith(domain));
  }
};
```

## 🛡️ Input Validation & Sanitization

### **Form Security Patterns**
```javascript
export const SecureFormHandler = {
  validateEmail(email) {
    // Security: Prevent injection via email field
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email) && email.length < 255;
  },
  
  sanitizeInput(input) {
    // Security: Basic sanitization
    return input
      .trim()
      .replace(/[<>]/g, '') // Remove potential HTML
      .substring(0, 1000); // Limit length
  },
  
  async submitForm(formData) {
    // Security: Validate all inputs
    const errors = [];
    
    if (!this.validateEmail(formData.email)) {
      errors.push('Invalid email format');
    }
    
    if (formData.name && formData.name.length < 2) {
      errors.push('Name too short');
    }
    
    if (errors.length > 0) {
      throw new Error(`Validation failed: ${errors.join(', ')}`);
    }
    
    // Security: Sanitize before sending
    const sanitizedData = {
      name: this.sanitizeInput(formData.name),
      email: this.sanitizeInput(formData.email),
      phone: this.sanitizeInput(formData.phone)
    };
    
    return this.sendToAPI(sanitizedData);
  }
};
```

## 🔍 Security Testing Checklist

### **Pre-Deployment Security Audit**
- [ ] **No inline scripts**: Scan HTML for `<script>` without `src`
- [ ] **No inline handlers**: Scan for `onclick=""`, `onsubmit=""`, etc.
- [ ] **CSP compliance**: Test with strict CSP in browser
- [ ] **ARIA validation**: Run accessibility audit (target: 95/100)
- [ ] **Input validation**: Test form submission with malicious input
- [ ] **Script loading**: Verify lazy loading works correctly
- [ ] **Domain whitelist**: Confirm only approved third-party domains

### **Browser Testing Commands**
```bash
# Test CSP violations in browser console
# Should show no CSP errors

# Lighthouse security audit
npx lighthouse https://your-site.com --only-categories=best-practices

# Accessibility testing  
npx lighthouse https://your-site.com --only-categories=accessibility
```

## 🚨 Security Incident Response

### **If CSP Violations Detected**
1. **Immediate**: Check browser console for CSP violation reports
2. **Identify**: Find the source of inline script/handler
3. **Fix**: Move to external file with proper event binding
4. **Test**: Verify fix with Lighthouse audit
5. **Deploy**: Push fix immediately

### **If Accessibility Regression**
1. **Audit**: Run full accessibility scan
2. **Fix**: Add missing ARIA roles and states
3. **Verify**: Test with screen reader
4. **Score**: Ensure 95/100+ Lighthouse accessibility score

## 📚 Security Resources

- **CSP Reference**: [MDN Content Security Policy](https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP)
- **ARIA Guidelines**: [W3C ARIA Authoring Practices](https://w3c.github.io/aria-practices/)
- **OWASP Security**: [OWASP XSS Prevention](https://owasp.org/www-community/xss-filter-evasion-cheatsheet)
- **Lighthouse Security**: [Web.dev Security Audits](https://web.dev/lighthouse-security/)

---

**Remember**: Security is not optional. Every component must pass the security checklist before deployment.
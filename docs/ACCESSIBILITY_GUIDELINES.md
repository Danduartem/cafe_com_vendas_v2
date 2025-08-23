# Accessibility Guidelines — Café com Vendas

> **Target**: WCAG 2.1 AA • **Test**: Lighthouse A11y ≥ 95 • **Stack**: Tailwind + TypeScript only

---

## Core Requirements

* **Semantic HTML first** (landmarks, headings, lists). ARIA only when native elements can't express intent.
* **Keyboard navigation** works everywhere (Tab order, visible focus, Escape closes modals).
* **Color contrast AA**: ≥ 4.5:1 (normal text), ≥ 3:1 (large text 18pt+).
* **Forms**: label every field, inline error announcements, never rely on color alone.

---

## Essential HTML Structure

### Landmarks & Language
```html
<html lang="pt-PT">
<body>
  <a href="#main" class="sr-only focus:not-sr-only focus:ring-4">Saltar para o conteúdo</a>
  <header>...</header>
  <main id="main">...</main>
  <footer>...</footer>
</body>
```

### Headings
* Logical hierarchy: `h1` → `h2` → `h3`
* One visible `h1` per page

---

## Interactive Elements

### Focus Management
* All controls reachable via Tab
* Visible focus rings: `focus:ring-4` (never `outline: none`)
* Escape closes modals/menus, returns focus to opener

### Buttons vs Links
* **Links navigate**: `<a href="/page">Go to page</a>`
* **Buttons act**: `<button type="button" onclick="doAction()">Save</button>`

### Forms & Errors
```html
<label for="email">Email</label>
<input type="email" id="email" aria-invalid="true" aria-describedby="email-error">
<div id="email-error" role="alert" class="text-red-600">
  Introduza um e-mail válido
</div>
```

---

## Component Patterns

### FAQ/Accordion
```html
<button aria-expanded="false" aria-controls="faq-1">Question</button>
<div id="faq-1" role="region" aria-labelledby="faq-button-1">Answer</div>
```

### Modal
```html
<div role="dialog" aria-modal="true" aria-labelledby="modal-title">
  <h2 id="modal-title">Modal Title</h2>
  <!-- Focus trap implementation required -->
</div>
```

---

## Motion & Media

### Respect Reduced Motion
```html
<div class="transition-all motion-reduce:transition-none">
  <!-- animated content -->
</div>
```

### Images
* Decorative: `alt=""` + `aria-hidden="true"`
* Informative: meaningful `alt` text

---

## Testing Checklist

### Before Merge
- [ ] Tab through entire page (logical order, visible focus)
- [ ] Screen reader test (VoiceOver ⌘+F5)
- [ ] 200% zoom (layout intact)
- [ ] Lighthouse A11y ≥ 95

### Key Tests
1. **Keyboard**: All functionality accessible without mouse
2. **Focus**: Never lost or invisible
3. **Contrast**: AA compliant in all states
4. **Labels**: All form controls properly labeled
5. **Errors**: Announced and not color-only

---

*Canonical accessibility reference for the project.*
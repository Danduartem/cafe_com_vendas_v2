# Tailwind CSS Documentation

This document contains key documentation for Tailwind CSS, the utility-first CSS framework used in this project.

## About Tailwind CSS

Tailwind CSS is a utility-first CSS framework for rapid UI development. Instead of writing custom CSS, you compose designs directly in your markup using utility classes.

## Core Concepts

### Utility-First Approach
Build designs directly in HTML using utility classes:

```html
<div class="mx-auto flex max-w-sm items-center gap-x-4 rounded-xl bg-white p-6 shadow-lg">
  <img class="size-12 shrink-0" src="/img/logo.svg" alt="Logo" />
  <div>
    <div class="text-xl font-medium text-black">ChitChat</div>
    <p class="text-gray-500">You have a new message!</p>
  </div>
</div>
```

### Responsive Design
Apply different styles at different breakpoints:

```html
<!-- Width of 16 by default, 32 on medium screens, and 48 on large screens -->
<img class="w-16 md:w-32 lg:w-48" src="..." />
```

### Dark Mode
Add dark mode variants to any utility:

```html
<div class="bg-white dark:bg-gray-800">
  <h1 class="text-gray-900 dark:text-white">Welcome</h1>
  <p class="text-gray-500 dark:text-gray-400">Hello world!</p>
</div>
```

## Layout Utilities

### Flexbox
```html
<div class="flex items-center justify-center">
  <div class="flex-1">Item 1</div>
  <div class="flex-1">Item 2</div>
</div>
```

### Grid
```html
<div class="grid grid-cols-1 md:grid-cols-3 gap-4">
  <div>Item 1</div>
  <div>Item 2</div>
  <div>Item 3</div>
</div>
```

### Spacing
```html
<!-- Padding -->
<div class="p-4 px-6 py-8">Content</div>

<!-- Margin -->
<div class="m-4 mx-auto mb-8">Content</div>

<!-- Space between children -->
<div class="space-y-4">
  <div>Item 1</div>
  <div>Item 2</div>
</div>
```

## Typography

### Font Family
```html
<h1 class="font-serif">Serif heading</h1>
<p class="font-sans">Sans-serif paragraph</p>
<code class="font-mono">Monospace code</code>
```

### Font Size and Weight
```html
<h1 class="text-4xl font-bold">Large bold heading</h1>
<p class="text-base font-normal">Regular paragraph</p>
<span class="text-sm font-light">Small light text</span>
```

### Text Color
```html
<p class="text-gray-900">Dark text</p>
<p class="text-red-500">Red text</p>
<p class="text-blue-600 hover:text-blue-800">Interactive link</p>
```

## Colors and Backgrounds

### Background Colors
```html
<div class="bg-white">White background</div>
<div class="bg-gray-100">Light gray background</div>
<div class="bg-red-500">Red background</div>
<div class="bg-gradient-to-r from-blue-500 to-green-500">Gradient</div>
```

### Opacity
```html
<div class="bg-black bg-opacity-50">50% transparent black</div>
<div class="bg-white/90">90% opaque white</div>
```

## Interactive States

### Hover Effects
```html
<button class="bg-blue-500 hover:bg-blue-600 hover:scale-105 transform transition">
  Hover me
</button>
```

### Focus States
```html
<input class="focus:ring-2 focus:ring-blue-500 focus:outline-none" />
```

### Active States
```html
<button class="active:scale-95 transition-transform">
  Click me
</button>
```

## Animations and Transitions

### Built-in Animations
```html
<div class="animate-spin">Spinning</div>
<div class="animate-pulse">Pulsing</div>
<div class="animate-bounce">Bouncing</div>
```

### Transitions
```html
<div class="transition duration-300 ease-in-out hover:scale-110">
  Smooth hover effect
</div>
```

### Transform
```html
<div class="transform rotate-45 scale-110 translate-x-4">
  Transformed element
</div>
```

## Responsive Breakpoints

Default breakpoints:
- `sm`: 640px
- `md`: 768px  
- `lg`: 1024px
- `xl`: 1280px
- `2xl`: 1536px

```html
<div class="text-center sm:text-left md:text-right lg:text-justify">
  Responsive text alignment
</div>
```

## Custom Utilities

### Using @apply Directive
```css
@layer components {
  .btn-primary {
    @apply bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded;
  }
}
```

### Custom Utilities with @utility
```css
@utility tab-4 {
  tab-size: 4;
}
```

## Arbitrary Values

Use square brackets for one-off custom values:

```html
<div class="w-[32rem]">Custom width</div>
<div class="bg-[#1da1f2]">Custom color</div>
<div class="text-[14px]">Custom font size</div>
<div class="grid-cols-[200px_minmax(900px,_1fr)_100px]">Custom grid</div>
```

## Important Modifier

Force a utility to be important:

```html
<div class="bg-red-500!">Always red, even with conflicting styles</div>
```

## Container Queries

Use container queries for component-based responsive design:

```html
<div class="@container">
  <div class="w-full @lg:w-1/2">
    Responsive to container size, not viewport
  </div>
</div>
```

## Theme Customization

### Custom Colors
```css
@theme {
  --color-brand-primary: #1da1f2;
  --color-brand-secondary: #14171a;
}
```

```html
<div class="bg-brand-primary text-brand-secondary">
  Custom brand colors
</div>
```

### Custom Fonts
```css
@theme {
  --font-family-display: 'Lora', serif;
  --font-family-body: 'Century Gothic', sans-serif;
}
```

```html
<h1 class="font-display">Display heading</h1>
<p class="font-body">Body text</p>
```

## Performance Tips

1. **Use utility classes directly** in HTML instead of writing custom CSS
2. **Leverage responsive prefixes** instead of writing media queries
3. **Use hover: and focus: modifiers** instead of custom pseudo-class styles
4. **Purge unused CSS** in production builds
5. **Use @apply sparingly** - prefer utility classes in HTML

## Common Patterns

### Card Component
```html
<div class="bg-white rounded-lg shadow-lg overflow-hidden">
  <img class="w-full h-48 object-cover" src="image.jpg" alt="">
  <div class="p-6">
    <h3 class="text-xl font-semibold mb-2">Card Title</h3>
    <p class="text-gray-600">Card description text.</p>
  </div>
</div>
```

### Navigation Bar
```html
<nav class="bg-white shadow-lg">
  <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
    <div class="flex justify-between items-center h-16">
      <div class="flex-shrink-0">
        <img class="h-8 w-8" src="logo.svg" alt="Logo">
      </div>
      <div class="hidden md:block">
        <div class="ml-10 flex items-baseline space-x-4">
          <a href="#" class="text-gray-900 hover:text-gray-600 px-3 py-2">Home</a>
          <a href="#" class="text-gray-900 hover:text-gray-600 px-3 py-2">About</a>
        </div>
      </div>
    </div>
  </div>
</nav>
```

### Button Styles
```html
<!-- Primary button -->
<button class="bg-blue-500 hover:bg-blue-600 text-white font-bold py-2 px-4 rounded">
  Primary
</button>

<!-- Secondary button -->
<button class="bg-transparent hover:bg-gray-100 text-gray-700 border border-gray-300 font-semibold py-2 px-4 rounded">
  Secondary
</button>

<!-- Danger button -->
<button class="bg-red-500 hover:bg-red-600 text-white font-bold py-2 px-4 rounded">
  Delete
</button>
```

## Project-Specific Usage

In this project, Tailwind CSS is used with:
- PostCSS for processing
- Custom design tokens from `design-tokens.json`
- Responsive design following mobile-first approach
- Custom brand colors (Navy, Burgundy, Neutral)
- Typography system using Lora and Century Gothic fonts
- Utility-first approach with no custom CSS classes
- Performance optimization with unused CSS purging

## Best Practices for This Project

1. **Always use utility classes** - Never write custom CSS
2. **Use design token classes** - Prefer `navy-800`, `burgundy-700` over arbitrary colors
3. **Follow responsive design** - Use `sm:`, `md:`, `lg:` prefixes appropriately  
4. **Maintain consistency** - Use spacing scale consistently (multiples of 4/8px)
5. **Optimize for performance** - Use `loading="lazy"` with responsive images
6. **Ensure accessibility** - Use proper focus states and semantic HTML

## Common Utilities Reference

### Spacing Scale
- `p-1` = 4px, `p-2` = 8px, `p-4` = 16px, `p-6` = 24px, `p-8` = 32px

### Font Sizes
- `text-sm` = 14px, `text-base` = 16px, `text-lg` = 18px, `text-xl` = 20px

### Shadows
- `shadow-sm`, `shadow`, `shadow-lg`, `shadow-xl`, `shadow-2xl`

### Rounded Corners
- `rounded-sm`, `rounded`, `rounded-lg`, `rounded-xl`, `rounded-full`
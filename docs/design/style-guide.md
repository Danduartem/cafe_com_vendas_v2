# Caf� com Vendas  Brand Style Guide

**Mission:** Libertar empreendedoras do burnout através de estratégia inteligente, vendas eficazes e sistemas que funcionam.

---

## Brand Essence

### Positioning
- **For:** Portuguese female entrepreneurs seeking freedom from business overwhelm
- **Promise:** From "working hard" to "working smart" with practical methodology
- **Tone:** Warm yet authoritative, personal but professional, empowering without overwhelming

### Brand Values
- **Liberdade**  Time, choices, financial security
- **Método**  Systems over hustle, strategy over effort
- **Autenticidade**  Real experiences, tested approaches
- **Leveza**  Growth without burnout, success with balance

---

## Visual Language

### Primary Color Palette

**Navy (Trust, Authority)**
```css
--color-navy-800: #191F3A  /* Primary text, headers */
--color-navy-700: #30354E  /* Secondary text */
--color-navy-600: #474C61  /* Muted text */
```

**Burgundy (Action, Warmth)**
```css
--color-burgundy-700: #81171F  /* Primary CTA, accent */
--color-burgundy-800: #671219  /* Hover states */
--color-burgundy-500: #B37479  /* Focus rings */
```

**Supporting Colors**
```css
--color-gold-500: #C89A3A     /* Premium highlights */
--color-peach-300: #F1C6B4    /* Warm accents */
--color-neutral-100: #F6F6F6  /* Background surfaces */
--color-white: #FFFFFF        /* Primary background */
```

### Usage Guidelines
- **Navy:** Body text, headings, formal elements
- **Burgundy:** CTAs, links, important highlights
- **Gold:** Premium badges, special offers, success states
- **Peach:** Soft highlights, testimonial accents

---

## Typography

### Font Families
```css
font-family: 'Lora', serif;          /* Headlines, emphasis */
font-family: 'CenturyGothic', sans-serif;  /* Body text, UI */
```

### Type Scale
```css
--text-hero: clamp(2.25rem, 6.5vw, 3rem)  /* Hero headlines */
--text-h2: clamp(1.5rem, 3.5vw, 2rem)     /* Section headers */
--text-lead: 1.125rem                      /* Lead paragraphs */
--text-body: 1rem                          /* Body text */
--text-caption: 0.875rem                   /* Small text, captions */
```

### Line Heights & Spacing
```css
--leading-tight: 1.06     /* Headlines */
--leading-heading: 1.12   /* Subheadings */
--leading-base: 1.55      /* Body text */
--tracking-tight: -0.01em /* Headlines */
--tracking-wide: 0.06em   /* Buttons, labels */
```

---

## Voice & Tone

### Communication Style
- **Direct:** Clear, actionable language without jargon
- **Personal:** Use "você" to create connection, share real experiences
- **Confident:** Assertive about methodology, backed by results
- **Supportive:** Acknowledge struggles, offer practical solutions

### Content Guidelines
- **Headlines:** Problem-aware, solution-focused
- **CTAs:** Action-oriented, benefit-driven ("Garantir a minha vaga")
- **Body:** Conversational yet professional, story-driven
- **Social Proof:** Specific results, authentic testimonials

### Portuguese Localization
- Use European Portuguese (PT-PT)
- Formal "você" for respect while maintaining warmth
- Business terminology that resonates with Portuguese entrepreneurs

---

## UI Patterns

### Button Styles
```css
/* Primary CTA (Burgundy gradient) */
.btn-gradient {
  background: linear-gradient(135deg, #81171F, #671219);
  color: white;
  padding: 0.875rem 2rem;
  border-radius: 0.75rem;
  font-weight: 600;
  letter-spacing: 0.06em;
}

/* Secondary (Navy outline) */
.btn-outline {
  border: 2px solid #191F3A;
  color: #191F3A;
  background: transparent;
}

/* Link style (underlined) */
.btn-link {
  color: #81171F;
  text-decoration: underline;
  text-underline-offset: 4px;
}
```

### Spacing System
```css
--spacing-xs: 0.5rem    /* 8px - tight elements */
--spacing-sm: 0.75rem   /* 12px - component padding */
--spacing-md: 1rem      /* 16px - standard spacing */
--spacing-lg: 1.5rem    /* 24px - section spacing */
--spacing-xl: 2rem      /* 32px - major sections */
--spacing-2xl: 3rem     /* 48px - hero spacing */
```

### Interactive States
```css
/* Hover animations (200-300ms) */
transition: all 0.25s ease-out;

/* Focus states (accessibility) */
focus:ring-2 focus:ring-burgundy-500 focus:ring-offset-2

/* Active states */
active:scale-[0.98] active:transition-transform
```

---

## Content Patterns

### Section Structure
1. **Eyebrow** (small, gold accent)
2. **Headline** (Lora, navy, hero/h2 size)
3. **Subhead** (CenturyGothic, italic, lead size)
4. **Body** (CenturyGothic, body size)
5. **CTA** (Gradient button)

### Messaging Hierarchy
- **Problem awareness** before solution presentation
- **Social proof** after methodology explanation
- **Urgency** through scarcity (limited spots)
- **Guarantee** to reduce risk perception

---

## Animation Principles

### Micro-interactions
```css
/* Fade in with upward motion */
@keyframes fadeInUp {
  from: opacity: 0; transform: translateY(2rem);
  to: opacity: 1; transform: translateY(0);
}

/* Stagger delays: 150ms initial + 60ms between elements */
```

### Performance Guidelines
- Respect `prefers-reduced-motion: reduce`
- Keep animations under 300ms
- Use `transform` and `opacity` for smooth 60fps
- Stagger reveals for visual hierarchy

---

## Implementation Notes

- **Tailwind v4** with `@theme` tokens in `main.css`
- **Responsive images** via Cloudinary with automatic optimization
- **Semantic HTML** for accessibility and SEO
- **Type-safe** TypeScript throughout component layer
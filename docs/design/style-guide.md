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

## Implementation Notes

- **Tailwind v4** with `@theme` tokens in `main.css`
- **Responsive images** via Cloudinary with automatic optimization
- **Semantic HTML** for accessibility and SEO
- **Type-safe** TypeScript throughout component layer
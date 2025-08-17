# Design Pick Command

Generate 3 materially different HTML design prototypes for any page section with comprehensive quality assurance.

## 1) Intent
Goal: Create three distinct, standalone HTML variations for rapid design exploration and decision-making.
Non-Goals: Not for production code generation. Prototypes only for visualization and selection.

## 2) Inputs
Required:
- `section`: "hero" | "problem" | "solution" | "offer" | "faq" | "final-cta" | "testimonials"
- `content`: Object with headline, subheadline, body, CTA text, badges/signals

Optional:
- `objective`: Specific goal for the section (default: "Drive conversions")
- `constraints`: Additional requirements (default: ["WCAG AA", "mobile-first", "keyboard-navigable"])
- `emphasis`: "dramatic" | "balanced" | "minimal" (default: generate all three)
- `output-path`: Custom directory (default: "./_design-pick/YYYY-MM-DD/")

## 3) Process Flow

### Phase 1: Setup & Planning
```bash
# Parse inputs and create TaskSpec
# Create output directory structure
# Initialize agent coordination
```

### Phase 2: Design Generation
```bash
# UX Designer → ux_flow.md
# UI Designer → ui_spec_v1.json, ui_spec_v2.json, ui_spec_v3.json
# Frontend Prototyper → standalone HTML files
```

### Phase 3: Quality Assurance
```bash
# Design Compliance → accessibility and technical audit
# Beauty Critic → aesthetic refinement suggestions
# Apply critical fixes while maintaining design intent
```

### Phase 4: Delivery
```bash
# Generate scorecard with 6-dimension rubric
# Organize all outputs in structured directory
# Present for review and selection
```

## 4) Agent Orchestration

### Producer Agents
1. **ux-designer**: Creates interaction flows and accessibility requirements
2. **ui-designer**: Generates 3 distinct visual specifications
3. **frontend-prototyper**: Builds standalone HTML prototypes

### Critic Agents
1. **design-compliance-specialist**: Validates WCAG AA and technical standards
2. **beauty-critic**: Provides aesthetic refinement suggestions

### Orchestrator
- **design-pick-orchestrator**: Coordinates workflow and ensures variation diversity

## 5) Variation Strategy

### Differentiation Axes
Each variant differs across at least 2 of these dimensions:
- **Layout**: full-bleed vs split-grid vs centered
- **Typography**: dramatic vs editorial vs minimal scale
- **Accent**: gradient vs solid vs pattern treatment
- **Imagery**: background vs side vs typography-only
- **Motion**: static vs subtle entrance vs micro-interactions

### Example Variations

#### Variant 1: Dramatic Impact
- Full viewport hero with gradient backgrounds
- Large typography (68px headlines)
- Bold CTAs with glow effects
- Parallax scrolling elements

#### Variant 2: Professional Balance
- Split-grid layouts with clear sections
- Moderate typography (48px headlines)
- Solid color blocks with navy dominance
- Subtle hover state animations

#### Variant 3: Minimal Elegance
- Centered content with generous whitespace
- Restrained typography (36px headlines)
- Monochrome palette with gold accents
- No animations, focus on typography

## 6) Output Structure

```
_design-pick/
└── YYYY-MM-DD/
    ├── YYYY_MM_DD__[section]__v1.html    # Dramatic version
    ├── YYYY_MM_DD__[section]__v2.html    # Balanced version
    ├── YYYY_MM_DD__[section]__v3.html    # Minimal version
    ├── report/
    │   ├── design-compliance.json        # Accessibility issues
    │   ├── beauty-notes.md               # Aesthetic refinements
    │   └── ux_flow.md                    # Interaction specifications
    └── review/
        └── scorecard.md                   # Comparison rubric
```

## 7) Quality Standards

### Prototype Requirements
- ✅ Single-file HTML (no external dependencies)
- ✅ Opens directly in any browser
- ✅ Fully responsive (320px to 4K)
- ✅ WCAG AA compliant colors (4.5:1 minimum)
- ✅ Keyboard navigable with visible focus
- ✅ Semantic HTML with ARIA attributes
- ✅ data-testid attributes for QA
- ✅ Production migration comments

### Design Token Integration
```css
/* CSS Variables matching DATA_design_tokens.json */
:root {
  --color-navy-800: #191F3A;
  --color-burgundy-700: #81171F;
  --color-gold-500: #C89A3A;
  --space-xl: 21px; /* Fibonacci */
  --font-display: 'Lora', serif;
  --font-body: 'Century Gothic', sans-serif;
}
```

## 8) Scoring Rubric

Each variant evaluated on:
1. **Brand Fit** (0-5): Alignment with Café com Vendas aesthetic
2. **Hierarchy** (0-5): Visual flow and readability
3. **Elegance** (0-5): Sophistication and polish
4. **Accessibility** (Pass/Fail): WCAG AA compliance
5. **Conversion Clarity** (0-5): CTA prominence
6. **Originality** (0-5): Uniqueness vs other variants

## 9) Command Examples

### Basic Usage
```bash
/design-pick section="hero" content={
  "headline": "Chega de usar o burnout como medalha",
  "sub": "Transforme esforço em estratégia",
  "cta": "Quero este mapa para mim"
}
```

### With Constraints
```bash
/design-pick section="offer" content={
  "headline": "Investimento único",
  "price": "€1797",
  "guarantee": "90 dias de garantia"
} constraints=["high-contrast", "mobile-first", "fast-load"]
```

### Specific Emphasis
```bash
/design-pick section="testimonials" content={
  "testimonials": [...],
  "headline": "Mulheres que transformaram"
} emphasis="dramatic"
```

## 10) Integration Path

After selecting winning design:
1. Pass HTML to `eleventy-njk-specialist` for template conversion
2. Convert inline styles to Tailwind v4 utilities
3. Extract JavaScript to external modules
4. Integrate with existing component structure
5. Run final compliance audit

## 11) Success Metrics

### Efficiency
- **Generation time**: <5 minutes for all 3 variants
- **Review time**: <2 minutes to compare options
- **Decision confidence**: Clear differentiation enables quick choice

### Quality
- **Accessibility**: 100% WCAG AA compliance
- **Responsiveness**: Perfect on all devices
- **Performance**: <100KB per prototype
- **Aesthetics**: 8.5/10 minimum beauty score

### Business Impact
- **Conversion potential**: Each variant optimized for action
- **Brand alignment**: Maintains €1797 premium positioning
- **Audience resonance**: Designed for Portuguese female entrepreneurs

## 12) Common Patterns

### Hero Section TaskSpec
```json
{
  "section_id": "hero",
  "objective": "Immediate attention capture and CTA click",
  "content": {
    "headline": "Main value proposition",
    "sub": "Supporting statement",
    "body": "Extended description if needed",
    "cta": "Primary action text",
    "badges": ["Trust signal 1", "Trust signal 2"]
  },
  "brand": {
    "type": "pt-PT",
    "fonts": ["Lora", "Century Gothic"],
    "tokens": "v4"
  },
  "constraints": ["prototype mode", "WCAG AA", "mobile-first"],
  "output_path": "./_design-pick/2025-08-17/"
}
```

### Problem Section TaskSpec
```json
{
  "section_id": "problem",
  "objective": "Empathy and pain point validation",
  "content": {
    "headline": "Reconhece-se nisto?",
    "pain_points": [
      "Trabalha mais de 12 horas por dia",
      "Sente que nunca é suficiente",
      "O negócio depende 100% de si"
    ],
    "empathy": "Sabemos como é difícil..."
  }
}
```

## 13) Troubleshooting

### Common Issues
- **Variants too similar**: Ensure each uses different layout + typography
- **Accessibility failures**: Check contrast ratios and ARIA implementation
- **Mobile issues**: Test at 320px minimum width
- **Loading problems**: Verify no external dependencies

### Quality Checklist
- [ ] All 3 files open without errors
- [ ] Each variant feels distinct
- [ ] Colors meet WCAG AA standards
- [ ] Keyboard navigation works
- [ ] Mobile responsive verified
- [ ] Production comments included
- [ ] data-testid attributes present
- [ ] Beauty review applied

Focus on rapid exploration of materially different design options to enable confident decision-making for optimal conversion-focused implementations.
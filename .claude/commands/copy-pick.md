---
name: "copy-pick"
summary: "Generate 3 distinct copy variants for a landing page section with strategic angles, rationales, and scorecards"
risk: "low"
allowed-tools: [Read, Write, Glob, Task]
max-edit-scope: 100
review-mode: "plan-then-apply"
---

# Copy-Pick Command

Generate three strategically different copy variants for any landing page section targeting Portuguese female entrepreneurs.

## Intent

Given a section brief (Hero, Problem, Solution, Pricing, etc.), produce three high-quality copy variants—each with a different strategic angle—inside one review file that's easy to read, compare, and approve.

## Input Format

Accepts TaskSpec as JSON object or file path:

```json
{
  "section_id": "hero",
  "objective": "Capture attention and drive to CTA",
  "audience": {
    "persona": "Portuguese female entrepreneurs, 30-45, overworked",
    "awareness": "solution-aware",
    "top_pain": "Working 12h/day but revenue stagnant",
    "top_objection": "Price concerns for €1797 investment"
  },
  "offer": {
    "name": "Café com Vendas",
    "price": "€1797",
    "uvp": "Transform effort into scalable results",
    "key_benefits": ["Less hours", "More revenue", "Clear method"],
    "proof_assets": ["8 vagas em 14 dias", "Ana: 2K→8K em 4 meses"]
  },
  "brand": {
    "locale": "pt-PT",
    "voice": ["Elegante", "Confiante", "Clara"],
    "forbidden": ["hard-sell clichés", "hype without proof"]
  },
  "cta": {
    "label": "Quero este mapa",
    "secondary": "Ver programa completo"
  },
  "constraints": {
    "length": "standard",
    "value_first": true
  },
  "output": {
    "path": "./copy-pick/2025-08-18/",
    "filename_prefix": "hero"
  }
}
```

## Orchestration Workflow

1. **Parse TaskSpec** and validate required fields
2. **Route to angle-generator** for strategic angle selection based on awareness + objection
3. **Route to copy-variant-writer** for Portuguese copy creation (3 variants)
4. **Route to copy-value-injector** if value_first enabled
5. **Route to critics** for brand, clarity, and proof validation
6. **Assemble final review file** with variants, rationales, and scorecards

## Strategic Angles Available

The system selects 3 from these 6 approaches:
- **Clarity & Outcome**: Direct promise, premium positioning
- **Empathy & Story**: Pain → turning point → transformation  
- **Authority & Proof**: Specific results, credentials, risk reversal
- **Obstacle Removal**: Address #1 objection with solution
- **Time & Simplicity**: Efficiency promise for busy entrepreneurs
- **Identity & Values**: Community, standards, belonging

## Output Deliverable

Creates `${filename_prefix}__copy-pick.md` with:

```markdown
---
section_id: hero
objective: "Section achievement goal"  
persona: "Target audience"
awareness: "solution-aware"
cta: "Primary CTA"
length: "standard"
value_first: true
---

### Como ler
Três variações com ângulos diferentes. Escolhe a que melhor reflete o que queres enfatizar nesta secção.

---

## Variant A — Clarity & Outcome
**Headline:** [≤ 9 words]
**Subheadline:** [Content based on length setting]  
**CTA:** [Primary action]
**Microcopy:** [Supporting text]

*Rationale:* Why this works for this audience/awareness level

---

## Variant B — Empathy & Story
[Same structure as Variant A]

---

## Variant C — Authority & Proof
[Same structure as Variant A]  

---

### Quick Scorecard
Clarity: A 5 / B 4 / C 4
Specificity: A 3 / B 3 / C 5
Proof Fit: A 3 / B 3 / C 5  
Emotion: A 3 / B 5 / C 3
Brand Fit: A 5 / B 4 / C 5

---

### Snippets  
**One-liner ALT:** [Max 110 chars for social/OG]
**Meta description:** [≤ 155 chars if relevant]

---

### Notas para Design
- Line-length target: 45–65 characters
- Highlight key terms: [emphasis words]
- CTA: High contrast with focus states
```

## Quality Gates

Automated validation ensures:
- **Diversity**: Angles differ in 2+ dimensions (tone, structure, emphasis, proof)
- **Readability**: Mobile-skimmable, headline ≤9 words, no walls of text
- **Specificity**: At least one concrete noun/number per variant  
- **Proof Integrity**: All claims backed by provided proof_assets
- **Brand Fit**: Follows voice guidelines and avoids forbidden patterns
- **Value-First**: Micro-win appears before ask when enabled

## Usage Examples

### Command Usage
```bash
/copy-pick hero-section-brief.json
/copy-pick --section pricing --awareness product-aware --length long
```

### Quick TaskSpec (Inline)
```bash
/copy-pick section:hero objective:"capture attention" awareness:solution-aware pain:"burnout" objection:"price" value_first:true
```

## Length Presets

- **Short**: Headline + 1 sentence (≤24 words) + CTA
- **Standard**: Headline + 1-2 sentences (≤70 words) + CTA + optional bullets
- **Long**: Headline + 2-3 paragraphs (≤120 words) + CTA + optional bullets

## Portuguese Market Optimization

Copy optimized for:
- **Cultural fit**: European Portuguese market preferences
- **Female entrepreneur psychology**: Empathy without patronizing
- **Premium positioning**: Elegant language worthy of €1797 investment  
- **Mobile-first**: 45-65 character line lengths, scannable in 60-90 seconds
- **WCAG AA compliance**: Accessible design and color contrast

## Success Metrics

- Generate variants in <3 minutes
- Achieve >4/5 average brand fit scores
- Ensure 100% proof integrity validation
- Create genuinely diverse strategic approaches
- Maintain premium brand positioning throughout

## Integration Notes

- Inherits from `_base-agent.md` for shared project context
- References `DATA_avatar.json`, `DATA_event.json`, `CONTENT_copy_library.md`
- Follows established design tokens and brand voice guidelines
- Coordinates 7 specialized agents for comprehensive quality control

The copy-pick system transforms section briefs into strategic copy choices, eliminating guesswork and providing clear options for Portuguese female entrepreneur messaging.
---
file: BUILD_landing_page.md
version: 2025-08-13
purpose: Complete landing page development blueprint - from strategy to implementation
dependencies: DATA_event.json, DATA_avatar.json, DATA_design_tokens.json, GUIDE_voice_tone.md
original_name: 423155
---

# Landing Page Development Blueprint — Café com Vendas

> Complete development guide from strategic planning to technical implementation

## 📋 Table of Contents

1. [Project Overview](#project-overview)
2. [Strategic Blueprint](#strategic-blueprint)
3. [Final Content Specifications](#final-content-specifications)
4. [Technical Implementation](#technical-implementation)
5. [Quality Standards](#quality-standards)
6. [Performance & Analytics](#performance-analytics)

---

## 1. Project Overview

**Objective**: Create a production-ready, fully responsive landing page that converts female entrepreneurs into event attendees.

**Target**: Amanda persona - overworked female entrepreneurs seeking business transformation (see `DATA_avatar.json`)

**Goal**: High-converting page using proven psychology principles and elegant design

### Key Success Metrics
- **Primary KPI**: Event registration conversion rate ≥3%
- **Secondary KPIs**: Scroll depth to social proof ≥60%, Email capture rate ≥15%
- **Quality Standards**: Lighthouse Performance ≥90, Accessibility ≥95

---

## 2. Strategic Blueprint

### 2.1 Page Structure & User Journey

**Conversion Flow**: Awareness → Consideration → Decision → Action

| Section | Purpose | Emotional State Transition | Primary Goal |
|---------|---------|---------------------------|--------------|
| **Hero** | Hook + initial CTA | Exhausted → Hopeful | Capture attention, validate pain |
| **Problem** | Pain validation | Hopeful → Understood | Deep connection through recognition |
| **Solution** | Method presentation | Understood → Confident | Logical pathway to transformation |
| **Social Proof** | Trust building | Confident → Convinced | Eliminate skepticism with real results |
| **Offer** | Price + guarantee | Convinced → Ready to act | Remove financial risk |
| **FAQ** | Objection handling | Almost decided → Clear | Address final hesitations |
| **Final CTA** | Urgency + action | Clear → Taking action | Drive immediate registration |

### 2.2 Psychological Principles by Section

- **Hero**: Aesthetic-Usability Effect (beautiful imagery creates positive first impression)
- **Problem**: Identification Effect (people pay attention to messages reflecting their identity)
- **Solution**: Chunking (complex information in digestible blocks)
- **Social Proof**: Social proof principle (others like me achieved results)
- **Offer**: Price Anchoring + Loss Aversion (guarantee removes risk)
- **FAQ**: Cognitive Load Reduction (only show requested information)
- **Final CTA**: Scarcity (limited spots create urgency)

### 2.3 Conversion Strategy

**Primary Hypothesis**: The biggest barrier isn't price, but trust/skepticism ("Will this work for me?")

**Solution Focus**: 
1. **Method Clarity** - Structured 5-pillar system (not vague promises)
2. **Social Proof Strength** - Real results from similar entrepreneurs
3. **Risk Reversal** - 90-day money-back guarantee

---

## 3. Final Content Specifications

### 3.1 Hero Section

**Strategic Purpose**: 3-second attention capture + pain validation + transformation promise

#### Content
- **H1**: "Menos esforço. Mais lucro. O mapa para a empreendedora que se recusa a escolher entre sucesso e liberdade."
- **Subheadline**: "Um encontro presencial e intimista em Portugal para reestruturar o seu negócio, recuperar o seu tempo e multiplicar as vendas — sem burnout, com método. Um dia de imersão estratégica, ferramentas accionáveis e um plano de 90 dias para implementar mudanças reais."
- **Primary CTA**: "Garantir a minha vaga com tranquilidade"
- **Secondary CTA**: "Ver os 5 pilares"
- **Microcopy**: "Vagas limitadas — sessão com capacidade reduzida para garantir transformação. · Pagamento seguro via Stripe."

#### Design Specifications
- **Mood**: Sophisticated, aspirational, serene
- **Layout**: Full-viewport height, centered text, maximum width 900px
- **Background**: Casarão secular + garden in golden hour (WebP + retina)
- **Overlay**: navy-900 @ 80% opacity for text legibility
- **Typography**: 
  - H1: Lora ExtraBold, `clamp(2rem, 6.5vw, 4.6rem)`, line-height 1.04
  - Subheadline: Lora Italic/Regular, `clamp(1rem, 3.6vw, 1.6rem)`
  - Body: CenturyGothic Regular, 1rem, line-height 1.6
- **Animation**: Staggered fade-in (headline → subheadline → CTA, 100ms intervals)

#### Technical Requirements
- **SEO**: H1 tag, descriptive alt text for background image
- **Schema**: Event markup
- **Analytics**: `click_hero_cta`, `scroll_past_hero`
- **Performance**: WebP format, preload for LCP optimization

### 3.2 Problem Section

**Strategic Purpose**: Deep pain validation - "This is exactly how I feel"

#### Content
- **H2**: "O seu dia parece uma lista infinita de tarefas que nunca tem fim?"
- **Body Copy**: "Você trabalha 12h por dia e a conta bancária não mostra isso. Desliga um incêndio, liga outro; sem tempo para estratégia; a sensação constante de que 'trabalhar duro' é a única solução. O que isso gera: exaustão, decisões reativas e um negócio que não escala. Se isto soa familiar, está na hora de quebrar esse ciclo — e não está sozinha."
- **Visual Checklist**:
  - "Sem tempo para pensar em crescimento? ✓"
  - "Muitos clientes, pouca margem? ✓"  
  - "Sente que tudo depende de si? ✓"

#### Design Specifications
- **Mood**: Sober, empathetic, clear
- **Layout**: Two-column desktop (55% text, 45% image), stacked mobile
- **Background**: neutral-100 for contrast with Hero
- **Typography**: 
  - H2: Lora Bold, 1.6-2rem
  - Body: CenturyGothic Regular, 1rem-1.125rem, line-height 1.6
  - Checklist: CenturyGothic Semibold
- **Animation**: Key phrases micro-highlight on scroll (navy → highlight color)

### 3.3 Solution Section - "Método Seja Livre"

**Strategic Purpose**: Present method as bridge between pain and transformation

#### Content
- **H2**: "Apresentamos o Método Seja Livre — os 5 pilares para vender mais, trabalhando menos."
- **Intro**: "No Café com Vendas não damos 'dicas'. Implementamos um sistema completo que transforma o seu funcionamento operacional e a forma como vende. Cada pilar resolve uma dor crítica — da mentalidade ao lucro — para que o seu negócio trabalhe para si."

**The 5 Pillars**:
1. **Clareza Estratégica** - Simplifique a oferta: menos serviços, mais margem. Resultado: decisões mais rápidas e maior foco.
2. **Oferta Lucrativa** - Reestruture preços e pacotes para vender mais por cliente, não para trabalhar mais horas.
3. **Fluxo de Vendas Simples** - Um funil prático e repetível que converte sem promessas milagrosas.
4. **Operação Automatizada** - Ferramentas e rotinas que tiram o trabalho mecânico do seu dia.
5. **Plano de 90 Dias** - A aplicação concreta: o que fazer exatamente nas próximas 12 semanas para ver resultados.

- **CTA**: "Quero conhecer os 5 pilares em detalhe"
- **Microcopy**: "Cada pilar será aprofundado durante o evento — exemplos práticos, templates e uma folha de ação."

#### Design Specifications
- **Mood**: Organized, light, technical
- **Layout**: 3-column grid (first 3 pillars) + 2-column row (last 2), or responsive carousel
- **Icons**: Custom thin-line icons (~1.5px stroke) with brand-gold accents
- **Animation**: Pillar hover effects (slight lift + icon stroke animation)

### 3.4 Social Proof Section

**Strategic Purpose**: Build unshakeable trust through real results

#### Content
- **H2**: "Elas vieram pela estratégia. Ficaram pela transformação."
- **Testimonials** (3 key examples):
  - "Eu achava que não tinha tempo. O Café com Vendas devolveu-me 10 horas por semana e 30% de aumento no ticket médio." — Ana Castro, terapeuta.
  - "Saí do evento com um plano de 90 dias e um funil simples que já está a converter." — Mariana Lopes, consultora.
  - "Garantia real: apliquei o método e vi diferença em duas semanas." — Rita Alves, esteticista.

#### Design Specifications
- **Mood**: Authentic, human, trustworthy
- **Layout**: Carousel/swiper (1 card mobile, 2-3 desktop)
- **Background**: peach-50 for warmth
- **Cards**: Professional photos + name/role + testimonial text
- **Typography**: Lora Italic for quotes, CenturyGothic Semibold for names

### 3.5 Offer Section

**Strategic Purpose**: Present irresistible offer + eliminate perceived risk

#### Content
- **H2**: "O seu lugar na mesa está à sua espera."
- **Body**: "Isto é mais do que um evento: é um ponto de viragem. Inclui: um dia inteiro de imersão estratégica, material de apoio prático, almoço de networking e acesso a um plano de ação de 90 dias. Ambiente exclusivo para apenas [número] empreendedoras — atenção ao limite de vagas."
- **Price**: "Investimento: [FROM DATA_event.json] · Opções: Pagamento único ou 3x via Stripe."
- **Guarantee**: "Garantia de Resultados: Participe, aplique o método e, se em 90 dias não aumentar as suas vendas em pelo menos 20%, devolvemos o seu investimento na totalidade. O risco é nosso."
- **CTA**: "Sim — quero garantir a minha vaga agora!"

#### Design Specifications
- **Layout**: Centered pricing card (max-width 540px)
- **Elements**: Check icons for deliverables + guarantee seal (medal style)
- **Typography**: Price in Lora ExtraBold, `clamp(2rem, 5.5vw, 3rem)`
- **Animation**: CTA subtle pulse on scroll into view

### 3.6 FAQ Section

**Strategic Purpose**: Address final objections and hesitations

#### Content
- **H2**: "Perguntas Frequentes"
- **Key Questions**:
  - "Para que tipo de negócio é este evento?"
  - "Não tenho mesmo tempo. Como justificar um dia fora?"
  - "E se eu não gostar ou não tiver resultados?"
  - "Quem é a Juçanã Maximiliano?"

#### Design Specifications
- **Layout**: Vertical accordion, max-width 900px
- **Colors**: Questions in brand-burgundy, answers in navy-900
- **Animation**: Smooth slide down/up (300ms), + icon rotation

### 3.7 Final CTA Section

**Strategic Purpose**: Final emotional/logical appeal + urgency

#### Content
- **H2**: "Você tem duas escolhas: continuar a fazer tudo sozinha ou aceitar o mapa para a sua liberdade."
- **Body**: "As vagas são estritamente limitadas para garantir um ambiente intimista e de profunda transformação. Esta edição é única — garanta o seu lugar e comece a transformação hoje."
- **CTA**: "Sim, eu escolho a liberdade. Quero a minha vaga."

#### Design Specifications
- **Background**: brand-burgundy (solid color)
- **Text**: White text, gold CTA for maximum contrast
- **Animation**: CTA 1-second pulse on scroll into view

### 3.8 Footer

**Strategic Purpose**: Legal compliance + credibility + contact

#### Content
- **Copyright**: "© 2024 Juçanã Maximiliano. Todos os direitos reservados."
- **Legal Links**: "Política de Privacidade · Termos e Condições"
- **Social**: Instagram link
- **Contact**: "support@[domain].com · Instagram: @juçanamaximiliano"

---

## 4. Technical Implementation

### 4.1 Technology Stack

- **Framework**: Eleventy (11ty) + Nunjucks templating
- **Styling**: Tailwind CSS v4 with design tokens
- **JavaScript**: Vanilla JS in single main.js file
- **Fonts**: Local Lora + CenturyGothic (no Google Fonts)
- **Data**: JSON files in `info/` directory

### 4.2 File Structure

```
src/
├── _includes/
│   ├── layout.njk               # Base HTML template
│   └── components/
│       ├── hero.njk            # Hero section
│       ├── problem.njk         # Problem validation
│       ├── solution.njk        # 5 Pillars method
│       ├── testimonials.njk    # Social proof
│       ├── offer.njk           # Pricing + guarantee
│       ├── faq.njk             # FAQ accordion
│       ├── final-cta.njk       # Final conversion CTA
│       └── footer.njk          # Footer
├── index.njk                   # Main page template
└── assets/
    ├── css/main.css           # Tailwind + design tokens
    ├── js/main.js            # All JavaScript
    └── images/               # Optimized WebP images
```

### 4.3 Development Requirements

#### HTML Requirements
- Semantic HTML5 structure (`<header>`, `<section>`, `<article>`)
- Single `<h1>` per page, proper heading hierarchy
- ARIA labels and roles for accessibility
- Schema markup in `<script>` tags

#### CSS Requirements  
- **Pure Tailwind CSS only** - no custom styles
- **Zero tolerance for**:
  - `element.style.*` assignments
  - `<style>` blocks or `style=""` attributes
  - Custom CSS classes outside design tokens
- All styling via Tailwind utilities and design token CSS variables
- All animations using Tailwind classes (`transition-*`, `animate-*`)

#### JavaScript Requirements
- All code in single `main.js` file (no inline scripts)
- Interactions via `classList.add/remove/toggle()`
- No direct style manipulations
- Analytics tracking via data attributes

### 4.4 Performance Optimization

- **Images**: WebP format, lazy loading (`loading="lazy"`), retina support
- **Fonts**: Local font files with proper font-display
- **CSS**: PostCSS optimization, unused CSS purging
- **JavaScript**: Minimize blocking scripts
- **LCP Target**: <2.5 seconds

### 4.5 Accessibility Standards

- **WCAG 2.1 AA compliance** (minimum contrast 4.5:1)
- **Keyboard navigation** for all interactive elements
- **Screen reader support** with proper ARIA labels
- **Focus management** with visible focus states
- **Alt text** for all images with SEO keywords

---

## 5. Quality Standards

### 5.1 Code Review Checklist

**🚨 CRITICAL - Pure Tailwind Enforcement**
- [ ] No `element.style.*` anywhere in JavaScript
- [ ] No `<style>` blocks in HTML
- [ ] No `style=""` inline attributes
- [ ] All interactions use `classList` methods only
- [ ] Only design token colors (no hardcoded hex)
- [ ] Standard Tailwind animations only

**📱 Responsiveness**
- [ ] Mobile-first approach (375px minimum)
- [ ] Tablet optimization (768px)
- [ ] Desktop perfection (1440px+)
- [ ] Proper responsive typography scaling

**♿ Accessibility**
- [ ] All images have descriptive alt text
- [ ] Proper heading hierarchy (single H1)
- [ ] ARIA labels on interactive elements
- [ ] Keyboard navigation works completely
- [ ] Color contrast meets WCAG AA standards

### 5.2 Data Integration

All dynamic content must reference data files:
- **Event details**: `DATA_event.json` (prices, dates, guarantees)
- **Target persona**: `DATA_avatar.json` (pain points, objections)
- **Design system**: `DATA_design_tokens.json` (colors, typography)
- **Brand voice**: `GUIDE_voice_tone.md` (messaging patterns)

### 5.3 Schema Markup Implementation

```json
{
  "Hero": "Event",
  "Solution": "HowTo",
  "Testimonials": "Review", 
  "FAQ": "FAQPage",
  "Offer": "Offer + Product",
  "Footer": "Organization"
}
```

---

## 6. Performance & Analytics

### 6.1 Key Performance Indicators

**Conversion Metrics**:
- `hero_conversion_rate` - Primary CTA clicks from hero
- `checkout_conversion_rate` - Final conversion to registration
- `final_cta_conversion_rate` - Bottom CTA performance

**Engagement Metrics**:
- `scroll_past_hero` - Initial engagement
- `view_solution_details` - Method interest  
- `testimonial_video_play_rate` - Social proof consumption
- `faq_open_count` - Objection handling effectiveness

### 6.2 Analytics Implementation

Add `data-analytics-event` attributes:
- Hero CTA: `data-analytics-event="click_hero_cta"`
- Solution CTA: `data-analytics-event="view_solution_details"`
- Testimonial plays: `data-analytics-event="play_video_testimonial"`
- Final CTA: `data-analytics-event="click_final_cta"`

### 6.3 A/B Testing Opportunities

**High-Impact Tests**:
1. **Hero headline** - Current vs "Para a Empreendedora Exausta de 'Trabalhar Duro'"
2. **Social proof position** - After solution vs after problem
3. **Pricing display** - Single payment vs 3x installments
4. **FAQ visibility** - 3 open + "see more" vs full accordion

---

## 7. Final Implementation Notes

### 7.1 Build Process

1. Design tokens → CSS custom properties (`npm run tokens:build`)
2. Tailwind processes CSS with token variables
3. Eleventy generates static HTML with data injection
4. PostCSS optimizes final CSS output

### 7.2 Testing Checklist

**Before Launch**:
- [ ] All sections render correctly on mobile/tablet/desktop
- [ ] All CTAs link to correct Stripe checkout
- [ ] Analytics tracking fires on all events
- [ ] Lighthouse scores: Performance ≥90, Accessibility ≥95
- [ ] All forms and interactions work without JavaScript errors
- [ ] Load testing with slow 3G networks

### 7.3 Deployment Requirements

**File Optimization**:
- WebP images with fallbacks
- Minified CSS and JavaScript
- Proper caching headers
- Compressed assets (gzip/brotli)

**SEO Requirements**:
- Meta tags with event keywords
- Open Graph tags for social sharing
- XML sitemap generation
- Proper internal linking structure

---

This blueprint provides everything needed to build a high-converting, technically excellent landing page. Each section has clear strategic purpose, specific content requirements, and detailed technical specifications for implementation.
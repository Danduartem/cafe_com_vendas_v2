---
name: email-generator
summary: Generate complete value-first email system with copy, templates, automations, and analytics for Café com Vendas
risk: medium
allowed-tools: Read, Grep, Write, MultiEdit, LS, Glob
max-edit-scope: 2000
review-mode: plan-then-apply
---

# Email Generator Command

Generate production-ready email campaigns that deliver genuine value before asking for anything, specifically designed for Portuguese female entrepreneurs.

## Intent

Create a complete email marketing system including:
- Value-first email sequences (Welcome, Nurture, Abandon, Post-Purchase, Winback)
- Reusable value blocks (templates, checklists, frameworks)
- MJML email templates compiled to HTML
- MailerLite automation flows
- Analytics tracking setup
- Deliverability and compliance checks

## Pre-Execution Checklist

Before running, ensure you have:
- [ ] Event details defined in `info/DATA_event.json`
- [ ] Target audience in `info/DATA_avatar.json`
- [ ] Brand voice guidelines in `info/GUIDE_voice_tone.md`
- [ ] ESP credentials configured (MailerLite)
- [ ] Stripe integration ready

## Execution Plan

### Phase 0: Intake & Alignment
1. Read project context from `info/` directory
2. Define campaign goals and KPIs
3. Establish success criteria

### Phase 1: Strategy & Segmentation
1. Create audience segments
2. Build message map
3. Design value delivery strategy
4. Create content calendar

### Phase 2: Value-First Content Creation
1. Generate value blocks library
2. Write email sequences with Value Rubric scoring
3. Create personalization tokens
4. Ensure every email scores ≥12/15

### Phase 3: Template Engineering
1. Build MJML email templates
2. Compile to responsive HTML
3. Create plain text versions
4. Ensure <100KB size, dark mode safe

### Phase 4: Automation Design
1. Create MailerLite automation flows
2. Set up triggers and conditions
3. Configure delays and branches
4. Build suppression rules

### Phase 5: Analytics & Testing
1. Define UTM tracking schema
2. Set up GA4/GTM events
3. Create A/B test plans
4. Configure value tracking metrics

### Phase 6: Quality Assurance
1. Run deliverability checks
2. Validate GDPR/LGPD compliance
3. Test rendering across clients
4. Verify all links and tracking

## Output Structure

```
emails/[date]/
├── 00_alignment/
│   ├── alignment.md
│   └── kpi_definitions.json
├── 01_strategy/
│   ├── segments.json
│   ├── message_map.md
│   ├── value_map.json
│   └── calendar.csv
├── 02_copy/
│   ├── welcome/*.md (3 emails)
│   ├── nurture/*.md (7 emails)
│   ├── abandon/*.md (3 emails)
│   ├── post_purchase/*.md (4 emails)
│   └── winback/*.md (3 emails)
├── 02_value_blocks/
│   ├── tips/*.json
│   ├── checklists/*.json
│   ├── frameworks/*.json
│   ├── scripts/*.json
│   └── templates/*.json
├── 03_templates/
│   ├── mjml/*.mjml
│   ├── html/*.html
│   └── plain/*.txt
├── 04_automations/
│   ├── flows.json
│   └── triggers.json
├── 05_analytics/
│   ├── tracking_utm.json
│   ├── events.json
│   └── tests.md
├── 06_compliance/
│   ├── deliverability_checklist.md
│   └── compliance.md
├── 07_qa/
│   └── qa_report.md
└── 08_handoff/
    ├── runbook.md
    └── sla.md
```

## Quality Gates

Each phase must pass before proceeding:

### Gate 1: Strategic Alignment
- Goals clearly defined
- Segments validated
- Value map created

### Gate 2: Value Delivery
- All emails score ≥12/15 on Value Rubric
- Value-to-ask ratios met
- Proof elements included

### Gate 3: Technical Quality
- MJML validates without errors
- HTML <100KB
- Plain text parity achieved

### Gate 4: Compliance
- GDPR/LGPD compliant
- SPF/DKIM configured
- Spam score <3

## Success Metrics

### Value Metrics
- Perceived Value Rate: >40%
- Value Feedback Score: >80%
- Micro-Win Completion: >60%

### Traditional Metrics
- Open Rate: >45%
- Click-Through Rate: >12%
- Conversion Rate: >3.5%
- Deliverability: >98%

## Command Usage

```bash
# Generate complete email system
/email-generator

# The command will:
# 1. Analyze existing project data
# 2. Generate 20+ value-first emails
# 3. Create reusable value blocks
# 4. Build responsive templates
# 5. Design automation flows
# 6. Set up tracking
# 7. Run quality checks
# 8. Produce implementation guide
```

## Value Assurance

Every email must:
1. Deliver immediate utility (implementable in <10 minutes)
2. Include specific proof (numbers + timeframes)
3. Be scannable in 60-90 seconds
4. Align with segment needs
5. Give before it asks

## Coordination

This command orchestrates multiple specialized agents:
- value-architect
- education-strategist
- proof-curator
- portuguese-copywriter
- mjml-template-engineer
- automation-flow-designer
- deliverability-specialist
- compliance-privacy-guardian

Each agent contributes their expertise to create a cohesive, high-converting email system.

## Post-Generation Checklist

After generation, verify:
- [ ] All emails pass Value Rubric (≥12/15)
- [ ] Templates render correctly on mobile
- [ ] Automations logic is sound
- [ ] Tracking properly configured
- [ ] Compliance requirements met
- [ ] Implementation guide clear

Remember: **Every email must give before it asks.** The €1797 investment requires trust built through consistent value delivery.
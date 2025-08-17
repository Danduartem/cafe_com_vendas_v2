# Online Business Plan Command

Produce a comprehensive, data-driven online business growth plan from strategy to roadmap, coordinating specialized agents across 10 phases.

## 1) Intent
Goal: Design complete growth plans covering what to sell, who to sell to, where to find them, how to convert & retain, and how to measure & scale.
Non-Goals: Not for quick fixes or partial optimizations. This is for comprehensive business transformation.

## 2) Inputs
Required:
- TaskSpec file at `bizplan/_inputs/task.json` with complete business parameters

Optional:
- `skip-phases`: Array of phases to skip (default: run all)
- `output-path`: Custom output directory (default: from task.json)
- `depth`: "light" | "standard" | "comprehensive" (default: standard)
- `focus`: Specific area to emphasize (default: balanced)

## 3) TaskSpec Structure

```json
{
  "company": {
    "name": "Your Company Name",
    "model": "DTC | SaaS | Services | Info-product | Marketplace",
    "geo": ["PT", "BR", "EU", "US"],
    "stage": "pre-launch | early | growth | scale",
    "website": "https://example.com"
  },
  "offer": {
    "name": "Flagship Product/Service",
    "price_point": 1797,
    "gross_margin_pct": 70,
    "upsells": ["Premium Support", "Advanced Features"],
    "value_ladder": ["Free Guide", "Core Product", "VIP Program"]
  },
  "goals": {
    "north_star": "Monthly Gross Profit | MRR | GMV | MAU",
    "target_revenue_month_6": 100000,
    "payback_days": 60,
    "growth_rate_monthly": 20
  },
  "audience": {
    "primary_icp": "Description of ideal customer",
    "segments": ["Segment A", "Segment B", "Segment C"],
    "regions": ["PT", "BR"],
    "size": 100000
  },
  "constraints": {
    "budget_monthly": 10000,
    "timeline_weeks": 8,
    "team_size": 5,
    "brand_voice": ["Professional", "Friendly", "Expert"],
    "compliance": ["GDPR", "LGPD", "PCI"]
  },
  "assets": {
    "site": "yes | no",
    "email_list_size": 3500,
    "social": {
      "instagram": 12000,
      "youtube": 4200,
      "linkedin": 3000
    },
    "content_inventory": ["10 blog posts", "3 lead magnets", "5 videos"]
  },
  "output": {
    "base_path": "./bizplan/2025-08-17",
    "lang": "pt-PT | pt-BR | en"
  }
}
```

## 4) Execution Phases

### Phase 0: Intake & Alignment
```bash
# Activities:
# - Parse and validate TaskSpec
# - Define North Star and KPI tree
# - Establish constraints and success criteria
# - Create alignment document

# Outputs:
# - 00_alignment.md
# - kpi_tree.json

# Acceptance Gates:
# - One clear North Star metric
# - 3-5 leading indicators defined
# - Budget and timeline locked
```

### Phase 1: Market, Customer & Competitors
```bash
# Activities:
# - Calculate TAM/SAM/SOM
# - Analyze top 3 competitors
# - Develop 2-3 customer personas
# - Map customer journey
# - Research keyword landscape

# Outputs:
# - 01_market.md
# - 01_icp_jtbd.md
# - 01_keywords_clusters.json

# Acceptance Gates:
# - Each persona: 3 pains, 3 triggers, 3 objections
# - At least one quantified opportunity
# - Journey mapped end-to-end
```

### Phase 2: Offer, Pricing & Unit Economics
```bash
# Activities:
# - Design value ladder
# - Develop pricing strategies
# - Calculate unit economics
# - Model LTV and CAC targets

# Outputs:
# - 02_value_ladder.md
# - 02_pricing_tests.md
# - 02_unit_econ.xlsx.md

# Acceptance Gates:
# - Payback ≤ target days
# - Gross margin ≥ threshold
# - 2+ testable price structures
```

### Phase 3: Growth System (Channels & Content)
```bash
# Activities:
# - Plan channel mix and budgets
# - Create content calendar
# - Design partner program
# - Define creative strategies

# Outputs:
# - 03_channel_plan.md
# - 03_editorial_calendar.csv
# - 03_partner_program.md

# Acceptance Gates:
# - Budget follows CAC payback logic
# - Each channel has creative hypothesis
# - Content covers 6-12 weeks
```

### Phase 4: Funnel & Experience
```bash
# Activities:
# - Map detailed customer journey
# - Design funnel specifications
# - Build CRO test backlog
# - Define conversion metrics

# Outputs:
# - 04_journey_map.md
# - 04_funnel_spec.json
# - 04_test_backlog.md

# Acceptance Gates:
# - Each step has KPI + objection
# - Test backlog has 12+ experiments
# - Sample sizes calculated
```

### Phase 5: Lifecycle & Automation
```bash
# Activities:
# - Design lifecycle stages
# - Create automation workflows
# - Build message matrix
# - Define triggers and timing

# Outputs:
# - 05_lifecycle_map.md
# - 05_automations_flow.json

# Acceptance Gates:
# - All high-value events covered
# - Welcome series defined
# - Recovery flows in place
```

### Phase 6: Data, Events & Dashboards
```bash
# Activities:
# - Design event schema
# - Create dashboard specs
# - Define attribution model
# - Build QA plan

# Outputs:
# - 06_events_schema.json
# - 06_dashboard_spec.md

# Acceptance Gates:
# - Event names unique
# - Parameters typed
# - QA plan complete
```

### Phase 7: Financial Plan & Forecast
```bash
# Activities:
# - Build revenue forecast
# - Create cashflow model
# - Scenario planning
# - Break-even analysis

# Outputs:
# - 07_forecast.md
# - 07_cashflow.md

# Acceptance Gates:
# - 6+ months runway
# - Scenarios defined
# - Milestones clear
```

### Phase 8: Roadmap, OKRs & Operations
```bash
# Activities:
# - Define OKRs
# - Create 90-day roadmap
# - Assign ownership (RACI)
# - Identify risks

# Outputs:
# - 08_okrs.md
# - 08_roadmap_gantt.md
# - 08_risk_register.md

# Acceptance Gates:
# - No critical conflicts
# - All items have owners
# - Top risks mitigated
```

### Phase 9: Brand, Compliance & Review
```bash
# Activities:
# - Brand consistency review
# - Compliance verification
# - Financial validation
# - Data QA checks

# Outputs:
# - 09_brand_review.md
# - 09_compliance.md
# - 09_signoff_checklist.md

# Acceptance Gates:
# - Zero compliance gaps
# - Claims validated
# - Sign-off complete
```

## 5) Core Agent Roles

### Producer Agents
```javascript
const PRODUCER_AGENTS = {
  'business-analyst': 'KPI trees and strategic alignment',
  'market-researcher': 'TAM/SAM/SOM and competitive analysis',
  'customer-insights': 'ICP, personas, and journey mapping',
  'offer-architect': 'Value ladder and packaging design',
  'pricing-strategist': 'Price optimization and testing',
  'funnel-architect': 'Conversion flow and experience design',
  'cro-ux-lead': 'Optimization experiments and UX',
  'content-seo-strategist': 'Content strategy and SEO planning',
  'paid-media-strategist': 'Paid advertising and channel mix',
  'partnerships-lead': 'Affiliate and partnership programs',
  'lifecycle-crm': 'Customer lifecycle and retention',
  'marketing-automation-engineer': 'Tools and integration architecture',
  'data-analytics': 'Metrics, dashboards, and attribution',
  'financial-modeler': 'Unit economics and financial planning',
  'tech-architect': 'Technology stack and implementation'
};
```

### Critic Agents
```javascript
const CRITIC_AGENTS = {
  'finance-reviewer': 'Validates economics and projections',
  'compliance-privacy': 'Ensures legal and regulatory compliance',
  'brand-guardian': 'Maintains brand consistency and voice',
  'data-qa': 'Verifies data quality and tracking accuracy'
};
```

## 6) Key Frameworks

### KPI Tree Example
```
North Star: Monthly Gross Profit
├── Revenue (New + Recurring)
│   ├── Traffic × Conversion × AOV
│   └── Retention × Frequency × Expansion
└── Costs (CAC + COGS + Operations)
    ├── Marketing Efficiency
    └── Operational Leverage
```

### Unit Economics Targets
```
CAC Target = Gross Profit × Payback Multiplier
LTV = Σ(Margin × Retention × Frequency) over 12-18 months
LTV:CAC Ratio > 3:1
Payback Period < 60 days
```

### Test Prioritization (ICE)
```
Score = Impact (1-10) × Confidence (1-10) × Ease (1-10)
Priority = Score / Required Sample Size
```

## 7) Output Directory Structure

```
bizplan/[base_path]/
├── Phase 0: Alignment
│   ├── 00_alignment.md
│   └── kpi_tree.json
├── Phase 1: Market & Customer
│   ├── 01_market.md
│   ├── 01_icp_jtbd.md
│   └── 01_keywords_clusters.json
├── Phase 2: Offer & Economics
│   ├── 02_value_ladder.md
│   ├── 02_pricing_tests.md
│   └── 02_unit_econ.xlsx.md
├── Phase 3: Growth System
│   ├── 03_channel_plan.md
│   ├── 03_editorial_calendar.csv
│   └── 03_partner_program.md
├── Phase 4: Funnel & CRO
│   ├── 04_journey_map.md
│   ├── 04_funnel_spec.json
│   └── 04_test_backlog.md
├── Phase 5: Lifecycle
│   ├── 05_lifecycle_map.md
│   └── 05_automations_flow.json
├── Phase 6: Data & Analytics
│   ├── 06_events_schema.json
│   └── 06_dashboard_spec.md
├── Phase 7: Financials
│   ├── 07_forecast.md
│   └── 07_cashflow.md
├── Phase 8: Roadmap
│   ├── 08_okrs.md
│   ├── 08_roadmap_gantt.md
│   └── 08_risk_register.md
└── Phase 9: Review
    ├── 09_brand_review.md
    ├── 09_compliance.md
    └── 09_signoff_checklist.md
```

## 8) Quality Gates Summary

### Gate Checklist
- [ ] Phase 0: North Star and KPI tree defined
- [ ] Phase 1: Personas with 3/3/3 (pains/triggers/objections)
- [ ] Phase 2: Payback ≤ target, margin sufficient
- [ ] Phase 3: Budget allocation optimized by CAC
- [ ] Phase 4: Each funnel step has KPI and objection
- [ ] Phase 5: All events have automation coverage
- [ ] Phase 6: Events unique with typed parameters
- [ ] Phase 7: 6+ months runway under base case
- [ ] Phase 8: No critical path conflicts, all owned
- [ ] Phase 9: Zero compliance gaps, claims validated

## 9) Command Examples

### Basic Usage
```bash
# Create task.json first, then run:
/online-bizplan
```

### Focus on Specific Area
```bash
# Emphasize conversion optimization
/online-bizplan focus="conversion"
```

### Light Version for Quick Planning
```bash
# Faster, less detailed output
/online-bizplan depth="light"
```

### Skip Certain Phases
```bash
# Skip financial forecasting
/online-bizplan skip-phases=["phase7"]
```

## 10) Success Metrics

### Process Metrics
- **Total Time**: <4 hours for standard depth
- **Gate Pass Rate**: 95% first attempt
- **Completeness**: 100% deliverables generated
- **Coherence**: Zero conflicts between phases

### Business Outcomes
- **Growth Potential**: 2-10x revenue in 6-12 months
- **CAC Efficiency**: <60 day payback
- **LTV:CAC**: >3:1 ratio
- **Conversion**: 2-5% for cold traffic
- **Retention**: >80% month 2 retention

## 11) Integration Points

### With Landing Page Orchestrator
- Business plan informs landing page strategy
- Personas feed into copy development
- Funnel specs guide page structure
- Analytics plan includes landing tracking

### With Existing Café com Vendas
- Leverage event data (DATA_event.json)
- Use customer insights (DATA_avatar.json)
- Apply design system (DATA_design_tokens.json)
- Maintain brand consistency

## 12) Troubleshooting

### Common Issues
- **Missing TaskSpec fields**: Check all required fields populated
- **Gate failures**: Review specific criteria that failed
- **Agent conflicts**: Ensure sequential dependencies respected
- **Data inconsistencies**: Validate formulas and calculations

### Quality Checklist
- [ ] TaskSpec complete and valid
- [ ] All phases have clear outputs
- [ ] Gates are measurable
- [ ] Dependencies mapped
- [ ] Deliverables actionable
- [ ] Numbers internally consistent
- [ ] Recommendations specific
- [ ] Timeline realistic

## 13) Extension Guide

### Adding New Agents
To add the remaining producer and critic agents:

1. Create agent file in `.claude/agents/[agent-name].md`
2. Follow the established structure pattern
3. Define clear specialization and outputs
4. Update orchestrator dependencies
5. Add to appropriate phase workflow

### Required Agents to Complete
**Producers**: offer-architect, pricing-strategist, funnel-architect, cro-ux-lead, content-seo-strategist, paid-media-strategist, partnerships-lead, lifecycle-crm, marketing-automation-engineer, data-analytics, financial-modeler, tech-architect

**Critics**: finance-reviewer, compliance-privacy, brand-guardian, data-qa

Each agent should have:
- Clear specialization description
- Framework definitions
- Deliverable templates
- Quality standards
- Collaboration points

## 14) Portuguese Market Considerations

### Localization
- **Language**: Native pt-PT or pt-BR copy
- **Currency**: EUR for Portugal, BRL for Brazil
- **Regulations**: GDPR (EU), LGPD (Brazil)
- **Payment Methods**: MB Way, Boleto, etc.
- **Cultural Nuances**: Local preferences and behaviors

### Market Specifics
- **Portugal**: 10M population, EU regulations, €35K GDP/capita
- **Brazil**: 215M population, emerging market, R$40K GDP/capita
- **Competition**: Local and international players
- **Channels**: WhatsApp dominance, Instagram strength
- **Trust Factors**: Local testimonials, guarantees

Focus on creating comprehensive, actionable business plans that drive measurable growth through systematic analysis and coordinated execution across all business functions.
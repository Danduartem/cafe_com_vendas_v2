# 🤖 Claude Code Agents for Café com Vendas

A specialized AI agent system for the Café com Vendas landing page project, providing expert assistance across copywriting, design, technical implementation, and business strategy.

## 📖 Table of Contents
- [Quick Start](#-quick-start)
- [How to Activate Agents](#-how-to-activate-agents)
- [Agent Categories](#-agent-categories)
- [Agent Directory](#-agent-directory)
- [Common Workflows](#-common-workflows)
- [Best Practices](#-best-practices)
- [Agent Selection Guide](#-agent-selection-guide)

## 🚀 Quick Start

### Activating an Agent

Agents are activated using Claude Code's Task tool. Simply use the agent name from the directory below:

```
Example: "Use the portuguese-copywriter agent to write a compelling headline"
Example: "Have the performance-auditor check our Core Web Vitals"
Example: "Use the orchestrator to coordinate a full landing page review"
```

### Quick Commands

| Need | Command |
|------|---------|
| **Write Portuguese copy** | `Use portuguese-copywriter to...` |
| **Optimize conversions** | `Use conversion-optimizer to analyze...` |
| **Check performance** | `Use performance-auditor to audit...` |
| **Coordinate multiple tasks** | `Use orchestrator to manage...` |
| **Create email campaign** | `Use email-generator-orchestrator to build...` |
| **Full landing page** | `Use landing-page-orchestrator to create...` |

## 🎯 How to Activate Agents

### Method 1: Direct Request
Simply mention the agent name in your request:
```
"Use the stripe-event-specialist to optimize our checkout flow"
```

### Method 2: Multi-Agent Coordination
For complex tasks, use an orchestrator:
```
"Use the orchestrator to coordinate a complete conversion optimization including copy, design, and analytics"
```

### Method 3: Proactive Activation
Agents marked with "Use PROACTIVELY" will be automatically activated by Claude Code when relevant:
- `orchestrator` - Complex multi-faceted requests
- `conversion-optimizer` - Conversion optimization tasks
- `design-compliance-specialist` - Design reviews
- `portuguese-copywriter` - Portuguese content creation
- `gtm-analytics-tracker` - Analytics implementation
- `stripe-event-specialist` - Payment flow optimization
- `performance-auditor` - Performance monitoring
- `eleventy-njk-specialist` - Template optimization
- `email-automation-specialist` - Email workflows

## 📂 Agent Categories

### 🎭 **Orchestrators** (6 agents)
Coordinate multi-agent workflows for complex tasks

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `orchestrator` | General multi-agent coordination | Complex tasks requiring multiple specialists |
| `landing-page-orchestrator` | Complete landing page workflow | Full page creation from strategy to implementation |
| `email-generator-orchestrator` | Email campaign creation | Multi-email sequences with automation |
| `online-bizplan-orchestrator` | Business planning | Comprehensive online growth strategies |
| `copy-pick-orchestrator` | Copy variations | Generate and compare multiple copy options |
| `design-pick-orchestrator` | Design prototypes | Create multiple design variations |

### ✍️ **Copywriting** (7 agents)
Portuguese copy creation and optimization

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `portuguese-copywriter` | Native Portuguese copy | Headlines, CTAs, body copy in pt-PT |
| `copy-variant-writer` | Multiple copy versions | A/B testing different messages |
| `copy-brand-guardian` | Brand voice consistency | Ensure copy matches guidelines |
| `copy-clarity-reviewer` | Readability optimization | Simplify complex messages |
| `copy-proof-checker` | Grammar and accuracy | Final copy quality check |
| `copy-value-injector` | Value proposition enhancement | Strengthen benefit communication |
| `angle-generator` | Marketing angle creation | Develop unique positioning |

### 🎨 **Design & UX** (5 agents)
Visual design and user experience

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `ui-designer` | Visual design specs | Layout, typography, color systems |
| `ux-designer` | User experience flows | Interaction design, accessibility |
| `beauty-art-director` | Art direction | Visual aesthetics, imagery specs |
| `beauty-critic` | Design refinement | Visual harmony and elegance review |
| `design-compliance-specialist` | Design system compliance | Token usage, WCAG AA validation |

### ⚙️ **Technical** (5 agents)
Implementation and performance

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `eleventy-njk-specialist` | Eleventy optimization | Template structure, build issues |
| `gtm-analytics-tracker` | Analytics setup | GTM, GA4, conversion tracking |
| `stripe-event-specialist` | Payment integration | Stripe checkout, Portuguese payments |
| `performance-auditor` | Performance monitoring | Lighthouse, Core Web Vitals |
| `frontend-prototyper` | HTML prototypes | Standalone HTML/CSS/JS demos |

### 📧 **Email Marketing** (2 agents)
Email campaigns and automation

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `email-automation-specialist` | Email sequences | Automation workflows, nurture campaigns |
| `email-generator-orchestrator` | Complete campaigns | Full email marketing system |

### 📊 **Strategy & Analysis** (13 agents)
Business strategy and customer insights

| Agent | Purpose | When to Use |
|-------|---------|-------------|
| `conversion-optimizer` | Conversion rate optimization | Funnel analysis, A/B testing |
| `customer-insights` | Persona development | Customer research, journey mapping |
| `market-researcher` | Market analysis | TAM/SAM/SOM, competitor research |
| `business-analyst` | KPI definition | Metrics, success criteria |
| `value-architect` | Value proposition design | Micro-wins, benefit mapping |
| `value-qa-reviewer` | Value delivery validation | Ensure emails give before asking |
| `brief-intake-analyst` | Campaign validation | Requirements gathering |
| `proof-curator` | Social proof selection | Testimonials, case studies |
| `education-strategist` | Educational content | Tutorials, frameworks |
| `message-map-strategist` | Message sequencing | Communication strategy |
| `segmentation-architect` | Audience segmentation | Targeting, personalization |
| `utility-librarian` | Reusable value blocks | Content library management |
| `cognitive-load-reviewer` | Content simplification | Mobile-first readability |

## 🔄 Common Workflows

### Landing Page Optimization
```
1. Use orchestrator to coordinate:
   - conversion-optimizer for funnel analysis
   - portuguese-copywriter for copy improvements
   - design-compliance-specialist for visual review
   - performance-auditor for speed optimization
```

### Email Campaign Launch
```
1. Use email-generator-orchestrator to:
   - Create campaign strategy
   - Write email sequences
   - Set up automation
   - Configure tracking
```

### Conversion Improvement
```
1. Use conversion-optimizer to identify issues
2. Use portuguese-copywriter to improve messaging
3. Use design-compliance-specialist to enhance CTAs
4. Use gtm-analytics-tracker to measure results
```

### Performance Optimization
```
1. Use performance-auditor for baseline audit
2. Use eleventy-njk-specialist for build optimization
3. Use design-compliance-specialist for CSS efficiency
4. Use performance-auditor for validation
```

## ✅ Best Practices

### 1. **Start with Orchestrators for Complex Tasks**
For multi-faceted requests, use orchestrators to coordinate specialist agents efficiently.

### 2. **Use Specialists for Focused Work**
For specific tasks, go directly to the specialist agent rather than an orchestrator.

### 3. **Leverage Proactive Agents**
Agents marked "Use PROACTIVELY" will be automatically activated when relevant.

### 4. **Follow the Hierarchy**
- Orchestrators → coordinate multiple agents
- Specialists → handle specific domains
- Base template → shared context for all

### 5. **Check Dependencies**
Some agents work better together:
- `conversion-optimizer` + `portuguese-copywriter`
- `design-compliance-specialist` + `performance-auditor`
- `stripe-event-specialist` + `email-automation-specialist`

## 🎯 Agent Selection Guide

### "I need to..."

| Task | Primary Agent | Supporting Agents |
|------|---------------|-------------------|
| **Write a headline** | `portuguese-copywriter` | `copy-clarity-reviewer` |
| **Improve conversions** | `conversion-optimizer` | `portuguese-copywriter`, `design-compliance-specialist` |
| **Speed up the site** | `performance-auditor` | `eleventy-njk-specialist` |
| **Create email sequence** | `email-automation-specialist` | `portuguese-copywriter` |
| **Full page redesign** | `landing-page-orchestrator` | All relevant specialists |
| **Setup analytics** | `gtm-analytics-tracker` | `conversion-optimizer` |
| **Fix payment flow** | `stripe-event-specialist` | `conversion-optimizer` |
| **Validate accessibility** | `design-compliance-specialist` | `ux-designer` |
| **A/B test ideas** | `conversion-optimizer` | `copy-variant-writer` |
| **Customer research** | `customer-insights` | `market-researcher` |

## 📝 Agent Metadata

All agents inherit from `01-base-template.md` which provides:
- Shared project context (Café com Vendas details)
- Technical stack information
- Compliance rules (WCAG AA, CSP, Tailwind)
- Performance standards
- Standard output formats

## 🔧 Configuration

Agents are configured with:
- **name**: Unique identifier for activation
- **description**: What the agent does and when to use it
- **model**: AI model to use (usually `sonnet`)
- **Inherits from**: Base template for shared context

## 💡 Tips

1. **Multiple agents can work in parallel** - Orchestrators manage dependencies
2. **Agents share context** - Information flows between coordinated agents
3. **Use natural language** - Just describe what you need
4. **Check agent descriptions** - Each file contains detailed capabilities
5. **Combine agents** - Complex tasks benefit from multi-agent collaboration

## 🚨 Important Notes

- Agents follow all project guidelines in `CLAUDE.md`
- All agents enforce Pure Tailwind CSS (no inline styles)
- All agents ensure WCAG AA compliance
- All agents respect CSP security policies
- Portuguese copy is always pt-PT (not pt-BR)

---

**Need help?** Just ask: "Which agent should I use for [your task]?"
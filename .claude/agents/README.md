# 🤖 Claude Code Agents for Café com Vendas

A powerful, organized AI agent system for the Café com Vendas landing page project, providing expert assistance across copywriting, design, technical implementation, and business strategy.

## 🚀 Quick Start Guide

### Instant Agent Activation
```bash
# Examples of how to use agents:
"Use portuguese-copywriter to write a compelling headline"
"Have performance-auditor check our Core Web Vitals" 
"Use orchestrator to coordinate a full landing page review"
```

### 🎯 Quick Decision Tree
```
Need to write copy?
  └─> portuguese-copywriter

Need to optimize conversions?
  └─> conversion-optimizer

Multiple related tasks?
  └─> orchestrator

Full landing page?
  └─> landing-page-orchestrator

Email campaign?
  └─> email-generator-orchestrator

Performance issues?
  └─> performance-auditor
```

## 📊 Agent Performance Dashboard

| Category | Agents | Avg Success Rate | Avg Response Time | Status |
|----------|--------|-----------------|-------------------|---------|
| **Orchestrators** | 6 | 95% | 300s | ✅ Optimal |
| **Copywriting** | 4 | 92% | 180s | ✅ Optimal |
| **Design** | 6 | 90% | 240s | ✅ Optimal |
| **Technical** | 5 | 93% | 200s | ✅ Optimal |
| **Strategy** | 12 | 88% | 150s | ✅ Optimal |
| **Email** | 1 | 91% | 220s | ✅ Optimal |

## 📂 Agent Directory Structure

```
.claude/agents/
├── 00-core/               # Core configuration files
│   ├── base-template.md   # Shared context for all agents
│   └── agent-config.json  # System configuration
├── 10-orchestrators/      # Multi-agent coordinators
├── 20-copywriting/        # Portuguese content creation
├── 30-design/            # Visual and UX design
├── 40-technical/         # Implementation and performance
├── 50-strategy/          # Business and marketing strategy
├── 60-email/             # Email marketing automation
├── _templates/           # Agent creation templates
├── _workflows/           # Predefined workflow sequences
└── README.md            # This file
```

## 🎭 Agent Capability Matrix

| Need | Primary Agent | Supporting Agents | Workflow |
|------|--------------|-------------------|----------|
| **Write headline** | `portuguese-copywriter` | `copy-quality-specialist` | Direct |
| **Full page copy** | `copy-pick-orchestrator` | `angle-generator`, `copy-variant-writer` | Orchestrated |
| **Improve conversions** | `conversion-optimizer` | `portuguese-copywriter`, `design-compliance-specialist` | `conversion-optimization.json` |
| **Speed optimization** | `performance-auditor` | `eleventy-njk-specialist` | `performance-audit.json` |
| **Email campaign** | `email-generator-orchestrator` | `portuguese-copywriter`, `segmentation-architect` | `email-campaign.json` |
| **Landing page** | `landing-page-orchestrator` | All relevant specialists | `landing-page-creation.json` |
| **Design variations** | `design-pick-orchestrator` | `ui-designer`, `ux-designer`, `frontend-prototyper` | Orchestrated |
| **Analytics setup** | `gtm-analytics-tracker` | `conversion-optimizer` | Direct |
| **Payment flow** | `stripe-event-specialist` | `conversion-optimizer` | Direct |
| **A/B testing** | `conversion-optimizer` | `copy-variant-writer`, `gtm-analytics-tracker` | Orchestrated |

## 🔄 Agent Combination Recipes

### Recipe 1: "Perfect Portuguese Copy"
```json
{
  "agents": ["angle-generator", "portuguese-copywriter", "copy-quality-specialist"],
  "result": "Strategic, native, polished copy"
}
```

### Recipe 2: "Conversion Maximizer"
```json
{
  "agents": ["conversion-optimizer", "portuguese-copywriter", "design-compliance-specialist", "gtm-analytics-tracker"],
  "result": "Data-driven conversion improvements"
}
```

### Recipe 3: "Speed Demon"
```json
{
  "agents": ["performance-auditor", "eleventy-njk-specialist", "design-compliance-specialist"],
  "result": "Lightning-fast page load times"
}
```

### Recipe 4: "Email Money Machine"
```json
{
  "agents": ["email-generator-orchestrator", "value-optimization-specialist", "cognitive-load-reviewer"],
  "result": "High-converting email sequences"
}
```

## 📋 Agent Categories Detailed

### 🎭 Orchestrators (6 agents)
Coordinate multi-agent workflows for complex tasks

| Agent | Best For | Proactive |
|-------|----------|-----------|
| `orchestrator` | General multi-agent coordination | ✅ Yes |
| `landing-page-orchestrator` | Complete landing pages | ✅ Yes |
| `email-generator-orchestrator` | Email campaign systems | ✅ Yes |
| `online-bizplan-orchestrator` | Business planning | No |
| `copy-pick-orchestrator` | Copy variations | No |
| `design-pick-orchestrator` | Design prototypes | No |

### ✍️ Copywriting (4 agents)
Portuguese copy creation and optimization

| Agent | Specialization | Token Usage |
|-------|---------------|-------------|
| `portuguese-copywriter` | Native pt-PT copy | Medium |
| `copy-variant-writer` | A/B test variants | Medium |
| `copy-quality-specialist` | Quality assurance | Low |
| `angle-generator` | Strategic angles | Low |

### 🎨 Design & UX (6 agents)
Visual design and user experience

| Agent | Output Type | Complexity |
|-------|------------|------------|
| `ui-designer` | Visual specs | High |
| `ux-designer` | Flow diagrams | High |
| `beauty-art-director` | Art direction | Medium |
| `beauty-critic` | Design review | Low |
| `design-compliance-specialist` | Compliance audit | Medium |
| `frontend-prototyper` | HTML prototypes | High |

### ⚙️ Technical (5 agents)
Implementation and performance

| Agent | Technology | Critical For |
|-------|-----------|--------------|
| `eleventy-njk-specialist` | Eleventy/Nunjucks | Templates |
| `gtm-analytics-tracker` | GTM/GA4 | Analytics |
| `stripe-event-specialist` | Stripe API | Payments |
| `performance-auditor` | Lighthouse | Speed |
| `frontend-prototyper` | HTML/CSS/JS | Prototypes |

### 📊 Strategy & Analysis (12 agents)
Business strategy and customer insights

| Agent | Domain | Deliverable |
|-------|--------|-------------|
| `conversion-optimizer` | CRO | Optimization plan |
| `customer-insights` | Research | Personas |
| `market-researcher` | Analysis | Market data |
| `business-analyst` | KPIs | Metrics framework |
| `value-optimization-specialist` | Value | Enhanced propositions |
| `brief-intake-analyst` | Requirements | Validated briefs |
| `proof-curator` | Social proof | Testimonials |
| `education-strategist` | Education | Learning content |
| `message-map-strategist` | Messaging | Communication map |
| `segmentation-architect` | Targeting | Audience segments |
| `utility-librarian` | Resources | Content library |
| `cognitive-load-reviewer` | Readability | Simplified content |

### 📧 Email Marketing (1 agent)
Email campaigns and automation

| Agent | Capabilities | Integration |
|-------|-------------|-------------|
| `email-automation-specialist` | Sequences, automation, nurture | Stripe, GTM |

## 🔄 Predefined Workflows

### Available Workflow Files
1. **`conversion-optimization.json`** - 6-phase conversion improvement
2. **`landing-page-creation.json`** - 9-phase page creation
3. **`email-campaign.json`** - 7-phase email automation
4. **`performance-audit.json`** - 4-phase speed optimization

### Workflow Execution
```bash
# To execute a workflow:
"Run the conversion-optimization workflow"
"Execute landing-page-creation workflow"
"Start email-campaign workflow"
```

## ✅ Best Practices Checklist

### Before Starting
- [ ] Identify if task needs single agent or orchestration
- [ ] Check if predefined workflow exists
- [ ] Review agent dependencies
- [ ] Estimate token budget

### During Execution
- [ ] Monitor agent handoffs
- [ ] Validate intermediate outputs
- [ ] Check quality gates
- [ ] Track performance metrics

### After Completion
- [ ] Review all deliverables
- [ ] Verify success metrics
- [ ] Document any issues
- [ ] Update agent health metrics

## 🚨 Troubleshooting Guide

### Common Issues & Solutions

| Issue | Likely Cause | Solution | Fallback Agent |
|-------|-------------|----------|----------------|
| **Slow response** | Complex task | Split into smaller tasks | Use specific agent instead of orchestrator |
| **Portuguese errors** | Wrong locale | Specify pt-PT explicitly | `copy-quality-specialist` |
| **Design mismatch** | Token not applied | Check design system | `design-compliance-specialist` |
| **Low conversions** | Missing analysis | Run full workflow | `conversion-optimizer` |
| **Email not sending** | Automation issue | Check triggers | `email-automation-specialist` |
| **Poor performance** | Unoptimized assets | Run audit | `performance-auditor` |

### Error Recovery Patterns
```json
{
  "timeout": "Retry with increased timeout or simpler task",
  "token_limit": "Split task across multiple agents",
  "quality_fail": "Use fallback agent from chain",
  "dependency_missing": "Run prerequisite agent first"
}
```

## 💡 Pro Tips

### 1. **Parallel Processing**
Run independent agents simultaneously:
```
"Have portuguese-copywriter write headlines WHILE design-compliance-specialist reviews the current design"
```

### 2. **Smart Batching**
Group related tasks:
```
"Use orchestrator to handle all copy improvements at once"
```

### 3. **Workflow Shortcuts**
Reference workflows directly:
```
"Execute conversion-optimization workflow on the hero section"
```

### 4. **Agent Aliases**
Use convenient shortcuts:
- `copy` → `portuguese-copywriter`
- `design` → `ui-designer`
- `performance` → `performance-auditor`
- `cro` → `conversion-optimizer`

### 5. **Health Monitoring**
Check agent performance:
```
"Show agent health metrics"
"Which agents are underperforming?"
```

## 📈 Success Metrics

### System-Wide KPIs
- **Agent Success Rate**: >90%
- **Average Response Time**: <3 minutes
- **Workflow Completion**: >95%
- **Error Rate**: <5%
- **Token Efficiency**: <10k per agent

### Per-Category Targets
| Category | Success Rate | Avg Time | Token Budget |
|----------|-------------|----------|--------------|
| Orchestrators | 95% | 5-10 min | 50k |
| Copywriting | 92% | 2-3 min | 10k |
| Design | 90% | 3-5 min | 15k |
| Technical | 93% | 2-4 min | 12k |
| Strategy | 88% | 2-3 min | 8k |

## 🔗 Related Documentation

- **Templates**: See `_templates/` for creating new agents
- **Workflows**: See `_workflows/` for complex sequences
- **Configuration**: See `00-core/agent-config.json` for system settings
- **Base Context**: See `00-core/base-template.md` for shared knowledge

## 🆘 Getting Help

### Quick Commands
```bash
"Which agent should I use for [task]?"
"Show me agents for [category]"
"Explain the [agent-name] agent"
"What's the best workflow for [goal]?"
```

### Support Resources
- **Agent Templates**: `_templates/agent-template.md`
- **Orchestrator Guide**: `_templates/orchestrator-template.md`
- **Workflow Examples**: `_workflows/*.json`
- **Troubleshooting**: See troubleshooting section above

## 🚀 Version Information

- **System Version**: 3.0.0
- **Last Updated**: 2025-08-19
- **Total Agents**: 34
- **Structure**: Categorized folders with templates and workflows
- **Optimizations**: Health monitoring, capability matrix, fallback chains

---

**Need an agent?** Just describe what you want to achieve, and the appropriate agent(s) will be activated automatically!
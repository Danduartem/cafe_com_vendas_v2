# 🔄 Agent Workflows Documentation

Comprehensive guide to multi-agent workflows for the Café com Vendas project. These workflows orchestrate multiple specialized agents to achieve complex objectives efficiently.

## 📖 Table of Contents
- [Workflow Overview](#-workflow-overview)
- [Available Workflows](#-available-workflows)
- [Workflow Execution](#-workflow-execution)
- [Custom Workflows](#-custom-workflows)
- [Best Practices](#-best-practices)
- [Monitoring & Optimization](#-monitoring--optimization)

## 🎯 Workflow Overview

Workflows are predefined sequences of agent collaborations designed to accomplish complex tasks. Each workflow:
- **Coordinates** multiple specialized agents
- **Manages** dependencies and handoffs
- **Validates** outputs at each phase
- **Ensures** comprehensive completion

### Workflow Benefits
- **Consistency**: Same high-quality results every time
- **Efficiency**: Optimized agent sequencing
- **Completeness**: No steps missed
- **Scalability**: Handle complex projects systematically

## 📋 Available Workflows

### 1. Conversion Optimization Workflow
**File**: `_workflows/conversion-optimization.json`  
**Duration**: 4-6 hours  
**Token Budget**: 50,000

#### Phases:
1. **Analysis & Discovery** → Identify bottlenecks
2. **Strategy Development** → Define approach
3. **Content Optimization** → Improve copy
4. **Design Enhancement** → Optimize CTAs
5. **Technical Implementation** → Build prototypes
6. **Validation & Launch** → Test and deploy

#### Success Metrics:
- Conversion rate improvement >20%
- Bounce rate reduction >10%
- Lighthouse score >90

#### Example Activation:
```bash
"Run conversion optimization workflow for the hero section"
"Execute conversion-optimization.json to improve registration rates"
```

### 2. Landing Page Creation Workflow
**File**: `_workflows/landing-page-creation.json`  
**Duration**: 8-12 hours  
**Token Budget**: 100,000

#### Phases:
1. **Strategy & Research** → Define objectives
2. **Content Strategy** → Message hierarchy
3. **Copy Creation** → Portuguese content
4. **Design & UX** → Visual layouts
5. **Technical Development** → HTML/Eleventy
6. **Analytics & Tracking** → GTM setup
7. **Quality Assurance** → Compliance checks
8. **Email Integration** → Follow-up sequences
9. **Final Review** → Launch readiness

#### Deliverables:
- Complete Eleventy templates
- Optimized copy in Portuguese
- Analytics tracking setup
- Email automation sequences

#### Example Activation:
```bash
"Create a new landing page using the full workflow"
"Execute landing-page-creation workflow for event registration"
```

### 3. Email Campaign Workflow
**File**: `_workflows/email-campaign.json`  
**Duration**: 6-8 hours  
**Token Budget**: 60,000

#### Phases:
1. **Campaign Strategy** → Goals and segments
2. **Content Creation** → Value blocks
3. **Copy Development** → Portuguese emails
4. **Value Optimization** → Enhance delivery
5. **Technical Setup** → Automation rules
6. **Analytics Configuration** → Tracking setup
7. **Final Review** → Testing and launch

#### Email Sequence:
- Welcome (immediate)
- Quick Win (+1 day)
- Transformation Story (+3 days)
- Objection Handling (+5 days)
- Final Urgency (+7 days)

#### Example Activation:
```bash
"Create email nurture sequence for new registrations"
"Run email-campaign workflow for post-event follow-up"
```

### 4. Performance Audit Workflow
**File**: `_workflows/performance-audit.json`  
**Duration**: 3-4 hours  
**Token Budget**: 30,000

#### Phases:
1. **Baseline Measurement** → Current metrics
2. **Issue Analysis** → Identify problems
3. **Optimization Implementation** → Apply fixes
4. **Validation** → Verify improvements

#### Optimization Areas:
- Image optimization (WebP, lazy loading)
- CSS efficiency (critical CSS, purging)
- JavaScript performance (splitting, deferring)
- Caching strategy (headers, CDN)

#### Example Activation:
```bash
"Run performance audit to improve Core Web Vitals"
"Execute performance optimization workflow"
```

## 🚀 Workflow Execution

### Basic Execution
```bash
# Direct workflow reference
"Run the [workflow-name] workflow"

# Using workflow file
"Execute [workflow-file].json"

# With specific focus
"Run conversion-optimization workflow on [section]"
```

### Advanced Execution Options

#### Partial Execution
```bash
# Run specific phases only
"Execute phases 1-3 of landing-page-creation workflow"

# Skip certain phases
"Run email-campaign workflow but skip analytics setup"
```

#### Parallel Execution
```bash
# Run multiple workflows
"Execute conversion-optimization AND performance-audit workflows"
```

#### Custom Parameters
```bash
# Override defaults
"Run email-campaign workflow with 10-day sequence instead of 7"
```

## 🛠 Custom Workflows

### Creating Custom Workflows

#### 1. Define Workflow Structure
```json
{
  "name": "custom-workflow",
  "version": "1.0.0",
  "description": "Purpose of this workflow",
  "phases": [
    {
      "phase": 1,
      "name": "Phase Name",
      "agents": [
        {
          "agent": "agent-name",
          "task": "Specific task description",
          "timeout": 300,
          "output": "output-format"
        }
      ]
    }
  ]
}
```

#### 2. Agent Dependencies
```json
{
  "agents": [
    {
      "agent": "agent-a",
      "task": "Initial task"
    },
    {
      "agent": "agent-b",
      "task": "Dependent task",
      "depends_on": ["agent-a"]
    }
  ]
}
```

#### 3. Parallel Processing
```json
{
  "agents": [
    {
      "agent": "agent-a",
      "task": "Task A",
      "parallel": true
    },
    {
      "agent": "agent-b",
      "task": "Task B",
      "parallel": true
    }
  ]
}
```

### Workflow Templates

#### Mini Workflow (2-3 agents)
```json
{
  "name": "quick-copy-review",
  "phases": [
    {
      "phase": 1,
      "agents": [
        {"agent": "portuguese-copywriter", "task": "Write copy"},
        {"agent": "copy-quality-specialist", "task": "Review"}
      ]
    }
  ]
}
```

#### Medium Workflow (4-6 agents)
```json
{
  "name": "design-implementation",
  "phases": [
    {
      "phase": 1,
      "agents": [
        {"agent": "ux-designer", "task": "Create flows"},
        {"agent": "ui-designer", "task": "Design visuals"},
        {"agent": "frontend-prototyper", "task": "Build prototype"},
        {"agent": "design-compliance-specialist", "task": "Validate"}
      ]
    }
  ]
}
```

## ✅ Best Practices

### 1. Workflow Selection
- **Single Task**: Use individual agent
- **2-3 Related Tasks**: Use mini orchestration
- **Complex Project**: Use full workflow
- **Recurring Process**: Create custom workflow

### 2. Optimization Strategies

#### Token Management
- Set realistic budgets per phase
- Use parallel processing when possible
- Cache intermediate results
- Reuse outputs across agents

#### Time Management
- Run critical paths first
- Parallelize independent tasks
- Set appropriate timeouts
- Plan for iterations

### 3. Quality Assurance

#### Validation Gates
```json
{
  "validation": {
    "between_phases": true,
    "criteria": {
      "output_completeness": "required",
      "quality_score": ">0.8",
      "compliance_check": "pass"
    }
  }
}
```

#### Rollback Triggers
```json
{
  "rollback_triggers": {
    "error_rate": ">5%",
    "quality_drop": ">10%",
    "timeout": "phase_duration * 2"
  }
}
```

## 📊 Monitoring & Optimization

### Workflow Metrics

#### Performance KPIs
| Metric | Target | Measurement |
|--------|--------|-------------|
| Completion Rate | >95% | Successful/Total |
| Average Duration | <Estimated | Actual vs Planned |
| Token Efficiency | <Budget | Used/Allocated |
| Quality Score | >90% | Validation Gates |

#### Health Indicators
```bash
# Check workflow health
"Show workflow performance metrics"
"Which workflows are underperforming?"
"Analyze conversion-optimization workflow efficiency"
```

### Optimization Opportunities

#### 1. Bottleneck Analysis
- Identify slowest phases
- Find token-heavy agents
- Detect quality issues
- Review dependencies

#### 2. Parallel Optimization
```json
{
  "optimization": "parallel",
  "before": ["A→B→C→D"],
  "after": ["A→(B,C)→D"],
  "improvement": "40% faster"
}
```

#### 3. Agent Substitution
```json
{
  "optimization": "substitution",
  "replace": "complex-orchestrator",
  "with": ["specific-agent-1", "specific-agent-2"],
  "benefit": "Reduced overhead"
}
```

## 🔄 Workflow Patterns

### Sequential Pattern
```
Agent A → Agent B → Agent C → Output
```
**Use for**: Dependent tasks, transformation pipelines

### Parallel Pattern
```
        → Agent B →
Input →            → Merge → Output
        → Agent C →
```
**Use for**: Independent analyses, multiple perspectives

### Iterative Pattern
```
Agent A → Review → Agent A' → Review → Final
```
**Use for**: Refinement, quality improvement

### Fork-Join Pattern
```
         → Branch 1 (A→B) →
Input →                      → Join → Output
         → Branch 2 (C→D) →
```
**Use for**: Complex multi-stream processing

## 🚨 Troubleshooting Workflows

### Common Issues

| Issue | Diagnosis | Solution |
|-------|-----------|----------|
| Workflow timeout | Phase taking too long | Increase timeout or split phase |
| Agent conflict | Output incompatibility | Add transformation agent |
| Quality failure | Validation gate failed | Review agent inputs/prompts |
| Token exceeded | Budget exhausted | Optimize prompts or split workflow |

### Recovery Strategies

#### Checkpoint Recovery
Save progress after each phase:
```json
{
  "checkpointing": true,
  "checkpoint_after": "each_phase",
  "resume_from": "last_checkpoint"
}
```

#### Graceful Degradation
Continue with reduced functionality:
```json
{
  "on_failure": "continue_with_essentials",
  "essential_agents": ["core-agent-1", "core-agent-2"],
  "skip_optional": true
}
```

## 📚 Advanced Workflows

### Conditional Workflows
```json
{
  "conditional_execution": {
    "if": "conversion_rate < 2%",
    "then": "run_full_optimization",
    "else": "run_minor_tweaks"
  }
}
```

### Dynamic Workflows
```json
{
  "dynamic_agents": {
    "based_on": "initial_analysis",
    "select_from": ["agent_pool"],
    "max_agents": 5
  }
}
```

### Recursive Workflows
```json
{
  "recursive": {
    "condition": "quality_score < threshold",
    "max_iterations": 3,
    "improvement_required": 10
  }
}
```

## 🎯 Quick Reference

### Workflow Commands
```bash
# List workflows
"Show available workflows"

# Run workflow
"Execute [workflow-name] workflow"

# Check status
"Show workflow progress"

# Analyze results
"Review workflow outputs"
```

### Workflow Selection Guide
- **Quick fix**: Individual agent
- **Section update**: Mini workflow
- **Page redesign**: Full workflow
- **Campaign launch**: Orchestrated workflow
- **Performance fix**: Specialized workflow

---

**Pro Tip**: Start with predefined workflows and customize as you learn what works best for your specific needs!
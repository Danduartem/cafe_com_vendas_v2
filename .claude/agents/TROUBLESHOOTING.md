# 🚨 Agent Troubleshooting Guide

Comprehensive troubleshooting guide for resolving common issues with the Café com Vendas agent system.

## 📖 Table of Contents
- [Quick Diagnostics](#-quick-diagnostics)
- [Common Issues](#-common-issues)
- [Agent-Specific Problems](#-agent-specific-problems)
- [Workflow Issues](#-workflow-issues)
- [Performance Problems](#-performance-problems)
- [Error Messages](#-error-messages)
- [Recovery Procedures](#-recovery-procedures)
- [Prevention Strategies](#-prevention-strategies)

## 🔍 Quick Diagnostics

### System Health Check
```bash
# Run these commands to diagnose issues:
"Show agent health metrics"
"Check workflow status"
"Review recent agent errors"
"Analyze token usage"
```

### Diagnostic Decision Tree
```
Is the agent responding?
├─ No → Check agent activation syntax
│   └─ Still no → Try fallback agent
├─ Yes but slow → Check token budget
│   └─ Within budget → Split task
└─ Yes but wrong output → Review task clarity
    └─ Clear task → Check agent specialization
```

## 🔧 Common Issues

### Issue 1: Agent Not Activating

**Symptoms**:
- No response when calling agent
- "Agent not found" error
- Task executed by wrong agent

**Diagnosis**:
```bash
# Check agent name
"List available agents"
"Show agents in [category]"
```

**Solutions**:
1. Verify exact agent name (check spelling)
2. Use agent aliases: `copy` instead of `portuguese-copywriter`
3. Check if agent is in correct category folder
4. Try explicit activation: `"Use the [exact-agent-name] agent to..."`

**Prevention**:
- Use auto-complete when typing agent names
- Reference README.md for correct names
- Use category prefixes for clarity

### Issue 2: Slow Response Times

**Symptoms**:
- Agent takes >5 minutes for simple tasks
- Timeout errors
- Incomplete outputs

**Diagnosis**:
```bash
# Check performance metrics
"Show agent performance for [agent-name]"
"Check current token usage"
```

**Solutions**:
1. **Break down complex tasks**:
   ```bash
   # Instead of:
   "Create entire landing page"
   
   # Use:
   "Create hero section"
   "Create features section"
   ```

2. **Use parallel processing**:
   ```bash
   "Run portuguese-copywriter AND design-compliance-specialist in parallel"
   ```

3. **Increase timeout**:
   ```json
   {
     "agent": "complex-agent",
     "timeout": 600  // 10 minutes
   }
   ```

**Prevention**:
- Set realistic task scopes
- Use workflows for complex tasks
- Monitor token budgets

### Issue 3: Poor Output Quality

**Symptoms**:
- Generic or off-brand content
- Missing Portuguese localization
- Incorrect formatting

**Diagnosis**:
```bash
# Review agent configuration
"Show agent capabilities for [agent-name]"
"Check agent dependencies"
```

**Solutions**:
1. **Provide more context**:
   ```bash
   # Be specific:
   "Write a headline for Portuguese female entrepreneurs age 30-45 about overcoming burnout"
   ```

2. **Use quality review agents**:
   ```bash
   "Have copy-quality-specialist review the output"
   ```

3. **Chain specialized agents**:
   ```bash
   "First use angle-generator, then portuguese-copywriter"
   ```

**Prevention**:
- Always specify pt-PT for Portuguese content
- Reference brand guidelines explicitly
- Use review agents for quality assurance

## 🤖 Agent-Specific Problems

### Portuguese Copywriter Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Brazilian Portuguese output | Wrong locale | Specify "pt-PT" explicitly |
| Generic messaging | Lack of context | Reference DATA_avatar.json |
| Wrong tone | Brand voice unclear | Point to GUIDE_voice_tone.md |

### Design Compliance Specialist Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Missing token validation | Tokens not loaded | Check DATA_design_tokens.json |
| WCAG errors missed | Scope too broad | Focus on specific components |
| Brand inconsistency | Guidelines not referenced | Explicitly mention brand guide |

### Performance Auditor Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Incomplete metrics | Lighthouse timeout | Run in smaller chunks |
| Wrong optimization | Context missing | Specify target metrics |
| Breaking changes | Too aggressive | Set safety thresholds |

### Conversion Optimizer Issues

| Problem | Cause | Solution |
|---------|-------|----------|
| Generic recommendations | No baseline data | Provide current metrics |
| Unrealistic targets | Market context missing | Reference DATA_avatar.json |
| Missing tracking | GTM not configured | Run gtm-analytics-tracker first |

## 🔄 Workflow Issues

### Workflow Stuck/Hanging

**Symptoms**:
- No progress after phase completion
- Agents waiting indefinitely
- Circular dependencies

**Solutions**:
1. **Check phase status**:
   ```bash
   "Show workflow progress"
   "Which phase is currently active?"
   ```

2. **Skip problematic phase**:
   ```bash
   "Skip to phase 3 of current workflow"
   ```

3. **Restart from checkpoint**:
   ```bash
   "Resume workflow from last successful phase"
   ```

### Workflow Conflicts

**Symptoms**:
- Agents overwriting each other's work
- Conflicting recommendations
- Version control issues

**Solutions**:
1. **Sequential execution**:
   ```json
   {
     "parallel": false,
     "sequential": true
   }
   ```

2. **Clear handoff points**:
   ```json
   {
     "agent_a_output": "draft.md",
     "agent_b_input": "draft.md",
     "agent_b_output": "final.md"
   }
   ```

### Workflow Token Exhaustion

**Symptoms**:
- Workflow stops mid-execution
- "Token limit exceeded" error
- Incomplete deliverables

**Solutions**:
1. **Optimize token usage**:
   ```bash
   # Reduce scope
   "Run workflow on hero section only"
   
   # Skip non-essential phases
   "Run workflow without beauty-critic phase"
   ```

2. **Increase budget**:
   ```json
   {
     "token_budget": 100000  // Increase from default
   }
   ```

## ⚡ Performance Problems

### Memory Issues

**Symptoms**:
- Agents forgetting context
- Repeated questions
- Inconsistent outputs

**Solutions**:
- Use explicit context passing
- Reference shared documents
- Create summary documents between phases

### Concurrency Problems

**Symptoms**:
- Agents interfering with each other
- File lock errors
- Race conditions

**Solutions**:
```json
{
  "concurrency_control": {
    "max_parallel": 2,
    "file_locking": true,
    "queue_management": "FIFO"
  }
}
```

## 📝 Error Messages

### Common Error Codes

| Error | Meaning | Fix |
|-------|---------|-----|
| `AGENT_NOT_FOUND` | Invalid agent name | Check spelling/availability |
| `TOKEN_LIMIT_EXCEEDED` | Budget exhausted | Increase limit or reduce scope |
| `TIMEOUT_ERROR` | Task took too long | Increase timeout or simplify |
| `DEPENDENCY_MISSING` | Required agent not run | Run prerequisite first |
| `VALIDATION_FAILED` | Output doesn't meet standards | Review requirements |
| `LOCALE_MISMATCH` | Wrong language/region | Specify pt-PT |
| `FILE_NOT_FOUND` | Missing data file | Check file paths |
| `PERMISSION_DENIED` | Access restriction | Check file permissions |

### Error Response Templates

```bash
# When you see: "Agent failed to complete task"
Try: "Show error details for last agent run"
Then: "Run [fallback-agent] instead"

# When you see: "Workflow validation failed"
Try: "Show validation errors"
Then: "Fix issues and retry phase"

# When you see: "Output format mismatch"
Try: "Show expected output format"
Then: "Rerun with correct format specification"
```

## 🔄 Recovery Procedures

### Agent Recovery

1. **Immediate Recovery**:
   ```bash
   # Try fallback agent
   "Use fallback agent for [original-agent]"
   
   # Retry with increased resources
   "Retry with 2x timeout"
   ```

2. **Manual Override**:
   ```bash
   # Skip problematic agent
   "Continue workflow without [agent-name]"
   
   # Use simplified version
   "Run [agent-name] in basic mode"
   ```

### Workflow Recovery

1. **Checkpoint Recovery**:
   ```bash
   "Resume from last checkpoint"
   "Show available checkpoints"
   "Restore checkpoint [timestamp]"
   ```

2. **Partial Execution**:
   ```bash
   "Complete remaining phases only"
   "Run phases 4-6 independently"
   ```

### Data Recovery

1. **Backup Restoration**:
   ```bash
   "Restore from backup"
   "Show available backups"
   ```

2. **Regeneration**:
   ```bash
   "Regenerate lost outputs"
   "Rebuild from source data"
   ```

## 🛡 Prevention Strategies

### Best Practices Checklist

#### Before Running Agents:
- [ ] Verify agent names and availability
- [ ] Check token budget adequacy
- [ ] Ensure data files exist
- [ ] Specify locale (pt-PT) explicitly
- [ ] Set appropriate timeouts

#### During Execution:
- [ ] Monitor progress regularly
- [ ] Save checkpoints for long workflows
- [ ] Validate intermediate outputs
- [ ] Watch for warning signs

#### After Completion:
- [ ] Verify all outputs generated
- [ ] Check quality standards met
- [ ] Document any issues
- [ ] Update health metrics

### Proactive Monitoring

```bash
# Set up monitoring
"Enable agent health monitoring"
"Set alert threshold for errors > 5%"
"Track token usage trends"

# Regular maintenance
"Run weekly health check"
"Clean up old checkpoints"
"Update agent configurations"
```

### Configuration Optimization

```json
{
  "optimization_settings": {
    "auto_retry": true,
    "max_retries": 3,
    "fallback_enabled": true,
    "checkpointing": true,
    "validation_strict": false,
    "timeout_multiplier": 1.5
  }
}
```

## 🆘 Emergency Procedures

### System-Wide Failure

1. **Stop all workflows**:
   ```bash
   "Halt all running workflows"
   ```

2. **Check system status**:
   ```bash
   "Run full system diagnostic"
   ```

3. **Gradual restart**:
   ```bash
   "Start with simple agent test"
   "Gradually increase complexity"
   ```

### Corruption Recovery

1. **Identify corruption**:
   ```bash
   "Validate all agent files"
   "Check configuration integrity"
   ```

2. **Restore from template**:
   ```bash
   "Restore agent from template"
   "Rebuild configuration from defaults"
   ```

## 📊 Diagnostic Tools

### Built-in Commands
```bash
# System health
"diagnose system health"
"show recent errors"
"analyze performance trends"

# Agent diagnostics
"test agent [name]"
"validate agent configuration"
"check agent dependencies"

# Workflow diagnostics
"trace workflow execution"
"show workflow bottlenecks"
"analyze workflow efficiency"
```

### Logging and Debugging
```json
{
  "debug_settings": {
    "verbose_logging": true,
    "trace_execution": true,
    "save_intermediate": true,
    "performance_profiling": true
  }
}
```

## 📚 Additional Resources

### Quick Reference Card
```
Problem → Solution Map:
- Not responding → Check name/syntax
- Too slow → Split task/increase timeout
- Wrong output → Add context/use correct agent
- Token limit → Reduce scope/increase budget
- Quality issues → Add review step
- Conflicts → Sequential execution
- Lost context → Explicit passing
```

### Support Escalation
1. Check this troubleshooting guide
2. Review agent-specific documentation
3. Consult workflow documentation
4. Check agent templates for examples
5. Create custom solution if needed

---

**Remember**: Most issues can be resolved by:
1. Providing clearer instructions
2. Using the right agent for the task
3. Breaking complex tasks into smaller pieces
4. Following the established workflows
# Claude Code Hooks

Automation scripts for Claude Code development workflow.

## Active Hooks

### `context7-reminder.sh`
**When:** After editing files  
**Purpose:** Smart Context7 suggestions with token optimization

- Detects library/API usage in your files
- Suggests Context7 commands with optimized token limits (1500-3000 vs 10K default)
- Prioritizes Stripe and other revenue-critical APIs
- Covers all project dependencies and external APIs

### `session-info.sh`
**When:** Session start  
**Purpose:** Project overview with library versions and Context7 guidance

### `auto-format-posttool.sh`
**When:** After writing/editing files  
**Purpose:** Auto-format with ESLint

## How to Use

When you see suggestions like:
```bash
🔴 REVENUE-CRITICAL: Use Context7 for latest Stripe patterns
💡 Context7 Quick: mcp__context7__resolve-library-id 'stripe'
🎯 Suggested topic: 'checkout sessions and payment methods' (2500 tokens)
```

Just copy and run the commands. The hooks give you optimized settings automatically.

## Quick Reference

| Library | Tokens | Topic |
|---------|--------|-------|
| Stripe | 2500 | "checkout sessions" |
| Tailwind | 1500 | "v4 utilities" |
| Eleventy | 2000 | "templates" |
| ESLint | 2000 | "flat config" |
| TypeScript | 1500 | "compiler options" |

## Why This Works

- Always get current documentation (no deprecated APIs)
- Use 70% fewer Context7 tokens through targeted topics
- Business-aware prioritization (Stripe gets special attention)
- Comprehensive coverage of all dependencies and external APIs

The hooks handle Context7 optimization automatically - just follow their suggestions.
# Claude Code Hooks

This directory contains automation scripts for Claude Code events.

## ✅ Active Hooks

### `auto-format-posttool.sh`
**Event:** `PostToolUse` (Write|Edit)  
**Purpose:** Automatically formats files after Claude writes/edits them using ESLint  
**Status:** ✅ **Safe as hook** - follows all best practices

- Scoped to changed files only (git diff based)
- Fast execution with safety caps (max 200 files)
- **NEW: Parallel processing** for >10 files (4 concurrent processes, 5 files per batch)
- Uses project's ESLint configuration for consistency
- Handles TypeScript, JavaScript, CSS, JSON, Markdown, and Nunjucks files

### `session-info.sh`
**Event:** `SessionStart`  
**Purpose:** Consolidated display of project libraries and critical external APIs  
**Status:** ✅ **Safe as hook** - optimized and cached

- **NEW: Smart caching** - only regenerates when package.json changes
- Combines library version info with business-critical API reminders
- Fast startup (cached output displays instantly)
- Context7 integration guidance for latest documentation

### `context7-reminder.sh`
**Event:** `PreToolUse` (Edit|MultiEdit|Write)  
**Purpose:** Context-aware reminders for external APIs and Context7 integration  
**Status:** ✅ **Safe as hook** - streamlined for efficiency

- **UPDATED: Reduced redundancy** with session-start information
- Focuses on revenue-critical APIs (Stripe, MailerLite, etc.)
- Smart file path detection for targeted reminders
- Quick actionable links for external API documentation

## 📚 Best Practices

**Good for hooks:**
- ✅ Quick validations (< 2 seconds)
- ✅ Non-blocking operations
- ✅ No external API calls
- ✅ File formatting (local tools only)
- ✅ Context-aware reminders

**Better as commands/CI:**
- 🔧 AI code review
- 🔧 Complex analysis
- 🔧 External API integrations
- 🔧 Slow operations (> 5 seconds)

## 🚀 Recommended Workflow

1. **Development**: Use fast hooks for auto-formatting and context reminders
2. **Pre-commit**: Keep it minimal (linting, quick checks)
3. **Manual review**: Use explicit commands for AI-powered reviews
4. **CI/CD**: Integrate complex analysis in pipeline, not git hooks

This approach keeps your local development fast while maintaining code quality.
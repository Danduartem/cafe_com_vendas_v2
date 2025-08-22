# Claude Code Hooks

This directory contains automation scripts for Claude Code events.

## ✅ Active Hooks

### `notify-waiting.sh`
**Event:** `Notification`  
**Purpose:** Sends system notifications when Claude is waiting for user input  
**Status:** ✅ **Safe as hook** - follows all best practices

- Non-blocking and fast (< 1 second)
- Cross-platform (macOS, Linux, Windows)
- No repo modifications
- Minimal resource usage

### `auto-format-posttool.sh`
**Event:** `PostToolUse` (Write|Edit)  
**Purpose:** Automatically formats files after Claude writes/edits them using ESLint  
**Status:** ✅ **Safe as hook** - follows all best practices

- Scoped to changed files only (git diff based)
- Fast execution with safety caps (max 200 files)
- Uses project's ESLint configuration for consistency
- Handles TypeScript, JavaScript, CSS, JSON, Markdown, and Nunjucks files

## 📚 Best Practices

**Good for hooks:**
- ✅ Notifications and alerts
- ✅ Quick validations (< 2 seconds)
- ✅ Non-blocking operations
- ✅ No external API calls
- ✅ File formatting (local tools only)

**Better as commands/CI:**
- 🔧 AI code review
- 🔧 Complex analysis
- 🔧 External API integrations
- 🔧 Slow operations (> 5 seconds)

## 🚀 Recommended Workflow

1. **Development**: Use fast hooks for notifications and auto-formatting
2. **Pre-commit**: Keep it minimal (linting, quick checks)
3. **Manual review**: Use explicit commands for AI-powered reviews
4. **CI/CD**: Integrate complex analysis in pipeline, not git hooks

This approach keeps your local development fast while maintaining code quality.
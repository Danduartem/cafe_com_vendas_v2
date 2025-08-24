/commit (interactive)
---
description: Interactive conventional commit following repository workflow and Claude Code best practices.
argument-hint: [message] [--quick|--thorough|--no-verify]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git restore:*), Bash(git commit:*), Bash(npm run *), Bash(git log:*)
model: claude-sonnet
---

# /commit - Repository-Aware Interactive Commit

Create intelligent conventional commits following the **Café com Vendas workflow** and Claude Code best practices.

## Usage
```
/commit                    # Interactive mode with smart analysis
/commit "message"          # Direct commit with verification
/commit --quick           # Fast mode, minimal checks
/commit --thorough        # Full verification including tests
/commit --no-verify       # Skip verification (emergency use)
```

## Context Check
- Branch: !`git branch --show-current`
- Staged files: !`git diff --name-only --cached`
- Modified files: !`git status --porcelain`

## Workflow (follows CLAUDE.md plan → apply → verify)

### 1) **Explore Phase** - Analyze Changes
- Show current repository state and staged changes
- Identify change categories (feat, fix, chore, etc.)
- Detect special contexts (payments, analytics, accessibility)
- Check for potential issues or missing files

### 2) **Plan Phase** - Smart Commit Strategy
- Suggest appropriate commit type and scope
- Recommend verification level based on changes
- Identify if changes should be split into multiple commits
- Warn about special considerations (payment flows, breaking changes)

### 3) **Verify Phase** - Repository Quality Gates
Execute verification based on CLAUDE.md standards:

**Always run:** 
```bash
npm run type-check && npm run lint
```

**Conditional checks:**
- **Test changes detected**: Run `npm run test`
- **Payment files touched**: Show STRIPE_TEST_CARDS.md reminder
- **UI/Performance changes**: Suggest `npx lighthouse` check
- **Analytics changes**: Verify `payment_completed` event tracking
- **Accessibility changes**: Remind about semantic HTML and keyboard support

**Skip verification only if:**
- `--no-verify` flag is used
- Emergency hotfix scenario (must be explicitly confirmed)

### 4) **Commit Phase** - Repository-Aware Messages

Generate conventional commits with appropriate emoji and scope:

**Project-specific types:**
- ✨ **feat**: New features or enhancements
- 🐛 **fix**: Bug fixes and corrections  
- 💳 **stripe**: Payment processing changes
- 📊 **analytics**: Tracking and measurement
- ♿ **a11y**: Accessibility improvements
- 🎨 **style**: Tailwind/design token changes
- ♻️ **refactor**: Code improvements without feature changes
- ⚡ **perf**: Performance optimizations
- 🔧 **chore**: Maintenance and tooling
- 📝 **docs**: Documentation updates
- 🧪 **test**: Test additions or modifications

**Smart scoping:**
- Detect component/section changes: `feat(checkout): add payment validation`
- Identify function changes: `fix(webhook): handle timeout errors`
- Recognize config changes: `chore(build): update TypeScript target`

## Repository-Specific Intelligence

### Payment Context Detection
If payment-related files are changed:
```
⚠️  Payment changes detected!
📖 Check: docs/STRIPE_TEST_CARDS.md
📖 Check: docs/PAYMENT_TESTING_SUMMARY.md
✅ Verify: payment_completed → GA4 purchase event
```

### TypeScript/ESM Compliance
- Verify `.js` extensions in TypeScript imports
- Check for proper ESM module usage
- Validate against repository's TS configuration

### Accessibility Compliance
If UI components are modified:
```
♿ Accessibility checkpoint:
- Semantic HTML elements used?
- Keyboard navigation working?
- Focus management implemented?
- Color contrast maintained?
```

## Error Recovery & Course Correction

**If verification fails:**
1. Show clear error explanation
2. Suggest specific fixes
3. Allow partial staging of working changes
4. Offer to continue with `--no-verify` if critical

**If commit message needs improvement:**
1. Analyze staged changes for better context
2. Suggest conventional commit improvements
3. Allow manual message editing
4. Validate message format before committing

## Implementation Rules

1. **Respect user staging** - Work with what's already staged, don't auto-stage
2. **Follow CLAUDE.md workflow** - Always plan before applying
3. **Be interactive** - Ask for clarification when needed
4. **Enable course-correction** - Allow users to fix issues and retry
5. **Provide context** - Explain why certain checks are important
6. **Stay consistent** - Use repository's established patterns and tools

---

*Aligned with Anthropic's Claude Code best practices and Café com Vendas repository standards.*
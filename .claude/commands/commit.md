/commit
---
description: Autonomous conventional commits - stages and commits ALL files with intelligent grouping
argument-hint: [--quick|--no-verify]
allowed-tools: Bash(git status:*), Bash(git diff:*), Bash(git add:*), Bash(git restore:*), Bash(git commit:*), Bash(npm run *), Bash(git log:*)
model: claude-sonnet
---

# /commit - Autonomous Conventional Commits

Automatically stage and commit ALL modified files with intelligent grouping following **Café com Vendas workflow** and Claude Code best practices.

## Usage
```
/commit                    # Commits ALL files automatically with intelligent grouping
/commit --quick           # Fast mode, minimal checks
/commit --no-verify       # Skip verification (emergency use)
```

## Context Check
- Branch: !`git branch --show-current`
- Staged files: !`git diff --name-only --cached`
- Modified files: !`git status --porcelain`

## File Grouping Logic

**Group 1: Implementation Changes (same commit)**
- Template files (.njk, .html)
- TypeScript/JavaScript (.ts, .js, .tsx)
- Stylesheets (.css, .scss) 
- Related files that implement the same feature

**Group 2: Content Updates (separate commit)**
- Data files in `src/_data/` (.json)
- Markdown content (.md)
- Copy/content changes

**Group 3: Configuration (separate commit)**
- Build configs (.eleventy.ts, vite.config.ts)
- Package management (package.json, package-lock.json)
- TypeScript config (tsconfig.json)

**Skip (never commit):**
- Local settings (.claude/settings.local.json)
- IDE settings (.vscode/settings.json)
- OS files (.DS_Store)

**Example commit sequence:**
1. `✨ feat(about): add nl2br filter for line break support` (implementation)
2. `📝 content(about): update bio with line breaks` (content)
3. `🔧 chore(build): update TypeScript config` (if changed)

## Workflow (follows CLAUDE.md plan → apply → verify)

### 1) **Analyze Phase** - Discover All Changes
- Show current repository state (all modified files)
- Identify change categories (feat, fix, chore, etc.) for each file
- Detect special contexts (payments, analytics, accessibility)
- Apply file grouping logic (defined above)

### 2) **Verify Phase** - Quality Gates
Execute verification based on CLAUDE.md standards before any commits:

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

### 3) **Commit Phase** - Autonomous Multi-Commit Loop

**Process ALL files with this loop:**
```
WHILE (uncommitted files exist):
  1. Analyze remaining files
  2. Select next logical group
  3. Stage the group
  4. Generate commit message
  5. Create commit
  6. Verify commit success
END WHILE
```

**Show final summary:** List all commits created

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


## Implementation Rules

1. **Auto-stage everything** - Stage all modified files, skip local/IDE settings
2. **Complete all commits** - Continue until no uncommitted files remain
3. **Make smart decisions** - Use grouping logic, never ask questions
4. **Handle errors gracefully** - Show error, continue with remaining groups
5. **Stay consistent** - Follow repository patterns and conventional commits

## Example Output

**Input:** 4 modified files detected
```
M .eleventy.ts
M src/_includes/sections/about/index.njk
M src/_data/sections/about.json
M .claude/settings.local.json
```

**Process:**
1. **Group 1 (Implementation):** `.eleventy.ts` + `about/index.njk`
2. **Group 2 (Content):** `about.json`
3. **Skip:** `.claude/settings.local.json`

**Output:** 2 commits created
```
✨ feat(eleventy): add nl2br filter for line break support
📝 content(about): update bio with line breaks
```

**Final Result:** All files committed, repository clean

---

*Aligned with Anthropic's Claude Code best practices and Café com Vendas repository standards.*
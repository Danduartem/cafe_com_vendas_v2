---
description: Intelligently analyze git changes and create meaningful commits with conventional commit messages
allowed-tools: Bash(git:*), Read, Write, Edit, Grep
---

# Smart Commit

Analyze the current git status, understand the changes, and create meaningful commits with conventional commit messages following best practices.

## Process

1. **Analyze git status**:
   ```bash
   git status --porcelain
   git diff --stat
   ```

2. **Understand change context**:
   - Read modified files to understand the nature of changes
   - Identify the type of changes (feat, fix, refactor, docs, etc.)
   - Determine scope and impact of modifications
   - Check for breaking changes or major updates

3. **Smart staging strategy**:
   - Group related changes together
   - Stage files by logical change type
   - Handle untracked files appropriately
   - Separate concerns when multiple change types exist

4. **Generate conventional commit messages**:
   - **feat**: New features or enhancements
   - **fix**: Bug fixes and corrections
   - **refactor**: Code refactoring without feature changes
   - **docs**: Documentation updates
   - **style**: Code style changes (formatting, missing semicolons)
   - **chore**: Maintenance tasks (dependencies, config)
   - **perf**: Performance improvements
   - **test**: Adding or updating tests

5. **Commit with context**:
   - Use descriptive commit messages
   - Include scope when relevant (e.g., `feat(checkout): add payment validation`)
   - Add detailed body for complex changes
   - Reference issues or PRs when applicable

## Conventional Commit Format

```
<type>[optional scope]: <description>

[optional body]

[optional footer(s)]
```

## Smart Analysis Rules

### Change Type Detection
- **Package files**: Usually `chore(deps)` or `chore` 
- **Config files**: Usually `chore(config)` 
- **Source code logic**: `feat`, `fix`, or `refactor`
- **Documentation**: `docs`
- **Styling/CSS**: `style` or `feat(ui)`
- **Build/deployment**: `chore(build)` or `ci`

### Multi-change Strategy
- **Related changes**: Single commit with comprehensive message
- **Unrelated changes**: Separate commits for different concerns
- **Mixed scope**: Ask user for preferred grouping

### Safety Checks
- Verify all staged changes are intentional
- Check for sensitive information (API keys, credentials)
- Ensure commit message accurately reflects changes
- Warn about large file additions or deletions

## Advanced Features

### Automatic Scope Detection
- **Frontend**: `(ui)`, `(components)`, `(styles)`
- **Backend**: `(api)`, `(functions)`, `(server)`
- **Config**: `(config)`, `(build)`, `(deploy)`
- **Data**: `(content)`, `(data)`, `(tokens)`

### Message Enhancement
- Include file count and change summary
- Mention breaking changes in footer
- Reference related commits when continuing work
- Add performance impact notes when relevant

### Contextual Intelligence
- **Landing page project**: Focus on conversion, performance, UX
- **Event-driven**: Reference event dates, deadlines, business goals
- **Marketing focus**: Emphasize user experience and conversion optimization

## Example Outputs

```bash
# Feature addition
git commit -m "feat(checkout): add payment validation and error handling

- Implement client-side form validation
- Add Stripe payment error messaging
- Improve checkout UX with loading states
- Update analytics tracking for payment events"

# Configuration update
git commit -m "chore(config): update Node.js to v22.17.1 across all environments

- Update .nvmrc, package.json engines, and netlify.toml
- Ensure consistency between local and deployment environments
- Optimize for Vite 7 performance improvements"

# Content/styling update
git commit -m "feat(ui): enhance hero section conversion elements

- Improve CTA button styling and positioning
- Update testimonial layout for better social proof
- Optimize mobile responsive design
- Refine typography for better readability"
```

## Git Best Practices Applied

- **Atomic commits**: Each commit represents one logical change
- **Clear messages**: Descriptive and actionable commit messages
- **Conventional format**: Consistent message structure for automation
- **Meaningful scope**: Context-aware scope detection
- **Change grouping**: Related changes committed together

## Notes

This command adapts to your project's git state and change patterns. It prioritizes business context (conversion optimization, event marketing) while maintaining technical precision. Perfect for the Café com Vendas landing page project with its focus on performance and conversion optimization.

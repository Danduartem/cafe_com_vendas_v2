# Claude Command: Commit

Smart commit workflow for Café com Vendas landing page with conventional commit messages and focused emoji set.

## Usage

To create a commit, just type:
```
/commit
```

Or with options:
```
/commit --no-verify
```

## What This Command Does

1. Unless specified with `--no-verify`, automatically runs pre-commit checks:
   - `npm run lint` to ensure code quality
   - `npm run build` to verify the build succeeds  
   - `npm run tokens:build` to update design tokens
2. Checks which files are staged with `git status`
3. If 0 files are staged, automatically adds all modified and new files with `git add`
4. Performs a `git diff` to understand what changes are being committed
5. Analyzes the diff to determine if multiple distinct logical changes are present
6. If multiple distinct changes are detected, suggests breaking the commit into multiple smaller commits
7. For each commit (or the single commit if not split), creates a commit message using emoji conventional commit format

## Best Practices for Commits

- **Verify before committing**: Ensure code is linted, builds correctly, and documentation is updated
- **Atomic commits**: Each commit should contain related changes that serve a single purpose
- **Split large changes**: If changes touch multiple concerns, split them into separate commits
- **Conventional commit format**: Use the format `<type>: <description>` where type is one of:
  - `feat`: A new feature
  - `fix`: A bug fix
  - `docs`: Documentation changes
  - `style`: Code style changes (formatting, etc)
  - `refactor`: Code changes that neither fix bugs nor add features
  - `perf`: Performance improvements
  - `test`: Adding or fixing tests
  - `chore`: Changes to the build process, tools, etc.
- **Present tense, imperative mood**: Write commit messages as commands (e.g., "add feature" not "added feature")
- **Concise first line**: Keep the first line under 72 characters
- **Emoji**: Each commit type is paired with an appropriate emoji focused on landing page development:
  - ✨ `feat`: New features and functionality
  - 🐛 `fix`: Bug fixes and hotfixes
  - 📝 `docs`: Documentation updates
  - 🎨 `style`: UI/styling and Tailwind changes
  - ♻️ `refactor`: Code improvements and cleanup
  - ⚡ `perf`: Performance optimizations
  - 💳 `stripe`: Payment integration and Stripe updates
  - 🌍 `i18n`: Portuguese content and localization
  - 📊 `analytics`: Conversion tracking and analytics
  - 🚀 `deploy`: Deployment and Netlify configuration
  - ♿ `a11y`: Accessibility improvements (WCAG AA)
  - 🔧 `chore`: Build tools, dependencies, and maintenance

## Guidelines for Splitting Commits

When analyzing the diff, consider splitting commits based on these criteria:

1. **Different concerns**: Changes to unrelated parts of the codebase
2. **Different types of changes**: Mixing features, fixes, refactoring, etc.
3. **File patterns**: Changes to different types of files (e.g., source code vs documentation)
4. **Logical grouping**: Changes that would be easier to understand or review separately
5. **Size**: Very large changes that would be clearer if broken down

## Examples

Good commit messages for Café com Vendas:
- ✨ feat: add testimonials carousel with Portuguese reviews
- 🐛 fix: resolve mobile hero section layout on iOS Safari
- 📝 docs: update CLAUDE.md with latest performance targets
- 🎨 style: improve CTA button contrast for WCAG AA compliance
- ♻️ refactor: extract hero component for better maintainability
- ⚡ perf: optimize Cloudinary images for 50% faster loading
- 💳 stripe: implement 3D Secure for Portuguese payment methods
- 🌍 i18n: update event details for September 2025 Lisbon event
- 📊 analytics: add GTM tracking for registration funnel analysis
- 🚀 deploy: configure Netlify Functions for Stripe webhooks
- ♿ a11y: improve FAQ accordion keyboard navigation
- 🔧 chore: update design tokens for new gold color palette

Example of splitting commits for landing page updates:
- First commit: 🌍 i18n: update event pricing from €2,200 to €2,500
- Second commit: 📝 docs: sync DATA_event.json with new pricing
- Third commit: 🎨 style: adjust pricing section typography
- Fourth commit: 💳 stripe: update payment amounts for new pricing
- Fifth commit: 📊 analytics: add conversion tracking for pricing changes
- Sixth commit: ⚡ perf: run Lighthouse audit after pricing updates

## Command Options

- `--no-verify`: Skip running the pre-commit checks (lint, build, generate:docs)

## Important Notes

- By default, pre-commit checks (`npm run lint`, `npm run build`, `npm run tokens:build`) will run to ensure code quality
- If these checks fail, you'll be asked if you want to proceed with the commit anyway or fix the issues first
- Design tokens are automatically rebuilt to ensure CSS is in sync with JSON changes
- Landing page specific validations include Tailwind CSS compliance and accessibility checks
- If specific files are already staged, the command will only commit those files
- If no files are staged, it will automatically stage all modified and new files
- The commit message will be constructed based on the changes detected
- Before committing, the command will review the diff to identify if multiple commits would be more appropriate
- If suggesting multiple commits, it will help you stage and commit the changes separately
- Always reviews the commit diff to ensure the message matches the changes

## Café com Vendas Specific Guidelines

- **Event content changes**: Use `🌍 i18n:` for Portuguese content updates
- **Stripe integration**: Use `💳 stripe:` for payment-related changes
- **Performance work**: Use `⚡ perf:` and run Lighthouse audit after
- **Design system**: Use `🔧 chore:` for token updates, `🎨 style:` for component styling
- **Accessibility**: Use `♿ a11y:` for WCAG AA compliance improvements
- **Analytics**: Use `📊 analytics:` for GTM and conversion tracking changes
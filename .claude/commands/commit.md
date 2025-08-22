# /commit

Smart git commit with conventional format and automatic staging.

## Usage
```
/commit
/commit --no-verify  # Skip pre-commit checks
```

## What it does
1. **Quality Gates**: Runs `npm run type-check && npm run lint` (unless --no-verify)
2. **Staging Check**: Reviews staged files with `git status`
3. **Auto-stage**: If nothing staged, adds all changes with `git add .`
4. **Smart Analysis**: Analyzes file changes to create intelligent commit message
5. **Conventional Format**: Commits with emoji + conventional format
6. **Split Detection**: Suggests separate commits for unrelated changes

## Commit Format
```
<emoji> <type>: <description>

[optional body]
```

## Types & Emojis
- ✨ `feat`: New feature
- 🐛 `fix`: Bug fix  
- 📝 `docs`: Documentation
- 🎨 `style`: UI/styling changes
- ♻️ `refactor`: Code refactoring
- ⚡ `perf`: Performance improvement
- 🧪 `test`: Tests
- 🔧 `chore`: Maintenance
- 💳 `stripe`: Payment updates
- 🌍 `i18n`: Portuguese content
- 📊 `analytics`: Tracking changes
- ♿ `a11y`: Accessibility

## Examples
```
✨ feat: add testimonials carousel
🐛 fix: resolve mobile layout issue  
🎨 style: improve CTA button contrast
⚡ perf: optimize image loading
🌍 i18n: update event pricing
```

## Auto-splitting
If multiple unrelated changes detected, suggests splitting into separate commits for better history.
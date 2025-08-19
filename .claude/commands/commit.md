# /commit

Smart git commit with conventional format and automatic staging.

## Usage
```
/commit
/commit --no-verify  # Skip pre-commit checks
```

## What it does
1. Runs `npm run build` to verify build (unless --no-verify)
2. Checks staged files with `git status`
3. If nothing staged, adds all changes with `git add .`
4. Analyzes changes to create smart commit message
5. Commits with conventional format

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
# Generated CSS Files

⚠️ **DO NOT EDIT MANUALLY** ⚠️

This directory contains CSS files that are automatically generated from design tokens and other sources.

## Regenerating Files

To regenerate the files in this directory, run:

```bash
npm run tokens:build
```

## Files in this directory

- `tokens.css` - Generated from `design/tokens.json` containing CSS custom properties for colors, typography, and semantic tokens

## Important Notes

- Any manual changes to files in this directory will be lost when the build process runs
- Always edit the source files (like `design/tokens.json`) instead of the generated output
- This directory is excluded from version control via `.gitignore`
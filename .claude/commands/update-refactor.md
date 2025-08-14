---
description: Refactor codebase to leverage latest framework features and best practices
allowed-tools: Read, Write, Edit, Bash(npm run:*), Glob, Grep
---

# Update Refactor

Analyze and refactor the codebase to take full advantage of the latest framework features and modern best practices after updating dependencies. Use the `/CLAUDE.md` file as a reference guide.

## Refactoring Strategy

### 1. Build Tool Optimizations
- Review build configuration files for new features
- Optimize build settings for better performance
- Leverage new APIs and capabilities if available
- Update import patterns for better tree-shaking
- Optimize asset handling and bundling

### 2. Framework Enhancements
- Optimize usage of your project's framework features
- Apply new patterns and best practices
- Improve data handling and state management
- Leverage new template engine or rendering features
- Update configuration to use modern syntax

### 3. CSS/Styling Modernization
- Review styling approach for new features
- Use new utility classes or properties if available
- Optimize custom property and variable usage
- Clean up deprecated patterns or classes
- Improve responsive design patterns

### 4. JavaScript Modernization
- Update module patterns for better performance
- Optimize component initialization and lifecycle
- Improve event handling and DOM manipulation
- Apply modern ES6+ features consistently
- Enhance error handling and logging

### 5. Performance Optimizations
- Analyze bundle sizes and optimize imports
- Implement better code splitting strategies
- Optimize asset loading and caching
- Review and improve animation performance
- Minimize runtime overhead

## Process

1. **Analyze current code patterns**:
   - Read all configuration files
   - Review JavaScript/TypeScript modules
   - Check CSS and styling organization
   - Assess template and component structure

2. **Identify improvement opportunities**:
   - Compare current patterns with modern best practices
   - Find deprecated or suboptimal code patterns
   - Look for performance bottlenecks
   - Identify opportunities for modernization

3. **Apply refactoring changes**:
   - Update configurations with new features
   - Modernize code patterns and syntax
   - Optimize styling and performance
   - Improve project organization

4. **Verify improvements**:
   - Test build process thoroughly
   - Run development server and test functionality
   - Check for any regressions or breaking changes
   - Validate performance improvements

## Universal Focus Areas

- **Configuration files**: Build tools, frameworks, processors
- **Source code**: JavaScript, TypeScript, or other languages used
- **Styling**: CSS, preprocessors, utility frameworks
- **Templates**: Whatever templating engine the project uses
- **Assets**: Images, fonts, and other static resources

## Expected Benefits

- Better build and runtime performance
- Smaller bundle sizes and faster loading
- Modern, maintainable code patterns
- Improved developer experience
- Enhanced user experience
- Better framework feature utilization

## Notes

This command adapts to your project structure. Refer to CLAUDE.md for project-specific patterns, critical files, and modernization priorities. Run this after `/update-libs` to ensure you're leveraging the latest capabilities of your updated dependencies.
---
description: Update all project dependencies to latest stable versions with safety checks
allowed-tools: Bash(npm:*), Bash(git:*), Read, Write, Edit
---

# Update Libraries

Update all project dependencies to their latest stable versions while maintaining compatibility.

## Process

1. **Check outdated packages**:
   ```bash
   npm outdated
   ```

2. **Update dependencies strategically**:
   ```bash
   npm update
   ```
   For major version updates that require careful consideration:
   ```bash
   npm install package-name@latest
   ```

3. **Test project compatibility**:
   - Run the project's build command (check CLAUDE.md or package.json scripts)
   - Test development server functionality  
   - Verify all features work as expected

4. **Update documentation**:
   - Update version references in CLAUDE.md if they exist
   - Generate new version manifest if project has this capability
   - Update any other documentation that references specific versions

5. **Commit changes**:
   Create a meaningful commit with updated dependencies and documentation.

## Smart Update Strategy

- **Patch/Minor updates**: Generally safe to apply automatically
- **Major updates**: Review changelog for breaking changes first
- **Build tools**: Test thoroughly after updates
- **Frameworks**: Check for migration guides
- **Dependencies**: Update one major package at a time when possible

## Safety Checks

- Always test the build/dev server after updates
- Check for breaking changes in major version updates
- Review migration guides for significant framework updates
- Maintain Node.js version compatibility as required by your build tools
- Keep backup of working state before major updates

## Notes

This command works with any JavaScript/Node.js project structure. Refer to CLAUDE.md for project-specific build commands, documentation locations, and critical dependencies to monitor.
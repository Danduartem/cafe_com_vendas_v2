---
description: Intelligently sync all project documentation with current codebase state and best practices
allowed-tools: Read, Write, Edit, Bash(npm:*), Bash(git:*), Grep, Glob
---

# Update Documentation

Comprehensively update all project documentation to reflect current codebase state, dependencies, and architecture while maintaining business context and brand consistency.

## Documentation Audit Process

### 1. **Codebase State Analysis**
- Scan `package.json` for current dependencies and scripts
- Check actual project structure vs documented structure
- Identify new components, features, or architectural changes
- Review recent git commits for undocumented changes
- Analyze build configuration and deployment setup

### 2. **Version & Dependency Sync**
- Update all tech stack version references across documentation
- Sync npm script commands in all docs with actual `package.json`
- Update Node.js version requirements across all files
- Refresh framework and library version numbers
- Update deployment configuration references

### 3. **Architecture Documentation**
- **File structure diagrams**: Sync with actual folder/file organization
- **Component architecture**: Update based on current implementation
- **Data flow**: Verify data file → build process → output accuracy
- **Integration points**: Document current API integrations and services

### 4. **Documentation File Updates**

#### Primary Technical Documentation
- **`README.md`**: Project overview, quick start, tech stack
- **`CLAUDE.md`**: Claude-specific development guidelines and versions
- **`info/BUILD_landing_page.md`**: Technical implementation details

#### Business & Content Documentation  
- **`info/GUIDE_claude_instructions.md`**: Claude context and project priorities
- **`info/GUIDE_voice_tone.md`**: Brand voice and messaging
- **`info/GUIDE_brand_visual.md`**: Visual brand guidelines

#### Version Control
- Update all file headers with current date (format: `version: YYYY-MM-DD`)
- Increment version numbers where applicable
- Add "Last updated" timestamps in content sections

### 5. **Content Accuracy Verification**

#### Script Commands
- Verify all `npm run` commands exist and work
- Update command descriptions to match actual functionality
- Remove deprecated or non-existent commands
- Add any new scripts that were introduced

#### Project Structure
- **File tree diagrams**: Match actual directory structure
- **Component lists**: Reflect current component organization
- **Asset organization**: Update to current assets folder structure
- **Build outputs**: Verify build artifact locations and names

#### Technical Details
- **Framework versions**: Update to current stable versions
- **API endpoints**: Document current Netlify function endpoints
- **Environment variables**: Update required env var documentation
- **Browser compatibility**: Update based on current build targets

## Smart Update Strategy

### Automated Detection
- **Outdated versions**: Compare doc versions with package.json/package-lock.json
- **Missing scripts**: Find npm scripts not documented
- **New files**: Detect new components/modules not in file trees
- **Changed APIs**: Identify function signature or endpoint changes

### Context-Aware Updates
- **Business context**: Preserve marketing language and conversion focus
- **Technical precision**: Ensure accuracy without losing business context  
- **Consistency**: Maintain voice and terminology across all docs
- **Completeness**: Fill gaps in documentation coverage

### Multi-file Coordination
- **Cross-references**: Update file references between docs
- **Dependency chains**: Update when one doc references another
- **Consistent terminology**: Use same terms for same concepts across files
- **Version alignment**: Ensure all docs reference same dependency versions

## Quality Assurance

### Technical Accuracy
- Verify all code examples still work
- Test all npm commands mentioned in docs
- Validate file paths and directory structures
- Confirm API endpoint documentation matches implementation

### Business Alignment
- Preserve conversion-focused language and structure
- Maintain brand voice consistency (reference GUIDE_voice_tone.md)
- Keep business goals and metrics prominent
- Ensure marketing context remains intact

### Maintenance Standards
- Add comprehensive change logs when significant updates occur
- Include "why this changed" context for major architectural shifts
- Reference related commits or PRs for complex changes
- Update maintenance schedules and recommended update frequencies

## Specific Focus Areas

### High-Priority Sync Points
1. **Tech stack versions** (README.md, CLAUDE.md)
2. **npm scripts** (README.md, CLAUDE.md, BUILD_landing_page.md)
3. **Project structure** (README.md, CLAUDE.md, BUILD_landing_page.md)
4. **Component architecture** (CLAUDE.md, BUILD_landing_page.md)
5. **Build process** (CLAUDE.md, BUILD_landing_page.md)

### Business-Critical Elements
1. **Event details** (dates, pricing, logistics)
2. **Conversion metrics** and targets
3. **Customer persona** alignment
4. **Brand guidelines** consistency
5. **Marketing messaging** accuracy

### Development Workflow
1. **Environment setup** instructions
2. **Development commands** and their purposes
3. **Deployment process** documentation
4. **Troubleshooting guides** for common issues
5. **Code contribution** guidelines

## Advanced Features

### Documentation Health Checks
- **Link validation**: Verify all internal file references
- **Command validation**: Test all bash commands mentioned
- **Version consistency**: Ensure no conflicting version references
- **Completeness audit**: Identify missing documentation sections

### Auto-Generation Capabilities
- **Dependency lists**: Extract from package.json automatically
- **Script summaries**: Generate from package.json scripts
- **File trees**: Generate from actual directory structure
- **Component inventories**: List all actual components and modules

### Integration Awareness
- **Stripe integration**: Document current payment flow
- **Analytics setup**: Document tracking implementation
- **Email automation**: Document MailerLite integration
- **Deployment**: Document Netlify configuration and process

## Expected Outcomes

After running this command, all documentation will be:
- ✅ **Technically accurate** - reflects current codebase
- ✅ **Version current** - all dependencies and tools up to date
- ✅ **Structurally aligned** - file trees match reality
- ✅ **Business focused** - maintains conversion and marketing context
- ✅ **Developer friendly** - clear setup and development instructions
- ✅ **Consistently formatted** - unified style and terminology

## Notes

This command is specifically designed for the Café com Vendas project with its dual focus on technical excellence and conversion optimization. It maintains the business-critical marketing context while ensuring all technical documentation stays current and actionable.

Run this command whenever:
- Dependencies are updated
- Project structure changes
- New features or components are added
- Build process is modified
- Before major releases or deployments

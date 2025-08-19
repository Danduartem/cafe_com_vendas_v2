# /sync

Sync documentation with current code state.

## Usage
```
/sync                   # Sync all docs
/sync --readme         # Update README only
/sync --claude         # Update CLAUDE.md only
/sync --check          # Check without updating
```

## What it does
1. Scans current codebase
2. Identifies outdated info
3. Updates documentation
4. Syncs version numbers
5. Updates command lists
6. Fixes broken links

## Files Updated
- `README.md` - Project overview
- `CLAUDE.md` - AI context
- `package.json` - Scripts/deps
- `docs/*.md` - All docs
- `.claude/*.md` - Commands

## Checks Performed
- Script names match
- Dependencies current
- Environment vars documented
- File paths valid
- URLs working
- Examples runnable

## Output
```
📝 5 files updated
✓ README.md synced
✓ CLAUDE.md current
✓ Scripts verified
⚠ 2 broken links fixed
```
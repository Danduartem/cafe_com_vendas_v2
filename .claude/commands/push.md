# /push

Safe git push with automatic upstream and optional PR creation.

## Usage
```
/push                    # Push current branch
/push --pr              # Push and create PR
/push --force           # Force push (with lease)
```

## What it does
1. **Clean Check**: Ensures working tree is clean (no uncommitted changes)
2. **Remote Sync**: Fetches latest from remote to check for conflicts
3. **Upstream Setup**: Sets tracking branch if needed for new branches
4. **Safe Push**: Pushes with --force-with-lease for safety
5. **Preview Detection**: Automatically detects and shows Netlify preview URL
6. **PR Creation**: Optionally creates GitHub PR with Netlify preview link

## Safety Features
- **Protected Branches**: Never allows force push to main/master
- **Conflict Detection**: Checks for remote changes before pushing
- **Lease Safety**: Uses --force-with-lease instead of dangerous --force
- **Change Preview**: Shows exactly what commits will be pushed
- **Branch Suggestions**: Recommends meaningful branch names

## Examples
```bash
# Simple push
/push

# Push and create PR
/push --pr

# Force push feature branch
/push --force
```

## Netlify Integration
Automatically shows preview URL after push for easy testing.
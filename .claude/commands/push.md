# /push

Safe git push with automatic upstream and optional PR creation.

## Usage
```
/push                    # Push current branch
/push --pr              # Push and create PR
/push --force           # Force push (with lease)
```

## What it does
1. Checks for clean working tree
2. Fetches latest from remote
3. Sets upstream if needed
4. Pushes changes safely
5. Shows Netlify preview URL
6. Optionally creates PR

## Safety Features
- Never force pushes to main/master
- Uses --force-with-lease for safety
- Warns about uncommitted changes
- Shows what will be pushed

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
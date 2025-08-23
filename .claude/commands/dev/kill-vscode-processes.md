---
description: Emergency killer for runaway VS Code Node.js processes. Lists/kills VS Code language servers, extensions, and TypeScript servers consuming excessive memory.
argument-hint: [--list|--kill|--force] [--memory-threshold "500MB"] [--vscode-only] [--json] [--yes]
# Surgical precision for VS Code process management
allowed-tools:
  Bash(uname:*),
  Bash(whoami:*),
  Bash(ps:*),
  Bash(pgrep:*),
  Bash(pkill:*),
  Bash(kill:*),
  Bash(sleep:*),
  Bash(awk:*),
  Bash(grep:*),
  Bash(sort:*),
  Bash(head:*)
---

# /kill-vscode-processes

Emergency response tool for VS Code's Node.js process explosion. Identifies and terminates memory-hungry VS Code processes while preserving the main editor.

## Problem This Solves
- VS Code spawning 10-20+ Node.js processes (TypeScript servers, ESLint, extensions)  
- Each process consuming 500MB-1GB+ RAM
- Total memory pressure reaching 5-20GB+
- System becoming unresponsive due to memory exhaustion

## Inputs
- Raw arguments: `$ARGUMENTS`
- Default memory threshold: `500MB` (processes using more get flagged)
- VS Code process patterns: `tsserver|eslint|typescript|vscode|electron`

## Output Modes
- Table with memory usage (default)
- JSON (if `--json` present)

## Your Task

### Step 1: Parse Arguments
Recognize:
- `--list` (default) → **list only** (safe mode)
- `--kill` → send **SIGTERM** to memory hogs
- `--force` (only with `--kill`) → escalate to **SIGKILL** if needed
- `--memory-threshold "XMB"` → override 500MB threshold (e.g., "800MB", "1GB")
- `--vscode-only` → target only VS Code-related processes (safer)
- `--json` → structured output
- `--yes` → skip confirmation for bulk kills

### Step 2: Process Discovery
1) **System info:**
   ```bash
   uname -s && whoami
   ```

2) **Find VS Code processes with memory usage:**
   ```bash
   ps -Ao pid,user,rss,command | grep -E "(node|tsserver|eslint|typescript|vscode|electron)" | grep -v grep | sort -k3 -nr
   ```

3) **Convert RSS to MB and filter by threshold:**
   ```bash
   # RSS is in KB on most systems, convert to MB
   awk 'BEGIN{threshold=500} {rss_mb=$3/1024; if(rss_mb > threshold) print $1, $2, rss_mb"MB", $4}' 
   ```

### Step 3: Smart Classification
For each process, determine:
- **Process type**: `tsserver`, `eslint-server`, `extension-host`, `language-server`, `main-process`
- **Safety level**: 
  - `SAFE` → Extension workers, language servers (can kill safely)
  - `RISKY` → Main VS Code process (preserve unless force)
  - `CRITICAL` → System processes (never touch)

**VS Code Process Patterns:**
- `**/node_modules/.bin/tsc` → TypeScript compiler
- `**/tsserver.js` → TypeScript language server  
- `**/eslint/bin/eslint.js` → ESLint server
- `**/electron*vscode` → Main VS Code process (preserve)
- `node.*--inspect.*extension` → Extension debugging (safe to kill)

### Step 4: Display Results
**Memory-sorted table:**
```
PID   | USER   | MEMORY | TYPE           | COMMAND                           | SAFETY
1234  | daniel | 1.2GB  | tsserver       | node tsserver.js --locale en     | SAFE  
5678  | daniel | 890MB  | eslint-server  | node eslint/bin/eslint.js         | SAFE
9012  | daniel | 750MB  | extension-host | node --inspect extension-host.js  | SAFE
```

**Summary:**
```
Found 3 processes consuming >500MB (total: 2.8GB)
SAFE to kill: 3 processes (2.8GB)
RISKY: 0 processes  
CRITICAL: 0 processes (excluded)
```

### Step 5: Kill Operations (only with --kill)
**Safety checks:**
- Never kill main VS Code process unless `--force` AND `--yes`
- Confirm if killing >5 processes without `--yes`
- Skip processes owned by other users

**Kill sequence:**
1. **Graceful termination (SIGTERM):**
   ```bash
   kill <PID>
   ```

2. **Wait and verify:**
   ```bash
   sleep 3
   ps -p <PID> >/dev/null && echo "PID <PID> still alive" || echo "PID <PID> terminated"
   ```

3. **Force kill if still running (--force only):**
   ```bash
   kill -9 <PID>
   ```

### Step 6: Post-Kill Verification
After killing processes:
1. **Memory freed calculation:**
   ```bash
   # Compare memory before/after
   ps aux | grep -E "(node|tsserver|eslint)" | awk '{sum+=$6} END {print "Remaining VS Code memory: " sum/1024 "MB"}'
   ```

2. **VS Code health check:**
   ```bash
   pgrep -f "vscode|electron" | wc -l | awk '{print "VS Code processes remaining: " $1}'
   ```

## Safety Rules
- **Dry-run by default** - never kill without explicit `--kill`
- **Preserve main editor** - never kill primary VS Code process unless forced
- **User isolation** - only operate on current user's processes
- **Memory thresholds** - configurable thresholds prevent false positives
- **Process classification** - distinguish between safe vs risky processes

## Examples
```bash
# Safe discovery (default)
/kill-vscode-processes

# Kill memory hogs >800MB  
/kill-vscode-processes --kill --memory-threshold "800MB"

# Emergency: kill everything VS Code related
/kill-vscode-processes --kill --force --yes

# JSON output for scripting
/kill-vscode-processes --json --memory-threshold "1GB"

# Conservative: only target specific VS Code processes
/kill-vscode-processes --kill --vscode-only
```

## Recovery Notes
After killing processes:
1. **Reload VS Code**: `Cmd+R` or "Developer: Reload Window"
2. **Check extensions**: Some may need manual re-enabling
3. **Monitor memory**: Run this command again to verify cleanup
4. **Root cause**: Review `.vscode/settings.json` exclusions

This command works in tandem with the optimized `.vscode/settings.json` to provide both prevention and emergency response for VS Code memory explosions.
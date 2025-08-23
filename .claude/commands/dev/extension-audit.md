---
description: Systematic audit of VS Code extensions to identify memory leaks and performance issues. Helps isolate problematic extensions causing Node.js process explosions.
argument-hint: [--baseline|--audit|--report] [--disable-all] [--enable-one "extension-id"] [--json]
allowed-tools:
  Bash(code:*),
  Bash(ps:*),
  Bash(grep:*),
  Bash(awk:*),
  Bash(sleep:*)
---

# /extension-audit

Systematic approach to identify VS Code extensions that cause memory bloat and excessive Node.js process spawning.

## The Extension Memory Problem

**Root Cause**: Many VS Code extensions run as separate Node.js processes:
- **Language servers**: TypeScript, ESLint, Prettier, etc.
- **AI assistants**: Copilot, IntelliCode, etc.  
- **Live tools**: Live Server, Auto Refresh, etc.
- **Git tools**: GitLens, Git Graph, etc.

**Symptoms**: Each problematic extension can spawn multiple Node processes consuming 500MB-2GB each.

## Audit Process

### Step 1: Establish Baseline
Create a clean baseline without extensions:

```bash
# Close all VS Code instances first
pkill -f "Visual Studio Code"
sleep 3

# Start with all extensions disabled
code --disable-extensions /path/to/your/project

# Wait for full startup
sleep 10

# Document clean memory usage
ps aux | grep -E "(Visual Studio Code|node)" | grep -v grep | awk '{sum+=$6; count++} END {printf "Baseline: %.1fMB (%d processes)\n", sum/1024, count}'
```

**Expected baseline**: 200-500MB across 5-8 processes

### Step 2: Extension Bisect Method

**Full bisect process**:

1. **Enable half your extensions**:
   ```bash
   # Get list of installed extensions
   code --list-extensions > installed-extensions.txt
   
   # Split list in half, enable first half only
   head -n $(( $(wc -l < installed-extensions.txt) / 2 )) installed-extensions.txt > enable-batch-1.txt
   
   # Enable first batch
   while read extension; do
     code --install-extension $extension
   done < enable-batch-1.txt
   ```

2. **Test memory impact**:
   ```bash
   # Reload VS Code
   # Use Cmd+Shift+P → "Developer: Reload Window"
   
   # Wait and measure
   sleep 30
   ps aux | grep -E "(Visual Studio Code|node)" | grep -v grep | awk '{sum+=$6; count++} END {printf "Batch 1: %.1fMB (%d processes)\n", sum/1024, count}'
   ```

3. **Isolate the culprit**:
   - If memory usage is normal → problem is in second half
   - If memory explodes → problem is in first half
   - Split the problematic half and repeat

### Step 3: Single Extension Testing

Once you've narrowed to 2-3 suspect extensions:

```bash
# Test each individually
code --disable-extensions
code --enable-extension ms-vscode.vscode-typescript-next  # Example

# Wait and measure
sleep 30
ps aux | grep -E "(Visual Studio Code|node)" | grep -v grep | sort -k6 -nr | head -10
```

## Common Memory-Heavy Extensions

### **High Risk (Often >500MB each)**
- `ms-vscode.vscode-typescript-next` - TypeScript language features
- `ms-python.python` - Python extension with Pylance
- `ms-dotnettools.csharp` - C# with OmniSharp
- `ms-vscode.cpp` - C++ with IntelliSense
- `bradlc.vscode-tailwindcss` - Tailwind CSS IntelliSense
- `esbenp.prettier-vscode` - Prettier formatter
- `ritwickdey.liveserver` - Live Server (spawns HTTP server)

### **Medium Risk (Usually 100-300MB)**
- `dbaeumer.vscode-eslint` - ESLint integration
- `streetsidesoftware.code-spell-checker` - Spell checker
- `ms-vscode.vscode-json` - JSON language features
- `redhat.vscode-yaml` - YAML language support

### **AI Extensions (Variable, often high)**
- `github.copilot` - GitHub Copilot (can be 1GB+)
- `ms-vscode.vscode-ai` - AI features
- `continue.continue` - AI coding assistant

## Memory Optimization Strategies

### **Per-Extension Optimizations**

**TypeScript/JavaScript**:
```json
{
  "typescript.preferences.maxTsServerMemory": 2048,
  "typescript.tsserver.experimental.enableProjectDiagnostics": false,
  "typescript.suggest.enabled": false  // If you don't need autocomplete
}
```

**ESLint**:
```json
{
  "eslint.run": "onSave",  // Instead of onType
  "eslint.probe": ["javascript", "typescript"],  // Limit file types
  "eslint.validate": ["javascript", "typescript"]
}
```

**Tailwind CSS**:
```json
{
  "tailwindCSS.validate": false,  // Disable if causing issues
  "tailwindCSS.lint.invalidApply": "ignore"
}
```

### **Extension Alternatives (Lighter Options)**

| Heavy Extension | Lighter Alternative | Memory Savings |
|---|---|---|
| Live Server | VS Code Live Preview (built-in) | ~200MB |
| GitLens (full) | Git Graph | ~150MB |
| Prettier | Built-in formatting | ~100MB |
| Auto Rename Tag | Built-in HTML features | ~50MB |

## Automated Audit Script

Create a script to systematically test extensions:

```bash
#!/bin/bash
# extension-memory-test.sh

EXTENSIONS=($(code --list-extensions))
BASELINE=$(ps aux | grep -E "(Visual Studio Code|node)" | grep -v grep | awk '{sum+=$6} END {print sum}')

echo "Baseline memory: ${BASELINE}KB"

for ext in "${EXTENSIONS[@]}"; do
    # Disable all, enable one
    code --disable-extensions
    code --enable-extension "$ext"
    
    # Wait for startup
    sleep 15
    
    # Measure memory
    MEMORY=$(ps aux | grep -E "(Visual Studio Code|node)" | grep -v grep | awk '{sum+=$6} END {print sum}')
    DIFF=$((MEMORY - BASELINE))
    
    printf "%-50s: +%dKB (%dMB)\n" "$ext" "$DIFF" "$((DIFF/1024))"
    
    # Log heavy extensions
    if [ "$DIFF" -gt 500000 ]; then  # >500MB
        echo "⚠️  HEAVY: $ext (+$(($DIFF/1024))MB)" >> heavy-extensions.log
    fi
done
```

## Quick Health Check Commands

**Current extension memory usage**:
```bash
ps aux | grep -E "(Code Helper.*Plugin)" | awk '{print $11, $6/1024"MB"}' | sort -k2 -nr
```

**Find TypeScript servers**:
```bash
pgrep -fl tsserver | awk '{print $1, $NF}' | while read pid cmd; do
    mem=$(ps -p $pid -o rss= | awk '{print $1/1024"MB"}')
    echo "PID $pid: $mem - $cmd"
done
```

**Extension process tree**:
```bash
ps -ef | grep -E "(Code Helper|extension)" | grep -v grep | awk '{print $2, $3, $8}' | sort -k2
```

## Emergency Recovery

**If VS Code becomes unresponsive during audit**:
```bash
# Kill all VS Code processes
pkill -f "Visual Studio Code"

# Remove all extensions (nuclear option)
rm -rf ~/.vscode/extensions/*

# Start fresh
code --list-extensions > backup-extensions.txt  # Backup first!
```

**Gradual re-enabling**:
```bash
# Install only essential extensions
code --install-extension ms-vscode.vscode-typescript-next
code --install-extension dbaeumer.vscode-eslint
# Test memory after each
```

This audit process helps you identify exactly which extensions are causing your Node.js memory explosion, allowing you to make informed decisions about what to keep, configure, or replace.
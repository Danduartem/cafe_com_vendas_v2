---
description: VS Code memory monitoring and prevention checklist. Daily/weekly routines to prevent Node.js process explosions and maintain optimal performance.
argument-hint: [--daily|--weekly|--emergency] [--report] [--alert-threshold "2GB"]
allowed-tools:
  Bash(ps:*),
  Bash(top:*),
  Bash(grep:*),
  Bash(awk:*),
  Bash(say:*),
  Bash(osascript:*),
  Bash(date:*)
---

# /memory-monitor

Comprehensive monitoring and prevention system for VS Code memory management.

## Daily Health Checks (Run Every Morning)

### 1. Quick Memory Snapshot
```bash
# VS Code memory usage summary
ps aux | grep -E "(Visual Studio Code|node.*vscode|Code Helper)" | grep -v grep | \
awk '{sum+=$6; count++; if($6>500000) heavy++} 
END {printf "VS Code: %.1fGB (%d processes, %d heavy >500MB)\n", sum/1024/1024, count, heavy}'

# Individual heavy processes
ps aux | grep -E "(Visual Studio Code|node.*vscode|Code Helper)" | grep -v grep | \
awk '$6 > 500000 {printf "⚠️  %s: %.0fMB - %s\n", $2, $6/1024, substr($0, index($0,$11))}' | head -5
```

**Healthy targets**:
- Total VS Code memory: <3GB
- Heavy processes (>500MB): <3
- Total process count: <25

### 2. Extension Health Check
```bash
# Count extension processes
ps aux | grep "Code Helper (Plugin)" | wc -l | awk '{print "Extension processes: " $1}'

# Memory per extension type
ps aux | grep -E "(tsserver|eslint|tailwind|copilot)" | grep -v grep | \
awk '{print $11, $6/1024"MB"}' | sort -k2 -nr | head -5
```

### 3. File Watcher Status
```bash
# Check if heavy directories are being watched (bad sign)
lsof | grep -E "(node_modules|_site|dist)" | wc -l | \
awk '{if($1>100) print "⚠️  High file watchers: "$1" (check .vscode/settings.json)"; else print "✅ File watchers: "$1" (healthy)"}'
```

## Weekly Deep Monitoring (Run Every Monday)

### 1. Memory Trend Analysis
```bash
# Create weekly report
echo "=== VS Code Memory Report $(date) ===" > weekly-memory-report.txt

# Historical comparison (if you keep logs)
if [ -f "memory-history.log" ]; then
    echo "Memory trend (last 7 entries):" >> weekly-memory-report.txt
    tail -7 memory-history.log >> weekly-memory-report.txt
fi

# Current snapshot
ps aux | grep -E "(Visual Studio Code|node)" | grep -v grep | \
awk '{sum+=$6} END {printf "Current total: %.1fGB\n", sum/1024/1024}' >> weekly-memory-report.txt

# Log today's data
ps aux | grep -E "(Visual Studio Code|node)" | grep -v grep | \
awk '{sum+=$6} END {printf "%s: %.1fGB\n", strftime("%Y-%m-%d"), sum/1024/1024}' >> memory-history.log
```

### 2. Extension Audit
```bash
# List all extensions with estimated memory impact
code --list-extensions | while read ext; do
    case $ext in
        *typescript*|*python*|*copilot*) echo "HIGH: $ext" ;;
        *eslint*|*prettier*|*tailwind*) echo "MED:  $ext" ;;
        *) echo "LOW:  $ext" ;;
    esac
done | sort
```

### 3. Settings Verification
```bash
# Verify critical exclusions are in place
if grep -q "files.watcherExclude" .vscode/settings.json; then
    echo "✅ File watcher exclusions configured"
else
    echo "⚠️  Missing file watcher exclusions"
fi

if grep -q "typescript.tsserver.maxTsServerMemory" .vscode/settings.json; then
    echo "✅ TypeScript memory limit configured"
else
    echo "⚠️  Missing TypeScript memory limit"
fi
```

## Emergency Response Procedures

### 1. High Memory Alert (>5GB)
```bash
# Automated alert script
MEMORY_GB=$(ps aux | grep -E "(Visual Studio Code|node)" | grep -v grep | awk '{sum+=$6} END {print sum/1024/1024}')

if (( $(echo "$MEMORY_GB > 5" | bc -l) )); then
    echo "🚨 CRITICAL: VS Code using ${MEMORY_GB}GB"
    
    # macOS notification
    osascript -e "display notification \"VS Code using ${MEMORY_GB}GB - Memory Critical!\" with title \"Memory Alert\""
    
    # List top memory consumers
    echo "Top memory consumers:"
    ps aux | grep -E "(Visual Studio Code|node)" | grep -v grep | sort -k6 -nr | head -5 | \
    awk '{printf "%s: %.0fMB\n", $2, $6/1024}'
    
    # Suggest action
    echo "Run: /kill-vscode-processes --list"
    echo "Or:  /kill-vscode-processes --kill --memory-threshold 800MB"
fi
```

### 2. Process Count Alert (>30 processes)
```bash
PROCESS_COUNT=$(ps aux | grep -E "(Visual Studio Code|node)" | grep -v grep | wc -l)

if [ "$PROCESS_COUNT" -gt 30 ]; then
    echo "🚨 CRITICAL: $PROCESS_COUNT VS Code processes"
    echo "Likely process explosion - restart VS Code recommended"
    
    # Show process breakdown
    ps aux | grep -E "(Visual Studio Code|node)" | grep -v grep | \
    awk '{print $11}' | sed 's|.*[/\\]||' | sort | uniq -c | sort -nr | head -10
fi
```

## Prevention Checklist

### ✅ Daily Habits
- [ ] Check memory usage before starting work
- [ ] Close unused VS Code windows/workspaces
- [ ] Restart VS Code if it exceeds 3GB
- [ ] Monitor Activity Monitor during heavy development

### ✅ Weekly Maintenance  
- [ ] Run full extension audit
- [ ] Review memory history logs
- [ ] Update critical extensions only (not auto-update)
- [ ] Clean up old workspace folders
- [ ] Verify `.vscode/settings.json` exclusions

### ✅ Project Setup (New Projects)
- [ ] Copy optimized `.vscode/settings.json` from this project
- [ ] Add `node_modules/`, `dist/`, build artifacts to exclusions
- [ ] Configure TypeScript memory limits
- [ ] Test memory usage with typical workload

### ✅ Extension Management
- [ ] Install extensions one by one, testing memory impact
- [ ] Use lighter alternatives when possible
- [ ] Disable unused extensions (don't just ignore)
- [ ] Avoid multiple extensions that do similar things

## Monitoring Automation

### 1. Memory Monitor Script
```bash
#!/bin/bash
# ~/.config/vscode-memory-monitor.sh

LOG_FILE="$HOME/.vscode-memory.log"
ALERT_THRESHOLD=5  # GB

while true; do
    MEMORY_GB=$(ps aux | grep -E "(Visual Studio Code|node)" | grep -v grep | awk '{sum+=$6} END {print sum/1024/1024}')
    TIMESTAMP=$(date '+%Y-%m-%d %H:%M:%S')
    
    # Log memory usage
    echo "$TIMESTAMP: ${MEMORY_GB}GB" >> "$LOG_FILE"
    
    # Alert if high
    if (( $(echo "$MEMORY_GB > $ALERT_THRESHOLD" | bc -l) )); then
        osascript -e "display notification \"VS Code: ${MEMORY_GB}GB\" with title \"Memory Alert\""
        say "Visual Studio Code memory high"
    fi
    
    sleep 300  # Check every 5 minutes
done &
```

### 2. Startup Health Check
Add to your shell profile (`.zshrc`, `.bashrc`):
```bash
# VS Code memory check on terminal startup
vscode_memory_check() {
    if pgrep -f "Visual Studio Code" > /dev/null; then
        local memory_gb=$(ps aux | grep -E "(Visual Studio Code|node)" | grep -v grep | awk '{sum+=$6} END {print sum/1024/1024}')
        if (( $(echo "$memory_gb > 3" | bc -l) )); then
            printf "\033[33m⚠️  VS Code using %.1fGB memory\033[0m\n" "$memory_gb"
            echo "Consider restarting VS Code or running /kill-vscode-processes"
        fi
    fi
}

# Run check when opening terminal
vscode_memory_check
```

## Performance Targets

### 🎯 Healthy VS Code Memory Profile
```
Main VS Code Process:     200-500MB
Renderer Process:         300-800MB  
Extension Host:           100-300MB
Language Servers:         50-200MB each
TypeScript Server:        200-1000MB
Total System Impact:      1-3GB
Process Count:            8-20 processes
```

### 🚨 Warning Signs
```
Total Memory:            >5GB
Single Process:          >2GB
Process Count:           >30
System Memory Pressure:  Yellow/Red in Activity Monitor
Fan Noise:               Constant high speed
UI Responsiveness:       Sluggish typing/scrolling
```

## Recovery Procedures

### 1. Soft Reset (Preserve Work)
```bash
# Save all work first, then:
# Cmd+Shift+P → "Developer: Reload Window"
# Or restart VS Code only
```

### 2. Hard Reset (Clean Slate)
```bash
# Close VS Code completely
pkill -f "Visual Studio Code"

# Clear VS Code caches (optional)
rm -rf "$HOME/Library/Application Support/Code/CachedData"
rm -rf "$HOME/Library/Application Support/Code/logs"

# Restart with clean state
code --disable-extensions  # Test if extensions are the issue
```

### 3. Nuclear Option (Complete Reset)
```bash
# Backup extensions list first!
code --list-extensions > extensions-backup.txt

# Remove all extensions
rm -rf ~/.vscode/extensions

# Reinstall selectively
cat extensions-backup.txt | while read ext; do
    echo "Install $ext? (y/n)"
    read answer
    [ "$answer" = "y" ] && code --install-extension "$ext"
done
```

This monitoring system provides early warning and prevents the memory explosions that caused your system to hit 247GB memory pressure.
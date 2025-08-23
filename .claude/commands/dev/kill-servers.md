---
description: List and kill stray dev servers (Vite/Eleventy/Next/Nuxt/Astro/Storybook/etc.). Dry-run by default.
argument-hint: [--list|--kill|--force] [--ports "3000,5173,8080"] [--names "vite,eleventy,next"] [--json] [--yes] [--user-only]
# Keep the surface area tight and auditable
allowed-tools:
  Bash(uname:*),
  Bash(whoami:*),
  Bash(lsof:*),
  Bash(ss:*),
  Bash(netstat:*),
  Bash(ps:*),
  Bash(pgrep:*),
  Bash(kill:*),
  Bash(sleep:*)
---

# /kill-servers

You are a precise, cautious operator. Identify and (only if explicitly requested) terminate local **dev servers** the user likely started and forgot to stop.

## Inputs
- Raw arguments: `$ARGUMENTS`
- Default ports: `3000,3001,3002,3333,4000,4200,4321,5000,5173,5174,6006,8000,8080,8888,1313,24678`
- Default names: `vite,eleventy,11ty,next,nuxt,astro,svelte,remix,webpack,parcel,esbuild,http-server,live-server,nodemon,storybook,hugo,jekyll,netlify,wrangler,bun,deno`

## Output modes
- Table (default)
- JSON (if `--json` present)

## Your Task

## Step 1: Parse Arguments
Recognize:
- `--list` (default) → **list only** (dry-run)
- `--kill` → send **SIGTERM** to matches
- `--force` (only with `--kill`) → escalate to **SIGKILL** if still alive after wait
- `--ports "p1,p2,..."` → override default ports
- `--names "n1,n2,..."` → override default process-name patterns
- `--json` → emit structured JSON result
- `--yes` → skip confirmation prompt if terminating > 3 processes
- `--user-only` (default true on macOS) → consider **only processes owned by current user**

## Step 2: System Discovery (prefer single-pass)
1) **OS:**
   ```bash
   uname -s
   ```

2) **Current user:**
   ```bash
   whoami
   ```

3) **Listening ports (try in order; stop at first that works):**
   ```bash
   lsof -nP -iTCP -sTCP:LISTEN 2>/dev/null || true
   ```
   ```bash
   ss -tlnp 2>/dev/null || true
   ```
   ```bash
   netstat -tln 2>/dev/null || true
   ```

4) **Process snapshot (single pass; full command lines):**
   ```bash
   ps -Ao pid,user,ppid,command 2>/dev/null || true
   ```

5) **Optional name probes (fallback if ps lacks command lines on platform):**
   Run `pgrep -fal "<name>" 2>/dev/null || true` individually per configured name.

## Step 3: Build Candidate List (in-memory)
- Build port→PID map from (2.3).
- From ps (and pgrep if needed), match by name substrings using the final names list.
- **Owner filter:** keep only rows where user == $(whoami) unless --user-only=false is explicitly given.
- **Safety exclusions (regex):** `postgres|mysqld|mongod|redis-server|docker|colima|qemu|vpnkit|gitdaemon|ssh|launchd|systemd`.
- Deduplicate by PID. For each PID capture:
  - `pid`, `user`, `cmd`, `ppid`, `ports[]`, `why[]` (e.g., `["port:5173","name:vite"]`).

## Step 4: Display Results
**When any candidates:**
```
PID   | USER    | COMMAND                     | PORTS      | WHY
1234  | daniel  | node ./node_modules/vite…   | 5173,24678 | port:5173  name:vite
5678  | daniel  | eleventy --serve            | 8888       | name:eleventy port:8888
```

**Else:** "No likely dev servers detected."

**If --json, emit JSON:**
```json
{ "found": 2, "candidates":[ { "pid":1234, "user":"daniel", "ports":[5173,24678], "why":["name:vite","port:5173"], "cmd":"node …" } ] }
```

## Step 5: Kill Operations (only if --kill)
**Confirmation gate:** if candidates > 3 and no --yes, print summary and stop with:
> Refusing to terminate >3 processes without --yes.

Then for each PID (one at a time, no globs):

1. **Terminate:**
   ```bash
   kill <PID>
   ```

2. **Wait & verify:**
   ```bash
   sleep 2
   ```
   ```bash
   ps -p <PID> >/dev/null || echo "Process <PID> terminated"
   ```

3. **If still running and --force:**
   ```bash
   kill -9 <PID>
   ```

Record status per PID as: `terminated`, `killed`, or `alive`.

## Step 6: Summary
Print counts:
- `found`, `terminated`, `forced`, `alive`
- Any survivors with reason (e.g., "permission denied", "owner != current user", "excluded service").

## Safety Rules
- **Dry-run by default;** never kill without --kill.
- Never operate outside candidate PIDs.
- **Show exact shell commands you executed.**
- Use individual kill calls (no wildcards, no pipelines into xargs).
- Respect exclusions and user-only behavior.
- If both name and port fail to match, do not include PID.

## Examples
- `/kill-servers` → list only (safe)
- `/kill-servers --kill` → SIGTERM matches
- `/kill-servers --kill --force` → escalate if needed
- `/kill-servers --ports "3000,5173"` → only those ports
- `/kill-servers --names "vite,eleventy"` → only those names
- `/kill-servers --json` → machine-readable output
- `/kill-servers --kill --yes` → skip confirm if >3

## Notes
- **macOS often has ss missing;** lsof is primary.
- Many dev tools spawn as node with args; rely on name + port together to reduce false positives.
# `/project:plan-then-apply` — Command Spec

> Plan a **tiny, reversible** change; apply only after approval; verify in small loops. Keep diffs **minimal, idempotent, type‑safe**.

---

## Intent

Propose and (after approval) execute a **minimal** patch for a single, well‑scoped change. Never touch unrelated files.

**Invocation**

```
/project:plan-then-apply "<one small change>"
```

---

## Constraints (must follow)

* **Diff budget**: ≤ **3 files**, ≤ **6 hunks total**, \~≤ **60 LOC**.
* **No refactors/renames** beyond the stated change.
* **ESM rule**: sources are `.ts`; **import specifiers use `.js`**.
* **A11y & Analytics contracts** must hold (keyboard/focus basics; `payment_completed` → GA4 `purchase`).
* **No secrets/env/CI** edits without explicit permission.

---

## Plan Mode (read‑only)

1. **Read only** the relevant files (list them). Do **not** modify.
2. Produce a **patch plan** with exact unified diffs, tests to run, risks, backout, and acceptance criteria.
3. **Stop** and wait for approval.

---

## Apply Mode (after approval)

1. Apply the **first tiny diff only** (from the plan).
2. Run: `npm run type-check && npm run lint && npm test` and show outputs.
3. If green → either **DONE** or propose the **next smallest step**.
4. If red → **revert** that tiny diff, explain failure, propose alternative.

---

## Strict Return Format

Return exactly this structure in Markdown.

````md
# PLAN
- Goal: <one sentence>
- Scope: <list of files to touch>
- Diff budget: <=3 files / <=6 hunks / ~<=60 LOC

# PATCH PLAN
```diff
<file1>
@@ <hunk summary>
- old
+ new
<file2>
@@ ...
````

# TEST STRATEGY

* Unit: <what to run>
* E2E/visual (if UI): <what to run>

# RISK & BACKOUT

* Risks: <bullets>
* Backout: git revert <commit> or restore <files>

# ACCEPTANCE CRITERIA

* <measurable checks>

# WAITING\_FOR\_APPROVAL

````

> After approval, for **each** applied step reply with:

```md
# APPLY STEP <n>
- Commands run: <npm/git>
- Result: <type-check/lint/test outputs>
- Next step: <next tiny diff or DONE>
- Abort conditions: <when to stop>
````

```

---

## Guardrails & Checks
Before proposing a patch, confirm:
- Imports in TS end with **`.js`**; sources are **`.ts`** only.
- No inline styles/handlers; state via Tailwind classes.
- Event names unchanged unless explicitly requested; **`payment_completed`** contract preserved.
- A11y basics: semantic HTML, visible focus, keyboard paths.

---

## Example Invocation
```

/project\:plan-then-apply "Add web-vitals bridge that pushes a single `web_vitals` event to dataLayer"

```

---

## Notes
- Keep runs **idempotent** and **minimal**. Fail on type errors.
- Prefer native/web APIs over adding new libraries.
- Keep unrelated changes out of scope; open a follow‑up task if needed.

```

## `/project:version-check`

**Intent**: Report **exact installed versions**, fetch docs, and scan for **known deprecations**. **No file edits.**

**Invocation**: `/project:version-check`

**Phases**
1) **Version analysis**
- Run: `npm run versions`, `npm run outdated`.
- Emit a table of **package | current | latest | status**.
2) **Docs sync** (Context7)
- For: TypeScript, Vite, Eleventy, Tailwind, PostCSS, Stripe.
- Resolve IDs and cache **exact‑version docs** for the session.
3) **API validation**
- Run `npm run type-check`.
- Grep for deprecations / violations:
- Vite: `globEager`, old plugin hooks.
- Eleventy: CommonJS config, callback filters.
- Tailwind v4: presence of `tailwind.config.js` (should not exist).
- Stripe: Charges/Sources API usage in code.
- Repo rules: inline `style=""` or HTML event handlers; imports without `.js` in specifiers.
- Analytics contract: mentions of `purchase_completed` (should be `payment_completed`).

**Return format (strict)**
```md
# VERSIONS
| package | current | latest | status |
|---|---:|---:|---|
| ... | ... | ... | up-to-date / minor / major |

# DEPRECATIONS & VIOLATIONS
- Vite: <OK / Issues + file:line>
- Eleventy: <OK / Issues>
- Tailwind: <OK / Issues>
- Stripe: <OK / Issues>
- Repo rules: <OK / Issues>
- Analytics contract: <OK / Issues>

# DOCS FETCHED
- <pkg@version> → cached

# NEXT ACTIONS (non‑destructive)
- <ordered bullet list of smallest safe steps>
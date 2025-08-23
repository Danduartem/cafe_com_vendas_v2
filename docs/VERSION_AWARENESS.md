# Version Awareness — Café com Vendas

> Always check installed versions before coding. Use `/project:version-check` + Context7 for exact API docs.

---

## Current Stack

| Tool | Version | Key Notes |
|------|---------|-----------|
| **Node.js** | LTS | Use `npm ci` for installs |
| **TypeScript** | 5.9.x | Strict mode, `.js` imports in TS files |
| **Vite** | 7.1.x | Use `import.meta.glob({ eager: true })` |
| **Eleventy** | 3.1.x | ESM config in `.eleventy.ts` |
| **Tailwind CSS** | 4.1.x | CSS-first with `@theme` directive |
| **Stripe** | 18.4.x | Payment Intents, lazy-load stripe.js |

---

## Workflow

1. **Check versions**: `/project:version-check` before touching APIs
2. **Plan**: Use `/project:plan-then-apply` for changes
3. **Code**: Follow TS-only + Tailwind-only standards
4. **Test**: `npm run type-check && npm run lint && npm test`

## Key Migration Notes

* **Vite 7**: `globEager` removed → `import.meta.glob({ eager: true })`
* **Tailwind v4**: No config file, use CSS `@theme` directive
* **Eleventy 3**: ESM config with `export default`
* **Analytics**: `payment_completed` → GA4 `purchase`

## Upgrade Pattern

1. Create branch `chore/upgrade-<lib>`
2. Read migration docs via Context7
3. Update one dependency at a time
4. Fix types, run tests, verify build
5. Rollback if fix takes >30 minutes

*Use this doc with `/project:version-check` for safe upgrades.*
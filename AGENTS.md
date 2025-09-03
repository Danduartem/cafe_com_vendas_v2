# Repository Guidelines

## Project Structure & Module Organization
- `src/`: Eleventy source. Key areas: `_includes/` (templates), `_data/` (content/config), `pages/`, `assets/` (CSS via Tailwind), `components/`, `analytics/`, `utils/`, `admin/`.
- `netlify/functions/`: Serverless functions (Stripe, MailerLite, GTM, health, etc.).
- `public/`: Static root assets (favicons, fonts). Copied to build root.
- `tests/`: `unit/`, `integration/`, `e2e/` (Playwright). `tests/setup.ts` bootstraps Vitest.
- Build output: `_site/`. Do not edit or commit.

## Build, Test, and Development Commands
- `npm run dev`: Eleventy dev server (http://localhost:8080).
- `npm run netlify:dev`: Local site + Netlify Functions (http://localhost:8888).
- `npm run build`: Clean + Vite build + Eleventy build.
- `npm run preview`: Serve the production build from `_site/`.
- `npm run type-check`: TypeScript validation (strict).
- `npm run lint`: ESLint across repo.
- `npm test`: Vitest unit/integration tests.
- `npm run test:e2e`: Playwright E2E (first run: `npx playwright install`).
- Optional: `npm run lighthouse -- https://your-url.com` to audit performance.

## Coding Style & Naming Conventions
- Language: TypeScript (ESM). Use `.js` extensions in relative imports when targeting runtime code.
- Lint rules: prefer `const`, no unused vars (prefix unused params with `_`), limit `console` to `warn`/`error`.
- Indentation: 2 spaces; files/dirs use kebab-case; classes PascalCase; functions/vars camelCase.
- Run `npm run lint` (or `npx eslint . --fix`) before PRs.

## Testing Guidelines
- Unit/Integration: Vitest with `happy-dom`, globals enabled.
  - Naming: `tests/**/*.{test,spec}.{ts}`. Example: `tests/unit/utils/validation.test.ts`.
  - Coverage: V8 available; enable per `vitest.config.ts` if needed.
- E2E: Playwright in `tests/e2e/`.
  - Local: start with `npm run netlify:dev`, then `npm run test:e2e`. Reports in `reports/playwright/`.

## Commit & Pull Request Guidelines
- Commits: Conventional Commits (emoji optional). Examples:
  - `feat(analytics): add section tracking plugin`
  - `fix(functions): handle stripe 3ds flows`
  - `docs(setup): add GTM preview guide`
- PRs: clear description, linked issues, screenshots for UI, list of changes, test notes. All checks must pass: `npm run type-check && npm run lint && npm test` (run E2E if applicable).

## Security & Configuration Tips
- Node 22.17.1+ (`.nvmrc`).
- Secrets: `cp .env.example .env`; never commit `.env`.
- Payments: use test cards (see `docs/STRIPE_TEST_CARDS.md`).
- Do not edit `_site/`; submit changes under `src/` or `netlify/functions/`.


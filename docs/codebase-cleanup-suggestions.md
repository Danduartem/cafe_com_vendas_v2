# Codebase Cleanup Suggestions

## Frontend runtime
- `src/assets/js/app.ts:133` exposes `setupGlobalErrorHandling()` but never calls it during init. Either invoke it after `initializeAnalytics()` or drop the method to avoid dead listeners.
- `src/assets/js/core/state.ts:177` implements a polling `StateManager.subscribe()` API that nothing calls. Remove it or migrate callers before it becomes stale.
- `src/analytics/index.ts:116` wires `trackSectionEngagement()` yet no component uses it. Delete the helper (and matching plugin method) unless you plan to emit those events soon.
- `src/assets/js/utils/gtm-normalizer.ts:21` still normalizes every string aggressively (lowercase + strip). Restrict the scrubber to fields that actually need it (for example event names) so URLs, UTM values and currency codes keep their original casing.

## Conversion tracking & data layer
- `src/components/ui/thank-you/index.ts:207` sends a `purchase_complete` event, but GTM listens for `purchase_completed`. Align the names so purchase tags, duplicate guard and pixels fire.
- `src/_includes/sections/checkout/index.ts:274` pushes `checkout_opened` without `value`, `currency` or `items`, even though `GA4 Event – Begin Checkout` pulls those keys from that event. Either enrich the payload or key the GA4 tag off the richer `begin_checkout` event you emit immediately after.

## Admin dashboard
- `src/admin/index.njk:1` embeds large inline `<style>` and `<script>` blocks alongside the Vite-bundled dashboard script. Moving those assets into the Vite entry (or a dedicated CSS module) keeps CSP simple and prevents the same logic from being maintained in two places.

## Environment config & data consistency
- `src/assets/js/config/environment.ts:67` defines `contact.whatsapp`, but the UI reads `site.contact.whatsapp`. The ENV contact block is unused—drop it or wire consumers to one source of truth to avoid divergent numbers.
- `src/assets/js/config/environment.ts:109` also exposes `urls.instagram`/`urls.linkedin` that nothing references. Remove them until you actually route through ENV.

## Repository hygiene
- `netlify/functions/types:1` is an empty directory while `netlify/functions/types.ts` holds the shared typing. Delete the folder (or populate it) so linting and editors stop flagging it.
- `scripts/` is currently empty; remove the folder or add the planned build scripts so it does not confuse contributors reviewing the tree.

Keeping the tidy-ups above small and focused will trim maintenance overhead without over-engineering new systems.

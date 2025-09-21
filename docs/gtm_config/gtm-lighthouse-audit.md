# GTM Tag Audit – Lighthouse "Reduce Unused JavaScript"

## Context
- Lighthouse flags `gtm.js`, `gtag/js`, and `fbevents.js` as the largest unused JavaScript transfers.
- `gtm.js` pulls the web container (`GTM-T63QRLFT`) exported in `docs/gtm_config/GTM-T63QRLFT_workspace50.json`.
- `gtag/js` is injected by the GA4 configuration tag inside that container, while `fbevents.js` comes from the Meta Pixel helper snippet.

## Key Findings
- **GA4 | Config | Cafe Com Vendas** (trigger `2147479553`, the “All pages” page-load trigger) loads the GA4 library on every visit even though `send_page_view` is disabled and pageview hits are emitted later via custom events (`Signal | Custom Event | page_view`).
- **Meta Pixel | Helper | setup** (trigger `Signal | Initialization | all_pages`) injects the Facebook Pixel bootstrap immediately during the GTM Initialization phase, guaranteeing the `fbevents.js` download before any user intent is observed.
- No per-purpose consent gating is configured. All tags above show `consentStatus: "NOT_SET"`, so they run regardless of whether the visitor has granted analytics/marketing permissions.
- The server container `GTM-TGS6JMN9` (`docs/gtm_config/GTM-TGS6JMN9_workspace12.json`) already relays GA4 and Meta conversion payloads, meaning client-side libraries can be delayed without losing conversion coverage.
- Several client-side GA4/Meta events (e.g., `GA4 | Event | cta_click (test)`, `Meta Pixel | Event | scroll_engagement`) rely on custom dataLayer pushes. They do not add script weight themselves, but they will fail silently if the base libraries are delayed—plan for fallbacks or move them to the server container when possible.

## Recommendations
1. **Gate GA4 load behind interaction**
   - In GTM, switch `GA4 | Config | Cafe Com Vendas` from the All Pages trigger to a new `Custom Event` trigger (for example `Signal | Custom Event | ga4_activate`). Make sure tag sequencing is enabled so the config fires before any GA4 event tag that still depends on it.
   - In the app, wait for a real interaction (e.g., first scroll beyond the hero, CTA click, or when `CafeComVendas.init()` finishes) and then push `dataLayer.push({ event: 'ga4_activate', engagement_type: 'first_scroll' })`. Add a `setTimeout` fallback (5–10s) so passive visitors still register.
   - Once the config tag runs, immediately enqueue the existing GA4 events (`page_view`, `app_initialized`, etc.) so reporting stays consistent. Because the server container already relays conversions, pre-interaction visitors still get server-side coverage while the heavier client library stays deferred.

   **GTM configuration steps**
   1. Open GTM, load workspace `GTM-T63QRLFT`, and locate **Triggers → New**; create a trigger named `Signal | Custom Event | ga4_activate` of type **Custom Event**, with Event name `ga4_activate`, `Use regex matching` unchecked, and the condition set to `All Custom Events`.
   2. In **Tags → GA4 | Config | Cafe Com Vendas**, remove the existing “All Pages” trigger and add the new `Signal | Custom Event | ga4_activate` trigger.
   3. Leave **Tag Sequencing** unchecked inside the GA4 config tag itself; the config does not need a setup tag.
   4. For each GA4 event tag that remains (page_view, app_initialized, etc.), open **Advanced Settings → Tag Sequencing**, tick **Fire a tag before…**, and choose `GA4 | Config | Cafe Com Vendas` as the setup tag so the config loads before the event executes.
   5. Edit `Utility | Guard | first_touch_attribution` and move it to the same `Signal | Custom Event | ga4_activate` trigger so the first-touch cookie script runs alongside GA4’s activation; this keeps UTM capture aligned with the deferred load.
   6. Preview the workspace, trigger the interaction that pushes `ga4_activate`, and confirm in the debugger that the GA4 config tag, the first-touch guard, and all dependent GA4 event tags run afterward. Add a `dataLayer.push({ event: 'ga4_activate' })` fallback (e.g., after 5–10 seconds) so quick-bounce visitors still fire the guard and GA4 config once.

2. **Defer the Meta Pixel helper**
   - Move `Meta Pixel | Helper | setup` off the Initialization trigger and onto the new interaction trigger (`Signal | Custom Event | meta_activate`). If you prefer a built-in trigger, create a Scroll Depth trigger at 25% or a Link Click trigger on the primary CTA.
   - Update the app so the same interaction that pushes `ga4_activate` (or the first CTA click) also pushes `dataLayer.push({ event: 'meta_activate', intent: 'cta_click' })`; add a timer fallback if you need the pixel to load for passive visitors.
   - Once `Meta Pixel | Helper | setup` runs and `fbevents.js` loads, fire only the high-value Meta event tags (checkout, pricing interactions). Lower-priority events can stay mapped to server-side CAPI until the library is present, reducing front-loaded script weight.
   - In GTM Preview, check that no Meta tags fire before the interaction, then confirm the helper tag, pixel library, and any dependent Meta events execute after the `meta_activate` event.

   **Meta Pixel configuration steps**
   1. In GTM, create a trigger named `Signal | Custom Event | meta_activate` (type **Custom Event**, event name `meta_activate`, fire on All Custom Events).
   2. Edit **Tags → Meta Pixel | Helper | setup** and replace the Initialization trigger with the new `meta_activate` trigger.
   3. Review client-side Meta pixel event tags (HTML tags that call `fbq`, such as scroll engagement or the pixel fallback) and ensure each one lists `Meta Pixel | Helper | setup` under **Advanced Settings → Tag Sequencing → Fire a tag before…** so the helper runs before the event executes. Server-side relay tags (e.g., `Meta CAPI | Event Relay | checkout_opened+`) do not need sequencing because they bypass the browser pixel entirely.
   4. In the app code, push `dataLayer.push({ event: 'meta_activate', intent: '<interaction>' })` at the same moment you push `ga4_activate`, plus an optional timeout fallback for passive sessions.
   5. Use GTM Preview to verify that `meta_activate` appears only after the interaction, the helper loads the pixel once, and the downstream Meta event tags execute afterward.

3. **Tighten tag inventory**
   - Audit GA4 event tags that appear to be experiments (`GA4 | Event | cta_click (test)`) and delete or disable them in production workspaces to minimize container payload.
   - Group rarely used events into a single tag with dynamic parameters to shrink the tag count and the JavaScript that GTM injects on the page.

4. **Keep server-side coverage in sync**
   - Confirm the Netlify or GTM server container continues to receive key conversions (checkout, purchase) so delaying browser tags does not create blind spots.
   - For any client-only events you postpone, add server-side fallbacks or queued dispatches once `ga4_activate`/`meta_activate` run.

## Implementation Checklist
1. In GTM (`GTM-T63QRLFT`), create the `ga4_activate` and `meta_activate` custom-event triggers.
2. Rewire `GA4 | Config | Cafe Com Vendas` to the `ga4_activate` trigger and leave its tag sequencing empty.
3. Update every GA4 event tag and the `Utility | Guard | first_touch_attribution` tag to fire `GA4 | Config | Cafe Com Vendas` first via Advanced Settings → Tag Sequencing.
4. Move `Meta Pixel | Helper | setup` to the `meta_activate` trigger and set the helper as the setup tag for all Meta event tags.
5. In the application, emit both `dataLayer.push({ event: 'ga4_activate', ... })` and `dataLayer.push({ event: 'meta_activate', ... })` on the chosen interaction, plus a 5–10 second timeout fallback.
6. Preview the container, perform the interaction, and confirm that GA4 config, first-touch guard, Meta helper, and their dependent event tags all run once per session after activation.
7. Deploy, re-run Lighthouse, and spot-check GA4/Meta reporting to ensure no coverage gaps.

   **App integration steps**
   1. In `src/assets/js/app.ts`, define a helper (for example `setupAnalyticsActivation()`) that keeps an `activated` flag, normalizes `window.dataLayer`, and pushes both `{ event: 'ga4_activate', engagement_type: source }` and `{ event: 'meta_activate', intent: source }` when triggered.
   2. Inside that helper, register the interaction listeners you care about: a `scroll` listener with `{ once: true }` that calls `activate('first_scroll')` after the visitor scrolls past a threshold (e.g., 150 px), a `click` listener on your primary CTA (`document.querySelector('[data-cta="primary"]')`), and a `setTimeout` fallback that fires after 7 s using `activate('timeout_fallback')` if no interaction occurs.
   3. Call `setupAnalyticsActivation()` once from `CafeComVendas.init()` after `initializeComponents()` so the listeners are registered as soon as the app is ready.
   4. To support analytics modules that need to react immediately after activation, extend the helper to resolve a shared promise or emit a custom `analytics:activated` event that other modules can subscribe to.
   5. Test locally: open the dev server, load the page with ?gtm_debug=x, scroll/click, and confirm `ga4_activate` and `meta_activate` appear in the GTM preview timeline once per session with the correct `engagement_type`/`intent` values.

## Verification Steps
- After implementing the gating strategy, reload with the GTM preview console to confirm GA4/Meta tags fire only after the interaction events (`ga4_activate`, `meta_activate`).
- Re-run Lighthouse in an Incognito session to capture the impact on “Reduce unused JavaScript” and “Third-party usage” audits.
- Monitor GA4 and Meta reporting for any drop-offs, and backfill with server-side events where the client tags no longer fire.

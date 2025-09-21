# GTM First-Load Activation Audit

This document captures the current behaviour of the analytics stack during a cold page load (no user interaction). Findings are derived from code inspection and the GTM preview timeline supplied during debugging.

## 1. dataLayer Pushes Occurring Before User Interaction

Source: `src/assets/js/app.ts`

| Location | Trigger Conditions | Event Payload | Notes |
| --- | --- | --- | --- |
| `setupAnalyticsActivation()` (`src/assets/js/app.ts:120`-`134`) | Fires when activation guard resolves.<br>Currently a 7s timeout fallback guarantees execution even without interaction. | `ga4_activate` with `engagement_type`/`activation_source` set to `timeout_fallback`, plus generated `event_id`, timestamp. | Runs after the fallback timer; responsible for waking GA4 tags via custom event trigger `Signal | Custom Event | ga4_activate` in GTM.
| `setupAnalyticsActivation()` (`src/assets/js/app.ts:131`-`134`) | Same conditions as row above. | `meta_activate` with `intent`/`activation_source` details. | Enables Meta Pixel helper once timeout hits.
| `CafeComVendas.init()` (`src/assets/js/app.ts:262`-`265`) | Executes immediately during initialisation. | `page_view` (via `analyticsModule.default.page()` → GTM plugin). | Occurs *before* activation; sends GA4/Meta config + page hit when not gated.
| `CafeComVendas.init()` (`src/assets/js/app.ts:268`-`274`) | Same initialisation block. | `app_initialized` (via `analyticsModule.default.track()`). | Dispatched instantly; GTM tags listening to `app_initialized` run on first load.
| `initializeComponents()` (`src/assets/js/app.ts:333`-`360`) | Called during `init()` after components mount. | `components_initialized` (queued through `AnalyticsHelpers`). | Fires once component boot finishes; still before any user action.

Additional pushes originate from plugins initialised during `analyticsModule.initializeAnalytics()`:

- `sectionTrackingPlugin` (`src/analytics/plugins/section-tracking.ts:59`-`70`): intersection observers emit `section_view` for each section in view at load.
- `performancePlugin` (`src/analytics/plugins/performance.ts:96`-`145`): records `performance_metric` (e.g., LCP) and `page_load_performance` about 1s after `window.load`.
- `gtmPlugin` (`src/analytics/plugins/gtm.ts:212`-`217`, `src/analytics/plugins/gtm.ts:268`-`297`): processes the `page_view`, `app_initialized`, `components_initialized`, and later plugin events by pushing to `window.dataLayer` with generated `event_id` and `user_data` enrichment.

## 2. Registered Analytics Plugins and Early Emissions

Source: `src/analytics/index.ts`

| Plugin | File | Emits Events on Initial Load? | Details |
| --- | --- | --- | --- |
| `gtmPlugin` | `src/analytics/plugins/gtm.ts` | **Yes** (indirect). | Handles `analyticsModule.default.page/track` calls. Processes queued events immediately, enriching payloads and pushing to `dataLayer`.
| `performancePlugin` | `src/analytics/plugins/performance.ts` | **Yes**. | Listens for Core Web Vitals and navigation timing. Reports `performance_metric` and `page_load_performance` without waiting for interaction.
| `sectionTrackingPlugin` | `src/analytics/plugins/section-tracking.ts` | **Yes**. | IntersectionObserver reports `section_view` once sections intersect (often instantly for hero/top banner).
| `errorPlugin` | `src/analytics/plugins/error.ts` | No (until an error occurs). | Registers global handlers but does not emit during normal load.

## 3. First-Load Event Timeline (Observed in GTM Preview)

Chronological events pushed to `dataLayer` during a cold load (no user interaction):

1. **Consent Initialization** – `event: gtm.init_consent` (no tags fired).
2. **Initialization** – `event: gtm.init`; fires utility guard (`first_touch_attribution`).
3. **Container Loaded** – `event: gtm.js`; no tags fired yet.
4. **History Change / page_view** – Pushed by `gtmPlugin.page()` during `CafeComVendas.init()`.
   - Tags fired: `GA4 | Config | Cafe Com Vendas`, `GA4 | Event | page_view`, `Meta CAPI | Event Relay | checkout_opened+`, `Meta CAPI | Pixel Fallback | custom_payload`, `Meta Pixel | Helper | setup`.
5. **app_initialized** – Emitted from `CafeComVendas.init()`.
   - Tags fired: GA4 config + event.
6. **components_initialized** – Emitted from `initializeComponents()`.
   - Tags fired: GA4 config + event.
7. **section_view** (Top banner) – From section-tracking plugin (IntersectionObserver).
   - Tags fired: GA4 config + event.
8. **section_view** (Hero) – Same as above.
9. **performance_metric** – Core Web Vitals (LCP) via performance plugin.
   - Tags fired: GA4 config + event.
10. **page_load_performance** – Navigation timing summary (≈1.5s after load).
    - Tags fired: GA4 config + event.
11. **DOM Ready** – `gtm.dom` (no tags).
12. **Window Loaded** – `gtm.load` (no tags).
13. **ga4_activate** – Fired by activation fallback (timeout).
    - Tags fired: `GA4 | Config | Cafe Com Vendas` (re-run via custom-event trigger).
14. **meta_activate** – Same activation fallback event for Meta (no additional tags).

This baseline shows multiple GA4/Meta hits occurring well before any explicit engagement, which matches the GTM preview discrepancies highlighted earlier.

## Updated Activation Guard Implementation

Changes applied in `src/assets/js/app.ts` now defer analytics runtime work until engagement:

- `withAnalytics` no longer imports the analytics bundle immediately; callbacks queue until activation completes (`src/assets/js/app.ts:64`).
- Activation dispatch now pushes an `analytics_state` flag alongside existing `ga4_activate`/`meta_activate` events for GTM triggers and retains the activation detail for late listeners (`src/assets/js/app.ts:130`).
- `CafeComVendas.init()` registers an activation callback that initialises analytics only after engagement and queues the initial `page_view`/`app_initialized` events until then (`src/assets/js/app.ts:296`).
- The fallback timer extends to 30 seconds to avoid waking analytics for idle visitors (`src/assets/js/app.ts:49`).
- Section and performance plugins now wait for `analytics:activated` before registering observers (`src/analytics/plugins/section-tracking.ts`, `src/analytics/plugins/performance.ts`).
- The GTM plugin blocks `pushToDataLayerWithEventId` until activation is confirmed via the global flag or custom event (`src/analytics/plugins/gtm.ts`).

With these changes the first load keeps all GA4/Meta tags idle until activation dispatches, and GTM can rely on `analytics_state` to gate tag triggers.

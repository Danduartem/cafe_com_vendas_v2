# GTM First-Load Optimization Plan

This plan documents the work needed to minimise analytics activity during the very first page load. It assumes you are **not** running a consent banner—activation relies purely on user engagement signals that you control inside the app bundle.

## 1. Audit Current Activation Flow
- [ ] Inspect `src/assets/js/app.ts` and list every `dataLayer.push()` that fires before the visitor interacts. Pay special attention to `ga4_activate`, `meta_activate`, `analyticsModule.default.page`, `analyticsModule.default.track`, and helper pushes such as section or performance metrics.
- [ ] In `src/analytics/index.ts`, catalogue all registered plugins and note which ones emit events as soon as they initialise (GTM, performance, section-tracking, etc.).
- [ ] Record the exact sequence of events on first load. This baseline will be invaluable when validating the adjustments later.

## 2. Tighten the Activation Guard in the App Bundle
- [ ] Review `setupAnalyticsActivation()` and `CafeComVendas.init()` in `src/assets/js/app.ts` (~lines 120-280) to understand when activation is dispatched relative to module initialisation.
- [ ] Change the boot sequence so analytics initialisation and initial tracking events are deferred until an activation signal is dispatched:
  - Delay the call to `loadAnalyticsModule()`/`initializeAnalytics()` until after the activation promise resolves.
  - Queue the initial `page_view`, `app_initialized`, and `components_initialized` payloads so they only push once activation occurs.
- [ ] Replace the current seven-second fallback timer with a more deliberate strategy (e.g., much longer timeout or manual override) so analytics does not activate for idle users who never interact.
- [ ] Push a simple `analytics_activated` flag to `window.dataLayer` when activation occurs, e.g. `dataLayer.push({ event: 'analytics_state', analytics_activated: true })`. This flag will be used by GTM triggers in Step 4.

## 3. Queue Plugin-Driven Events Until Activation
- [ ] In `src/analytics/plugins/section-tracking.ts`, block the IntersectionObserver from starting until `analytics:activated` fires (the custom DOM event dispatched in `setupAnalyticsActivation()`). Before activation, store section names in a queue; once activated, set up the observer and drain the queue.
- [ ] In `src/analytics/plugins/performance.ts`, keep Core Web Vital observers and the page-load listener idle until activation. Add a guard so calls to `instance.track()` are skipped prior to the activation flag, then register observers once activation happens.
- [ ] In `src/analytics/plugins/gtm.ts`, introduce a simple boolean to prevent `pushToDataLayerWithEventId` from pushing events until activation is true. The flag should be flipped by the same activation handler used above.

## 4. Update GTM Web Container Trigger Logic
- [ ] **Create flag variable** – In GTM (web container `GTM-T63QRLFT`) add a new Data Layer variable:
  - Name: `DL | analytics_activated`
  - Data Layer Variable Name: `analytics_activated`
  - Data Layer Version: 2
  - Default Value: `false`
  - (Optional) Convert the output to boolean so non-empty strings evaluate as `true`.
- [ ] **Gate GA4 config** – Open tag `GA4 | Config | Cafe Com Vendas` (tagId `21`). Its only firing trigger today is `Signal | Custom Event | ga4_activate` (triggerId `164`). Edit trigger `164` and add a filter row: `DL | analytics_activated` **equals** `true`. Because the activation event now carries `analytics_activated: true`, the trigger will stay dormant until the flag flips.
- [ ] **Gate GA4 page events** – Tag `GA4 | Event | page_view` (tagId `108`) uses trigger `Signal | Custom Event | page_view` (triggerId `107`). Add the same filter (`DL | analytics_activated` equals `true`) to trigger `107` so organic page_view pushes are ignored until activation is complete.
- [ ] **Gate Meta Pixel boot** – Tag `Meta Pixel | Helper | setup` (tagId `136`) fires on `Signal | Custom Event | meta_activate` (triggerId `165`). Add the flag filter to trigger `165` to ensure the pixel script only loads after activation.
- [ ] **Tighten Meta CAPI relay** – Tag `Meta CAPI | Event Relay | checkout_opened+` (tagId `134`) rides trigger `Signal | Custom Event | checkout_opened+` (triggerId `124`). Update this trigger in two ways:
  1. Add the filter `DL | analytics_activated` equals `true` so relays wait for activation.
  2. Edit the existing regex filter so it no longer matches `page_view`. The final pattern should be `^(checkout_opened|add_payment_info|purchase_completed|lead_form_submitted|whatsapp_click)$`.
- [ ] **Re-export** – After saving the changes in GTM, download an updated workspace export and replace `docs/gtm_config/GTM-T63QRLFT_workspace51.json` so the repository mirrors production configuration.

## 5. Align Meta Pixel and Server-Side Relays
- [ ] Ensure the Meta Pixel helper tag (`Meta Pixel | Helper | setup`) and any other Meta-related tags also require `analytics_activated` so the pixel script and CAPI calls load only after engagement.
- [ ] Review the server container export (`docs/gtm_config/GTM-TGS6JMN9_workspace12.json`) to confirm client relays expect the new cadence. Update server triggers if any previously relied on the instant `page_view` hit.
- [ ] Check that server tags ignore requests that arrive before the activation flag is respected (e.g., guard by event name or custom parameter if necessary).

## 6. Validate Locally and in GTM Preview
- [ ] Rebuild or run the dev server, launch GTM preview mode, and load the page. Confirm no GA4 or Meta tags fire during `gtm.js`, `gtm.dom`, or `gtm.load` events.
- [ ] Trigger activation via scroll/CTA click and confirm queued events flush exactly once. Test the extended timeout to verify analytics remains dormant without engagement.
- [ ] Validate that conversion events (checkout, WhatsApp click, etc.) still fire with correct payloads after activation.

## 7. Document the New Behaviour
- [ ] Create an internal note or changelog entry describing:
  - The new activation gating flow and timeout policy.
  - Plugin queuing behaviour.
  - GTM trigger updates and removal of `page_view` from the CAPI relay trigger.
- [ ] Share updated GTM exports and source diffs with the broader team so they understand the activation dependency.
- [ ] Outline monitoring steps (e.g., check GA4 real-time after deploy) to ensure there is no data loss while the new strategy beds in.

Executing this plan will ensure analytics libraries and heavy tags fire only after the visitor demonstrates engagement, keeping first-load bandwidth and execution costs low.

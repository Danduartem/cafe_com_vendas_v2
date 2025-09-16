# GTM + sGTM + GA4 + Meta Pixel — CSP‑Safe Optimization Plan

This document summarizes concrete, CSP‑safe improvements to your Web GTM, Server GTM, GA4, and Meta Pixel setup to remove redundancies, improve naming, and raise Meta Event Match Quality (EMQ).

## Key Findings
- Web GTM Pixel Event triggers on `gtm.dom` causing PageView duplicates and weak dedup.
  - Reference: docs/gtm_config/GTM-T63QRLFT_workspace45.json:2597, 3813
- Pixel `eventID` concatenates UTM source, breaking dedup against CAPI.
  - Reference: docs/gtm_config/GTM-T63QRLFT_workspace45.json:3694
- Two GA4 Config tags (one general and one “FB_CONVERSIONS_API… GA4_Config”) risk duplicate PageViews and inconsistent transport.
  - Reference: docs/gtm_config/GTM-T63QRLFT_workspace45.json:21, 1589
- Server GTM includes a hardcoded Meta Access Token in the export — avoid committing secrets.
  - Reference: docs/gtm_config/GTM-TGS6JMN9_workspace7.json:76
- EMQ is low (3.7/10) with `fbp` ~46% and missing `fbc`/PII on high‑intent events.
  - Reference: docs/gtm_config/event_quality.md:1

## High‑Impact Changes (Do These First)
1) Meta dedup (event_id)
- Set Pixel `eventID` to the exact dataLayer `event_id` (no UTM concatenation):
  - Change variable `FB_CONVERSIONS_API-...-Variable-Event_ID_Constant` to: `18c60bad-c072-4290-a8a3-3fbbefd6ae23_{{DL - Event ID}}`
  - Remove `{{Cookie – First UTM Source}}` from the value.
  - Reference: docs/gtm_config/GTM-T63QRLFT_workspace45.json:3694

2) Remove `gtm.dom` from Pixel firing
- Update Pixel Event trigger to exclude `gtm.dom` so PageView only fires with your own `page_view` event.
  - Reference: docs/gtm_config/GTM-T63QRLFT_workspace45.json:2597, 3813

3) Pixel Setup timing
- Keep Pixel Setup on “Init – All Pages” (or “Consent Initialization – All Pages” if gated). Ensure there’s only one PageView from your event pipeline, not from `gtm.dom`.
  - Reference: docs/gtm_config/GTM-T63QRLFT_workspace45.json:2333

4) Scroll depth to Meta (custom event)
- Pixel Event HTML should include scroll params and use `trackCustom` for non‑standard events. The snippet in docs/gtm_config/test.html is correct.
- Add the trigger “SC – Scroll Depth” to the Pixel Event tag.
- In `FBEventName` mapping, add: key `gtm.scrollDepth` → value `ScrollDepth`.

5) Unify GA4 Config (reduce duplicates)
- Use a single GA4 Config tag:
  - `transport_url`: your sGTM endpoint.
  - `send_page_view`: false (your app calls `analytics.page()` in `src/assets/js/app.ts:116`).
- Remove the extra “FB_CONVERSIONS_API-…-Web-Tag-GA4_Config” to prevent duplicate PageViews.
  - References: docs/gtm_config/GTM-T63QRLFT_workspace45.json:21, 1589

6) Server GTM (CAPI) hardening
- Do not commit Access Tokens in exports; set via sGTM Server “Secrets” or environment variables.
  - Reference: docs/gtm_config/GTM-TGS6JMN9_workspace7.json:76
- Ensure your Meta CAPI tag populates: `event_name`, `event_time`, `event_id`, `event_source_url`, `action_source=website`, `client_ip_address`, `client_user_agent`, and `user_data` (`fbp`/`fbc` + hashed PII when available).
- Use `test_event_code` during validation; then remove.

## Event Match Quality (EMQ) Playbook
Focus on high coverage signals without violating CSP or privacy.

- fbp coverage (goal ~100% when consented)
  - Ensure Pixel Setup loads early; keep our CSP‑safe fallback from code: `src/analytics/utils/meta-ids.ts:ensureMetaCookies()`.
- fbc coverage (goal: “when available”)
  - Persist `_fbc` from `fbclid` (already handled in `meta-ids.ts`).
- Hashed PII on high‑intent only (Lead/Purchase)
  - Hash email/phone using WebCrypto before pushing to dataLayer:
    ```ts
    async function sha256(s: string) {
      const d = new TextEncoder().encode(s.trim().toLowerCase());
      const h = await crypto.subtle.digest('SHA-256', d);
      return Array.from(new Uint8Array(h)).map(b=>b.toString(16).padStart(2,'0')).join('');
    }
    // Example usage when consented
    const user_data = {
      ...(email && { em: await sha256(email) }),
      ...(phone && { ph: await sha256(phone) })
    };
    ```
- Advanced Matching in Pixel
  - Leave Automatic Advanced Matching on in Pixel tag; we already enrich `user_data` from code (CSP‑safe).

## Naming & Structure (Consistency + Scalability)
- Tags
  - `GA4 – Config`
  - `GA4 – Event – <EventName>` (or a single GA4 Event tag with regex trigger)
  - `Meta – Pixel – Setup`
  - `Meta – Pixel – Event`
  - `Meta – CAPI – Server`
- Triggers
  - `CE – <custom_event>` (e.g., `CE – page_view`, `CE – purchase_completed`)
  - `SC – Scroll Depth`
  - `Init – All Pages` (or `Consent Init – All Pages`)
- Variables
  - `DL – <name>` (dataLayer v2)
  - `Cookie – <name>`; `Query – <name>`
  - `CJS – <name>` for custom JS (avoid where possible due to CSP)
  - `CSV – Google tag Configuration settings`; `ESV – GA4 Event defaults`

## Redundancy Checklist
- One GA4 Config only (with `transport_url` + `send_page_view=false`).
- Pixel Setup fires once per load; Pixel Event fires only on your custom events (no `gtm.dom`).
- Dedup uses the same `event_id` everywhere (browser Pixel + sGTM CAPI).
- `user_data` enrichment happens in app code (CSP‑safe), not via remote ParamBuilder.

## Implementation Steps
1. Web GTM
  - Remove `gtm.dom` from Pixel Event trigger and from `FBEventName` mapping.
  - Fix `Event_ID_Constant` → `18c60..._{{DL - Event ID}}` only.
  - Add `SC – Scroll Depth` trigger to Pixel Event; map `gtm.scrollDepth` → `ScrollDepth`.
  - Collapse GA4 Configs into a single tag: `transport_url` set; `send_page_view=false`.
2. Server GTM
  - Move Access Token into sGTM Secret; rotate the exposed token.
  - Ensure the Meta tag reads: `event_id`, `event_source_url`, UA/IP, and `user_data` (`fbp`/`fbc`/PII) from the event.
3. Code
  - Keep `meta-ids.ts` and attach `user_data` in `src/analytics/plugins/gtm.ts` (already done).
  - Only include hashed PII on consented, high‑intent events.

## Validation
- Pixel Helper: one `PageView` per page; custom `ScrollDepth` with `percent`.
- Events Manager → Test Events: verify `event_id` dedup (no duplicates), `fbp/fbc` present, EMQ trending upward.
- sGTM Debug: confirm Meta tag receives `event_id`, UA/IP, `fbp/fbc`, and hashed PII on Lead/Purchase.


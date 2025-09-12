# GTM Events Catalog (Source of Truth)

This catalog lists every analytics event emitted by the site, where it originates in code, the payload shape (keys and examples), and GTM/GA4 configuration notes. Payloads shown here are before GTM tag mapping but after your GTM plugin normalization (which also adds `event_id` and `timestamp`).

Notes
- The GTM plugin pushes to `window.dataLayer` and normalizes strings; it adds `event_id` and ISO `timestamp`, and in dev may include `debug_info`.
- For purchases, the GTM plugin prevents duplicates and emits `purchase_blocked_duplicate` when needed.
- Server-side purchases are forwarded via Netlify `server-gtm` to your Server GTM endpoint (`SGTM_ENDPOINT`) and then to GA4.

## Initialization

- event: `page_view`
  - sources:
    - src/assets/js/app.ts:111
    - src/components/ui/thank-you/index.ts:201
  - payload keys: `page_title?`, `page_location?` or `{ page: 'thank_you', conversion: true }`
  - example: `{ event: 'page_view', page_title: document.title, page_location: location.href }`
  - GTM: GA4 Event tag with trigger on Event name equals `page_view`.

- event: `app_initialized`
  - source: src/assets/js/app.ts:122
  - payload keys: `event_category`, `components_count`
  - example: `{ event: 'app_initialized', event_category: 'Application', components_count: 10 }`

- event: `components_initialized`
  - source: src/assets/js/app.ts:349
  - payload keys: `event_category`, `success_count`, `failure_count`, `total_components`
  - example: `{ event: 'components_initialized', event_category: 'Application', success_count: n, failure_count: m, total_components: t }`

## Content Interactions

- event: `banner_cta_click`
  - source: src/_includes/sections/top-banner/index.ts:55
  - payload: `{ section: 'top-banner', element_type: 'banner_cta', element_text }`

- event: `urgency_message_click`
  - sources: src/_includes/sections/top-banner/index.ts:67, src/_includes/sections/final-cta/index.ts:60
  - payload: `{ section: 'top-banner'|'final-cta', element_type: 'urgency_message', element_text }`

- event: `final_cta_click`
  - source: src/_includes/sections/final-cta/index.ts:48
  - payload: `{ section: 'final-cta', element_type: 'final_cta_button', element_text }`

- event: `solution_pillar_click`
  - source: src/_includes/sections/solution/index.ts:44
  - payload: `{ section: 'solution', element_type: 'solution_pillar', pillar_number, element_text }`

- event: `solution_cta_click`
  - source: src/_includes/sections/solution/index.ts:57
  - payload: `{ section: 'solution', element_type: 'cta_button', element_text }`

- event: `vision_outcome_engagement`
  - source: src/_includes/sections/problem/index.ts:194
  - payload: `{ section: 'vision', element_type: 'vision_outcome', element_index, engagement_duration, element_text }`

- event: `vision_outcome_click`
  - source: src/_includes/sections/problem/index.ts:208
  - payload: `{ section: 'vision', element_type: 'vision_outcome', element_index, total_interactions, element_text }`

- event: `vision_outcome_focus`
  - source: src/_includes/sections/problem/index.ts:219
  - payload: `{ section: 'vision', element_index, navigation_method: 'keyboard' }`

- event: `vision_cta_click`
  - source: src/_includes/sections/problem/index.ts:231
  - payload: `{ section: 'vision', total_vision_outcome_interactions, user_engagement_level }`

- event: `credential_click`
  - source: src/_includes/sections/about/index.ts:44
  - payload: `{ section: 'about', element_type: 'credential_item', element_text }`

- event: `presenter_photo_click`
  - source: src/_includes/sections/about/index.ts:56
  - payload: `{ section: 'about', element_type: 'presenter_photo' }`

- event: `authority_element_click`
  - source: src/_includes/sections/about/index.ts:67
  - payload: `{ section: 'about', element_type: 'authority_element', element_text }`

- event: `view_mbway_option`
  - source: src/_includes/sections/offer/index.ts:68
  - payload: `{ section: 'offer', element_type: 'mbway_toggle', action: 'open'|'close' }`

- event: `whatsapp_click`
  - sources: global handler in src/assets/js/app.ts:200-217; element at src/_includes/partials/whatsapp-button.njk:22
  - payload: `{ link_url, link_text, location, analytics_event, click_timestamp, utm_source?, utm_medium?, utm_campaign?, page_url, page_title }`
  - example: `{ event: 'whatsapp_click', link_url, link_text, location, utm_source?, ... }`

- event: `countdown_view`
  - source: src/_includes/sections/top-banner/index.ts:103
  - payload: `{ section: 'top-banner', element_type: 'countdown_timer', event_date }`

- event: `countdown_expired`
  - source: src/_includes/sections/top-banner/index.ts:165
  - payload: `{ section: 'top-banner', element_type: 'countdown_timer' }`

- event: `ui_interaction`
  - sources: src/components/ui/thank-you/index.ts:77, 132
  - payload examples: `{ interaction: 'progress_bar_animated', progress_value }`, `{ interaction: 'celebration_shown', page: 'thank_you' }`

- event: `personalization`
  - source: src/components/ui/thank-you/index.ts:185
  - payload: `{ type: 'greeting_personalized', page: 'thank_you' }`

- event: `video_play`
  - source: GTM plugin via AnalyticsHelpers.trackVideoProgress
  - callers: src/utils/youtube.ts:190, 238
  - payload: `{ video_title, video_percent_played, ... }`

## Engagement & Views

- event: `section_view`
  - source: src/analytics/plugins/section-tracking.ts:69, 120
  - payload: `{ section_name, section_id, percent_visible, timestamp }`

- event: `view_testimonials_section` (legacy alias)
  - source: src/analytics/plugins/section-tracking.ts:73, 124
  - payload: `{ section_name, percent_visible?, timestamp }`

- event: `scroll_depth`
  - source: src/analytics/plugins/scroll-tracking.ts:95
  - payload: `{ depth_percentage: 10|25|50|75|90, depth_pixels, timestamp }`

- event: `section_engagement`
  - sources: src/_includes/sections/social-proof/index.ts:310; src/_includes/sections/checkout/index.ts:971, 1046
  - payload: `{ section, action, ... }`

- event: `faq_toggle`
  - source: GTM plugin via PlatformAccordion
  - caller: src/components/ui/accordion/index.ts:116
  - payload: `{ action: 'open'|'close', question, item }`

- event: `faq_meaningful_engagement`
  - source: GTM plugin via PlatformAccordion
  - caller: src/components/ui/accordion/index.ts:122
  - payload: `{ toggle_count, section_name: 'faq', last_question, last_item }`

## Checkout & Conversions

- event: `checkout_opened` and alias `cta_click`
  - source: GTM plugin (trackCTAClick)
  - caller: src/_includes/sections/checkout/index.ts:266
  - payload: `{ source_section, trigger_location, action: 'modal_opened' }`

- event: `begin_checkout` (GA4 recommended)
  - source: src/_includes/sections/checkout/index.ts:264
  - payload: `{ currency: 'EUR', value, items: [{ item_id, item_name, price, quantity }], source_section }`

- event: `add_payment_info` (GA4 recommended)
  - source: src/_includes/sections/checkout/index.ts:566
  - payload: `{ payment_type: 'card'|'multibanco'|'sepa_debit'|..., currency: 'EUR', value, items: [...] }`
  - notes: Fires once per method change (deduped). Combined with accordion layout (no default method), this captures explicit user choice.

- event: `payment_method_selected`
  - source: src/_includes/sections/checkout/index.ts (Payment Element change handler)
  - payload: `{ payment_type, currency: 'EUR', value, items: [...] }`
  - notes: Mirrors add_payment_info for GTM audiences/logic. Emitted via analytics → dataLayer with event_id/timestamp.

- event: `form_submission`
  - source: src/_includes/sections/checkout/index.ts:883
  - payload: `{ section: 'checkout', action: 'lead_submitted', lead_id }`

- event: `lead_form_submitted`
  - source: GTM plugin (trackConversion)
  - caller: src/_includes/sections/checkout/index.ts:878
  - payload: `{ lead_id, form_location: 'checkout_modal', pricing_tier }`

- event: `generate_lead` (GA4 recommended)
  - source: src/_includes/sections/checkout/index.ts:883
  - payload: `{ lead_id, form_location: 'checkout_modal' }`

- event: `purchase_completed`
  - source: Server webhook (SGTM) only → netlify/functions/stripe-webhook.ts
  - payload: `{ transaction_id, value, currency: 'EUR', items[], payment_method?, ... }` (sent to SGTM/GA4)

- event: `purchase_completed_ui` (diagnostic only)
  - sources: src/_includes/sections/checkout/index.ts, src/_includes/sections/thank-you/index.ts
  - payload: `{ payment_intent_id, value, currency: 'EUR', items[], pricing_tier?, payment_method?, completion_source? }`

- event: `purchase_blocked_duplicate`
  - source: GTM plugin (duplicate prevention)
  - payload: `{ blocked_transaction_id, blocked_at, original_timestamp }`

- event: `payment_flow`
  - sources: src/_includes/sections/thank-you/index.ts:536, 588, 619
  - event_type: `multibanco_voucher_displayed` | `purchase_completed` | `payment_failed`
  - payload: `{ event_type, payment_intent?, payment_method, amount, currency, page_location, timestamp, failure_reason?, failure_source? }`

- event: `conversion_funnel`
  - sources: src/_includes/sections/thank-you/index.ts:549, 630
  - funnel_step: `payment_initiated` | `payment_failed`
  - payload: `{ funnel_step, payment_method, voucher_status?, amount?, currency?, failure_reason?, dropout_point? }`

## Errors

- event: `error`
  - source: src/analytics/plugins/error.ts
  - payload: `{ error_message, error_stack, error_filename?, error_lineno?, error_colno?, ...context }`

- event: `section_engagement` (`payment_error` variant)
  - source: src/_includes/sections/checkout/index.ts:943-963
  - payload: `{ section: 'checkout', action: 'payment_error', error_type, error_code, error_message, lead_id }`

## Server-Side (SGTM)

- stripe-webhook to Server GTM: netlify/functions/stripe-webhook.ts:682-780 → netlify/functions/server-gtm.ts
  - builds GA4 purchase event and posts to `SGTM_ENDPOINT/mp/collect`
  - identifies client with `client_id = metadata.ga_client_id || user_session_id || paymentIntent.id`
  - items shape: `{ item_id, item_name, item_category, quantity, price, currency, item_variant? }`
  - user data SHA-256 hashed via `pii-hash.ts`

Additional GA4 parameters sent via custom_parameters (when available)
- `payment_method`, `customer_type`, `affiliate_id`, `affiliation`, `coupon`, `shipping`, `tax`
- First-touch attribution: `first_utm_source`, `first_utm_campaign`, `first_landing_page`

---

## GTM Setup Checklist

- Triggers
  - GA4 Event triggers for KPIs: `begin_checkout`, `add_payment_info`, `generate_lead`, `payment_flow` (by `event_type`), `conversion_funnel`.
  - Purchase is server-side (SGTM). Do not fire a client GA4 Purchase tag.
  - Optional diagnostics/logic: `payment_method_selected` (for audiences), `purchase_completed_ui`, `app_initialized`, `components_initialized`, `purchase_blocked_duplicate`, `error`.

- Variables
  - Common: `event_id`, `timestamp`, `section`, `section_name`, `element_type`, `element_text`, `element_index`, `source_section`, `trigger_location`.
  - WhatsApp: `link_url`, `link_text`, `location`, `analytics_event`, `utm_source`, `utm_medium`, `utm_campaign`.
  - Video: `video_title`, `video_percent_played`.
  - FAQ: `action`, `question`, `item`, `toggle_count`.
  - Scroll: `depth_percentage`, `depth_pixels`.
  - Checkout/Conversion: `lead_id`, `transaction_id`, `value`, `currency`, `items`, `pricing_tier`, `payment_method`, `completion_source`, `event_type`, `failure_reason`, `failure_source`, `voucher_status`, `ga_client_id`, `ga_session_id`, `ga_session_number`.
  - First-touch: `first_utm_source`, `first_utm_campaign`, `first_landing_page` (prefer user_properties in GA4 when available).

- Tags
  - GA4: map key parameters to custom dimensions/metrics (e.g., `source_section`, `payment_method`, `voucher_status`, `failure_reason`).
  - Consider a QA property to receive `purchase_blocked_duplicate` and `error`.

- Testing
  - Use GTM Preview and verify `dataLayer` payloads for each event path.
  - Local E2E: run `npm run netlify:dev` and `npm run test:e2e` and compare preview console events.

## Transport URL & Server Gateway

- GA4 Config Tag (client): set Transport URL to your Server GTM endpoint: `https://gtm.jucanamaximiliano.com.br/g/collect`.
- GTM (web): ensure hits route through your server container first-party domain; consent can be forwarded server-side.
- SGTM: purchase events already go through `SGTM_ENDPOINT/mp/collect` via the webhook.

## Cross-domain & Referral Exclusions

- Cross-domain linking: enable for your owned domains (e.g., `*.jucanamaximiliano.com.br`, `*.cafecomvendas.*`, etc.).
- Referral exclusions: add your own domains to prevent self-referrals and session breaks.

## GA4 Hygiene & Naming

- If you send manual `page_view`, disable default GA4 page_view in the GA4 Config tag.
- Register only the custom dimensions you will analyze (e.g., `source_section`, `payment_method`, `voucher_status`, `failure_reason`).
- Use GTM folders: `01 Config`, `02 Events`, `03 Utilities`, `90 QA/Diagnostics`.

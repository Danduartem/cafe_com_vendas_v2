# Analytics & Conversion Improvements

## Immediate fixes
- `src/assets/js/utils/gtm-normalizer.ts:21` lowercases and strips every string value (including URLs, campaign names and GA4 recommended parameters). This turns `https://` into `https` and truncates values before GTM sees them, so GA4/Meta lose referral context and transaction IDs. Limit the sanitizer to event names or explicitly exempt keys such as `page_location`, `link_url`, `currency`, `transaction_id`, etc.
- Purchase completions never reach GTM: the frontend fires `purchase_complete` (`src/components/ui/thank-you/index.ts:207`), but the GTM trigger and duplicate guard expect `purchase_completed` (`docs/gtm_config/GTM-T63QRLFT_workspace47.json:1829`, `docs/gtm_config/GTM-T63QRLFT_workspace47.json:1944`). Rename the event or adjust triggers so GA4, Meta Pixel and the CAPI server tag actually fire on purchases.
- The `checkout_opened` payload pushed from the modal lacks `value`, `currency` and `items` (`src/_includes/sections/checkout/index.ts:274`), yet the GA4 Begin Checkout tag reads those keys from the same event (`docs/gtm_config/GTM-T63QRLFT_workspace47.json:75`). Either populate those properties on `checkout_opened` or trigger the tag off the richer `begin_checkout` event you already push in the next line (`src/_includes/sections/checkout/index.ts:279`).

## Web GTM container
- The Meta Pixel event tag is wired to the scroll-depth trigger as well as your conversion events (`docs/gtm_config/GTM-T63QRLFT_workspace47.json:1840` and `docs/gtm_config/GTM-T63QRLFT_workspace47.json:1934`). When it fires on `gtm.scrollDepth` the `FBEventName` lookup falls back to a custom event, bloating Pixel with noise. Drop the scroll trigger or map it to a dedicated engagement event.
- Every tag in the export shows `"consentStatus": "NOT_SET"` (for example `docs/gtm_config/GTM-T63QRLFT_workspace47.json:67`). If you operate in the EU you should wire GTM Consent Mode (default denied + update on acceptance) so GA4, Ads and Meta respect consent before firing.
- The first-touch attribution HTML tag (`docs/gtm_config/GTM-T63QRLFT_workspace47.json:1422`) duplicates the cookie logic you already run in `ensureUtmCookies()` (`src/analytics/utils/meta-ids.ts:56`). Keeping both can set conflicting cookie domains. Choose one implementation—ideally the GTM HTML with registered domain handling—and delete or disable the other.
- The hard-coded nonce in the Pixel setup snippet (`docs/gtm_config/GTM-T63QRLFT_workspace47.json:1860`) will fail if your CSP rotates nonces per request. Either remove the nonce or inject the real value from the server template before publishing.

## Server GTM container
- GA4 server processing keeps visitor IPs intact (`docs/gtm_config/GTM-TGS6JMN9_workspace10.json:54`). Unless you have a legal basis to store raw IPs, flip this to `true` so IPs are redacted before they hit GA4/Ads.
- As in the web container, every server tag still reports `"consentStatus": "NOT_SET"` (`docs/gtm_config/GTM-TGS6JMN9_workspace10.json:76`). Mirror your CMP signals here so the server container honours user consent when forwarding hits to GA4 and the Meta CAPI tag.

## Attribution & channel tracking
- WhatsApp links currently open without any campaign tagging (`src/_includes/partials/whatsapp-button.njk:10`). Append descriptive UTMs (for example `utm_source=site&utm_medium=whatsapp&utm_campaign=cafe_com_vendas`) so downstream GA4/Ads reports can isolate these high-intent clicks.
- You build a `generate_lead` event after `lead_form_submitted` (`src/_includes/sections/checkout/index.ts:1032`), but no GTM trigger listens for it. Either drop the duplicate event or add GA4/Pixel tags that react to the richer payload.

## Analytics runtime
- Align the GA4 helper so `analytics.track('begin_checkout', …)` and the GTM trigger agree on one canonical event name. Today you push both `checkout_opened` and `begin_checkout` for the same action without ensuring both are consumed, which complicates debugging and risks inconsistent metrics (`src/_includes/sections/checkout/index.ts:274`, `docs/gtm_config/GTM-T63QRLFT_workspace47.json:1920`).
- After fixing the sanitizer, extend `AnalyticsHelpers.trackWhatsAppClick` to include the preserved `page_location` and link parameters so Meta CAPI receives user data (the object is already passed but scrubbed). This will improve match rates once the `user_data` payload survives normalization (`src/analytics/plugins/gtm.ts:308`).

Addressing the items above will close the current data gaps and give GA4, Google Ads and Meta Ads the reliable conversion signals you need for optimisation.

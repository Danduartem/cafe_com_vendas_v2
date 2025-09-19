# GA4 Exploration Playbook

This playbook proposes GA4 Explorations tailored to the Café com Vendas tracking stack (GTM containers `GTM-T63QRLFT` web + `GTM-TGS6JMN9` server). It focuses on visibility across acquisition, on-site engagement, lead generation, and payment outcomes so you can tune campaigns with evidence.

## Prerequisites

1. **Validate custom definitions** so GA4 recognizes your existing parameters and add only the missing ones. You already have the event-scoped fields (`source_section`, `event_type`, `failure_reason`, `voucher_status`, etc.)—great! Use this checklist to confirm everything is aligned:

   1. GA4 → `Admin` → `Custom definitions` → search each parameter name listed below.
   2. If it already exists with the scope shown, no further action is needed.
   3. If it is missing, click `Create custom dimension`, fill in the suggested name, select the scope, type the event parameter exactly (case-sensitive), then save.
   4. Optional but recommended: create the **user-scoped** versions for first-touch attribution so Explorations and standard reports can mix session and user views without sampling resets.

   | Dimension name (keep or create) | Required scope | Event parameter | Populated by |
   | --- | --- | --- | --- |
   | `Source section` (already present) | Event | `source_section` | `begin_checkout`, `cta_click`, `lead_form_submitted`, `whatsapp_click` |
   | `Event type` (already present) | Event | `event_type` | `payment_flow` variants |
   | `Failure reason` (already present) | Event | `failure_reason` | `payment_flow`, `conversion_funnel` |
   | `Failure source` (already present) | Event | `failure_source` | `payment_flow`, `conversion_funnel` |
   | `Voucher status` (already present) | Event | `voucher_status` | `payment_flow`, `conversion_funnel` |
   | `Pricing tier` (already present) | Event | `pricing_tier` | `begin_checkout`, `purchase_completed_ui` |
   | `Payment method` (already present) | Event | `payment_method` | `add_payment_info`, `payment_flow`, server `purchase` |
   | `Lead ID` (already present) | Event | `lead_id` | `generate_lead`, `payment_flow` |
   | `Form location` (already present) | Event | `form_location` | `generate_lead` |
   | `First landing page` (already present) | Event | `first_landing_page` | Cookie defaults in GTM |
   | `First UTM source` (already present) | Event | `first_utm_source` | Cookie defaults in GTM |
   | `First UTM campaign` (already present) | Event | `first_utm_campaign` | Cookie defaults in GTM |

   **Optional user-scoped additions (create if you want persistent first-touch in user-level tables):**

   | Dimension name (suggested) | Scope | Event parameter |
   | --- | --- | --- |
   | `First touch source (user)` | User | `first_utm_source` |
   | `First touch campaign (user)` | User | `first_utm_campaign` |
   | `First landing page (user)` | User | `first_landing_page` |

   Tip: you can keep the event-scoped versions for detailed event reports and add these user-scoped copies to unlock additional Explore breakdowns (e.g., comparing user acquisition cohorts across sessions).

2. **Mark key events as conversions** (Admin → Events): `generate_lead`, `purchase` (forwarded server-side), optionally `begin_checkout`.

3. **Verify BigQuery export (optional)** if you plan to stitch with ad cost data later. Explorations can work without it, but export unlocks advanced modeling. To confirm or enable:

   1. GA4 → `Admin` → under the **Product links** column choose `BigQuery Links`.
   2. If you see an active link, click it and confirm **Daily export** (and optionally **Streaming export**) are enabled.
   3. If no link exists, click `Link` → pick your Google Cloud project → choose the dataset location and export frequency (daily is enough for campaign analysis) → submit.
   4. In BigQuery console (`console.cloud.google.com/bigquery`) open the dataset to make sure tables like `events_YYYYMMDD` or `events_intraday_YYYYMMDD` appear after the next day’s run.
   5. Note the dataset name—you’ll use it when connecting cost data or running SQL models later (e.g., through Looker Studio or dbt).

4. **Confirm data freshness**: each Explore uses near-real-time web events and server `purchase` relayed through the Netlify webhook → Server GTM → GA4 pipeline.

---

## Exploration 1 – Acquisition & Visitor Quality (Free Form)

**Goal:** Measure unique visitors, understand which channels/campaigns drive engaged traffic, and surface first-touch attribution.

**Build steps:**

1. GA4 → Explore → Blank. Rename the tab to `Acquisition quality`.
2. In *Variables* panel
   - Add **Dimensions:** `Session default channel group`, `Source / medium`, `First user source`, `First user campaign`, `first_utm_source`, `first_utm_campaign`, `first_landing_page`, `source_section`.
   - Add **Metrics:** `Total users`, `New users`, `Sessions`, `Engaged sessions`, `Engagement rate`, `Average engagement time per session`, `Event count`.
3. Create **User segments** (Segments → + → User segment) and set **Condition scoping** to `True at any point in time` so users stay in the group if they ever met the rule:
   - `Users – Paid ads`: start with `Session default channel group` → `matches regex` → `Paid Search|Paid Social`. Add an **OR** condition using your custom dimension `first_utm_source` → operator `contains` → `facebook` (duplicate for `meta`, `instagram`, `google`, etc.). `Source / medium` often fails to pattern-match inside segments, so leaning on `first_utm_source` keeps the rule reliable.
   - `Users – Organic & referral`: add a condition `Session default channel group` → `matches regex` → `Organic Search|Organic Social|Referral` (no secondary condition needed).
4. Configure the tab (right panel → `Tab settings`):
   - `Technique`: Free form.
   - `Visualization`: Table.
   - Under **Rows**, click `+` → add `First user source` (this is GA4’s built-in first-touch). Leave `Start row` at 1 and `Show rows` at 10 (or expand if you want more).
   - Leave **Columns** empty for now (or add `Date` later if you want a time breakdown).
   - Under **Values**, click `+` three times to add the metrics `Total users`, `Engaged sessions`, and `Engagement rate`. Change `Cell type` to `Plain text` if you prefer numbers instead of mini bar charts.
   - In the **Segment comparisons** area (top of the Tab settings panel), click `+` twice and choose the two user segments you created (`Users – Paid ads` and `Users – Organic & referral`). This shows them side by side in the table.
   - Optional: duplicate the tab (right-click the tab name) and in the copy replace the row with your custom `first_utm_source` to compare cookie-based attribution.
5. Add a second visualization (right-click → Duplicate tab as table) with rows `first_utm_campaign`, columns `source_section` to spot top-performing entry points.
6. Optional filter: exclude internal traffic if you configured an `Test` data stream by adding `Country` or `Device category` filters.

**Read it:**
- Paid vs organic user quality (compare engagement rate & time on site).
- Campaigns or sections with high engaged users but low leads (flag for optimization later).
- Use `first_landing_page` to validate landing page intent vs ad creative.

---

## Exploration 2 – Engagement & Bounce Health (Free Form)

**Goal:** Spot sessions that leave without interacting vs those that engage (scroll, FAQ, video, WhatsApp, CTA) to diagnose content resonance.

**Build steps:**

1. Add a new tab → Free form → rename to `Engagement health`.
2. Dimensions to add: `Event name`, `source_section`, `Session default channel group`, `first_utm_source`.
3. Metrics: `Event count`, `Users`, `Average engagement time`, `Engaged sessions`.
4. Create **Session segments**:
   - `Sessions – No engagement`: scope `Session`, condition `Engaged session` is `False`.
   - `Sessions – Engaged`: scope `Session`, condition `Engaged session` is `True` AND `Event name` matches one of `section_view`, `cta_click`, `whatsapp_click`, `faq_toggle`, `video_play` (use `Add condition` → `Event name` → `matches regex` → `section_view|cta_click|whatsapp_click|faq_toggle|video_play`).
5. Table setup: Rows `Session default channel group`, Columns `Segments`, Values `Users`, `Event count`, `Average engagement time`.
6. Add a filter (Tab settings → Filters) to include `Event name` matching `page_view|section_view|cta_click|whatsapp_click|faq_toggle|video_play|conversion_funnel` so the view stays focused on meaningful actions.
7. Add a secondary visualization (line chart) using breakdown `Date` (daily) and metrics `Users` for each segment to monitor bounce trends.

**Read it:**
- The ratio between `Sessions – No engagement` and `Sessions – Engaged` acts as your bounce proxy.
- Breakdowns highlight channels or UTMs with high non-engaged sessions → refine targeting or landing messages.
- `source_section` column pinpoints page modules that successfully pull visitors into the journey.

---

## Exploration 3 – CTA → Lead Funnel (Funnel Exploration)

**Goal:** Quantify drop-off from visitors opening the checkout to submitting the lead form, segmented by traffic source and on-page section.

**Build steps:**

1. Add new tab → select `Funnel exploration`. Name it `CTA to lead`.
2. Configure **Steps** (Step settings → + Step):
   - Step 1 `Checkout opened`: `Event name` exactly `begin_checkout`.
   - Step 2 `Payment details`: `Event name` `add_payment_info` (you can add condition `payment_method` is not `(not set)` to ensure an explicit selection).
   - Step 3 `Lead submitted`: `Event name` `generate_lead`.
3. Funnel settings: choose `Closed funnel` (requires steps in order) and enable `Show elapsed time` to see friction between steps.
4. Breakdowns: add `source_section` and `first_utm_source`. You can also apply the `Users – Paid ads` segment created earlier to focus on campaign traffic.
5. Additional filter: include only `pricing_tier = early_bird` (if you want to isolate a specific offer) or leave unfiltered for full volume.
6. Duplicate the tab and swap breakdown to `Device category` to see mobile vs desktop performance.

**Read it:**
- Step conversion rates show whether friction is pre-form (CTA copy/layout) or form-related (validation issues).
- `Elapsed time` between Step 2 and Step 3 surfaces form friction (slow completions may imply long form or unclear instructions).
- Compare funnels by segment (Paid vs Organic) for media optimization.

---

## Exploration 4 – Payment Outcomes & Denials (Free Form + Calculated fields)

**Goal:** Track payment attempts, failures (with reasons), pending Multibanco vouchers, and successful purchases to spot revenue leaks.

**Build steps:**

1. Add a Free form tab named `Payment outcomes`.
2. Dimensions: `Event name`, `event_type`, `funnel_step`, `payment_method`, `failure_reason`, `failure_source`, `voucher_status`, `first_utm_source`, `first_utm_campaign`.
3. Metrics: `Event count`, `Total revenue`, `Purchases`, `Average purchase revenue` (if enabled), plus create calculated fields:
   - `Failed payments` = `CASE WHEN Event name = "payment_flow" AND event_type = "payment_failed" THEN Event count ELSE 0 END`.
   - `Voucher generated` = `CASE WHEN Event name = "payment_flow" AND event_type = "multibanco_voucher_displayed" THEN Event count ELSE 0 END`.
   - `Successful purchases` = `CASE WHEN Event name = "purchase" THEN Event count ELSE 0 END`.
   - `Failure rate` = `Failed payments / (Failed payments + Successful purchases)` (set output type to Percentage).
4. Filters: include events matching `payment_flow|conversion_funnel|purchase`. This keeps the table focused on payments.
5. Table layout: Rows `payment_method`, Columns `first_utm_source`, Values `Failed payments`, `Successful purchases`, `Failure rate`, `Total revenue`.
6. Add a secondary table with Rows `failure_reason` to drill into Stripe denial codes, and another with Rows `voucher_status` to monitor Multibanco completions.
7. Optional segment: `Sessions – Leads` (Session segment where `generate_lead` occurred) to see how many qualified leads hit payment friction.

**Read it:**
- High `Failure rate` by `payment_method` signals checkout UX or payment processor issues.
- `failure_reason` exposes hard vs soft declines; focus ads on geos/methods with healthier approval rates.
- `Voucher generated` vs `Successful purchases` reveals Multibanco abandonment—use for reminder workflows.

---

## Acting on Insights

- **Acquisition tuning:** Shift budget toward sources with high engaged-user share and efficient lead funnel progression. Poor-performing campaigns with high `Sessions – No engagement` likely need landing page or creative tweaks.
- **On-page experimentation:** Use `source_section` insights to prioritize copy/tests on sections that underperform across steps (e.g., lots of `begin_checkout` but few `generate_lead`).
- **Payment recovery:** Combine `failure_reason` + `first_utm_source` to identify ad sets sending low-quality traffic vs genuine processing issues. Feed these learnings into remarketing (e.g., dynamic audiences for `payment_failed`).
- **Lifecycle automation:** Trigger CRM flows using `lead_id` + payment outcome data (e.g., remind Multibanco leads who generated a voucher but never completed payment).

Keep these Explorations saved and duplicate them when you spin up new campaigns—swap filters (UTMs, pricing tiers) to benchmark performance and focus optimization where it moves conversion rate the most.

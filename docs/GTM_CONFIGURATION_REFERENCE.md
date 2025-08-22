# 🎯 GTM Configuration Reference — Café com Vendas (Unified Event Naming)

> **Container ID**: `GTM-T63QRLFT`
> **Last Updated**: 2025-08-22
> **Purpose**: Single source of truth for dataLayer event names, payloads, and GA4 mappings. This replaces prior variations and **standardizes the payment event to `payment_completed` (mapped to GA4 `purchase`)**.

---

## 📌 Event Canon (dataLayer → GA4)

| dataLayer Event             | GA4 Event (recommended)     | Notes                                                         |
| --------------------------- | --------------------------- | ------------------------------------------------------------- |
| `gtm_init`                  | (config boot)               | Used to fire GA4 Config.                                      |
| `checkout_opened`           | `checkout_opened`           | Keep as custom event (existing setup).                        |
| `payment_completed`         | `purchase`                  | **Unified name**; replaces any `purchase_completed` variants. |
| `lead_form_submitted`       | `lead_form_submitted`       | Optionally map to GA4 `generate_lead`.                        |
| `scroll_depth`              | `scroll_depth`              | 10/25/50/75/90 thresholds.                                    |
| `faq_toggle`                | `faq_toggle`                | Custom engagement.                                            |
| `faq_meaningful_engagement` | `faq_meaningful_engagement` | Fires on 3+ toggles.                                          |
| `video_play`                | `video_play`                | Include `percent_played`.                                     |
| `view_testimonial_slide`    | `view_testimonial_slide`    | Include `testimonial_id`, `position`.                         |
| `view_testimonials_section` | `view_testimonials_section` | Section impression.                                           |
| `whatsapp_click`            | `whatsapp_click`            | Include `link_url`, `location`.                               |

---

## 🔧 Normalization Rules (to minimize GA4 cardinality)

* **Strings**: lowercase, alphanumeric + dash/underscore, ≤ 50 chars
* **IDs**: preserve uniqueness, sanitized, ≤ 100 chars
* **Numbers**: keep numeric types (no normalization)
* **Arrays/Objects**: keep structure (e.g., `items`)
* **Unknowns**: default to `"other"`

---

## 🏷️ Event Payloads (dataLayer Examples + Required GTM Variables)

### 1) Lead Form Submitted

```js
{
  event: "lead_form_submitted",
  lead_id: "test_1234567890",
  form_location: "checkout_modal",
  source_section: "pricing_table"
}
```

**GTM Variables**:
`DL - Lead ID` → `lead_id` • `DL - Form Location` → `form_location` • `DL - Source Section` → `source_section`.

---

### 2) Checkout Opened

```js
{
  event: "checkout_opened",
  value: 180,
  currency: "EUR",
  pricing_tier: "early_bird",
  items: [{
    item_id: "SKU_CCV_PT_2025",
    item_name: "Café com Vendas – Portugal 2025",
    price: 180,
    quantity: 1,
    item_category: "Event"
  }]
}
```

**GTM Variables**:
`DL - Value` • `DL - Currency` • `DL - Pricing Tier` • `DL - Items`.
**GA4**: Send as `checkout_opened`.

---

### 3) **Payment Completed** (**Unified**)

```js
{
  event: "payment_completed",
  transaction_id: "pi_1abc2def3ghi",
  value: 180,
  currency: "EUR",
  items: [{
    item_id: "SKU_CCV_PT_2025",
    item_name: "Café com Vendas – Portugal 2025",
    price: 180,
    quantity: 1,
    item_category: "Event"
  }],
  pricing_tier: "early_bird"
}
```

**GTM Variables**:
`DL - Transaction ID` • `DL - Value` • `DL - Currency` • `DL - Items` • `DL - Pricing Tier`.
**GA4 Mapping**: **Event name**: `purchase` (parameters: `transaction_id`, `value`, `currency`, `items`).
(Replaces any prior `purchase_completed` references.)

---

### 4) FAQ Toggle

```js
{
  event: "faq_toggle",
  action: "open",
  question: "como funciona o cafe com vendas"
}
```

**GTM Variables**: `DL - FAQ Action` • `DL - FAQ Question`.

---

### 5) FAQ Meaningful Engagement

```js
{
  event: "faq_meaningful_engagement",
  engagement_type: "faq_meaningful",
  toggle_count: 3
}
```

**GTM Variables**: `DL - Engagement Type` • `DL - Toggle Count`.

---

### 6) Video Play

```js
{
  event: "video_play",
  video_title: "depoimento joao ccv 2024",
  percent_played: 0
}
```

**GTM Variables**: `DL - Video Title` • `DL - Video Percent Played`.

---

### 7) View Testimonial Slide

```js
{
  event: "view_testimonial_slide",
  testimonial_id: "tst_03",
  position: 2
}
```

**GTM Variables**: `DL - Testimonial ID` • `DL - Testimonial Position`.

---

### 8) View Testimonials Section

```js
{
  event: "view_testimonials_section",
  section: "testimonials"
}
```

**GTM Variables**: `DL - Section`.

---

### 9) WhatsApp Click

```js
{
  event: "whatsapp_click",
  link_url: "wa.me/351912345678",
  link_text: "falar no whatsapp",
  location: "footer"
}
```

**GTM Variables**: `DL - Link URL` • `DL - Link Text` • `DL - Location`.

---

### 10) Scroll Depth

```js
{
  event: "scroll_depth",
  percent_scrolled: 50,
  timestamp: "2025-01-20T10:30:00.000Z"
}
```

**GTM Variables**: `DL - Percent Scrolled`.

---

## 🧰 Required GTM Variables (Data Layer)

Create these **Data Layer Variables** (names → DL key):

* `DL - Lead ID` → `lead_id`
* `DL - Form Location` → `form_location`
* `DL - Source Section` → `source_section`
* `DL - Value` → `value`
* `DL - Currency` → `currency`
* `DL - Pricing Tier` → `pricing_tier`
* `DL - Items` → `items`
* `DL - Transaction ID` → `transaction_id`
* `DL - FAQ Action` → `action`
* `DL - FAQ Question` → `question`
* `DL - Engagement Type` → `engagement_type`
* `DL - Toggle Count` → `toggle_count`
* `DL - Video Title` → `video_title`
* `DL - Video Percent Played` → `percent_played`
* `DL - Testimonial ID` → `testimonial_id`
* `DL - Testimonial Position` → `position`
* `DL - Section` → `section`
* `DL - Percent Scrolled` → `percent_scrolled`

---

## 🔁 Normalizer Helpers (Custom JS Variables)

### A) `JS - Normalize String`

```javascript
function() {
  var value = {{DL - Raw Value}} || 'other';
  value = String(value)
    .toLowerCase()
    .trim()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9_\- ]+/g, '')
    .replace(/\s+/g, ' ')
    .slice(0, 50)
    .trim();
  return value || 'other';
}
```

### B) `JS - Normalize Section`

```javascript
function() {
  var section = {{DL - Raw Section}} || 'unknown';
  var knownSections = [
    'hero','problem','solution','social_proof','testimonials',
    'offer','pricing_table','faq','final_cta','footer',
    'checkout_modal','floating_button'
  ];
  section = String(section).toLowerCase().trim()
    .replace(/[^a-z0-9_\-]+/g, '_').slice(0, 30);
  return knownSections.indexOf(section) >= 0 ? section : 'other';
}
```

---

## 🧪 GA4 Tagging (Reference)

* **GA4 Config**: Fire on `gtm_init`. Include `page_location`, `page_title`, and optional `cafe_com_vendas_version` param.
* **Checkout Opened**: GA4 Event name `checkout_opened`; send `source`, `amount`, `currency`, `pricing_tier`, `items` as needed.
* **Purchase**: GA4 Event name **`purchase`**; map from **`payment_completed`** DL event with `transaction_id`, `value`, `currency`, and `items`.

---

## ✅ Migration Note

* If you previously emitted `purchase_completed`, **rename it to `payment_completed`** in your code and GTM triggers. Keep GA4 event name as `purchase`. This aligns all GTM docs and your implementation.

---

**End of file — save as `/docs/GTM_CONFIGURATION_REFERENCE.md`.**

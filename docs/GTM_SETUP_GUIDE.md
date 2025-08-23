# 🏷️ GTM Setup Guide — Café com Vendas

> **Container ID**: `GTM-T63QRLFT` • **Env**: `VITE_GTM_CONTAINER_ID`

---

## Quick Setup

### 1) Environment
```bash
# .env.local
VITE_GTM_CONTAINER_ID=GTM-T63QRLFT
```

### 2) GTM Access
1. **tagmanager.google.com** → container **GTM‑T63QRLFT**
2. Enable built-in variables: Event, Page URL/Title, Click Element/Text

### 3) Test Locally
```bash
npm run dev
# DevTools: window.dataLayer or console.table(window.dataLayer)
```

---

## Required Data Layer Variables

Create in GTM **Variables → Data Layer Variables**:

| Variable Name | Data Layer Key |
|---------------|---------------|
| DL - Value | `value` |
| DL - Currency | `currency` |
| DL - Transaction ID | `transaction_id` |
| DL - Items | `items` |
| DL - Lead ID | `lead_id` |
| DL - FAQ Action | `action` |
| DL - FAQ Question | `question` |
| DL - Video Title | `video_title` |
| DL - Testimonial ID | `testimonial_id` |

---

## Core Triggers

Create **Custom Event** triggers:

* `gtm_init` (GA4 config)
* `checkout_opened` 
* `payment_completed` (maps to GA4 `purchase`)
* `lead_form_submitted`
* `faq_toggle` + `faq_meaningful_engagement`
* `video_play`
* `view_testimonial_slide` + `view_testimonials_section`

---

## GA4 Tags

### 1) GA4 Configuration
* **Trigger**: `gtm_init`
* **Measurement ID**: Your GA4 property ID

### 2) Purchase Event (Key)
* **Event Name**: `purchase`
* **Trigger**: `payment_completed`
* **Parameters**: `transaction_id`, `value`, `currency`, `items`

### 3) All Other Events
Map dataLayer events to GA4 with relevant parameters from data layer variables.

---

## Testing

1. **GTM Preview** → test all event triggers
2. **GA4 Realtime** → confirm `purchase` and custom events
3. **Console**: Verify `window.dataLayer` populates correctly

---

## Key dataLayer Examples

```js
// Purchase (most important)
window.dataLayer.push({
  event: 'payment_completed',
  transaction_id: 'pi_1abc2def3ghi',
  value: 180,
  currency: 'EUR',
  items: [{
    item_id: 'SKU_CCV_PT_2025',
    item_name: 'Café com Vendas – Portugal 2025',
    price: 180,
    quantity: 1
  }]
});

// Lead generation
window.dataLayer.push({
  event: 'lead_form_submitted',
  lead_id: 'lead_123',
  form_location: 'checkout_modal'
});
```

**Migration**: Replace any `purchase_completed` events with `payment_completed`.

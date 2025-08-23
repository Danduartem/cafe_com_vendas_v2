# 🎯 GTM Event Reference — Café com Vendas

> **Container**: `GTM-T63QRLFT` • **Key Event**: `payment_completed` → GA4 `purchase`

---

## Event Mapping (dataLayer → GA4)

| dataLayer Event | GA4 Event | Key Parameters |
|-----------------|-----------|----------------|
| `payment_completed` | `purchase` | `transaction_id`, `value`, `currency`, `items` |
| `checkout_opened` | `checkout_opened` | `value`, `currency`, `pricing_tier` |
| `lead_form_submitted` | `generate_lead` | `lead_id`, `form_location` |
| `faq_toggle` | `faq_toggle` | `action`, `question` |
| `faq_meaningful_engagement` | `faq_meaningful_engagement` | `toggle_count` |
| `video_play` | `video_play` | `video_title`, `percent_played` |
| `view_testimonial_slide` | `view_testimonial_slide` | `testimonial_id`, `position` |
| `whatsapp_click` | `whatsapp_click` | `link_url`, `location` |

---

## Key Event Payloads

### Payment Completed (Key Event)
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
    quantity: 1
  }],
  pricing_tier: "early_bird"
}
```

### Lead Form Submitted
```js
{
  event: "lead_form_submitted",
  lead_id: "lead_1234567890",
  form_location: "checkout_modal",
  source_section: "pricing_table"
}
```

### FAQ Engagement
```js
// Individual toggle
{
  event: "faq_toggle",
  action: "open",
  question: "como funciona o cafe com vendas"
}

// Meaningful engagement (3+ toggles)
{
  event: "faq_meaningful_engagement",
  toggle_count: 3
}
```

### Video & Testimonial Tracking
```js
// Video play
{
  event: "video_play",
  video_title: "depoimento joao ccv 2024",
  percent_played: 0
}

// Testimonial interaction
{
  event: "view_testimonial_slide",
  testimonial_id: "tst_03",
  position: 2
}
```

### Contact & Engagement
```js
// WhatsApp clicks
{
  event: "whatsapp_click",
  link_url: "wa.me/351912345678",
  location: "footer"
}

// Scroll tracking
{
  event: "scroll_depth",
  percent_scrolled: 50
}
```

---

## Required GTM Variables

Create these **Data Layer Variables** in GTM:

* `DL - Transaction ID` → `transaction_id`
* `DL - Value` → `value`  
* `DL - Currency` → `currency`
* `DL - Items` → `items`
* `DL - Lead ID` → `lead_id`
* `DL - FAQ Action` → `action`
* `DL - FAQ Question` → `question`
* `DL - Video Title` → `video_title`
* `DL - Testimonial ID` → `testimonial_id`
* `DL - Toggle Count` → `toggle_count`

**Migration**: Replace `purchase_completed` with `payment_completed` (GA4 event stays `purchase`).

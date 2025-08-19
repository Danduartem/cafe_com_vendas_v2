# 🎯 GTM Configuration Reference - Café com Vendas

> **Container ID**: `GTM-T63QRLFT`  
> **Last Updated**: January 2025  
> **Purpose**: Technical reference for GTM implementation with normalized data

---

## 📊 Event Taxonomy & Payloads

All events use normalized string values to prevent GA4 dimension cardinality issues.

### 🔧 Normalization Rules
- **Strings**: Lowercase, alphanumeric + dash/underscore, max 50 chars
- **IDs**: Preserved uniqueness, sanitized format, max 100 chars
- **Numbers**: Not normalized (kept as numeric type)
- **Arrays/Objects**: Not normalized (e.g., items array)
- **Unknown values**: Default to `"other"`

---

## 🏷️ Complete Event Reference

### 1. Lead Form Submitted
**Event**: `lead_form_submitted`  
**Trigger**: User submits lead capture form

```javascript
{
  event: "lead_form_submitted",
  lead_id: "test_1234567890", // Normalized: lowercase, alphanumeric
  form_location: "checkout_modal", // Normalized: known location
  source_section: "pricing_table" // Normalized: hero|pricing_table|footer|other
}
```

**GTM Variables Required**:
- `DL - Lead ID` → `lead_id`
- `DL - Form Location` → `form_location`
- `DL - Source Section` → `source_section`

---

### 2. Checkout Opened
**Event**: `checkout_opened`  
**Trigger**: User opens checkout modal

```javascript
{
  event: "checkout_opened",
  value: 180, // Number: NOT normalized
  currency: "EUR",
  pricing_tier: "early_bird", // Normalized: early_bird|regular|standard
  items: [{
    item_id: "SKU_CCV_PT_2025",
    item_name: "Café com Vendas – Portugal 2025",
    price: 180, // Number: NOT normalized
    quantity: 1,
    item_category: "Event"
  }]
}
```

**GTM Variables Required**:
- `DL - Value` → `value`
- `DL - Currency` → `currency`
- `DL - Pricing Tier` → `pricing_tier`
- `DL - Items` → `items`

---

### 3. Purchase Completed
**Event**: `purchase_completed`  
**Trigger**: Successful payment

```javascript
{
  event: "purchase_completed",
  transaction_id: "pi_1abc2def3ghi", // Normalized: sanitized Stripe ID
  value: 180, // Number: NOT normalized
  currency: "EUR",
  items: [{
    item_id: "SKU_CCV_PT_2025",
    item_name: "Café com Vendas – Portugal 2025",
    price: 180,
    quantity: 1,
    item_category: "Event"
  }],
  pricing_tier: "early_bird" // Normalized
}
```

**GTM Variables Required**:
- `DL - Transaction ID` → `transaction_id`
- `DL - Value` → `value`
- `DL - Currency` → `currency`
- `DL - Items` → `items`
- `DL - Pricing Tier` → `pricing_tier`

---

### 4. FAQ Toggle
**Event**: `faq_toggle`  
**Trigger**: User opens/closes FAQ item

```javascript
{
  event: "faq_toggle",
  action: "open", // Normalized: open|close|other
  question: "como funciona o cafe com vendas" // Normalized: max 100 chars, no accents
}
```

**GTM Variables Required**:
- `DL - FAQ Action` → `action`
- `DL - FAQ Question` → `question`

---

### 5. FAQ Meaningful Engagement
**Event**: `faq_meaningful_engagement`  
**Trigger**: User toggles 3+ FAQ items

```javascript
{
  event: "faq_meaningful_engagement",
  engagement_type: "faq_meaningful", // Normalized constant
  toggle_count: 3 // Number: NOT normalized
}
```

**GTM Variables Required**:
- `DL - Engagement Type` → `engagement_type`
- `DL - Toggle Count` → `toggle_count`

---

### 6. Video Play
**Event**: `video_play`  
**Trigger**: User plays video

```javascript
{
  event: "video_play",
  video_title: "depoimento joao ccv 2024", // Normalized: max 50 chars
  percent_played: 0 // Number: NOT normalized
}
```

**GTM Variables Required**:
- `DL - Video Title` → `video_title`
- `DL - Video Percent Played` → `percent_played`

---

### 7. View Testimonial Slide
**Event**: `view_testimonial_slide`  
**Trigger**: User views testimonial

```javascript
{
  event: "view_testimonial_slide",
  testimonial_id: "tst_03", // Normalized ID
  position: 2 // Number: NOT normalized
}
```

**GTM Variables Required**:
- `DL - Testimonial ID` → `testimonial_id`
- `DL - Testimonial Position` → `position`

---

### 8. View Testimonials Section
**Event**: `view_testimonials_section`  
**Trigger**: Testimonials section enters viewport

```javascript
{
  event: "view_testimonials_section",
  section: "testimonials" // Normalized: known section
}
```

**GTM Variables Required**:
- `DL - Section` → `section`

---

### 9. WhatsApp Click
**Event**: `whatsapp_click`  
**Trigger**: User clicks WhatsApp link

```javascript
{
  event: "whatsapp_click",
  link_url: "wa.me/351912345678", // Normalized: hostname + path only
  link_text: "falar no whatsapp", // Normalized: max 50 chars
  location: "footer" // Normalized: footer|floating_button|other
}
```

**GTM Variables Required**:
- `DL - Link URL` → `link_url`
- `DL - Link Text` → `link_text`
- `DL - Location` → `location`

---

### 10. Scroll Depth
**Event**: `scroll_depth`  
**Trigger**: User scrolls to thresholds

```javascript
{
  event: "scroll_depth",
  percent_scrolled: 50, // Number: NOT normalized (10|25|50|75|90)
  timestamp: "2025-01-20T10:30:00.000Z"
}
```

**GTM Variables Required**:
- `DL - Percent Scrolled` → `percent_scrolled`

---

## 🛠️ GTM Variable Configuration

### Custom JavaScript Variable: String Normalizer
Create this variable to normalize any string parameter:

**Variable Name**: `JS - Normalize String`  
**Variable Type**: Custom JavaScript

```javascript
function() {
  // Get the value to normalize (replace with your DL variable)
  var value = {{DL - Raw Value}} || 'other';
  
  // Convert to string and normalize
  value = String(value)
    .toLowerCase()
    .trim()
    // Remove Portuguese accents
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    // Keep only safe chars
    .replace(/[^a-z0-9_\- ]+/g, '')
    // Single spaces
    .replace(/\s+/g, ' ')
    // Limit length
    .slice(0, 50)
    .trim();
  
  return value || 'other';
}
```

### Custom JavaScript Variable: Section Normalizer
**Variable Name**: `JS - Normalize Section`  
**Variable Type**: Custom JavaScript

```javascript
function() {
  var section = {{DL - Raw Section}} || 'unknown';
  var knownSections = [
    'hero', 'problem', 'solution', 'social_proof',
    'testimonials', 'offer', 'pricing_table', 'faq',
    'final_cta', 'footer', 'checkout_modal', 'floating_button'
  ];
  
  section = String(section).toLowerCase().trim()
    .replace(/[^a-z0-9_\-]+/g, '_').slice(0, 30);
  
  // Return known section or normalized value
  return knownSections.indexOf(section) >= 0 ? section : 'other';
}
```

### Custom JavaScript Variable: Pricing Tier Normalizer
**Variable Name**: `JS - Normalize Pricing Tier`  
**Variable Type**: Custom JavaScript

```javascript
function() {
  var tier = {{DL - Raw Pricing Tier}} || 'standard';
  var validTiers = ['early_bird', 'regular', 'last_minute', 'standard'];
  
  tier = String(tier).toLowerCase().trim()
    .replace(/[^a-z0-9_\-]+/g, '_').slice(0, 30);
  
  return validTiers.indexOf(tier) >= 0 ? tier : 'standard';
}
```

---

## 🎯 Trigger Configuration

### Custom Event Triggers

| Trigger Name | Event Name | Additional Conditions |
|-------------|------------|----------------------|
| CE - Lead Form Submitted | `lead_form_submitted` | None |
| CE - Checkout Opened | `checkout_opened` | None |
| CE - Purchase Completed | `purchase_completed` | None |
| CE - FAQ Toggle | `faq_toggle` | None |
| CE - FAQ Meaningful | `faq_meaningful_engagement` | None |
| CE - Video Play | `video_play` | None |
| CE - Testimonial View | `view_testimonial_slide` | None |
| CE - Section View | `view_testimonials_section` | None |
| CE - WhatsApp Click | `whatsapp_click` | None |
| CE - Scroll Depth | `scroll_depth` | None |

---

## 📈 GA4 Tag Configuration

### GA4 Configuration Tag
**Tag Name**: `GA4 - Configuration`  
**Tag Type**: Google Analytics: GA4 Configuration  
**Measurement ID**: `G-XXXXXXXXXX`  
**Trigger**: All Pages

**Configuration Parameters**:
```javascript
{
  send_page_view: true,
  debug_mode: {{Debug Mode}}, // true in Preview
  page_location: {{Page URL}},
  page_title: {{Page Title}}
}
```

### GA4 Event Tags

#### Lead Generation Tag
**Tag Name**: `GA4 - Generate Lead`  
**Tag Type**: Google Analytics: GA4 Event  
**Configuration Tag**: {{GA4 - Configuration}}  
**Event Name**: `generate_lead`  
**Trigger**: CE - Lead Form Submitted

**Event Parameters**:
- `lead_id`: {{DL - Lead ID}}
- `form_location`: {{DL - Form Location}}
- `source_section`: {{DL - Source Section}}

#### Begin Checkout Tag
**Tag Name**: `GA4 - Begin Checkout`  
**Tag Type**: Google Analytics: GA4 Event  
**Configuration Tag**: {{GA4 - Configuration}}  
**Event Name**: `begin_checkout`  
**Trigger**: CE - Checkout Opened

**Event Parameters**:
- `currency`: EUR
- `value`: {{DL - Value}}
- `items`: {{DL - Items}}
- `pricing_tier`: {{DL - Pricing Tier}}

#### Purchase Tag
**Tag Name**: `GA4 - Purchase`  
**Tag Type**: Google Analytics: GA4 Event  
**Configuration Tag**: {{GA4 - Configuration}}  
**Event Name**: `purchase`  
**Trigger**: CE - Purchase Completed

**Event Parameters**:
- `transaction_id`: {{DL - Transaction ID}}
- `currency`: EUR
- `value`: {{DL - Value}}
- `items`: {{DL - Items}}
- `pricing_tier`: {{DL - Pricing Tier}}

**Duplicate Transaction Prevention**:
- Add Tag Sequencing: Don't fire if `transaction_id` already processed
- Use Custom JavaScript Variable to check localStorage

---

## 🧪 Testing Procedures

### 1. Preview Mode Testing
```bash
# Open GTM Preview
1. GTM Console → Preview
2. Enter: https://yourdomain.com
3. Open browser DevTools Console
```

### 2. Console Testing Script
```javascript
// Test normalized values
function testNormalization() {
  const tests = [
    { input: "Café com Vendas!", expected: "cafe com vendas" },
    { input: "HERO_SECTION", expected: "hero_section" },
    { input: "São Paulo", expected: "sao paulo" },
    { input: "", expected: "other" },
    { input: null, expected: "other" }
  ];
  
  tests.forEach(test => {
    const result = normalizeString(test.input);
    console.log(`${test.input} → ${result} (${result === test.expected ? '✅' : '❌'})`);
  });
}

// Fire test event
dataLayer.push({
  event: 'test_normalization',
  test_string: 'Café com Vendas – Portugal 2025!',
  test_number: 180,
  test_section: 'HERO'
});
```

### 3. GA4 DebugView Validation
1. Enable Debug Mode in GA4
2. Add `debug_mode: true` parameter to GA4 Config
3. View real-time events in DebugView
4. Verify normalized values appear correctly

---

## ⚠️ Common Issues & Solutions

### Issue: High Cardinality Warning in GA4
**Cause**: Too many unique string values  
**Solution**: Ensure normalizer is applied to all string parameters

### Issue: Numbers Appearing as Strings
**Cause**: Normalization applied to numeric values  
**Solution**: Check normalizeParameter() excludes number types

### Issue: Accented Characters in GA4
**Cause**: Portuguese text not normalized  
**Solution**: Verify `.normalize('NFD').replace(/[\u0300-\u036f]/g, '')` is working

### Issue: Transaction Duplicates
**Cause**: Page refresh re-fires purchase event  
**Solution**: Implement transaction_id deduplication in GTM

---

## 📝 Implementation Checklist

- [x] Create GTM Normalizer utility (`gtm-normalizer.js`)
- [x] Update all components to use normalizer
- [x] Configure GTM Variables for normalized values
- [x] Create Custom Event Triggers
- [x] Configure GA4 Tags with parameters
- [x] Test normalization in Preview Mode
- [ ] Verify in GA4 DebugView
- [ ] Monitor dimension cardinality in GA4 Reports
- [ ] Set up Custom Dimensions for key parameters

---

## 🔄 Maintenance

### Monthly Review
1. Check GA4 dimension cardinality reports
2. Review "other" values percentage
3. Update known value lists if needed
4. Test new events with normalizer

### When Adding New Events
1. Define normalized parameter schema
2. Update `normalizeParameter()` if needed
3. Add to this documentation
4. Test in Preview Mode before production

---

## 📞 Quick Reference Card

```javascript
// Normalized Values Examples
"Café com Vendas!" → "cafe com vendas"
"HERO_SECTION" → "hero_section"
"checkout-modal" → "checkout_modal"
"São Paulo" → "sao paulo"
"" or null → "other"

// Known Sections (normalized)
hero, problem, solution, social_proof, testimonials,
offer, pricing_table, faq, final_cta, footer,
checkout_modal, floating_button

// Known Pricing Tiers (normalized)
early_bird, regular, last_minute, standard

// Known Actions (normalized)
open, close, click, submit, view, play, pause, complete
```

---

**Last Updated**: January 2025  
**Maintained By**: Development Team  
**Container**: GTM-T63QRLFT
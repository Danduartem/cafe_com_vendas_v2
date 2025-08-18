# Google Tag Manager Events Reference

## Overview

This document outlines all dataLayer events pushed to Google Tag Manager (GTM) for the Café com Vendas landing page. GTM serves as the single source of truth for all analytics and tracking.

## Implementation Architecture

```
User Action → JavaScript Event → dataLayer.push() → GTM → Tags (GA4, FB Pixel, etc.)
```

All events flow through GTM's dataLayer, allowing centralized tag management without code changes.

## Event Categories

### 1. Page Load Events

#### `page_view_enhanced`
Fired when the page loads with enhanced metadata.

**Data Layer Variables:**
```javascript
{
  event: 'page_view_enhanced',
  page_data: {
    title: string,        // Page title
    url: string,          // Full URL
    path: string,         // URL path
    referrer: string      // Referrer or '(direct)'
  }
}
```

**GTM Trigger:** Custom Event = page_view_enhanced
**Use Case:** Enhanced page tracking with custom dimensions

---

### 2. Conversion Events

#### `lead_capture_started`
Fired when the checkout modal opens.

**Data Layer Variables:**
```javascript
{
  event: 'lead_capture_started',
  event_category: 'Conversion',
  event_label: 'Checkout Modal Opened',
  form_location: 'modal'
}
```

**GTM Trigger:** Custom Event = lead_capture_started
**Use Case:** Track conversion funnel entry

#### `lead_form_submitted`
Fired when lead information is successfully captured.

**Data Layer Variables:**
```javascript
{
  event: 'lead_form_submitted',
  event_category: 'Conversion',
  event_label: 'Lead Information Captured',
  lead_id: string,            // Unique lead identifier
  form_location: 'checkout_modal'
}
```

**GTM Trigger:** Custom Event = lead_form_submitted
**Use Case:** Track qualified leads

#### `checkout_initiated`
Fired when user proceeds to payment step.

**Data Layer Variables:**
```javascript
{
  event: 'checkout_initiated',
  event_category: 'Conversion',
  event_label: 'Payment Step Started',
  value: number              // Price in EUR (e.g., 180)
}
```

**GTM Trigger:** Custom Event = checkout_initiated
**Use Case:** Track payment intent

#### `purchase_completed`
Fired when payment is successfully processed.

**Data Layer Variables:**
```javascript
{
  event: 'purchase_completed',
  event_category: 'Conversion',
  event_label: 'Event Registration Completed',
  transaction_id: string,     // Stripe payment intent ID
  lead_id: string,           // Lead identifier
  value: number,             // Amount in EUR
  currency: 'EUR',
  pricing_tier: string,      // Pricing tier ID
  payment_intent_id: string  // Stripe payment ID
}
```

**GTM Trigger:** Custom Event = purchase_completed
**Use Case:** Track revenue and conversions

---

### 3. Engagement Events

#### `scroll_depth`
Fired at scroll depth thresholds (25%, 50%, 75%, 90%).

**Data Layer Variables:**
```javascript
{
  event: 'scroll_depth',
  event_category: 'Engagement',
  event_label: '25%_reached',  // Or 50%, 75%, 90%
  scroll_threshold: number      // 25, 50, 75, or 90
}
```

**GTM Trigger:** Custom Event = scroll_depth
**Use Case:** Measure content engagement

#### `faq_meaningful_engagement`
Fired when user spends >3 seconds reading an FAQ.

**Data Layer Variables:**
```javascript
{
  event: 'faq_meaningful_engagement',
  event_category: 'FAQ',
  event_label: string,        // FAQ identifier
  value: number              // Engagement time in seconds
}
```

**GTM Trigger:** Custom Event = faq_meaningful_engagement
**Use Case:** Track FAQ effectiveness

#### `video_play`
Fired when a video testimonial is played.

**Data Layer Variables:**
```javascript
{
  event: 'video_play',
  event_category: 'Video',
  event_label: string,        // Video title/ID
  video_provider: 'youtube'
}
```

**GTM Trigger:** Custom Event = video_play
**Use Case:** Track video engagement

---

### 4. Performance Events

#### `performance_lcp`
Largest Contentful Paint metric.

**Data Layer Variables:**
```javascript
{
  event: 'performance_lcp',
  event_category: 'Core Web Vitals',
  event_label: 'LCP',
  value: number              // Time in milliseconds
}
```

**GTM Trigger:** Custom Event = performance_lcp
**Use Case:** Monitor page load performance

#### `performance_cls`
Cumulative Layout Shift metric.

**Data Layer Variables:**
```javascript
{
  event: 'performance_cls',
  event_category: 'Core Web Vitals',
  event_label: 'CLS',
  value: number              // Score * 1000
}
```

**GTM Trigger:** Custom Event = performance_cls
**Use Case:** Monitor visual stability

#### `performance_fid`
First Input Delay metric.

**Data Layer Variables:**
```javascript
{
  event: 'performance_fid',
  event_category: 'Core Web Vitals',
  event_label: 'FID',
  value: number              // Time in milliseconds
}
```

**GTM Trigger:** Custom Event = performance_fid
**Use Case:** Monitor interactivity

#### `page_load_performance`
Overall page load metrics.

**Data Layer Variables:**
```javascript
{
  event: 'page_load_performance',
  event_category: 'Performance',
  dom_content_loaded: number,  // Time in ms
  load_complete: number,        // Time in ms
  ttfb: number                  // Time to First Byte in ms
}
```

**GTM Trigger:** Custom Event = page_load_performance
**Use Case:** Monitor overall performance

---

### 5. Error Events

#### `javascript_error`
Fired when JavaScript errors occur.

**Data Layer Variables:**
```javascript
{
  event: 'javascript_error',
  event_category: 'Error',
  event_label: string,         // Error type
  error_message: string,       // Error message
  error_stack: string,         // Stack trace (truncated)
  // Additional context variables
}
```

**GTM Trigger:** Custom Event = javascript_error
**Use Case:** Monitor site health

---

## GTM Configuration Best Practices

### 1. Variable Setup
Create GTM Data Layer Variables for frequently used values:
- `dlv.page_data.title`
- `dlv.page_data.path`
- `dlv.event_category`
- `dlv.event_label`
- `dlv.value`
- `dlv.transaction_id`
- `dlv.lead_id`

### 2. Trigger Configuration
- Use Custom Event triggers matching the event names exactly
- Add trigger filters for specific event_category or event_label values when needed
- Group related triggers using trigger groups

### 3. Tag Configuration

#### Google Analytics 4
- **Page View**: Fire on All Pages + page_view_enhanced
- **Conversions**: Create conversion events for:
  - `lead_form_submitted`
  - `purchase_completed`
- **Engagement**: Track scroll_depth, faq_engagement
- **Ecommerce**: Enable Enhanced Ecommerce for purchase_completed

#### Facebook Pixel
- **PageView**: Fire on All Pages
- **Lead**: Fire on lead_form_submitted
- **Purchase**: Fire on purchase_completed with value and currency

#### Google Ads
- **Conversion Tracking**: Fire on purchase_completed
- **Remarketing**: Fire on lead_capture_started

### 4. Testing Process
1. Enable GTM Preview Mode
2. Test each user flow:
   - Page load → scroll → CTA click
   - Modal open → lead form → payment → success
   - FAQ interaction
   - Video play
3. Verify events in:
   - GTM Preview console
   - GA4 DebugView
   - Browser console (if debug mode enabled)

### 5. Custom HTML Tags
If needed, create Custom HTML tags for:
- Enhanced scroll tracking
- Custom timer events
- Form field interactions

Example:
```javascript
<script>
  // Custom tracking logic
  dataLayer.push({
    event: 'custom_event',
    event_category: 'Custom',
    event_label: 'Description'
  });
</script>
```

## Environment Variables

Ensure the following is set in your environment:
- `VITE_GTM_CONTAINER_ID`: Your GTM container ID (GTM-XXXXXX)

## Debugging

### Enable Debug Mode
In browser console:
```javascript
localStorage.setItem('gtm_debug', 'true');
```

### View DataLayer
```javascript
console.table(window.dataLayer);
```

### Monitor Events
```javascript
// Listen to all dataLayer pushes
const originalPush = window.dataLayer.push;
window.dataLayer.push = function() {
  console.log('GTM Event:', arguments[0]);
  return originalPush.apply(window.dataLayer, arguments);
};
```

## Migration Notes

As of this update, all direct gtag() and GA4 calls have been removed. Everything flows through GTM's dataLayer, making it the single source of truth for all tracking and analytics.

### Removed:
- Direct GA4 measurement ID configuration
- Direct gtag() function calls
- Facebook Pixel direct implementation
- Plausible Analytics references

### Added:
- Centralized GTM implementation
- Standardized event naming
- Enhanced conversion tracking
- Immediate GTM loading for better tracking

## Support

For questions about GTM configuration or event tracking, consult:
- [GTM Documentation](https://support.google.com/tagmanager)
- [GA4 Event Reference](https://support.google.com/analytics/answer/9267735)
- [Enhanced Ecommerce](https://developers.google.com/analytics/devguides/collection/ga4/ecommerce)
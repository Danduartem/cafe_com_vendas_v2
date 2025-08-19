# 🏷️ GTM Setup Guide - Café com Vendas
## Clear Step-by-Step Configuration

> **Container ID**: `GTM-T63QRLFT` | **Environment Variable**: `VITE_GTM_CONTAINER_ID`

---

## 🚀 Quick Start (5 Minutes)

### Step 1: Environment Setup
```bash
# Add to your .env.local file
echo "VITE_GTM_CONTAINER_ID=GTM-T63QRLFT" >> .env.local
```

### Step 2: Access GTM Console
1. Go to [tagmanager.google.com](https://tagmanager.google.com)
2. Select container `GTM-T63QRLFT`
3. Create workspace: "Café com Vendas Setup"

### Step 3: Enable Built-in Variables
Go to **Variables > Built-In Variables > Configure** and enable:
- ✅ Event
- ✅ Page URL, Page Title, Page Path
- ✅ Click Element, Click Text, Click Classes
- ✅ Form Element, Form ID, Form Classes

### Step 4: Test
```bash
npm run dev
# Visit http://localhost:8081
# Check console: window.dataLayer
```

**✅ If you see events in dataLayer, you're ready for detailed configuration!**

---

## 📋 Detailed Configuration

### PHASE 1: Core Variables (Required)

Create these **Data Layer Variables** in GTM:

| Variable Name | Data Layer Variable Name | Purpose |
|---------------|--------------------------|---------|
| **DL - Event Category** | `event_category` | Event categorization |
| **DL - Source** | `source` | CTA source attribution |
| **DL - Amount** | `amount` | Dynamic pricing (€180/€240) |
| **DL - Lead ID** | `lead_id` | Lead tracking |
| **DL - Transaction ID** | `transaction_id` | Payment tracking |
| **DL - Pricing Tier** | `pricing_tier` | Tier tracking |
| **DL - Value** | `value` | Engagement metrics |

**How to create**: Variables > New > Data Layer Variable > Enter variable name

---

### PHASE 2: Essential Triggers (Required)

Create these **Custom Event Triggers**:

#### 🔥 CRITICAL CONVERSION TRIGGERS

**1. GTM Init** (Required for GA4)
- **Type**: Custom Event
- **Event Name**: `gtm_init`
- **Condition**: Event equals `gtm_init`

**2. Checkout Opened** (Revenue tracking)
- **Type**: Custom Event  
- **Event Name**: `checkout_opened`
- **Condition**: Event equals `checkout_opened`

**3. Payment Completed** (Conversions)
- **Type**: Custom Event
- **Event Name**: `payment_completed`
- **Condition**: Event equals `payment_completed`

#### 📊 ENGAGEMENT TRIGGERS

**4. Scroll Depth**
- **Type**: Custom Event
- **Event Name**: `scroll_depth`
- **Condition**: Event equals `scroll_depth`

**5. FAQ Engagement**
- **Type**: Custom Event
- **Event Name**: `faq_meaningful_engagement`
- **Condition**: Event equals `faq_meaningful_engagement`

**How to create**: Triggers > New > Custom Event > Enter event name

---

### PHASE 3: GA4 Configuration (Required)

#### 1. GA4 Config Tag
- **Type**: Google Analytics: GA4 Configuration
- **Measurement ID**: `G-XXXXXXXXXX` (get from Google Analytics)
- **Trigger**: GTM Init
- **Parameters**:
  - `page_location`: {{Page URL}}
  - `page_title`: {{Page Title}}
  - `cafe_com_vendas_version`: v2025

#### 2. GA4 Conversion Events
- **Type**: Google Analytics: GA4 Event
- **Configuration Tag**: Select GA4 Config above
- **Event Name**: checkout_opened
- **Parameters**:
  - `source`: {{DL - Source}}
  - `amount`: {{DL - Amount}}
  - `currency`: EUR
- **Trigger**: Checkout Opened

#### 3. GA4 Purchase Event
- **Type**: Google Analytics: GA4 Event
- **Configuration Tag**: Select GA4 Config above
- **Event Name**: purchase
- **Parameters**:
  - `transaction_id`: {{DL - Transaction ID}}
  - `value`: {{DL - Amount}}
  - `currency`: EUR
- **Trigger**: Payment Completed

---

## 🧪 Testing & Validation

### Test Checklist

1. **Preview Mode**:
   - GTM > Preview > Enter `http://localhost:8081`
   - Verify all triggers fire

2. **Expected Events**:
   - ✅ `gtm_init` on page load
   - ✅ `checkout_opened` when clicking CTA buttons
   - ✅ `scroll_depth` at 25%, 50%, 75%
   - ✅ `faq_meaningful_engagement` on FAQ interaction

3. **GA4 Real-Time**:
   - Google Analytics > Real-time
   - Should see events as they occur

### Debug Commands
```javascript
// In browser console:
window.dataLayer                    // View all events
console.table(window.dataLayer)    // Formatted view
window.CafeComVendas.getComponentStatus() // Component health
```

---

## 🚨 Common Issues & Solutions

### Problem: GTM Assistant shows PNG icon
**Solution**:
1. Check `VITE_GTM_CONTAINER_ID` is set in environment
2. Verify GTM container is published
3. Ensure event names match exactly between code and triggers

### Problem: Events not appearing
**Solution**:
1. Check browser console for JavaScript errors
2. Verify triggers are active (not paused)
3. Check trigger conditions match event names exactly

### Problem: GA4 not receiving data
**Solution**:
1. Ensure GA4 Config tag fires on GTM Init trigger
2. Check Measurement ID is correct
3. Verify GA4 event tags use correct Configuration Tag

---

## 📈 Performance Tracking (Optional)

Add these if you want performance monitoring:

### Performance Triggers
- **Performance LCP**: `performance_lcp`
- **Performance FID**: `performance_fid`  
- **Performance CLS**: `performance_cls`

### Create GA4 Performance Tag
- **Event Name**: {{Event}} (built-in variable)
- **Parameters**:
  - `metric_value`: {{DL - Custom Parameter}}
  - `event_category`: Performance
- **Triggers**: Performance LCP, Performance FID, Performance CLS

---

## 🔄 Enhanced Ecommerce (Optional)

For advanced conversion tracking:

### Begin Checkout Event
- **Event Name**: `begin_checkout`
- **Parameters**:
  - `currency`: EUR
  - `value`: {{DL - Amount}}
  - `items`: Array with product info
- **Trigger**: Checkout Opened

### Purchase Event Items Array
```javascript
[{
  item_id: "cafe_com_vendas_2025",
  item_name: "Café com Vendas - Lisboa 2025",
  category: "Event Ticket",
  price: {{DL - Amount}},
  quantity: 1,
  item_variant: {{DL - Pricing Tier}}
}]
```

---

## 🚀 Production Deployment

### 1. Environment Variables
**Netlify Dashboard** > Site Settings > Environment Variables:
```
VITE_GTM_CONTAINER_ID=GTM-T63QRLFT
```

### 2. Publish GTM Container
1. Submit all changes in GTM workspace
2. Click **Publish**
3. Version Name: "Café com Vendas v1.0"

### 3. Verify Production
- [ ] GTM loads on production site
- [ ] Events appear in GA4 Real-time
- [ ] No console errors

---

## 📞 Quick Reference

### Event Names (Copy/Paste)
```javascript
// Application Events
'gtm_init'
'app_initialized'
'components_initialized'

// Conversion Events  
'checkout_opened'
'checkout_closed'
'lead_form_submitted'
'payment_completed'
'payment_failed'

// Engagement Events
'scroll_depth'
'faq_meaningful_engagement'
'view_testimonial_slide'

// Performance Events (Optional)
'performance_lcp'
'performance_fid'
'performance_cls'
'page_load_performance'
```

### GTM Console Links
- **Container**: [GTM-T63QRLFT](https://tagmanager.google.com/)
- **GA4 Setup**: [analytics.google.com](https://analytics.google.com)
- **Debug Extension**: [GTM Assistant](https://chrome.google.com/webstore/detail/tag-assistant-legacy-by/kejbdjndbnbjgmefkgdddjlbokphdefk)

---

## 🎯 Success Criteria

You've configured GTM correctly when:
- ✅ GTM Assistant shows tracking data (no PNG icon)
- ✅ All conversion events fire in preview mode
- ✅ GA4 receives events in real-time
- ✅ No JavaScript errors in console
- ✅ Dynamic pricing values are captured correctly (€180/€240)

**Need help?** Check the console commands above or refer to the [GTM Events Reference](GTM_EVENTS_REFERENCE.md) for detailed event specifications.
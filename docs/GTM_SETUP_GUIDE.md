# 🏷️ GTM Setup Guide — Café com Vendas (Unified with `payment_completed`)

> **Container ID**: `GTM-T63QRLFT`
> **Env Var**: `VITE_GTM_CONTAINER_ID`
> **Updated**: 2025‑08‑22
> **Change**: Standardizes the dataLayer payment event to **`payment_completed`** (mapped to GA4 **`purchase`**). All previous references to `purchase_completed` are removed.

---

## 🚀 Quick Start (5 minutes)

### 1) Environment

Create/update `.env.local`:

```bash
VITE_GTM_CONTAINER_ID=GTM-T63QRLFT
```

### 2) Access GTM

1. Open **tagmanager.google.com**
2. Select container **GTM‑T63QRLFT**
3. Create/choose workspace: *Café com Vendas Setup*

### 3) Enable Built‑in Variables

**Variables → Built‑In → Configure**

* Event
* Page URL, Page Title, Page Path
* Click Element, Click Text, Click Classes
* Form Element, Form ID, Form Classes

### 4) Local Test

```bash
npm run dev
# Visit http://localhost:8081 and open DevTools console
window.dataLayer;            // inspect events
console.table(window.dataLayer);
```

---

## 📋 Phase 1 — Core Data Layer Variables (Required)

Create these **Data Layer Variables** in GTM (Name → DL key):

| Variable Name             | Data Layer Variable Name |
| ------------------------- | ------------------------ |
| **DL - Source**           | `source`                 |
| **DL - Amount**           | `amount`                 |
| **DL - Value**            | `value`                  |
| **DL - Currency**         | `currency`               |
| **DL - Pricing Tier**     | `pricing_tier`           |
| **DL - Items**            | `items`                  |
| **DL - Lead ID**          | `lead_id`                |
| **DL - Transaction ID**   | `transaction_id`         |
| **DL - Percent Scrolled** | `percent_scrolled`       |
| **DL - Section**          | `section`                |
| **DL - FAQ Action**       | `action`                 |
| **DL - FAQ Question**     | `question`               |
| **DL - Engagement Type**  | `engagement_type`        |
| **DL - Toggle Count**     | `toggle_count`           |

> Optional: create **Custom JS** normalizers (e.g., `JS - Normalize String`, `JS - Normalize Section`) to lower cardinality if your inputs vary.

---

## 🔔 Phase 2 — Essential Triggers (Required)

Create **Custom Event** triggers for these dataLayer events:

### A) GTM Init (GA4 boot)

* **Type**: Custom Event
* **Event name**: `gtm_init`

### B) Checkout Opened

* **Type**: Custom Event
* **Event name**: `checkout_opened`

### C) **Payment Completed** (Unified)

* **Type**: Custom Event
* **Event name**: `payment_completed`

### D) Engagement

* **Type**: Custom Event
* **Event names**: `scroll_depth`, `faq_meaningful_engagement`

---

## 📈 Phase 3 — GA4 Tagging (Required)

### 1) GA4 Configuration Tag

* **Type**: *Google Analytics: GA4 Configuration*
* **Measurement ID**: your GA4 ID (e.g., `G‑XXXXXXXXXX`)
* **Trigger**: `gtm_init`
* **Parameters** (recommended):

  * `page_location`: {{Page URL}}
  * `page_title`: {{Page Title}}
  * `cafe_com_vendas_version`: `v2025` (optional)

### 2) GA4 — Checkout Opened (Custom Event)

* **Type**: *GA4 Event*
* **Event Name**: `checkout_opened`
* **Configuration Tag**: GA4 Config (above)
* **Parameters** (as needed):

  * `source`: {{DL - Source}}
  * `amount`: {{DL - Amount}} *or* {{DL - Value}}
  * `currency`: `EUR`
  * `pricing_tier`: {{DL - Pricing Tier}}
  * `items`: {{DL - Items}}
* **Trigger**: `checkout_opened`

### 3) **GA4 — Purchase (Maps from `payment_completed`)**

* **Type**: *GA4 Event*
* **Event Name**: `purchase`
* **Configuration Tag**: GA4 Config (above)
* **Parameters**:

  * `transaction_id`: {{DL - Transaction ID}}
  * `value`: {{DL - Value}} (or {{DL - Amount}})
  * `currency`: `EUR`
  * `items`: {{DL - Items}}
  * `pricing_tier`: {{DL - Pricing Tier}} *(optional custom dimension)*
* **Trigger**: `payment_completed`

---

## 🧪 Testing & Validation

### GTM Preview

1. **Preview** → enter site URL (e.g., `http://localhost:8081`)
2. Interact with the page
3. Confirm triggers fire: `gtm_init`, `checkout_opened`, `payment_completed`, plus engagement events

### GA4 Real‑time

* Open **Google Analytics → Realtime**
* Confirm receipt of `checkout_opened` and **`purchase`** (from `payment_completed`)

### Console Debug

```js
window.dataLayer
console.table(window.dataLayer)
```

---

## 📦 Reference — Minimal dataLayer Examples

### Checkout Opened

```js
window.dataLayer.push({
  event: 'checkout_opened',
  value: 180,
  currency: 'EUR',
  pricing_tier: 'early_bird',
  items: [{
    item_id: 'SKU_CCV_PT_2025',
    item_name: 'Café com Vendas – Portugal 2025',
    price: 180,
    quantity: 1,
    item_category: 'Event'
  }]
});
```

### Payment Completed (Unified)

```js
window.dataLayer.push({
  event: 'payment_completed',
  transaction_id: 'pi_1abc2def3ghi',
  value: 180,
  currency: 'EUR',
  items: [{
    item_id: 'SKU_CCV_PT_2025',
    item_name: 'Café com Vendas – Portugal 2025',
    price: 180,
    quantity: 1,
    item_category: 'Event'
  }],
  pricing_tier: 'early_bird'
});
```

---

## 🚨 Common Issues & Fixes

**Purchase not visible in GA4**

* Ensure **trigger** exists for `payment_completed` and fires
* GA4 event name must be **`purchase`** (not `payment_completed`)
* Verify `transaction_id` and `items` are sent

**GTM Assistant shows PNG icon**

* Ensure `VITE_GTM_CONTAINER_ID` is set and container is published

**Events not appearing in Preview**

* Check DevTools console for JS errors
* Verify event names match **exactly**
* Confirm triggers are **not paused**

---

## 🔁 Migration Note

* **Rename** any existing `purchase_completed` triggers/events to **`payment_completed`**.
* Keep GA4 event name as **`purchase`**.
* Re‑publish container after changes.

---

*End of file — save as `/docs/GTM_SETUP_GUIDE.md`.*

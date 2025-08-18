# GTM Setup Guide vs Code Events Analysis

## Events in GTM Guide vs Actual Code

### ✅ Events That Match (Already in GTM guide)
1. **checkout_opened** ✅ 
   - Guide: Trigger exists
   - Code: `Analytics.track('checkout_opened', { source: 'hero' })`

2. **payment_completed** ✅ 
   - Guide: Trigger exists  
   - Code: `Analytics.track('payment_completed', { transaction_id, amount })`

3. **payment_failed** ✅ 
   - Guide: Trigger exists
   - Code: `Analytics.track('payment_failed', { error, transaction_id })`

4. **core_web_vitals_fid** ✅ 
   - Guide: Trigger exists
   - Code: `this.track('core_web_vitals_fid', { custom_parameter, event_category: 'Core Web Vitals' })`

5. **hero_lcp_timing** ✅ 
   - Guide: Trigger exists (references CONFIG.analytics.events.HERO_LCP)
   - Code: `this.track(CONFIG.analytics.events.HERO_LCP)` → resolves to `hero_lcp_timing`

6. **page_load_performance** ✅ 
   - Guide: Trigger exists
   - Code: `this.track('page_load_performance', { event_category: 'Performance' })`

7. **app_initialized** ✅ 
   - Guide: Trigger exists
   - Code: `Analytics.track('app_initialized', { components_count })`

8. **components_initialized** ✅ 
   - Guide: Trigger exists  
   - Code: `Analytics.track('components_initialized', { success_count, failure_count })`

### ❌ Events in Code but NOT in GTM Guide
9. **core_web_vitals_cls** (Cumulative Layout Shift)
   - Guide: Missing trigger
   - Code: `this.track('core_web_vitals_cls', { custom_parameter, event_category: 'Core Web Vitals' })`

10. **javascript_error** (Error tracking)
    - Guide: Missing trigger
    - Code: `this.track('javascript_error', { event_category: 'Error', error_message, error_stack })`

11. **scroll_depth** (Scroll tracking)
    - Guide: Has generic "Scroll Depth 10%, 25%, 50%, 75%, 90%" but missing the event name
    - Code: Uses `CONFIG.analytics.events.SCROLL_DEPTH` → `scroll_depth`

12. **checkout_closed** (Modal closed)
    - Guide: Missing trigger
    - Code: `Analytics.track('checkout_closed', { source })`

13. **lead_captured** (Form submission)
    - Guide: Missing trigger  
    - Code: `Analytics.track('lead_captured', { email, source })`

14. **faq_toggle** (FAQ interactions)
    - Guide: Missing trigger
    - Code: `Analytics.track('faq_toggle', { label, is_open })`

15. **faq_meaningful_engagement** (FAQ engagement time)
    - Guide: Missing trigger
    - Code: `this.track('faq_meaningful_engagement', { event_category: 'FAQ', value: engagementTime })`

16. **view_testimonial_slide** (Testimonial carousel)
    - Guide: Missing trigger
    - Code: Uses `CONFIG.analytics.events.TESTIMONIAL_VIEW` → `view_testimonial_slide`

17. **view_testimonials_section** (Section view)
    - Guide: Missing trigger
    - Code: `Analytics.track('view_testimonials_section')`

### 🔄 Events in GTM Guide but NOT in Code
These need to be removed from GTM guide:

1. **Form Start** (Form Submission trigger)
   - Guide: Has trigger for `checkout-form` class
   - Code: No Analytics.track calls for form start

## Variable Usage Analysis

### ✅ Variables Actually Used in Code
1. **event_category** ✅ - Used in performance and error events
2. **custom_parameter** ✅ - Used in performance metrics  
3. **metric_value** ✅ - Used in performance tracking
4. **source** ✅ - Used in checkout and modal events
5. **transaction_id** ✅ - Used in payment events

### ❌ Variables in GTM Guide but NOT Used in Code
1. **components_count** - Only used in `app_initialized` event, not as separate parameter
2. **event** - This is built-in GTM variable, correctly configured

## Recommendations

### 1. Add Missing Triggers to GTM Guide
- core_web_vitals_cls
- javascript_error  
- checkout_closed
- lead_captured
- faq_toggle
- faq_meaningful_engagement  
- view_testimonial_slide
- view_testimonials_section

### 2. Remove Unused Triggers from GTM Guide  
- Form Start (not used in code)

### 3. Fix Event Name Mappings
- Update scroll depth trigger to use event name `scroll_depth`
- Ensure all CONFIG.analytics.events constants match GTM triggers

### 4. Simplify Variables
- Remove unused `components_count` variable (it's sent as direct parameter)
- Keep essential variables: event_category, custom_parameter, metric_value, source, transaction_id
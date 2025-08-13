# Google Analytics Documentation

This document covers the Google Analytics implementation used in this project for tracking user interactions and measuring the effectiveness of the Café com Vendas landing page.

## Overview

The project uses Google Analytics 4 (GA4) for comprehensive tracking of user behavior, conversion funnel analysis, and performance measurement. Analytics events are tracked throughout the user journey from initial page load to payment completion.

## Current Implementation

### Analytics Event Structure

The project implements comprehensive event tracking using the `gtag` function and custom data attributes:

```javascript
// Example analytics event tracking
if (typeof gtag !== 'undefined') {
    gtag('event', 'event_name', {
        'event_category': 'Category',
        'event_label': 'Label',
        'value': 1
    });
}
```

### Data Attributes for Tracking

Elements throughout the site use `data-analytics-event` attributes for consistent tracking:

```html
<!-- CTA Button -->
<a href="..." 
   data-analytics-event="click_to_checkout"
   class="primary-cta-button">
  Garantir vaga
</a>

<!-- WhatsApp Button -->
<a href="..." 
   data-analytics-event="whatsapp_button_click"
   class="whatsapp-btn">
  Contact WhatsApp
</a>
```

## Tracked Events

### User Engagement Events

#### Scroll Depth Tracking
```javascript
// Scroll depth tracking for engagement analysis
let scrollDepth25 = false;
let scrollDepth50 = false;
let scrollDepth75 = false;

function trackScrollDepth() {
    const scrollPercent = Math.round((window.scrollY / (document.body.scrollHeight - window.innerHeight)) * 100);
    
    if (scrollPercent >= 25 && !scrollDepth25) {
        scrollDepth25 = true;
        if (typeof gtag !== 'undefined') {
            gtag('event', 'scroll_depth', {
                event_category: 'Engagement',
                event_label: '25%',
                value: 25
            });
        }
    }
    
    // Similar tracking for 50% and 75%
}
```

#### Section Visibility Tracking
```javascript
// Track when users view specific sections
gtag('event', 'view_section', {
    'event_category': 'Engagement',
    'event_label': 'Problem Section',
    'section_id': 'problem'
});
```

### Conversion Funnel Events

#### Hero Section Interactions
```javascript
// Track hero CTA clicks
gtag('event', 'click_hero_cta', {
    'event_category': 'Conversion',
    'event_label': 'Hero Primary CTA',
    'value': 1
});

// Track scroll indicator clicks
gtag('event', 'scroll_indicator_click', {
    'event_category': 'Navigation',
    'event_label': 'Hero Scroll Indicator'
});
```

#### Payment Flow Tracking
```javascript
// Track checkout button clicks
gtag('event', 'click_to_checkout', {
    'event_category': 'Conversion',
    'event_label': 'PayPal Checkout',
    'value': event.pricing.tiers[0].price
});

// Track alternative payment views
gtag('event', 'view_mbway_option', {
    'event_category': 'Payment',
    'event_label': 'MBWay Option Viewed',
    'value': isHidden ? 1 : 0
});
```

### Content Interaction Events

#### Video Testimonials
```javascript
// Track video play events
gtag('event', 'video_play', {
    'event_category': 'Testimonials',
    'event_label': `YouTube Video ${videoId}`,
    'value': 1
});

// Track testimonial section views
gtag('event', 'view_testimonials_section', {
    'event_category': 'Engagement',
    'event_label': 'Social Proof'
});
```

#### FAQ Interactions
```javascript
// Track FAQ opens/closes
gtag('event', 'toggle_faq', {
    'event_category': 'Engagement',
    'event_label': `FAQ ${faqNumber}`,
    'faq_action': isCurrentlyOpen ? 'close' : 'open'
});
```

### Communication Events

#### WhatsApp Interactions
```javascript
// Track WhatsApp contact attempts
gtag('event', 'whatsapp_contact', {
    'event_category': 'Contact',
    'event_label': 'WhatsApp Button Click',
    'contact_method': 'whatsapp'
});
```

## Performance Tracking

### Core Web Vitals
```javascript
// Track Largest Contentful Paint (LCP)
const lcpObserver = new PerformanceObserver((list) => {
    for (const entry of list.getEntries()) {
        if (entry.entryType === 'largest-contentful-paint') {
            if (typeof gtag !== 'undefined') {
                gtag('event', 'hero_lcp_timing', {
                    custom_parameter: entry.startTime,
                    event_category: 'Performance'
                });
            }
        }
    }
});
```

### Page Load Performance
```javascript
// Track page load complete
window.addEventListener('load', function() {
    const loadTime = performance.timing.loadEventEnd - performance.timing.navigationStart;
    
    gtag('event', 'page_load_time', {
        'event_category': 'Performance',
        'value': loadTime
    });
});
```

## Custom Dimensions and Metrics

### User Context Tracking
```javascript
// Track device type
const isMobile = window.innerWidth <= 768;
gtag('config', 'GA_MEASUREMENT_ID', {
    'custom_map': {
        'dimension1': 'device_type'
    }
});

gtag('event', 'page_view', {
    'device_type': isMobile ? 'mobile' : 'desktop'
});
```

### Event Context
```javascript
// Track event-specific information
gtag('event', 'event_interest', {
    'event_category': 'Event Info',
    'event_name': 'Café com Vendas - Edição Portugal',
    'event_date': '2025-09-20',
    'event_price': 180,
    'spots_available': 8
});
```

## Goal and Conversion Setup

### Primary Goals
1. **PayPal Checkout Clicks** - Main conversion goal
2. **WhatsApp Contact** - Support/inquiry goal  
3. **Scroll to Offer Section** - Engagement goal
4. **Video Testimonial Views** - Content engagement goal

### Enhanced E-commerce Tracking
```javascript
// Track "purchase" when checkout is initiated
gtag('event', 'purchase', {
    'transaction_id': Date.now().toString(),
    'value': event.pricing.tiers[0].price,
    'currency': 'EUR',
    'items': [{
        'item_id': 'cafe-com-vendas-pt',
        'item_name': 'Café com Vendas - Edição Portugal',
        'category': 'Event Ticket',
        'quantity': 1,
        'price': event.pricing.tiers[0].price
    }]
});
```

## Audience Segmentation

### Custom Audiences
- **High-Intent Users**: Users who scrolled >75% and viewed pricing
- **Video Viewers**: Users who played testimonial videos
- **WhatsApp Inquirers**: Users who clicked WhatsApp button
- **Mobile Users**: Users on mobile devices
- **Return Visitors**: Users who visited multiple times

### Behavioral Segmentation
```javascript
// Track user behavior patterns
function trackUserBehavior() {
    const behaviors = [];
    
    if (scrollDepth75) behaviors.push('deep_scroller');
    if (videoPlayed) behaviors.push('video_viewer');
    if (faqOpened) behaviors.push('detail_seeker');
    
    gtag('event', 'user_behavior_profile', {
        'event_category': 'User Profiling',
        'behaviors': behaviors.join(',')
    });
}
```

## Reporting and Analysis

### Key Metrics to Monitor

#### Conversion Funnel
1. Page views
2. Scroll to problem section (25% scroll)
3. Scroll to solution section (50% scroll)
4. Scroll to pricing section (75% scroll)
5. Click to checkout
6. Payment completion (external tracking needed)

#### Content Performance
- Time spent on page
- Section view rates
- Video play rates
- FAQ interaction rates
- Bounce rate by traffic source

#### User Experience
- Core Web Vitals scores
- Page load times
- Mobile vs desktop behavior
- Error rates and types

### Custom Reports Setup

#### Conversion Funnel Report
```javascript
// Set up funnel steps
const funnelSteps = [
    'page_view',
    'scroll_depth_25',
    'scroll_depth_50', 
    'scroll_depth_75',
    'click_to_checkout'
];

// Track funnel progression
function trackFunnelStep(step, additionalData = {}) {
    gtag('event', step, {
        'event_category': 'Conversion Funnel',
        ...additionalData
    });
}
```

#### Content Engagement Report
```javascript
// Track content interaction
function trackContentEngagement(contentType, action, details = {}) {
    gtag('event', 'content_engagement', {
        'event_category': 'Content',
        'event_label': contentType,
        'engagement_action': action,
        ...details
    });
}
```

## Privacy and Compliance

### GDPR Considerations
```javascript
// Respect user consent preferences
function initializeAnalytics() {
    // Check for consent before initializing
    if (hasUserConsented()) {
        gtag('config', 'GA_MEASUREMENT_ID', {
            'analytics_storage': 'granted',
            'ad_storage': 'denied' // Deny ads storage for privacy
        });
    } else {
        gtag('config', 'GA_MEASUREMENT_ID', {
            'analytics_storage': 'denied',
            'ad_storage': 'denied'
        });
    }
}
```

### Data Retention
- Set appropriate data retention periods (14 months recommended)
- Configure user deletion on request
- Anonymize IP addresses

### Cookie Management
```javascript
// Configure cookie settings
gtag('config', 'GA_MEASUREMENT_ID', {
    'cookie_flags': 'SameSite=None;Secure',
    'cookie_expires': 63072000, // 2 years
    'anonymize_ip': true
});
```

## Debugging and Testing

### Debug Mode
```javascript
// Enable debug mode for testing
gtag('config', 'GA_MEASUREMENT_ID', {
    'debug_mode': true
});
```

### Event Testing
```javascript
// Test event firing
function testAnalyticsEvent(eventName, parameters = {}) {
    console.log('Testing Analytics Event:', eventName, parameters);
    
    if (typeof gtag !== 'undefined') {
        gtag('event', eventName, {
            'debug_mode': true,
            ...parameters
        });
    } else {
        console.warn('gtag not available');
    }
}
```

### Real-time Validation
- Use GA4 Debug View to see events in real-time
- Test on different devices and browsers
- Verify event parameters are correct
- Check conversion attribution

## Advanced Features

### User ID Tracking
```javascript
// Track returning users across sessions
if (userId) {
    gtag('config', 'GA_MEASUREMENT_ID', {
        'user_id': userId
    });
}
```

### Custom Parameters
```javascript
// Track business-specific metrics
gtag('event', 'page_view', {
    'event_version': '2.0',
    'page_language': 'pt-PT',
    'business_vertical': 'entrepreneurship',
    'event_type': 'workshop'
});
```

## Integration with Other Tools

### Google Tag Manager
```html
<!-- GTM Container -->
<script>(function(w,d,s,l,i){w[l]=w[l]||[];w[l].push({'gtm.start':
new Date().getTime(),event:'gtm.js'});var f=d.getElementsByTagName(s)[0],
j=d.createElement(s),dl=l!='dataLayer'?'&l='+l:'';j.async=true;j.src=
'https://www.googletagmanager.com/gtm.js?id='+i+dl;f.parentNode.insertBefore(j,f);
})(window,document,'script','dataLayer','GTM-XXXXXX');</script>
```

### Facebook Pixel Integration
```javascript
// Cross-platform tracking
function trackCrossPlatform(eventName, data) {
    // Google Analytics
    gtag('event', eventName, data);
    
    // Facebook Pixel
    if (typeof fbq !== 'undefined') {
        fbq('track', eventName, data);
    }
}
```

## Best Practices

### Event Naming
- Use consistent naming conventions
- Include context in event names
- Use lowercase with underscores
- Be descriptive but concise

### Data Quality
- Validate event parameters before sending
- Use consistent parameter names
- Include relevant context information
- Avoid sending sensitive data

### Performance
- Use passive event listeners where possible
- Batch events when appropriate
- Avoid tracking too frequently
- Test impact on page performance

### Maintenance
- Document all custom events
- Review and clean up unused events
- Update tracking for new features
- Monitor for tracking errors

## Troubleshooting

### Common Issues
1. **Events not firing**: Check gtag availability and syntax
2. **Incorrect parameters**: Validate parameter names and values
3. **Blocked by ad blockers**: Implement fallback tracking
4. **CORS issues**: Ensure proper domain configuration

### Testing Tools
- Google Analytics Debugger extension
- GA4 Debug View
- Browser developer tools
- Network tab for request verification

This analytics implementation provides comprehensive tracking for understanding user behavior, optimizing conversion rates, and measuring the success of the Café com Vendas landing page.
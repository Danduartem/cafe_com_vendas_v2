# GTM Production Preview Mode Testing Guide

## Overview

This guide explains how to test Server GTM preview mode on the production website (`www.jucanamaximiliano.com.br`), now that we've extended our proxy solution to work in both development and production environments.

## How It Works

### Problem Solved
Modern browsers block third-party cookies between your production domain and the Server GTM container (`server-side-tagging-m5scdmswwq-uc.a.run.app`), preventing preview mode cookies from being sent.

### Solution Implemented
The GTM Preview Fix v2.1 automatically detects preview mode and routes requests through your production Netlify proxy, preserving cookie context:

```
Production Flow (Preview Mode):
www.jucanamaximiliano.com.br → /.netlify/functions/gtm-proxy → Server GTM → GA4
```

## Testing Instructions

### 1. Enable Server GTM Preview Mode

1. Go to [Google Tag Manager](https://tagmanager.google.com/)
2. Select your Server GTM container
3. Click **Preview** button
4. Enter your production URL: `https://www.jucanamaximiliano.com.br`
5. Click **Connect**

### 2. Navigate to Your Site

1. GTM will redirect you to: `https://www.jucanamaximiliano.com.br?gtm_debug=TIMESTAMP`
2. The preview fix will automatically detect the `gtm_debug` parameter
3. Console logs will show the proxy activation

### 3. Verify Proxy Activation

Open Chrome DevTools Console and look for:

```javascript
[GTM Preview Fix v2.1] Preview mode detected, installing enhanced interceptors: {
  environment: "production", 
  hostname: "www.jucanamaximiliano.com.br",
  previewToken: "1234567890...",
  proxyEndpoint: "https://www.jucanamaximiliano.com.br/.netlify/functions/gtm-proxy"
}

[GTM Preview Fix] All interceptors installed successfully for production environment
[GTM Preview Fix] Transformed URL: {original: "server-side-tagging...collect", proxy: "https://www.jucanamaximiliano.com.br/.netlify/functions/gtm-proxy..."}
[GTM Preview Fix] Intercepted fetch request: {transformed: true, hasPreviewHeader: true}
```

### 4. Check Server GTM Debug Panel

1. Return to Google Tag Manager
2. The debug panel should show **Connected**
3. Perform actions on your site (clicks, form submissions, etc.)
4. Verify events appear in the debug panel

### 5. Verify Network Requests

In Chrome DevTools Network tab:

1. Filter by "gtm-proxy"
2. You should see requests to `/.netlify/functions/gtm-proxy` 
3. Check Response headers for CORS compliance
4. Verify Status 200 responses

## Expected Behavior

### ✅ When Working Correctly

- Console shows environment detection: `environment: "production"`
- URLs are transformed to use the proxy: `transformed: true`
- Preview panel in GTM shows "Connected" status
- Events fire and appear in GTM debug interface
- Network requests show successful proxy calls

### ❌ Troubleshooting

**Problem**: Console shows `environment: "unknown"`
**Solution**: Check hostname detection in preview fix script

**Problem**: No URL transformation (`transformed: false`)
**Solution**: Verify `gtm_debug` parameter is in URL

**Problem**: 404 errors on proxy requests
**Solution**: Ensure latest deployment includes proxy function

**Problem**: CORS errors
**Solution**: Check proxy function CORS headers configuration

## Production Safety

### Zero Impact on Regular Visitors
- Preview fix only activates when `gtm_debug` parameter is present
- Normal visitors bypass proxy entirely
- No performance impact on production traffic

### Security Considerations
- Proxy function validates preview mode requests
- Only GTM-related endpoints are proxied
- CORS headers properly configured for cross-origin requests

## Architecture Summary

```
Regular Production Traffic:
Website → Server GTM (direct) → GA4

Preview Mode Traffic:
Website → Netlify Proxy → Server GTM → GA4 (with cookies preserved)
```

The proxy creates a **first-party context** that allows preview mode cookies to be included in requests, solving the cross-site cookie blocking issue while maintaining production performance.

## Next Steps

After successful testing, you can:

1. **Monitor Netlify Function Usage**: Check function invocation logs
2. **Verify Analytics Data**: Ensure preview mode events don't pollute production data
3. **Document Team Workflow**: Share this testing process with your team
4. **Set Up Alerts**: Monitor proxy function errors in production

This solution gives you full Server GTM debugging capabilities on your live production site! 🎉
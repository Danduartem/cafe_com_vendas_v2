# Netlify Hosting Platform Documentation

## Overview
Netlify is a comprehensive web development platform that combines static site hosting, serverless functions, edge computing, and continuous deployment. This guide covers deployment and configuration for the Café com Vendas landing page.

## Key Features
- **Static Site Hosting**: Fast global CDN with instant cache invalidation
- **Continuous Deployment**: Git-based workflows with automatic builds
- **Edge Functions**: JavaScript/TypeScript execution at the edge
- **Serverless Functions**: Backend logic without server management
- **Forms**: Built-in form handling with spam protection
- **Domain Management**: Custom domains with SSL certificates

## Project Configuration

### 1. netlify.toml Configuration
```toml
[build]
  command = "npm run build"
  publish = "_site"
  functions = "netlify/functions"
  edge_functions = "netlify/edge-functions"

[build.environment]
  NODE_VERSION = "18"
  NPM_VERSION = "9"

# Build processing
[build.processing]
  skip_processing = false

[build.processing.css]
  bundle = true
  minify = true

[build.processing.js]
  bundle = true
  minify = true

[build.processing.html]
  pretty_urls = true

[build.processing.images]
  compress = true

# Headers for performance and security
[[headers]]
  for = "/*"
  [headers.values]
    X-Frame-Options = "DENY"
    X-XSS-Protection = "1; mode=block"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=()"

[[headers]]
  for = "/assets/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.css"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

[[headers]]
  for = "/*.js"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"

# Redirects for clean URLs and analytics tracking
[[redirects]]
  from = "/inscricao"
  to = "https://forms.fillout.com/t/YOUR_FORM_ID?source=direct"
  status = 302

[[redirects]]
  from = "/instagram"
  to = "https://forms.fillout.com/t/YOUR_FORM_ID?source=instagram"
  status = 302

[[redirects]]
  from = "/linkedin" 
  to = "https://forms.fillout.com/t/YOUR_FORM_ID?source=linkedin"
  status = 302

# Edge Functions configuration
[[edge_functions]]
  path = "/api/*"
  function = "api-handler"

[[edge_functions]]
  path = "/"
  function = "analytics"

# Context-specific settings
[context.production]
  command = "npm run build"
  environment = { NODE_ENV = "production" }

[context.deploy-preview]
  command = "npm run build"
  environment = { NODE_ENV = "development" }

[context.branch-deploy]
  command = "npm run build"
  environment = { NODE_ENV = "staging" }
```

## Edge Functions Implementation

### 1. Analytics Tracking Edge Function
```typescript
// netlify/edge-functions/analytics.ts
import { Context } from "@netlify/edge-functions";

export default async function handler(request: Request, context: Context) {
  // Track page views and user behavior
  const url = new URL(request.url);
  const userAgent = request.headers.get('user-agent') || '';
  const referer = request.headers.get('referer') || '';
  const ip = context.ip;
  
  // Extract tracking parameters
  const source = url.searchParams.get('source');
  const utm_campaign = url.searchParams.get('utm_campaign');
  const utm_medium = url.searchParams.get('utm_medium');
  
  // Log analytics data (send to your analytics service)
  await logPageView({
    path: url.pathname,
    userAgent,
    referer,
    ip,
    source,
    utm_campaign,
    utm_medium,
    timestamp: new Date().toISOString(),
    geo: {
      country: context.geo.country?.name,
      city: context.geo.city,
      region: context.geo.subdivision?.name
    }
  });
  
  // Continue to the original request
  return context.next();
}

async function logPageView(data: any) {
  // Send to your analytics service (e.g., Google Analytics, Plausible, etc.)
  try {
    await fetch('YOUR_ANALYTICS_ENDPOINT', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': 'Bearer YOUR_API_KEY'
      },
      body: JSON.stringify(data)
    });
  } catch (error) {
    console.error('Analytics logging failed:', error);
  }
}

export const config = {
  path: "/*"
};
```

### 2. A/B Testing Edge Function
```typescript
// netlify/edge-functions/ab-test.ts
import { Context } from "@netlify/edge-functions";

export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url);
  
  // Skip A/B testing for assets and admin paths
  if (url.pathname.startsWith('/assets/') || 
      url.pathname.startsWith('/admin/') ||
      url.pathname.includes('.')) {
    return context.next();
  }
  
  // Get or create user variant
  const cookies = context.cookies;
  let variant = cookies.get('ab_variant');
  
  if (!variant) {
    // Assign user to variant (50/50 split)
    variant = Math.random() < 0.5 ? 'control' : 'treatment';
    
    // Set cookie for consistent experience
    const response = await context.next();
    response.headers.set('Set-Cookie', 
      `ab_variant=${variant}; Path=/; Max-Age=2592000; SameSite=Lax`
    );
    
    return response;
  }
  
  // Apply variant-specific logic
  if (variant === 'treatment' && url.pathname === '/') {
    // Serve alternative version or modify content
    const response = await context.next();
    let html = await response.text();
    
    // Modify HTML for treatment group
    html = html.replace(
      /<title>([^<]*)<\/title>/, 
      '<title>🚀 Transforma o Teu Negócio - Café com Vendas</title>'
    );
    
    return new Response(html, {
      status: response.status,
      headers: {
        ...response.headers,
        'Content-Type': 'text/html; charset=utf-8',
        'X-AB-Variant': variant
      }
    });
  }
  
  const response = await context.next();
  response.headers.set('X-AB-Variant', variant);
  return response;
}

export const config = {
  path: "/"
};
```

### 3. API Handler Edge Function
```typescript
// netlify/edge-functions/api-handler.ts
import { Context } from "@netlify/edge-functions";

export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url);
  const path = url.pathname.replace('/api', '');
  
  // CORS headers
  const corsHeaders = {
    'Access-Control-Allow-Origin': 'https://cafecomvendas.com',
    'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
    'Access-Control-Allow-Headers': 'Content-Type, Authorization',
  };
  
  // Handle preflight requests
  if (request.method === 'OPTIONS') {
    return new Response(null, { 
      status: 204, 
      headers: corsHeaders 
    });
  }
  
  try {
    switch (path) {
      case '/spots-remaining':
        return handleSpotsRemaining(request, context);
      
      case '/register':
        return handleRegistration(request, context);
      
      case '/webhook/stripe':
        return handleStripeWebhook(request, context);
      
      case '/webhook/mailerlite':
        return handleMailerLiteWebhook(request, context);
      
      default:
        return new Response('Not Found', { 
          status: 404,
          headers: corsHeaders
        });
    }
  } catch (error) {
    console.error('API Error:', error);
    return new Response('Internal Server Error', { 
      status: 500,
      headers: corsHeaders
    });
  }
}

async function handleSpotsRemaining(request: Request, context: Context) {
  // Get current registration count from your data store
  const totalSpots = 8;
  const registeredCount = await getRegistrationCount();
  const remaining = Math.max(0, totalSpots - registeredCount);
  
  return new Response(JSON.stringify({
    total: totalSpots,
    registered: registeredCount,
    remaining: remaining,
    soldOut: remaining === 0
  }), {
    headers: {
      'Content-Type': 'application/json',
      'Cache-Control': 'public, max-age=60' // Cache for 1 minute
    }
  });
}

async function handleRegistration(request: Request, context: Context) {
  if (request.method !== 'POST') {
    return new Response('Method Not Allowed', { status: 405 });
  }
  
  const registrationData = await request.json();
  
  // Validate registration data
  if (!registrationData.email || !registrationData.name) {
    return new Response('Missing required fields', { status: 400 });
  }
  
  // Process registration (save to database, send to email service, etc.)
  const result = await processRegistration(registrationData);
  
  return new Response(JSON.stringify(result), {
    headers: { 'Content-Type': 'application/json' }
  });
}

export const config = {
  path: "/api/*"
};
```

## Serverless Functions

### 1. Form Submission Handler
```javascript
// netlify/functions/submit-form.js
exports.handler = async (event, context) => {
  // Only allow POST requests
  if (event.httpMethod !== 'POST') {
    return {
      statusCode: 405,
      body: JSON.stringify({ error: 'Method Not Allowed' })
    };
  }
  
  try {
    const formData = JSON.parse(event.body);
    
    // Validate required fields
    const required = ['name', 'email'];
    for (const field of required) {
      if (!formData[field]) {
        return {
          statusCode: 400,
          body: JSON.stringify({ error: `Missing required field: ${field}` })
        };
      }
    }
    
    // Process form submission
    const results = await Promise.allSettled([
      // Add to MailerLite
      addToMailerLite(formData),
      // Send notification
      sendNotification(formData),
      // Log to analytics
      logFormSubmission(formData)
    ]);
    
    // Check for failures
    const failures = results.filter(r => r.status === 'rejected');
    if (failures.length > 0) {
      console.error('Form submission partial failure:', failures);
    }
    
    return {
      statusCode: 200,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ 
        success: true,
        message: 'Form submitted successfully'
      })
    };
    
  } catch (error) {
    console.error('Form submission error:', error);
    
    return {
      statusCode: 500,
      body: JSON.stringify({ 
        error: 'Internal server error',
        message: 'Failed to process form submission'
      })
    };
  }
};
```

### 2. Webhook Handler for Stripe
```javascript
// netlify/functions/stripe-webhook.js
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

exports.handler = async (event, context) => {
  if (event.httpMethod !== 'POST') {
    return { statusCode: 405, body: 'Method Not Allowed' };
  }
  
  const sig = event.headers['stripe-signature'];
  const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET;
  
  try {
    // Verify webhook signature
    const stripeEvent = stripe.webhooks.constructEvent(
      event.body, 
      sig, 
      endpointSecret
    );
    
    console.log('Stripe webhook event:', stripeEvent.type);
    
    switch (stripeEvent.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(stripeEvent.data.object);
        break;
        
      case 'payment_intent.payment_failed':
        await handlePaymentFailure(stripeEvent.data.object);
        break;
        
      default:
        console.log(`Unhandled event type: ${stripeEvent.type}`);
    }
    
    return {
      statusCode: 200,
      body: JSON.stringify({ received: true })
    };
    
  } catch (error) {
    console.error('Stripe webhook error:', error);
    return {
      statusCode: 400,
      body: `Webhook Error: ${error.message}`
    };
  }
};

async function handlePaymentSuccess(paymentIntent) {
  const customerEmail = paymentIntent.receipt_email;
  const amount = paymentIntent.amount_received / 100;
  
  // Add to MailerLite event group
  await addToEventGroup(customerEmail, {
    paymentId: paymentIntent.id,
    amount: amount,
    ticketNumber: generateTicketNumber()
  });
  
  // Send confirmation email
  await sendConfirmationEmail(customerEmail, {
    amount: amount,
    eventDate: '2024-09-20',
    location: 'Lisboa'
  });
  
  // Update spots counter
  await updateAvailableSpots();
}
```

## Deployment Automation

### 1. GitHub Actions Integration
```yaml
# .github/workflows/deploy.yml
name: Deploy to Netlify

on:
  push:
    branches: [main]
  pull_request:
    branches: [main]

jobs:
  build-and-deploy:
    runs-on: ubuntu-latest
    
    steps:
    - name: Checkout
      uses: actions/checkout@v3
      
    - name: Setup Node.js
      uses: actions/setup-node@v3
      with:
        node-version: '18'
        cache: 'npm'
        
    - name: Install dependencies
      run: npm ci
      
    - name: Build tokens
      run: npm run tokens:build
      
    - name: Build CSS
      run: npm run build:css
      
    - name: Build JavaScript
      run: npm run build:js
      
    - name: Build site
      run: npm run build
      
    - name: Deploy to Netlify
      uses: nwtgck/actions-netlify@v2
      with:
        publish-dir: './_site'
        production-branch: main
        github-token: ${{ secrets.GITHUB_TOKEN }}
        deploy-message: "Deploy from GitHub Actions"
        enable-pull-request-comment: true
        enable-commit-comment: true
        overwrites-pull-request-comment: true
      env:
        NETLIFY_AUTH_TOKEN: ${{ secrets.NETLIFY_AUTH_TOKEN }}
        NETLIFY_SITE_ID: ${{ secrets.NETLIFY_SITE_ID }}
```

### 2. Build Hooks for External Updates
```javascript
// Script to trigger Netlify build from external services
const triggerBuild = async () => {
  const buildHookUrl = process.env.NETLIFY_BUILD_HOOK;
  
  try {
    const response = await fetch(buildHookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        trigger_branch: 'main',
        trigger_title: 'Content update'
      })
    });
    
    if (response.ok) {
      console.log('Build triggered successfully');
      return await response.json();
    } else {
      throw new Error(`Build trigger failed: ${response.statusText}`);
    }
  } catch (error) {
    console.error('Failed to trigger build:', error);
    throw error;
  }
};
```

## Performance Optimization

### 1. Caching Strategy
```toml
# Additional caching headers in netlify.toml
[[headers]]
  for = "/*.html"
  [headers.values]
    Cache-Control = "public, max-age=300, s-maxage=3600"

[[headers]]
  for = "/api/*"
  [headers.values]
    Cache-Control = "private, no-cache"

[[headers]]
  for = "/assets/fonts/*"
  [headers.values]
    Cache-Control = "public, max-age=31536000, immutable"
    Cross-Origin-Resource-Policy = "cross-origin"
```

### 2. Image Optimization
```javascript
// netlify/edge-functions/image-optimization.ts
export default async function handler(request: Request, context: Context) {
  const url = new URL(request.url);
  
  // Only process image requests
  if (!url.pathname.match(/\.(jpg|jpeg|png|webp)$/i)) {
    return context.next();
  }
  
  const accepts = request.headers.get('accept') || '';
  const supportsWebP = accepts.includes('image/webp');
  const supportsAvif = accepts.includes('image/avif');
  
  // Determine optimal format
  let format = 'jpeg';
  if (supportsAvif) format = 'avif';
  else if (supportsWebP) format = 'webp';
  
  // Get device pixel ratio from cookie or default
  const cookies = context.cookies;
  const dpr = parseFloat(cookies.get('dpr') || '1');
  
  // Build optimized image URL (using a service like Cloudinary or Netlify Large Media)
  const optimizedUrl = buildImageUrl(url.pathname, {
    format,
    quality: 85,
    dpr: Math.min(dpr, 2) // Cap at 2x
  });
  
  try {
    const response = await fetch(optimizedUrl);
    return new Response(response.body, {
      status: response.status,
      headers: {
        ...response.headers,
        'Cache-Control': 'public, max-age=31536000, immutable',
        'Vary': 'Accept'
      }
    });
  } catch (error) {
    // Fallback to original image
    return context.next();
  }
}
```

## Security Configuration

### 1. Environment Variables
```bash
# Netlify environment variables (set in dashboard)
STRIPE_PUBLISHABLE_KEY=pk_live_...
STRIPE_SECRET_KEY=sk_live_...
STRIPE_WEBHOOK_SECRET=whsec_...
MAILERLITE_API_KEY=eyJ0eXAiOiJKV1QiLCJh...
FILLOUT_API_KEY=...
ANALYTICS_API_KEY=...
SITE_URL=https://cafecomvendas.com
```

### 2. Security Headers
```toml
# Enhanced security headers
[[headers]]
  for = "/*"
  [headers.values]
    Strict-Transport-Security = "max-age=31536000; includeSubDomains; preload"
    Content-Security-Policy = "default-src 'self'; script-src 'self' 'unsafe-inline' https://js.stripe.com https://server.fillout.com; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https://api.stripe.com https://api.fillout.com"
    X-Frame-Options = "DENY"
    X-Content-Type-Options = "nosniff"
    Referrer-Policy = "strict-origin-when-cross-origin"
    Permissions-Policy = "camera=(), microphone=(), geolocation=(self), payment=(self)"
```

## Monitoring and Analytics

### 1. Error Tracking
```javascript
// netlify/edge-functions/error-tracking.ts
export default async function handler(request: Request, context: Context) {
  try {
    const response = await context.next();
    
    // Log 4xx and 5xx responses
    if (response.status >= 400) {
      await logError({
        url: request.url,
        method: request.method,
        status: response.status,
        userAgent: request.headers.get('user-agent'),
        ip: context.ip,
        timestamp: new Date().toISOString()
      });
    }
    
    return response;
  } catch (error) {
    // Log uncaught errors
    await logError({
      url: request.url,
      method: request.method,
      error: error.message,
      stack: error.stack,
      ip: context.ip,
      timestamp: new Date().toISOString()
    });
    
    throw error;
  }
}
```

### 2. Performance Monitoring
```javascript
// netlify/edge-functions/performance-monitor.ts
export default async function handler(request: Request, context: Context) {
  const startTime = Date.now();
  
  const response = await context.next();
  
  const endTime = Date.now();
  const responseTime = endTime - startTime;
  
  // Log performance metrics
  await logPerformance({
    url: request.url,
    method: request.method,
    status: response.status,
    responseTime,
    region: context.server.region,
    timestamp: new Date().toISOString()
  });
  
  // Add performance headers
  response.headers.set('X-Response-Time', `${responseTime}ms`);
  response.headers.set('X-Region', context.server.region);
  
  return response;
}
```

## Development Workflow

### 1. Local Development
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Login to Netlify
netlify login

# Link to existing site
netlify link

# Start local development server with functions
netlify dev

# Build and serve locally
netlify build && netlify serve
```

### 2. Environment Setup
```bash
# .env.local (for local development)
NETLIFY_DEV=true
STRIPE_PUBLISHABLE_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
MAILERLITE_API_KEY=test_key
SITE_URL=http://localhost:8888
```

## Deployment Checklist

### Pre-Launch
- [ ] Configure all environment variables
- [ ] Set up custom domain with SSL
- [ ] Configure DNS records
- [ ] Test all form submissions
- [ ] Verify webhook endpoints
- [ ] Check security headers
- [ ] Run performance audit
- [ ] Test edge functions
- [ ] Verify analytics tracking

### Post-Launch Monitoring
- [ ] Monitor function execution logs
- [ ] Check error rates and response times
- [ ] Verify CDN cache hit rates
- [ ] Monitor form conversion rates
- [ ] Check webhook delivery success
- [ ] Review security logs

## Resources
- [Netlify Documentation](https://docs.netlify.com/)
- [Edge Functions API](https://docs.netlify.com/build/edge-functions/api/)
- [Serverless Functions](https://docs.netlify.com/build/functions/)
- [Build Configuration](https://docs.netlify.com/configure-builds/overview/)
- [Security Best Practices](https://docs.netlify.com/manage/security/)
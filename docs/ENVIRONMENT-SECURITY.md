# Environment Variables & Security Configuration

## Overview
This guide covers secure configuration management for the Café com Vendas project, including API keys, environment variables, and security best practices.

## 🚨 Security Principles

### Critical Rules
- **NEVER** commit secret keys to the repository
- **ONLY** publishable/public keys go in client-side code
- **ALL** secret keys must be stored as environment variables
- **ALWAYS** use different keys for development and production

### Key Classification

#### ✅ Client-Safe (Can be exposed to browser)
- Stripe Publishable Keys (`pk_test_*`, `pk_live_*`)
- Formspree Form IDs and endpoints
- Google Analytics Measurement IDs
- YouTube video IDs
- WhatsApp phone numbers

#### ❌ Server-Only (NEVER expose to client)
- Stripe Secret Keys (`sk_test_*`, `sk_live_*`)
- MailerLite API Keys
- Webhook secrets
- Database credentials
- Any API key with write permissions

## Environment Configuration

### 1. Local Development Setup

#### Step 1: Create .env.local file
```bash
# Copy the template
cp .env.example .env.local
```

#### Step 2: Configure .env.local
```bash
# Environment
NODE_ENV=development

# Formspree (Public endpoint - safe to expose)
FORMSPREE_FORM_ID=xanbnrvp

# Stripe Test Keys (for development)
VITE_STRIPE_PUBLISHABLE_KEY=pk_test_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_test_YOUR_SECRET_KEY_HERE

# MailerLite (Server-side only - NEVER expose to client)
MAILERLITE_API_KEY=eyJYOUR_MAILERLITE_JWT_TOKEN_HERE

# Analytics (optional)
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Contact Information
CONTACT_EMAIL=team@cafecomvendas.com
SUPPORT_WHATSAPP=+351912345678
```

### 2. Production Environment Setup (Netlify)

#### Netlify Dashboard → Site Settings → Environment Variables

Set these **exact** environment variables in your Netlify dashboard:

```bash
# Environment
NODE_ENV=production

# Formspree
FORMSPREE_FORM_ID=your_form_id_here

# Stripe Live Keys (Production)
VITE_STRIPE_PUBLISHABLE_KEY=pk_live_YOUR_PUBLISHABLE_KEY_HERE
STRIPE_SECRET_KEY=sk_live_YOUR_SECRET_KEY_HERE

# MailerLite (Server-side only)
MAILERLITE_API_KEY=eyJYOUR_MAILERLITE_JWT_TOKEN_HERE

# Contact Information
CONTACT_EMAIL=team@cafecomvendas.com
SUPPORT_WHATSAPP=+351912345678
```

## Client-Side Configuration

### Safe Configuration (src/assets/js/config/environment.js)
The environment.js file automatically selects the correct publishable keys based on the current domain:

```javascript
// ✅ SAFE: Only contains publishable keys and public endpoints
const config = {
  formspree: {
    endpoint: 'https://formspree.io/f/xanbnrvp', // Public endpoint
    formId: 'xanbnrvp'
  },
  
  stripe: {
    publishableKey: isDevelopment 
      ? 'pk_test_...' // Test publishable key (safe to expose)
      : 'pk_live_...' // Live publishable key (safe to expose)
  }
};
```

### Usage in Components
```javascript
// Import the safe configuration
import { ENV } from '../config/constants.js';

// Use in your components
const stripePublishableKey = ENV.stripe.publishableKey;
const formspreeEndpoint = ENV.formspree.endpoint;
```

## Netlify Functions (Server-Side)

### Access Secret Keys Safely
```javascript
// netlify/functions/mailerlite-integration.js
exports.handler = async (event, context) => {
  // ✅ SAFE: Secret keys only accessible on server-side
  const mailerLiteKey = process.env.MAILERLITE_API_KEY;
  const stripeSecretKey = process.env.STRIPE_SECRET_KEY;
  
  // Process server-side logic here
  // NEVER send secret keys to client
};
```

## Security Checklist

### ✅ What's Already Secure
- [x] `.gitignore` protects `.env*` files
- [x] Client-side config only contains publishable keys
- [x] Environment template (`.env.example`) documents required variables
- [x] Automatic environment detection for dev/prod

### 🔒 Additional Security Measures

#### 1. Environment Variable Validation
```javascript
// Add to your build script or app initialization
const validateEnvironment = () => {
  const required = {
    client: ['FORMSPREE_FORM_ID'],
    server: ['STRIPE_SECRET_KEY', 'MAILERLITE_API_KEY']
  };
  
  // Check server-side variables (in Netlify functions)
  if (typeof process !== 'undefined') {
    required.server.forEach(key => {
      if (!process.env[key]) {
        throw new Error(`Missing required environment variable: ${key}`);
      }
    });
  }
};
```

#### 2. Content Security Policy
```html
<!-- Already configured in NETLIFY.md -->
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://js.stripe.com;
  style-src 'self' 'unsafe-inline';
  connect-src 'self' https://api.stripe.com https://formspree.io;
  form-action 'self' https://formspree.io;
">
```

#### 3. HTTPS Enforcement
```javascript
// Redirect HTTP to HTTPS in production
if (location.protocol !== 'https:' && location.hostname !== 'localhost') {
  location.replace(`https:${location.href.substring(location.protocol.length)}`);
}
```

## API Key Management

### Current Active Keys

#### Formspree
- **Form ID**: `xanbnrvp`
- **Endpoint**: `https://formspree.io/f/xanbnrvp`
- **Type**: Public (safe to expose)

#### Stripe Test Environment
- **Publishable**: `pk_test_YOUR_TEST_PUBLISHABLE_KEY_HERE`
- **Secret**: `sk_test_YOUR_TEST_SECRET_KEY_HERE`

#### Stripe Production Environment  
- **Publishable**: `pk_live_YOUR_LIVE_PUBLISHABLE_KEY_HERE`
- **Secret**: `sk_live_YOUR_LIVE_SECRET_KEY_HERE`

#### MailerLite
- **API Key**: `eyJYOUR_MAILERLITE_JWT_TOKEN_HERE`

## Netlify Environment Variables Setup

### Step-by-Step Instructions

1. **Log in to Netlify Dashboard**
   - Go to [netlify.com](https://netlify.com)
   - Navigate to your site

2. **Access Environment Variables**
   - Site Dashboard → Site Settings → Environment Variables
   - Click "Add a variable"

3. **Add Production Variables** (one by one):

   | Variable Name | Value | Scope |
   |---------------|-------|--------|
   | `NODE_ENV` | `production` | All |
   | `FORMSPREE_FORM_ID` | `your_form_id_here` | All |
   | `STRIPE_PUBLISHABLE_KEY` | `pk_live_YOUR_PUBLISHABLE_KEY_HERE` | All |
   | `STRIPE_SECRET_KEY` | `sk_live_YOUR_SECRET_KEY_HERE` | All |
   | `MAILERLITE_API_KEY` | `eyJYOUR_MAILERLITE_JWT_TOKEN_HERE` | All |

4. **Optional Variables**:
   - `GA_MEASUREMENT_ID`: Your Google Analytics 4 measurement ID
   - `CONTACT_EMAIL`: `team@cafecomvendas.com`
   - `SUPPORT_WHATSAPP`: `+351912345678`

## Usage Patterns

### 1. Client-Side Usage (Safe)
```javascript
// ✅ SAFE: Using environment config for public keys
import { ENV } from '../config/constants.js';

// Initialize Stripe with publishable key
const stripe = Stripe(ENV.stripe.publishableKey);

// Use Formspree endpoint
const form = document.querySelector('form');
form.action = ENV.formspree.endpoint;
```

### 2. Server-Side Usage (Netlify Functions)
```javascript
// ✅ SAFE: Secret keys only on server
exports.handler = async (event, context) => {
  // Secret keys from environment variables
  const stripeSecret = process.env.STRIPE_SECRET_KEY;
  const mailerLiteKey = process.env.MAILERLITE_API_KEY;
  
  // Process server logic
  const stripe = require('stripe')(stripeSecret);
  // ... rest of function
};
```

## Security Best Practices

### ✅ DO
- Store secret keys as environment variables only
- Use different keys for development and production
- Regularly rotate API keys
- Monitor for exposed keys in commits
- Use HTTPS everywhere
- Implement proper CSP headers
- Validate environment variables on startup

### ❌ DON'T
- Commit any `.env*` files with real values
- Put secret keys in client-side JavaScript
- Log sensitive data to console in production
- Share API keys in chat/email
- Use production keys in development
- Hardcode any credentials in source code

## Monitoring & Alerts

### 1. Key Exposure Detection
```bash
# Use git-secrets or similar tools to scan for exposed keys
git secrets --register-aws
git secrets --install
git secrets --scan
```

### 2. Environment Variable Validation
```javascript
// Add to your deployment pipeline
const validateProduction = () => {
  const requiredKeys = [
    'STRIPE_SECRET_KEY',
    'MAILERLITE_API_KEY',
    'FORMSPREE_FORM_ID'
  ];
  
  const missing = requiredKeys.filter(key => !process.env[key]);
  
  if (missing.length > 0) {
    throw new Error(`Missing required environment variables: ${missing.join(', ')}`);
  }
  
  // Validate key formats
  if (!process.env.STRIPE_SECRET_KEY.startsWith('sk_')) {
    throw new Error('Invalid Stripe secret key format');
  }
  
  console.log('✅ Environment validation passed');
};
```

## Troubleshooting

### Common Issues

#### 1. "Invalid publishable key" Error
- **Cause**: Wrong Stripe key for environment
- **Solution**: Check environment detection in `environment.js`
- **Debug**: Open browser console and check `window.CONFIG`

#### 2. Form Submissions Not Working
- **Cause**: Incorrect Formspree endpoint
- **Solution**: Verify form action URL is `https://formspree.io/f/xanbnrvp`
- **Debug**: Check network tab for 404/403 errors

#### 3. Environment Variables Not Loading
- **Cause**: Netlify environment variables not set correctly
- **Solution**: Double-check variable names and values in Netlify dashboard
- **Debug**: Add console.log in Netlify functions to verify variable access

#### 4. Mixed Content Errors
- **Cause**: HTTP requests from HTTPS site
- **Solution**: Ensure all API calls use HTTPS URLs
- **Debug**: Check browser console for mixed content warnings

### Emergency Response

#### If Keys Are Accidentally Committed
1. **Immediately rotate all exposed keys**
   - Generate new Stripe keys in dashboard
   - Create new MailerLite API key
   - Update all services with new keys

2. **Remove from git history**
   ```bash
   # Use BFG Repo-Cleaner or git filter-branch
   git filter-branch --force --index-filter \
     'git rm --cached --ignore-unmatch .env' \
     --prune-empty --tag-name-filter cat -- --all
   ```

3. **Update all environments**
   - Local development (`.env.local`)
   - Netlify production environment variables
   - Any CI/CD systems

## Security Scanning & Prevention

### Recommended Tools
1. **git-secrets** - Prevent secrets from being committed
   ```bash
   # Install git-secrets
   brew install git-secrets  # macOS
   
   # Configure for your repository
   git secrets --register-aws
   git secrets --install
   
   # Scan existing repository
   git secrets --scan
   ```

2. **pre-commit hooks** - Automatic scanning before commits
   ```bash
   # Install pre-commit
   pip install pre-commit
   
   # Add to .pre-commit-config.yaml
   repos:
   - repo: https://github.com/Yelp/detect-secrets
     rev: v1.4.0
     hooks:
     - id: detect-secrets
   ```

3. **GitHub Advanced Security** - If using GitHub
   - Enable secret scanning in repository settings
   - Automatic detection of exposed API keys
   - Push protection to prevent accidental commits

### Manual Checks
```bash
# Check for accidentally committed secrets
git log --all --grep="sk_" --grep="pk_live" --grep="pk_test"

# Search for potential exposed keys in files
rg "sk_(test|live)_[A-Za-z0-9]+" --type js --type md --type json
```

## Resources
- [Netlify Environment Variables](https://docs.netlify.com/configure-builds/environment-variables/)
- [Stripe API Keys](https://stripe.com/docs/keys)
- [Formspree Documentation](https://help.formspree.io/)
- [MailerLite API](https://developers.mailerlite.com/)
- [Git Secrets Tool](https://github.com/awslabs/git-secrets)
- [GitHub Secret Scanning](https://docs.github.com/en/code-security/secret-scanning)
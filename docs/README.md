# Documentation Directory

This directory contains comprehensive documentation for all APIs, integrations, and development tools used in the Café com Vendas project.

## Overview

This project integrates with multiple third-party services and libraries to provide functionality for the landing page, including static site generation, styling, payment processing, analytics, and customer communication.

## Documentation Files

### Core Framework & Build Tools
- **[ELEVENTY.md](./ELEVENTY.md)** - Eleventy static site generator documentation
- **[TAILWIND-CSS.md](./TAILWIND-CSS.md)** - Tailwind CSS utility framework documentation  
- **[VITE.md](./VITE.md)** - Vite build tool configuration guide

### Security & Configuration
- **[ENVIRONMENT-SECURITY.md](./ENVIRONMENT-SECURITY.md)** - Environment variables and security setup

### Payment Processing
- **[STRIPE.md](./STRIPE.md)** - Stripe payment integration guide

### Email Marketing & Forms
- **[MAILERLITE.md](./MAILERLITE.md)** - MailerLite email automation integration
- **[FORMSPREE.md](./FORMSPREE.md)** - Formspree forms backend documentation

### Analytics & Tracking
- **[GOOGLE-ANALYTICS.md](./GOOGLE-ANALYTICS.md)** - Google Analytics 4 implementation

### Media & Communication
- **[YOUTUBE-API.md](./YOUTUBE-API.md)** - YouTube video embedding for testimonials
- **[WHATSAPP-INTEGRATION.md](./WHATSAPP-INTEGRATION.md)** - WhatsApp contact integration

### Hosting & Deployment
- **[NETLIFY.md](./NETLIFY.md)** - Netlify hosting and deployment documentation

## Quick Reference

| Service | Purpose | Implementation | Status |
|---------|---------|---------------|---------|
| Eleventy | Static site generation | Build process, templates | ✅ Active |
| Tailwind CSS | CSS utilities | Styling framework | ✅ Active |
| Vite | JavaScript bundling | ES6 modules → IIFE | ✅ Active |
| Stripe | Payment processing | Payment Links & checkout | ✅ Active |
| MailerLite | Email marketing | Post-purchase automation | 🔄 Planned |
| Formspree | Form backend | Registration & feedback | 🔄 Planned |
| Google Analytics | User tracking | Event-based analytics | ✅ Active |
| YouTube | Video testimonials | Click-to-load embeds | ✅ Active |
| WhatsApp | Customer support | Direct messaging links | ✅ Active |
| Netlify | Hosting & deployment | Continuous deployment | ✅ Active |

## Integration Summary

### Required for Development
- **Node.js & npm** - Package management and build tools
- **Eleventy** - Static site generator
- **Tailwind CSS** - Utility-first CSS framework
- **Vite** - JavaScript bundling and development server
- **PostCSS** - CSS processing

### External Services
- **Stripe** - Payment processing (Payment Links)
- **MailerLite** - Email marketing automation
- **Formspree** - Form backend service and API
- **YouTube** - Video hosting (no API key required)
- **WhatsApp** - Messaging service (no API key required)
- **Google Analytics** - Web analytics (tracking ID required)
- **Netlify** - Hosting and continuous deployment

### No Authentication Required
Most integrations use public endpoints or simple URL schemes:
- YouTube uses public embed URLs with `youtube-nocookie.com`
- WhatsApp uses public `wa.me` URL scheme  
- Stripe uses pre-configured Payment Links

## Environment Configuration

### Required Environment Variables
```bash
# Google Analytics (optional)
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Build Environment
NODE_ENV=production

# MailerLite (when implemented)
MAILERLITE_API_KEY=your_api_key

# Formspree (when implemented)
FORMSPREE_API_KEY=your_api_key
```

### Optional Configuration
```bash
# Stripe Environment (for different environments)
STRIPE_ENVIRONMENT=production

# Analytics Debug Mode
GA_DEBUG_MODE=false

# Netlify Build Context
CONTEXT=production
```

## Security Considerations

### Data Privacy
- YouTube uses `youtube-nocookie.com` domain for GDPR compliance
- Google Analytics configured with IP anonymization
- No sensitive payment data stored locally
- WhatsApp links use public messaging interface
- Stripe handles all payment data processing

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com https://js.stripe.com;
  img-src 'self' https://img.youtube.com https://i.ytimg.com;
  frame-src 'self' https://www.youtube-nocookie.com https://checkout.stripe.com;
  connect-src 'self' https://www.google-analytics.com https://api.stripe.com;
  style-src 'self' 'unsafe-inline';
">
```

## Performance Impact

### Build Time Dependencies
- Eleventy: Core build process (~2-5s)
- Tailwind CSS: CSS generation (~1-2s)
- Vite: JavaScript bundling (~1-3s)
- PostCSS: CSS processing (~1s)

### Runtime Dependencies
- Google Analytics: ~28KB (async loaded)
- YouTube embeds: Loaded on demand (click-to-load)
- Stripe checkout: External redirect
- No JavaScript frameworks or heavy libraries

### Optimization Features
- Lazy loading for images and videos
- Click-to-load for YouTube videos
- Tailwind CSS purging for minimal CSS bundle
- Static site generation for fast loading
- Vite bundling with tree-shaking and minification

## Monitoring & Analytics

### Key Metrics Tracked
- Page views and user sessions
- Conversion funnel analysis
- Payment button clicks and completions
- Video engagement rates
- WhatsApp contact attempts
- Page performance metrics (Core Web Vitals)
- Email sign-up rates (future)
- Form abandonment rates (future)

### Error Tracking
- Failed video loads
- Analytics tracking failures
- Payment flow issues
- Console errors and warnings
- Form submission errors (future)
- Email delivery issues (future)

## Maintenance

### Regular Updates Required
- Node.js dependencies (monthly)
- Tailwind CSS version updates
- Vite and build tool updates
- Security patches for all dependencies

### Service Monitoring
- Stripe Payment Link validity
- Google Analytics data flow
- YouTube video availability
- WhatsApp contact number status
- Netlify deployment status
- MailerLite API connectivity (future)
- Formspree form functionality (future)

## Development Workflow

### Build Process
```bash
npm run dev          # Development with watch (tokens + CSS + JS + Eleventy)
npm run start        # Alternative development server 
npm run build        # Production build (tokens + CSS + JS + Eleventy)
npm run tokens:build # Generate CSS from JSON tokens
npm run build:css    # Build Tailwind CSS with PostCSS
npm run build:js     # Build JavaScript with Vite (production)
npm run build:js:dev # Build JavaScript with Vite (development + source maps)
npm run clean        # Clean build directory
```

### Integration Testing
- Stripe checkout flow end-to-end
- Google Analytics event firing
- YouTube video playback
- WhatsApp link functionality
- Responsive design across devices
- Email automation workflows (future)
- Form submission and validation (future)

## Troubleshooting

### Common Issues
1. **Build failures** - Check Node.js version and dependencies
2. **CSS not updating** - Run `npm run tokens:build`
3. **Analytics not tracking** - Verify GA measurement ID
4. **Videos not loading** - Check YouTube video privacy settings
5. **Stripe issues** - Verify Payment Link validity
6. **JavaScript errors** - Check browser console and Vite build output

### Debug Tools
- Browser developer console
- Google Analytics Debug View
- Eleventy debug mode: `DEBUG=Eleventy* npm run build`
- Vite debug mode: `DEBUG=vite:* npm run build:js`
- Network tab for API calls

## Getting Help

### Documentation Resources
- Each service has detailed documentation in its respective file
- Code examples and implementation patterns included
- Troubleshooting sections for common issues
- Links to official documentation and resources

### Support Channels
- Check individual service documentation
- Review project CLAUDE.md for configuration details
- Use browser developer tools for debugging
- Monitor analytics for user experience issues

## Future Enhancements

### Planned Integrations
- **MailerLite** - Email marketing automation for post-purchase sequences
- **Formspree** - Enhanced form backend with API access
- **Enhanced Stripe** - Embedded checkout for better UX
- **WhatsApp Business API** - Automated customer support

### Potential Improvements
- Performance monitoring with Core Web Vitals
- Advanced Google Analytics 4 features
- YouTube API for playlist management
- CDN integration for global distribution
- Database integration for user management

### Scalability Considerations
- Advanced caching strategies
- Serverless functions for dynamic content
- Multi-language support
- A/B testing platform integration
- Customer relationship management (CRM) integration

---

*This documentation is maintained as part of the Café com Vendas project. Each integration includes comprehensive setup, configuration, and troubleshooting information.*
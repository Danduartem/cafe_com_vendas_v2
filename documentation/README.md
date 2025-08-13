# Third-Party APIs Documentation

This directory contains documentation for all third-party APIs and integrations used in the Café com Vendas project.

## Overview

This project integrates with several third-party services and APIs to provide functionality for the landing page, including static site generation, styling, payment processing, analytics, and customer communication.

## API Documentation Files

### Core Framework & Styling
- **[11ty-eleventy.md](./11ty-eleventy.md)** - Eleventy static site generator documentation
- **[tailwind-css.md](./tailwind-css.md)** - Tailwind CSS utility framework documentation

### Payment & Analytics
- **[stripe-integration.md](./stripe-integration.md)** - Stripe payment processing integration
- **[google-analytics.md](./google-analytics.md)** - Google Analytics tracking implementation

### Media & Communication
- **[youtube-api.md](./youtube-api.md)** - YouTube video embedding for testimonials
- **[whatsapp-integration.md](./whatsapp-integration.md)** - WhatsApp contact integration

## Quick Reference

| Service | Purpose | Implementation | Status |
|---------|---------|---------------|---------|
| Eleventy | Static site generation | Build process, templates | ✅ Active |
| Tailwind CSS | CSS utilities | Styling framework | ✅ Active |
| Stripe | Payment processing | Redirect to checkout | ✅ Active |
| Google Analytics | User tracking | Event-based analytics | ✅ Active |
| YouTube | Video testimonials | Click-to-load embeds | ✅ Active |
| WhatsApp | Customer support | Direct messaging links | ✅ Active |

## Integration Summary

### Required for Development
- **Node.js & npm** - Package management and build tools
- **Eleventy** - Static site generator
- **Tailwind CSS** - Utility-first CSS framework
- **PostCSS** - CSS processing

### External Services
- **Stripe** - Payment processing (no API key required for Payment Links)
- **YouTube** - Video hosting (no API key required)
- **WhatsApp** - Messaging service (no API key required)
- **Google Analytics** - Web analytics (tracking ID required)

### No Authentication Required
Most integrations use public endpoints or simple URL schemes:
- YouTube uses public embed URLs
- WhatsApp uses public `wa.me` URL scheme  
- Stripe uses pre-configured Payment Links

## Environment Configuration

### Required Environment Variables
```bash
# Google Analytics (optional)
GA_MEASUREMENT_ID=G-XXXXXXXXXX

# Build Environment
NODE_ENV=production
```

### Optional Configuration
```bash
# Stripe Environment (for different environments)
STRIPE_ENVIRONMENT=production

# Analytics Debug Mode
GA_DEBUG_MODE=false
```

## Security Considerations

### Data Privacy
- YouTube uses `youtube-nocookie.com` domain for privacy compliance
- Google Analytics configured with IP anonymization
- No sensitive payment data stored locally
- WhatsApp links use public messaging interface

### Content Security Policy
```html
<meta http-equiv="Content-Security-Policy" content="
  default-src 'self';
  script-src 'self' 'unsafe-inline' https://www.googletagmanager.com;
  img-src 'self' https://img.youtube.com;
  frame-src 'self' https://www.youtube-nocookie.com https://checkout.stripe.com;
  connect-src 'self' https://www.google-analytics.com;
">
```

## Performance Impact

### Build Time Dependencies
- Eleventy: Core build process
- Tailwind CSS: CSS generation
- PostCSS: CSS processing

### Runtime Dependencies
- Google Analytics: ~28KB (async loaded)
- YouTube embeds: Loaded on demand
- No JavaScript frameworks or heavy libraries

### Optimization Features
- Lazy loading for images and videos
- Click-to-load for YouTube videos
- Tailwind CSS purging for minimal CSS
- Static site generation for fast loading

## Monitoring & Analytics

### Key Metrics Tracked
- Page views and user sessions
- Conversion funnel analysis
- Payment button clicks
- Video engagement rates
- WhatsApp contact attempts
- Page performance metrics

### Error Tracking
- Failed video loads
- Analytics tracking failures
- Payment flow issues
- Console errors and warnings

## Maintenance

### Regular Updates Required
- Node.js dependencies (monthly)
- Tailwind CSS version updates
- Security patches for build tools

### Service Monitoring
- Stripe Payment Link validity
- Google Analytics data flow
- YouTube video availability
- WhatsApp contact number status

## Testing

### Development Testing
```bash
npm run dev          # Start development server
npm run build        # Test production build
npm run tokens:build # Test design token generation
```

### Integration Testing
- Stripe checkout flow end-to-end
- Google Analytics event firing
- YouTube video playback
- WhatsApp link functionality
- Responsive design across devices

## Troubleshooting

### Common Issues
1. **Build failures** - Check Node.js version and dependencies
2. **CSS not updating** - Run `npm run tokens:build`
3. **Analytics not tracking** - Verify GA measurement ID
4. **Videos not loading** - Check YouTube video privacy settings
5. **Stripe issues** - Verify Payment Link validity

### Debug Tools
- Browser developer console
- Google Analytics Debug View
- Eleventy debug mode
- Network tab for API calls

## Getting Help

### Documentation Resources
- Each API has detailed documentation in its respective file
- Code examples and implementation patterns included
- Troubleshooting sections for common issues

### Support Channels
- Check individual service documentation
- Review project CLAUDE.md for configuration details
- Use browser developer tools for debugging
- Monitor analytics for user experience issues

## Future Enhancements

### Potential Improvements
- Enhanced Stripe Embedded Checkout integration
- WhatsApp Business API webhooks
- Advanced Google Analytics 4 features
- YouTube API for playlist management
- Performance monitoring with Core Web Vitals

### Scalability Considerations
- CDN integration for global distribution
- Advanced caching strategies
- Database integration for user management
- Email marketing platform integration
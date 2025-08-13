# WhatsApp Integration Documentation

This document covers how WhatsApp is integrated into this project for customer communication and support.

## Overview

WhatsApp integration is implemented through direct links to WhatsApp Web/App using the `wa.me` URL scheme. This allows users to easily contact support and ask questions about the Café com Vendas event.

## Current Implementation

### WhatsApp Contact Button

A floating WhatsApp button is implemented to provide easy access to customer support:

```njk
<!-- WhatsApp Contact Button in whatsapp-button.njk -->
<div id="whatsapp-button" class="fixed bottom-5 right-5 z-50">
  <a href="https://wa.me/{{event.payments.alternative.mbway.phone | replace('+', '')}}?text=Olá!%20Tenho%20interesse%20no%20Café%20com%20Vendas%20e%20gostaria%20de%20tirar%20algumas%20dúvidas."
     target="_blank"
     rel="noopener noreferrer"
     class="whatsapp-btn"
     data-analytics-event="whatsapp_button_click"
     aria-label="Contatar pelo WhatsApp - abre em nova janela">
    
    <!-- WhatsApp SVG Icon -->
    <svg class="w-8 h-8 text-white" fill="currentColor" viewBox="0 0 24 24">
      <!-- WhatsApp icon path -->
    </svg>
  </a>
</div>
```

### Contact Information

WhatsApp contact details are stored in the event metadata:

```json
// info/EVENT_META.json
{
  "payments": {
    "alternative": {
      "mbway": {
        "phone": "+351935251983",
        "contact": "Mónica",
        "instruction": "Avisar a Mónica que o pagamento foi realizado para garantir a vaga"
      }
    }
  }
}
```

## WhatsApp URL Scheme

### Basic URL Format
```
https://wa.me/{phone_number}?text={pre_filled_message}
```

### URL Components

1. **Base URL**: `https://wa.me/`
2. **Phone Number**: International format without `+` (e.g., `351935251983`)
3. **Pre-filled Message**: URL-encoded text parameter

### Message Templates

#### Default Inquiry Message
```
Olá! Tenho interesse no Café com Vendas e gostaria de tirar algumas dúvidas.
```

URL-encoded:
```
Ol%C3%A1!%20Tenho%20interesse%20no%20Caf%C3%A9%20com%20Vendas%20e%20gostaria%20de%20tirar%20algumas%20d%C3%BAvidas.
```

#### Payment Confirmation Message
```javascript
// For MBWay payments
const confirmationMessage = encodeURIComponent(
  `Olá! Acabei de fazer o pagamento via MBWay para o Café com Vendas. ` +
  `Valor: €${event.pricing.tiers[0].price}. ` +
  `Por favor confirme a minha vaga.`
);
```

## JavaScript Implementation

### WhatsApp Button Animation
```javascript
// In main.js - WhatsApp Button Animation
function initializeAnimations() {
    const whatsappButton = document.querySelector('#whatsapp-button');
    if (whatsappButton) {
        setTimeout(() => {
            whatsappButton.classList.remove('opacity-0', 'translate-y-4');
            whatsappButton.classList.add('opacity-100', 'translate-y-0');
        }, 500);
    }
}
```

### Click Tracking
```javascript
// Track WhatsApp button clicks for analytics
document.querySelector('.whatsapp-btn').addEventListener('click', function() {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_contact', {
            'event_category': 'Contact',
            'event_label': 'WhatsApp Button Click',
            'value': 1
        });
    }
});
```

## User Experience Features

### Visual Design
- **Floating Button**: Fixed position in bottom-right corner
- **WhatsApp Green**: Uses official WhatsApp brand colors
- **Pulse Animation**: Subtle animation to draw attention
- **Hover Effects**: Scale and shadow changes on hover
- **Tooltip**: Desktop tooltip with call-to-action text

### Responsive Behavior
```css
/* Mobile optimization */
@media (max-width: 768px) {
    #whatsapp-button {
        bottom: 1rem;
        right: 1rem;
        width: 56px;
        height: 56px;
    }
}

/* Desktop with tooltip */
@media (min-width: 1024px) {
    .whatsapp-tooltip {
        display: block;
        opacity: 0;
        transition: all 300ms ease;
    }
    
    #whatsapp-button:hover .whatsapp-tooltip {
        opacity: 1;
        transform: translateY(-2px);
    }
}
```

## Multiple Use Cases

### 1. General Inquiries
```html
<a href="https://wa.me/351935251983?text=Tenho%20uma%20pergunta%20sobre%20o%20evento">
  Contact Support
</a>
```

### 2. Payment Confirmation
```html
<a href="https://wa.me/351935251983?text=Pagamento%20MBWay%20realizado%20-%20confirmar%20vaga">
  Confirm Payment
</a>
```

### 3. Technical Support
```html
<a href="https://wa.me/351935251983?text=Preciso%20de%20ajuda%20técnica%20com%20o%20site">
  Technical Help
</a>
```

## Analytics and Tracking

### Event Tracking
```javascript
// Track different WhatsApp interactions
function trackWhatsAppClick(context) {
    if (typeof gtag !== 'undefined') {
        gtag('event', 'whatsapp_click', {
            'event_category': 'Communication',
            'event_label': context,
            'value': 1
        });
    }
}

// Usage examples
trackWhatsAppClick('floating_button');
trackWhatsAppClick('mbway_confirmation');
trackWhatsAppClick('footer_contact');
```

### Conversion Tracking
```javascript
// Track WhatsApp as a conversion funnel step
gtag('event', 'begin_contact', {
    'event_category': 'Conversion',
    'event_label': 'WhatsApp Contact Initiated'
});
```

## Accessibility Features

### Screen Reader Support
```html
<a href="..." 
   aria-label="Contatar pelo WhatsApp - abre em nova janela"
   title="Tire suas dúvidas pelo WhatsApp">
```

### Keyboard Navigation
```javascript
// Ensure button is keyboard accessible
document.querySelector('.whatsapp-btn').addEventListener('keydown', function(e) {
    if (e.key === 'Enter' || e.key === ' ') {
        e.preventDefault();
        this.click();
    }
});
```

### High Contrast Mode
```css
@media (prefers-contrast: high) {
    .whatsapp-btn {
        border: 2px solid white;
        filter: contrast(1.2);
    }
}
```

## Security Considerations

### Link Validation
```javascript
// Validate WhatsApp links before using
function isValidWhatsAppLink(phone) {
    const phoneRegex = /^\d{10,15}$/;
    return phoneRegex.test(phone.replace(/[\s\-\(\)]/g, ''));
}

// Usage
const phone = event.payments.alternative.mbway.phone.replace('+', '');
if (isValidWhatsAppLink(phone)) {
    // Safe to use
}
```

### Message Sanitization
```javascript
// Sanitize user input for pre-filled messages
function sanitizeMessage(message) {
    return encodeURIComponent(message.trim().substring(0, 1000));
}
```

### External Link Security
```html
<!-- Always use rel="noopener noreferrer" for external links -->
<a href="https://wa.me/..." 
   target="_blank" 
   rel="noopener noreferrer">
```

## International Considerations

### Phone Number Formatting
```javascript
// Format phone numbers for different regions
function formatWhatsAppPhone(phone, countryCode = '+351') {
    // Remove all non-digits
    const cleaned = phone.replace(/\D/g, '');
    
    // Add country code if not present
    if (!cleaned.startsWith(countryCode.replace('+', ''))) {
        return countryCode.replace('+', '') + cleaned;
    }
    
    return cleaned;
}
```

### Localized Messages
```javascript
// Message templates for different languages
const messages = {
    pt: "Olá! Tenho interesse no Café com Vendas e gostaria de tirar algumas dúvidas.",
    en: "Hello! I'm interested in Café com Vendas and would like to ask some questions.",
    es: "¡Hola! Estoy interesado en Café com Vendas y me gustaría hacer algunas preguntas."
};
```

## Testing and Quality Assurance

### Testing Checklist
- [ ] WhatsApp link opens correctly on mobile devices
- [ ] WhatsApp link opens in WhatsApp Web on desktop
- [ ] Pre-filled message appears correctly
- [ ] Phone number is properly formatted
- [ ] Button is accessible via keyboard navigation
- [ ] Analytics tracking fires correctly
- [ ] Button displays properly on all screen sizes

### Device Testing
- **Mobile**: Test on iOS and Android native WhatsApp apps
- **Desktop**: Test WhatsApp Web functionality
- **Tablets**: Ensure responsive design works properly

### Message Testing
```javascript
// Test message URL encoding
const testMessage = "Test message with special characters: áéíóú!@#$%";
const encoded = encodeURIComponent(testMessage);
console.log(`Encoded: ${encoded}`);

// Verify decoded message appears correctly in WhatsApp
```

## Performance Optimization

### Lazy Loading
```javascript
// Only initialize WhatsApp functionality when needed
function initWhatsAppButton() {
    const button = document.querySelector('#whatsapp-button');
    if (!button) return;
    
    // Add event listeners and animations only when button exists
    button.addEventListener('click', trackWhatsAppClick);
    
    // Initialize visibility animation
    setTimeout(() => {
        button.classList.add('animate-fade-in');
    }, 1000);
}

// Initialize on DOM ready
document.addEventListener('DOMContentLoaded', initWhatsAppButton);
```

### Icon Optimization
```html
<!-- Use inline SVG to avoid additional HTTP requests -->
<svg class="whatsapp-icon" viewBox="0 0 24 24" fill="currentColor">
  <!-- Optimized WhatsApp icon path -->
</svg>
```

## Advanced Features

### Business Account Features
If using WhatsApp Business:

1. **Quick Replies**: Pre-configured response templates
2. **Away Messages**: Automatic responses when offline  
3. **Business Profile**: Company information display
4. **Catalog Integration**: Product/service showcase

### Webhook Integration (Future Enhancement)
```javascript
// WhatsApp Business API webhook endpoint
app.post('/whatsapp/webhook', (req, res) => {
    const { body } = req;
    
    // Process incoming messages
    if (body.messages) {
        body.messages.forEach(message => {
            // Handle different message types
            if (message.type === 'text') {
                handleTextMessage(message);
            }
        });
    }
    
    res.sendStatus(200);
});
```

## Troubleshooting

### Common Issues

1. **WhatsApp doesn't open**
   - Verify phone number format (no `+` in URL)
   - Check if WhatsApp is installed on device
   - Ensure link uses `https://wa.me/` format

2. **Message not pre-filled**
   - Verify URL encoding of message text
   - Check for special characters that need encoding
   - Ensure message length is under WhatsApp limits

3. **Button not visible**
   - Check CSS z-index conflicts
   - Verify animation classes are applied
   - Check if button is outside viewport

### Debug Tools
```javascript
// Debug WhatsApp link generation
function debugWhatsAppLink(phone, message) {
    const cleanPhone = phone.replace(/\D/g, '');
    const encodedMessage = encodeURIComponent(message);
    const link = `https://wa.me/${cleanPhone}?text=${encodedMessage}`;
    
    console.log('WhatsApp Debug Info:');
    console.log('Original phone:', phone);
    console.log('Clean phone:', cleanPhone);
    console.log('Original message:', message);
    console.log('Encoded message:', encodedMessage);
    console.log('Final link:', link);
    
    return link;
}
```

## Best Practices

1. **Keep messages concise** - WhatsApp has character limits
2. **Use proper phone number formatting** - International format without `+`
3. **Test on multiple devices** - Different WhatsApp versions behave differently
4. **Provide fallback contact methods** - Email or phone for users without WhatsApp
5. **Monitor analytics** - Track engagement and conversion rates
6. **Respect user privacy** - Don't include sensitive information in pre-filled messages
7. **Update contact info regularly** - Ensure phone numbers remain active
8. **Use clear call-to-actions** - Make it obvious the button opens WhatsApp
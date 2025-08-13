# MailerLite Email Marketing Integration Documentation

## Overview
MailerLite is a comprehensive email marketing platform that provides APIs for managing subscribers, campaigns, automations, and e-commerce integrations. This guide covers integration for the Café com Vendas event landing page.

## Key Features
- **Email Automation**: Create triggered email sequences
- **Subscriber Management**: Organize contacts into groups and segments
- **Campaign Management**: Send newsletters and promotional emails
- **E-commerce Integration**: Track purchases and automate post-purchase flows
- **Analytics**: Track opens, clicks, conversions, and engagement

## API Authentication
```javascript
// API Key Authentication (Bearer token)
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json',
  'Accept': 'application/json'
};

// Base URL
const BASE_URL = 'https://connect.mailerlite.com/api';
```

## Core API Operations

### 1. Subscriber Management
```javascript
// Create/Update Subscriber
const createSubscriber = async (email, fields = {}) => {
  const response = await fetch(`${BASE_URL}/subscribers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: email,
      fields: {
        name: fields.name,
        city: fields.city,
        company: fields.company,
        phone: fields.phone,
        ...fields
      },
      status: 'active' // active, unsubscribed, unconfirmed
    })
  });
  return response.json();
};

// Add Subscriber to Group
const addToGroup = async (subscriberEmail, groupId) => {
  const response = await fetch(`${BASE_URL}/groups/${groupId}/subscribers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: subscriberEmail
    })
  });
  return response.json();
};
```

### 2. Group Management
```javascript
// Create Group for Event Attendees
const createEventGroup = async () => {
  const response = await fetch(`${BASE_URL}/groups`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Café com Vendas - September 2024',
      type: 'default' // default, unsubscribed, bounced
    })
  });
  return response.json();
};

// Bulk Import Subscribers to Group
const importSubscribers = async (groupId, subscribers) => {
  const response = await fetch(`${BASE_URL}/groups/${groupId}/import-subscribers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      subscribers: subscribers.map(sub => ({
        email: sub.email,
        fields: {
          name: sub.name,
          ticket_number: sub.ticketNumber,
          purchase_date: sub.purchaseDate
        }
      }))
    })
  });
  return response.json();
};
```

### 3. Email Automations
```javascript
// Create Welcome Automation
const createWelcomeAutomation = async () => {
  const response = await fetch(`${BASE_URL}/automations`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Café com Vendas - Welcome Series'
    })
  });
  return response.json();
};

// Get Automation Statistics
const getAutomationStats = async (automationId) => {
  const response = await fetch(`${BASE_URL}/automations/${automationId}`, {
    method: 'GET',
    headers
  });
  const data = await response.json();
  
  return {
    completedSubscribers: data.data.stats.completed_subscribers_count,
    subscribersInQueue: data.data.stats.subscribers_in_queue_count,
    openRate: data.data.stats.open_rate.string,
    clickRate: data.data.stats.click_rate.string
  };
};
```

### 4. Campaign Management
```javascript
// Create and Send Campaign
const createCampaign = async (subject, content, groupIds = []) => {
  const response = await fetch(`${BASE_URL}/campaigns`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: `Café com Vendas - ${subject}`,
      type: 'regular', // regular, ab, resend, rss
      emails: [{
        subject: subject,
        from: 'hello@cafecomvendas.com',
        from_name: 'Café com Vendas',
        content: content
      }],
      groups: groupIds
    })
  });
  return response.json();
};

// Get Campaign Statistics
const getCampaignStats = async (campaignId) => {
  const response = await fetch(`${BASE_URL}/campaigns/${campaignId}`, {
    method: 'GET',
    headers
  });
  return response.json();
};
```

## E-commerce Integration

### Shop Setup
```javascript
// Create E-commerce Shop
const createShop = async () => {
  const response = await fetch(`${BASE_URL}/ecommerce/shops`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      name: 'Café com Vendas Events',
      url: 'https://cafecomvendas.com',
      currency: 'EUR'
    })
  });
  return response.json();
};
```

### Customer and Order Management
```javascript
// Create Customer after Payment
const createCustomer = async (shopId, customerData) => {
  const response = await fetch(`${BASE_URL}/ecommerce/shops/${shopId}/customers`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      email: customerData.email,
      accepts_marketing: true,
      total_spent: customerData.totalSpent,
      create_subscriber: true
    })
  });
  return response.json();
};

// Create Order
const createOrder = async (shopId, orderData) => {
  const response = await fetch(`${BASE_URL}/ecommerce/shops/${shopId}/orders`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      resource_id: orderData.id,
      customer: {
        email: orderData.customerEmail
      },
      total: orderData.total,
      status: 'complete', // This triggers automations
      cart: {
        checkout_url: orderData.checkoutUrl,
        cart_total: orderData.total,
        items: [{
          resource_id: `ticket_${orderData.id}`,
          product: {
            name: 'Café com Vendas - September 20, 2024',
            price: orderData.total
          },
          quantity: 1,
          price: orderData.total
        }]
      }
    })
  });
  return response.json();
};
```

## Implementation for Café com Vendas

### 1. Post-Purchase Integration
```javascript
// After successful Stripe payment
const handleSuccessfulPayment = async (paymentData) => {
  try {
    // 1. Create or update subscriber
    const subscriber = await createSubscriber(paymentData.email, {
      name: paymentData.name,
      ticket_number: paymentData.ticketNumber,
      purchase_date: new Date().toISOString(),
      event_date: '2024-09-20'
    });

    // 2. Add to event group
    const eventGroupId = 'YOUR_EVENT_GROUP_ID';
    await addToGroup(paymentData.email, eventGroupId);

    // 3. Create e-commerce order (triggers automations)
    const shopId = 'YOUR_SHOP_ID';
    await createOrder(shopId, {
      id: paymentData.paymentIntentId,
      customerEmail: paymentData.email,
      total: paymentData.amount / 100, // Convert from cents
      checkoutUrl: paymentData.returnUrl
    });

    console.log('Successfully added customer to MailerLite');
  } catch (error) {
    console.error('MailerLite integration error:', error);
  }
};
```

### 2. Automated Email Sequences

#### Welcome Series Automation
- **Trigger**: Customer joins "Café com Vendas - September 2024" group
- **Sequence**:
  1. **Immediate**: Welcome email with event details and calendar invite
  2. **1 week before**: Reminder with location details and what to bring
  3. **1 day before**: Final reminder with parking info and agenda
  4. **1 day after**: Thank you email with resources and next event announcement

#### Abandoned Cart Recovery
- **Trigger**: Cart created but order not completed within 1 hour
- **Sequence**:
  1. **1 hour delay**: "Complete your registration for Café com Vendas"
  2. **24 hours**: "Limited spots remaining" (if applicable)
  3. **72 hours**: "Last chance" with urgency messaging

### 3. Campaign Templates

#### Pre-Event Reminder
```javascript
const preEventCampaign = {
  subject: 'Lembrete: Café com Vendas amanhã em Lisboa! 🚀',
  content: `
    <h1>Estamos quase lá! ☕</h1>
    <p>Olá {$name},</p>
    <p>Amanhã, dia 20 de setembro, encontramo-nos no <strong>local do evento</strong> às 9h00.</p>
    
    <h2>O que trazer:</h2>
    <ul>
      <li>Caderno para anotações</li>
      <li>Mentalidade aberta para aprender</li>
      <li>Energia para networking!</li>
    </ul>

    <p>Mal posso esperar para te conhecer pessoalmente!</p>
    <p>Com carinho,<br>Equipa Café com Vendas</p>
  `
};
```

## Webhook Integration

### Setup Webhook Endpoint
```javascript
// Express.js webhook handler
app.post('/mailerlite-webhook', (req, res) => {
  const event = req.body;
  
  switch (event.type) {
    case 'subscriber.create':
      console.log('New subscriber:', event.data.email);
      break;
      
    case 'subscriber.unsubscribe':
      console.log('Subscriber unsubscribed:', event.data.email);
      // Handle unsubscribe logic
      break;
      
    case 'campaign.sent':
      console.log('Campaign sent:', event.data.name);
      break;
  }
  
  res.status(200).json({ received: true });
});
```

## Analytics and Reporting

### Key Metrics to Track
```javascript
// Get comprehensive analytics
const getEventMetrics = async () => {
  const groupId = 'YOUR_EVENT_GROUP_ID';
  const automationId = 'YOUR_WELCOME_AUTOMATION_ID';
  
  const [groupStats, automationStats] = await Promise.all([
    fetch(`${BASE_URL}/groups/${groupId}`, { headers }),
    fetch(`${BASE_URL}/automations/${automationId}`, { headers })
  ]);
  
  return {
    totalRegistrations: (await groupStats.json()).data.total,
    welcomeEmailOpenRate: (await automationStats.json()).data.stats.open_rate.string,
    clickThroughRate: (await automationStats.json()).data.stats.click_rate.string
  };
};
```

## Best Practices

### 1. Data Synchronization
- Always use resource IDs for e-commerce objects
- Implement retry logic for API calls
- Handle rate limits (60 requests per minute)

### 2. Email Compliance
- Always obtain explicit consent before subscribing users
- Include clear unsubscribe links
- Respect Portuguese data protection laws (RGPD)

### 3. Personalization
- Use custom fields for event-specific data
- Segment subscribers based on engagement
- A/B test subject lines and send times

## Error Handling
```javascript
const handleMailerLiteError = (error, operation) => {
  console.error(`MailerLite ${operation} error:`, {
    status: error.status,
    message: error.message,
    details: error.errors
  });
  
  // Implement appropriate fallback behavior
  if (error.status === 429) {
    // Rate limit - retry after delay
    setTimeout(() => operation(), 60000);
  } else if (error.status >= 500) {
    // Server error - retry with exponential backoff
    // Implementation here
  }
};
```

## Resources
- [MailerLite API Documentation](https://developers.mailerlite.com/docs/)
- [E-commerce Integration Guide](https://developers.mailerlite.com/guides/ecommerce)
- [Automation Best Practices](https://developers.mailerlite.com/guides/automations)
- [MCP Server (Beta)](https://developers.mailerlite.com/mcp/)
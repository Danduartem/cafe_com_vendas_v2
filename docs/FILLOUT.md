# Fillout Forms Integration Documentation

## Overview
Fillout is a comprehensive form builder platform that provides APIs, webhooks, and advanced integrations for creating dynamic forms, collecting data, and automating workflows. This guide covers integration for the Café com Vendas event registration.

## Key Features
- **Advanced Form Building**: Multi-step forms, conditional logic, and dynamic calculations
- **Payment Integration**: Built-in Stripe payment processing
- **Scheduling**: Calendar integration with Google Calendar, Zoom, and Meet
- **Webhooks**: Real-time form submission notifications
- **Workflow Automation**: Email notifications, Slack/Teams integration
- **E-commerce**: Product selection, pricing calculations, and order management

## API Authentication
```javascript
// API Key Authentication
const headers = {
  'Authorization': 'Bearer YOUR_API_KEY',
  'Content-Type': 'application/json'
};

// Base URL
const BASE_URL = 'https://api.fillout.com/v1/api';
```

## Core API Operations

### 1. Form Management
```javascript
// Get All Forms
const getAllForms = async () => {
  const response = await fetch(`${BASE_URL}/forms`, {
    method: 'GET',
    headers
  });
  return response.json();
};

// Get Form Details
const getFormDetails = async (formId) => {
  const response = await fetch(`${BASE_URL}/forms/${formId}`, {
    method: 'GET',
    headers
  });
  return response.json();
};

// Example Response Structure
/*
{
  "id": "vso9PzRfHQus",
  "name": "Café com Vendas Registration",
  "questions": [
    {
      "id": "5AtgG35AAZVcrSVfRubvp1",
      "name": "What's your email?",
      "type": "Email"
    },
    {
      "id": "gRBWVbE2fut2oiAMprdZpY", 
      "name": "What is your name?",
      "type": "ShortAnswer"
    }
  ],
  "payments": [
    {
      "id": "Dc4bHA1CgvyD2LKhBnnCLh",
      "name": "Event Payment"
    }
  ]
}
*/
```

### 2. Submission Management
```javascript
// Get All Submissions for a Form
const getSubmissions = async (formId, options = {}) => {
  const queryParams = new URLSearchParams({
    limit: options.limit || 50,
    status: options.status || 'finished',
    sort: options.sort || 'asc',
    ...(options.afterDate && { afterDate: options.afterDate }),
    ...(options.beforeDate && { beforeDate: options.beforeDate }),
    ...(options.search && { search: options.search })
  });

  const response = await fetch(`${BASE_URL}/forms/${formId}/submissions?${queryParams}`, {
    method: 'GET',
    headers
  });
  return response.json();
};

// Get Single Submission
const getSubmission = async (formId, submissionId, includeEditLink = false) => {
  const queryParams = includeEditLink ? '?includeEditLink=true' : '';
  
  const response = await fetch(`${BASE_URL}/forms/${formId}/submissions/${submissionId}${queryParams}`, {
    method: 'GET',
    headers
  });
  return response.json();
};

// Create New Submission
const createSubmission = async (formId, submissionData) => {
  const response = await fetch(`${BASE_URL}/forms/${formId}/submissions`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      submissions: [submissionData]
    })
  });
  return response.json();
};
```

### 3. Webhook Integration
```javascript
// Create Webhook
const createWebhook = async (formId, webhookUrl) => {
  const response = await fetch(`${BASE_URL}/webhook/create`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      formId: formId,
      url: webhookUrl
    })
  });
  return response.json();
};

// Delete Webhook
const deleteWebhook = async (webhookId) => {
  const response = await fetch(`${BASE_URL}/webhook/delete`, {
    method: 'POST',
    headers,
    body: JSON.stringify({
      webhookId: webhookId
    })
  });
  return response.json();
};

// Webhook Handler Example (Express.js)
app.post('/fillout-webhook', (req, res) => {
  const submission = req.body;
  
  console.log('New form submission:', {
    submissionId: submission.submissionId,
    submissionTime: submission.submissionTime,
    questions: submission.questions,
    payments: submission.payments
  });
  
  // Process submission data
  handleNewRegistration(submission);
  
  res.status(200).json({ received: true });
});
```

## Form Configuration for Café com Vendas

### 1. Registration Form Structure
```javascript
// Form Fields Configuration
const eventRegistrationForm = {
  name: 'Café com Vendas - September 2024',
  questions: [
    {
      name: 'Nome Completo',
      type: 'ShortAnswer',
      required: true,
      validation: {
        regex: '^[a-zA-Z\\s]+$'
      }
    },
    {
      name: 'Email',
      type: 'Email', 
      required: true
    },
    {
      name: 'Telemóvel',
      type: 'ShortAnswer',
      required: true,
      validation: {
        regex: '^(\\+351\\s?)?[0-9]{9}$'
      }
    },
    {
      name: 'Empresa',
      type: 'ShortAnswer',
      required: false
    },
    {
      name: 'Como soube do evento?',
      type: 'MultipleChoice',
      options: [
        'Instagram',
        'LinkedIn',
        'Recomendação de amigo',
        'Pesquisa no Google',
        'Outro'
      ]
    }
  ],
  payments: [
    {
      name: 'Inscrição Café com Vendas',
      price: 297, // EUR
      currency: 'EUR',
      stripeIntegration: true
    }
  ]
};
```

### 2. Dynamic Pricing with Calculations
```javascript
// Early Bird vs Regular Pricing
const pricingCalculation = {
  name: 'Event Price',
  type: 'number',
  initialValue: 397, // Regular price
  rules: [
    {
      operation: 'Set to',
      operationValue: 297, // Early bird price
      condition: {
        field: 'registration_date',
        operator: 'before',
        value: '2024-08-20'
      }
    }
  ]
};

// Payment URL with Parameters
const paymentUrl = 'https://forms.fillout.com/t/YOUR_FORM_ID?source=landing&price=@calculation_price';
```

### 3. Conditional Logic Implementation
```javascript
// Show additional fields based on company size
const conditionalFields = {
  trigger: {
    field: 'company_size',
    operator: 'equals',
    value: 'Large (50+ employees)'
  },
  actions: [
    {
      type: 'show_field',
      fieldId: 'department_field'
    },
    {
      type: 'show_field', 
      fieldId: 'decision_maker_field'
    }
  ]
};
```

## Workflow Automation

### 1. Welcome Email Automation
```javascript
// Post-submission workflow
const welcomeWorkflow = {
  name: 'Café com Vendas Welcome Series',
  trigger: {
    type: 'form_submitted',
    formId: 'YOUR_FORM_ID'
  },
  actions: [
    {
      type: 'send_email',
      delay: 0, // Immediate
      template: {
        subject: 'Bem-vinda ao Café com Vendas! 🚀',
        body: `
          <h1>Obrigada pela tua inscrição!</h1>
          <p>Olá {{ name }},</p>
          <p>Estamos muito entusiasmadas por te receber no <strong>Café com Vendas</strong> no dia <strong>20 de setembro</strong> em Lisboa!</p>
          
          <h2>Detalhes do Evento:</h2>
          <ul>
            <li><strong>Data:</strong> 20 de setembro de 2024</li>
            <li><strong>Horário:</strong> 9h00 às 17h00</li>
            <li><strong>Local:</strong> Lisboa (detalhes em breve)</li>
          </ul>
          
          <p>Vais receber mais informações nos próximos dias.</p>
          <p>Com carinho,<br>Equipa Café com Vendas</p>
        `,
        attachments: [
          {
            name: 'Calendar Invite',
            type: 'ics',
            content: 'calendar_event_data'
          }
        ]
      }
    }
  ]
};
```

### 2. Abandonment Recovery
```javascript
// Form abandonment workflow  
const abandonmentWorkflow = {
  name: 'Registration Recovery',
  trigger: {
    type: 'form_abandoned',
    formId: 'YOUR_FORM_ID',
    delay: 30 // minutes
  },
  actions: [
    {
      type: 'send_email',
      template: {
        subject: 'Termina a tua inscrição no Café com Vendas',
        body: `
          <h1>Não percas o teu lugar! ⏰</h1>
          <p>Notámos que começaste a tua inscrição mas não a terminaste.</p>
          <p>Temos apenas <strong>8 vagas</strong> disponíveis e estão a esgotar rapidamente!</p>
          <p><a href="{{ edit_link }}">Completa a tua inscrição aqui</a></p>
        `
      }
    },
    {
      type: 'delay',
      duration: 1440 // 24 hours
    },
    {
      type: 'send_email',
      template: {
        subject: 'Última oportunidade - Café com Vendas',
        body: `
          <h1>Últimas vagas disponíveis! 🔥</h1>
          <p>Esta é a tua última oportunidade para garantires o teu lugar.</p>
          <p><a href="{{ edit_link }}">Inscreve-te agora</a></p>
        `
      }
    }
  ]
};
```

### 3. Slack Notifications
```javascript
// Team notification workflow
const slackNotification = {
  name: 'New Registration Alert',
  trigger: {
    type: 'form_submitted',
    formId: 'YOUR_FORM_ID'
  },
  actions: [
    {
      type: 'send_slack_message',
      channel: '#cafe-com-vendas',
      message: `
        🎉 Nova inscrição!
        
        *Nome:* {{ name }}
        *Email:* {{ email }}
        *Empresa:* {{ company }}
        *Fonte:* {{ how_did_you_hear }}
        
        Total de inscrições: {{ total_submissions }}
      `
    }
  ]
};
```

## Integration with Other Services

### 1. Post-Payment Processing
```javascript
// Handle successful payment submission
const handlePaymentSuccess = async (submission) => {
  try {
    // Extract payment and user data
    const userData = {
      name: submission.questions.find(q => q.name === 'Nome Completo').value,
      email: submission.questions.find(q => q.name === 'Email').value,
      phone: submission.questions.find(q => q.name === 'Telemóvel').value,
      company: submission.questions.find(q => q.name === 'Empresa')?.value,
      source: submission.questions.find(q => q.name === 'Como soube do evento?').value
    };

    const paymentData = submission.payments[0].value;
    
    // 1. Add to MailerLite
    await addToMailerLite(userData, {
      ticketNumber: generateTicketNumber(),
      paymentId: paymentData.paymentId,
      amount: paymentData.totalAmount
    });
    
    // 2. Update availability counter
    await updateAvailableSpots(-1);
    
    // 3. Send confirmation email with calendar invite
    await sendConfirmationEmail(userData);
    
    // 4. Add to CRM/Database
    await addToDatabase({
      ...userData,
      registrationDate: submission.submissionTime,
      paymentStatus: paymentData.status,
      ticketNumber: generateTicketNumber()
    });
    
    console.log('Registration processed successfully');
  } catch (error) {
    console.error('Error processing registration:', error);
  }
};
```

### 2. URL Parameters for Tracking
```javascript
// Generate tracking URLs for different sources
const generateTrackingURLs = () => {
  const baseUrl = 'https://forms.fillout.com/t/YOUR_FORM_ID';
  
  return {
    instagram: `${baseUrl}?source=instagram&utm_campaign=cafe_com_vendas`,
    linkedin: `${baseUrl}?source=linkedin&utm_campaign=cafe_com_vendas`,
    email: `${baseUrl}?source=email&utm_campaign=cafe_com_vendas`,
    organic: `${baseUrl}?source=organic&utm_campaign=cafe_com_vendas`
  };
};

// Pre-fill form based on URL parameters
const prefilledUrl = 'https://forms.fillout.com/t/YOUR_FORM_ID?email=user@example.com&name=User Name&source=referral';
```

### 3. Custom CSS Styling
```css
/* Custom styling for Café com Vendas brand */
.fillout-field-container {
  max-width: 600px;
  margin: 0 auto;
  font-family: 'Lora', serif;
}

.fillout-field-label p {
  color: #191F3A; /* Navy */
  font-weight: 600;
}

.fillout-field-button button {
  background: #81171F; /* Burgundy */
  border: none;
  border-radius: 8px;
  padding: 12px 24px;
  color: white;
  font-weight: 600;
}

.fillout-field-button button:hover {
  background: #6B1419;
}

/* Hide Fillout branding for premium look */
.fillout-theme-logo {
  display: none;
}

/* Style payment section */
.fillout-field-payment {
  border: 2px solid #81171F;
  border-radius: 12px;
  padding: 20px;
  background: #f9f9f9;
}
```

## Analytics and Reporting

### 1. Submission Analytics
```javascript
// Get comprehensive form analytics
const getFormAnalytics = async (formId, dateRange) => {
  const submissions = await getSubmissions(formId, {
    afterDate: dateRange.start,
    beforeDate: dateRange.end,
    limit: 150
  });
  
  const analytics = {
    totalSubmissions: submissions.totalResponses,
    completedRegistrations: submissions.responses.filter(r => 
      r.payments && r.payments[0].value.status === 'succeeded'
    ).length,
    averageCompletionTime: calculateAverageTime(submissions.responses),
    sourceBreakdown: analyzeTrafficSources(submissions.responses),
    conversionRate: calculateConversionRate(submissions)
  };
  
  return analytics;
};

// Source tracking analysis
const analyzeTrafficSources = (submissions) => {
  const sources = {};
  
  submissions.forEach(submission => {
    const sourceField = submission.questions.find(q => 
      q.name === 'Como soube do evento?'
    );
    const source = sourceField?.value || 'Unknown';
    sources[source] = (sources[source] || 0) + 1;
  });
  
  return sources;
};
```

### 2. Conversion Funnel Tracking
```javascript
// Track form abandonment points
const trackAbandonmentFunnel = async (formId) => {
  const inProgress = await getSubmissions(formId, { status: 'in_progress' });
  const completed = await getSubmissions(formId, { status: 'finished' });
  
  return {
    started: inProgress.totalResponses + completed.totalResponses,
    abandoned: inProgress.totalResponses,
    completed: completed.totalResponses,
    conversionRate: (completed.totalResponses / (inProgress.totalResponses + completed.totalResponses)) * 100
  };
};
```

## Error Handling & Best Practices

### 1. API Error Handling
```javascript
const handleFilloutError = (error, operation) => {
  console.error(`Fillout ${operation} error:`, {
    status: error.status,
    message: error.message
  });
  
  if (error.status === 429) {
    // Rate limit - implement exponential backoff
    setTimeout(() => operation(), 2000);
  } else if (error.status >= 500) {
    // Server error - retry logic
    throw new Error('Fillout service unavailable');
  }
};
```

### 2. Webhook Security
```javascript
// Verify webhook authenticity (if Fillout provides signature verification)
const verifyWebhookSignature = (payload, signature, secret) => {
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
    
  return crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature)
  );
};
```

## Deployment Checklist

### Pre-Launch
- [ ] Form testing with all payment scenarios
- [ ] Webhook endpoint configured and tested
- [ ] Email templates personalized and tested
- [ ] CSS styling matches brand guidelines
- [ ] URL parameters working correctly
- [ ] Analytics tracking implemented

### Post-Launch Monitoring
- [ ] Monitor webhook reliability
- [ ] Track conversion rates
- [ ] Monitor form abandonment rates
- [ ] Check payment processing success
- [ ] Verify email delivery rates

## Resources
- [Fillout API Documentation](https://www.fillout.com/help/fillout-rest-api)
- [Webhook Guide](https://www.fillout.com/help/webhook)
- [Workflow Automation](https://www.fillout.com/help/workflows)
- [Custom CSS Guide](https://www.fillout.com/help/custom-css)
- [URL Parameters](https://www.fillout.com/help/url-parameters)
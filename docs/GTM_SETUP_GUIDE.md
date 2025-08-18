# 🏷️ Google Tag Manager - Guia Completo de Configuração
## Café com Vendas - Landing Page Portugal

---

## 📋 Visão Geral

Este guia fornece instruções passo a passo para configurar o Google Tag Manager (GTM) para a landing page do Café com Vendas, baseado na implementação real do código.

### ✅ Status Atual
- **Container ID**: Dinâmico via `VITE_GTM_CONTAINER_ID` (Produção: GTM-T63QRLFT)
- **Implementação**: ✅ Sistema avançado com lazy loading e performance otimizada
- **DataLayer**: ✅ Configurado com estrutura de eventos complexa
- **Lazy Loading**: ✅ Carregamento inteligente baseado em interações
- **CSP Compliance**: ✅ Totalmente seguro (sem scripts inline)
- **Dynamic Pricing**: ✅ Sistema de preços dinâmico integrado
- **Error Tracking**: ✅ Rastreamento avançado de erros JavaScript

---

## 🚀 1. Configuração Inicial do Container

### ⚠️ IMPORTANTE: Configuração de Environment Variables

**ANTES DE COMEÇAR**: Este projeto usa variáveis de ambiente para configuração dinâmica.

#### Configuração Local (.env.local)
```bash
# Google Tag Manager
VITE_GTM_CONTAINER_ID=GTM-T63QRLFT
```

#### Configuração Netlify (Produção)
1. Vá em **Site Settings** → **Environment Variables**
2. Adicione: `VITE_GTM_CONTAINER_ID` = `GTM-T63QRLFT`

### Acessar o GTM Console
1. Acesse [tagmanager.google.com](https://tagmanager.google.com)
2. Selecione o container **GTM-T63QRLFT**
3. Crie um **Workspace** dedicado: "Café com Vendas v2025 Setup"

### Configurações Básicas
- **Nome do Container**: Café com Vendas - Portugal v2025
- **Tipo**: Web
- **URL do Site**: https://cafecomvendas.com
- **Timezone**: Portugal (GMT+1)
- **Domínios Autorizados**: cafecomvendas.com, *.netlify.app, localhost:8080

### 🎯 Sistema de Lazy Loading
**CRÍTICO**: Este projeto implementa carregamento lazy do GTM para otimização de performance:
- GTM só carrega após interação do usuário ou triggers específicos
- Triggers imediatos: CTA clicks, checkout buttons, scroll 25%+
- Fallback: 10s + idle callback (máx 15s total)

---

## 📊 2. Variáveis do DataLayer

**BASEADO NA IMPLEMENTAÇÃO REAL**: Configure estas variáveis para capturar os dados do sistema avançado de analytics.

### Variáveis Built-in Necessárias
Ative em **Variables > Built-In Variables > Configure**:
- ✅ **Event** (captura automaticamente o nome do evento do dataLayer)
- ✅ Page URL
- ✅ Page Title  
- ✅ Page Path
- ✅ Referrer
- ✅ Click Element
- ✅ Click Classes
- ✅ Click ID
- ✅ Click Target
- ✅ Click Text
- ✅ Scroll Depth Threshold
- ✅ Scroll Depth Units
- ✅ Scroll Direction
- ✅ **Form Element** (para checkout form tracking)
- ✅ **Form Classes** (para identificação de formulários)
- ✅ **Form ID** (para tracking específico de forms)
- ✅ **Error Message** (para error tracking)
- ✅ **Debug Mode** (para desenvolvimento)

### Variáveis Personalizadas

#### Event Settings Variable (Opcional)
**Nome**: GA4 Event Settings - Global
**Tipo**: Google Analytics: GA4 Event Settings
**Parâmetros** (exemplo para configuração avançada):
- `page_location`: {{Page URL}}
- `page_title`: {{Page Title}}  
- `user_engagement`: true
- `cafe_com_vendas_version`: v2025

**⚠️ Nota**: Para o seu projeto, parâmetros diretos nas tags são mais simples e eficientes.

#### 1. Event Category
- **Tipo**: Data Layer Variable
- **Nome da Variável**: event_category
- **Nome**: DL - Event Category
- **Valores Comuns**: 'Performance', 'Application', 'FAQ', 'Error', 'Engagement', 'Conversion'

#### 2. Custom Parameter
- **Tipo**: Data Layer Variable
- **Nome da Variável**: custom_parameter
- **Nome**: DL - Custom Parameter
- **Uso**: Performance metrics, timing values

#### 3. Source (CRÍTICO para Checkout)
- **Tipo**: Data Layer Variable
- **Nome da Variável**: source
- **Nome**: DL - Source
- **Valores**: 'hero', 'solution', 'offer', 'final-cta', 'about'

#### 4. Components Count
- **Tipo**: Data Layer Variable
- **Nome da Variável**: components_count
- **Nome**: DL - Components Count
- **Uso**: App initialization tracking

#### 5. Metric Value
- **Tipo**: Data Layer Variable
- **Nome da Variável**: metric_value
- **Nome**: DL - Metric Value
- **Uso**: Performance timing, engagement metrics

#### 6. Transaction ID
- **Tipo**: Data Layer Variable
- **Nome da Variável**: transaction_id
- **Nome**: DL - Transaction ID
- **Uso**: Stripe payment intent tracking

#### 7. Pricing Tier (NOVO)
- **Tipo**: Data Layer Variable
- **Nome da Variável**: pricing_tier
- **Nome**: DL - Pricing Tier
- **Valores**: 'first_lot_early_bird', 'second_lot'

#### 8. Amount (DINÂMICO)
- **Tipo**: Data Layer Variable
- **Nome da Variável**: amount
- **Nome**: DL - Amount
- **Uso**: Preço dinâmico baseado no tier ativo

#### 9. Lead ID
- **Tipo**: Data Layer Variable
- **Nome da Variável**: lead_id
- **Nome**: DL - Lead ID
- **Uso**: Rastreamento de leads através do funnel

#### 10. Error Message
- **Tipo**: Data Layer Variable
- **Nome da Variável**: error_message
- **Nome**: DL - Error Message
- **Uso**: Tracking de erros JavaScript

#### 11. Slide Index
- **Tipo**: Data Layer Variable
- **Nome da Variável**: slide_index
- **Nome**: DL - Slide Index
- **Uso**: Testimonials carousel tracking

#### 12. Engagement Time
- **Tipo**: Data Layer Variable
- **Nome da Variável**: value
- **Nome**: DL - Value
- **Uso**: FAQ engagement time, scroll percentage 

---

## 🎯 3. Triggers (Gatilhos)

**IMPLEMENTAÇÃO REAL**: Configure os triggers baseados nos eventos realmente enviados pelo código.

### 📋 Lista Completa de Eventos Rastreados
```javascript
// Core Application Events
'app_initialized'              // App startup
'components_initialized'       // Component loading
'gtm_init'                    // GTM initialization

// Performance & Core Web Vitals  
'hero_lcp_timing'             // Largest Contentful Paint
'core_web_vitals_fid'         // First Input Delay
'core_web_vitals_cls'         // Cumulative Layout Shift
'page_load_performance'       // Complete page load metrics

// User Engagement
'scroll_depth'                // 25%, 50%, 75% thresholds
'faq_toggle'                  // FAQ open/close with engagement time
'faq_meaningful_engagement'   // FAQ viewed >3 seconds
'view_testimonials_section'   // Testimonials section view
'view_testimonial_slide'      // Individual testimonial view

// Conversion Flow
'checkout_opened'             // Modal opened (with source)
'checkout_closed'             // Modal closed
'lead_captured'               // Step 1 completed
'payment_completed'           // Purchase success
'payment_failed'              // Payment error

// Error Tracking
'javascript_error'            // JS errors with deduplication
'component_initialization_failed' // Component load failures
'analytics_tracking_failed'   // Analytics errors
'unhandled_promise_rejection' // Promise rejections
'global_javascript_error'     // Global error handler
```

### 🚀 APPLICATION & PERFORMANCE TRIGGERS

### 1. GTM Initialization
- **Nome**: GTM Init
- **Tipo**: Custom Event
- **Event Name**: gtm_init
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `gtm_init`

### 2. App Initialized
- **Nome**: App Initialized
- **Tipo**: Custom Event
- **Event Name**: app_initialized
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `app_initialized`

### 3. Components Initialized
- **Nome**: Components Initialized
- **Tipo**: Custom Event
- **Event Name**: components_initialized
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `components_initialized`

### 🎯 CORE WEB VITALS & PERFORMANCE TRIGGERS

### 4. Hero LCP Timing
- **Nome**: Hero LCP Timing
- **Tipo**: Custom Event
- **Event Name**: hero_lcp_timing
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `hero_lcp_timing`

### 5. Core Web Vitals - FID
- **Nome**: Core Web Vitals FID
- **Tipo**: Custom Event
- **Event Name**: core_web_vitals_fid
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `core_web_vitals_fid`

### 6. Core Web Vitals - CLS
- **Nome**: Core Web Vitals CLS
- **Tipo**: Custom Event
- **Event Name**: core_web_vitals_cls
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `core_web_vitals_cls`

### 7. Page Load Performance
- **Nome**: Page Load Performance
- **Tipo**: Custom Event
- **Event Name**: page_load_performance
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `page_load_performance`

### 💰 CONVERSION FLOW TRIGGERS (CRÍTICO)

### 8. Checkout Opened (com Source Attribution)
- **Nome**: Checkout Opened
- **Tipo**: Custom Event
- **Event Name**: checkout_opened
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `checkout_opened`
- **Parâmetros Capturados**: source, amount, currency, pricing_tier

### 9. Checkout Closed
- **Nome**: Checkout Closed
- **Tipo**: Custom Event
- **Event Name**: checkout_closed
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `checkout_closed`

### 10. Lead Captured
- **Nome**: Lead Captured
- **Tipo**: Custom Event
- **Event Name**: lead_captured
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `lead_captured`

### 11. Payment Completed
- **Nome**: Payment Completed
- **Tipo**: Custom Event
- **Event Name**: payment_completed
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `payment_completed`

### 12. Payment Failed
- **Nome**: Payment Failed
- **Tipo**: Custom Event
- **Event Name**: payment_failed
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `payment_failed`

### 🎭 ENGAGEMENT TRIGGERS

### 13. Scroll Depth (Implementação Real)
- **Nome**: Scroll Depth
- **Tipo**: Custom Event
- **Event Name**: scroll_depth
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `scroll_depth`
- **Thresholds Reais**: 25%, 50%, 75% (conforme CONFIG.scroll.thresholds)

### 14. FAQ Toggle
- **Nome**: FAQ Toggle
- **Tipo**: Custom Event
- **Event Name**: faq_toggle
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `faq_toggle`

### 15. FAQ Meaningful Engagement
- **Nome**: FAQ Meaningful Engagement
- **Tipo**: Custom Event
- **Event Name**: faq_meaningful_engagement
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `faq_meaningful_engagement`
- **Critério**: FAQ visualizada por >3 segundos

### 16. View Testimonials Section
- **Nome**: View Testimonials Section
- **Tipo**: Custom Event
- **Event Name**: view_testimonials_section
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `view_testimonials_section`

### 17. View Testimonial Slide
- **Nome**: View Testimonial Slide
- **Tipo**: Custom Event
- **Event Name**: view_testimonial_slide
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `view_testimonial_slide`

### 🔗 CTA & CLICK TRIGGERS (Sistema Real)

### 18. CTA Button Clicks (data-checkout-trigger)
- **Nome**: CTA Button Clicks
- **Tipo**: Click - All Elements
- **This trigger fires on**: Some Clicks
- **Condições de Ativação**:
  - Variable: `{{Click Element}}` | Operator: matches CSS selector | Value: `[data-checkout-trigger]`
- **Sources Tracked**: hero, solution, offer, final-cta, about
- **⚠️ IMPORTANTE**: Este é o sistema real de atribuição de CTAs implementado

### 19. WhatsApp Button Clicks
- **Nome**: WhatsApp Clicks
- **Tipo**: Click - All Elements
- **This trigger fires on**: Some Clicks
- **Condições de Ativação**:
  - Variable: `{{Click URL}}` | Operator: contains | Value: `wa.me`
  - **OR** Variable: `{{Click Text}}` | Operator: contains | Value: `WhatsApp`
  - **OR** Variable: `{{Click Element}}` | Operator: matches CSS selector | Value: `[data-analytics-event*="whatsapp"]`

### 20. Social Media Clicks
- **Nome**: Social Media Clicks
- **Tipo**: Click - All Elements
- **This trigger fires on**: Some Clicks
- **Condições de Ativação**:
  - Variable: `{{Click URL}}` | Operator: contains | Value: `instagram.com`
  - **OR** Variable: `{{Click Text}}` | Operator: contains | Value: `@jucanamaximiliano`
  - **OR** Variable: `{{Click Element}}` | Operator: matches CSS selector | Value: `[data-analytics-event*="social"]`

### ⚙️ ERROR TRACKING TRIGGERS (NOVO)

### 21. JavaScript Errors
- **Nome**: JavaScript Errors
- **Tipo**: Custom Event
- **Event Name**: javascript_error
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `javascript_error`

### 22. Component Initialization Failed
- **Nome**: Component Init Failed
- **Tipo**: Custom Event
- **Event Name**: component_initialization_failed
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `component_initialization_failed`

### 📝 FORM & MODAL TRIGGERS (Implementação Avançada)

### 23. Checkout Modal Opened (Element Visibility)
- **Nome**: Checkout Modal Opened
- **Tipo**: Element Visibility
- **Selection Method**: ID
- **Element ID**: checkoutModal
- **When to fire this trigger**: Once per page
- **Minimum Percent Visible**: 1%
- **On Screen Duration**: 300ms
- **This trigger fires on**: All Pages
- **⚠️ IMPORTANTE**: Complementa o evento `checkout_opened` via JavaScript

### 24. Lead Form Submission (Formspree Integration)
- **Nome**: Lead Form Submit
- **Tipo**: Form Submission
- **This trigger fires on**: Some Forms
- **Condições de Ativação**:
  - Variable: `{{Form ID}}` | Operator: equals | Value: `leadForm`
- **📝 OBSERVAÇÃO**: O evento `lead_captured` via JavaScript é mais confiável

---

## ⚙️ 4. Como Configurar Condições no GTM Console

### Passo a Passo para Triggers Customizados

#### 1. Para Custom Events (ex: checkout_opened):
1. **Trigger Type**: Custom Event
2. **Event Name**: `checkout_opened` (exato)
3. **This trigger fires on**: Some Custom Events
4. **Fire this trigger when an Event occurs and all of these conditions are true**:
   - **Variable**: `{{Event}}` | **Operator**: equals | **Value**: `checkout_opened`

**💡 Explicação das Variáveis:**
- `{{Event}}` é a variável built-in que captura o nome do evento do dataLayer
- Esta é a variável que você seleciona no dropdown "Variable" do GTM console

#### 2. Para Click Triggers (ex: CTA Buttons):
1. **Trigger Type**: Click - All Elements
2. **This trigger fires on**: Some Clicks
3. **Fire this trigger when a click occurs and all of these conditions are true**:
   - `Click Text` contains `Garantir a minha vaga`

#### 3. Para Element Visibility (ex: Modal):
1. **Trigger Type**: Element Visibility
2. **Selection Method**: ID
3. **Element ID**: checkoutModal
4. **When to fire this trigger**: Once per page
5. **Minimum Percent Visible**: 1%
6. **On Screen Duration**: 500 (milliseconds)

#### 4. Para Scroll Depth:
1. **Trigger Type**: Scroll Depth
2. **Vertical Scroll Depths**: Percentages: `10,25,50,75,90`
3. **This trigger fires on**: All Pages

### Operadores Comuns para Condições
- **equals**: Correspondência exata
- **contains**: Contém o texto
- **starts with**: Começa com
- **ends with**: Termina com  
- **matches RegEx**: Expressão regular
- **greater than**: Maior que
- **less than**: Menor que

### 💡 Por que Removemos as Condições de URL?

**Decisão de Simplificação**: Optamos por remover condições de URL (`Page URL contains`) pelos seguintes motivos:

#### ✅ **Vantagens desta Abordagem:**
1. **Segurança do Container**: O GTM só carrega nos domínios autorizados no console
2. **Simplicidade**: Menos condições = menos pontos de falha
3. **Multi-ambiente**: Funciona automaticamente em desenvolvimento, staging e produção
4. **Manutenção**: Não precisa atualizar triggers ao mudar de domínio
5. **Performance**: Menos verificações = triggers mais rápidos

#### ✅ **Quando Usar Condições de URL:**
- **Cross-domain tracking**: Múltiplos sites com o mesmo GTM
- **Subdomínios distintos**: blog.site.com vs shop.site.com precisam tracking diferente
- **Paths específicos**: Comportamento diferente em /blog vs /loja
- **A/B testing**: URLs específicas para variações de teste

#### ✅ **Nossa Configuração:**
- **Triggers baseados em eventos**: Focam no que o usuário faz, não onde está
- **Segurança via GTM Console**: Autorização de domínio no nível do container
- **Flexibilidade total**: Funciona em qualquer domínio autorizado

---

## 🏷️ 5. Tags de Tracking

### Google Analytics 4 (Implementação Avançada)

#### 1. GA4 Configuration Tag
- **Nome**: GA4 Config - Café com Vendas v2025
- **Tipo**: Google Analytics: GA4 Configuration
- **Measurement ID**: G-XXXXXXXXXX (configure no environment)
- **Trigger**: GTM Init (não Page View - devido ao lazy loading)
- **Parâmetros Globais**:
  - `page_location`: {{Page URL}}
  - `page_title`: {{Page Title}}
  - `cafe_com_vendas_version`: v2025
  - `gtm_container_id`: GTM-T63QRLFT

**🔧 Como configurar o Measurement ID:**
1. Acesse [Google Analytics](https://analytics.google.com)
2. Crie uma propriedade GA4: "Café com Vendas - Portugal"
3. Vá em **Admin** → **Data Streams** → **Web**
4. Adicione domínio: cafecomvendas.com
5. Copie o **Measurement ID** (formato: G-XXXXXXXXXX)
6. Configure enhanced measurement: Pageviews, Scrolls, Outbound clicks, File downloads
7. Cole o ID na tag GTM

#### 2. GA4 Event - Application Events
- **Nome**: GA4 Event - Application
- **Tipo**: Google Analytics: GA4 Event
- **Configuration Tag**: GA4 Config - Café com Vendas v2025
- **Event Name**: {{Event}} (variável built-in)
- **Parâmetros**:
  - `event_category`: {{DL - Event Category}}
  - `components_count`: {{DL - Components Count}}
- **Triggers**: 
  - App Initialized
  - Components Initialized

#### 3. GA4 Event - Checkout Opened (SISTEMA DINÂMICO)
- **Nome**: GA4 Event - Checkout Opened
- **Tipo**: Google Analytics: GA4 Event
- **Configuration Tag**: GA4 Config - Café com Vendas v2025
- **Event Name**: checkout_opened
- **Parâmetros CRÍTICOS**:
  - `source`: {{DL - Source}} (hero, solution, offer, final-cta, about)
  - `event_category`: Conversion
  - `amount`: {{DL - Amount}} (⚠️ DINÂMICO: €180 ou €240)
  - `currency`: EUR
  - `pricing_tier`: {{DL - Pricing Tier}} (first_lot_early_bird/second_lot)
- **Trigger**: Checkout Opened
- **📊 IMPORTANTE**: Valores dinâmicos baseados no PricingManager

#### 4. GA4 Event - Performance Metrics (Core Web Vitals)
- **Nome**: GA4 Event - Performance
- **Tipo**: Google Analytics: GA4 Event
- **Configuration Tag**: GA4 Config - Café com Vendas v2025
- **Event Name**: {{Event}} (automaticamente: hero_lcp_timing, core_web_vitals_fid, etc.)
- **Event Parameters**:
  - `metric_value`: {{DL - Metric Value}}
  - `custom_parameter`: {{DL - Custom Parameter}}
  - `event_category`: {{DL - Event Category}}
- **Triggers**: 
  - Hero LCP Timing
  - Core Web Vitals FID
  - Core Web Vitals CLS
  - Page Load Performance
- **📊 Uso**: Performance monitoring e Core Web Vitals tracking

**📋 Explicação do {{Event}}:**
Esta variável built-in do GTM automaticamente usa o nome exato do evento do dataLayer:
- Quando trigger "Core Web Vitals" dispara → Event Name = `core_web_vitals_fid`
- Quando trigger "Hero LCP Timing" dispara → Event Name = `hero_lcp_timing`  
- Quando trigger "Page Load Performance" dispara → Event Name = `page_load_performance`

**💡 Quando usar Event Settings Variable:**
- **Para parâmetros globais**: Aplicar mesmos custom dimensions a todos os eventos
- **Para user properties**: Definir propriedades de usuário consistentes
- **Para configurações avançadas**: session_timeout, engagement_time_msec, etc.
- **Para o seu caso**: Os parâmetros diretos são mais simples e eficientes

#### 5. GA4 Event - Engagement (FAQ & Testimonials)
- **Nome**: GA4 Event - Engagement
- **Tipo**: Google Analytics: GA4 Event
- **Configuration Tag**: GA4 Config - Café com Vendas v2025
- **Event Name**: {{Event}}
- **Parâmetros**:
  - `event_category`: {{DL - Event Category}}
  - `event_label`: {{DL - Event Label}} (FAQ ID, testimonial index)
  - `value`: {{DL - Value}} (engagement time, slide index)
- **Triggers**:
  - FAQ Toggle
  - FAQ Meaningful Engagement
  - View Testimonials Section
  - View Testimonial Slide
  - Scroll Depth

#### 6. GA4 Event - Lead Captured
- **Nome**: GA4 Event - Lead Captured
- **Tipo**: Google Analytics: GA4 Event
- **Configuration Tag**: GA4 Config - Café com Vendas v2025
- **Event Name**: lead_captured
- **Parâmetros**:
  - `lead_id`: {{DL - Lead ID}}
  - `source`: {{DL - Source}}
  - `event_category`: Lead Generation
- **Trigger**: Lead Captured

#### 7. GA4 Event - Error Tracking (NOVO)
- **Nome**: GA4 Event - Errors
- **Tipo**: Google Analytics: GA4 Event
- **Configuration Tag**: GA4 Config - Café com Vendas v2025
- **Event Name**: {{Event}}
- **Parâmetros**:
  - `event_category`: Error
  - `error_message`: {{DL - Error Message}}
  - `event_label`: {{DL - Event Label}}
- **Triggers**:
  - JavaScript Errors
  - Component Init Failed
- **🚫 NÃO enviar PII**: Apenas erro genérico, sem dados pessoais

### Universal Analytics (Legado)

#### 1. UA Configuration
- **Nome**: UA Config - Café com Vendas
- **Tipo**: Google Analytics: Universal Analytics
- **Tracking Type**: Page View
- **Google Analytics Settings**: 
  - Tracking ID: UA-XXXXXXXXX-X
- **Trigger**: All Pages

#### 2. UA Event - Checkout
- **Nome**: UA Event - Checkout
- **Tipo**: Google Analytics: Universal Analytics
- **Tracking Type**: Event
- **Event Parameters**:
  - Category: {{DL - Event Category}}
  - Action: checkout_opened
  - Label: {{DL - Source}}
  - Value: 1
- **Trigger**: Checkout Opened

---

## 🔄 6. Enhanced Ecommerce (SISTEMA DINÂMICO)

**⚠️ CRÍTICO**: O sistema usa preços dinâmicos. NÃO hardcode €180!

### Purchase Event (Preço Dinâmico)
- **Nome**: GA4 Ecommerce - Purchase
- **Tipo**: Google Analytics: GA4 Event
- **Event Name**: purchase
- **Parâmetros DINÂMICOS**:
  - `transaction_id`: {{DL - Transaction ID}} (Stripe Payment Intent ID)
  - `value`: {{DL - Amount}} (⚠️ DINÂMICO: €180 ou €240)
  - `currency`: EUR
  - `pricing_tier`: {{DL - Pricing Tier}}
  - `lead_id`: {{DL - Lead ID}}
  - `items`: Array dinâmico baseado no tier:
```javascript
[
  {
    item_id: "cafe_com_vendas_2025",
    item_name: "Café com Vendas - Lisboa 2025",
    category: "Event Ticket",
    price: {{DL - Amount}}, // DINÂMICO
    quantity: 1,
    item_variant: {{DL - Pricing Tier}} // "first_lot_early_bird" ou "second_lot"
  }
]
```
- **Trigger**: Payment Completed
- **📊 Conversão Goal**: Configure no GA4 como evento de conversão

### Begin Checkout Event (Preço Dinâmico)
- **Nome**: GA4 Ecommerce - Begin Checkout
- **Tipo**: Google Analytics: GA4 Event
- **Event Name**: begin_checkout
- **Parâmetros DINÂMICOS**:
  - `currency`: EUR
  - `value`: {{DL - Amount}} (⚠️ NÃO fixo em €180!)
  - `pricing_tier`: {{DL - Pricing Tier}}
  - `source`: {{DL - Source}} (attributable to hero, offer, etc.)
  - `items`: Mesmo array dinâmico do Purchase
- **Trigger**: Checkout Opened

### 🕰️ Purchase Failed Event (NOVO)
- **Nome**: GA4 Event - Purchase Failed
- **Tipo**: Google Analytics: GA4 Event
- **Event Name**: purchase_failed
- **Parâmetros**:
  - `lead_id`: {{DL - Lead ID}}
  - `error`: {{DL - Error Message}} (generic, no PII)
  - `event_category`: Ecommerce
  - `value`: {{DL - Amount}} (para análise de recovery)
- **Trigger**: Payment Failed
- **Uso**: Recovery campaigns e otimização de checkout

---

## 🎨 6. Custom HTML Tags (Opcionais)

### Facebook Pixel
```html
<!-- Facebook Pixel Code -->
<script>
!function(f,b,e,v,n,t,s)
{if(f.fbq)return;n=f.fbq=function(){n.callMethod?
n.callMethod.apply(n,arguments):n.queue.push(arguments)};
if(!f._fbq)f._fbq=n;n.push=n;n.loaded=!0;n.version='2.0';
n.queue=[];t=b.createElement(e);t.async=!0;
t.src=v;s=b.getElementsByTagName(e)[0];
s.parentNode.insertBefore(t,s)}(window, document,'script',
'https://connect.facebook.net/en_US/fbevents.js');
fbq('init', 'YOUR_PIXEL_ID');
fbq('track', 'PageView');
</script>
```

### LinkedIn Insight Tag
```html
<script type="text/javascript">
_linkedin_partner_id = "YOUR_PARTNER_ID";
window._linkedin_data_partner_ids = window._linkedin_data_partner_ids || [];
window._linkedin_data_partner_ids.push(_linkedin_partner_id);
</script>
```

---

## 🧪 7. Testing e Debug

### Preview Mode
1. Clique em **Preview** no GTM
2. Insira a URL: `http://localhost:8080` (desenvolvimento)
3. Teste todos os eventos:
   - Carregamento da página
   - Clique em CTAs
   - Scroll na página
   - Abertura do modal de checkout

### Verificações Essenciais
- [ ] DataLayer popula corretamente
- [ ] Triggers disparam no momento certo
- [ ] Variáveis capturam dados corretos
- [ ] Tags enviam para destinos corretos
- [ ] Não há erros no console

### Ferramentas de Debug
- **GTM Preview & Debug**: Ferramenta nativa
- **Google Analytics Debugger**: Extensão Chrome
- **Tag Assistant Legacy**: Extensão Chrome
- **Browser DevTools**: Console > dataLayer

---

## 🚀 8. Deployment em Produção

### Environment Variables (ATUALIZADO)
Configure estas variáveis:

**Local Development (.env.local)**:
```env
VITE_GTM_CONTAINER_ID=GTM-T63QRLFT
VITE_STRIPE_PUBLIC_KEY=pk_test_...
VITE_FORMSPREE_FORM_ID=xanbnrvp
VITE_CLOUDINARY_CLOUD_NAME=ds4dhbneq
```

**Netlify Production**:
```env
VITE_GTM_CONTAINER_ID=GTM-T63QRLFT
VITE_STRIPE_PUBLIC_KEY=pk_live_...
VITE_FORMSPREE_FORM_ID=xanbnrvp
STRIPE_SECRET_KEY=sk_live_... (server-side only)
STRIPE_WEBHOOK_SECRET=whsec_...
```

### Publish Container
1. **Submit** todas as alterações
2. **Publish** a versão
3. Adicione **Version Name**: "Café com Vendas Launch v1.0"
4. Adicione **Version Description**: "Configuração inicial completa"

### Verificação Pós-Deploy (CHECKLIST COMPLETO)
- [ ] **Environment Variables**: Todas configuradas na Netlify
- [ ] **GTM Container**: Carrega em produção (verificar Network tab)
- [ ] **Lazy Loading**: GTM ativa após interação
- [ ] **GA4 Real-time**: Eventos aparecem no GA4 real-time view
- [ ] **Enhanced Ecommerce**: Purchase events com valores corretos
- [ ] **Error Tracking**: Funcionando sem PII
- [ ] **Performance**: Core Web Vitals sendo rastreados
- [ ] **Dynamic Pricing**: Valores mudam entre €180/€240
- [ ] **Source Attribution**: CTAs rastreados por seção
- [ ] **Console Errors**: Nenhum erro relacionado ao GTM

### 📊 Validação de Dados no GA4
1. **Real-time View**: Verificar eventos ao vivo
2. **DebugView**: Ativar com `?debug_mode=1`
3. **Enhanced Ecommerce**: Verificar relatório de conversões
4. **Custom Dimensions**: Configurar para pricing_tier, source, lead_id
5. **Conversion Goals**: Configurar purchase como evento de conversão

---

## 📊 9. Métricas e KPIs (DASHBOARD REAL)

### 💰 Conversão (Primary KPIs)
- **Checkout Opened Rate**: % de visitantes que abrem o modal
  - Por fonte: hero vs solution vs offer vs final-cta vs about
- **Lead Capture Rate**: % checkout_opened → lead_captured
- **Payment Completion Rate**: % lead_captured → payment_completed
- **Revenue per Visitor**: Receita total / visitantes únicos
- **Average Order Value**: Média entre €180 (tier 1) e €240 (tier 2)

### 🎭 Engagement (Secondary KPIs)  
- **Scroll Depth Distribution**: 25%, 50%, 75% engagement
- **FAQ Engagement**: % FAQ abertas + tempo médio visualização
- **Testimonial Interaction**: Views de seção + navegação carousel
- **Time to Checkout**: Média de tempo até abrir modal
- **Source Attribution**: Qual seção gera mais conversões

### ⚡ Performance (Technical KPIs)
- **LCP (Hero Section)**: < 2.5s (tracked via hero_lcp_timing)
- **FID (First Input Delay)**: < 100ms (core_web_vitals_fid)
- **CLS (Layout Stability)**: < 0.1 (core_web_vitals_cls)
- **GTM Load Time**: Lazy loading performance
- **Component Init Success**: % components_initialized success

### 🐛 Error Monitoring (Quality KPIs)
- **JavaScript Error Rate**: % sessions com javascript_error
- **Component Failure Rate**: % component_initialization_failed
- **Payment Failure Rate**: % payment_failed vs payment_completed
- **Analytics Coverage**: % events tracking corretamente

### 📈 Relatórios GA4 Recomendados

#### 1. Conversion Funnel Report
```
Step 1: Page View (100%)
Step 2: Scroll 25% (X%)
Step 3: Checkout Opened (X%)
Step 4: Lead Captured (X%)
Step 5: Payment Completed (X%)
```

#### 2. Source Attribution Report
```
Dimension: source (custom dimension)
Metrics: checkout_opened, lead_captured, purchase
Segment: Por device, traffic source
```

#### 3. Performance Dashboard
```
Core Web Vitals por página
Component load times
Error rates por componente
GTM lazy loading performance
```

---

## 🔧 10. Manutenção e Otimização

### Revisões Mensais
- Análise de performance dos events
- Limpeza de tags não utilizadas
- Atualização de triggers conforme necessário
- Revisão de metas de conversão

### Troubleshooting Comum
- **Events não disparam**: Verificar triggers e condições
- **Dados incorretos**: Validar variáveis do dataLayer
- **Tags não carregam**: Verificar publicação do container
- **Performance lenta**: Revisar lazy loading do GTM

### Backup e Versionamento
- **Export** container regularmente
- Documentar mudanças importantes
- Manter versões de rollback disponíveis

---

## 📞 Suporte e Recursos

### Documentação Oficial
- [Google Tag Manager Help](https://support.google.com/tagmanager)
- [GA4 Implementation Guide](https://support.google.com/analytics/topic/9143232)
- [GTM Developer Guide](https://developers.google.com/tag-manager)

### Recursos da Comunidade
- [Simo Ahava's Blog](https://www.simoahava.com/)
- [Analytics Mania](https://www.analyticsmania.com/)
- [MeasureSchool](https://measureschool.com/)

---

## ✅ Checklist Final

- [ ] Container GTM-T63QRLFT configurado
- [ ] Todas as variáveis criadas
- [ ] Triggers funcionando corretamente  
- [ ] Tags de GA4 configuradas
- [ ] Enhanced Ecommerce implementado
- [ ] Testing completo realizado
- [ ] Deploy em produção executado
- [ ] Verificação pós-deploy confirmada
- [ ] Monitoramento ativo configurado

---

**Última Atualização**: Janeiro 2025  
**Versão**: 2.0 (Complete Overhaul)  
**Projeto**: Café com Vendas v2025 - Landing Page Portugal  
**Container**: GTM-T63QRLFT (environment-based)  
**Base**: Implementação real do código

---

## 📋 10. IMPLEMENTAÇÃO PRÁTICA (CODE EXAMPLES)

### 💻 Como o Sistema Realmente Funciona

#### DataLayer Structure (Real Implementation)
```javascript
// Exemplo de evento real do código
window.dataLayer.push({
  event: 'checkout_opened',
  source: 'hero',                    // CTA source attribution
  amount: 180,                       // Dynamic pricing
  currency: 'EUR',
  pricing_tier: 'first_lot_early_bird',
  event_category: 'Conversion'
});

// Performance event example
window.dataLayer.push({
  event: 'hero_lcp_timing',
  custom_parameter: 1250,            // LCP in milliseconds
  event_category: 'Core Web Vitals',
  metric_value: 1250
});

// FAQ engagement example
window.dataLayer.push({
  event: 'faq_meaningful_engagement',
  event_category: 'FAQ',
  event_label: 'faq-3',
  value: 5                           // Engagement time in seconds
});
```

#### HTML Data Attributes (Real Usage)
```html
<!-- CTA Button with Source Attribution -->
<button data-checkout-trigger 
        data-source="hero" 
        class="cta-button">
  Garantir a minha vaga
</button>

<!-- FAQ with Analytics -->
<details data-faq-item="1" 
         data-analytics-event="faq_item_1">
  <summary>Pergunta frequente</summary>
  <div>Resposta...</div>
</details>

<!-- Testimonial with Tracking -->
<div data-video-card 
     data-analytics-event="play_testimonial_video">
  <video>...</video>
</div>
```

#### Environment Configuration
```javascript
// src/assets/js/config/environment.js
export default {
  gtm: {
    containerId: import.meta.env.VITE_GTM_CONTAINER_ID || ''
  },
  stripe: {
    publishableKey: import.meta.env.VITE_STRIPE_PUBLIC_KEY || ''
  },
  isDevelopment: window.location.hostname === 'localhost'
};
```

### 🎯 Triggers Configuration Summary

```
✅ APPLICATION EVENTS
  ├── gtm_init
  ├── app_initialized  
  └── components_initialized

✅ PERFORMANCE EVENTS
  ├── hero_lcp_timing
  ├── core_web_vitals_fid
  ├── core_web_vitals_cls
  └── page_load_performance

✅ CONVERSION EVENTS
  ├── checkout_opened (5 sources)
  ├── checkout_closed
  ├── lead_captured
  ├── payment_completed
  └── payment_failed

✅ ENGAGEMENT EVENTS
  ├── scroll_depth (25%, 50%, 75%)
  ├── faq_toggle
  ├── faq_meaningful_engagement
  ├── view_testimonials_section
  └── view_testimonial_slide

✅ ERROR EVENTS
  ├── javascript_error
  └── component_initialization_failed
```

### 🚀 Quick Setup Commands

```bash
# 1. Configure environment
echo "VITE_GTM_CONTAINER_ID=GTM-T63QRLFT" >> .env.local

# 2. Start development  
npm run dev

# 3. Test in browser
open http://localhost:8080

# 4. Verify GTM in console
# Open DevTools > Console:
window.dataLayer
window.CafeComVendas?.getComponentStatus()
```

---

## ⚠️ AVISOS IMPORTANTES

1. **NÃO hardcode valores**: Preços são dinâmicos (€180/€240)
2. **Environment variables obrigatórias**: GTM não carrega sem `VITE_GTM_CONTAINER_ID`
3. **Lazy loading**: GTM só ativa após interação do usuário
4. **Error tracking**: NÃO enviar PII nos eventos de erro
5. **Source attribution**: Essencial para ROI analysis dos CTAs
6. **Performance first**: Core Web Vitals impactam SEO e conversão

---

**Para suporte**: Consulte o código em `src/assets/js/` ou a documentação em `CLAUDE.md`
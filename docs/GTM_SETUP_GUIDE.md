# 🏷️ Google Tag Manager - Guia Completo de Configuração
## Café com Vendas - Landing Page Portugal

---

## 📋 Visão Geral

Este guia fornece instruções passo a passo para configurar o Google Tag Manager (GTM) para a landing page do Café com Vendas. O seu container ID é **GTM-T63QRLFT**.

### ✅ Status Atual
- **Container ID**: GTM-T63QRLFT
- **Implementação**: ✅ Completa e funcional  
- **DataLayer**: ✅ Configurado e ativo
- **Lazy Loading**: ✅ Otimizado para performance (estratégia avançada)
- **CSP Compliance**: ✅ Seguro (sem scripts inline)
- **Performance Optimized**: ✅ Carregamento sob demanda para conversão

### 🚀 Estratégia de Lazy Loading Implementada

O GTM é carregado dinamicamente usando uma estratégia otimizada de três níveis:

#### **Nível 1: Triggers de Conversão Imediata**
GTM carrega instantaneamente quando o usuário demonstra intenção de compra:
- Clique em botões CTA (`[data-analytics-event*="cta"]`)
- Interação com checkout (`[data-analytics-event*="checkout"]`)
- Clique em botões de oferta (`[data-analytics-event*="offer"]`)
- Links para seção de oferta (`a[href*="#oferta"]`)

#### **Nível 2: Triggers de Engajamento Significativo**
GTM carrega quando o usuário mostra engajamento profundo:
- **Scroll 25%**: Usuário passou da seção hero
- **Interação FAQ**: Clique em perguntas frequentes
- **Engajamento prolongado**: Mais de 25% da página visualizada

#### **Nível 3: Fallback Progressivo**
Sistema de backup para garantir o carregamento:
- **10 segundos**: Tempo mínimo antes de qualquer carregamento automático
- **Idle Detection**: Usa `requestIdleCallback()` quando browser está inativo
- **15 segundos máximo**: Carregamento garantido após esse tempo

### 📊 Benefícios da Estratégia
- **Performance**: Reduz tempo de carregamento inicial
- **Conversão**: Carrega imediatamente quando usuário mostra intenção
- **Engajamento**: Detecta interesse real antes de carregar scripts
- **Compatibilidade**: Funciona em todos os browsers com fallbacks

---

## 🚀 1. Configuração Inicial do Container

### Acessar o GTM Console
1. Acesse [tagmanager.google.com](https://tagmanager.google.com)
2. Selecione o container **GTM-T63QRLFT**
3. Crie um **Workspace** dedicado: "Café com Vendas Setup"

### Configurações Básicas
- **Nome do Container**: Café com Vendas - Portugal
- **Tipo**: Web
- **URL do Site**: https://cafecomvendas.com
- **Timezone**: Portugal (GMT+1)

---

## 📊 2. Variáveis do DataLayer

Configure estas variáveis no GTM para capturar os dados enviados pela sua aplicação:

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

#### 2. Custom Parameter
- **Tipo**: Data Layer Variable
- **Nome da Variável**: custom_parameter
- **Nome**: DL - Custom Parameter

#### 3. Source
- **Tipo**: Data Layer Variable
- **Nome da Variável**: source
- **Nome**: DL - Source

#### 4. Components Count
- **Tipo**: Data Layer Variable
- **Nome da Variável**: components_count
- **Nome**: DL - Components Count

#### 5. Metric Value
- **Tipo**: Data Layer Variable
- **Nome da Variável**: metric_value
- **Nome**: DL - Metric Value

#### 6. Transaction ID
- **Tipo**: Data Layer Variable
- **Nome da Variável**: transaction_id
- **Nome**: DL - Transaction ID

#### 7. Error Message
- **Tipo**: Data Layer Variable
- **Nome da Variável**: error_message
- **Nome**: DL - Error Message

#### 8. Error Stack
- **Tipo**: Data Layer Variable
- **Nome da Variável**: error_stack
- **Nome**: DL - Error Stack

#### 9. FAQ Label
- **Tipo**: Data Layer Variable
- **Nome da Variável**: label
- **Nome**: DL - FAQ Label

#### 10. Is Open State
- **Tipo**: Data Layer Variable
- **Nome da Variável**: is_open
- **Nome**: DL - Is Open State

#### 11. Email Address
- **Tipo**: Data Layer Variable
- **Nome da Variável**: email
- **Nome**: DL - Email Address

#### 12. Purchase Value (Dynamic Pricing)
- **Tipo**: Data Layer Variable
- **Nome da Variável**: amount
- **Nome**: DL - Purchase Value
- **Descrição**: Valor dinâmico da compra em euros (€180 primeiro lote, valores superiores depois)

#### 13. Currency Code
- **Tipo**: Data Layer Variable
- **Nome da Variável**: currency
- **Nome**: DL - Currency Code

#### 14. Pricing Tier
- **Tipo**: Data Layer Variable
- **Nome da Variável**: pricing_tier
- **Nome**: DL - Pricing Tier
- **Descrição**: Identifica o lote de pricing (first_lot_early_bird, second_lot, etc.)

---

## 🎯 3. Triggers (Gatilhos)

Configure os seguintes triggers para capturar eventos específicos:

### 1. Page View - All Pages
- **Nome**: Page View - All Pages
- **Tipo**: Page View
- **This trigger fires on**: All Pages
- **Condições de Ativação**: (nenhuma - dispara em todas as páginas)

### 2. Checkout Opened
- **Nome**: Checkout Opened
- **Tipo**: Custom Event
- **Event Name**: checkout_opened
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `checkout_opened`

### 3. Core Web Vitals
- **Nome**: Core Web Vitals
- **Tipo**: Custom Event
- **Event Name**: core_web_vitals_fid
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `core_web_vitals_fid`

### 4. Hero LCP Timing
- **Nome**: Hero LCP Timing
- **Tipo**: Custom Event
- **Event Name**: hero_lcp_timing
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `hero_lcp_timing`

### 5. Page Load Performance
- **Nome**: Page Load Performance
- **Tipo**: Custom Event
- **Event Name**: page_load_performance
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `page_load_performance`

### 6. App Initialized
- **Nome**: App Initialized
- **Tipo**: Custom Event
- **Event Name**: app_initialized
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `app_initialized`

### 7. Components Initialized
- **Nome**: Components Initialized
- **Tipo**: Custom Event
- **Event Name**: components_initialized
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `components_initialized`

### 8. Scroll Depth Event
- **Nome**: Scroll Depth Event
- **Tipo**: Custom Event
- **Event Name**: scroll_depth
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `scroll_depth`

### 9. CTA Button Clicks
- **Nome**: CTA Button Clicks
- **Tipo**: Click - All Elements
- **This trigger fires on**: Some Clicks
- **Condições de Ativação**:
  - Variable: `{{Click Text}}` | Operator: contains | Value: `Garantir a minha vaga`
  - **OR** Variable: `{{Click Text}}` | Operator: contains | Value: `Garantir vaga`
  - **OR** Variable: `{{Click Element}}` | Operator: matches CSS selector | Value: `[data-analytics-event*="checkout"]`

### 10. WhatsApp Button Clicks
- **Nome**: WhatsApp Clicks
- **Tipo**: Click - All Elements
- **This trigger fires on**: Some Clicks
- **Condições de Ativação**:
  - Variable: `{{Click URL}}` | Operator: contains | Value: `wa.me`
  - **OR** Variable: `{{Click Text}}` | Operator: contains | Value: `WhatsApp`

### 11. Social Media Clicks
- **Nome**: Social Media Clicks
- **Tipo**: Click - All Elements
- **This trigger fires on**: Some Clicks
- **Condições de Ativação**:
  - Variable: `{{Click URL}}` | Operator: contains | Value: `instagram.com`
  - **OR** Variable: `{{Click Text}}` | Operator: contains | Value: `@jucanamaximiliano`

### 12. Checkout Modal Opened
- **Nome**: Checkout Modal Opened
- **Tipo**: Element Visibility
- **Selection Method**: ID
- **Element ID**: checkoutModal
- **When to fire this trigger**: Once per page
- **Minimum Percent Visible**: 1%
- **On Screen Duration**: 500ms
- **This trigger fires on**: All Pages
- **Condições de Ativação**: (nenhuma - dispara quando elemento fica visível)

### 13. Purchase Completed
- **Nome**: Purchase Completed
- **Tipo**: Custom Event
- **Event Name**: payment_completed
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `payment_completed`

### 14. Payment Failed
- **Nome**: Payment Failed
- **Tipo**: Custom Event
- **Event Name**: payment_failed
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `payment_failed`

### 15. Core Web Vitals CLS
- **Nome**: Core Web Vitals CLS
- **Tipo**: Custom Event
- **Event Name**: core_web_vitals_cls
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `core_web_vitals_cls`

### 16. JavaScript Error Tracking
- **Nome**: JavaScript Error Tracking
- **Tipo**: Custom Event
- **Event Name**: javascript_error
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `javascript_error`

### 17. Checkout Modal Closed
- **Nome**: Checkout Modal Closed
- **Tipo**: Custom Event
- **Event Name**: checkout_closed
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `checkout_closed`

### 18. Lead Captured
- **Nome**: Lead Captured
- **Tipo**: Custom Event
- **Event Name**: lead_captured
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `lead_captured`

### 19. FAQ Toggle Interaction
- **Nome**: FAQ Toggle Interaction
- **Tipo**: Custom Event
- **Event Name**: faq_toggle
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `faq_toggle`

### 20. FAQ Meaningful Engagement
- **Nome**: FAQ Meaningful Engagement
- **Tipo**: Custom Event
- **Event Name**: faq_meaningful_engagement
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `faq_meaningful_engagement`

### 21. Testimonial Slide View
- **Nome**: Testimonial Slide View
- **Tipo**: Custom Event
- **Event Name**: view_testimonial_slide
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `view_testimonial_slide`

### 22. Testimonials Section View
- **Nome**: Testimonials Section View
- **Tipo**: Custom Event
- **Event Name**: view_testimonials_section
- **This trigger fires on**: Some Custom Events
- **Condições de Ativação**:
  - Variable: `{{Event}}` | Operator: equals | Value: `view_testimonials_section`

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

### Google Analytics 4 (Recomendado)

#### 1. GA4 Configuration Tag
- **Nome**: GA4 Config - Café com Vendas
- **Tipo**: Google Analytics: GA4 Configuration
- **Measurement ID**: G-XXXXXXXXXX (substitua pelo seu GA4 ID)
- **Trigger**: Page View - All Pages

**🔧 Como configurar o Measurement ID:**
1. Acesse [Google Analytics](https://analytics.google.com)
2. Crie uma nova propriedade GA4 ou use uma existente
3. Vá em **Admin** → **Data Streams** → **Web**
4. Copie o **Measurement ID** (formato: G-XXXXXXXXXX)
5. Cole no campo **Measurement ID** desta tag

#### 2. GA4 Event - Checkout Opened
- **Nome**: GA4 Event - Checkout Opened
- **Tipo**: Google Analytics: GA4 Event
- **Configuration Tag**: GA4 Config - Café com Vendas
- **Event Name**: checkout_opened
- **Parâmetros**:
  - `source`: {{DL - Source}}
  - `event_category`: {{DL - Event Category}}
- **Trigger**: Checkout Opened

#### 3. GA4 Event - Performance Metrics
- **Nome**: GA4 Event - Performance
- **Tipo**: Google Analytics: GA4 Event
- **Configuration Tag**: GA4 Config - Café com Vendas
- **Event Name**: {{Event}} (variável built-in do GTM que captura o nome do evento automaticamente)
- **Event Parameters**:
  - `metric_value`: {{DL - Metric Value}}
  - `custom_parameter`: {{DL - Custom Parameter}}
  - `event_category`: {{DL - Event Category}}
- **Event Settings Variable**: Não necessário (parâmetros diretos são suficientes)
- **Triggers**: 
  - Core Web Vitals
  - Hero LCP Timing
  - Page Load Performance

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

#### 4. GA4 Event - App Events
- **Nome**: GA4 Event - App Events
- **Tipo**: Google Analytics: GA4 Event
- **Configuration Tag**: GA4 Config - Café com Vendas
- **Event Name**: {{Event}}
- **Parâmetros**:
  - `components_count`: {{DL - Components Count}}
  - `event_category`: {{DL - Event Category}}
- **Triggers**:
  - App Initialized
  - Components Initialized

#### 5. GA4 Event - Error Tracking
- **Nome**: GA4 Event - Error Tracking
- **Tipo**: Google Analytics: GA4 Event
- **Configuration Tag**: GA4 Config - Café com Vendas
- **Event Name**: javascript_error
- **Event Parameters**:
  - `error_message`: {{DL - Error Message}}
  - `error_stack`: {{DL - Error Stack}}
  - `event_category`: {{DL - Event Category}}
- **Triggers**: JavaScript Error Tracking

#### 6. GA4 Event - User Engagement
- **Nome**: GA4 Event - User Engagement
- **Tipo**: Google Analytics: GA4 Event
- **Configuration Tag**: GA4 Config - Café com Vendas
- **Event Name**: {{Event}}
- **Event Parameters**:
  - `label`: {{DL - FAQ Label}}
  - `is_open`: {{DL - Is Open State}}
  - `email`: {{DL - Email Address}}
  - `source`: {{DL - Source}}
  - `event_category`: {{DL - Event Category}}
- **Triggers**:
  - FAQ Toggle Interaction
  - FAQ Meaningful Engagement
  - Lead Captured
  - Checkout Modal Closed
  - Testimonial Slide View
  - Testimonials Section View

#### 7. GA4 Event - Core Web Vitals Extended
- **Nome**: GA4 Event - Core Web Vitals Extended
- **Tipo**: Google Analytics: GA4 Event
- **Configuration Tag**: GA4 Config - Café com Vendas
- **Event Name**: {{Event}}
- **Event Parameters**:
  - `metric_value`: {{DL - Metric Value}}
  - `custom_parameter`: {{DL - Custom Parameter}}
  - `event_category`: {{DL - Event Category}}
- **Triggers**:
  - Core Web Vitals CLS
  - Scroll Depth Event

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

## 🔄 5. Enhanced Ecommerce (Recomendado)

Para tracking avançado de conversões do evento €180:

### Purchase Event (Dynamic Pricing)
- **Nome**: GA4 Ecommerce - Purchase
- **Tipo**: Google Analytics: GA4 Event
- **Event Name**: purchase
- **Parâmetros**:
  - `transaction_id`: {{DL - Transaction ID}}
  - `value`: {{DL - Purchase Value}} (dinâmico: €180 primeiro lote → preços superiores)
  - `currency`: {{DL - Currency Code}} (EUR)
  - `pricing_tier`: {{DL - Pricing Tier}} (para segmentação de negócio)
  - `items`: [{"item_name": "Café com Vendas Event", "price": {{DL - Purchase Value}}, "quantity": 1, "item_category": {{DL - Pricing Tier}}}]
- **Trigger**: Purchase Completed

**💡 Nota sobre Dynamic Pricing**: O evento automaticamente detecta o preço atual baseado no lote ativo:
- **Primeiro lote**: €180 (primeiras 8 vendas)
- **Lotes seguintes**: Preços dinâmicos conforme disponibilidade
- **Business Intelligence**: Permite análise de performance por tier de pricing

### Begin Checkout Event (Dynamic Pricing)
- **Nome**: GA4 Ecommerce - Begin Checkout
- **Tipo**: Google Analytics: GA4 Event
- **Event Name**: begin_checkout
- **Parâmetros**:
  - `currency`: {{DL - Currency Code}} (EUR)
  - `value`: {{DL - Purchase Value}} (preço dinâmico baseado no lote atual)
  - `pricing_tier`: {{DL - Pricing Tier}} (segmentação por lote)
  - `items`: [{"item_name": "Café com Vendas Event", "price": {{DL - Purchase Value}}, "quantity": 1, "item_category": {{DL - Pricing Tier}}}]
- **Trigger**: Checkout Opened

**🔧 Implementação**: O valor é capturado dinamicamente quando o usuário abre o checkout, refletindo o preço atual baseado na disponibilidade de vagas.

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

### 🧪 Dynamic Pricing Testing

Para testar os diferentes tiers de pricing em desenvolvimento:

#### **Teste do Primeiro Lote (€180)**
```javascript
// No console do browser
PricingManager.setSalesCountForTesting(3);
// Testa o checkout - valor deve ser €180
```

#### **Teste do Segundo Lote (€240)**
```javascript
// No console do browser
PricingManager.setSalesCountForTesting(10);
// Testa o checkout - valor deve ser €240
```

#### **Verificação no GTM Preview**
1. **DataLayer Variables**: Verifique se aparecem:
   - `amount`: 180 (primeiro lote) ou 240 (segundo lote)
   - `currency`: EUR
   - `pricing_tier`: first_lot_early_bird ou second_lot

2. **Eventos para Testar**:
   - `checkout_opened`: Valor dinâmico baseado no tier ativo
   - `payment_completed`: Valor real da transação Stripe

#### **Business Intelligence Testing**
- **Segmentação por Tier**: Verifique se GA4 recebe `pricing_tier` parameter
- **Análise de Revenue**: Compare valores entre primeiro e segundo lote
- **Conversão por Preço**: Analise performance de cada tier

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

### Netlify Environment Variables
Configure no painel da Netlify:
```env
VITE_GTM_CONTAINER_ID=GTM-T63QRLFT
```

### Publish Container
1. **Submit** todas as alterações
2. **Publish** a versão
3. Adicione **Version Name**: "Café com Vendas Launch v1.0"
4. Adicione **Version Description**: "Configuração inicial completa"

### Verificação Pós-Deploy
- [ ] GTM carrega em produção
- [ ] Eventos são enviados corretamente
- [ ] Google Analytics recebe dados
- [ ] Não há erros de console

---

## 📈 9. Métricas Importantes para Monitorar

### Conversão
- **Checkout Started**: Taxa de abertura do modal
- **Form Completion**: Taxa de preenchimento do formulário
- **Purchase**: Conversões efetivas (€180)

### Engagement  
- **Scroll Depth**: 25%, 50%, 75%, 90%
- **Time on Page**: Tempo de permanência
- **CTA Clicks**: Clicks em botões de ação

### Performance
- **LCP (Largest Contentful Paint)**: < 2.5s
- **FID (First Input Delay)**: < 100ms
- **CLS (Cumulative Layout Shift)**: < 0.1

### Comportamento
- **Page Views**: Visualizações da landing page
- **Session Duration**: Duração média das sessões
- **Bounce Rate**: Taxa de rejeição

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

**Última Atualização**: Agosto 2025  
**Versão**: 1.0  
**Projeto**: Café com Vendas - Landing Page Portugal  
**Container**: GTM-T63QRLFT

---

> 💡 **Dica**: Mantenha este documento atualizado conforme novas implementações e mudanças no tracking. Para suporte técnico, consulte o time de desenvolvimento ou entre em contato através dos canais oficiais do projeto.
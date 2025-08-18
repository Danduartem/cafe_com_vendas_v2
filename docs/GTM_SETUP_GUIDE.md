# 🏷️ Google Tag Manager - Guia Completo de Configuração
## Café com Vendas - Landing Page Portugal

---

## 📋 Visão Geral

Este guia fornece instruções passo a passo para configurar o Google Tag Manager (GTM) para a landing page do Café com Vendas. O seu container ID é **GTM-T63QRLFT**.

### ✅ Status Atual
- **Container ID**: GTM-T63QRLFT
- **Implementação**: ✅ Completa e funcional
- **DataLayer**: ✅ Configurado e ativo
- **Lazy Loading**: ✅ Otimizado para performance
- **CSP Compliance**: ✅ Seguro (sem scripts inline)

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

---

## 🎯 3. Triggers (Gatilhos)

Configure os seguintes triggers para capturar eventos específicos:

### 1. Page View Trigger
- **Nome**: Page View - All Pages
- **Tipo**: Page View
- **Condição**: All Pages (sem filtros de URL)

### 2. Checkout Opened
- **Nome**: Checkout Opened
- **Tipo**: Custom Event
- **Event Name**: checkout_opened
- **Condições de Ativação**: 
  - Event equals `checkout_opened`

### 3. Core Web Vitals
- **Nome**: Core Web Vitals
- **Tipo**: Custom Event
- **Event Name**: core_web_vitals_fid
- **Condições de Ativação**:
  - Event equals `core_web_vitals_fid`

### 4. Hero LCP Timing
- **Nome**: Hero LCP Timing
- **Tipo**: Custom Event
- **Event Name**: hero_lcp_timing
- **Condições de Ativação**:
  - Event equals `hero_lcp_timing`

### 5. Page Load Performance
- **Nome**: Page Load Performance
- **Tipo**: Custom Event
- **Event Name**: page_load_performance
- **Condições de Ativação**:
  - Event equals `page_load_performance`

### 6. App Initialized
- **Nome**: App Initialized
- **Tipo**: Custom Event
- **Event Name**: app_initialized
- **Condições de Ativação**:
  - Event equals `app_initialized`

### 7. Components Initialized
- **Nome**: Components Initialized
- **Tipo**: Custom Event
- **Event Name**: components_initialized
- **Condições de Ativação**:
  - Event equals `components_initialized`

### 8. Scroll Depth Trigger
- **Nome**: Scroll Depth 10%, 25%, 50%, 75%, 90%
- **Tipo**: Scroll Depth
- **Percentages**: 10,25,50,75,90
- **Condições de Ativação**: All Pages

### 9. CTA Button Clicks
- **Nome**: CTA Button Clicks
- **Tipo**: Click - All Elements
- **Condições de Ativação**:
  - Click Text contains `Garantir a minha vaga`
  - OR Click Text contains `Garantir vaga`
  - OR Click Element matches CSS selector `[data-analytics-event*="checkout"]`

### 10. WhatsApp Button Clicks
- **Nome**: WhatsApp Clicks
- **Tipo**: Click - All Elements
- **Condições de Ativação**:
  - Click URL contains `wa.me`
  - OR Click Text contains `WhatsApp`

### 11. Social Media Clicks
- **Nome**: Social Media Clicks
- **Tipo**: Click - All Elements
- **Condições de Ativação**:
  - Click URL contains `instagram.com`
  - OR Click Text contains `@jucanamaximiliano`

### 12. Form Interactions
- **Nome**: Form Start
- **Tipo**: Form Submission
- **Condições de Ativação**:
  - Form Classes contains `checkout-form`

### 13. Modal Events
- **Nome**: Checkout Modal Opened
- **Tipo**: Element Visibility
- **Selection Method**: ID
- **Element ID**: checkoutModal
- **Condições de Ativação**:
  - When to fire this trigger: Once per page
  - Minimum Percent Visible: 1%
  - On Screen Duration: 500ms

---

## ⚙️ 4. Como Configurar Condições no GTM Console

### Passo a Passo para Triggers Customizados

#### 1. Para Custom Events (ex: checkout_opened):
1. **Trigger Type**: Custom Event
2. **Event Name**: `checkout_opened` (exato)
3. **This trigger fires on**: Some Custom Events
4. **Fire this trigger when an Event occurs and all of these conditions are true**:
   - `Event` equals `checkout_opened`

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
- **Trigger**: All Pages

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
- **Event Name**: {{Event}}
- **Parâmetros**:
  - `metric_value`: {{DL - Metric Value}}
  - `custom_parameter`: {{DL - Custom Parameter}}
- **Triggers**: 
  - Core Web Vitals
  - Hero LCP Timing
  - Page Load Performance

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

### Purchase Event
- **Nome**: GA4 Ecommerce - Purchase
- **Tipo**: Google Analytics: GA4 Event
- **Event Name**: purchase
- **Parâmetros**:
  - `transaction_id`: {{Transaction ID}}
  - `value`: 180
  - `currency`: EUR
  - `items`: Array com detalhes do evento

### Begin Checkout Event
- **Nome**: GA4 Ecommerce - Begin Checkout
- **Tipo**: Google Analytics: GA4 Event
- **Event Name**: begin_checkout
- **Parâmetros**:
  - `currency`: EUR
  - `value`: 180
  - `items`: Array com detalhes do evento
- **Trigger**: Checkout Opened

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
# 💳 Stripe Test Cards - Café com Vendas

Guia completo de cartões de teste para testar o fluxo de pagamento do evento Café com Vendas, focado nos mercados de Portugal (90%) e Brasil (10%).

## 🎯 Cartões Principais para Nossos Mercados

### 🇵🇹 Portugal (Principal)
```
Número: 4000 0062 0000 0007
Marca: Visa
Mercado: Portugal
CVC: Qualquer código de 3 dígitos
Validade: Qualquer data futura
```

### 🇧🇷 Brasil (Secundário)
```
Número: 4000 0007 6000 0002
Marca: Visa
Mercado: Brasil
CVC: Qualquer código de 3 dígitos
Validade: Qualquer data futura
```

### 🌍 Internacional (Backup)
```
Número: 4242 4242 4242 4242
Marca: Visa
Mercado: Global
CVC: Qualquer código de 3 dígitos
Validade: Qualquer data futura
```

## 🔐 Cartões 3D Secure (Obrigatório para Europa)

Na Europa (incluindo Portugal), a regulamentação Strong Customer Authentication (SCA) exige autenticação 3D Secure para pagamentos online.

### ✅ Autenticação Bem-sucedida
```
Número: 4000 0027 6000 3184
Status: Requer autenticação → Aprovado
Uso: Testar fluxo completo de 3DS
```

### ❌ Autenticação Falhada
```
Número: 4000 0025 0000 3155
Status: Requer autenticação → Recusado
Uso: Testar falha de autenticação
```

### 🔄 3D Secure 2.0
```
Número: 4000 0000 0000 3220
Status: Autenticação 3DS2
Uso: Testar protocolo mais recente
```

## 🧪 Cenários de Teste Comuns

### ✅ Pagamento Aprovado
| Cartão | Resultado | Uso |
|--------|-----------|-----|
| `4242 4242 4242 4242` | Aprovado | Fluxo padrão bem-sucedido |
| `4000 0062 0000 0007` | Aprovado | Cliente português |
| `4000 0007 6000 0002` | Aprovado | Cliente brasileiro |

### ❌ Pagamento Recusado
| Cartão | Erro | Uso |
|--------|------|-----|
| `4000 0000 0000 0002` | Cartão recusado | Teste de falha genérica |
| `4000 0000 0000 9995` | Fundos insuficientes | Saldo baixo |
| `4000 0000 0000 0069` | Cartão expirado | Validade incorreta |
| `4000 0000 0000 0127` | CVC incorreto | Código de segurança inválido |

### 🚨 Prevenção de Fraude
| Cartão | Resultado | Uso |
|--------|-----------|-----|
| `4100 0000 0000 0019` | Bloqueado por fraude | Sistema de prevenção |
| `4000 0000 0000 9987` | Perdido/roubado | Cartão reportado |

## 📋 Fluxo de Teste Recomendado

### 1. Teste Básico (Cliente Português)
1. Abrir checkout no site
2. Usar `4000 0062 0000 0007`
3. Inserir: CVC `123`, Validade `12/25`
4. Completar processo de 3D Secure
5. ✅ Confirmar pagamento aprovado

### 2. Teste com Autenticação
1. Usar `4000 0027 6000 3184`
2. Seguir popup de autenticação 3DS
3. ✅ Aprovar autenticação
4. ✅ Confirmar pagamento

### 3. Teste de Falha
1. Usar `4000 0000 0000 0002`
2. ❌ Verificar mensagem de erro adequada
3. ✅ Permitir nova tentativa

### 4. Teste Brasileiro
1. Usar `4000 0007 6000 0002`
2. ✅ Confirmar processamento para BR

## 🔧 Configuração de Desenvolvimento

### Variáveis de Ambiente Necessárias
```bash
# Desenvolvimento
STRIPE_PUBLIC_KEY=pk_test_...
STRIPE_SECRET_KEY=sk_test_...
STRIPE_WEBHOOK_SECRET=whsec_...
NODE_ENV=development
```

### ⚠️ Avisos Importantes
- ❌ **NUNCA** usar cartões reais em teste
- ✅ **SEMPRE** usar chaves de teste (pk_test_, sk_test_)
- 🔒 **3D Secure obrigatório** para clientes europeus
- 📱 Testar tanto desktop quanto mobile

## 🛠 Debugging

### Console do Navegador
```javascript
// Verificar se Stripe está carregado
console.log(window.Stripe);

// Status do Payment Element
console.log('Stripe Elements initialized');
```

### Logs do Servidor
- Verificar webhooks em `/netlify/functions/stripe-webhook`
- Monitorar criação de Payment Intents
- Validar assinaturas de webhook

## 📞 Contatos para Problemas

### Stripe Dashboard
- **Teste**: https://dashboard.stripe.com/test/
- **Logs**: Payments → Logs
- **Webhooks**: Developers → Webhooks

### Documentação
- [Testing Stripe](https://docs.stripe.com/testing)
- [3D Secure](https://docs.stripe.com/payments/3d-secure)
- [Strong Customer Authentication](https://docs.stripe.com/strong-customer-authentication)

---

💡 **Dica**: Mantenha esta página aberta durante testes para referência rápida dos cartões.
const fs = require('fs');
const path = require('path');

// Load event data for contact information
const event = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../info/DATA_event.json'), 'utf8')
);

module.exports = {
  contact: {
    email: "support@cafecomvendas.com",
    whatsapp: {
      phone: event.payments.alternative.mbway.phone,
      contact: event.payments.alternative.mbway.contact
    }
  },
  
  privacyPolicy: {
    title: "Política de Privacidade",
    lastUpdated: "Agosto de 2024",
    sections: [
      {
        title: "1. Informações que Coletamos",
        content: "No evento Café com Vendas, coletamos apenas as informações necessárias para proporcionar a melhor experiência possível:",
        list: [
          "Nome e dados de contato para inscrição no evento",
          "Informações de pagamento (processadas seguramente via PayPal)",
          "Preferências alimentares e necessidades especiais",
          "Comunicações via WhatsApp para suporte"
        ]
      },
      {
        title: "2. Como Utilizamos suas Informações",
        content: "Utilizamos suas informações exclusivamente para:",
        list: [
          "Confirmar sua participação no evento",
          "Fornecer suporte e esclarecimentos",
          "Enviar materiais e atualizações relacionadas ao evento",
          "Melhorar nossa metodologia e futuras edições"
        ]
      },
      {
        title: "3. Proteção dos Dados",
        content: "Implementamos medidas de segurança adequadas para proteger suas informações pessoais contra acesso não autorizado, alteração, divulgação ou destruição."
      },
      {
        title: "4. Seus Direitos",
        content: "De acordo com o RGPD, você tem direito a:",
        list: [
          "Acessar seus dados pessoais",
          "Corrigir informações incorretas",
          "Solicitar a exclusão de seus dados",
          "Retirar o consentimento a qualquer momento"
        ]
      },
      {
        title: "5. Contato",
        content: "Para questões sobre esta política ou seus dados pessoais, entre em contato:",
        showContact: true
      }
    ]
  },

  termsConditions: {
    title: "Termos e Condições",
    lastUpdated: "Agosto de 2024",
    sections: [
      {
        title: "1. Sobre o Evento",
        content: `O Café com Vendas é um evento presencial de desenvolvimento de negócios que acontece em {{event.date.local}} em {{event.location.city}}, {{event.location.country}}. O evento tem duração de {{event.date.durationHours}} horas e é limitado a {{event.capacity.firstLot}} participantes.`
      },
      {
        title: "2. Inscrição e Pagamento",
        list: [
          "O pagamento pode ser realizado via PayPal ou MBWay",
          "A confirmação da vaga está sujeita à aprovação do pagamento",
          "As vagas são limitadas e preenchidas por ordem de pagamento",
          "O valor inclui todos os materiais, almoço e coquetel de encerramento"
        ]
      },
      {
        title: "3. Política de Cancelamento",
        content: null,
        highlight: {
          type: "warning",
          title: "Cancelamento até 7 dias antes:",
          content: "Reembolso de 100% do valor pago"
        },
        list: [
          "Cancelamento entre 3-7 dias antes: Reembolso de 50%",
          "Cancelamento com menos de 3 dias: Sem reembolso",
          "Em caso de força maior, analisaremos individualmente"
        ]
      },
      {
        title: "4. Garantia de Resultados",
        content: null,
        highlight: {
          type: "success",
          showGuarantee: true
        }
      },
      {
        title: "5. Propriedade Intelectual",
        content: "Todo o conteúdo apresentado durante o evento, incluindo metodologias, templates e materiais, são de propriedade exclusiva da Juçanã Maximiliano e protegidos por direitos autorais."
      },
      {
        title: "6. Código de Conduta",
        content: "Esperamos que todos os participantes mantenham um comportamento respeitoso e profissional. Reservamo-nos o direito de remover participantes que não cumpram este código."
      },
      {
        title: "7. Limitação de Responsabilidade",
        content: "Os resultados individuais podem variar. O sucesso na implementação das estratégias depende do esforço e dedicação de cada participante."
      },
      {
        title: "8. Contato",
        content: "Para questões sobre estes termos ou sobre o evento:",
        showContact: true
      }
    ]
  }
};
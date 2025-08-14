import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

// Load event data for contact information
const event = JSON.parse(
  fs.readFileSync(path.join(__dirname, '../../info/DATA_event.json'), 'utf8')
);

export default {
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
          "Informações de pagamento (processadas seguramente via Stripe)",
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
          "O pagamento pode ser realizado via Stripe ou MBWay",
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
  },

  guaranteeRefund: {
    title: "Garantia de Resultados e Política de Reembolso",
    lastUpdated: "Agosto de 2024",
    sections: [
      {
        title: "1. Nossa Garantia de Resultados",
        content: "No Café com Vendas, acreditamos tanto na eficácia do nosso método que oferecemos uma garantia única de resultados."
      },
      {
        title: "2. Condições da Garantia",
        content: null,
        highlight: {
          type: "success",
          showGuarantee: true
        }
      },
      {
        title: "3. Como Funciona a Garantia",
        content: "Para acionar a garantia, você deve:",
        list: [
          "Participar integralmente no evento presencial em {{event.date.local}}",
          "Implementar pelo menos 70% das estratégias apresentadas durante os 90 dias",
          "Documentar as ações tomadas e resultados obtidos",
          "Solicitar o reembolso dentro do prazo de 90 dias após o evento",
          "Fornecer evidências das implementações realizadas"
        ]
      },
      {
        title: "4. Política de Cancelamento e Reembolso",
        content: "Entendemos que imprevistos podem acontecer. Por isso, oferecemos as seguintes condições:",
        highlight: {
          type: "warning",
          title: "Cancelamento até 7 dias antes do evento:",
          content: "Reembolso de 100% do valor pago"
        },
        list: [
          "Cancelamento entre 3-7 dias antes: Reembolso de 50% do valor pago",
          "Cancelamento com menos de 3 dias: Sem reembolso",
          "Casos de força maior (doença, emergência familiar): Análise individual e possível transferência para próxima edição"
        ]
      },
      {
        title: "5. Processo de Reembolso",
        content: "Para solicitar um reembolso:",
        list: [
          "Entre em contato através do WhatsApp ou email",
          "Forneça os dados da compra (nome, data, valor)",
          "Explique o motivo da solicitação",
          "Aguarde análise (máximo 5 dias úteis)",
          "O reembolso será processado na mesma forma de pagamento original"
        ]
      },
      {
        title: "6. Exceções à Garantia",
        content: "A garantia não se aplica nos seguintes casos:",
        list: [
          "Não participação ou participação parcial no evento",
          "Falta de implementação das estratégias apresentadas",
          "Solicitação de reembolso após 90 dias do evento",
          "Circunstâncias externas que impeçam a aplicação do método (mudanças de mercado, questões legais específicas do negócio, etc.)"
        ]
      },
      {
        title: "7. Compromisso com o Resultado",
        content: "Nosso objetivo é o seu sucesso. Além da garantia financeira, oferecemos suporte contínuo durante os 90 dias para maximizar suas chances de alcançar os resultados desejados."
      },
      {
        title: "8. Contato para Garantia e Reembolsos",
        content: "Para questões sobre garantia ou solicitações de reembolso:",
        showContact: true
      }
    ]
  }
};
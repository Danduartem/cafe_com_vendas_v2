import type { FooterData } from './types.js';

/**
 * Load footer data
 * @returns Footer content and links
 */
export default function(): FooterData {
  return {
    stats: [
      {
        number: '20',
        label: 'Vagas Limitadas'
      },
      {
        number: '7',
        label: 'Horas Intensivas'
      },
      {
        date: '20/09',
        location: 'Lisboa'
      }
    ],
    brand: {
      name: 'Café com Vendas',
      tagline: 'Evento para Empreendedoras em Portugal',
      description: 'O encontro presencial que transforma empreendedoras sobrecarregadas em líderes estratégicas. Um dia de imersão para recuperar o seu tempo e multiplicar as vendas.',
      guarantee: '90 dias de garantia ou seu dinheiro de volta'
    },
    links: [
      { label: 'Política de Privacidade', url: '/politica-privacidade' },
      { label: 'Termos e Condições', url: '/termos-condicoes' },
      { label: 'Garantia e Reembolso', url: '/garantia-reembolso' }
    ],
    contact: {
      whatsapp: {
        url: 'https://wa.me/5547991253299?text=Olá!%20Tenho%20interesse%20no%20Café%20com%20Vendas%20e%20gostaria%20de%20tirar%20algumas%20dúvidas.'
      },
      email: {
        address: 'support@cafecomvendas.com'
      },
      social: [
        {
          platform: 'Instagram',
          url: 'https://instagram.com/jucanamaximiliano'
        }
      ]
    },
    organization: {
      name: 'Café com Vendas',
      description: 'Evento de estratégias de vendas para empreendedoras',
      url: 'https://cafecomvendas.com',
      logo: 'https://cafecomvendas.com/logo.png',
      phone: '+5547991253299',
      country: 'Portugal',
      city: 'Lisboa',
      founderName: 'Juçanã Maximiliano',
      founderTitle: 'Especialista em Vendas Estratégicas'
    },
    copyright: {
      year: new Date().getFullYear(),
      owner: 'Café com Vendas',
      text: 'Todos os direitos reservados'
    }
  };
}
import type { FooterData } from './types.js';

/**
 * Load footer data - align with template expectations and JSON structure
 * @returns Footer content and links
 */
export default function(): FooterData {
  return {
    stats: [
      {
        value: 8,
        label: 'Vagas Limitadas',
        counter: true
      },
      {
        value: 8,
        label: 'Horas Intensivas',
        counter: true
      },
      {
        value: '20 Set',
        label: 'Lisboa',
        counter: false
      }
    ],
    brand: {
      name: 'Café com Vendas',
      tagline: 'Método prático para empreendedoras',
      description: 'Transforme seu negócio em 20 de Setembro no evento mais exclusivo de Lisboa. Menos esforço, mais resultado — com método comprovado.',
      guarantee: 'Garantia 90 dias'
    },
    navigation: {
      legal: [
        { label: 'Política de Privacidade', url: '/politica-privacidade' },
        { label: 'Termos e Condições', url: '/termos-condicoes' },
        { label: 'Garantia e Reembolso', url: '/garantia-reembolso' }
      ]
    },
    contact: {
      whatsapp: {
        number: '+351935251983',
        message: 'Olá! Quero saber mais sobre o Café com Vendas em Lisboa.',
        url: 'https://wa.me/351935251983?text=Olá! Quero saber mais sobre o Café com Vendas em Lisboa.'
      },
      email: {
        address: 'support@cafecomvendas.com',
        url: 'mailto:support@cafecomvendas.com'
      },
      social: [
        {
          platform: 'Instagram',
          username: '@jucanamaximiliano',
          url: 'https://instagram.com/jucanamaximiliano'
        }
      ]
    },
    copyright: {
      year: '2024',
      owner: 'Juçanã Maximiliano',
      text: 'Todos os direitos reservados',
      madein: 'Feito com ❤️ em Portugal'
    },
    organization: {
      name: 'Juçanã Maximiliano',
      description: 'Mentora de negócios para empreendedoras em Portugal. Método prático para aumentar vendas trabalhando com mais inteligência.',
      url: 'https://cafecomvendas.com',
      logo: 'https://cafecomvendas.com/logo.png',
      phone: '+351935251983',
      city: 'Lisboa',
      country: 'Portugal',
      founderName: 'Juçanã Maximiliano',
      founderTitle: 'Business Mentor'
    }
  };
}
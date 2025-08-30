import type { PagesData } from '@app-types/sections/pages.js';

/**
 * Page metadata configuration
 * Section composition is now handled by sections.ts based on page context
 */
export default function(): PagesData {
  return {
    'landing': {
      route: '/',
      title: 'Café com Vendas - Evento para Empreendedoras em Portugal',
      description: 'Chega de usar o burnout como medalha de honra. O evento presencial e intimista que lhe dará o mapa para trocar o "trabalhar duro" pelo "trabalhar com inteligência".',
      layout: 'layout.njk',
      permalink: '/'
    },
    'thank-you': {
      route: '/thank-you',
      title: 'Obrigada pela sua inscrição - Café com Vendas',
      description: 'Confirmação da sua participação no Café com Vendas',
      layout: 'layout.njk',
      permalink: '/thank-you/'
    },
    'politica-privacidade': {
      route: '/politica-privacidade',
      title: 'Política de Privacidade - Café com Vendas',
      description: 'Política de privacidade do site Café com Vendas',
      layout: 'layout.njk',
      permalink: '/politica-privacidade/'
    },
    'termos-condicoes': {
      route: '/termos-condicoes',
      title: 'Termos e Condições - Café com Vendas',
      description: 'Termos e condições do site Café com Vendas',
      layout: 'layout.njk',
      permalink: '/termos-condicoes/'
    },
    'garantia-reembolso': {
      route: '/garantia-reembolso',
      title: 'Garantia de Reembolso - Café com Vendas',
      description: 'Política de garantia e reembolso do Café com Vendas',
      layout: 'layout.njk',
      permalink: '/garantia-reembolso/'
    }
  };
}
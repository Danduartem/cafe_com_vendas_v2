import type { PagesData } from '../types/sections/pages';

/**
 * Page compositions - consolidated from external JSON files
 * @returns Page configuration data
 */
export default function(): PagesData {
  return {
    'landing': {
      route: '/',
      title: 'Café com Vendas - Evento para Empreendedoras em Portugal',
      description: 'Chega de usar o burnout como medalha de honra. O evento presencial e intimista que lhe dará o mapa para trocar o "trabalhar duro" pelo "trabalhar com inteligência".',
      layout: 'layout.njk',
      permalink: '/',
      sections: [
        { slug: 'top-banner', variant: 'default', enabled: true },
        { slug: 'hero', variant: 'default', enabled: true },
        { slug: 'problem', variant: 'default', enabled: true },
        { slug: 'solution', variant: 'default', enabled: true },
        { slug: 'about', variant: 'default', enabled: true },
        { slug: 'social-proof', variant: 'video-testimonials', enabled: true },
        { slug: 'offer', variant: 'pricing', enabled: true },
        { slug: 'faq', variant: 'accordion', enabled: true },
        { slug: 'final-cta', variant: 'urgency', enabled: true },
        { slug: 'footer', variant: 'full', enabled: true }
      ]
    },
    'thank-you': {
      route: '/thank-you',
      title: 'Obrigada pela sua inscrição - Café com Vendas',
      description: 'Confirmação da sua participação no Café com Vendas',
      layout: 'layout.njk',
      permalink: '/thank-you/',
      sections: [
        { slug: 'thank-you-content', variant: 'default', enabled: true }
      ]
    },
    'legal-privacy': {
      route: '/politica-privacidade',
      title: 'Política de Privacidade - Café com Vendas',
      description: 'Política de privacidade do site Café com Vendas',
      layout: 'layout.njk',
      permalink: '/politica-privacidade/',
      sections: [
        { slug: 'footer', variant: 'minimal', enabled: true }
      ]
    }
  };
}
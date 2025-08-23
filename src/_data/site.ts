import type { SiteData } from '../types/data/site';

/**
 * Load site data - consolidated from external JSON
 * @returns Site metadata and configuration
 */
export default function(): SiteData {
  return {
    name: 'Café com Vendas',
    title: 'Café com Vendas - Evento para Empreendedoras em Portugal',
    description: "Chega de usar o burnout como medalha de honra. O evento presencial e intimista que lhe dará o mapa para trocar o 'trabalhar duro' pelo 'trabalhar com inteligência'. Para empreendedoras em Portugal que querem estratégia, leveza e liberdade nos seus negócios.",
    url: 'https://cafecomvendas.pt',
    baseUrl: 'https://cafecomvendas.pt',
    lang: 'pt-PT',
    locale: 'pt_PT',
    meta: {
      author: 'Café com Vendas',
      keywords: 'empreendedorismo feminino, vendas, estratégia de negócios, Portugal, Lisboa, networking, mentoria',
      twitterCard: 'summary_large_image'
    },
    contact: {
      whatsapp: '+351935251983',
      email: 'contato@cafecomvendas.pt'
    },
    analytics: {
      gtmId: 'GTM-T63QRLFT'
    },
    cloudinaryCloudName: 'ds4dhbneq'
  };
}
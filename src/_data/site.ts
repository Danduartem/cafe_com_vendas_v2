import type { SiteData } from './types.js';

/**
 * Load site data
 * @returns Site metadata and configuration
 */
export default function(): SiteData {
  return {
    title: "Café com Vendas - Evento para Empreendedoras em Portugal",
    description: "Chega de usar o burnout como medalha de honra. O evento presencial e intimista que lhe dará o mapa para trocar o 'trabalhar duro' pelo 'trabalhar com inteligência'. Para empreendedoras em Portugal que querem estratégia, leveza e liberdade nos seus negócios.",
    url: "https://cafecomvendas.com",
    baseUrl: "https://cafecomvendas.com",
    analytics: {
      gtmId: "GTM-XXXXXXX" // Replace with actual GTM ID when available
    }
  };
}
export default {
  name: 'Café com Vendas',
  title: 'Café com Vendas - Evento para Empreendedoras em Portugal',
  description: "Chega de usar o burnout como medalha de honra. O evento presencial e intimista que lhe dará o mapa para trocar o 'trabalhar duro' pelo 'trabalhar com inteligência'. Para empreendedoras em Portugal que querem estratégia, leveza e liberdade nos seus negócios.",
  url: process.env.URL || 'https://cafecomvendas.pt',
  lang: 'pt-PT',
  locale: 'pt_PT',

  meta: {
    author: 'Café com Vendas',
    keywords: 'empreendedorismo feminino, vendas, estratégia de negócios, Portugal, Lisboa, networking, mentoria',
    ogImage: '/assets/images/og-image.jpg',
    twitterCard: 'summary_large_image'
  },

  contact: {
    whatsapp: '+351935251983',
    email: 'contato@cafecomvendas.pt'
  },

  analytics: {
    // Google Tag Manager - Single source of truth for all tags
    gtmId: process.env.VITE_GTM_CONTAINER_ID || 'GTM-T63QRLFT'
  },

  // Cloudinary configuration for image optimization
  cloudinaryCloudName: process.env.CLOUDINARY_CLOUD_NAME || 'ds4dhbneq'
};
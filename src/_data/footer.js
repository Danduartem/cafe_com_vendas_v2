// Footer Data Layer - Loads footer-specific content and settings
const eventData = require('../../info/DATA_event.json');

module.exports = {
  // Stats section - pulled from event data
  stats: [
    {
      value: eventData.capacity.firstLot,
      label: "Vagas Limitadas",
      counter: true
    },
    {
      value: eventData.date.durationHours,
      label: "Horas Intensivas", 
      counter: true
    },
    {
      value: eventData.date.local,
      label: eventData.location.city,
      counter: false
    }
  ],

  // Brand information
  brand: {
    name: "Café com Vendas",
    tagline: "Método prático para empreendedoras",
    description: `Transforme seu negócio em ${eventData.date.local} no evento mais exclusivo de ${eventData.location.city}. Menos esforço, mais resultado — com método comprovado.`,
    guarantee: "Garantia 90 dias"
  },

  // Navigation links
  navigation: {
    legal: [
      {
        label: "Política de Privacidade",
        url: "/politica-privacidade"
      },
      {
        label: "Termos e Condições", 
        url: "/termos-condicoes"
      }
    ]
  },

  // Contact information
  contact: {
    whatsapp: {
      number: "+351935251983",
      message: "Olá! Quero saber mais sobre o Café com Vendas em Lisboa.",
      url: "https://wa.me/351935251983?text=Olá! Quero saber mais sobre o Café com Vendas em Lisboa."
    },
    email: {
      address: "support@cafecomvendas.com",
      url: "mailto:support@cafecomvendas.com"
    },
    social: [
      {
        platform: "Instagram",
        username: "@jucanamaximiliano", 
        url: "https://instagram.com/jucanamaximiliano"
      }
    ]
  },

  // Copyright information
  copyright: {
    year: "2024",
    owner: "Juçanã Maximiliano",
    text: "Todos os direitos reservados",
    madein: "Feito com ❤️ em Portugal"
  },

  // Organization schema data
  organization: {
    name: "Juçanã Maximiliano",
    description: "Mentora de negócios para empreendedoras em Portugal. Método prático para aumentar vendas trabalhando com mais inteligência.",
    url: "https://cafecomvendas.com",
    logo: "https://cafecomvendas.com/logo.png",
    phone: "+351935251983",
    city: eventData.location.city,
    country: eventData.location.country,
    founderName: "Juçanã Maximiliano",
    founderTitle: "Business Mentor"
  }
};
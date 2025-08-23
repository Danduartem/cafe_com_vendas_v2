/**
 * Consolidated site data - combines site metadata, event details, presenter info, and global strings
 * Replaces: site.ts, event.ts, presenter.ts, global.ts
 */
export default function() {
  return {
    // Site metadata
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
    analytics: {
      gtmId: 'GTM-T63QRLFT'
    },
    cloudinaryCloudName: 'ds4dhbneq',

    // Event information
    event: {
      title: 'Café com Vendas',
      subtitle: 'Evento para Empreendedoras em Portugal',
      date: '20 de Setembro',
      location: 'Lisboa, Portugal',
      venue: 'Mesa Corrida',
      duration: '7 horas',
      price: 180,
      description: 'Um encontro presencial e intimista em Portugal para reestruturar o seu negócio, recuperar o seu tempo e multiplicar as vendas — sem burnout, com método.',
      capacity: {
        firstLot: 20,
        totalCapacity: 20,
        limited_spots: 'Vagas limitadas'
      },
      payments: {
        alternative: {
          mbway: {
            phone: '+351935251983',
            instruction: 'Envie o pagamento de 180€ via MBWay para o número indicado. Após confirmação do pagamento, receberá por email os detalhes de acesso e localização do evento.'
          }
        }
      }
    },

    // Presenter information
    presenter: {
      name: 'Juçanã Maximiliano',
      subtitle: 'Criadora do Método Seja Livre',
      bio: 'Juçanã é estratega de negócios e fundadora do Café com Vendas. Ao longo de 7 anos, guiou empreendedoras de serviços, cursos e produtos digitais a simplificarem ofertas, aumentarem margens e criarem rotinas que libertam tempo. O seu enfoque é prático: clareza, oferta lucrativa, funil simples, operação automatizada e um plano de 90 dias para execução. A missão é clara: provar que é possível crescer com leveza — lucro e liberdade podem coexistir.',
      photoAlt: 'Juçanã Maximiliano — especialista em escalar negócios de empreendedoras',
      highlights: [
        '7 anos a escalar negócios femininos',
        'Especialista em simplificar ofertas complexas',
        'Criadora do Método Seja Livre',
        'Focada em resultados práticos e mensuráveis'
      ],
      microStory: 'Eu também acreditava que \'trabalhar duro\' era o único caminho. Até perceber que o meu negócio precisava de sistemas — não de mais horas. O Método nasceu dessa viragem.',
      social: {
        instagram: '@jucanamaximiliano'
      },
      schema: {
        '@context': 'https://schema.org',
        '@type': 'Person',
        name: 'Juçanã Maximiliano',
        jobTitle: 'Estratega de Negócios para Empreendedoras',
        url: 'https://cafecomvendas.pt',
        sameAs: [
          'https://www.instagram.com/jucanamaximiliano'
        ]
      }
    },

    // Contact information
    contact: {
      whatsapp: '+351935251983',
      email: 'contato@cafecomvendas.pt'
    },

    // Global strings and translations
    strings: {
      nav: {
        home: 'Início',
        about: 'Sobre',
        program: 'Programa',
        testimonials: 'Testemunhos',
        faq: 'FAQ',
        register: 'Inscrever-se'
      },
      common: {
        loading: 'A carregar...',
        error: 'Erro',
        success: 'Sucesso',
        close: 'Fechar',
        continue: 'Continuar',
        back: 'Voltar',
        next: 'Próximo',
        submit: 'Enviar',
        cancel: 'Cancelar'
      },
      legal: {
        privacy_policy: 'Política de Privacidade',
        terms_conditions: 'Termos e Condições',
        guarantee_terms: 'Termos da Garantia',
        refund_policy: 'Política de Reembolso'
      },
      contact: {
        whatsapp: 'WhatsApp',
        email: 'Email',
        phone: 'Telefone',
        address: 'Endereço'
      },
      currency: {
        symbol: '€',
        code: 'EUR'
      },
      time: {
        days: 'dias',
        hours: 'horas',
        minutes: 'minutos',
        seconds: 'segundos'
      }
    }
  };
}
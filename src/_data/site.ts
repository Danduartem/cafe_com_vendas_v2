/**
 * Consolidated site data - combines site metadata, event details, presenter info, and global strings
 * Replaces: site.ts, event.ts, presenter.ts, global.ts
 */
export default function () {
  return {
    // Site metadata
    name: 'Café com Vendas',
    title: 'Café com Vendas - Evento para Empreendedoras em Portugal',
    description: "Chega de usar o burnout como medalha de honra. O evento presencial e intimista que lhe dará o mapa para trocar o 'trabalhar duro' pelo 'trabalhar com inteligência'. Para empreendedoras em Portugal que querem estratégia, leveza e liberdade nos seus negócios.",
    url: 'https://jucanamaximiliano.com.br',
    baseUrl: 'https://jucanamaximiliano.com.br',
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
      name: 'Café com Vendas',
      date: {
        display: '4 de Outubro',
        local: '4 de Outubro'
      },
      location: {
        city: 'Lisboa, Portugal',
        venue: 'Mesa Corrida'
      },
      duration: '7 horas',
      description: 'Um encontro presencial e intimista em Portugal para reestruturar o seu negócio, recuperar o seu tempo e multiplicar as vendas — sem burnout, com método.',
      // 🎯 SINGLE SOURCE OF TRUTH FOR PRICING
      pricing: {
        basePrice: 180, // ← Change this one value to update ALL pricing
        currency: 'EUR',
        symbol: '€',
        tiers: [
          {
            id: 'early_bird',
            label: 'Inscrição Antecipada',
            price: 180, // Matches basePrice
            priceInCents: 18000, // For Stripe (basePrice * 100)
            notes: 'Vagas limitadas - Garanta já a sua!'
          }
        ]
      },
      capacity: {
        firstLot: 8,
        totalCapacity: 20,
        limited_spots: 'Vagas limitadas'
      },
      payments: {
        alternative: {
          mbway: {
            phone: '+351935251983',
            instruction: 'Avisar a Lari que o pagamento foi realizado para garantir a vaga.'
          }
        }
      },
      guarantee: {
        claim: 'GARANTIA EXTRA - 100% do Seu Dinheiro de Volta',
        policy: 'Acreditamos tanto no poder transformador do Café com Vendas que oferecemos uma garantia completa de 90 dias. Se, após participar do evento e aplicar tudo o que foi proposto, você não conseguir estruturar um método para trabalhar menos, faturar mais e aumentar suas vendas em pelo menos 20%, devolvemos 100% do valor investido, sem burocracia.Para ter acesso à garantia, basta:',
        requirements: [
          'Participar integralmente das 7 horas do evento',
          'Executar todas as atividades propostas no material de apoio',
          'Solicitar o reembolso em até 90 dias após o evento',
          'Justificativa clara dos motivos da insatisfação'
        ]
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
        url: 'https://jucanamaximiliano.com.br',
        sameAs: [
          'https://www.instagram.com/jucanamaximiliano'
        ]
      }
    },

    // Contact information
    contact: {
      whatsapp: '+5547991253299',
      email: 'contato@jucanamaximiliano.com.br'
    },

    // Legal pages content
    legal: {
      guaranteeRefund: {
        title: 'Garantia de Resultados e Política de Reembolso',
        lastUpdated: 'Janeiro 2025',
        sections: [
          {
            title: 'Nossa Garantia Incondicional de 90 Dias',
            content: '',
            highlight: {
              type: 'success',
              showGuarantee: true
            }
          },
          {
            title: 'Processo de Reembolso',
            content: 'O reembolso será processado no mesmo método de pagamento utilizado na compra, num prazo de até 10 dias úteis após aprovação.',
            showContact: true
          },

        ]
      },
      privacyPolicy: {
        title: 'Política de Privacidade',
        lastUpdated: 'Janeiro 2025',
        sections: [
          {
            title: 'Recolha e Utilização de Dados',
            content: 'Recolhemos apenas os dados pessoais necessários para a organização do evento, incluindo nome, email e informações de contacto para comunicação sobre o evento.'
          },
          {
            title: 'Proteção dos Seus Dados',
            content: 'Os seus dados pessoais são tratados com confidencialidade e segurança, sendo utilizados exclusivamente para fins relacionados com o evento Café com Vendas.',
            showContact: true
          }
        ]
      },
      termsConditions: {
        title: 'Termos e Condições',
        lastUpdated: 'Janeiro 2025',
        sections: [
          {
            title: 'Condições de Participação',
            content: 'A participação no evento Café com Vendas está sujeita à disponibilidade de vagas e ao pagamento antecipado da taxa de participação.'
          },
          {
            title: 'Política de Cancelamento',
            content: 'Cancelamentos devem ser comunicados por email. Aplicam-se diferentes condições conforme o prazo de antecedência.',
            showContact: true
          }
        ]
      }
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
import type {
  Section,
  HeroSection,
  TopBannerSection,
  ProblemSection,
  SolutionSection,
  AboutSection,
  SocialProofSection,
  OfferSection,
  FAQSection,
  FinalCTASection,
  FooterSection,
  ThankYouContentSection
} from '../types/sections';

/**
 * Design configurations for all sections
 * Consolidated from external design/components.json
 */
const designConfigs = {
  hero: {
    theme: 'dark' as const,
    accent: 'burgundy-700',
    background: 'navy-900/85',
    layout: 'fullscreen'
  },
  'top-banner': {
    theme: 'dark' as const,
    accent: 'gold-400',
    background: 'navy-900',
    layout: 'banner'
  },
  problem: {
    theme: 'light' as const,
    accent: 'burgundy-700',
    background: 'gradient-to-b from-neutral-50 via-peach-100 to-neutral-50',
    layout: 'two-column'
  },
  solution: {
    theme: 'light' as const,
    accent: 'burgundy-700',
    background: 'gradient-to-br from-neutral-50 via-white to-peach-100/30',
    layout: 'pillars-grid'
  },
  about: {
    theme: 'light' as const,
    accent: 'burgundy-600',
    background: 'neutral-50',
    layout: 'two-column'
  },
  'social-proof': {
    theme: 'light' as const,
    accent: 'gold-400',
    background: 'gradient-to-br from-peach-50 to-neutral-100',
    layout: 'carousel'
  },
  offer: {
    theme: 'light' as const,
    accent: 'burgundy-600',
    background: 'gradient-to-br from-neutral-50 via-white to-neutral-100',
    layout: 'pricing-card'
  },
  faq: {
    theme: 'light' as const,
    accent: 'gold-500',
    background: 'neutral-50',
    layout: 'accordion'
  },
  'final-cta': {
    theme: 'dark' as const,
    accent: 'gold-400',
    background: 'gradient-to-br from-navy-900 to-burgundy-900',
    layout: 'centered'
  },
  footer: {
    theme: 'dark' as const,
    accent: 'gold-400',
    background: 'navy-900',
    layout: 'full-footer'
  },
  'thank-you-content': {
    theme: 'light' as const,
    accent: 'burgundy-600',
    background: 'gradient-to-b from-neutral-50 via-white to-neutral-50/30',
    layout: 'centered'
  }
} as const;

/**
 * All section data consolidated from external JSON files
 * This replaces the need for external content/pt-PT/sections/ files
 */
const sectionData: Record<string, Section> = {
  'top-banner': {
    id: 'top-banner',
    variant: 'default',
    enabled: true,
    copy: {
      headline: 'Vagas Limitadas',
      message: 'Última oportunidade para garantir a sua transformação empresarial'
    },
    design: designConfigs['top-banner'],
    tracking: {
      section_id: 'top-banner',
      impression_event: 'top_banner_view'
    }
  } as TopBannerSection,

  hero: {
    id: 'hero',
    variant: 'default',
    enabled: true,
    copy: {
      eyebrow: 'Evento íntimo em Lisboa',
      headline: 'Menos Esforço. Mais Lucro.',
      subhead: 'O mapa para a empreendedora que se recusa a escolher entre sucesso e liberdade.',
      description: 'Um encontro presencial e intimista em Portugal para reestruturar o seu negócio, recuperar o seu tempo e multiplicar as vendas — sem burnout, com método. Um dia de imersão estratégica, ferramentas accionáveis e um plano de 90 dias para implementar mudanças reais.',
      cta: {
        primary: {
          label: 'Garantir a minha vaga',
          href: '#checkout',
          variant: 'gradient'
        },
        secondary: {
          label: 'Quero saber mais', 
          href: '#problema',
          variant: 'link'
        }
      },
      badge: {
        date: '20 de Setembro',
        location: 'Lisboa, Portugal',
        venue: 'Mesa Corrida'
      },
      notice: 'Vagas limitadas — sessão com capacidade reduzida para garantir transformação.'
    },
    media: {
      background: 'pictures/cafe.jpg',
      alt: 'Café com Vendas em Lisboa'
    },
    design: designConfigs.hero,
    tracking: {
      section_id: 'hero',
      impression_event: 'hero_view',
      cta_events: {
        primary: 'click_hero_cta',
        secondary: 'click_hero_secondary'
      }
    }
  } as unknown as HeroSection,

  problem: {
    id: 'problem',
    variant: 'default',
    enabled: true,
    copy: {
      eyebrow: 'O problema que você vive',
      headline: 'O seu dia parece uma lista infinita de tarefas que nunca tem fim?',
      description: 'Trabalha 12h por dia e continua com a sensação de que nada muda. Anda a apagar fogos, sem espaço para estratégia — e o "trabalhar duro" transforma‑se numa rota sem saída. O resultado é previsível: exaustão, decisões reativas e um negócio que não escala.',
      highlights: [
        '12h por dia',
        'trabalhar duro'
      ],
      pain_points: [
        'Sem tempo para pensar em crescimento — o dia a dia consome tudo.',
        'Muitos clientes, pouca margem — o lucro desaparece entre entregas apressadas.',
        'Sente que tudo depende de si — a equipa não assume responsabilidade suficiente.'
      ],
      cta: {
        label: 'Descobrir a solução',
        href: '#s-solution',
        variant: 'gradient'
      }
    },
    media: {
      image: 'problem-overworked_p5ntju',
      alt: 'Empreendedora exausta trabalhando tarde da noite com pilhas de papéis e múltiplas telas — simbolizando sobrecarga',
      aspect_ratio: '1.618/1'
    },
    design: designConfigs.problem,
    tracking: {
      section_id: 'problem',
      impression_event: 'problem_view',
      cta_event: 'click_problem_cta'
    }
  } as ProblemSection,

  solution: {
    id: 'solution',
    variant: 'default',
    enabled: true,
    copy: {
      eyebrow: 'O Sistema Comprovado',
      headline: 'Método Seja Livre',
      subhead: 'Apresentamos o',
      description: 'No Café com Vendas não damos "dicas". Implementamos um sistema completo que transforma o seu funcionamento operacional e a forma como vende. Cada pilar resolve uma dor crítica — da mentalidade ao lucro — para que o seu negócio trabalhe para si.',
      pillars: [
        {
          number: '01',
          title: 'Clareza Estratégica',
          description: 'Simplifique a oferta: menos serviços, mais margem. Resultado: decisões mais rápidas e maior foco.',
          icon: 'strategy',
          analytics_event: 'hover_pillar_clareza',
          animation_delay: '0.1s'
        },
        {
          number: '02',
          title: 'Oferta Lucrativa',
          description: 'Reestruture preços e pacotes para vender mais por cliente, não para trabalhar mais horas.',
          icon: 'profit',
          analytics_event: 'hover_pillar_oferta',
          animation_delay: '0.2s'
        },
        {
          number: '03',
          title: 'Fluxo de Vendas Simples',
          description: 'Um funil prático e repetível que converte sem promessas milagrosas.',
          icon: 'funnel',
          analytics_event: 'hover_pillar_fluxo',
          animation_delay: '0.3s'
        },
        {
          number: '04',
          title: 'Operação Automatizada',
          description: 'Ferramentas e rotinas que tiram o trabalho mecânico do seu dia.',
          icon: 'automation',
          analytics_event: 'hover_pillar_operacao',
          animation_delay: '0.4s'
        },
        {
          number: '05',
          title: 'Plano de 90 Dias',
          description: 'A aplicação concreta: o que fazer exatamente nas próximas 12 semanas para ver resultados.',
          icon: 'calendar',
          analytics_event: 'hover_pillar_plano',
          animation_delay: '0.5s'
        }
      ],
      cta: {
        label: 'Quero conhecer os 5 pilares em detalhe',
        href: '#checkout',
        variant: 'gradient'
      },
      supporting_text: 'Cada pilar será aprofundado durante o evento — exemplos práticos, templates e uma folha de ação.',
      trust_indicators: [
        '90 dias de garantia',
        'Apenas 20 vagas'
      ]
    },
    design: designConfigs.solution,
    tracking: {
      section_id: 'solution',
      impression_event: 'solution_view',
      cta_event: 'click_solution_cta'
    }
  } as SolutionSection,

  about: {
    id: 'about',
    variant: 'default',
    enabled: true,
    copy: {
      eyebrow: 'Quem vai guiar sua transformação',
      headline: 'Quem é a Juçanã Maximiliano?',
      subhead: 'Criadora do Método Seja Livre, ajuda mulheres a vender mais, trabalhar menos e recuperar a sua vida — sem burnout, com método.',
      bio: 'Juçanã é estratega de negócios e fundadora do Café com Vendas. Ao longo de 7 anos, guiou empreendedoras de serviços, cursos e produtos digitais a simplificarem ofertas, aumentarem margens e criarem rotinas que libertam tempo. O seu enfoque é prático: clareza, oferta lucrativa, funil simples, operação automatizada e um plano de 90 dias para execução. A missão é clara: provar que é possível crescer com leveza — lucro e liberdade podem coexistir.',
      micro_story: 'Eu também acreditava que \'trabalhar duro\' era o único caminho. Até perceber que o meu negócio precisava de sistemas — não de mais horas. O Método nasceu dessa viragem.',
      highlights: [
        '7 anos a escalar negócios femininos',
        'Especialista em simplificar ofertas complexas',
        'Criadora do Método Seja Livre',
        'Focada em resultados práticos e mensuráveis'
      ],
      social: {
        instagram: {
          url: 'https://www.instagram.com/jucanamaximiliano',
          handle: '@jucanamaximiliano'
        }
      }
    },
    media: {
      image: 'sobre3_pnikcv',
      alt: 'Juçanã Maximiliano — especialista em escalar negócios de empreendedoras',
      aspect_ratio: '4/5'
    },
    design: designConfigs.about,
    tracking: {
      section_id: 'about',
      impression_event: 'about_view',
      cta_event: 'click_about_checkout_cta',
      social_event: 'click_about_instagram'
    },
    schema: {
      '@context': 'https://schema.org',
      '@type': 'Person',
      name: 'Juçanã Maximiliano',
      jobTitle: 'Estratega de Negócios para Empreendedoras',
      description: 'Criadora do Método Seja Livre. Ajuda empreendedoras a vender mais e trabalhar menos, com sistemas e um plano de 90 dias.',
      image: 'https://res.cloudinary.com/ds4dhbneq/image/upload/w_600,h_800,c_fill,q_auto,f_auto,g_auto,dpr_auto/jucana-maximiliano',
      url: 'https://cafecomvendas.com',
      sameAs: [
        'https://www.instagram.com/jucanamaximiliano'
      ],
      worksFor: {
        '@type': 'Organization',
        name: 'Café com Vendas'
      }
    }
  } as AboutSection,

  'social-proof': {
    id: 'social-proof',
    variant: 'video-testimonials',
    enabled: true,
    copy: {
      eyebrow: 'O que dizem as participantes',
      headline: 'Elas vieram pela estratégia. Ficaram pela transformação.',
      subhead: 'Histórias reais de empreendedoras que escolheram o mapa para a liberdade',
      footer_text: 'Junte-se às empreendedoras que já transformaram os seus negócios',
      cta: {
        label: 'Ver como o método funciona',
        href: '#offer',
        variant: 'gradient'
      }
    },
    design: designConfigs['social-proof'],
    testimonials: [
      {
        id: 1,
        name: 'Ana Castro',
        profession: 'Terapeuta',
        location: 'Lisboa',
        result: '+10h/semana e +30% ticket médio',
        video_id: 'ddKv1irzSvk',
        thumbnail: 'https://res.cloudinary.com/ds4dhbneq/image/fetch/w_384,h_216,c_fill,q_auto,f_auto/https%3A//img.youtube.com/vi/ddKv1irzSvk/maxresdefault.jpg'
      },
      {
        id: 2,
        name: 'Mariana Lopes',
        profession: 'Consultora',
        location: 'Porto',
        result: 'Funil que converte em 90 dias',
        video_id: 'dQw4w9WgXcQ',
        thumbnail: 'https://res.cloudinary.com/ds4dhbneq/image/fetch/w_384,h_216,c_fill,q_auto,f_auto/https%3A//img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      },
      {
        id: 3,
        name: 'Rita Alves',
        profession: 'Esteticista',
        location: 'Braga',
        result: 'Resultados em 2 semanas',
        video_id: 'dQw4w9WgXcQ',
        thumbnail: 'https://res.cloudinary.com/ds4dhbneq/image/fetch/w_384,h_216,c_fill,q_auto,f_auto/https%3A//img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      },
      {
        id: 4,
        name: 'Sofia Mendes',
        profession: 'Coach',
        location: 'Coimbra',
        result: 'Dobrei as vendas em 3 meses',
        video_id: 'dQw4w9WgXcQ',
        thumbnail: 'https://res.cloudinary.com/ds4dhbneq/image/fetch/w_384,h_216,c_fill,q_auto,f_auto/https%3A//img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      },
      {
        id: 5,
        name: 'Catarina Silva',
        profession: 'Designer',
        location: 'Faro',
        result: 'Finalmente tenho tempo livre',
        video_id: 'dQw4w9WgXcQ',
        thumbnail: 'https://res.cloudinary.com/ds4dhbneq/image/fetch/w_384,h_216,c_fill,q_auto,f_auto/https%3A//img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      },
      {
        id: 6,
        name: 'Isabel Ferreira',
        profession: 'Nutricionista',
        location: 'Aveiro',
        result: 'Processo de vendas automatizado',
        video_id: 'dQw4w9WgXcQ',
        thumbnail: 'https://res.cloudinary.com/ds4dhbneq/image/fetch/w_384,h_216,c_fill,q_auto,f_auto/https%3A//img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      },
      {
        id: 7,
        name: 'Joana Rodrigues',
        profession: 'Advogada',
        location: 'Viseu',
        result: 'Clareza total na estratégia',
        video_id: 'dQw4w9WgXcQ',
        thumbnail: 'https://res.cloudinary.com/ds4dhbneq/image/fetch/w_384,h_216,c_fill,q_auto,f_auto/https%3A//img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      },
      {
        id: 8,
        name: 'Patrícia Nunes',
        profession: 'Psicóloga',
        location: 'Setúbal',
        result: 'Trabalho 4 dias por semana',
        video_id: 'dQw4w9WgXcQ',
        thumbnail: 'https://res.cloudinary.com/ds4dhbneq/image/fetch/w_384,h_216,c_fill,q_auto,f_auto/https%3A//img.youtube.com/vi/dQw4w9WgXcQ/maxresdefault.jpg'
      }
    ],
    tracking: {
      section_id: 'social-proof',
      impression_event: 'social_proof_view',
      video_event: 'play_testimonial_video',
      navigation_events: {
        prev: 'carousel_prev_testimonials',
        next: 'carousel_next_testimonials'
      },
      cta_event: 'click_testimonials_cta'
    }
  } as SocialProofSection,

  offer: {
    id: 'offer',
    variant: 'pricing',
    enabled: true,
    copy: {
      eyebrow: 'Sua transformação começa aqui',
      headline: 'O seu lugar na mesa está à sua espera',
      subhead: 'Isto é mais do que um evento: é um ponto de viragem.',
      description: 'Um dia inteiro de imersão estratégica, material de apoio prático, almoço de networking e acesso a um plano de ação de 90 dias. Ambiente exclusivo para apenas 20 empreendedoras',
      pricing: {
        first_lot: {
          label: 'Primeiro lote • 25% desconto',
          original_price: 240,
          discounted_price: 180,
          currency: 'EUR',
          capacity: 8,
          bonuses: [
            'Pingente delicado banhado a ouro',
            'Presentes especiais edição Lisboa',
            'Assento VIP'
          ]
        },
        second_lot: {
          label: 'Segundo lote',
          price: 240,
          currency: 'EUR',
          capacity: 12
        }
      },
      includes: [
        '7 horas de conteúdo prático',
        'Roundtable de networking e cocriação',
        'Ambiente intimista na Mesa Corrida',
        'Fotos profissionais (instagramáveis)',
        'Suporte via WhatsApp após o evento',
        'Clube do livro após o evento',
        'Plano de ação claro e aplicável',
        'Acesso aos 5 pilares da mentoria Seja Livre',
        'Cronograma de 90 dias',
        'Material de apoio (Trello)',
        'Acesso com desconto ao treinamento Expresso',
        'Almoço com sobremesa e bebidas',
        'Coquetel especial de encerramento'
      ],
      guarantee: {
        type: 'performance',
        claim: 'Aumento de pelo menos 20% nas vendas',
        period: '90 dias',
        policy: 'Se aplicar o método e todas as atividades propostas e não aumentar as vendas em pelo menos 20%, reembolsamos o valor do convite.'
      },
      cta: {
        label: 'Garantir minha vaga no primeiro lote',
        href: '#checkout',
        variant: 'gradient'
      }
    },
    design: designConfigs.offer,
    tracking: {
      section_id: 'offer',
      impression_event: 'offer_view',
      cta_event: 'click_offer_cta'
    }
  } as OfferSection,

  faq: {
    id: 'faq',
    variant: 'accordion',
    enabled: true,
    copy: {
      eyebrow: 'Tire suas dúvidas',
      headline: 'Perguntas Frequentes',
      subhead: 'Todas as dúvidas que você pode ter sobre esta experiência transformadora'
    },
    design: designConfigs.faq,
    contact: {
      whatsapp_url: 'https://wa.me/5547991253299',
      whatsapp_name: 'Lari',
      whatsapp_phone: '+55 47 99125-3299',
      response_time: 'Resposta em até 2 horas'
    },
    legal_links: [
      {
        text: 'Termos da Garantia',
        url: '/garantia-reembolso'
      },
      {
        text: 'Política de Reembolso',
        url: '/garantia-reembolso'
      },
      {
        text: 'Privacidade',
        url: '/politica-privacidade'
      }
    ],
    tracking: {
      section_id: 'faq',
      impression_event: 'faq_view'
    },
    items: [
      {
        id: 'business-type',
        question: 'Para que tipo de negócio é este evento?',
        answer: {
          main_text: 'Para empreendedoras com produto/serviço validado que querem estruturar oferta, melhorar margens e automatizar vendas.',
          highlight: 'Ideal para: Negócios de serviços, cursos e produtos digitais com foco em escala sustentável'
        },
        analytics_event: 'open_faq_business_type',
        upvote_count: 15
      },
      {
        id: 'time-justification',
        question: 'Não tenho mesmo tempo. Como justificar um dia fora?',
        answer: {
          main_text: 'O investimento de um dia traz frameworks accionáveis que devolvem horas semanais e aumentam receita.',
          highlights: [
            'Templates prontos e plano de 90 dias',
            'Recupere horas semanais + aumente receita'
          ]
        },
        analytics_event: 'open_faq_time_justification',
        upvote_count: 22
      },
      {
        id: 'guarantee',
        question: 'E se eu não gostar ou não tiver resultados?',
        answer: {
          main_text: 'A nossa Garantia de Resultados cobre o seu investimento: aplique o método e, se em 90 dias não houver <strong>+20% nas vendas</strong>, devolvemos o valor.',
          features: [
            '90 dias para aplicar e ver resultados',
            'Reembolso total se não aumentar 20% nas vendas',
            'Processo simples com condições claras e justas'
          ]
        },
        analytics_event: 'open_faq_guarantee',
        is_special: true,
        special_badge: 'GARANTIA',
        upvote_count: 31
      },
      {
        id: 'about-jucana',
        question: 'Quem é a Juçanã Maximiliano?',
        answer: {
          main_text: 'Especialista em scaling para empreendedoras, coach de negócios e fundadora do método prático que já transformou centenas de negócios.'
        },
        analytics_event: 'open_faq_about_jucana',
        upvote_count: 18
      },
      {
        id: 'what-included',
        question: 'O que exatamente está incluído no evento?',
        answer: {
          main_text: 'Um dia completo de conteúdo prático, material de apoio, networking e follow-up de 90 dias.',
          highlights: [
            '7 horas de imersão estratégica',
            'Plano de ação personalizado de 90 dias',
            'Acesso a templates e ferramentas',
            'Almoço e networking com outras empreendedoras',
            'Suporte via WhatsApp após o evento'
          ]
        },
        analytics_event: 'open_faq_included',
        upvote_count: 25
      }
    ]
  } as FAQSection,

  'final-cta': {
    id: 'final-cta',
    variant: 'urgency',
    enabled: true,
    copy: {
      eyebrow: 'Última chamada',
      headline: 'O momento é agora',
      subhead: 'As vagas do primeiro lote estão quase esgotadas',
      description: 'Este é o seu convite para parar de adiar a sua liberdade. Para transformar o "um dia" em "20 de setembro". Apenas 8 vagas com desconto especial.',
      urgency_points: [
        'Apenas 8 vagas no primeiro lote',
        '25% de desconto + brindes exclusivos',
        'Garantia de 90 dias',
        'Evento único em Lisboa'
      ],
      cta: {
        label: 'Sim, quero garantir minha vaga agora',
        href: '#checkout',
        variant: 'gradient-large'
      },
      alternative_cta: {
        label: 'Ainda tenho dúvidas',
        href: '#faq',
        variant: 'link'
      }
    },
    design: designConfigs['final-cta'],
    tracking: {
      section_id: 'final-cta',
      impression_event: 'final_cta_view',
      cta_event: 'click_final_cta',
      alternative_cta_event: 'click_final_cta_alternative'
    }
  } as FinalCTASection,

  footer: {
    id: 'footer',
    variant: 'full',
    enabled: true,
    copy: {
      headline: '',
      stats: [
        {
          value: 20,
          label: 'Vagas Limitadas',
          counter: true
        },
        {
          value: 8,
          label: 'Horas Intensivas',
          counter: true
        },
        {
          value: '15 Fev',
          label: 'Lisboa',
          counter: false
        }
      ],
      brand: {
        name: 'Café com Vendas',
        tagline: 'Método prático para empreendedoras',
        description: 'Transforme seu negócio em 15 de Fevereiro no evento mais exclusivo de Lisboa. Menos esforço, mais resultado — com método comprovado.',
        guarantee: 'Garantia 90 dias'
      },
      navigation: {
        legal: [
          {
            label: 'Política de Privacidade',
            url: '/politica-privacidade'
          },
          {
            label: 'Termos e Condições',
            url: '/termos-condicoes'
          },
          {
            label: 'Garantia e Reembolso',
            url: '/garantia-reembolso'
          }
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
    },
    copyright: {
      year: 2024,
      owner: 'Juçanã Maximiliano',
      text: 'Todos os direitos reservados'
    },
    design: designConfigs.footer,
    tracking: {
      section_id: 'footer',
      impression_event: 'footer_view'
    }
  } as FooterSection,

  'thank-you-content': {
    id: 'thank-you-content',
    variant: 'default',
    enabled: true,
    copy: {
      headline: '',
      badge: {
        text: 'Pagamento confirmado'
      },
      header: {
        title: 'Falta só <em class="italic text-burgundy-600 font-black">um</em> passo<br class="hidden sm:block"/>\n        <span class="text-navy-700">para garantir a sua experiência</span>',
        subtitle: 'Agora precisamos de algumas informações rápidas para personalizar a sua participação.\n        <span class="font-semibold text-navy-700">Você receberá um email com todos os detalhes em minutos.</span>'
      },
      progress: {
        label: 'Progresso',
        percentage: '80%',
        value: 80,
        message: 'Quase lá — complete o formulário em apenas 2 minutos'
      },
      mainAction: {
        stepNumber: '1',
        title: 'Complete o formulário complementar',
        description: 'Precisamos confirmar detalhes práticos (contatos, restrições e preferências) para preparar tudo para você.',
        button: {
          text: 'Completar formulário agora',
          url: 'https://formspree.io/f/xanbnrvp',
          analytics: 'cta_complete_form'
        }
      },
      steps: [
        {
          number: '2',
          color: 'burgundy',
          title: 'Verifique o seu email',
          description: 'Enviámos a confirmação com detalhes do evento e próximos passos. Verifique também "Promoções" ou "Spam" se não encontrar em 5 minutos.'
        },
        {
          number: '3',
          color: 'burgundy',
          title: 'Adicione ao calendário',
          description: 'Garanta que não vai esquecer — salve a data agora.',
          button: {
            text: 'Adicionar ao calendário',
            url: '/assets/evento.ics',
            classes: 'inline-flex items-center gap-2 px-4 py-2 text-sm font-semibold text-burgundy-700 bg-burgundy-50 hover:bg-burgundy-100 rounded-xl transition-colors duration-200',
            analytics: 'add_to_calendar',
            icon: '<svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">\n                    <path stroke-linecap="round" stroke-linejoin="round" d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />\n                  </svg>'
          }
        }
      ],
      eventSummary: {
        title: 'Café com Vendas',
        subtitle: 'Edição Portugal • 20 Setembro',
        features: [
          '<span class="font-semibold">Ambiente intimista</span> com conteúdo prático para vender mais trabalhando melhor',
          '<span class="font-semibold">Email confirmado</span> com instruções completas em minutos',
          '<span class="font-semibold">Suporte dedicado</span> via WhatsApp para qualquer dúvida'
        ],
        important: '<span class="font-bold text-burgundy-700">Importante:</span> Complete o formulário agora para garantir o seu lugar. Os detalhes do local serão enviados após o preenchimento.'
      }
    },
    design: designConfigs['thank-you-content'],
    tracking: {
      section_id: 'thankyou',
      impression_event: 'thankyou_view',
      cta_events: {
        complete_form: 'click_complete_form',
        add_to_calendar: 'click_add_calendar',
        contact_whatsapp: 'click_whatsapp_thankyou'
      }
    }
  } as ThankYouContentSection
};

/**
 * Get section data by slug
 * @param slug Section identifier
 * @returns Section data with design configurations merged
 */
export function getSection(slug: string): Section | null {
  return sectionData[slug] || null;
}

/**
 * Get all available section slugs
 * @returns Array of section identifiers
 */
export function getSectionSlugs(): string[] {
  return Object.keys(sectionData);
}

/**
 * Check if a section exists and is enabled
 * @param slug Section identifier
 * @returns Whether section exists and is enabled
 */
export function isSectionEnabled(slug: string): boolean {
  const section = sectionData[slug];
  return section?.enabled ?? false;
}

/**
 * Default export for Eleventy compatibility
 * @returns All section data
 */
export default function(): Record<string, Section> {
  return sectionData;
}
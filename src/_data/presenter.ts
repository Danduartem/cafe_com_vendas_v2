import type { PresenterData } from '../types/data/presenter';

/**
 * Presenter data - consolidated from external JSON
 * @returns Presenter information
 */
export default function(): PresenterData {
  return {
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
  };
}
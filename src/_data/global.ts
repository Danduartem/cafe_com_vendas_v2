import type { GlobalStrings } from '../types/data/content';

/**
 * Global strings for the site - consolidated from external JSON
 * @returns Global strings for the site
 */
export default function(): GlobalStrings {
  return {
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
    event: {
      date: '20 de Setembro',
      location: 'Lisboa, Portugal',
      venue: 'Mesa Corrida',
      duration: '7 horas',
      capacity: '20 vagas',
      limited_spots: 'Vagas limitadas'
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
  };
}
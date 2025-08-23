import type { EventData } from './types.js';

/**
 * Event data - consolidated from external JSON
 * @returns Event information
 */
export default function(): EventData {
  return {
    title: 'Café com Vendas',
    subtitle: 'Evento para Empreendedoras em Portugal',
    date: '20 de Setembro',
    location: 'Lisboa, Portugal',
    price: 180,
    description: 'Um encontro presencial e intimista em Portugal para reestruturar o seu negócio, recuperar o seu tempo e multiplicar as vendas — sem burnout, com método.',
    payments: {
      alternative: {
        mbway: {
          phone: '+351935251983',
          instruction: 'Envie o pagamento de 180€ via MBWay para o número indicado. Após confirmação do pagamento, receberá por email os detalhes de acesso e localização do evento.'
        }
      }
    },
    capacity: {
      firstLot: 20,
      totalCapacity: 20
    }
  };
}
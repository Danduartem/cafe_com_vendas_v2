import type { PillarsData } from './types.js';

/**
 * Load pillars data
 * @returns Pillars and solution methodology data
 */
export default function(): PillarsData {
  return {
    title: "Método Seja Livre",
    subtitle: "OS 5 PILARES",
    description: "No Café com Vendas não damos 'dicas'. Implementamos um sistema completo que transforma o seu funcionamento operacional e a forma como vende. Cada pilar resolve uma dor crítica — da mentalidade ao lucro — para que o seu negócio trabalhe para si.",
    pillars: [
      {
        number: "1",
        title: "Mentalidade Estratégica",
        description: "Transforme a cultura do 'fazer tudo' em decisões estratégicas. Aprenda a priorizar o que realmente gera resultado e elimine as tarefas que consomem energia sem retorno.",
        icon: "brain",
        animationDelay: "100ms",
        analyticsEvent: "click_pillar_1_mindset"
      },
      {
        number: "2", 
        title: "Processos Escaláveis",
        description: "Crie sistemas que funcionam sem a sua presença constante. Automatize fluxos de trabalho e delegue com segurança para que o negócio cresça de forma sustentável.",
        icon: "cogs",
        animationDelay: "200ms",
        analyticsEvent: "click_pillar_2_processes"
      },
      {
        number: "3",
        title: "Precificação Inteligente",
        description: "Defina preços que refletem o verdadeiro valor do seu trabalho. Estratégias comprovadas para aumentar margens sem perder clientes e vender com confiança.",
        icon: "calculator",
        animationDelay: "300ms", 
        analyticsEvent: "click_pillar_3_pricing"
      },
      {
        number: "4",
        title: "Vendas Consistentes",
        description: "Construa um funil de vendas previsível que gera resultados constantes. Técnicas de conversão e relacionamento que transformam prospects em clientes fiéis.",
        icon: "trending-up",
        animationDelay: "400ms",
        analyticsEvent: "click_pillar_4_sales"
      },
      {
        number: "5",
        title: "Liberdade Financeira",
        description: "Alcance a independência financeira verdadeira com um negócio que gera renda passiva. Estratégias de investimento e diversificação de receitas para o longo prazo.",
        icon: "dollar-sign",
        animationDelay: "500ms",
        analyticsEvent: "click_pillar_5_freedom"
      }
    ]
  };
}
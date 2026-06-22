// Static marketing content: pricing plans, testimonials and FAQ.
// Centralised here so the landing, pricing and demo pages stay in sync.

export interface Plan {
  id: string;
  name: string;
  priceMonthly: number;
  tagline: string;
  highlight?: boolean;
  features: string[];
  cta: string;
}

export const PLANS: Plan[] = [
  {
    id: "starter",
    name: "Starter",
    priceMonthly: 0,
    tagline: "Para começar a vender online hoje.",
    features: [
      "Catálogo e carrinho",
      "Até 50 pedidos/mês",
      "1 usuário admin",
      "Pagamento via Stripe",
      "Suporte por e-mail",
    ],
    cta: "Começar grátis",
  },
  {
    id: "pro",
    name: "Pro",
    priceMonthly: 97,
    tagline: "Para negócios em crescimento.",
    highlight: true,
    features: [
      "Tudo do Starter",
      "Pedidos ilimitados",
      "IA OrderFlow (insights e previsões)",
      "Cupons e promoções",
      "Programa de indicação",
      "E-mails transacionais",
    ],
    cta: "Testar 14 dias grátis",
  },
  {
    id: "scale",
    name: "Scale",
    priceMonthly: 297,
    tagline: "Para operações que escalam.",
    features: [
      "Tudo do Pro",
      "Múltiplas lojas",
      "Programa de afiliados",
      "Automação de WhatsApp",
      "Métricas de crescimento avançadas",
      "Suporte prioritário",
    ],
    cta: "Falar com vendas",
  },
];

export interface Testimonial {
  name: string;
  role: string;
  quote: string;
  initials: string;
}

export const TESTIMONIALS: Testimonial[] = [
  {
    name: "Marina Souza",
    role: "Dona — Café da Esquina",
    quote:
      "Em 2 meses no OrderFlow aumentei 38% nas vendas. Os insights de IA me mostram o que repor antes de faltar.",
    initials: "MS",
  },
  {
    name: "Rafael Lima",
    role: "Fundador — Lima Acessórios",
    quote:
      "Os cupons e o programa de indicação trouxeram clientes novos sem eu gastar com anúncio. Valeu cada centavo.",
    initials: "RL",
  },
  {
    name: "Patrícia Gomes",
    role: "Gerente — Verde Natural",
    quote:
      "Migramos de uma planilha para o OrderFlow e o controle de estoque parou de dar dor de cabeça. Recomendo.",
    initials: "PG",
  },
];

export interface Faq {
  q: string;
  a: string;
}

export const FAQ: Faq[] = [
  {
    q: "Preciso de cartão de crédito para testar?",
    a: "Não. Você cria sua conta e testa o plano Pro por 14 dias sem cartão.",
  },
  {
    q: "Posso cancelar quando quiser?",
    a: "Sim, sem multa e sem fidelidade. Você controla tudo pelo painel.",
  },
  {
    q: "A IA usa alguma API paga?",
    a: "Não. A OrderFlow Intelligence roda localmente, sem custo extra e sem enviar seus dados para fora.",
  },
  {
    q: "Funciona para o meu tipo de negócio?",
    a: "Sim. O OrderFlow atende pequenos e médios negócios de e-commerce e venda direta.",
  },
];

export const SOCIAL_PROOF_STATS = [
  { value: "+1.200", label: "negócios atendidos" },
  { value: "38%", label: "aumento médio em vendas" },
  { value: "4.9/5", label: "avaliação dos clientes" },
  { value: "99,9%", label: "disponibilidade" },
];

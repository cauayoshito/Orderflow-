import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";
import { PricingCards } from "@/components/PricingCards";
import { FAQ, SOCIAL_PROOF_STATS, TESTIMONIALS } from "@/lib/marketing";

export const metadata: Metadata = {
  title: "OrderFlow — venda mais com gestão inteligente",
  description:
    "Plataforma completa de pedidos para o seu negócio: catálogo, checkout, IA de gestão, cupons e indicação. Teste grátis por 14 dias.",
};

export default function LandingPage() {
  return (
    <div className="space-y-20">
      {/* Hero */}
      <section className="rounded-2xl bg-gradient-to-br from-slate-900 via-indigo-950 to-slate-900 px-6 py-16 text-center sm:px-12 sm:py-24">
        <span className="inline-flex items-center rounded-full border border-indigo-500/20 bg-indigo-500/10 px-3 py-1 text-xs font-medium text-indigo-300">
          14 dias grátis · sem cartão de crédito
        </span>
        <h1 className="font-display mx-auto mt-6 max-w-3xl text-4xl font-bold leading-tight text-white sm:text-5xl">
          Venda mais e gerencie seu negócio com inteligência
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg text-slate-400">
          Catálogo, checkout, controle de estoque e uma IA que mostra o que vender, repor e
          promover — tudo em um só lugar.
        </p>
        <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="/register?plan=pro" className="btn btn-primary px-8">
            Começar teste grátis
          </a>
          <a href="/demo" className="btn btn-secondary px-8">
            Ver demonstração
          </a>
        </div>
      </section>

      {/* Prova social — números */}
      <section className="grid grid-cols-2 gap-6 text-center md:grid-cols-4">
        {SOCIAL_PROOF_STATS.map((s) => (
          <div key={s.label}>
            <p className="font-display text-3xl font-bold text-brand-600">{s.value}</p>
            <p className="mt-1 text-sm text-slate-500">{s.label}</p>
          </div>
        ))}
      </section>

      {/* Benefícios */}
      <section>
        <h2 className="text-center font-display text-3xl font-bold">Tudo para crescer sem complicação</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {[
            { icon: "🧠", title: "IA de gestão", desc: "Insights de vendas, previsão de estoque e detecção de quedas — sem API paga." },
            { icon: "🏷️", title: "Cupons e promoções", desc: "Crie descontos por % ou valor fixo e aumente a conversão." },
            { icon: "🤝", title: "Indique e ganhe", desc: "Programa de indicação e afiliados para crescer no boca a boca." },
            { icon: "💳", title: "Checkout com Stripe", desc: "Pagamentos seguros e confirmação automática de pedidos." },
            { icon: "📦", title: "Estoque em tempo real", desc: "Acompanhe pedidos e estoque ao vivo, sem planilhas." },
            { icon: "📈", title: "Métricas de crescimento", desc: "Leads, conversão e indicações em um painel só." },
          ].map((b) => (
            <div key={b.title} className="card p-6">
              <div className="text-3xl">{b.icon}</div>
              <h3 className="mt-3 font-semibold">{b.title}</h3>
              <p className="mt-1 text-sm text-slate-500">{b.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Depoimentos */}
      <section>
        <h2 className="text-center font-display text-3xl font-bold">Quem usa, recomenda</h2>
        <div className="mt-10 grid grid-cols-1 gap-6 md:grid-cols-3">
          {TESTIMONIALS.map((t) => (
            <figure key={t.name} className="card p-6">
              <blockquote className="text-sm text-slate-700">“{t.quote}”</blockquote>
              <figcaption className="mt-4 flex items-center gap-3">
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-brand-100 font-semibold text-brand-700">
                  {t.initials}
                </span>
                <span>
                  <span className="block text-sm font-semibold">{t.name}</span>
                  <span className="block text-xs text-slate-500">{t.role}</span>
                </span>
              </figcaption>
            </figure>
          ))}
        </div>
      </section>

      {/* Planos */}
      <section>
        <h2 className="text-center font-display text-3xl font-bold">Planos que cabem no seu momento</h2>
        <p className="mt-2 text-center text-slate-500">Comece de graça e evolua quando precisar.</p>
        <div className="mt-10">
          <PricingCards />
        </div>
      </section>

      {/* Captura de lead + FAQ */}
      <section className="grid grid-cols-1 gap-10 lg:grid-cols-2">
        <div className="card p-6">
          <h2 className="font-display text-2xl font-bold">Receba uma demonstração</h2>
          <p className="mt-1 text-sm text-slate-500">
            Deixe seu contato e mostramos como o OrderFlow se encaixa no seu negócio.
          </p>
          <div className="mt-4">
            <LeadForm source="landing" planInterest="pro" withPhone ctaLabel="Quero uma demonstração" />
          </div>
        </div>
        <div>
          <h2 className="font-display text-2xl font-bold">Perguntas frequentes</h2>
          <div className="mt-4 space-y-4">
            {FAQ.map((f) => (
              <div key={f.q} className="card p-4">
                <p className="font-semibold">{f.q}</p>
                <p className="mt-1 text-sm text-slate-500">{f.a}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA final */}
      <section className="rounded-2xl bg-brand-600 px-6 py-14 text-center text-white">
        <h2 className="font-display text-3xl font-bold">Pronto para vender mais?</h2>
        <p className="mx-auto mt-2 max-w-xl text-brand-100">
          Crie sua conta em minutos e teste o plano Pro por 14 dias, sem cartão.
        </p>
        <a href="/register?plan=pro" className="btn mt-6 inline-block bg-white px-8 text-brand-700 hover:bg-slate-100">
          Começar agora
        </a>
      </section>
    </div>
  );
}

import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Demonstração — OrderFlow",
  description: "Veja o OrderFlow em ação: loja, painel administrativo e IA de gestão.",
};

const STEPS = [
  {
    title: "1. Loja pronta para vender",
    desc: "Catálogo, carrinho e checkout com Stripe. Seu cliente compra em poucos cliques.",
    href: "/loja",
    cta: "Abrir a loja demo",
  },
  {
    title: "2. Painel administrativo",
    desc: "Acompanhe pedidos, estoque e métricas em tempo real. Login demo: admin / admin123.",
    href: "/admin",
    cta: "Abrir o painel",
  },
  {
    title: "3. Inteligência OrderFlow",
    desc: "Insights de vendas, previsão de reposição, queda de vendas e clientes recorrentes.",
    href: "/admin",
    cta: "Ver insights",
  },
  {
    title: "4. Crescimento",
    desc: "Cupons, programa de indicação e métricas de leads e conversão.",
    href: "/admin/growth",
    cta: "Ver crescimento",
  },
];

export default function DemoPage() {
  return (
    <div className="space-y-12">
      <section className="text-center">
        <h1 className="font-display text-4xl font-bold">Veja o OrderFlow em ação</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500">
          Explore a demonstração interativa abaixo ou peça uma demonstração guiada com nossa equipe.
        </p>
        <div className="mt-6 flex flex-col items-center justify-center gap-3 sm:flex-row">
          <a href="/loja" className="btn btn-primary px-8">Explorar a loja</a>
          <a href="/register?plan=pro" className="btn btn-secondary px-8">Criar conta grátis</a>
        </div>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-2">
        {STEPS.map((s) => (
          <div key={s.title} className="card flex flex-col p-6">
            <h3 className="font-semibold">{s.title}</h3>
            <p className="mt-1 flex-1 text-sm text-slate-500">{s.desc}</p>
            <a href={s.href} className="btn btn-secondary mt-4 w-fit">
              {s.cta}
            </a>
          </div>
        ))}
      </section>

      <section className="rounded-2xl bg-slate-50 p-8">
        <div className="mx-auto max-w-md text-center">
          <h2 className="font-display text-2xl font-bold">Quer uma demonstração guiada?</h2>
          <p className="mt-1 text-sm text-slate-500">
            Deixe seu contato e mostramos o OrderFlow aplicado ao seu negócio.
          </p>
          <div className="mt-6 text-left">
            <LeadForm source="demo" planInterest="pro" withPhone ctaLabel="Agendar demonstração" />
          </div>
        </div>
      </section>
    </div>
  );
}

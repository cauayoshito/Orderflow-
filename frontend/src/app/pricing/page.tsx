import type { Metadata } from "next";
import { PricingCards } from "@/components/PricingCards";
import { FAQ } from "@/lib/marketing";

export const metadata: Metadata = {
  title: "Planos e preços — OrderFlow",
  description:
    "Escolha o plano ideal para o seu negócio. Comece grátis e evolua conforme você cresce. Sem fidelidade.",
};

export default function PricingPage() {
  return (
    <div className="space-y-16">
      <section className="text-center">
        <h1 className="font-display text-4xl font-bold">Planos e preços</h1>
        <p className="mx-auto mt-3 max-w-2xl text-slate-500">
          Transparente e sem surpresas. Comece de graça, faça upgrade quando precisar e cancele
          quando quiser.
        </p>
      </section>

      <section>
        <PricingCards />
      </section>

      <section className="rounded-2xl bg-slate-50 p-8 text-center">
        <h2 className="font-display text-2xl font-bold">Comparação rápida</h2>
        <div className="mx-auto mt-6 max-w-3xl overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead>
              <tr className="border-b text-slate-500">
                <th className="py-2">Recurso</th>
                <th className="py-2 text-center">Starter</th>
                <th className="py-2 text-center">Pro</th>
                <th className="py-2 text-center">Scale</th>
              </tr>
            </thead>
            <tbody>
              {[
                ["Pedidos", "50/mês", "Ilimitado", "Ilimitado"],
                ["IA OrderFlow", "—", "✓", "✓"],
                ["Cupons & promoções", "—", "✓", "✓"],
                ["Indique e ganhe", "—", "✓", "✓"],
                ["Afiliados & WhatsApp", "—", "—", "✓"],
                ["Múltiplas lojas", "—", "—", "✓"],
              ].map((row) => (
                <tr key={row[0]} className="border-b last:border-0">
                  <td className="py-2 font-medium">{row[0]}</td>
                  <td className="py-2 text-center">{row[1]}</td>
                  <td className="py-2 text-center">{row[2]}</td>
                  <td className="py-2 text-center">{row[3]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section>
        <h2 className="text-center font-display text-2xl font-bold">Perguntas frequentes</h2>
        <div className="mx-auto mt-6 grid max-w-3xl grid-cols-1 gap-4">
          {FAQ.map((f) => (
            <div key={f.q} className="card p-4">
              <p className="font-semibold">{f.q}</p>
              <p className="mt-1 text-sm text-slate-500">{f.a}</p>
            </div>
          ))}
        </div>
      </section>
    </div>
  );
}

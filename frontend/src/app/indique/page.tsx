import type { Metadata } from "next";
import { LeadForm } from "@/components/LeadForm";

export const metadata: Metadata = {
  title: "Indique e ganhe — OrderFlow",
  description:
    "Indique o OrderFlow para outros negócios e ganhe recompensas a cada novo cliente que assinar.",
};

export default function ReferralPage() {
  return (
    <div className="space-y-12">
      <section className="rounded-2xl bg-gradient-to-br from-emerald-600 to-teal-700 px-6 py-16 text-center text-white sm:px-12">
        <h1 className="font-display text-4xl font-bold">Indique e ganhe 🤝</h1>
        <p className="mx-auto mt-3 max-w-xl text-emerald-50">
          Compartilhe o OrderFlow com outros lojistas. A cada indicação que vira cliente, você
          ganha recompensas — e o indicado começa com um desconto especial.
        </p>
      </section>

      <section className="grid grid-cols-1 gap-6 md:grid-cols-3">
        {[
          { icon: "1️⃣", title: "Cadastre-se", desc: "Deixe seu e-mail e receba seu link único de indicação." },
          { icon: "2️⃣", title: "Compartilhe", desc: "Envie seu link para outros negócios por WhatsApp e redes." },
          { icon: "3️⃣", title: "Ganhe", desc: "A cada indicação que assina, você acumula recompensas." },
        ].map((s) => (
          <div key={s.title} className="card p-6 text-center">
            <div className="text-3xl">{s.icon}</div>
            <h3 className="mt-2 font-semibold">{s.title}</h3>
            <p className="mt-1 text-sm text-slate-500">{s.desc}</p>
          </div>
        ))}
      </section>

      <section className="mx-auto max-w-md">
        <div className="card p-6">
          <h2 className="font-display text-2xl font-bold">Gere seu link de indicação</h2>
          <p className="mt-1 text-sm text-slate-500">
            É grátis. Você recebe um link exclusivo para compartilhar.
          </p>
          <div className="mt-4">
            <LeadForm
              source="referral"
              showReferral
              withPhone
              ctaLabel="Gerar meu link"
            />
          </div>
        </div>
      </section>
    </div>
  );
}

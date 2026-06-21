import { PLANS } from "@/lib/marketing";
import { formatCurrency } from "@/lib/api";

/**
 * Pricing grid reused by the landing and pricing pages. Each CTA routes to
 * registration carrying the plan, so the funnel and analytics can attribute it.
 */
export function PricingCards() {
  return (
    <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
      {PLANS.map((plan) => (
        <div
          key={plan.id}
          className={`flex flex-col rounded-2xl border p-6 ${
            plan.highlight
              ? "border-brand-500 bg-white shadow-lg ring-2 ring-brand-500"
              : "border-slate-200 bg-white"
          }`}
        >
          {plan.highlight && (
            <span className="mb-2 inline-block w-fit rounded-full bg-brand-600 px-3 py-1 text-xs font-semibold text-white">
              Mais popular
            </span>
          )}
          <h3 className="font-display text-xl font-bold">{plan.name}</h3>
          <p className="mt-1 text-sm text-slate-500">{plan.tagline}</p>
          <div className="mt-4">
            <span className="text-3xl font-bold">
              {plan.priceMonthly === 0 ? "Grátis" : formatCurrency(plan.priceMonthly)}
            </span>
            {plan.priceMonthly > 0 && <span className="text-slate-500">/mês</span>}
          </div>
          <ul className="mt-6 flex-1 space-y-2 text-sm">
            {plan.features.map((f) => (
              <li key={f} className="flex items-start gap-2">
                <span className="text-emerald-500">✓</span>
                <span>{f}</span>
              </li>
            ))}
          </ul>
          <a
            href={`/register?plan=${plan.id}`}
            className={`btn mt-6 w-full text-center ${plan.highlight ? "btn-primary" : "btn-secondary"}`}
          >
            {plan.cta}
          </a>
        </div>
      ))}
    </div>
  );
}

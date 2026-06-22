"use client";

import { useState } from "react";
import { api } from "@/lib/api";
import { trackEvent } from "@/components/Analytics";
import type { LeadResponse } from "@/lib/types";

interface LeadFormProps {
  source: string;
  planInterest?: string;
  /** Show the phone field (useful for sales-qualified leads). */
  withPhone?: boolean;
  /** Show the captured referral code after submit (referral landing). */
  showReferral?: boolean;
  ctaLabel?: string;
  className?: string;
}

/**
 * Reusable lead-capture form. Posts to the public /api/public/leads endpoint,
 * fires an analytics "Lead" event and shows a thank-you state. When
 * showReferral is set it surfaces the lead's referral link for "indique e ganhe".
 */
export function LeadForm({
  source,
  planInterest,
  withPhone = false,
  showReferral = false,
  ctaLabel = "Quero testar grátis",
  className = "",
}: LeadFormProps) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState<LeadResponse | null>(null);

  function referredByCode(): string | undefined {
    if (typeof window === "undefined") return undefined;
    const ref = new URLSearchParams(window.location.search).get("ref");
    return ref ?? undefined;
  }

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const lead = await api.createLead({
        name,
        email,
        phone: withPhone ? phone : undefined,
        source,
        planInterest,
        referredByCode: referredByCode(),
      });
      setDone(lead);
      trackEvent("Lead", { source, plan: planInterest });
    } catch (err: any) {
      setError(err.message ?? "Não foi possível enviar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  }

  if (done) {
    const referralUrl =
      typeof window !== "undefined"
        ? `${window.location.origin}/indique?ref=${done.referralCode}`
        : `/indique?ref=${done.referralCode}`;
    return (
      <div className={`rounded-xl border border-emerald-200 bg-emerald-50 p-5 ${className}`}>
        <p className="font-semibold text-emerald-800">🎉 Recebemos seu cadastro, {done.name.split(" ")[0]}!</p>
        <p className="mt-1 text-sm text-emerald-700">
          Em breve nossa equipe entra em contato. Enquanto isso, dê o primeiro passo abaixo.
        </p>
        {showReferral && (
          <div className="mt-4 rounded-lg bg-white p-3">
            <p className="text-xs font-medium uppercase tracking-wide text-slate-400">
              Seu link de indicação
            </p>
            <div className="mt-1 flex items-center gap-2">
              <code className="flex-1 truncate rounded bg-slate-100 px-2 py-1 text-sm">{referralUrl}</code>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigator.clipboard?.writeText(referralUrl)}
              >
                Copiar
              </button>
            </div>
            <a
              className="mt-2 inline-block text-sm text-emerald-700 underline"
              href={`https://wa.me/?text=${encodeURIComponent(
                `Conheça o OrderFlow e ganhe vantagens: ${referralUrl}`,
              )}`}
              target="_blank"
              rel="noreferrer"
            >
              Compartilhar no WhatsApp
            </a>
          </div>
        )}
        <a href="/register" className="btn btn-primary mt-4 inline-block">
          Criar minha conta
        </a>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className={`space-y-3 ${className}`}>
      <div>
        <label className="label" htmlFor="lead-name">Nome</label>
        <input
          id="lead-name"
          className="input"
          value={name}
          onChange={(e) => setName(e.target.value)}
          required
          placeholder="Seu nome"
        />
      </div>
      <div>
        <label className="label" htmlFor="lead-email">E-mail</label>
        <input
          id="lead-email"
          type="email"
          className="input"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          required
          placeholder="voce@empresa.com"
        />
      </div>
      {withPhone && (
        <div>
          <label className="label" htmlFor="lead-phone">WhatsApp</label>
          <input
            id="lead-phone"
            className="input"
            value={phone}
            onChange={(e) => setPhone(e.target.value)}
            placeholder="(11) 99999-9999"
          />
        </div>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={loading} className="btn btn-primary w-full">
        {loading ? "Enviando…" : ctaLabel}
      </button>
      <p className="text-center text-xs text-slate-400">
        Sem cartão de crédito. Cancele quando quiser.
      </p>
    </form>
  );
}

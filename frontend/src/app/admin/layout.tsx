"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useEffect } from "react";
import { useAuth } from "@/context/AuthContext";

const TABS = [
  { href: "/admin", label: "Dashboard" },
  { href: "/admin/products", label: "Produtos" },
  { href: "/admin/orders", label: "Pedidos" },
  { href: "/admin/growth", label: "Crescimento" },
];

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const { user, isAdmin, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (loading) return;
    if (!user) router.replace("/login?next=/admin");
    else if (!isAdmin) router.replace("/loja");
  }, [loading, user, isAdmin, router]);

  if (loading || !user || !isAdmin) {
    return <p className="text-slate-500">Verificando acesso…</p>;
  }

  return (
    <div>
      <div className="mb-6">
        <h1 className="text-2xl font-bold">Painel administrativo</h1>
        <nav className="mt-4 flex gap-2 border-b border-slate-200">
          {TABS.map((tab) => {
            const active = pathname === tab.href;
            return (
              <Link
                key={tab.href}
                href={tab.href}
                className={`-mb-px border-b-2 px-4 py-2 text-sm font-medium ${
                  active
                    ? "border-brand-600 text-brand-700"
                    : "border-transparent text-slate-500 hover:text-slate-700"
                }`}
              >
                {tab.label}
              </Link>
            );
          })}
        </nav>
      </div>
      {children}
    </div>
  );
}

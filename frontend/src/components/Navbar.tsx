"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useState } from "react";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";

function CartIcon() {
  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      fill="none"
      viewBox="0 0 24 24"
      strokeWidth={1.5}
      stroke="currentColor"
      className="h-5 w-5 text-brand-600"
    >
      <path
        strokeLinecap="round"
        strokeLinejoin="round"
        d="M2.25 3h1.386c.51 0 .955.343 1.087.835l.383 1.437M7.5 14.25a3 3 0 00-3 3h15.75m-12.75-3h11.218c1.121-2.3 2.1-4.684 2.924-7.138a60.114 60.114 0 00-16.536-1.84M7.5 14.25L5.106 5.272M6 20.25a.75.75 0 11-1.5 0 .75.75 0 011.5 0zm12.75 0a.75.75 0 11-1.5 0 .75.75 0 011.5 0z"
      />
    </svg>
  );
}

export function Navbar() {
  const { user, isAdmin, logout } = useAuth();
  const { count } = useCart();
  const router = useRouter();
  const pathname = usePathname();
  const [menuOpen, setMenuOpen] = useState(false);

  function handleLogout() {
    logout();
    router.push("/");
  }

  function linkClass(href: string) {
    return pathname === href
      ? "text-sm text-indigo-700 font-medium"
      : "text-sm text-slate-600 hover:text-brand-700";
  }

  const links = (
    <>
      <Link href="/pricing" className={linkClass("/pricing")} onClick={() => setMenuOpen(false)}>
        Planos
      </Link>

      <Link href="/demo" className={linkClass("/demo")} onClick={() => setMenuOpen(false)}>
        Demonstração
      </Link>

      <Link href="/loja" className={linkClass("/loja")} onClick={() => setMenuOpen(false)}>
        Loja
      </Link>

      <Link
        href="/cart"
        className={`relative ${linkClass("/cart")}`}
        onClick={() => setMenuOpen(false)}
      >
        Carrinho
        {count > 0 && (
          <span className="ml-1 rounded-full bg-brand-600 px-1.5 py-0.5 text-xs font-semibold text-white">
            {count}
          </span>
        )}
      </Link>

      {user && (
        <Link href="/orders" className={linkClass("/orders")} onClick={() => setMenuOpen(false)}>
          Meus pedidos
        </Link>
      )}

      {isAdmin && (
        <Link
          href="/admin"
          className={
            pathname === "/admin"
              ? "text-sm font-medium text-indigo-700"
              : "text-sm font-medium text-brand-700 hover:underline"
          }
          onClick={() => setMenuOpen(false)}
        >
          Admin
        </Link>
      )}
    </>
  );

  const authActions = user ? (
    <div className="flex items-center gap-2">
      <span className="hidden text-sm text-slate-500 sm:inline">Olá, {user.username}</span>
      <button onClick={handleLogout} className="btn-secondary py-1.5">
        Sair
      </button>
    </div>
  ) : (
    <div className="flex items-center gap-2">
      <Link href="/login" className="btn-secondary py-1.5" onClick={() => setMenuOpen(false)}>
        Entrar
      </Link>
      <Link href="/register" className="btn-primary py-1.5" onClick={() => setMenuOpen(false)}>
        Criar conta
      </Link>
    </div>
  );

  return (
    <header className="sticky top-0 z-50 border-b border-slate-200 bg-white/95 backdrop-blur-sm">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-4 py-3">
        <Link href="/" className="flex items-center gap-2 text-brand-700">
          <CartIcon />
          <span className="font-display font-bold">OrderFlow</span>
          <span className="hidden text-slate-400 sm:inline">Commerce Cloud</span>
        </Link>

        <div className="hidden items-center gap-4 sm:flex">
          {links}
          {authActions}
        </div>

        <button
          onClick={() => setMenuOpen((open) => !open)}
          className="rounded-lg p-2 text-slate-600 hover:bg-slate-100 sm:hidden"
          aria-label="Abrir menu"
          aria-expanded={menuOpen}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="h-6 w-6"
          >
            {menuOpen ? (
              <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
            ) : (
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3.75 6.75h16.5M3.75 12h16.5m-16.5 5.25h16.5"
              />
            )}
          </svg>
        </button>
      </nav>

      {menuOpen && (
        <div className="flex flex-col gap-4 border-t border-slate-200 px-4 py-4 sm:hidden">
          {links}
          {authActions}
        </div>
      )}
    </header>
  );
}

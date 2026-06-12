"use client";

import { useState } from "react";
import { formatCurrency } from "@/lib/api";
import { useCart } from "@/context/CartContext";
import type { Product } from "@/lib/types";

export function ProductCard({ product }: { product: Product }) {
  const { add } = useCart();
  const [added, setAdded] = useState(false);
  const outOfStock = product.stockQuantity <= 0;

  function handleAdd() {
    add(product, 1);
    setAdded(true);
    setTimeout(() => setAdded(false), 1200);
  }

  return (
    <div className="card animate-fade-in flex flex-col p-4 transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md">
      <div className="mb-3 flex h-28 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-50 to-slate-100">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          fill="none"
          viewBox="0 0 24 24"
          strokeWidth={1.5}
          stroke="currentColor"
          className="h-10 w-10 text-indigo-300"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            d="M20.25 7.5l-.625 10.632a2.25 2.25 0 01-2.247 2.118H6.622a2.25 2.25 0 01-2.247-2.118L3.75 7.5M10 11.25h4M3.375 7.5h17.25c.621 0 1.125-.504 1.125-1.125v-1.5c0-.621-.504-1.125-1.125-1.125H3.375c-.621 0-1.125.504-1.125 1.125v1.5c0 .621.504 1.125 1.125 1.125z"
          />
        </svg>
      </div>
      <h3 className="font-semibold text-slate-900">{product.name}</h3>
      <p className="mt-1 line-clamp-2 flex-1 text-sm text-slate-500">{product.description}</p>
      <div className="mt-3 flex items-center justify-between">
        <span className="text-xl font-bold text-indigo-700">{formatCurrency(product.price)}</span>
        {outOfStock ? (
          <span className="badge bg-red-100 text-red-700">Esgotado</span>
        ) : (
          <span className="badge bg-emerald-100 text-emerald-700">{product.stockQuantity} em estoque</span>
        )}
      </div>
      <button
        onClick={handleAdd}
        disabled={outOfStock}
        className="btn-primary mt-3 w-full"
      >
        {added ? "Adicionado ✓" : "Adicionar ao carrinho"}
      </button>
    </div>
  );
}

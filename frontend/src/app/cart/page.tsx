"use client";

import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { formatCurrency } from "@/lib/api";

export default function CartPage() {
  const { lines, total, setQuantity, remove } = useCart();

  if (lines.length === 0) {
    return (
      <div className="mx-auto max-w-2xl text-center">
        <h1 className="text-2xl font-bold">Seu carrinho está vazio</h1>
        <p className="mt-2 text-slate-500">Adicione produtos do catálogo para começar.</p>
        <Link href="/loja" className="btn-primary mt-6">
          Ver catálogo
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl">
      <h1 className="mb-6 text-2xl font-bold">Carrinho</h1>

      <div className="card divide-y divide-slate-100">
        {lines.map((line) => (
          <div key={line.product.id} className="flex items-center gap-4 p-4">
            <div className="flex h-14 w-14 items-center justify-center rounded-lg bg-slate-100 text-2xl">
              📦
            </div>
            <div className="flex-1">
              <p className="font-medium">{line.product.name}</p>
              <p className="text-sm text-slate-500">{formatCurrency(line.product.price)}</p>
            </div>
            <input
              type="number"
              min={1}
              max={line.product.stockQuantity}
              value={line.quantity}
              onChange={(e) => setQuantity(line.product.id, Number(e.target.value))}
              className="input w-20"
            />
            <div className="w-24 text-right font-semibold">
              {formatCurrency(line.product.price * line.quantity)}
            </div>
            <button onClick={() => remove(line.product.id)} className="text-sm text-red-600 hover:underline">
              Remover
            </button>
          </div>
        ))}
      </div>

      <div className="mt-6 flex items-center justify-between">
        <span className="text-lg font-semibold">Total: {formatCurrency(total)}</span>
        <Link href="/checkout" className="btn-primary">
          Ir para o checkout
        </Link>
      </div>
    </div>
  );
}

"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/context/AuthContext";

export default function LoginPage() {
  const { login } = useAuth();
  const router = useRouter();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      await login(username, password);
      const next = new URLSearchParams(window.location.search).get("next") || "/loja";
      router.push(next);
    } catch (err: any) {
      setError(err.message || "Falha ao entrar.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <div className="card p-6">
        <h1 className="text-2xl font-bold">Entrar</h1>
        <p className="mt-1 text-sm text-slate-500">
          Use suas credenciais. Admin de demonstração: <code>admin</code> / <code>admin123</code>.
        </p>

        <form onSubmit={onSubmit} className="mt-6 space-y-4">
          <div>
            <label className="label">Usuário</label>
            <input
              className="input"
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              autoComplete="username"
              required
            />
          </div>
          <div>
            <label className="label">Senha</label>
            <input
              className="input"
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              autoComplete="current-password"
              required
            />
          </div>

          {error && <p className="text-sm text-red-600">{error}</p>}

          <button className="btn-primary w-full" disabled={loading}>
            {loading ? "Entrando…" : "Entrar"}
          </button>
        </form>

        <p className="mt-4 text-center text-sm text-slate-500">
          Não tem conta?{" "}
          <Link href="/register" className="font-medium text-brand-700 hover:underline">
            Criar conta
          </Link>
        </p>
      </div>
    </div>
  );
}

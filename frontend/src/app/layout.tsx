import type { Metadata } from "next";
import { Inter, Sora } from "next/font/google";
import "./globals.css";
import { AuthProvider } from "@/context/AuthContext";
import { CartProvider } from "@/context/CartContext";
import { Navbar } from "@/components/Navbar";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });
const sora = Sora({ subsets: ["latin"], weight: ["600", "700"], variable: "--font-sora" });

export const metadata: Metadata = {
  title: "OrderFlow Commerce Cloud",
  description: "Plataforma de pedidos para pequenos negócios — catálogo, carrinho, pedidos e painel admin com IA.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR" className={`${inter.variable} ${sora.variable}`}>
      <body className="font-sans">
        <AuthProvider>
          <CartProvider>
            <Navbar />
            <main className="mx-auto w-full max-w-6xl px-4 py-8">{children}</main>
            <footer className="bg-slate-900 py-12 text-slate-400">
              <div className="mx-auto w-full max-w-6xl px-4">
                <div className="grid grid-cols-1 gap-8 sm:grid-cols-2">
                  <div>
                    <p className="font-display text-lg font-semibold text-white">
                      OrderFlow Commerce Cloud
                    </p>
                    <p className="mt-2 text-sm">
                      Commerce em tempo real, potencializado por IA própria — Spring Boot,
                      Next.js e OrderFlow Intelligence (Python).
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 text-sm sm:items-end">
                    <a
                      href="https://github.com/cauayoshito/aceba"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-white"
                    >
                      GitHub
                    </a>
                    <a
                      href="http://localhost:8080/swagger-ui.html"
                      target="_blank"
                      rel="noreferrer"
                      className="hover:text-white"
                    >
                      Swagger Docs
                    </a>
                  </div>
                </div>
                <p className="mt-10 border-t border-slate-800 pt-6 text-sm">
                  © 2025 Cauã Yoshito · Yamaji Studio
                </p>
              </div>
            </footer>
          </CartProvider>
        </AuthProvider>
      </body>
    </html>
  );
}

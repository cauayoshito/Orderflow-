import { appUrl, baseEmail, button, escapeHtml } from "./layout";

export interface WelcomeData {
  customerName: string;
}

export function welcomeEmail(data: WelcomeData): { subject: string; html: string } {
  const html = baseEmail(
    `
    <h1 style="margin:0 0 8px;font-size:22px;color:#1a1a2e;">Bem-vindo(a), ${escapeHtml(data.customerName)}! 👋</h1>
    <p style="margin:0 0 16px;color:#475569;font-size:15px;">
      Sua conta na <strong>OrderFlow Commerce Cloud</strong> foi criada com sucesso.
      Agora é só explorar o catálogo, montar seu carrinho e finalizar a compra com poucos cliques.
    </p>
    <p style="margin:0 0 24px;">${button("Explorar o catálogo", appUrl("/"))}</p>
    <p style="margin:0;color:#475569;font-size:14px;">Boas compras! 💜</p>
  `,
    { preheader: "Sua conta foi criada com sucesso" },
  );

  return { subject: "Bem-vindo à OrderFlow Commerce Cloud", html };
}

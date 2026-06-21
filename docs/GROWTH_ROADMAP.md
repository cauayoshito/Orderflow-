# OrderFlow — Sistema de Marketing & Crescimento

> Objetivo: transformar o OrderFlow em um **SaaS pronto para escalar e vender
> para múltiplos clientes**, aumentando **aquisição, conversão e retenção**.
>
> Princípio: **priorizar o que gera receita nos primeiros meses** (funil de
> aquisição → conversão → retenção), deixando integrações externas e automações
> mais pesadas para as fases seguintes.

---

## ✅ Entregue agora (MVP — funil revenue-first)

Implementado nesta fase, end-to-end e testado (backend: 28 testes; frontend:
build limpo).

### Backend (Java/Spring Boot)
- **Captura de leads** — entidade `Lead`, `POST /api/public/leads` (público),
  `GET /api/admin/leads`, deduplicação por e-mail e **código de indicação único**
  gerado por lead.
- **Programa de indicação / afiliados (base)** — cada lead recebe um
  `referralCode`; quem chega por um link `?ref=` grava `referredByCode`. Métricas
  de top indicadores em `GET /api/admin/leads/metrics`.
- **Cupons e promoções** — entidade `Coupon` (percentual ou valor fixo, mínimo de
  pedido, validade, limite de usos), CRUD admin (`/api/admin/coupons`) e
  **validação pública** (`/api/public/coupons/validate`) com cálculo de desconto.
- **Métricas de crescimento** — `GET /api/admin/leads/metrics`: total de leads,
  conversão, leads por canal/status, indicações e top indicadores.
- Cupom `BEMVINDO10` semeado para demonstração; índices de banco nas novas
  tabelas.

### Frontend (Next.js)
- **Landing page de conversão** (`/lp`) — hero + CTA teste grátis, prova social
  (números), benefícios, depoimentos, planos, FAQ e captura de leads.
- **Página de planos e preços** (`/pricing`) — 3 planos + tabela comparativa + FAQ.
- **Página de demonstração** (`/demo`) — tour pela loja, painel, IA e crescimento.
- **Indique e ganhe** (`/indique`) — gera link de indicação e compartilha no WhatsApp.
- **CTA de teste grátis** e **captura de leads por e-mail** — componente
  reutilizável `LeadForm` (dispara evento de conversão de analytics).
- **Depoimentos e prova social** — seção dedicada + estatísticas.
- **Dashboard de métricas de crescimento** (`/admin/growth`) — KPIs, leads por
  canal, top indicadores, gestão de cupons e leads recentes.
- **Meta Pixel + Google Analytics** — componente `Analytics` injeta GA4 e Pixel
  por env var (`NEXT_PUBLIC_GA_ID`, `NEXT_PUBLIC_META_PIXEL_ID`); `trackEvent`
  para eventos de conversão (ex.: `Lead`).

---

## 🟡 V1 — Próxima fase (ativação de receita e automação leve)

Funcionalidades que dependem de orquestração extra (jobs, e-mail, integrações)
mas têm alto impacto em conversão e retenção.

1. **Aplicar cupom no checkout** — usar `validate` na tela de pagamento, descontar
   o total e chamar `redeem` ao confirmar o pedido (fechar o loop de receita).
2. **Captura de leads → e-mail automático** — disparar e-mail de boas-vindas via
   Resend (infra já existe) ao capturar o lead; sequência de nutrição (drip).
3. **Recompensa real de indicação** — gerar cupom automático para o indicado e
   crédito/recompensa para o indicador quando a indicação converte.
4. **Notificações de reativação de inativos** — job agendado (`@Scheduled`) que
   detecta clientes sem pedidos há N dias (a OrderFlow Intelligence já calcula
   "sem giro"/recência) e dispara e-mail de "sentimos sua falta" + cupom.
5. **Blog para SEO** — rotas `/blog` e `/blog/[slug]` com conteúdo em MDX,
   sitemap.xml e metadata/OpenGraph dinâmicos.
6. **SEO técnico** — `sitemap.ts`, `robots.ts`, metadata por página, dados
   estruturados (JSON-LD) para produtos e organização.
7. **Página inicial = landing** — promover `/lp` a home institucional e mover a
   loja demo para `/loja` (decisão de produto).
8. **Eventos de conversão completos** — `Purchase`/`InitiateCheckout`/`ViewContent`
   no GA4 e Pixel, com valor e moeda, para otimização de campanhas.

---

## 🔵 V2 — Escala e multi-cliente (SaaS pleno)

1. **Multi-tenancy** — isolar dados por loja/cliente (tenant id), onboarding
   self-service e billing por assinatura (Stripe Billing/Subscriptions).
2. **Automação de WhatsApp** — integração com WhatsApp Cloud API (Meta) para
   recuperação de carrinho, confirmação de pedido e reativação; templates
   aprovados e fila de envio.
3. **Programa de afiliados completo** — painel do afiliado, comissões, rastreio de
   atribuição, saques e relatórios.
4. **CRM e segmentação** — estágios de lead (kanban), tags, segmentação por RFM
   (a engine já calcula recência/frequência/monetário) e automações por segmento.
5. **A/B testing e CRO** — testes de landing/preços e otimização de conversão.
6. **Cupons avançados** — por produto/categoria, primeira compra, frete grátis,
   combos e regras condicionais.
7. **Central de analytics de crescimento** — funil completo (visitas → leads →
   trials → pagantes → churn), CAC/LTV, coortes e dashboards executivos.
8. **Integrações de marketing** — RD Station/HubSpot/Mailchimp, Google/Meta Ads
   (conversões via API) e webhooks.

---

## Variáveis de ambiente novas

| Variável | Onde | Descrição |
|----------|------|-----------|
| `NEXT_PUBLIC_GA_ID` | frontend | ID do Google Analytics 4 (opcional) |
| `NEXT_PUBLIC_META_PIXEL_ID` | frontend | ID do Meta Pixel (opcional) |

Sem essas variáveis, os trackers ficam **desativados** (no-op) — o app roda
normalmente em desenvolvimento.

## Endpoints novos

| Método | Rota | Acesso | Descrição |
|--------|------|--------|-----------|
| `POST` | `/api/public/leads` | público | Captura de lead (landing/CTA/indicação) |
| `GET`  | `/api/public/coupons/validate` | público | Valida cupom e calcula desconto |
| `GET`  | `/api/admin/leads` | admin | Lista de leads |
| `GET`  | `/api/admin/leads/metrics` | admin | Métricas de crescimento |
| `POST` | `/api/admin/coupons` | admin | Cria cupom |
| `GET`  | `/api/admin/coupons` | admin | Lista cupons |
| `DELETE` | `/api/admin/coupons/{id}` | admin | Remove cupom |

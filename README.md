<div align="center">

# 🛒 OrderFlow Commerce Cloud

**Plataforma full stack de e-commerce com pagamentos, tempo real e IA — Java/Spring Boot + Next.js/TypeScript**

![Java 17](https://img.shields.io/badge/Java-17-orange?style=for-the-badge&logo=openjdk&logoColor=white)
![Spring Boot 3.2](https://img.shields.io/badge/Spring%20Boot-3.2-6DB33F?style=for-the-badge&logo=springboot&logoColor=white)
![Next.js 14](https://img.shields.io/badge/Next.js-14-000000?style=for-the-badge&logo=nextdotjs&logoColor=white)
![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178C6?style=for-the-badge&logo=typescript&logoColor=white)

![PostgreSQL](https://img.shields.io/badge/PostgreSQL-15-4169E1?style=flat-square&logo=postgresql&logoColor=white)
![Stripe](https://img.shields.io/badge/Stripe-Payments-635BFF?style=flat-square&logo=stripe&logoColor=white)
![Claude API](https://img.shields.io/badge/Claude%20API-IA-D97757?style=flat-square&logo=anthropic&logoColor=white)
![WebSocket](https://img.shields.io/badge/WebSocket-STOMP-010101?style=flat-square&logo=socketdotio&logoColor=white)
![Tailwind CSS](https://img.shields.io/badge/Tailwind-CSS-06B6D4?style=flat-square&logo=tailwindcss&logoColor=white)
![Docker](https://img.shields.io/badge/Docker-Compose-2496ED?style=flat-square&logo=docker&logoColor=white)
![Swagger](https://img.shields.io/badge/OpenAPI-Swagger-85EA2D?style=flat-square&logo=swagger&logoColor=black)

*Catálogo, carrinho, checkout com Stripe, painel admin com dashboard, status de pedido em tempo real, e-mails transacionais e módulo de IA com a API da Claude.*

[Como rodar](#-como-rodar) · [Arquitetura](#%EF%B8%8F-arquitetura) · [Destaques técnicos](#-destaques-técnicos) · [API](docs/API.md) · [Guia de uso](docs/USAGE.md)

</div>

---

## 💡 Sobre o projeto

O **OrderFlow Commerce Cloud** é uma plataforma completa de pedidos para pequenos negócios, construída de ponta a ponta como projeto de portfólio: **API REST em Java/Spring Boot**, **frontend em Next.js/TypeScript** e integrações reais de mercado — **Stripe** (pagamentos), **Resend** (e-mails transacionais), **WebSocket** (tempo real) e **API da Claude/Anthropic** (recursos de IA para o lojista).

Tudo sobe com **um único comando** via Docker Compose, com seed automático de dados e usuário admin de demonstração.

## 🎯 Destaques técnicos

O que este projeto demonstra na prática:

| Competência | Onde aparece no código |
|---|---|
| **API REST bem estruturada** | Camadas claras (controller → service → repository), DTOs dedicados, validação com Bean Validation e tratamento global de erros (`GlobalExceptionHandler`) |
| **Segurança** | Spring Security com **JWT + refresh token**, roles (`ADMIN`/`CUSTOMER`), filtro de autenticação customizado e CORS configurável |
| **Pagamentos reais** | Fluxo **PaymentIntent + Stripe Elements**, com **webhook assinado** que reconcilia o pagamento e atualiza o pedido para `PAID`/`PAYMENT_FAILED` |
| **Tempo real** | WebSocket **STOMP/SockJS** com broker de tópicos (`/topic/orders/{id}`); hook React `useOrderStatus` com reconexão automática |
| **Integração com IA** | Módulo backend que consome a **API da Claude** via `RestClient`: geração de descrição de produto, resumo semanal de vendas e sugestões para estoque baixo |
| **Regras de negócio** | Máquina de estados de pedido com transições válidas, controle de estoque na criação do pedido e dashboard de métricas agregadas |
| **Testes automatizados** | Testes unitários e de integração (MockMvc + H2): pedidos, produtos, pagamentos e configuração de WebSocket |
| **Frontend moderno** | Next.js 14 (App Router), TypeScript estrito, Tailwind CSS, Context API (auth e carrinho) e Route Handlers para e-mails server-side |
| **DevOps / DX** | Docker Compose com healthcheck, multi-stage builds, OpenAPI/Swagger e **graceful degradation** (sem chave de Stripe/IA/Resend, o restante do app segue funcionando) |
| **Documentação** | README completo, [referência da API](docs/API.md) e [guia de uso passo a passo](docs/USAGE.md) |

## ✨ Funcionalidades

**🛍️ Loja (cliente)**
- Cadastro e login com JWT (+ refresh token)
- Catálogo de produtos com controle de estoque
- Carrinho persistido no navegador
- Checkout com pagamento via Stripe
- "Meus pedidos" com histórico e acompanhamento de status **ao vivo**

**💳 Pagamentos (Stripe)**
- Checkout com PaymentIntent + Stripe Elements
- Webhook com validação de assinatura que atualiza o pedido para `PAID` / `PAYMENT_FAILED`

**⚡ Tempo real & notificações**
- Status do pedido em tempo real via WebSocket (STOMP/SockJS), com reconexão automática
- E-mails transacionais via Resend: boas-vindas, confirmação de pedido e mudança de status

**📊 Painel administrativo**
- Dashboard: total de vendas, pedidos por status, produtos com estoque baixo e pedidos recentes
- CRUD de produtos com estoque
- Gestão de status de pedidos com regras de transição
- **IA (Claude):** gerar descrição de produto, resumir vendas da semana e sugerir ações para estoque baixo

## 🏗️ Arquitetura

```
┌──────────────────────┐      HTTP/JSON (JWT)       ┌──────────────────────────┐
│   Next.js Frontend   │ ─────────────────────────▶ │   Spring Boot REST API   │
│  (App Router, TS,    │ ◀───────────────────────── │  (Security + JWT, JPA)   │
│   Tailwind)          │   WebSocket (STOMP/SockJS) │                          │
│  :3000               │ ◀╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌╌ │  ── AI module ──▶ Claude │
└──────────┬───────────┘                            └────────────┬─────────────┘
           │ Route Handlers                                      │ JDBC
           ▼                                             ┌───────▼────────┐
     Resend (e-mails)          Stripe (webhook) ───────▶ │  PostgreSQL    │
                                                         │  :5432         │
                                                         └────────────────┘
```

| Camada | Tecnologias |
|--------|-------------|
| **Frontend** | Next.js 14 (App Router), TypeScript, Tailwind CSS, Stripe Elements |
| **Backend** | Java 17, Spring Boot 3.2, Spring Security + JWT, Spring Data JPA, Bean Validation |
| **Banco de dados** | PostgreSQL 15 (H2 em memória nos testes) |
| **Pagamentos** | Stripe (stripe-java + Stripe.js / React Elements + webhook) |
| **Tempo real** | WebSocket STOMP + SockJS (`@stomp/stompjs`) |
| **E-mail** | Resend (Next.js Route Handlers) |
| **IA** | API da Claude (Anthropic) via Spring `RestClient` |
| **Infra & docs** | Docker Compose (multi-stage builds, healthcheck), OpenAPI/Swagger |

## 🚀 Como rodar

### Opção A — Docker Compose (recomendado)

```bash
# (opcional) habilite o módulo de IA exportando sua chave da Anthropic
export ANTHROPIC_API_KEY=sk-ant-...

docker compose up --build
```

- 🛍️ Loja: <http://localhost:3000>
- 📖 API (Swagger): <http://localhost:8080/swagger-ui.html>

### Opção B — Manual (desenvolvimento)

**Banco** (via Docker):
```bash
docker run --name ofcc-pg -e POSTGRES_DB=orderflow_db -e POSTGRES_USER=orderflow \
  -e POSTGRES_PASSWORD=orderflow -p 5432:5432 -d postgres:15
```

**Backend:**
```bash
cd backend
export ANTHROPIC_API_KEY=sk-ant-...   # opcional, habilita a IA
mvn spring-boot:run
```

**Frontend:**
```bash
cd frontend
cp .env.local.example .env.local
npm install
npm run dev
```

### Credenciais de demonstração

Um usuário admin e um catálogo inicial são criados automaticamente no primeiro start:

| Usuário | Senha | Papel |
|---------|-------|-------|
| `admin` | `admin123` | ADMIN |

Contas de cliente podem ser criadas pela tela de cadastro.

## 🧪 Testes

```bash
cd backend
mvn test        # unitários + integração (MockMvc/H2): pedidos, produtos, pagamentos e WebSocket
```

```bash
cd frontend
npm run build   # compila e valida os tipos (tsc strict)
```

## ⚙️ Variáveis de ambiente

Todas as integrações externas são **opcionais** e degradam graciosamente: sem a chave correspondente, o endpoint responde 503 (Stripe/IA) ou o envio é pulado com log (e-mails) — e o restante do app continua funcionando.

| Variável | Onde | Padrão | Descrição |
|----------|------|--------|-----------|
| `ANTHROPIC_API_KEY` | backend | — | Habilita o módulo de IA |
| `ANTHROPIC_MODEL` | backend | `claude-opus-4-8` | Modelo da Claude usado nas features de IA |
| `STRIPE_SECRET_KEY` | backend | — | Habilita pagamentos |
| `STRIPE_WEBHOOK_SECRET` | backend | — | Valida a assinatura do webhook Stripe |
| `STRIPE_PUBLISHABLE_KEY` | backend/frontend | — | Chave pública do Stripe |
| `NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY` | frontend | — | Chave pública do Stripe no bundle do navegador |
| `RESEND_API_KEY` | frontend | — | Habilita e-mails transacionais |
| `RESEND_FROM_EMAIL` | frontend | `onboarding@resend.dev` | Remetente dos e-mails |
| `INTERNAL_API_SECRET` | frontend | — | Protege as rotas internas de e-mail (server-to-server) |
| `NEXT_PUBLIC_APP_URL` | frontend | `http://localhost:3000` | URL base usada nos links dos e-mails |
| `NEXT_PUBLIC_WS_URL` | frontend | `ws://localhost:8080/ws` | Endpoint WebSocket (STOMP/SockJS) |
| `NEXT_PUBLIC_API_BASE_URL` | frontend | `http://localhost:8080` | URL da API usada pelo navegador |
| `JWT_SECRET` | backend | dev secret | Segredo de assinatura dos tokens (troque em produção) |
| `SPRING_DATASOURCE_URL/USERNAME/PASSWORD` | backend | Postgres local | Conexão com o banco |
| `APP_CORS_ALLOWED_ORIGINS` | backend | `http://localhost:3000` | Origens liberadas no CORS |

## 💳 Stripe — fluxo de pagamento

1. No checkout, o pedido é criado (`POST /api/customer/orders`).
2. O frontend chama `POST /api/payment/create-intent { orderId }` e recebe o `clientSecret`.
3. O `PaymentElement` confirma o pagamento; o Stripe redireciona para `/orders/confirmation`.
4. O Stripe envia `payment_intent.succeeded` ao webhook, que valida a assinatura e marca o pedido como `PAID`.

Para testar localmente:

```bash
stripe listen --forward-to localhost:8080/api/payment/webhook
# copie o "whsec_..." exibido para STRIPE_WEBHOOK_SECRET e reinicie o backend
```

Use o cartão de teste `4242 4242 4242 4242`, qualquer data futura, CVC e CEP.

## ⚡ Tempo real — como funciona

- O backend expõe um endpoint WebSocket em `/ws` (com fallback SockJS) e um broker in-memory que publica em `/topic/orders/{id}`.
- Sempre que o status muda (admin altera o status, ou o webhook do Stripe marca como `PAID`/`PAYMENT_FAILED`), o `OrderService` publica um `OrderStatusEvent` no tópico do pedido.
- No frontend, o hook `useOrderStatus(orderId)` assina o tópico e atualiza a UI instantaneamente, com reconexão automática (backoff de 3s).

> 💡 Experimente: abra `/orders/{id}` como cliente em uma aba e, em outra, mude o status pelo painel admin (`/admin/orders`) — a página do cliente atualiza sozinha.

## 📁 Estrutura do projeto

```
.
├── backend/        # API Spring Boot (entities, DTOs, services, controllers, security, IA)
│   └── src/test/   # Testes unitários e de integração (MockMvc + H2)
├── frontend/       # App Next.js (catálogo, carrinho, checkout, pedidos, admin, e-mails)
├── docs/
│   ├── API.md      # Referência dos endpoints da API
│   └── USAGE.md    # Guia de uso passo a passo (fluxos de cliente e admin)
└── docker-compose.yml
```

## 📚 Documentação

- 📘 [docs/USAGE.md](docs/USAGE.md) — guia de uso passo a passo (fluxos de cliente e admin)
- 📗 [docs/API.md](docs/API.md) — referência dos endpoints da API
- 🔎 Swagger UI: <http://localhost:8080/swagger-ui.html> (com o backend rodando)

## 🗺️ Roadmap

- [ ] Deploy público (Render/Fly + Vercel) com CI/CD
- [ ] Upload de imagens reais de produto
- [ ] Paginação no catálogo e nos pedidos
- [ ] Pagamento via Pix

## 👤 Autor

**Cauã Yoshito**

[![GitHub](https://img.shields.io/badge/GitHub-cauayoshito-181717?style=flat-square&logo=github)](https://github.com/cauayoshito)
[![Email](https://img.shields.io/badge/Email-cauayoshito1%40gmail.com-EA4335?style=flat-square&logo=gmail&logoColor=white)](mailto:cauayoshito1@gmail.com)

---

<div align="center">

⭐ Se este projeto te ajudou ou chamou sua atenção, deixe uma estrela!

*Construído de ponta a ponta como projeto de portfólio full stack — código limpo, arquitetura em camadas e foco em boas práticas.*

</div>

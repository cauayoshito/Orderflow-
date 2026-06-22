# OrderFlow Intelligence Engine — Documento Técnico

> **Status:** Proposta de arquitetura (sem implementação de código)
> **Objetivo:** Remover por completo a dependência de modelos de IA externos
> (Claude / Anthropic e qualquer API paga) e substituí-la por uma **Engine de
> Inteligência Proprietária do OrderFlow**, escrita em **Python**, especializada
> em **gestão de negócios e e-commerce**.
> **Versão 1 (V1):** sem OpenAI, Claude, Gemini ou qualquer API paga. A
> inteligência é baseada em **regras de negócio + análise de dados +
> estatística + machine learning local** quando necessário.

---

## 1. Arquitetura atual

O OrderFlow hoje é composto por três camadas principais:

```
┌──────────────────────┐        REST/JSON        ┌──────────────────────────┐
│  Frontend Next.js     │ ─────────────────────▶ │  Backend Java/Spring Boot │
│  (TypeScript, :3000)  │ ◀───────────────────── │  (:8080)                  │
│                       │        WebSocket        │                           │
└──────────────────────┘                         │   ── AI module ──▶ Claude │
                                                  └────────────┬─────────────┘
                                                               │ JDBC
                                                       ┌───────▼────────┐
                                                       │  PostgreSQL     │
                                                       └────────────────┘
        Integrações externas: Stripe (pagamentos) · Resend (e-mails) · Claude/Anthropic (IA)
```

### 1.1 Backend (Java 17 / Spring Boot)

Pacote `com.orderflowapi`, organizado em camadas clássicas:

| Camada | Componentes relevantes |
| --- | --- |
| `entity` | `Product`, `Order`, `OrderItem`, `Customer`, `OrderStatus`, `User`, `Role`, `RefreshToken` |
| `repository` | `ProductRepository`, `OrderRepository`, `OrderItemRepository`, `CustomerRepository`, … (Spring Data JPA) |
| `service` | `ProductService`, `OrderService`, `DashboardService`, **`AiService`**, `PaymentService`, `UserService` |
| `controller` | `ProductController`, `OrderController`, `DashboardController`, **`AiController`**, `PaymentController`, `AuthController` |
| `dto` | `DashboardResponse`, **`AiTextResponse`**, **`ProductDescriptionRequest`**, … |
| `security` | JWT (`JwtService`, `JwtAuthenticationFilter`, `SecurityConfig`) — IA protegida sob `/api/admin/**` (ADMIN) |

### 1.2 Modelo de dados atual (essencial para a IA)

```
customers (id, name, email, phone, address)
products   (id, name, description, price, stock_quantity)
orders     (id, order_date, status, customer_id)
order_items(id, order_id, product_id, quantity, price)   ← snapshot de preço no momento da venda
```

`OrderStatus`: `PENDING`, `PAID`, `PAYMENT_FAILED`, `SHIPPED`, `DELIVERED`,
`CANCELED` (entre outros). `OrderService.calculateTotal` soma `quantity * price`
dos itens; vendas válidas excluem `CANCELED`.

### 1.3 Frontend (Next.js / TypeScript)

- `src/app/admin/page.tsx` → componente **`AiInsights`** (botões "Resumir vendas
  da semana" e "Sugerir ações p/ estoque baixo").
- `src/app/admin/products/page.tsx` → botão **"✨ Gerar com IA"** que chama
  `api.aiProductDescription(...)`.
- `src/lib/api.ts` → métodos `aiProductDescription`, `aiWeeklySummary`,
  `aiLowStockSuggestions`.
- `src/lib/types.ts` → interface `AiTextResponse`.

---

## 2. Pontos dependentes do Claude / Anthropic

Mapeamento **completo** de todos os pontos de acoplamento ao modelo externo.

### 2.1 Backend (núcleo da dependência)

| Arquivo | Dependência |
| --- | --- |
| `service/AiService.java` | **Coração da integração.** Chama `https://api.anthropic.com/v1/messages` via `RestClient`, headers `x-api-key` / `anthropic-version: 2023-06-01`, lê `anthropic.api-key` / `ANTHROPIC_API_KEY`, modelo `claude-opus-4-8`. Monta prompts, faz parsing do bloco `content[].text`. |
| `controller/AiController.java` | Endpoints `POST /api/admin/ai/product-description`, `GET /api/admin/ai/weekly-summary`, `GET /api/admin/ai/low-stock-suggestions`. Injeta `anthropic.model`. |
| `dto/AiTextResponse.java` | Resposta genérica `{ result, model }` (campo `model` = id da Claude). |
| `dto/ProductDescriptionRequest.java` | Entrada da geração de descrição. |
| `resources/application.yml` | Bloco `anthropic: { api-key, model }`. |
| `test/resources/application.yml` | Bloco `anthropic` para testes. |
| `pom.xml` | Comentário sobre não usar o SDK `anthropic-java`. |

### 2.2 Infra / configuração

| Arquivo | Dependência |
| --- | --- |
| `docker-compose.yml` | Variáveis `ANTHROPIC_API_KEY` e `ANTHROPIC_MODEL` no serviço backend. |

### 2.3 Frontend

| Arquivo | Dependência |
| --- | --- |
| `src/lib/api.ts` | `aiProductDescription`, `aiWeeklySummary`, `aiLowStockSuggestions`. |
| `src/lib/types.ts` | `AiTextResponse`. |
| `src/app/admin/page.tsx` | Componente `AiInsights` + rótulo "Insights de IA (Claude)". |
| `src/app/admin/products/page.tsx` | Botão "✨ Gerar com IA". |

### 2.4 Documentação

| Arquivo | Dependência |
| --- | --- |
| `README.md` | Badge "Claude API", descrições do módulo de IA, variáveis `ANTHROPIC_*`. |
| `docs/USAGE.md` | Instruções para exportar `ANTHROPIC_API_KEY`. |
| `docs/API.md` | Seção "Admin — IA (Claude)". |

### 2.5 Funcionalidades atualmente dependentes do Claude

Apenas **três** funcionalidades hoje dependem do modelo externo:

1. **Geração de descrição de produto** — copywriting de marketing (texto livre).
2. **Resumo semanal de vendas** — narrativa em linguagem natural sobre os
   últimos 7 dias (nº de pedidos, receita, cancelamentos).
3. **Sugestões para estoque baixo** — recomendações de ação para produtos abaixo
   do limiar de estoque.

> Observação: as métricas em si (total de vendas, pedidos por status, estoque
> baixo, pedidos recentes) já são calculadas **localmente** pelo
> `DashboardService` em Java — **não** dependem da Claude. A IA só era usada para
> transformar dados em **texto** e em **descrições de marketing**.

---

## 3. Impacto da remoção

### 3.1 O que para de funcionar (sem substituição)

- Os 3 endpoints `/api/admin/ai/*` deixariam de produzir texto gerado por LLM.
- O botão "Gerar com IA" e o painel "Insights de IA (Claude)" ficariam sem
  backend, caso nada os substitua.

### 3.2 O que NÃO é afetado

- Catálogo, carrinho, checkout/Stripe, pedidos, WebSocket em tempo real,
  e-mails (Resend), autenticação JWT e **todas as métricas do dashboard**
  continuam intactos — não há acoplamento com a IA.

### 3.3 Mudança de natureza das features

A maior diferença conceitual:

| Feature | Hoje (Claude) | Depois (Engine própria, V1) |
| --- | --- | --- |
| Resumo de vendas | Texto livre criativo gerado por LLM | Texto **determinístico** montado por templates a partir de métricas reais |
| Sugestões de estoque | Recomendações livres do LLM | Regras de negócio + previsão de demanda (ML local) |
| Descrição de produto | Copywriting criativo de qualidade alta | Geração baseada em **templates + NLG por gabaritos** (qualidade menor de prosa, porém 100% offline, grátis e previsível) |

**Trade-off honesto:** a geração de descrição de produto é a única feature em
que a saída perde "criatividade" ao trocar um LLM por templates. As demais
features **ganham** precisão, custo zero e previsibilidade. Em compensação,
a Engine própria entrega **8 novas capacidades analíticas** que a integração
atual não oferece.

### 3.4 Ganhos

- **Custo zero** de API e ausência de rate limits externos.
- **Privacidade**: dados de vendas não saem da infraestrutura.
- **Determinismo e testabilidade**: resultados reprodutíveis.
- **Especialização**: inteligência sob medida para gestão de e-commerce.
- **Sem chave/sem 503**: features deixam de depender de `ANTHROPIC_API_KEY`.

---

## 4. Arquitetura da nova IA OrderFlow

### 4.1 Decisão de arquitetura

Será criado um **microsserviço Python independente** — o **OrderFlow
Intelligence Engine** — que lê os mesmos dados do PostgreSQL e expõe uma API
REST consumida pelo backend Java (preferencial) ou diretamente pelo frontend.

**Por que microsserviço Python separado (e não reescrever em Java)?**

- O requisito é explícito: a inteligência deve ser **construída em Python**
  (pandas, scikit-learn, statsmodels).
- Isola o ciclo de vida da IA do core transacional (deploy/escala
  independentes).
- Permite evoluir para ML mais pesado sem tocar no backend Java.

**Padrão de integração:** o Java mantém os endpoints `/api/admin/ai/*` como
**proxy/fachada** (preservando o contrato e a segurança JWT existente) e
encaminha as chamadas ao Engine via HTTP interno. O frontend praticamente
não muda.

```
┌──────────────┐   REST/JWT   ┌────────────────────┐  HTTP interno  ┌────────────────────────┐
│ Frontend     │ ───────────▶ │ Backend Java       │ ─────────────▶ │ OrderFlow AI Engine     │
│ Next.js      │ ◀─────────── │ (proxy /api/ai/*)  │ ◀───────────── │ Python / FastAPI        │
└──────────────┘              └─────────┬──────────┘                └───────────┬────────────┘
                                        │ JDBC                                   │ SQLAlchemy (read-only)
                                        ▼                                        ▼
                              ┌──────────────────────────────────────────────────────┐
                              │                  PostgreSQL (compartilhado)            │
                              └──────────────────────────────────────────────────────┘
```

> Alternativa de menor esforço (sem proxy): o frontend chama o Engine direto.
> Recomenda-se o **proxy no Java** para manter a autenticação centralizada e o
> Engine fechado na rede interna (sem exposição pública).

### 4.2 Stack tecnológica do Engine

| Camada | Tecnologia |
| --- | --- |
| API | **FastAPI** + Uvicorn |
| Acesso a dados | **SQLAlchemy** (modo leitura) + `psycopg2`/`asyncpg` |
| Análise de dados | **pandas**, **NumPy** |
| Estatística | **statsmodels** / **SciPy** (médias móveis, z-score, regressão linear, sazonalidade) |
| ML local (quando necessário) | **scikit-learn** (RFM/K-Means para clientes, IsolationForest para anomalias) |
| Cache | em memória (TTL) na V1; **Redis** opcional na V2 |
| Validação | **Pydantic** |
| Testes | **pytest** |
| Empacotamento | Docker (imagem `orderflow-ai-engine`) |

### 4.3 Camadas internas do Engine

```
orderflow-ai/
├── app/
│   ├── main.py                # FastAPI app + routers
│   ├── config.py              # settings (env vars)
│   ├── db.py                  # engine SQLAlchemy (read-only)
│   ├── api/                   # routers (controllers)
│   │   ├── analytics.py       # endpoints analíticos
│   │   ├── inventory.py       # estoque/reposição
│   │   ├── customers.py       # clientes recorrentes
│   │   ├── insights.py        # insights administrativos + resumo
│   │   └── content.py         # descrição de produto (NLG por template)
│   ├── repositories/          # consultas SQL → DataFrames
│   ├── services/              # REGRAS DE NEGÓCIO + ESTATÍSTICA + ML
│   │   ├── sales_service.py
│   │   ├── inventory_service.py
│   │   ├── customer_service.py
│   │   ├── anomaly_service.py
│   │   └── nlg_service.py     # geração de texto por templates (PT-BR)
│   ├── ml/                    # modelos locais (treino/persistência)
│   └── schemas/               # Pydantic (contratos)
└── tests/
```

### 4.4 Mapa de funcionalidades → técnica

| # | Funcionalidade desejada | Técnica V1 | Saída |
| --- | --- | --- | --- |
| 1 | **Produtos mais vendidos** | Agregação pandas (`groupby` produto → soma de `quantity`/receita), top-N por período | ranking |
| 2 | **Ticket médio** | `receita_total / nº_pedidos` (geral, por período, por cliente) | KPI + série temporal |
| 3 | **Detectar queda de vendas** | Média móvel + variação % período-a-período + **z-score**; opcional regressão de tendência | flag + magnitude |
| 4 | **Produtos sem giro** | Produtos sem `order_items` em janela N dias (e/ou estoque parado) | lista + dias parados |
| 5 | **Sugerir reposição de estoque** | Velocidade de venda (média diária) × lead time → **ponto de reposição**; previsão simples de demanda | qtd. sugerida por produto |
| 6 | **Horários de pico** | Histograma de `order_date` por hora/dia-da-semana (heatmap) | distribuição |
| 7 | **Clientes recorrentes** | Frequência por cliente + **RFM** (Recency, Frequency, Monetary); K-Means opcional p/ segmentação | segmentos + recorrentes |
| 8 | **Insights administrativos** | Orquestrador que combina 1–7 e gera **texto PT-BR por templates** (NLG determinística) | bullets + resumo |

### 4.5 Geração de texto sem LLM (NLG por templates)

O `nlg_service` substitui o "texto da Claude" usando **templates parametrizados
em PT-BR** preenchidos com os números reais. Exemplo de lógica (pseudo):

```
"Nesta semana foram {n_pedidos} pedidos e R$ {receita} em vendas
 ({delta:+.0%} vs. semana anterior). Destaque: {produto_top}.
 Atenção: {alerta_queda_ou_estoque}."
```

Para descrição de produto, gabaritos por categoria + sinônimos/keywords
produzem texto aceitável e 100% offline. (A V3 poderá plugar um LLM **local**
opcional — ver roadmap — sem reintroduzir API paga.)

---

## 5. Banco de dados necessário

### 5.1 Reaproveitamento (sem mudanças destrutivas)

A V1 **lê** as tabelas existentes (`orders`, `order_items`, `products`,
`customers`). Nenhuma alteração de schema é obrigatória para começar — toda a
analítica deriva desses dados. O Engine acessa o Postgres em **modo leitura**
(usuário com `SELECT` apenas, por segurança).

### 5.2 Índices recomendados (performance analítica)

```sql
CREATE INDEX IF NOT EXISTS idx_orders_order_date     ON orders(order_date);
CREATE INDEX IF NOT EXISTS idx_orders_status         ON orders(status);
CREATE INDEX IF NOT EXISTS idx_order_items_product   ON order_items(product_id);
CREATE INDEX IF NOT EXISTS idx_order_items_order     ON order_items(order_id);
```

### 5.3 Novas tabelas (opcionais — a partir da V2)

Para cache de resultados, histórico de insights e parâmetros de ML:

```sql
-- Cache/auditoria de insights gerados
CREATE TABLE ai_insights (
    id           BIGSERIAL PRIMARY KEY,
    type         VARCHAR(64)  NOT NULL,   -- 'weekly_summary', 'restock', ...
    payload      JSONB        NOT NULL,   -- métricas estruturadas
    text_ptbr    TEXT,                    -- texto NLG renderizado
    period_start TIMESTAMP,
    period_end   TIMESTAMP,
    created_at   TIMESTAMP    NOT NULL DEFAULT now()
);

-- Parâmetros por produto p/ reposição (lead time, estoque de segurança)
CREATE TABLE inventory_policy (
    product_id      BIGINT PRIMARY KEY REFERENCES products(id),
    lead_time_days  INT     NOT NULL DEFAULT 7,
    safety_stock    INT     NOT NULL DEFAULT 0,
    updated_at      TIMESTAMP NOT NULL DEFAULT now()
);

-- Snapshot de segmentação RFM de clientes
CREATE TABLE customer_segment (
    customer_id  BIGINT PRIMARY KEY REFERENCES customers(id),
    rfm_r        INT,
    rfm_f        INT,
    rfm_m        INT,
    segment      VARCHAR(32),             -- 'champions', 'at_risk', ...
    computed_at  TIMESTAMP NOT NULL DEFAULT now()
);
```

> Modelos de ML (K-Means, IsolationForest) são pequenos e podem ser persistidos
> como artefatos (`joblib`) em volume/objeto, sem necessidade de tabela.

---

## 6. Serviços Python necessários

| Serviço | Responsabilidade | Funcionalidades atendidas |
| --- | --- | --- |
| `SalesService` | Agregações de vendas, ranking, ticket médio, séries temporais | 1, 2 |
| `AnomalyService` | Detecção de queda de vendas (z-score, média móvel, tendência) | 3 |
| `InventoryService` | Produtos sem giro, ponto de reposição, qtd. sugerida | 4, 5 |
| `PeakHoursService` | Distribuição temporal de pedidos (hora/dia) | 6 |
| `CustomerService` | Frequência, RFM, recorrência, segmentação | 7 |
| `InsightsService` | Orquestra os demais e consolida painel administrativo | 8 |
| `NlgService` | Renderiza texto PT-BR por templates (resumos, sugestões, descrições) | 1–8 + descrição de produto |
| `RepositoryLayer` | Consultas SQL → `pandas.DataFrame` (leitura) | base de todos |

### 6.1 Endpoints propostos (FastAPI)

| Método | Rota | Substitui / Novo |
| --- | --- | --- |
| `GET`  | `/v1/analytics/top-products?period=30d` | novo (1) |
| `GET`  | `/v1/analytics/average-ticket?period=30d` | novo (2) |
| `GET`  | `/v1/analytics/sales-drop` | novo (3) |
| `GET`  | `/v1/inventory/no-turnover?days=60` | novo (4) |
| `GET`  | `/v1/inventory/restock-suggestions` | **substitui** low-stock-suggestions (5) |
| `GET`  | `/v1/analytics/peak-hours` | novo (6) |
| `GET`  | `/v1/customers/recurring` | novo (7) |
| `GET`  | `/v1/insights/admin` | novo painel consolidado (8) |
| `GET`  | `/v1/insights/weekly-summary` | **substitui** weekly-summary |
| `POST` | `/v1/content/product-description` | **substitui** product-description |
| `GET`  | `/health` | infra |

> No backend Java, os endpoints atuais `/api/admin/ai/weekly-summary`,
> `/low-stock-suggestions` e `/product-description` passam a **proxyar** as rotas
> equivalentes do Engine, mantendo `AiTextResponse` (com `model` =
> `"orderflow-engine-v1"`). Assim o frontend não quebra.

---

## 7. Plano de migração completo

Migração **incremental**, sem downtime e sem quebrar o contrato do frontend.

### Passo 0 — Preparação
- Criar repositório/módulo `orderflow-ai` (FastAPI) e Dockerfile.
- Criar usuário Postgres **read-only** para o Engine.
- Adicionar serviço `ai-engine` ao `docker-compose.yml` (rede interna).

### Passo 1 — Implementar o Engine (paridade)
- Construir `SalesService`, `InventoryService`, `NlgService`.
- Expor `weekly-summary`, `restock-suggestions`, `product-description`
  (paridade funcional com a Claude, agora determinística).
- Cobrir com `pytest`.

### Passo 2 — Religar o backend Java (proxy)
- Reescrever `AiService.java` para chamar o Engine via `RestClient`
  (`AI_ENGINE_URL` interno) em vez de `api.anthropic.com`.
- Manter `AiController` e `AiTextResponse` (contrato inalterado); `model` passa a
  `orderflow-engine-v1`.
- **Remover** todo acesso à Anthropic do `AiService`.

### Passo 3 — Limpeza da dependência Claude
- Remover bloco `anthropic:` de `application.yml` (main e test).
- Remover `ANTHROPIC_API_KEY`/`ANTHROPIC_MODEL` do `docker-compose.yml`.
- Atualizar comentário no `pom.xml`.
- Atualizar `README.md`, `docs/USAGE.md`, `docs/API.md` (trocar "IA (Claude)"
  por "OrderFlow Intelligence Engine"; remover instruções de chave).

### Passo 4 — Novas funcionalidades analíticas
- Implementar `AnomalyService`, `PeakHoursService`, `CustomerService`,
  `InsightsService` e seus endpoints.
- Adicionar índices do §5.2.

### Passo 5 — Frontend
- Atualizar `src/app/admin/page.tsx`: renomear "Insights de IA (Claude)" para
  "Inteligência OrderFlow"; adicionar painéis para top-products, ticket médio,
  queda de vendas, sem giro, horários de pico, clientes recorrentes.
- Adicionar métodos correspondentes em `src/lib/api.ts` e tipos em `types.ts`.

### Passo 6 — Validação e corte
- Testes de integração ponta a ponta; comparar saídas com dados de exemplo.
- Remover qualquer referência residual a `anthropic`/`claude` (grep final).
- Deploy do `ai-engine`; ativar proxy; desativar caminho legado.

### Critérios de aceite
- Nenhuma string `anthropic`/`claude`/`ANTHROPIC_*` no código/config/docs.
- As 3 features antigas funcionam **sem** chave de API.
- As 8 funcionalidades novas respondem e têm testes.
- Frontend exibe os novos painéis.

---

## 8. Roadmap por fases

### Fase 1 — Fundação e Paridade (V1) — *sem qualquer API externa*
- Microsserviço FastAPI + acesso read-only ao Postgres.
- `SalesService`, `InventoryService`, `NlgService` (templates PT-BR).
- Substituir as 3 features da Claude (resumo, reposição, descrição).
- Java vira proxy; remoção completa da Anthropic; docs atualizadas.
- **Resultado:** dependência externa eliminada, app 100% funcional offline.

### Fase 2 — Analítica Especializada
- Funcionalidades 1–7: top-products, ticket médio, **queda de vendas**
  (z-score/tendência), **sem giro**, **horários de pico**, **clientes
  recorrentes (RFM)**.
- `InsightsService` consolidando o painel administrativo (8).
- Cache (Redis opcional) + tabelas `ai_insights`, `inventory_policy`,
  `customer_segment`.
- Novos painéis no frontend admin.

### Fase 3 — Machine Learning Local
- Previsão de demanda (média móvel/Holt-Winters/`statsmodels`) para reposição
  mais precisa (estoque de segurança dinâmico).
- Segmentação de clientes via **K-Means**; detecção de anomalias via
  **IsolationForest**.
- Treino/persistência de modelos (`joblib`) com jobs agendados.

### Fase 4 — Inteligência Avançada (opcional, ainda sem API paga)
- LLM **local** opcional (ex.: modelo aberto via Ollama/llama.cpp **on-prem**)
  apenas para enriquecer prosa de descrições/insights — mantendo o princípio de
  **zero API paga e zero dados saindo da infra**. Ativável por flag; a Engine
  determinística continua sendo o padrão e o fallback.
- Recomendações de cross-sell / market basket analysis.
- Alertas proativos (e-mail via Resend) quando a Engine detecta queda de vendas
  ou ruptura de estoque iminente.

---

## 9. Resumo executivo

- **Dependência atual da Claude:** restrita a `AiService`/`AiController` e 3
  features (descrição de produto, resumo semanal, sugestão de estoque). Métricas
  do dashboard **já são locais**.
- **Impacto da remoção:** baixo e controlado; apenas a "criatividade" da
  descrição de produto regride. Em troca: custo zero, privacidade, determinismo
  e **8 novas capacidades analíticas**.
- **Solução:** microsserviço **Python/FastAPI** (OrderFlow Intelligence Engine)
  lendo o mesmo Postgres, com o backend Java atuando como proxy seguro — o
  frontend muda pouco.
- **V1 sem nenhuma API paga**, baseada em regras de negócio + pandas +
  estatística, evoluindo para ML local (scikit-learn/statsmodels) nas fases
  seguintes.

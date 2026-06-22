# OrderFlow Intelligence

Engine de **inteligência proprietária** do OrderFlow, escrita em **Python /
FastAPI**. Analisa os dados reais de vendas, estoque e clientes (o mesmo
PostgreSQL usado pelo backend Java) e devolve insights acionáveis usando
**regras de negócio + estatística** — **sem nenhuma API externa de IA**
(sem OpenAI, Claude ou Gemini).

> Esta é a **Fase 1** do plano descrito em [`../docs/ORDERFLOW_AI_ENGINE.md`](../docs/ORDERFLOW_AI_ENGINE.md).

## Endpoints

| Método | Rota | O que faz |
| --- | --- | --- |
| `GET` | `/insights` | Painel consolidado de insights (vendas + estoque + clientes) com texto em PT-BR. |
| `GET` | `/dashboard-summary` | KPIs: total de vendas, nº de pedidos, ticket médio, estoque baixo, pedidos por status. |
| `GET` | `/stock-alerts` | Alertas de estoque baixo (com severidade e reposição sugerida) e produtos **sem giro**. |
| `GET` | `/sales-analysis?window_days=7` | Produtos mais vendidos, ticket médio, **detecção de queda de vendas** e **horários de pico**. |
| `GET` | `/health` | Status do serviço e conectividade com o banco. |
| `GET` | `/docs` | Swagger UI (OpenAPI). |

## Inteligência implementada

- **Produtos mais vendidos** — agregação por unidades/receita na janela.
- **Ticket médio** — receita válida ÷ pedidos válidos distintos.
- **Detecção de queda de vendas** — variação % entre janelas + tendência por
  regressão linear sobre a receita diária.
- **Produtos sem giro** — em estoque, sem vendas na janela (ou nunca vendidos).
- **Sugestão de reposição** — velocidade de vendas (un./dia) × lead time −
  estoque atual.
- **Horários de pico** — distribuição de pedidos por hora e dia da semana.
- **Clientes recorrentes** — clientes com ≥ 2 pedidos válidos, por total gasto.
- **Insights administrativos** — orquestração de tudo acima + narrativa PT-BR.

Vendas válidas **excluem** pedidos `CANCELED`. Todas as funções tratam o caso
de banco vazio com segurança.

## Rodando localmente

```bash
cd ai-engine
python -m venv .venv && source .venv/bin/activate
pip install -r requirements.txt

# configure o banco (veja .env.example) — padrão já aponta para o Postgres local
cp .env.example .env

uvicorn app.main:app --reload --port 8000
# abra http://localhost:8000/docs
```

## Via Docker Compose

O serviço já está integrado ao `docker-compose.yml` da raiz:

```bash
docker compose up --build
# engine disponível em http://localhost:8000
```

## Testes

```bash
cd ai-engine && source .venv/bin/activate
pytest -q
```

Os testes validam as regras de análise com DataFrames sintéticos (não exigem
banco).

## Configuração (variáveis `ORDERFLOW_*`)

| Variável | Padrão | Descrição |
| --- | --- | --- |
| `ORDERFLOW_DATABASE_URL` | — | URL SQLAlchemy completa (tem prioridade). |
| `ORDERFLOW_DB_HOST` / `_PORT` / `_NAME` / `_USER` / `_PASSWORD` | `localhost` / `5432` / `orderflow_db` / `orderflow` / `orderflow` | Conexão por componentes. |
| `ORDERFLOW_LOW_STOCK_THRESHOLD` | `5` | Estoque ≤ valor gera alerta. |
| `ORDERFLOW_NO_TURNOVER_DAYS` | `60` | Dias sem vendas = sem giro. |
| `ORDERFLOW_SALES_DROP_THRESHOLD` | `0.15` | Queda ≥ 15% entre janelas dispara alerta. |
| `ORDERFLOW_RESTOCK_LEAD_TIME_DAYS` | `7` | Cobertura de demanda na reposição. |
| `ORDERFLOW_ALLOWED_ORIGINS` | `http://localhost:3000,http://localhost:8080` | CORS. |

> **Recomendação de segurança:** aponte a engine para um usuário do PostgreSQL
> com permissão apenas de leitura (`SELECT`). A engine nunca escreve no banco.

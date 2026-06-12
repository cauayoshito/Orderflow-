# Guia de uso

Este guia mostra os principais fluxos da OrderFlow Commerce Cloud, do ponto de vista do **cliente** e do **administrador**.

## Pré-requisitos

Suba a stack completa:

```bash
docker compose up --build
```

- Loja: <http://localhost:3000>
- API/Swagger: <http://localhost:8080/swagger-ui.html>

Para habilitar a IA, exporte `ANTHROPIC_API_KEY` antes de subir (veja o README).

---

## Fluxo do cliente

1. **Criar conta** — acesse `/register`, informe usuário, e-mail e senha. Uma conta de cliente é criada e um perfil de cliente é provisionado automaticamente (necessário para comprar).
2. **Navegar no catálogo** — a página inicial (`/`) lista os produtos com preço e estoque.
3. **Adicionar ao carrinho** — clique em "Adicionar ao carrinho". O carrinho fica salvo no navegador.
4. **Carrinho** — em `/cart` ajuste quantidades ou remova itens.
5. **Checkout** — em `/checkout` revise o resumo e clique em "Continuar para pagamento". O pedido é criado e a tela de pagamento (Stripe) aparece.
6. **Pagamento** — preencha os dados do cartão (teste: `4242 4242 4242 4242`). Após confirmar, você é redirecionado para `/orders/confirmation`.
7. **Meus pedidos** — em `/orders` acompanhe seus pedidos e o status de cada um (`PAID` após o pagamento).

> O status `PAID` é definido pelo webhook do Stripe. Em desenvolvimento, rode `stripe listen --forward-to localhost:8080/api/payment/webhook` (veja o README).

> Regra de negócio: o estoque é validado e decrementado ao finalizar o pedido. Não é possível comprar mais unidades do que há em estoque.

---

## Fluxo do administrador

Faça login com `admin` / `admin123` e acesse **Admin** no topo.

### Dashboard (`/admin`)
- **Total de vendas** (pedidos não cancelados)
- **Total de pedidos**
- **Pedidos por status**
- **Estoque baixo** (≤ limite configurável, padrão 5)
- **Pedidos recentes**

### Produtos (`/admin/products`)
- Criar, editar e remover produtos (nome, descrição, preço, estoque).
- **✨ Gerar com IA**: preencha o nome e clique para gerar uma descrição com a Claude.

### Pedidos (`/admin/orders`)
- Visualizar todos os pedidos.
- Avançar o status respeitando as transições válidas:

```
PENDING → CONFIRMED → PROCESSING → SHIPPED → DELIVERED
   └──────────┴───────────┴────────→ CANCELED
```

Pedidos `DELIVERED` ou `CANCELED` são finais.

### IA no dashboard
- **Resumir vendas da semana** — resumo em linguagem simples dos últimos 7 dias.
- **Sugerir ações p/ estoque baixo** — recomendações práticas de reposição/promoção.

> Se a `ANTHROPIC_API_KEY` não estiver configurada, os recursos de IA retornam **503** com uma mensagem explicativa — o restante do app continua funcionando normalmente.

---

## Dicas de teste rápido

1. Logue como `admin`, crie/edite produtos e ajuste o estoque (deixe algum item com ≤ 5 unidades para ver o widget de estoque baixo).
2. Crie uma conta de cliente, faça um pedido.
3. Volte ao admin e veja o pedido em "Pedidos recentes" e nos contadores por status; avance o status do pedido.
4. Com a `ANTHROPIC_API_KEY` configurada, gere uma descrição de produto e o resumo de vendas.

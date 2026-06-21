# Referência da API

Base URL padrão: `http://localhost:8080`
Documentação interativa: `http://localhost:8080/swagger-ui.html`

Autenticação: JWT Bearer. Faça login, use o `accessToken` no header `Authorization: Bearer <token>`.

Papéis: `ROLE_ADMIN`, `ROLE_CLIENTE`. Endpoints sob `/api/admin/**` exigem ADMIN; sob `/api/customer/**` exigem CLIENTE ou ADMIN.

Erros seguem um formato consistente:

```json
{
  "timestamp": "2026-06-07T12:00:00Z",
  "status": 400,
  "error": "Bad Request",
  "message": "Insufficient stock for product 'Caneca' (requested 5, available 2)",
  "path": "/api/customer/orders",
  "fieldErrors": { "price": "must not be null" }
}
```

---

## Autenticação

### POST `/api/auth/register`
Cria um usuário cliente (e seu perfil de cliente).
```json
{ "username": "maria", "email": "maria@example.com", "password": "senha123", "role": "CLIENTE" }
```
→ `201 Created` `{ "message": "User registered successfully", "id": 2, "username": "maria" }`

### POST `/api/auth/login`
```json
{ "username": "maria", "password": "senha123" }
```
→ `200 OK`
```json
{
  "accessToken": "eyJ...",
  "refreshToken": "uuid",
  "tokenType": "Bearer",
  "id": 2,
  "username": "maria",
  "email": "maria@example.com",
  "roles": ["ROLE_CLIENTE"],
  "customerId": 1
}
```

### POST `/api/auth/refresh`
```json
{ "refreshToken": "uuid" }
```
→ novo `accessToken`.

---

## Cliente

### GET `/api/customer/me`
Perfil do usuário autenticado, incluindo `customerId`.

### GET `/api/customer/products`
Lista de produtos. Cada item: `{ id, name, description, price, stockQuantity }`.

### GET `/api/customer/products/{id}`
Detalhe de um produto.

### POST `/api/customer/orders`
Cria um pedido (valida e decrementa estoque).
```json
{ "customerId": 1, "items": [ { "productId": 5, "quantity": 2 } ] }
```
→ `201 Created` com o `OrderResponse`.

### GET `/api/customer/orders/{id}`
Detalhe de um pedido.

### GET `/api/customer/orders/customer/{customerId}`
Pedidos de um cliente.

`OrderResponse`:
```json
{
  "id": 10, "orderDate": "2026-06-07T12:00:00", "status": "PENDING",
  "customerId": 1, "customerName": "maria", "customerEmail": "maria@example.com",
  "items": [ { "productId": 5, "productName": "Café", "quantity": 2, "price": 32.9 } ],
  "total": 65.8
}
```

---

## Pagamentos (Stripe)

### POST `/api/payment/create-intent` (autenticado)
Cria um PaymentIntent para um pedido existente.
```json
{ "orderId": 10 }
```
→ `200 OK` `{ "clientSecret": "pi_..._secret_...", "publishableKey": "pk_test_..." }`
Sem `STRIPE_SECRET_KEY` no backend → `503`.

### POST `/api/payment/webhook` (público)
Recebe eventos do Stripe. O corpo é lido como **raw** e a assinatura é validada
com o header `Stripe-Signature` via `Webhook.constructEvent`.
- `payment_intent.succeeded` → pedido vira `PAID`
- `payment_intent.payment_failed` → pedido vira `PAYMENT_FAILED`

Assinatura inválida → `400`. Sucesso → `200`.

---

## Admin — Produtos

### POST `/api/admin/products`
```json
{ "name": "Café 250g", "description": "...", "price": 32.90, "stockQuantity": 40 }
```
### PUT `/api/admin/products/{id}`
Atualiza um produto. `stockQuantity` é opcional (mantém o atual se omitido).
### DELETE `/api/admin/products/{id}`
→ `204 No Content`.

## Admin — Pedidos

### GET `/api/admin/orders`
Lista todos os pedidos.

### PATCH `/api/admin/orders/{id}/status`
```json
{ "status": "CONFIRMED" }
```
Transições válidas: `PENDING→CONFIRMED→PROCESSING→SHIPPED→DELIVERED`, qualquer ativo `→CANCELED`. Transição inválida → `400`.

## Admin — Dashboard

### GET `/api/admin/dashboard`
```json
{
  "totalSales": 1234.50,
  "totalOrders": 12,
  "ordersByStatus": { "PENDING": 3, "CONFIRMED": 2, "PROCESSING": 0, "SHIPPED": 1, "DELIVERED": 5, "CANCELED": 1 },
  "lowStockProducts": [ { "id": 3, "name": "Kit", "price": 89.9, "stockQuantity": 3 } ],
  "recentOrders": [ /* até 10 OrderResponse */ ]
}
```

## Admin — IA (OrderFlow Intelligence)

Funções de IA atendidas pela **OrderFlow Intelligence** — engine proprietária em
Python/FastAPI que analisa os dados do próprio negócio, **sem nenhuma API externa**.
O backend faz proxy para a engine; se ela estiver indisponível, retorna `503`.

### POST `/api/admin/ai/product-description`
```json
{ "name": "Caneca de cerâmica", "category": "Casa", "keywords": "handmade, presente" }
```
→ `{ "result": "texto gerado...", "model": "orderflow-intelligence-v1" }`

### GET `/api/admin/ai/weekly-summary`
Análise das vendas recentes (queda, tendência e destaques) → `{ "result": "...", "model": "..." }`

### GET `/api/admin/ai/low-stock-suggestions`
Alertas de estoque baixo e produtos sem giro → `{ "result": "...", "model": "..." }`

> A engine também expõe endpoints próprios em `http://localhost:8000`
> (`/insights`, `/dashboard-summary`, `/stock-alerts`, `/sales-analysis`) —
> veja `ai-engine/README.md`.

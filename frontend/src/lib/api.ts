// Thin typed client over the OrderFlow Commerce Cloud REST API.
//
// The access token is kept in localStorage and attached as a Bearer header.
// Errors are normalized into ApiError so the UI can show a friendly message.

import type {
  AiTextResponse,
  AuthResponse,
  AuthUser,
  DashboardData,
  Order,
  OrderStatus,
  PaymentIntentResponse,
  Product,
  ProductInput,
} from "./types";

const BASE_URL =
  process.env.NEXT_PUBLIC_API_BASE_URL?.replace(/\/$/, "") ?? "http://localhost:8080";

const TOKEN_KEY = "ofcc_token";

export class ApiError extends Error {
  status: number;
  constructor(status: number, message: string) {
    super(message);
    this.status = status;
  }
}

export function getToken(): string | null {
  if (typeof window === "undefined") return null;
  return window.localStorage.getItem(TOKEN_KEY);
}

export function setToken(token: string | null) {
  if (typeof window === "undefined") return;
  if (token) window.localStorage.setItem(TOKEN_KEY, token);
  else window.localStorage.removeItem(TOKEN_KEY);
}

interface RequestOptions {
  method?: string;
  body?: unknown;
  auth?: boolean;
}

async function request<T>(path: string, options: RequestOptions = {}): Promise<T> {
  const { method = "GET", body, auth = true } = options;
  const headers: Record<string, string> = {};
  if (body !== undefined) headers["Content-Type"] = "application/json";
  if (auth) {
    const token = getToken();
    if (token) headers["Authorization"] = `Bearer ${token}`;
  }

  let res: Response;
  try {
    res = await fetch(`${BASE_URL}${path}`, {
      method,
      headers,
      body: body !== undefined ? JSON.stringify(body) : undefined,
    });
  } catch {
    throw new ApiError(0, "Não foi possível conectar à API. Verifique se o backend está rodando.");
  }

  if (res.status === 204) return undefined as T;

  const text = await res.text();
  const data = text ? safeJson(text) : null;

  if (!res.ok) {
    const message =
      (data && (data.message || data.error)) ||
      (typeof data === "string" && data) ||
      `Erro ${res.status}`;
    throw new ApiError(res.status, message);
  }

  return data as T;
}

function safeJson(text: string): any {
  try {
    return JSON.parse(text);
  } catch {
    return text;
  }
}

export const api = {
  // ----- Auth -----
  login: (username: string, password: string) =>
    request<AuthResponse>("/api/auth/login", {
      method: "POST",
      body: { username, password },
      auth: false,
    }),

  register: (username: string, email: string, password: string) =>
    request<{ message: string }>("/api/auth/register", {
      method: "POST",
      body: { username, email, password, role: "CLIENTE" },
      auth: false,
    }),

  me: () => request<AuthUser>("/api/customer/me"),

  // ----- Catalog (customer) -----
  listProducts: () => request<Product[]>("/api/customer/products"),
  getProduct: (id: number) => request<Product>(`/api/customer/products/${id}`),

  // ----- Orders (customer) -----
  createOrder: (customerId: number, items: { productId: number; quantity: number }[]) =>
    request<Order>("/api/customer/orders", {
      method: "POST",
      body: { customerId, items },
    }),

  myOrders: (customerId: number) =>
    request<Order[]>(`/api/customer/orders/customer/${customerId}`),

  getOrder: (id: number) => request<Order>(`/api/customer/orders/${id}`),

  // ----- Payment (Stripe) -----
  createPaymentIntent: (orderId: number) =>
    request<PaymentIntentResponse>("/api/payment/create-intent", {
      method: "POST",
      body: { orderId },
    }),

  // ----- Admin: products -----
  createProduct: (input: ProductInput) =>
    request<Product>("/api/admin/products", { method: "POST", body: input }),
  updateProduct: (id: number, input: ProductInput) =>
    request<Product>(`/api/admin/products/${id}`, { method: "PUT", body: input }),
  deleteProduct: (id: number) =>
    request<void>(`/api/admin/products/${id}`, { method: "DELETE" }),

  // ----- Admin: orders -----
  allOrders: () => request<Order[]>("/api/admin/orders"),
  updateOrderStatus: (id: number, status: OrderStatus) =>
    request<Order>(`/api/admin/orders/${id}/status`, {
      method: "PATCH",
      body: { status },
    }),

  // ----- Admin: dashboard -----
  dashboard: () => request<DashboardData>("/api/admin/dashboard"),

  // ----- Admin: AI -----
  aiProductDescription: (name: string, category?: string, keywords?: string) =>
    request<AiTextResponse>("/api/admin/ai/product-description", {
      method: "POST",
      body: { name, category, keywords },
    }),
  aiWeeklySummary: () => request<AiTextResponse>("/api/admin/ai/weekly-summary"),
  aiLowStockSuggestions: () =>
    request<AiTextResponse>("/api/admin/ai/low-stock-suggestions"),
};

export function formatCurrency(value: number): string {
  return new Intl.NumberFormat("pt-BR", { style: "currency", currency: "BRL" }).format(value);
}

// Shared types mirroring the Spring Boot API DTOs.

export interface Product {
  id: number;
  name: string;
  description: string | null;
  price: number;
  stockQuantity: number;
}

export interface ProductInput {
  name: string;
  description?: string;
  price: number;
  stockQuantity?: number;
}

export interface OrderItem {
  productId: number;
  productName: string;
  quantity: number;
  price: number;
}

export type OrderStatus =
  | "PENDING"
  | "PAID"
  | "PAYMENT_FAILED"
  | "CONFIRMED"
  | "PROCESSING"
  | "SHIPPED"
  | "DELIVERED"
  | "CANCELED";

export interface PaymentIntentResponse {
  clientSecret: string;
  publishableKey: string;
}

export interface Order {
  id: number;
  orderDate: string;
  status: OrderStatus;
  customerId: number;
  customerName: string;
  customerEmail: string;
  items: OrderItem[];
  total: number;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  tokenType: string;
  id: number;
  username: string;
  email: string;
  roles: string[];
  customerId: number | null;
}

export interface DashboardData {
  totalSales: number;
  totalOrders: number;
  ordersByStatus: Record<string, number>;
  lowStockProducts: Product[];
  recentOrders: Order[];
}

export interface AiTextResponse {
  result: string;
  model: string;
}

export interface AuthUser {
  id: number;
  username: string;
  email: string;
  roles: string[];
  customerId: number | null;
}

export interface CartLine {
  product: Product;
  quantity: number;
}

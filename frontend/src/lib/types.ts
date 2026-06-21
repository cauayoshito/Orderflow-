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

// ----- OrderFlow Intelligence (structured analytics) -----

export type InsightSeverity = "info" | "success" | "warning" | "critical";

export interface Insight {
  type: string;
  severity: InsightSeverity;
  title: string;
  message: string;
}

export interface RecurringCustomer {
  customer_id: number;
  name: string;
  orders: number;
  total_spent: number;
}

export interface InsightsResponse {
  insights: Insight[];
  headline: string;
  recurring_customers: RecurringCustomer[];
  generated_at: string;
  engine: string;
}

export interface TopProduct {
  product_id: number;
  name: string;
  units_sold: number;
  revenue: number;
}

export interface PeakHour {
  hour: number;
  orders: number;
}

export interface PeakWeekday {
  weekday: string;
  orders: number;
}

export interface SalesAnalysisResponse {
  window_days: number;
  revenue_current_window: number;
  revenue_previous_window: number;
  change_pct: number;
  trend: "up" | "down" | "stable";
  sales_drop_detected: boolean;
  average_ticket: number;
  top_products: TopProduct[];
  peak_hours: PeakHour[];
  peak_weekdays: PeakWeekday[];
  narrative: string;
  generated_at: string;
  engine: string;
}

export interface StockAlertItem {
  product_id: number;
  name: string;
  stock_quantity: number;
  severity: "out_of_stock" | "critical" | "low";
  daily_velocity: number;
  days_of_cover: number | null;
  suggested_restock: number;
}

export interface NoTurnoverItem {
  product_id: number;
  name: string;
  stock_quantity: number;
  days_without_sales: number | null;
}

export interface StockAlertsResponse {
  low_stock_threshold: number;
  no_turnover_days: number;
  alerts: StockAlertItem[];
  no_turnover: NoTurnoverItem[];
  narrative: string;
  generated_at: string;
  engine: string;
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

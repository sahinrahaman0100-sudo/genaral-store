export interface Product {
  id: string;
  name: string;
  nameHi: string;
  price: number;
  mrp?: number;
  category: string;
  emoji: string;
  description: string;
  descriptionHi: string;
  inStock: boolean;
  unit?: string;
  tags?: string[];
}

export interface CartItem extends Product {
  quantity: number;
}

export type DeliveryMode = 'delivery' | 'pickup';

export interface CustomerDetails {
  name: string;
  email: string;
  phone: string;
  address: string;
  notes: string;
}

export type OrderStatus =
  | 'verified'
  | 'accepted'
  | 'paid'
  | 'shipped'
  | 'delivered';

export interface OrderStatusStep {
  key: OrderStatus;
  label: string;
  labelHi: string;
  icon: string;
  description: string;
}

export interface Order {
  orderRef: string;
  status: OrderStatus;
  items: CartItem[];
  customer: CustomerDetails;
  deliveryMode: DeliveryMode;
  total: number;
  deliveryCharge: number;
  shippingInfo?: {
    trackingId?: string;
    carrier?: string;
    estimatedTime?: string;
  };
  paymentUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface ApiResponse<T> {
  data: T;
  success: boolean;
  message?: string;
}

export interface CatalogResponse {
  products: Product[];
  categories: string[];
}

export interface ProductDetailResponse {
  product: Product;
  related: Product[];
}

export interface OrderResponse {
  orderRef: string;
  message: string;
}

export interface TrackResponse {
  order: Order;
}

export type Language = 'en' | 'hi';

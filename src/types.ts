export type OrderStatus = 'Pending' | 'Processing' | 'Shipped' | 'Delivered' | 'Cancelled';

export interface Product {
  id: string;
  name: string;
  description: string;
  price: number;
  image: string;
  category: string;
  stock: number;
}

export interface OrderItem {
  productId: string;
  productName: string;
  price: number;
  quantity: number;
  image: string;
}

export interface Order {
  id: string;
  userId: string;
  userEmail: string;
  items: OrderItem[];
  total: number;
  status: OrderStatus;
  shippingAddress: {
    fullName: string;
    addressLine: string;
    city: string;
    zipCode: string;
    country: string;
  };
  createdAt: string;
}

export interface User {
  id: string;
  email: string;
  name: string;
  role: 'User' | 'Admin';
}

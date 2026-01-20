// Tipos para el Data Warehouse

export interface Product {
  productId: string;
  name: string;
  category: string;
  price: number;
  quantity: number;
  createdAt: Date;
  source: string;
}

export interface Customer {
  customerId: string;
  name: string;
  email: string;
  phone: string;
  city: string;
  country: string;
  registrationDate: Date;
  newsletter: boolean;
  language: string;
  source: string;
}

export interface Order {
  orderId: string;
  customerId: string;
  orderDate: Date;
  items: OrderItem[];
  totalAmount: number;
  status: string;
  source: string;
}

export interface OrderItem {
  productId: string;
  productName: string;
  quantity: number;
  unitPrice: number;
  total: number;
}

export interface SalesReport {
  reportDate: Date;
  analyst: string;
  totalSales: number;
  productSales: ProductSale[];
  observations: string;
  recommendations: string[];
  source: string;
}

export interface ProductSale {
  productName: string;
  quantity: number;
  revenue: number;
}

export interface Metadata {
  source: string;
  version: string;
  lastUpdated: Date;
  schema: Record<string, any>;
  dataQuality: {
    completeness: number;
    accuracy: number;
    consistency: number;
    timeliness: string;
  };
  lineage: {
    sourceSystem: string;
    extractionMethod: string;
    frequency: string;
    retention: string;
  };
}

export interface DataMapping {
  sourceField: string;
  targetField: string;
  transformation?: string;
  dataType: string;
  required: boolean;
}

export interface ETLProcess {
  id: string;
  name: string;
  sourceType: 'csv' | 'json' | 'xml' | 'txt' | 'metadata';
  sourcePath: string;
  targetCollection: string;
  mappings: DataMapping[];
  status: 'pending' | 'running' | 'completed' | 'failed';
  startedAt?: Date;
  completedAt?: Date;
  recordsProcessed?: number;
  error?: string;
}

export interface ETLResult {
  success: boolean;
  recordsProcessed: number;
  recordsInserted: number;
  recordsUpdated: number;
  errors: string[];
  duration: number;
}

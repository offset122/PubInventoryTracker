import {
  users,
  products,
  purchases,
  sales,
  type User,
  type UpsertUser,
  type Product,
  type InsertProduct,
  type Purchase,
  type InsertPurchase,
  type Sale,
  type InsertSale,
} from "@shared/schema";
import { FirebaseStorage } from './firebaseStorage';

// Interface for storage operations
export interface IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Product operations
  getProducts(userId: string): Promise<Product[]>;
  getProduct(id: number, userId: string): Promise<Product | undefined>;
  createProduct(product: InsertProduct & { userId: string }): Promise<Product>;
  updateProduct(id: number, product: Partial<InsertProduct>, userId: string): Promise<Product>;
  deleteProduct(id: number, userId: string): Promise<void>;
  
  // Purchase operations
  getPurchases(userId: string): Promise<Purchase[]>;
  createPurchase(purchase: InsertPurchase & { userId: string }): Promise<Purchase>;
  getRecentPurchases(userId: string, limit?: number): Promise<(Purchase & { product: Product })[]>;
  
  // Sale operations
  getSales(userId: string): Promise<Sale[]>;
  createSale(sale: InsertSale & { userId: string }): Promise<Sale>;
  getRecentSales(userId: string, limit?: number): Promise<(Sale & { product: Product })[]>;
  
  // Analytics operations
  getDashboardStats(userId: string): Promise<{
    totalRevenue: number;
    netProfit: number;
    itemsSold: number;
    lowStockItems: number;
  }>;
  getTopSellingProducts(userId: string, limit?: number): Promise<{
    product: Product;
    unitsSold: number;
    revenue: number;
  }[]>;
  getRecentTransactions(userId: string, limit?: number): Promise<{
    id: number;
    productName: string;
    type: 'sale' | 'purchase';
    quantity: number;
    amount: string;
    createdAt: Date | null;
  }[]>;
  getLowStockProducts(userId: string): Promise<Product[]>;
}

export const storage = new FirebaseStorage();

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
import { db } from "./db";
import { eq, desc, sum, count, and, sql } from "drizzle-orm";

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

export class DatabaseStorage implements IStorage {
  // User operations
  // (IMPORTANT) these user operations are mandatory for Replit Auth.

  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: new Date(),
        },
      })
      .returning();
    return user;
  }

  // Product operations
  async getProducts(userId: string): Promise<Product[]> {
    return await db.select().from(products).where(eq(products.userId, userId)).orderBy(desc(products.createdAt));
  }

  async getProduct(id: number, userId: string): Promise<Product | undefined> {
    const [product] = await db.select().from(products).where(and(eq(products.id, id), eq(products.userId, userId)));
    return product;
  }

  async createProduct(product: InsertProduct & { userId: string }): Promise<Product> {
    const [newProduct] = await db.insert(products).values(product).returning();
    return newProduct;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>, userId: string): Promise<Product> {
    const [updatedProduct] = await db
      .update(products)
      .set({ ...product, updatedAt: new Date() })
      .where(and(eq(products.id, id), eq(products.userId, userId)))
      .returning();
    return updatedProduct;
  }

  async deleteProduct(id: number, userId: string): Promise<void> {
    await db.delete(products).where(and(eq(products.id, id), eq(products.userId, userId)));
  }

  // Purchase operations
  async getPurchases(userId: string): Promise<Purchase[]> {
    return await db.select().from(purchases).where(eq(purchases.userId, userId)).orderBy(desc(purchases.createdAt));
  }

  async createPurchase(purchase: InsertPurchase & { userId: string }): Promise<Purchase> {
    return await db.transaction(async (tx) => {
      // Create purchase record
      const [newPurchase] = await tx.insert(purchases).values(purchase).returning();
      
      // Update product stock
      await tx
        .update(products)
        .set({
          currentStock: sql`${products.currentStock} + ${purchase.quantity}`,
          updatedAt: new Date(),
        })
        .where(and(eq(products.id, purchase.productId), eq(products.userId, purchase.userId)));
      
      return newPurchase;
    });
  }

  async getRecentPurchases(userId: string, limit = 10): Promise<(Purchase & { product: Product })[]> {
    const results = await db
      .select({
        purchase: purchases,
        product: products,
      })
      .from(purchases)
      .innerJoin(products, eq(purchases.productId, products.id))
      .where(eq(purchases.userId, userId))
      .orderBy(desc(purchases.createdAt))
      .limit(limit);
    
    return results.map(result => ({
      ...result.purchase,
      product: result.product,
    }));
  }

  // Sale operations
  async getSales(userId: string): Promise<Sale[]> {
    return await db.select().from(sales).where(eq(sales.userId, userId)).orderBy(desc(sales.createdAt));
  }

  async createSale(sale: InsertSale & { userId: string }): Promise<Sale> {
    return await db.transaction(async (tx) => {
      // Check if sufficient stock is available
      const [product] = await tx
        .select()
        .from(products)
        .where(and(eq(products.id, sale.productId), eq(products.userId, sale.userId)));
      
      if (!product) {
        throw new Error("Product not found");
      }
      
      if (product.currentStock < sale.quantity) {
        throw new Error("Insufficient stock");
      }
      
      // Create sale record
      const [newSale] = await tx.insert(sales).values(sale).returning();
      
      // Update product stock
      await tx
        .update(products)
        .set({
          currentStock: sql`${products.currentStock} - ${sale.quantity}`,
          updatedAt: new Date(),
        })
        .where(and(eq(products.id, sale.productId), eq(products.userId, sale.userId)));
      
      return newSale;
    });
  }

  async getRecentSales(userId: string, limit = 10): Promise<(Sale & { product: Product })[]> {
    const results = await db
      .select({
        sale: sales,
        product: products,
      })
      .from(sales)
      .innerJoin(products, eq(sales.productId, products.id))
      .where(eq(sales.userId, userId))
      .orderBy(desc(sales.createdAt))
      .limit(limit);
    
    return results.map(result => ({
      ...result.sale,
      product: result.product,
    }));
  }

  // Analytics operations
  async getDashboardStats(userId: string): Promise<{
    totalRevenue: number;
    netProfit: number;
    itemsSold: number;
    lowStockItems: number;
  }> {
    // Get total revenue
    const [revenueResult] = await db
      .select({ total: sum(sales.totalAmount) })
      .from(sales)
      .where(eq(sales.userId, userId));
    
    // Get total purchases cost
    const [purchasesResult] = await db
      .select({ total: sum(purchases.totalAmount) })
      .from(purchases)
      .where(eq(purchases.userId, userId));
    
    // Get total items sold
    const [itemsSoldResult] = await db
      .select({ total: sum(sales.quantity) })
      .from(sales)
      .where(eq(sales.userId, userId));
    
    // Get low stock items count
    const [lowStockResult] = await db
      .select({ count: count() })
      .from(products)
      .where(and(
        eq(products.userId, userId),
        sql`${products.currentStock} <= ${products.minStockLevel}`
      ));
    
    const totalRevenue = Number(revenueResult.total || 0);
    const totalCosts = Number(purchasesResult.total || 0);
    const netProfit = totalRevenue - totalCosts;
    
    return {
      totalRevenue,
      netProfit,
      itemsSold: Number(itemsSoldResult.total || 0),
      lowStockItems: lowStockResult.count,
    };
  }

  async getTopSellingProducts(userId: string, limit = 5): Promise<{
    product: Product;
    unitsSold: number;
    revenue: number;
  }[]> {
    const results = await db
      .select({
        product: products,
        unitsSold: sum(sales.quantity),
        revenue: sum(sales.totalAmount),
      })
      .from(sales)
      .innerJoin(products, eq(sales.productId, products.id))
      .where(eq(sales.userId, userId))
      .groupBy(products.id)
      .orderBy(desc(sum(sales.quantity)))
      .limit(limit);
    
    return results.map(result => ({
      product: result.product,
      unitsSold: Number(result.unitsSold || 0),
      revenue: Number(result.revenue || 0),
    }));
  }

  async getRecentTransactions(userId: string, limit = 10): Promise<{
    id: number;
    productName: string;
    type: 'sale' | 'purchase';
    quantity: number;
    amount: string;
    createdAt: Date | null;
  }[]> {
    const salesTransactions = await db
      .select({
        id: sales.id,
        productName: products.name,
        type: sql<'sale'>`'sale'`,
        quantity: sales.quantity,
        amount: sales.totalAmount,
        createdAt: sales.createdAt,
      })
      .from(sales)
      .innerJoin(products, eq(sales.productId, products.id))
      .where(eq(sales.userId, userId));
    
    const purchaseTransactions = await db
      .select({
        id: purchases.id,
        productName: products.name,
        type: sql<'purchase'>`'purchase'`,
        quantity: purchases.quantity,
        amount: purchases.totalAmount,
        createdAt: purchases.createdAt,
      })
      .from(purchases)
      .innerJoin(products, eq(purchases.productId, products.id))
      .where(eq(purchases.userId, userId));
    
    const allTransactions = [...salesTransactions, ...purchaseTransactions]
      .sort((a, b) => (b.createdAt?.getTime() || 0) - (a.createdAt?.getTime() || 0))
      .slice(0, limit);
    
    return allTransactions.map(transaction => ({
      ...transaction,
      amount: transaction.amount.toString(),
    }));
  }

  async getLowStockProducts(userId: string): Promise<Product[]> {
    return await db
      .select()
      .from(products)
      .where(and(
        eq(products.userId, userId),
        sql`${products.currentStock} <= ${products.minStockLevel}`
      ));
  }
}

export const storage = new DatabaseStorage();

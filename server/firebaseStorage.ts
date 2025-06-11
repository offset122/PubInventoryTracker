import { collections } from "./firebase";
import { 
  User, 
  UpsertUser, 
  Product, 
  InsertProduct, 
  Purchase, 
  InsertPurchase, 
  Sale, 
  InsertSale 
} from "@shared/schema";
import { IStorage } from "./storage";

export class FirebaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const userDoc = await collections.users.doc(id).get();
    if (!userDoc.exists) return undefined;
    return { id: userDoc.id, ...userDoc.data() } as User;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const userRef = collections.users.doc(userData.id);
    const userDoc = await userRef.get();
    
    if (userDoc.exists) {
      await userRef.update({
        ...userData,
        updatedAt: new Date(),
      });
    } else {
      await userRef.set({
        ...userData,
        createdAt: new Date(),
        updatedAt: new Date(),
      });
    }
    
    const updatedUser = await userRef.get();
    return { id: updatedUser.id, ...updatedUser.data() } as User;
  }

  // Product operations
  async getProducts(userId: string): Promise<Product[]> {
    const snapshot = await collections.products
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    })) as Product[];
  }

  async getProduct(id: number, userId: string): Promise<Product | undefined> {
    const productDoc = await collections.products.doc(id.toString()).get();
    if (!productDoc.exists) return undefined;
    
    const data = productDoc.data();
    if (data?.userId !== userId) return undefined;
    
    return { id: parseInt(productDoc.id), ...data } as Product;
  }

  async createProduct(product: InsertProduct & { userId: string }): Promise<Product> {
    const productRef = collections.products.doc();
    const productData = {
      ...product,
      createdAt: new Date(),
      updatedAt: new Date(),
    };
    
    await productRef.set(productData);
    return { id: parseInt(productRef.id), ...productData } as Product;
  }

  async updateProduct(id: number, product: Partial<InsertProduct>, userId: string): Promise<Product> {
    const productRef = collections.products.doc(id.toString());
    const productDoc = await productRef.get();
    
    if (!productDoc.exists || productDoc.data()?.userId !== userId) {
      throw new Error('Product not found');
    }
    
    await productRef.update({
      ...product,
      updatedAt: new Date(),
    });
    
    const updatedProduct = await productRef.get();
    return { id: parseInt(updatedProduct.id), ...updatedProduct.data() } as Product;
  }

  async deleteProduct(id: number, userId: string): Promise<void> {
    const productRef = collections.products.doc(id.toString());
    const productDoc = await productRef.get();
    
    if (!productDoc.exists || productDoc.data()?.userId !== userId) {
      throw new Error('Product not found');
    }
    
    await productRef.delete();
  }

  // Purchase operations
  async getPurchases(userId: string): Promise<Purchase[]> {
    const snapshot = await collections.purchases
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    })) as Purchase[];
  }

  async createPurchase(purchase: InsertPurchase & { userId: string }): Promise<Purchase> {
    const purchaseRef = collections.purchases.doc();
    const purchaseData = {
      ...purchase,
      createdAt: new Date(),
    };
    
    await purchaseRef.set(purchaseData);
    
    // Update product stock
    const productRef = collections.products.doc(purchase.productId.toString());
    const productDoc = await productRef.get();
    if (productDoc.exists) {
      const currentStock = productDoc.data()?.currentStock || 0;
      await productRef.update({
        currentStock: currentStock + purchase.quantity,
        updatedAt: new Date(),
      });
    }
    
    return { id: parseInt(purchaseRef.id), ...purchaseData } as Purchase;
  }

  async getRecentPurchases(userId: string, limit = 10): Promise<(Purchase & { product: Product })[]> {
    const snapshot = await collections.purchases
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    const purchases = [];
    for (const doc of snapshot.docs) {
      const purchaseData = { id: parseInt(doc.id), ...doc.data() } as Purchase;
      const productDoc = await collections.products.doc(purchaseData.productId.toString()).get();
      
      if (productDoc.exists) {
        purchases.push({
          ...purchaseData,
          product: { id: parseInt(productDoc.id), ...productDoc.data() } as Product
        });
      }
    }
    
    return purchases;
  }

  // Sale operations
  async getSales(userId: string): Promise<Sale[]> {
    const snapshot = await collections.sales
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .get();
    
    return snapshot.docs.map(doc => ({
      id: parseInt(doc.id),
      ...doc.data()
    })) as Sale[];
  }

  async createSale(sale: InsertSale & { userId: string }): Promise<Sale> {
    const saleRef = collections.sales.doc();
    const saleData = {
      ...sale,
      createdAt: new Date(),
    };
    
    await saleRef.set(saleData);
    
    // Update product stock
    const productRef = collections.products.doc(sale.productId.toString());
    const productDoc = await productRef.get();
    if (productDoc.exists) {
      const currentStock = productDoc.data()?.currentStock || 0;
      await productRef.update({
        currentStock: Math.max(0, currentStock - sale.quantity),
        updatedAt: new Date(),
      });
    }
    
    return { id: parseInt(saleRef.id), ...saleData } as Sale;
  }

  async getRecentSales(userId: string, limit = 10): Promise<(Sale & { product: Product })[]> {
    const snapshot = await collections.sales
      .where('userId', '==', userId)
      .orderBy('createdAt', 'desc')
      .limit(limit)
      .get();
    
    const sales = [];
    for (const doc of snapshot.docs) {
      const saleData = { id: parseInt(doc.id), ...doc.data() } as Sale;
      const productDoc = await collections.products.doc(saleData.productId.toString()).get();
      
      if (productDoc.exists) {
        sales.push({
          ...saleData,
          product: { id: parseInt(productDoc.id), ...productDoc.data() } as Product
        });
      }
    }
    
    return sales;
  }

  // Analytics operations
  async getDashboardStats(userId: string): Promise<{
    totalRevenue: number;
    netProfit: number;
    itemsSold: number;
    lowStockItems: number;
  }> {
    const [salesSnapshot, productsSnapshot] = await Promise.all([
      collections.sales.where('userId', '==', userId).get(),
      collections.products.where('userId', '==', userId).get()
    ]);
    
    let totalRevenue = 0;
    let totalCostOfGoodsSold = 0;
    let itemsSold = 0;
    
    for (const doc of salesSnapshot.docs) {
      const sale = doc.data() as Sale;
      const revenue = parseFloat(sale.totalAmount);
      totalRevenue += revenue;
      itemsSold += sale.quantity;
      
      // Get product to calculate cost
      const productDoc = await collections.products.doc(sale.productId.toString()).get();
      if (productDoc.exists) {
        const product = productDoc.data() as Product;
        const cost = parseFloat(product.buyingPrice) * sale.quantity;
        totalCostOfGoodsSold += cost;
      }
    }
    
    const netProfit = totalRevenue - totalCostOfGoodsSold;
    
    const lowStockItems = productsSnapshot.docs.filter(doc => {
      const product = doc.data() as Product;
      return product.currentStock <= product.minStockLevel;
    }).length;
    
    return {
      totalRevenue,
      netProfit,
      itemsSold,
      lowStockItems
    };
  }

  async getTopSellingProducts(userId: string, limit = 5): Promise<{
    product: Product;
    unitsSold: number;
    revenue: number;
  }[]> {
    const salesSnapshot = await collections.sales.where('userId', '==', userId).get();
    const productSales = new Map<number, { unitsSold: number; revenue: number }>();
    
    for (const doc of salesSnapshot.docs) {
      const sale = doc.data() as Sale;
      const existing = productSales.get(sale.productId) || { unitsSold: 0, revenue: 0 };
      productSales.set(sale.productId, {
        unitsSold: existing.unitsSold + sale.quantity,
        revenue: existing.revenue + parseFloat(sale.totalAmount)
      });
    }
    
    const results = [];
    for (const [productId, stats] of Array.from(productSales.entries())) {
      const productDoc = await collections.products.doc(productId.toString()).get();
      if (productDoc.exists) {
        results.push({
          product: { id: parseInt(productDoc.id), ...productDoc.data() } as Product,
          unitsSold: stats.unitsSold,
          revenue: stats.revenue
        });
      }
    }
    
    return results
      .sort((a, b) => b.unitsSold - a.unitsSold)
      .slice(0, limit);
  }

  async getRecentTransactions(userId: string, limit = 10): Promise<{
    id: number;
    productName: string;
    type: 'sale' | 'purchase';
    quantity: number;
    amount: string;
    createdAt: Date | null;
  }[]> {
    const [salesSnapshot, purchasesSnapshot] = await Promise.all([
      collections.sales.where('userId', '==', userId).orderBy('createdAt', 'desc').limit(limit).get(),
      collections.purchases.where('userId', '==', userId).orderBy('createdAt', 'desc').limit(limit).get()
    ]);
    
    const transactions = [];
    
    for (const doc of salesSnapshot.docs) {
      const sale = doc.data() as Sale;
      const productDoc = await collections.products.doc(sale.productId.toString()).get();
      if (productDoc.exists) {
        transactions.push({
          id: parseInt(doc.id),
          productName: productDoc.data()?.name || 'Unknown Product',
          type: 'sale' as const,
          quantity: sale.quantity,
          amount: sale.totalAmount,
          createdAt: sale.createdAt instanceof Date ? sale.createdAt : (sale.createdAt as any)?.toDate?.() || null
        });
      }
    }
    
    for (const doc of purchasesSnapshot.docs) {
      const purchase = doc.data() as Purchase;
      const productDoc = await collections.products.doc(purchase.productId.toString()).get();
      if (productDoc.exists) {
        transactions.push({
          id: parseInt(doc.id),
          productName: productDoc.data()?.name || 'Unknown Product',
          type: 'purchase' as const,
          quantity: purchase.quantity,
          amount: purchase.totalAmount,
          createdAt: purchase.createdAt instanceof Date ? purchase.createdAt : (purchase.createdAt as any)?.toDate?.() || null
        });
      }
    }
    
    return transactions
      .sort((a, b) => {
        if (!a.createdAt || !b.createdAt) return 0;
        return b.createdAt.getTime() - a.createdAt.getTime();
      })
      .slice(0, limit);
  }

  async getLowStockProducts(userId: string): Promise<Product[]> {
    const snapshot = await collections.products.where('userId', '==', userId).get();
    
    return snapshot.docs
      .map(doc => ({ id: parseInt(doc.id), ...doc.data() } as Product))
      .filter(product => product.currentStock <= product.minStockLevel);
  }
}

export const firebaseStorage = new FirebaseStorage();
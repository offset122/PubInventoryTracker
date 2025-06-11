import type { Express } from "express";
import { createServer, type Server } from "http";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./replitAuth";
import { insertProductSchema, insertPurchaseSchema, insertSaleSchema } from "@shared/schema";
import { z } from "zod";

async function generateAIInsights(userId: string, type: 'sales' | 'inventory' | 'profit' = 'sales') {
  const geminiApiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_AI_API_KEY || "";
  
  if (!geminiApiKey) {
    throw new Error("Gemini API key not configured");
  }

  try {
    // Get business data for AI analysis
    const [products, recentSales, recentPurchases, dashboardStats] = await Promise.all([
      storage.getProducts(userId),
      storage.getRecentSales(userId, 20),
      storage.getRecentPurchases(userId, 20),
      storage.getDashboardStats(userId),
    ]);

    const businessData = {
      totalProducts: products.length,
      totalRevenue: dashboardStats.totalRevenue,
      netProfit: dashboardStats.netProfit,
      itemsSold: dashboardStats.itemsSold,
      lowStockItems: dashboardStats.lowStockItems,
      topProducts: products.slice(0, 5).map(p => ({
        name: p.name,
        stock: p.currentStock,
        buyingPrice: p.buyingPrice,
        sellingPrice: p.sellingPrice,
      })),
      recentSalesCount: recentSales.length,
      recentPurchasesCount: recentPurchases.length,
    };

    const prompt = `
    As a business analyst for a pub, analyze the following business data and provide actionable insights:
    
    Business Data:
    ${JSON.stringify(businessData, null, 2)}
    
    Focus on ${type} analysis and provide:
    1. Key observations about current performance
    2. Specific recommendations for improvement
    3. Trends or patterns identified
    4. Action items for the pub owner
    
    Keep the response concise, practical, and focused on actionable insights for a small pub business.
    `;

    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${geminiApiKey}`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: prompt
          }]
        }]
      }),
    });

    if (!response.ok) {
      throw new Error(`Gemini API error: ${response.status}`);
    }

    const data = await response.json();
    const aiInsight = data.candidates?.[0]?.content?.parts?.[0]?.text || "Unable to generate insights at this time.";

    return {
      type,
      insight: aiInsight,
      timestamp: new Date().toISOString(),
      businessMetrics: dashboardStats,
    };
  } catch (error) {
    console.error("AI insights generation error:", error);
    return {
      type,
      insight: "AI insights are temporarily unavailable. Please check your configuration and try again.",
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : "Unknown error",
    };
  }
}

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Product routes
  app.get("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const products = await storage.getProducts(userId);
      res.json(products);
    } catch (error) {
      console.error("Error fetching products:", error);
      res.status(500).json({ message: "Failed to fetch products" });
    }
  });

  app.post("/api/products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productData = insertProductSchema.parse(req.body);
      const product = await storage.createProduct({ ...productData, userId });
      res.json(product);
    } catch (error) {
      console.error("Error creating product:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create product" });
      }
    }
  });

  app.put("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.id);
      const productData = insertProductSchema.partial().parse(req.body);
      const product = await storage.updateProduct(productId, productData, userId);
      res.json(product);
    } catch (error) {
      console.error("Error updating product:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid product data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to update product" });
      }
    }
  });

  app.delete("/api/products/:id", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const productId = parseInt(req.params.id);
      await storage.deleteProduct(productId, userId);
      res.json({ message: "Product deleted successfully" });
    } catch (error) {
      console.error("Error deleting product:", error);
      res.status(500).json({ message: "Failed to delete product" });
    }
  });

  // Purchase routes
  app.get("/api/purchases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchases = await storage.getPurchases(userId);
      res.json(purchases);
    } catch (error) {
      console.error("Error fetching purchases:", error);
      res.status(500).json({ message: "Failed to fetch purchases" });
    }
  });

  app.post("/api/purchases", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const purchaseData = insertPurchaseSchema.parse(req.body);
      const purchase = await storage.createPurchase({ ...purchaseData, userId });
      res.json(purchase);
    } catch (error) {
      console.error("Error creating purchase:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid purchase data", errors: error.errors });
      } else {
        res.status(500).json({ message: "Failed to create purchase" });
      }
    }
  });

  // Sale routes
  app.get("/api/sales", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sales = await storage.getSales(userId);
      res.json(sales);
    } catch (error) {
      console.error("Error fetching sales:", error);
      res.status(500).json({ message: "Failed to fetch sales" });
    }
  });

  app.post("/api/sales", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const saleData = insertSaleSchema.parse(req.body);
      const sale = await storage.createSale({ ...saleData, userId });
      res.json(sale);
    } catch (error) {
      console.error("Error creating sale:", error);
      if (error instanceof z.ZodError) {
        res.status(400).json({ message: "Invalid sale data", errors: error.errors });
      } else if (error instanceof Error) {
        res.status(400).json({ message: error.message });
      } else {
        res.status(500).json({ message: "Failed to create sale" });
      }
    }
  });

  // Dashboard and analytics routes
  app.get("/api/dashboard/stats", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const stats = await storage.getDashboardStats(userId);
      res.json(stats);
    } catch (error) {
      console.error("Error fetching dashboard stats:", error);
      res.status(500).json({ message: "Failed to fetch dashboard stats" });
    }
  });

  app.get("/api/dashboard/top-products", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const topProducts = await storage.getTopSellingProducts(userId);
      res.json(topProducts);
    } catch (error) {
      console.error("Error fetching top products:", error);
      res.status(500).json({ message: "Failed to fetch top products" });
    }
  });

  app.get("/api/dashboard/recent-transactions", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const transactions = await storage.getRecentTransactions(userId);
      res.json(transactions);
    } catch (error) {
      console.error("Error fetching recent transactions:", error);
      res.status(500).json({ message: "Failed to fetch recent transactions" });
    }
  });

  app.get("/api/inventory/low-stock", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const lowStockProducts = await storage.getLowStockProducts(userId);
      res.json(lowStockProducts);
    } catch (error) {
      console.error("Error fetching low stock products:", error);
      res.status(500).json({ message: "Failed to fetch low stock products" });
    }
  });

  // AI Insights routes
  app.get("/api/ai/insights", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const type = (req.query.type as 'sales' | 'inventory' | 'profit') || 'sales';
      const insights = await generateAIInsights(userId, type);
      res.json(insights);
    } catch (error) {
      console.error("Error generating AI insights:", error);
      res.status(500).json({ message: "Failed to generate AI insights" });
    }
  });

  app.post("/api/ai/insights/detailed", isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const { analysisType, dateRange, specificProducts } = req.body;
      
      // Generate detailed insights based on parameters
      const insights = await generateAIInsights(userId, analysisType || 'sales');
      res.json(insights);
    } catch (error) {
      console.error("Error generating detailed AI insights:", error);
      res.status(500).json({ message: "Failed to generate detailed AI insights" });
    }
  });

  const httpServer = createServer(app);
  return httpServer;
}

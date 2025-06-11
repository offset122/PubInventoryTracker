import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { AlertTriangle, Package, TrendingDown, TrendingUp } from "lucide-react";
import { Product } from "@shared/schema";

export default function Inventory() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: lowStockProducts, isLoading: lowStockLoading } = useQuery({
    queryKey: ["/api/inventory/low-stock"],
  });

  const getStockStatus = (product: Product) => {
    if (product.currentStock <= product.minStockLevel) {
      return { status: 'Low Stock', variant: 'destructive' as const, icon: AlertTriangle };
    } else if (product.currentStock <= product.minStockLevel * 2) {
      return { status: 'Medium Stock', variant: 'secondary' as const, icon: TrendingDown };
    } else {
      return { status: 'In Stock', variant: 'default' as const, icon: TrendingUp };
    }
  };

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <TopNavigation />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Page Header */}
              <div className="mb-8">
                <h1 className="text-2xl font-semibold text-gray-900">Inventory</h1>
                <p className="mt-2 text-sm text-gray-600">Monitor your stock levels and inventory status</p>
              </div>

              {/* Low Stock Alert */}
              {!lowStockLoading && lowStockProducts && lowStockProducts.length > 0 && (
                <Card className="mb-6 border-orange-200 bg-orange-50">
                  <CardHeader>
                    <CardTitle className="flex items-center text-orange-800">
                      <AlertTriangle className="mr-2 h-5 w-5" />
                      Low Stock Alert
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <p className="text-orange-700 mb-3">
                      {lowStockProducts.length} product{lowStockProducts.length > 1 ? 's' : ''} running low on stock
                    </p>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
                      {lowStockProducts.map((product: Product) => (
                        <div key={product.id} className="bg-white rounded-lg p-3 border border-orange-200">
                          <div className="flex justify-between items-center">
                            <span className="font-medium text-gray-900">{product.name}</span>
                            <span className="text-orange-600 font-semibold">{product.currentStock} left</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Inventory Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Current Inventory</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {[...Array(6)].map((_, i) => (
                        <div key={i} className="animate-pulse border border-gray-200 rounded-lg p-4">
                          <div className="h-6 bg-gray-300 rounded mb-2"></div>
                          <div className="space-y-2">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : products && products.length > 0 ? (
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      {products.map((product: Product) => {
                        const stockInfo = getStockStatus(product);
                        const StockIcon = stockInfo.icon;
                        
                        return (
                          <div key={product.id} className="border border-gray-200 rounded-lg p-4 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium text-gray-900">{product.name}</h4>
                              <Badge variant={stockInfo.variant} className="flex items-center">
                                <StockIcon className="mr-1 h-3 w-3" />
                                {stockInfo.status}
                              </Badge>
                            </div>
                            
                            <div className="space-y-2 text-sm">
                              <div className="flex justify-between">
                                <span className="text-gray-600">Current Stock:</span>
                                <span className="font-medium">{product.currentStock} units</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-gray-600">Minimum Level:</span>
                                <span className="font-medium">{product.minStockLevel} units</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-gray-600">Category:</span>
                                <span className="font-medium">{product.category}</span>
                              </div>
                              
                              <div className="flex justify-between">
                                <span className="text-gray-600">Value:</span>
                                <span className="font-medium">
                                  KSh {(product.currentStock * parseFloat(product.buyingPrice.toString())).toLocaleString()}
                                </span>
                              </div>
                            </div>

                            {/* Stock Level Progress Bar */}
                            <div className="mt-4">
                              <div className="flex justify-between text-xs text-gray-500 mb-1">
                                <span>Stock Level</span>
                                <span>{product.currentStock}/{product.minStockLevel * 3} units</span>
                              </div>
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full transition-all duration-300 ${
                                    product.currentStock <= product.minStockLevel 
                                      ? 'bg-red-500' 
                                      : product.currentStock <= product.minStockLevel * 2 
                                      ? 'bg-orange-500' 
                                      : 'bg-green-500'
                                  }`}
                                  style={{ 
                                    width: `${Math.min(100, Math.max(5, (product.currentStock / (product.minStockLevel * 3)) * 100))}%` 
                                  }}
                                ></div>
                              </div>
                            </div>

                            {/* Restock Recommendation */}
                            {product.currentStock <= product.minStockLevel && (
                              <div className="mt-3 bg-red-50 border border-red-200 rounded-md p-2">
                                <p className="text-xs text-red-700 font-medium">
                                  Recommended restock: {product.minStockLevel * 3 - product.currentStock} units
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No inventory data</h3>
                      <p className="text-gray-500">Add products to start tracking your inventory.</p>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

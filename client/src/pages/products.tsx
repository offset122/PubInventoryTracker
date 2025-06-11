import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { AddProductModal } from "@/components/modals/add-product-modal";
import { Plus, Package, AlertTriangle } from "lucide-react";
import { Product } from "@shared/schema";

export default function Products() {
  const [showAddProduct, setShowAddProduct] = useState(false);

  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  return (
    <div className="flex h-screen overflow-hidden">
      <Sidebar />
      <div className="flex flex-col w-0 flex-1 overflow-hidden">
        <TopNavigation />
        
        <main className="flex-1 relative overflow-y-auto focus:outline-none">
          <div className="py-6">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 md:px-8">
              {/* Page Header */}
              <div className="mb-8 flex justify-between items-center">
                <div>
                  <h1 className="text-2xl font-semibold text-gray-900">Products</h1>
                  <p className="mt-2 text-sm text-gray-600">Manage your inventory products</p>
                </div>
                <Button 
                  onClick={() => setShowAddProduct(true)}
                  className="bg-blue-600 hover:bg-blue-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Add Product
                </Button>
              </div>

              {/* Products Grid */}
              {isLoading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <Card key={i} className="animate-pulse">
                      <CardContent className="p-6">
                        <div className="h-6 bg-gray-300 rounded mb-4"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                          <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : products && products.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {products.map((product: Product) => (
                    <Card key={product.id} className="hover:shadow-lg transition-shadow">
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <CardTitle className="text-lg">{product.name}</CardTitle>
                          <Badge variant="secondary">{product.category}</Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Current Stock:</span>
                            <div className="flex items-center">
                              <span className="font-medium">{product.currentStock} units</span>
                              {product.currentStock <= product.minStockLevel && (
                                <AlertTriangle className="ml-2 h-4 w-4 text-orange-500" />
                              )}
                            </div>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Buying Price:</span>
                            <span className="font-medium">KSh {parseFloat(product.buyingPrice.toString()).toLocaleString()}</span>
                          </div>
                          
                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Selling Price:</span>
                            <span className="font-medium">KSh {parseFloat(product.sellingPrice.toString()).toLocaleString()}</span>
                          </div>

                          <div className="flex justify-between items-center">
                            <span className="text-sm text-gray-600">Profit Margin:</span>
                            <span className="font-medium text-green-600">
                              {(((parseFloat(product.sellingPrice.toString()) - parseFloat(product.buyingPrice.toString())) / parseFloat(product.buyingPrice.toString())) * 100).toFixed(1)}%
                            </span>
                          </div>

                          {/* Stock Level Indicator */}
                          <div className="w-full">
                            <div className="flex justify-between text-xs text-gray-500 mb-1">
                              <span>Stock Level</span>
                              <span>{product.currentStock}/{product.minStockLevel * 3}</span>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div 
                                className={`h-2 rounded-full ${
                                  product.currentStock <= product.minStockLevel 
                                    ? 'bg-red-500' 
                                    : product.currentStock <= product.minStockLevel * 2 
                                    ? 'bg-orange-500' 
                                    : 'bg-green-500'
                                }`}
                                style={{ 
                                  width: `${Math.min(100, (product.currentStock / (product.minStockLevel * 3)) * 100)}%` 
                                }}
                              ></div>
                            </div>
                          </div>

                          {product.currentStock <= product.minStockLevel && (
                            <div className="bg-orange-50 border border-orange-200 rounded-md p-2">
                              <p className="text-xs text-orange-700 font-medium">
                                Low Stock Alert - Restock needed
                              </p>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              ) : (
                <Card className="text-center py-12">
                  <CardContent>
                    <Package className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No products found</h3>
                    <p className="text-gray-500 mb-6">Get started by adding your first product.</p>
                    <Button 
                      onClick={() => setShowAddProduct(true)}
                      className="bg-blue-600 hover:bg-blue-700"
                    >
                      <Plus className="mr-2 h-4 w-4" />
                      Add Your First Product
                    </Button>
                  </CardContent>
                </Card>
              )}
            </div>
          </div>
        </main>
      </div>

      <AddProductModal open={showAddProduct} onOpenChange={setShowAddProduct} />
    </div>
  );
}

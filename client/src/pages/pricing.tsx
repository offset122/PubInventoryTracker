import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { TrendingUp, TrendingDown, Tags } from "lucide-react";
import { Product } from "@shared/schema";

export default function Pricing() {
  const { data: products, isLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const calculateProfitMargin = (buyingPrice: string, sellingPrice: string) => {
    const buying = parseFloat(buyingPrice);
    const selling = parseFloat(sellingPrice);
    return ((selling - buying) / buying) * 100;
  };

  const getProfitMarginColor = (margin: number) => {
    if (margin >= 50) return "text-green-600";
    if (margin >= 30) return "text-green-500";
    if (margin >= 15) return "text-yellow-600";
    return "text-red-500";
  };

  const getProfitMarginBadge = (margin: number) => {
    if (margin >= 50) return { variant: "default" as const, label: "Excellent" };
    if (margin >= 30) return { variant: "secondary" as const, label: "Good" };
    if (margin >= 15) return { variant: "outline" as const, label: "Fair" };
    return { variant: "destructive" as const, label: "Low" };
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
                <h1 className="text-2xl font-semibold text-gray-900">Pricing</h1>
                <p className="mt-2 text-sm text-gray-600">Manage product prices and analyze profit margins</p>
              </div>

              {/* Pricing Overview */}
              <Card>
                <CardHeader>
                  <CardTitle>Product Pricing</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse">
                          <div className="h-6 bg-gray-300 rounded mb-2"></div>
                          <div className="grid grid-cols-4 gap-4">
                            <div className="h-4 bg-gray-300 rounded"></div>
                            <div className="h-4 bg-gray-300 rounded"></div>
                            <div className="h-4 bg-gray-300 rounded"></div>
                            <div className="h-4 bg-gray-300 rounded"></div>
                          </div>
                        </div>
                      ))}
                    </div>
                  ) : products && products.length > 0 ? (
                    <div className="space-y-6">
                      {products.map((product: Product) => {
                        const profitMargin = calculateProfitMargin(
                          product.buyingPrice.toString(),
                          product.sellingPrice.toString()
                        );
                        const profitAmount = parseFloat(product.sellingPrice.toString()) - parseFloat(product.buyingPrice.toString());
                        const marginBadge = getProfitMarginBadge(profitMargin);

                        return (
                          <div key={product.id} className="border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
                            <div className="flex items-center justify-between mb-4">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{product.name}</h3>
                                <p className="text-sm text-gray-500">{product.category}</p>
                              </div>
                              <Badge variant={marginBadge.variant}>
                                {marginBadge.label} Margin
                              </Badge>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                              {/* Buying Price */}
                              <div className="text-center">
                                <div className="bg-red-50 rounded-lg p-4">
                                  <TrendingDown className="mx-auto h-6 w-6 text-red-600 mb-2" />
                                  <p className="text-sm text-gray-600 mb-1">Buying Price</p>
                                  <p className="text-lg font-semibold text-red-600">
                                    KSh {parseFloat(product.buyingPrice.toString()).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              {/* Selling Price */}
                              <div className="text-center">
                                <div className="bg-green-50 rounded-lg p-4">
                                  <TrendingUp className="mx-auto h-6 w-6 text-green-600 mb-2" />
                                  <p className="text-sm text-gray-600 mb-1">Selling Price</p>
                                  <p className="text-lg font-semibold text-green-600">
                                    KSh {parseFloat(product.sellingPrice.toString()).toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              {/* Profit Amount */}
                              <div className="text-center">
                                <div className="bg-blue-50 rounded-lg p-4">
                                  <Tags className="mx-auto h-6 w-6 text-blue-600 mb-2" />
                                  <p className="text-sm text-gray-600 mb-1">Profit per Unit</p>
                                  <p className="text-lg font-semibold text-blue-600">
                                    KSh {profitAmount.toLocaleString()}
                                  </p>
                                </div>
                              </div>

                              {/* Profit Margin */}
                              <div className="text-center">
                                <div className="bg-purple-50 rounded-lg p-4">
                                  <div className="mx-auto h-6 w-6 bg-purple-600 rounded-full flex items-center justify-center mb-2">
                                    <span className="text-white text-xs font-bold">%</span>
                                  </div>
                                  <p className="text-sm text-gray-600 mb-1">Profit Margin</p>
                                  <p className={`text-lg font-semibold ${getProfitMarginColor(profitMargin)}`}>
                                    {profitMargin.toFixed(1)}%
                                  </p>
                                </div>
                              </div>
                            </div>

                            {/* Additional Metrics */}
                            <div className="mt-4 pt-4 border-t border-gray-200">
                              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                                <div>
                                  <span className="text-gray-500">Current Stock:</span>
                                  <span className="ml-2 font-medium">{product.currentStock} units</span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Stock Value (Cost):</span>
                                  <span className="ml-2 font-medium">
                                    KSh {(product.currentStock * parseFloat(product.buyingPrice.toString())).toLocaleString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Stock Value (Retail):</span>
                                  <span className="ml-2 font-medium">
                                    KSh {(product.currentStock * parseFloat(product.sellingPrice.toString())).toLocaleString()}
                                  </span>
                                </div>
                                <div>
                                  <span className="text-gray-500">Potential Profit:</span>
                                  <span className="ml-2 font-medium text-green-600">
                                    KSh {(product.currentStock * profitAmount).toLocaleString()}
                                  </span>
                                </div>
                              </div>
                            </div>

                            {/* Recommendations */}
                            {profitMargin < 15 && (
                              <div className="mt-4 bg-yellow-50 border border-yellow-200 rounded-md p-3">
                                <p className="text-sm text-yellow-800">
                                  <strong>Recommendation:</strong> Consider increasing the selling price. 
                                  Current margin of {profitMargin.toFixed(1)}% is below recommended minimum of 15%.
                                </p>
                              </div>
                            )}
                          </div>
                        );
                      })}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Tags className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No pricing data</h3>
                      <p className="text-gray-500">Add products to view pricing analysis.</p>
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

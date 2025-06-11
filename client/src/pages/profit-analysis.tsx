import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { RevenueChart } from "@/components/charts/revenue-chart";
import { TrendingUp, TrendingDown, DollarSign, Percent, BarChart3 } from "lucide-react";
import { Product } from "@shared/schema";

export default function ProfitAnalysis() {
  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: products, isLoading: productsLoading } = useQuery({
    queryKey: ["/api/products"],
  });

  const { data: topProducts, isLoading: topProductsLoading } = useQuery({
    queryKey: ["/api/dashboard/top-products"],
  });

  const calculateOverallMargin = () => {
    if (!stats) return 0;
    return stats.totalRevenue > 0 ? (stats.netProfit / stats.totalRevenue) * 100 : 0;
  };

  const getProductProfitAnalysis = () => {
    if (!products) return [];
    
    return products.map((product: Product) => {
      const buyingPrice = parseFloat(product.buyingPrice.toString());
      const sellingPrice = parseFloat(product.sellingPrice.toString());
      const profitPerUnit = sellingPrice - buyingPrice;
      const profitMargin = buyingPrice > 0 ? (profitPerUnit / buyingPrice) * 100 : 0;
      const stockValue = product.currentStock * buyingPrice;
      const potentialProfit = product.currentStock * profitPerUnit;

      return {
        ...product,
        profitPerUnit,
        profitMargin,
        stockValue,
        potentialProfit,
      };
    }).sort((a, b) => b.profitMargin - a.profitMargin);
  };

  const productAnalysis = getProductProfitAnalysis();
  const overallMargin = calculateOverallMargin();

  if (statsLoading || productsLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavigation />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                {[...Array(4)].map((_, i) => (
                  <div key={i} className="h-32 bg-gray-300 rounded"></div>
                ))}
              </div>
            </div>
          </main>
        </div>
      </div>
    );
  }

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
                <h1 className="text-2xl font-semibold text-gray-900">Profit Analysis</h1>
                <p className="mt-2 text-sm text-gray-600">Detailed analysis of your business profitability</p>
              </div>

              {/* Key Metrics Cards */}
              <div className="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-4 gap-6 mb-8">
                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <DollarSign className="h-8 w-8 text-green-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Total Revenue</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            KSh {stats?.totalRevenue?.toLocaleString() || '0'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <TrendingUp className="h-8 w-8 text-blue-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Net Profit</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            KSh {stats?.netProfit?.toLocaleString() || '0'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <Percent className="h-8 w-8 text-purple-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Profit Margin</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {overallMargin.toFixed(1)}%
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                <Card>
                  <CardContent className="p-6">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <BarChart3 className="h-8 w-8 text-orange-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Items Sold</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {stats?.itemsSold?.toLocaleString() || '0'}
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Revenue Chart */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Revenue Trend</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <RevenueChart />
                  </CardContent>
                </Card>

                {/* Product Profitability Analysis */}
                <Card className="lg:col-span-2">
                  <CardHeader>
                    <CardTitle>Product Profitability Analysis</CardTitle>
                  </CardHeader>
                  <CardContent>
                    {productAnalysis.length > 0 ? (
                      <div className="space-y-4">
                        {productAnalysis.slice(0, 10).map((product) => (
                          <div key={product.id} className="border border-gray-200 rounded-lg p-4">
                            <div className="flex items-center justify-between mb-3">
                              <div>
                                <h4 className="font-medium text-gray-900">{product.name}</h4>
                                <p className="text-sm text-gray-500">{product.category}</p>
                              </div>
                              <div className="text-right">
                                <p className={`text-lg font-semibold ${
                                  product.profitMargin >= 30 ? 'text-green-600' : 
                                  product.profitMargin >= 15 ? 'text-yellow-600' : 'text-red-500'
                                }`}>
                                  {product.profitMargin.toFixed(1)}%
                                </p>
                                <p className="text-sm text-gray-500">Margin</p>
                              </div>
                            </div>

                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                              <div>
                                <span className="text-gray-500">Profit/Unit:</span>
                                <p className="font-medium">KSh {product.profitPerUnit.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Stock Value:</span>
                                <p className="font-medium">KSh {product.stockValue.toLocaleString()}</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Current Stock:</span>
                                <p className="font-medium">{product.currentStock} units</p>
                              </div>
                              <div>
                                <span className="text-gray-500">Potential Profit:</span>
                                <p className="font-medium text-green-600">KSh {product.potentialProfit.toLocaleString()}</p>
                              </div>
                            </div>

                            {/* Profitability Indicator */}
                            <div className="mt-3">
                              <div className="w-full bg-gray-200 rounded-full h-2">
                                <div 
                                  className={`h-2 rounded-full ${
                                    product.profitMargin >= 50 ? 'bg-green-500' :
                                    product.profitMargin >= 30 ? 'bg-green-400' :
                                    product.profitMargin >= 15 ? 'bg-yellow-500' : 'bg-red-500'
                                  }`}
                                  style={{ width: `${Math.min(100, product.profitMargin)}%` }}
                                ></div>
                              </div>
                              <div className="flex justify-between text-xs text-gray-500 mt-1">
                                <span>Low</span>
                                <span>High Profitability</span>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    ) : (
                      <div className="text-center py-8">
                        <BarChart3 className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                        <p className="text-gray-500">No product data available for analysis</p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              </div>

              {/* Performance Insights */}
              <Card className="mt-8">
                <CardHeader>
                  <CardTitle>Performance Insights</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {/* Best Performing Product */}
                    {productAnalysis.length > 0 && (
                      <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <TrendingUp className="h-5 w-5 text-green-600 mr-2" />
                          <h4 className="font-medium text-green-800">Best Margin</h4>
                        </div>
                        <p className="text-sm text-green-700 mb-1">{productAnalysis[0].name}</p>
                        <p className="text-lg font-semibold text-green-600">
                          {productAnalysis[0].profitMargin.toFixed(1)}% margin
                        </p>
                      </div>
                    )}

                    {/* Needs Attention */}
                    {productAnalysis.length > 0 && (
                      <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center mb-2">
                          <TrendingDown className="h-5 w-5 text-orange-600 mr-2" />
                          <h4 className="font-medium text-orange-800">Needs Attention</h4>
                        </div>
                        {(() => {
                          const lowMarginProduct = productAnalysis.find(p => p.profitMargin < 15);
                          return lowMarginProduct ? (
                            <>
                              <p className="text-sm text-orange-700 mb-1">{lowMarginProduct.name}</p>
                              <p className="text-lg font-semibold text-orange-600">
                                {lowMarginProduct.profitMargin.toFixed(1)}% margin
                              </p>
                            </>
                          ) : (
                            <p className="text-sm text-orange-700">All products performing well</p>
                          );
                        })()}
                      </div>
                    )}

                    {/* Total Potential */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center mb-2">
                        <DollarSign className="h-5 w-5 text-blue-600 mr-2" />
                        <h4 className="font-medium text-blue-800">Total Potential</h4>
                      </div>
                      <p className="text-sm text-blue-700 mb-1">If all stock sold</p>
                      <p className="text-lg font-semibold text-blue-600">
                        KSh {productAnalysis.reduce((sum, p) => sum + p.potentialProfit, 0).toLocaleString()}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}

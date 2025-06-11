import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { AddProductModal } from "@/components/modals/add-product-modal";
import { RecordSaleModal } from "@/components/modals/record-sale-modal";
import { RecordPurchaseModal } from "@/components/modals/record-purchase-modal";
import { DollarSign, TrendingUp, ShoppingCart, AlertTriangle, Plus, Coins, Brain } from "lucide-react";
import { useState } from "react";
import { Badge } from "@/components/ui/badge";

export default function Dashboard() {
  const [showAddProduct, setShowAddProduct] = useState(false);
  const [showRecordSale, setShowRecordSale] = useState(false);
  const [showRecordPurchase, setShowRecordPurchase] = useState(false);

  const { data: stats, isLoading: statsLoading } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const { data: topProducts, isLoading: topProductsLoading } = useQuery({
    queryKey: ["/api/dashboard/top-products"],
  });

  const { data: recentTransactions, isLoading: transactionsLoading } = useQuery({
    queryKey: ["/api/dashboard/recent-transactions"],
  });

  const { data: aiInsights, isLoading: aiLoading } = useQuery({
    queryKey: ["/api/ai/insights"],
  });

  if (statsLoading) {
    return (
      <div className="flex h-screen">
        <Sidebar />
        <div className="flex-1 flex flex-col overflow-hidden">
          <TopNavigation />
          <main className="flex-1 overflow-y-auto p-6">
            <div className="animate-pulse">
              <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
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
                <h1 className="text-2xl font-semibold text-gray-900">Dashboard</h1>
                <p className="mt-2 text-sm text-gray-600">Overview of Club Jamuhuri's performance</p>
              </div>

              {/* Stats Cards */}
              <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                <Card>
                  <CardContent className="p-5">
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
                  <CardContent className="p-5">
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
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <ShoppingCart className="h-8 w-8 text-orange-600" />
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

                <Card>
                  <CardContent className="p-5">
                    <div className="flex items-center">
                      <div className="flex-shrink-0">
                        <AlertTriangle className="h-8 w-8 text-red-600" />
                      </div>
                      <div className="ml-5 w-0 flex-1">
                        <dl>
                          <dt className="text-sm font-medium text-gray-500 truncate">Low Stock Alert</dt>
                          <dd className="text-lg font-medium text-gray-900">
                            {stats?.lowStockItems || 0} Items
                          </dd>
                        </dl>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Main Content Grid */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* Quick Actions */}
                <div className="lg:col-span-1">
                  <Card className="p-6">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-lg">Quick Actions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      <div className="space-y-3">
                        <Button 
                          onClick={() => setShowAddProduct(true)}
                          className="w-full bg-blue-600 hover:bg-blue-700 text-white"
                        >
                          <Plus className="mr-2 h-4 w-4" />
                          Add New Product
                        </Button>
                        <Button 
                          onClick={() => setShowRecordSale(true)}
                          className="w-full bg-green-600 hover:bg-green-700 text-white"
                        >
                          <Coins className="mr-2 h-4 w-4" />
                          Record Sale
                        </Button>
                        <Button 
                          onClick={() => setShowRecordPurchase(true)}
                          className="w-full bg-orange-600 hover:bg-orange-700 text-white"
                        >
                          <ShoppingCart className="mr-2 h-4 w-4" />
                          Record Purchase
                        </Button>
                      </div>
                    </CardContent>
                  </Card>

                  {/* Top Selling Products */}
                  <Card className="p-6 mt-6">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-lg">Top Selling Products</CardTitle>
                    </CardHeader>
                    <CardContent className="p-0">
                      {topProductsLoading ? (
                        <div className="space-y-4">
                          {[...Array(3)].map((_, i) => (
                            <div key={i} className="animate-pulse flex items-center space-x-3">
                              <div className="w-10 h-10 bg-gray-300 rounded-full"></div>
                              <div className="flex-1 space-y-2">
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : topProducts && topProducts.length > 0 ? (
                        <div className="space-y-4">
                          {topProducts.map((item: any, index: number) => (
                            <div key={index} className="flex items-center justify-between">
                              <div className="flex items-center">
                                <div className="w-10 h-10 bg-amber-100 rounded-full flex items-center justify-center">
                                  <span className="text-amber-600 font-semibold">{index + 1}</span>
                                </div>
                                <div className="ml-3">
                                  <p className="text-sm font-medium text-gray-900">{item.product.name}</p>
                                  <p className="text-xs text-gray-500">{item.unitsSold} units sold</p>
                                </div>
                              </div>
                              <div className="text-sm font-medium text-gray-900">
                                KSh {item.revenue.toLocaleString()}
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-4">No sales data available</p>
                      )}
                    </CardContent>
                  </Card>
                </div>

                {/* Recent Activity & Transactions */}
                <div className="lg:col-span-2 space-y-6">
                  {/* Recent Transactions */}
                  <Card>
                    <CardHeader className="px-6 py-4 border-b border-gray-200">
                      <CardTitle className="text-lg">Recent Transactions</CardTitle>
                    </CardHeader>
                    <CardContent className="p-6">
                      {transactionsLoading ? (
                        <div className="space-y-4">
                          {[...Array(5)].map((_, i) => (
                            <div key={i} className="animate-pulse flex items-center space-x-4">
                              <div className="h-4 bg-gray-300 rounded flex-1"></div>
                              <div className="h-4 bg-gray-300 rounded w-20"></div>
                              <div className="h-4 bg-gray-300 rounded w-16"></div>
                            </div>
                          ))}
                        </div>
                      ) : recentTransactions && recentTransactions.length > 0 ? (
                        <div className="overflow-x-auto">
                          <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                              <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Product</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Type</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Quantity</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Amount</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                              </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                              {recentTransactions.map((transaction: any) => (
                                <tr key={`${transaction.type}-${transaction.id}`}>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {transaction.productName}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap">
                                    <Badge variant={transaction.type === 'sale' ? 'default' : 'secondary'}>
                                      {transaction.type}
                                    </Badge>
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    {transaction.quantity}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                    KSh {parseFloat(transaction.amount).toLocaleString()}
                                  </td>
                                  <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                    {transaction.createdAt ? new Date(transaction.createdAt).toLocaleDateString() : 'N/A'}
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        </div>
                      ) : (
                        <p className="text-gray-500 text-center py-8">No transactions found</p>
                      )}
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* AI Insights Section */}
              <div className="mt-8">
                <Card className="bg-gradient-to-r from-purple-500 to-purple-600 text-white">
                  <CardContent className="p-6">
                    <CardHeader className="p-0 mb-4">
                      <CardTitle className="text-lg flex items-center">
                        <Brain className="mr-3 h-6 w-6" />
                        AI Business Insights
                      </CardTitle>
                    </CardHeader>
                    {aiLoading ? (
                      <div className="animate-pulse">
                        <div className="h-4 bg-white bg-opacity-20 rounded mb-2"></div>
                        <div className="h-4 bg-white bg-opacity-20 rounded w-3/4"></div>
                      </div>
                    ) : aiInsights ? (
                      <div className="space-y-4">
                        <div className="bg-white bg-opacity-20 rounded-lg p-4">
                          <h4 className="font-medium mb-2">AI Analysis</h4>
                          <p className="text-sm opacity-90">
                            {aiInsights.insight.substring(0, 200)}...
                          </p>
                        </div>
                      </div>
                    ) : (
                      <p className="text-sm opacity-90">AI insights are being generated...</p>
                    )}
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </main>
      </div>

      {/* Modals */}
      <AddProductModal open={showAddProduct} onOpenChange={setShowAddProduct} />
      <RecordSaleModal open={showRecordSale} onOpenChange={setShowRecordSale} />
      <RecordPurchaseModal open={showRecordPurchase} onOpenChange={setShowRecordPurchase} />
    </div>
  );
}

import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { RecordPurchaseModal } from "@/components/modals/record-purchase-modal";
import { Plus, ShoppingCart } from "lucide-react";

export default function Purchases() {
  const [showRecordPurchase, setShowRecordPurchase] = useState(false);

  const { data: purchases, isLoading } = useQuery({
    queryKey: ["/api/purchases"],
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
                  <h1 className="text-2xl font-semibold text-gray-900">Purchases</h1>
                  <p className="mt-2 text-sm text-gray-600">Track your inventory purchases</p>
                </div>
                <Button 
                  onClick={() => setShowRecordPurchase(true)}
                  className="bg-orange-600 hover:bg-orange-700"
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Record Purchase
                </Button>
              </div>

              {/* Purchases Table */}
              <Card>
                <CardHeader>
                  <CardTitle>Purchase History</CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="space-y-4">
                      {[...Array(5)].map((_, i) => (
                        <div key={i} className="animate-pulse flex items-center space-x-4">
                          <div className="h-4 bg-gray-300 rounded flex-1"></div>
                          <div className="h-4 bg-gray-300 rounded w-20"></div>
                          <div className="h-4 bg-gray-300 rounded w-24"></div>
                          <div className="h-4 bg-gray-300 rounded w-16"></div>
                        </div>
                      ))}
                    </div>
                  ) : purchases && purchases.length > 0 ? (
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                          <tr>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Product
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Quantity
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Unit Price
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Total Amount
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Supplier
                            </th>
                            <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                              Date
                            </th>
                          </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                          {purchases.map((purchase: any) => (
                            <tr key={purchase.id}>
                              <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                {purchase.productId}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                {purchase.quantity}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                KSh {parseFloat(purchase.unitPrice.toString()).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                KSh {parseFloat(purchase.totalAmount.toString()).toLocaleString()}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {purchase.supplier || 'N/A'}
                              </td>
                              <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                {purchase.createdAt ? new Date(purchase.createdAt).toLocaleDateString() : 'N/A'}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <ShoppingCart className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No purchases recorded</h3>
                      <p className="text-gray-500 mb-6">Start by recording your first purchase.</p>
                      <Button 
                        onClick={() => setShowRecordPurchase(true)}
                        className="bg-orange-600 hover:bg-orange-700"
                      >
                        <Plus className="mr-2 h-4 w-4" />
                        Record Your First Purchase
                      </Button>
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>

      <RecordPurchaseModal open={showRecordPurchase} onOpenChange={setShowRecordPurchase} />
    </div>
  );
}

import { useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Sidebar } from "@/components/layout/sidebar";
import { TopNavigation } from "@/components/layout/top-navigation";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Brain, TrendingUp, AlertCircle, Lightbulb, RefreshCw } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";

export default function AIInsights() {
  const [analysisType, setAnalysisType] = useState<'sales' | 'inventory' | 'profit'>('sales');
  const { toast } = useToast();

  const { data: insights, isLoading, refetch } = useQuery({
    queryKey: ["/api/ai/insights", { type: analysisType }],
    queryFn: () => fetch(`/api/ai/insights?type=${analysisType}`, { credentials: 'include' }).then(res => res.json()),
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  const generateDetailedInsights = useMutation({
    mutationFn: async (data: any) => {
      const response = await apiRequest('POST', '/api/ai/insights/detailed', data);
      return response.json();
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Detailed insights generated successfully",
      });
      refetch();
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to generate insights",
        variant: "destructive",
      });
    },
  });

  const handleGenerateDetailedReport = () => {
    generateDetailedInsights.mutate({
      analysisType,
      dateRange: 'last_30_days',
      specificProducts: null,
    });
  };

  const formatInsightText = (text: string) => {
    // Split the text into sections and format them
    const sections = text.split(/(\d+\.|Key|Recommendations?|Trends?|Action|Observations?)/i);
    return sections.map((section, index) => {
      if (section.match(/\d+\./)) {
        return <strong key={index} className="text-gray-900">{section}</strong>;
      }
      if (section.match(/Key|Recommendations?|Trends?|Action|Observations?/i)) {
        return <strong key={index} className="text-blue-600 block mt-4 mb-2">{section}</strong>;
      }
      return <span key={index}>{section}</span>;
    });
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
                <h1 className="text-2xl font-semibold text-gray-900 flex items-center">
                  <Brain className="mr-3 h-8 w-8 text-purple-600" />
                  AI Business Insights
                </h1>
                <p className="mt-2 text-sm text-gray-600">
                  Get intelligent recommendations and business analytics powered by AI
                </p>
              </div>

              {/* Controls */}
              <Card className="mb-8">
                <CardHeader>
                  <CardTitle>Analysis Controls</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center">
                    <div className="flex-1">
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Analysis Type
                      </label>
                      <Select value={analysisType} onValueChange={(value: any) => setAnalysisType(value)}>
                        <SelectTrigger className="w-full sm:w-48">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="sales">Sales Analysis</SelectItem>
                          <SelectItem value="inventory">Inventory Analysis</SelectItem>
                          <SelectItem value="profit">Profit Analysis</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                    
                    <div className="flex gap-2">
                      <Button 
                        onClick={() => refetch()}
                        variant="outline"
                        disabled={isLoading}
                      >
                        <RefreshCw className={`mr-2 h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
                        Refresh
                      </Button>
                      
                      <Button 
                        onClick={handleGenerateDetailedReport}
                        disabled={generateDetailedInsights.isPending}
                        className="bg-purple-600 hover:bg-purple-700"
                      >
                        <Brain className="mr-2 h-4 w-4" />
                        {generateDetailedInsights.isPending ? 'Generating...' : 'Detailed Report'}
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Current Business Metrics */}
              {stats && (
                <Card className="mb-8">
                  <CardHeader>
                    <CardTitle>Current Business Snapshot</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                      <div className="text-center">
                        <div className="text-2xl font-bold text-green-600">
                          KSh {stats.totalRevenue?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-gray-500">Total Revenue</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-blue-600">
                          KSh {stats.netProfit?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-gray-500">Net Profit</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-orange-600">
                          {stats.itemsSold?.toLocaleString() || '0'}
                        </div>
                        <div className="text-sm text-gray-500">Items Sold</div>
                      </div>
                      <div className="text-center">
                        <div className="text-2xl font-bold text-red-600">
                          {stats.lowStockItems || '0'}
                        </div>
                        <div className="text-sm text-gray-500">Low Stock Items</div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* AI Insights */}
              <Card className="mb-8">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <CardTitle className="flex items-center">
                      <Brain className="mr-2 h-5 w-5 text-purple-600" />
                      AI Analysis: {analysisType.charAt(0).toUpperCase() + analysisType.slice(1)}
                    </CardTitle>
                    {insights && (
                      <Badge variant="secondary">
                        Generated {new Date(insights.timestamp).toLocaleString()}
                      </Badge>
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-12">
                      <div className="text-center">
                        <Brain className="mx-auto h-12 w-12 text-purple-600 animate-pulse mb-4" />
                        <p className="text-gray-600">AI is analyzing your business data...</p>
                      </div>
                    </div>
                  ) : insights ? (
                    <div className="space-y-6">
                      {insights.error ? (
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                          <div className="flex items-center mb-2">
                            <AlertCircle className="h-5 w-5 text-red-600 mr-2" />
                            <h4 className="font-medium text-red-800">Analysis Error</h4>
                          </div>
                          <p className="text-red-700">{insights.insight}</p>
                          {insights.error && (
                            <p className="text-sm text-red-600 mt-2">Error: {insights.error}</p>
                          )}
                        </div>
                      ) : (
                        <div className="bg-gradient-to-r from-purple-50 to-blue-50 border border-purple-200 rounded-lg p-6">
                          <div className="flex items-start mb-4">
                            <Lightbulb className="h-6 w-6 text-purple-600 mr-3 mt-1 flex-shrink-0" />
                            <div className="flex-1">
                              <h4 className="font-medium text-purple-800 mb-3">AI Recommendations</h4>
                              <div className="text-gray-700 leading-relaxed whitespace-pre-line">
                                {formatInsightText(insights.insight)}
                              </div>
                            </div>
                          </div>
                        </div>
                      )}

                      {insights.businessMetrics && (
                        <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                          <h4 className="font-medium text-gray-800 mb-3">Analysis Based On</h4>
                          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                            <div>
                              <span className="text-gray-600">Revenue:</span>
                              <span className="ml-2 font-medium">
                                KSh {insights.businessMetrics.totalRevenue?.toLocaleString() || '0'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Profit:</span>
                              <span className="ml-2 font-medium">
                                KSh {insights.businessMetrics.netProfit?.toLocaleString() || '0'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Items Sold:</span>
                              <span className="ml-2 font-medium">
                                {insights.businessMetrics.itemsSold?.toLocaleString() || '0'}
                              </span>
                            </div>
                            <div>
                              <span className="text-gray-600">Low Stock:</span>
                              <span className="ml-2 font-medium">
                                {insights.businessMetrics.lowStockItems || '0'} items
                              </span>
                            </div>
                          </div>
                        </div>
                      )}
                    </div>
                  ) : (
                    <div className="text-center py-12">
                      <Brain className="mx-auto h-12 w-12 text-gray-400 mb-4" />
                      <h3 className="text-lg font-medium text-gray-900 mb-2">No insights available</h3>
                      <p className="text-gray-500 mb-6">Click "Refresh" to generate AI insights for your business.</p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Tips */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center">
                    <TrendingUp className="mr-2 h-5 w-5 text-green-600" />
                    Business Tips
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h4 className="font-medium text-green-800 mb-2">Sales Optimization</h4>
                      <p className="text-sm text-green-700">
                        Focus on products with high margins and consistent demand to maximize profitability.
                      </p>
                    </div>
                    
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <h4 className="font-medium text-blue-800 mb-2">Inventory Management</h4>
                      <p className="text-sm text-blue-700">
                        Maintain optimal stock levels to avoid overstocking while preventing stockouts.
                      </p>
                    </div>
                    
                    <div className="bg-purple-50 border border-purple-200 rounded-lg p-4">
                      <h4 className="font-medium text-purple-800 mb-2">Cost Control</h4>
                      <p className="text-sm text-purple-700">
                        Regularly review supplier prices and negotiate better deals for high-volume purchases.
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

import { useQuery } from "@tanstack/react-query";
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";
import { Card } from "@/components/ui/card";
import { TrendingUp, TrendingDown } from "lucide-react";

export function RevenueChart() {
  const { data: transactions } = useQuery({
    queryKey: ["/api/dashboard/recent-transactions"],
  });

  const { data: stats } = useQuery({
    queryKey: ["/api/dashboard/stats"],
  });

  // Process transaction data for the chart
  const processChartData = () => {
    if (!transactions || transactions.length === 0) {
      // Return sample structure for empty state
      return [];
    }

    // Group transactions by date and calculate daily revenue
    const dailyData: { [key: string]: { revenue: number; sales: number; purchases: number } } = {};
    
    transactions.forEach((transaction: any) => {
      if (!transaction.createdAt) return;
      
      const date = new Date(transaction.createdAt).toLocaleDateString();
      const amount = parseFloat(transaction.amount) || 0;
      
      if (!dailyData[date]) {
        dailyData[date] = { revenue: 0, sales: 0, purchases: 0 };
      }
      
      if (transaction.type === 'sale') {
        dailyData[date].revenue += amount;
        dailyData[date].sales += amount;
      } else {
        dailyData[date].purchases += amount;
      }
    });

    // Convert to array and sort by date
    return Object.entries(dailyData)
      .map(([date, data]) => ({
        date,
        revenue: data.revenue,
        sales: data.sales,
        purchases: data.purchases,
        profit: data.sales - data.purchases,
      }))
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(-7); // Last 7 days
  };

  const chartData = processChartData();

  const formatCurrency = (value: number) => `KSh ${value.toLocaleString()}`;

  const CustomTooltip = ({ active, payload, label }: any) => {
    if (active && payload && payload.length) {
      return (
        <div className="bg-white p-3 border border-gray-200 rounded-lg shadow-lg">
          <p className="font-medium text-gray-900">{label}</p>
          {payload.map((entry: any, index: number) => (
            <p key={index} style={{ color: entry.color }} className="text-sm">
              {entry.dataKey === 'revenue' && 'Revenue: '}
              {entry.dataKey === 'profit' && 'Profit: '}
              {entry.dataKey === 'sales' && 'Sales: '}
              {entry.dataKey === 'purchases' && 'Purchases: '}
              {formatCurrency(entry.value)}
            </p>
          ))}
        </div>
      );
    }
    return null;
  };

  if (!chartData || chartData.length === 0) {
    return (
      <div className="h-80 flex items-center justify-center text-gray-500">
        <div className="text-center">
          <TrendingUp className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <p className="text-lg font-medium">No transaction data available</p>
          <p className="text-sm">Start recording sales and purchases to see revenue trends</p>
        </div>
      </div>
    );
  }

  const totalRevenue = chartData.reduce((sum, day) => sum + day.revenue, 0);
  const totalProfit = chartData.reduce((sum, day) => sum + day.profit, 0);
  const averageDailyRevenue = totalRevenue / chartData.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-green-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">7-Day Revenue</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(totalRevenue)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-blue-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">7-Day Profit</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(totalProfit)}
              </p>
            </div>
          </div>
        </Card>
        
        <Card className="p-4">
          <div className="flex items-center">
            <TrendingUp className="h-8 w-8 text-purple-600 mr-3" />
            <div>
              <p className="text-sm text-gray-600">Daily Average</p>
              <p className="text-lg font-semibold text-gray-900">
                {formatCurrency(averageDailyRevenue)}
              </p>
            </div>
          </div>
        </Card>
      </div>

      {/* Revenue Line Chart */}
      <div className="h-80">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Revenue Trend (Last 7 Days)</h3>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `KSh ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Line 
              type="monotone" 
              dataKey="revenue" 
              stroke="#10b981" 
              strokeWidth={3}
              dot={{ fill: '#10b981', strokeWidth: 2, r: 4 }}
              activeDot={{ r: 6, stroke: '#10b981', strokeWidth: 2 }}
            />
            <Line 
              type="monotone" 
              dataKey="profit" 
              stroke="#3b82f6" 
              strokeWidth={2}
              dot={{ fill: '#3b82f6', strokeWidth: 2, r: 3 }}
              strokeDasharray="5 5"
            />
          </LineChart>
        </ResponsiveContainer>
      </div>

      {/* Sales vs Purchases Bar Chart */}
      <div className="h-80">
        <h3 className="text-lg font-medium text-gray-900 mb-4">Sales vs Purchases</h3>
        <ResponsiveContainer width="100%" height="100%">
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
            <XAxis 
              dataKey="date" 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => new Date(value).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
            />
            <YAxis 
              stroke="#6b7280"
              fontSize={12}
              tickFormatter={(value) => `KSh ${(value / 1000).toFixed(0)}k`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Bar dataKey="sales" fill="#10b981" name="Sales" />
            <Bar dataKey="purchases" fill="#f59e0b" name="Purchases" />
          </BarChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}

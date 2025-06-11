import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Beer, TrendingUp, Package, Users } from "lucide-react";

export default function Landing() {
  const handleLogin = () => {
    window.location.href = "/api/login";
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100">
      <div className="container mx-auto px-4 py-16">
        <div className="text-center mb-16">
          <div className="flex items-center justify-center mb-6">
            <Beer className="h-16 w-16 text-blue-600 mr-4" />
            <h1 className="text-5xl font-bold text-gray-900">PubKeeper</h1>
          </div>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Complete bookkeeping solution for your pub business with inventory management, 
            profit tracking, and AI-powered insights.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-16">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Package className="h-6 w-6 mr-2 text-blue-600" />
                Inventory Management
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Track your stock levels, manage purchases and sales, 
                and get alerts for low inventory items.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <TrendingUp className="h-6 w-6 mr-2 text-green-600" />
                Profit Analytics
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Calculate net profits, analyze margins, and track 
                your business performance with detailed reports.
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Users className="h-6 w-6 mr-2 text-purple-600" />
                AI Insights
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-600">
                Get intelligent recommendations and business insights 
                powered by advanced AI to grow your pub business.
              </p>
            </CardContent>
          </Card>
        </div>

        <div className="text-center">
          <Button 
            onClick={handleLogin}
            size="lg"
            className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 text-lg"
          >
            Get Started - Sign In
          </Button>
          <p className="text-sm text-gray-500 mt-4">
            Secure authentication powered by Replit
          </p>
        </div>
      </div>
    </div>
  );
}

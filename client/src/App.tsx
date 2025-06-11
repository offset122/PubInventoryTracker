import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { useAuth } from "@/hooks/useAuth";
import NotFound from "@/pages/not-found";
import Landing from "@/pages/landing";
import Dashboard from "@/pages/dashboard";
import Products from "@/pages/products";
import Purchases from "@/pages/purchases";
import Sales from "@/pages/sales";
import Inventory from "@/pages/inventory";
import Pricing from "@/pages/pricing";
import ProfitAnalysis from "@/pages/profit-analysis";
import AIInsights from "@/pages/ai-insights";

function Router() {
  const { isAuthenticated, isLoading } = useAuth();

  return (
    <Switch>
      {isLoading || !isAuthenticated ? (
        <Route path="/" component={Landing} />
      ) : (
        <>
          <Route path="/" component={Dashboard} />
          <Route path="/products" component={Products} />
          <Route path="/purchases" component={Purchases} />
          <Route path="/sales" component={Sales} />
          <Route path="/inventory" component={Inventory} />
          <Route path="/pricing" component={Pricing} />
          <Route path="/profit-analysis" component={ProfitAnalysis} />
          <Route path="/ai-insights" component={AIInsights} />
        </>
      )}
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <Toaster />
        <Router />
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;

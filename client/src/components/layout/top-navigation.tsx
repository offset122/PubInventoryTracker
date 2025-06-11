import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Bell, Menu } from "lucide-react";
import { useState } from "react";

interface TopNavigationProps {
  onMobileMenuToggle?: () => void;
}

export function TopNavigation({ onMobileMenuToggle }: TopNavigationProps) {
  const [searchQuery, setSearchQuery] = useState("");

  return (
    <div className="relative z-10 flex-shrink-0 flex h-16 bg-white shadow">
      <Button
        variant="ghost"
        className="px-4 border-r border-gray-200 text-gray-500 md:hidden"
        onClick={onMobileMenuToggle}
      >
        <Menu className="h-5 w-5" />
      </Button>
      
      <div className="flex-1 px-4 flex justify-between">
        <div className="flex-1 flex">
          <div className="w-full flex md:ml-0">
            <div className="relative w-full max-w-lg">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none pl-3">
                <Search className="h-4 w-4 text-gray-400" />
              </div>
              <Input
                className="pl-10 w-full"
                placeholder="Search products, transactions..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
        
        <div className="ml-4 flex items-center md:ml-6">
          <Button variant="ghost" size="sm" className="text-gray-400 hover:text-gray-500">
            <Bell className="h-5 w-5" />
          </Button>
        </div>
      </div>
    </div>
  );
}

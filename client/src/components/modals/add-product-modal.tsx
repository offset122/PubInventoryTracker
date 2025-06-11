import { useState } from "react";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { insertProductSchema } from "@shared/schema";
import { z } from "zod";

interface AddProductModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

const formSchema = insertProductSchema.extend({
  buyingPrice: z.string().transform(val => parseFloat(val) || 0),
  sellingPrice: z.string().transform(val => parseFloat(val) || 0),
  currentStock: z.string().transform(val => parseInt(val) || 0),
  minStockLevel: z.string().transform(val => parseInt(val) || 10),
});

export function AddProductModal({ open, onOpenChange }: AddProductModalProps) {
  const [formData, setFormData] = useState({
    name: '',
    category: '',
    buyingPrice: '',
    sellingPrice: '',
    currentStock: '',
    minStockLevel: '10',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const createProductMutation = useMutation({
    mutationFn: async (data: any) => {
      await apiRequest('POST', '/api/products', data);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Product added successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      onOpenChange(false);
      setFormData({
        name: '',
        category: '',
        buyingPrice: '',
        sellingPrice: '',
        currentStock: '',
        minStockLevel: '10',
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to add product",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    try {
      const validatedData = formSchema.parse(formData);
      createProductMutation.mutate(validatedData);
    } catch (error) {
      if (error instanceof z.ZodError) {
        toast({
          title: "Validation Error",
          description: error.errors[0]?.message || "Please check your input",
          variant: "destructive",
        });
      }
    }
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Add New Product</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Product Name</Label>
            <Input
              id="name"
              placeholder="e.g., Guinness, Tusker"
              value={formData.name}
              onChange={(e) => handleInputChange('name', e.target.value)}
              required
            />
          </div>

          <div>
            <Label htmlFor="category">Category</Label>
            <Select 
              value={formData.category} 
              onValueChange={(value) => handleInputChange('category', value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select category" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="Beer">Beer</SelectItem>
                <SelectItem value="Wine">Wine</SelectItem>
                <SelectItem value="Spirits">Spirits</SelectItem>
                <SelectItem value="Soft Drinks">Soft Drinks</SelectItem>
                <SelectItem value="Snacks">Snacks</SelectItem>
                <SelectItem value="Other">Other</SelectItem>
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="buyingPrice">Buying Price (KSh)</Label>
              <Input
                id="buyingPrice"
                type="number"
                step="0.01"
                placeholder="120"
                value={formData.buyingPrice}
                onChange={(e) => handleInputChange('buyingPrice', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="sellingPrice">Selling Price (KSh)</Label>
              <Input
                id="sellingPrice"
                type="number"
                step="0.01"
                placeholder="150"
                value={formData.sellingPrice}
                onChange={(e) => handleInputChange('sellingPrice', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="currentStock">Initial Stock</Label>
              <Input
                id="currentStock"
                type="number"
                placeholder="50"
                value={formData.currentStock}
                onChange={(e) => handleInputChange('currentStock', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="minStockLevel">Minimum Stock Level</Label>
              <Input
                id="minStockLevel"
                type="number"
                placeholder="10"
                value={formData.minStockLevel}
                onChange={(e) => handleInputChange('minStockLevel', e.target.value)}
                required
              />
            </div>
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createProductMutation.isPending}
              className="bg-blue-600 hover:bg-blue-700"
            >
              {createProductMutation.isPending ? 'Adding...' : 'Add Product'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/hooks/use-toast";
import { apiRequest } from "@/lib/queryClient";
import { Product } from "@shared/schema";

interface RecordPurchaseModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
}

export function RecordPurchaseModal({ open, onOpenChange }: RecordPurchaseModalProps) {
  const [formData, setFormData] = useState({
    productId: '',
    quantity: '',
    unitPrice: '',
    supplier: '',
    notes: '',
  });

  const { toast } = useToast();
  const queryClient = useQueryClient();

  const { data: products } = useQuery({
    queryKey: ["/api/products"],
  });

  const createPurchaseMutation = useMutation({
    mutationFn: async (data: any) => {
      const purchaseData = {
        ...data,
        productId: parseInt(data.productId),
        quantity: parseInt(data.quantity),
        unitPrice: parseFloat(data.unitPrice),
        totalAmount: parseInt(data.quantity) * parseFloat(data.unitPrice),
      };
      await apiRequest('POST', '/api/purchases', purchaseData);
    },
    onSuccess: () => {
      toast({
        title: "Success",
        description: "Purchase recorded successfully",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/purchases'] });
      queryClient.invalidateQueries({ queryKey: ['/api/products'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/stats'] });
      queryClient.invalidateQueries({ queryKey: ['/api/dashboard/recent-transactions'] });
      onOpenChange(false);
      setFormData({
        productId: '',
        quantity: '',
        unitPrice: '',
        supplier: '',
        notes: '',
      });
    },
    onError: (error: Error) => {
      toast({
        title: "Error",
        description: error.message || "Failed to record purchase",
        variant: "destructive",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!formData.productId || !formData.quantity || !formData.unitPrice) {
      toast({
        title: "Validation Error",
        description: "Please fill in all required fields",
        variant: "destructive",
      });
      return;
    }

    createPurchaseMutation.mutate(formData);
  };

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>Record Purchase</DialogTitle>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="productId">Product</Label>
            <Select 
              value={formData.productId} 
              onValueChange={(value) => {
                handleInputChange('productId', value);
                const product = products?.find((p: Product) => p.id === parseInt(value));
                if (product) {
                  handleInputChange('unitPrice', product.buyingPrice.toString());
                }
              }}
            >
              <SelectTrigger>
                <SelectValue placeholder="Select product" />
              </SelectTrigger>
              <SelectContent>
                {products?.map((product: Product) => (
                  <SelectItem key={product.id} value={product.id.toString()}>
                    {product.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label htmlFor="quantity">Quantity</Label>
              <Input
                id="quantity"
                type="number"
                min="1"
                placeholder="24"
                value={formData.quantity}
                onChange={(e) => handleInputChange('quantity', e.target.value)}
                required
              />
            </div>
            <div>
              <Label htmlFor="unitPrice">Unit Price (KSh)</Label>
              <Input
                id="unitPrice"
                type="number"
                step="0.01"
                placeholder="120"
                value={formData.unitPrice}
                onChange={(e) => handleInputChange('unitPrice', e.target.value)}
                required
              />
            </div>
          </div>

          {formData.quantity && formData.unitPrice && (
            <div className="p-3 bg-gray-50 rounded-md">
              <p className="text-sm font-medium">
                Total Amount: KSh {(parseInt(formData.quantity || '0') * parseFloat(formData.unitPrice || '0')).toLocaleString()}
              </p>
            </div>
          )}

          <div>
            <Label htmlFor="supplier">Supplier (Optional)</Label>
            <Input
              id="supplier"
              placeholder="Supplier name"
              value={formData.supplier}
              onChange={(e) => handleInputChange('supplier', e.target.value)}
            />
          </div>

          <div>
            <Label htmlFor="notes">Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="Additional notes..."
              value={formData.notes}
              onChange={(e) => handleInputChange('notes', e.target.value)}
            />
          </div>

          <div className="flex justify-end space-x-3 pt-4">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button 
              type="submit" 
              disabled={createPurchaseMutation.isPending}
              className="bg-orange-600 hover:bg-orange-700"
            >
              {createPurchaseMutation.isPending ? 'Recording...' : 'Record Purchase'}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}

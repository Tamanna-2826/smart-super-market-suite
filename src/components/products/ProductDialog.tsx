import { useEffect, useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { Loader2 } from "lucide-react";

interface Category {
  id: string;
  name: string;
}

interface Product {
  id: string;
  name: string;
  barcode: string | null;
  category_id: string | null;
  description: string | null;
  unit_price: number;
  stock_quantity: number;
  reorder_level: number;
}

interface ProductDialogProps {
  open: boolean;
  onClose: () => void;
  product?: Product | null;
}

const ProductDialog = ({ open, onClose, product }: ProductDialogProps) => {
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    barcode: "",
    category_id: "",
    description: "",
    unit_price: "",
    stock_quantity: "",
    reorder_level: "10",
  });
  const { toast } = useToast();

  useEffect(() => {
    if (open) {
      loadCategories();
      if (product) {
        setFormData({
          name: product.name,
          barcode: product.barcode || "",
          category_id: product.category_id || "",
          description: product.description || "",
          unit_price: product.unit_price.toString(),
          stock_quantity: product.stock_quantity.toString(),
          reorder_level: product.reorder_level.toString(),
        });
      } else {
        setFormData({
          name: "",
          barcode: "",
          category_id: "",
          description: "",
          unit_price: "",
          stock_quantity: "",
          reorder_level: "10",
        });
      }
    }
  }, [open, product]);

  const loadCategories = async () => {
    const { data } = await supabase.from("categories").select("id, name").order("name");
    setCategories(data || []);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    const productData = {
      name: formData.name,
      barcode: formData.barcode || null,
      category_id: formData.category_id || null,
      description: formData.description || null,
      unit_price: parseFloat(formData.unit_price),
      stock_quantity: parseInt(formData.stock_quantity),
      reorder_level: parseInt(formData.reorder_level),
    };

    let error;
    if (product) {
      ({ error } = await supabase.from("products").update(productData).eq("id", product.id));
    } else {
      ({ error } = await supabase.from("products").insert(productData));
    }

    if (error) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } else {
      toast({
        title: product ? "Product updated" : "Product created",
        description: `The product has been ${product ? "updated" : "created"} successfully.`,
      });
      onClose();
    }

    setIsLoading(false);
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{product ? "Edit Product" : "Add New Product"}</DialogTitle>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="name">Product Name *</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="barcode">Barcode</Label>
              <Input
                id="barcode"
                value={formData.barcode}
                onChange={(e) => setFormData({ ...formData, barcode: e.target.value })}
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="category">Category</Label>
              <Select
                value={formData.category_id}
                onValueChange={(value) => setFormData({ ...formData, category_id: value })}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="unit_price">Unit Price *</Label>
              <Input
                id="unit_price"
                type="number"
                step="0.01"
                min="0"
                value={formData.unit_price}
                onChange={(e) => setFormData({ ...formData, unit_price: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="stock_quantity">Stock Quantity *</Label>
              <Input
                id="stock_quantity"
                type="number"
                min="0"
                value={formData.stock_quantity}
                onChange={(e) => setFormData({ ...formData, stock_quantity: e.target.value })}
                required
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="reorder_level">Reorder Level *</Label>
              <Input
                id="reorder_level"
                type="number"
                min="0"
                value={formData.reorder_level}
                onChange={(e) => setFormData({ ...formData, reorder_level: e.target.value })}
                required
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Textarea
              id="description"
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              rows={3}
            />
          </div>

          <div className="flex justify-end gap-2 pt-4">
            <Button type="button" variant="outline" onClick={onClose}>
              Cancel
            </Button>
            <Button type="submit" disabled={isLoading}>
              {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              {product ? "Update" : "Create"} Product
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
};

export default ProductDialog;

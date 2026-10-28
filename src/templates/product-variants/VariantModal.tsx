"use client";

import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useVariantModal } from "@/stores/use-variant-modal";
import { createVariant, updateVariant } from "./action";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Button } from "@/components/ui/button";
import { toast } from "sonner";
import { Loader2 } from "lucide-react";

// 1. Define Enum locally to avoid "node:module" error from Prisma Client imports in Client Components
enum Concentration {
  EDT = "EDT",
  EDP = "EDP",
  Parfum = "Parfum",
  Extrait = "Extrait",
}

// 2. Robust Schema with Preprocess (String -> Number)
const variantFormSchema = z.object({
  productId: z.string().min(1, "Product is required"),
  sku: z.string().min(1, "SKU is required"),
  name: z.string().min(1, "Name is required"),
  concentration: z.nativeEnum(Concentration),

  // Convert string inputs to numbers automatically
  volumeMl: z.preprocess(
    (val) => Number(val),
    z.number().min(1, "Volume required"),
  ),
  price: z.preprocess(
    (val) => Number(val),
    z.number().min(0, "Price required"),
  ),
  reorderPoint: z.preprocess(
    (val) => Number(val),
    z.number().min(0).default(0),
  ),

  isTester: z.boolean().default(false),

  // Handle optional number (empty string -> undefined)
  weightGrams: z.preprocess(
    (val) =>
      val === "" || val === null || val === undefined ? undefined : Number(val),
    z.number().optional(),
  ),
});

// Export type for use in other components if needed, BUT NOT in Server Actions (circular dep risk)
export type VariantFormValues = z.infer<typeof variantFormSchema>;

type ProductOption = { id: string; name: string };

interface VariantModalProps {
  products: ProductOption[];
}

export const VariantModal = ({ products }: VariantModalProps) => {
  const { isOpen, onClose, data } = useVariantModal();
  const [loading, setLoading] = useState(false);

  // 3. Setup Form
  const form = useForm<VariantFormValues>({
    // Cast resolver as any to prevent strict type conflicts with optional fields
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    resolver: zodResolver(variantFormSchema) as any,
    defaultValues: {
      productId: "",
      sku: "",
      name: "",
      concentration: Concentration.EDP,
      volumeMl: 100,
      price: 0,
      reorderPoint: 10,
      isTester: false,
      weightGrams: undefined,
    },
  });

  useEffect(() => {
    if (data) {
      form.reset({
        productId: data.productId || "",
        sku: data.sku,
        name: data.name,
        concentration: data.concentration as Concentration,
        volumeMl: data.volumeMl,
        price: data.price,
        reorderPoint: data.reorderPoint,
        isTester: data.isTester,
        weightGrams: data.weightGrams ?? undefined,
      });
    } else {
      form.reset({
        productId: "",
        sku: "",
        name: "",
        concentration: Concentration.EDP,
        volumeMl: 100,
        price: 0,
        reorderPoint: 10,
        isTester: false,
        weightGrams: undefined,
      });
    }
  }, [data, isOpen, form]);

  const onSubmit = async (values: VariantFormValues) => {
    setLoading(true);
    try {
      // We pass the raw values to the action. The action must destructure them.
      const result = data
        ? await updateVariant(data.id, values)
        : await createVariant(values);

      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.error);
      }
    } catch {
      toast.error("Something went wrong");
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[85vh] overflow-y-auto sm:max-w-[600px]">
        <DialogHeader>
          <DialogTitle>{data ? "Edit Variant" : "Add Variant"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="productId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Product</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select a product" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="sku"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>SKU</FormLabel>
                    <FormControl>
                      <Input placeholder="PROD-001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="e.g. 100ml Bottle" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-3 gap-4">
              <FormField
                control={form.control}
                name="concentration"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Concentration</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {Object.values(Concentration).map((c) => (
                          <SelectItem key={c} value={c}>
                            {c}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="volumeMl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Volume (ml)</FormLabel>
                    <FormControl>
                      {/* type="number" gives a better mobile keyboard, schema handles parsing */}
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />

              <FormField
                control={form.control}
                name="price"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Price ($)</FormLabel>
                    <FormControl>
                      <Input type="number" step="0.01" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="weightGrams"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>
                      Weight (g){" "}
                      <span className="text-muted-foreground text-xs">
                        (Optional)
                      </span>
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="number"
                        {...field}
                        value={field.value ?? ""}
                        onChange={field.onChange}
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="reorderPoint"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Reorder Point</FormLabel>
                    <FormControl>
                      <Input type="number" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="flex items-center space-x-2 rounded-md border p-3">
              <FormField
                control={form.control}
                name="isTester"
                render={({ field }) => (
                  <FormItem className="flex flex-row items-start space-y-0 space-x-3">
                    <FormControl>
                      <Checkbox
                        checked={field.value}
                        onCheckedChange={field.onChange}
                      />
                    </FormControl>
                    <div className="space-y-1 leading-none">
                      <FormLabel>Is Tester?</FormLabel>
                    </div>
                  </FormItem>
                )}
              />
            </div>

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {data ? "Save" : "Add"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

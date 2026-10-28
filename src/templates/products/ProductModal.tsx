"use client";

import { useEffect, useState, useTransition } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
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
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";
import { Loader2, Upload } from "lucide-react";
import { Brand, Category, Note, Scent } from "@/generated/prisma/client";
import { createProduct, updateProduct } from "./action";
import Image from "next/image";
import { Checkbox } from "@/components/ui/checkbox";
import { useProductModal } from "@/stores/use-product-modal";

enum GenderTarget {
  Men = "Men",
  Women = "Women",
  Unisex = "Unisex",
}

const formSchema = z.object({
  name: z.string().min(1, "Name is required"),
  description: z.string().optional(),
  brandId: z.string().min(1, "Brand is required"),
  categoryId: z.string().min(1, "Category is required"),
  scentId: z.string().optional(),
  genderTarget: z.nativeEnum(GenderTarget).optional().or(z.literal("")),
  topNoteIds: z.array(z.string()),
  middleNoteIds: z.array(z.string()),
  baseNoteIds: z.array(z.string()),
});

interface ProductModalProps {
  brands: Brand[];
  categories: Category[];
  scents: Scent[];
  notes: Note[];
}

function NoteChecklist({
  notes,
  value,
  onChange,
  label,
}: {
  notes: Note[];
  value: string[];
  onChange: (ids: string[]) => void;
  label: string;
}) {
  return (
    <div className="space-y-2">
      <FormLabel className="text-xs">{label}</FormLabel>
      <div className="max-h-28 space-y-1.5 overflow-y-auto rounded-md border p-2">
        {notes.length === 0 ? (
          <p className="text-muted-foreground text-xs">No notes yet</p>
        ) : (
          notes.map((note) => {
            const checked = value.includes(note.id);
            return (
              <label
                key={note.id}
                className="flex cursor-pointer items-center gap-2 text-sm"
              >
                <Checkbox
                  checked={checked}
                  onCheckedChange={(v) => {
                    if (v) onChange([...value, note.id]);
                    else onChange(value.filter((id) => id !== note.id));
                  }}
                />
                <span>{note.title}</span>
              </label>
            );
          })
        )}
      </div>
    </div>
  );
}

export const ProductModal = ({
  brands,
  categories,
  scents,
  notes,
}: ProductModalProps) => {
  const { isOpen, onClose, data } = useProductModal();
  const [loading, startTransition] = useTransition();
  const [preview, setPreview] = useState<string | null>(null);
  const [file, setFile] = useState<File | null>(null);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
      brandId: "",
      categoryId: "",
      scentId: "",
      genderTarget: "",
      topNoteIds: [],
      middleNoteIds: [],
      baseNoteIds: [],
    },
  });

  useEffect(() => {
    if (isOpen) {
      const productNotes = data?.productNotes ?? [];
      form.reset({
        name: data?.name || "",
        description: data?.description || "",
        brandId: data?.brandId || "",
        categoryId: data?.categoryId || "",
        scentId: data?.scentId || "",
        genderTarget: (data?.genderTarget as GenderTarget | null) || "",
        topNoteIds: productNotes
          .filter((n) => n.type === "Top")
          .map((n) => n.noteId),
        middleNoteIds: productNotes
          .filter((n) => n.type === "Middle")
          .map((n) => n.noteId),
        baseNoteIds: productNotes
          .filter((n) => n.type === "Base")
          .map((n) => n.noteId),
      });
      setPreview(null);
      setFile(null);
    }
  }, [isOpen, data, form]);

  const onSubmit = (values: z.infer<typeof formSchema>) => {
    startTransition(async () => {
      const formData = new FormData();
      formData.append("name", values.name);
      formData.append("description", values.description || "");
      formData.append("brandId", values.brandId);
      formData.append("categoryId", values.categoryId);
      if (values.scentId) formData.append("scentId", values.scentId);
      if (values.genderTarget)
        formData.append("genderTarget", values.genderTarget);
      values.topNoteIds.forEach((id) => formData.append("topNoteIds", id));
      values.middleNoteIds.forEach((id) =>
        formData.append("middleNoteIds", id),
      );
      values.baseNoteIds.forEach((id) => formData.append("baseNoteIds", id));
      if (file) formData.append("image", file);

      const result = data
        ? await updateProduct(data.id, formData)
        : await createProduct(formData);

      if (result.success) {
        toast.success(result.message);
        onClose();
      } else {
        toast.error(result.error);
      }
    });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
      const reader = new FileReader();
      reader.onloadend = () => setPreview(reader.result as string);
      reader.readAsDataURL(selected);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-h-[90vh] overflow-y-auto sm:max-w-[520px]">
        <DialogHeader>
          <DialogTitle>{data ? "Edit Product" : "Add Product"}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <div className="flex justify-center">
              <div className="relative flex h-32 w-32 items-center justify-center overflow-hidden rounded-lg border-2 border-dashed border-gray-300 bg-gray-50 hover:bg-gray-100">
                {preview ? (
                  <Image
                    src={preview}
                    alt="Preview"
                    fill
                    className="object-cover"
                  />
                ) : (
                  <div className="flex flex-col items-center text-gray-400">
                    <Upload className="mb-1 h-8 w-8" />
                    <span className="text-xs">Upload Image</span>
                  </div>
                )}
                <Input
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                  onChange={handleFileChange}
                />
              </div>
            </div>

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Product Name" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="brandId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Brand</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Brand" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {brands.map((b) => (
                          <SelectItem key={b.id} value={b.id}>
                            {b.name}
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
                name="categoryId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Category</FormLabel>
                    <Select onValueChange={field.onChange} value={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Category" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        {categories.map((c) => (
                          <SelectItem key={c.id} value={c.id}>
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="scentId"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Scent Family</FormLabel>
                    <Select
                      onValueChange={(v) =>
                        field.onChange(v === "__none__" ? "" : v)
                      }
                      value={field.value || "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select Scent" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        {scents.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.title}
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
                name="genderTarget"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Gender Target</FormLabel>
                    <Select
                      onValueChange={(v) =>
                        field.onChange(v === "__none__" ? "" : v)
                      }
                      value={field.value || "__none__"}
                    >
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Select" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="__none__">None</SelectItem>
                        <SelectItem value={GenderTarget.Men}>Men</SelectItem>
                        <SelectItem value={GenderTarget.Women}>
                          Women
                        </SelectItem>
                        <SelectItem value={GenderTarget.Unisex}>
                          Unisex
                        </SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Fragrance Notes</h4>
              <FormField
                control={form.control}
                name="topNoteIds"
                render={({ field }) => (
                  <FormItem>
                    <NoteChecklist
                      label="Top Notes"
                      notes={notes}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="middleNoteIds"
                render={({ field }) => (
                  <FormItem>
                    <NoteChecklist
                      label="Middle / Heart Notes"
                      notes={notes}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormItem>
                )}
              />
              <FormField
                control={form.control}
                name="baseNoteIds"
                render={({ field }) => (
                  <FormItem>
                    <NoteChecklist
                      label="Base Notes"
                      notes={notes}
                      value={field.value}
                      onChange={field.onChange}
                    />
                  </FormItem>
                )}
              />
            </div>

            <FormField
              control={form.control}
              name="description"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Description</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Product description..."
                      className="resize-none"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={onClose} type="button">
                Cancel
              </Button>
              <Button type="submit" disabled={loading}>
                {loading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
                {data ? "Save Changes" : "Create Product"}
              </Button>
            </div>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};

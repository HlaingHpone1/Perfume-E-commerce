"use client";

import {
  Product,
  Brand,
  Category,
  Attachment,
  Note,
  Scent,
  ProductNote,
  ProductVariant,
} from "@/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  MoreHorizontal,
  Pencil,
  Trash2,
  Plus,
  Image as ImageIcon,
} from "lucide-react";
import { useProductModal } from "@/stores/use-product-modal";
import SearchBox from "@/components/search-box";
import { DataTable } from "@/components/data-table";
import { ProductModal } from "./ProductModal";
import { useDeleteModalStore } from "@/stores/useDeleteStore";
import DeleteDialog from "@/components/delete-dialog";
import { deleteProduct } from "./action";
import { toast } from "sonner";
import Image from "next/image";
import { Badge } from "@/components/ui/badge";

type ProductWithRelations = Product & {
  brand: Brand;
  category: Category;
  scent?: Scent | null;
  productNotes?: ProductNote[];
  variants?: ProductVariant[];
  attachments?: Attachment[];
  _count: { variants: number };
};

interface ProductTableProps {
  data: ProductWithRelations[];
  allBrands: Brand[];
  allCategories: Category[];
  allScents: Scent[];
  allNotes: Note[];
  totalPages: number;
}

export function ProductTable({
  data,
  allBrands,
  totalPages,
  allCategories,
  allScents,
  allNotes,
}: ProductTableProps) {
  const productModal = useProductModal();
  const deleteModal = useDeleteModalStore();

  const handleDelete = async () => {
    if (!deleteModal.selectedId) return;
    const result = await deleteProduct(deleteModal.selectedId);
    if (result.success) {
      toast.success(result.message);
      deleteModal.setOpen(false);
    } else {
      toast.error(result.error);
    }
  };

  const columns: ColumnDef<ProductWithRelations>[] = [
    {
      id: "image",
      header: "Image",
      cell: ({ row }) => {
        // Assuming we pass attachments in the data
        const img = row.original.attachments?.[0]; // Get first image
        return (
          <div className="relative z-1 h-10 w-10 overflow-hidden rounded border bg-gray-50">
            {img ? (
              <Image
                src={img.fileUrl}
                alt={row.original.name}
                fill
                className="object-cover"
                sizes="40px"
              />
            ) : (
              <div className="flex h-full w-full items-center justify-center">
                <ImageIcon className="h-4 w-4 text-gray-300" />
              </div>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "_count.variants",
      header: "Variants",
      cell: ({ row }) => (
        <Badge variant="secondary" className="font-normal">
          {row.original._count.variants}
        </Badge>
      ),
    },
    {
      accessorKey: "brand.name",
      header: "Brand",
    },
    {
      accessorKey: "category.name",
      header: "Category",
    },
    {
      id: "actions",
      header: () => <div className="text-right">Actions</div>,
      cell: ({ row }) => (
        <div className="text-right">
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" className="h-8 w-8 p-0">
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              <DropdownMenuItem
                onClick={() => productModal.onOpen(row.original)}
              >
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600"
                onClick={() => {
                  deleteModal.setOpen(true);
                  deleteModal.setSelectedId(row.original.id);
                }}
              >
                <Trash2 className="mr-2 h-4 w-4" /> Delete
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <SearchBox placeholder="Search products..." className="w-[300px]" />
        <Button onClick={() => productModal.onOpen()}>
          <Plus className="mr-2 h-4 w-4" /> Add Product
        </Button>
      </div>

      <DataTable columns={columns} data={data} totalPages={totalPages} />

      <ProductModal
        brands={allBrands}
        categories={allCategories}
        scents={allScents}
        notes={allNotes}
      />

      <DeleteDialog
        title="Delete Product"
        description="This will delete the product and its image."
        handleDelete={handleDelete}
      />
    </div>
  );
}

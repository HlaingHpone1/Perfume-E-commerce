"use client";

import { Attachment, Scent } from "@/generated/prisma/client";
import { ColumnDef } from "@tanstack/react-table";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreHorizontal, Pencil, Trash2, Plus } from "lucide-react";
import { useScentModal } from "@/stores/use-scent-modal";
import SearchBox from "@/components/search-box";
import { DataTable } from "@/components/data-table";
import { ScentModal } from "@/templates/scent/ScentModal";
import { useDeleteModalStore } from "@/stores/useDeleteStore";
import DeleteDialog from "@/components/delete-dialog";
import { deleteScent } from "@/templates/scent/action";
import { toast } from "sonner";
import Image from "next/image";

type ScentRow = Scent & {
  _count: { products: number };
  attachments?: Attachment[];
};

interface ScentsTableProps {
  data: ScentRow[];
  totalPages: number;
}

export function ScentsTable({ data, totalPages }: ScentsTableProps) {
  const scentModal = useScentModal();
  const deleteModal = useDeleteModalStore();

  const handleDelete = async () => {
    if (!deleteModal.selectedId) return;
    const result = await deleteScent(deleteModal.selectedId);
    if (result.success) {
      toast.success(result.message);
      deleteModal.setOpen(false);
    } else {
      toast.error(result.error);
    }
  };

  const columns: ColumnDef<ScentRow>[] = [
    {
      id: "image",
      header: "Image",
      cell: ({ row }) => {
        const img = row.original.attachments?.[0];
        return (
          <div className="relative h-10 w-10 overflow-hidden rounded border bg-gray-50">
            {img ? (
              <Image
                src={img.fileUrl}
                alt={row.original.title}
                fill
                className="object-cover"
                unoptimized
              />
            ) : (
              <span className="text-muted-foreground flex h-full items-center justify-center text-[10px]">
                —
              </span>
            )}
          </div>
        );
      },
    },
    {
      accessorKey: "title",
      header: "Title",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.title}</span>
      ),
    },
    {
      accessorKey: "_count.products",
      header: "Products",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {row.original._count.products}
        </span>
      ),
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
              <DropdownMenuItem onClick={() => scentModal.onOpen(row.original)}>
                <Pencil className="mr-2 h-4 w-4" /> Edit
              </DropdownMenuItem>
              <DropdownMenuItem
                className="text-red-600 focus:text-red-600"
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
        <SearchBox placeholder="Search scents..." className="w-[300px]" />
        <Button onClick={() => scentModal.onOpen()}>
          <Plus className="mr-2 h-4 w-4" /> Add Scent
        </Button>
      </div>

      <DataTable
        columns={columns}
        data={data}
        noDataText="No scents found."
        totalPages={totalPages}
      />

      <ScentModal />
      <DeleteDialog
        title="Delete Scent"
        description="Are you sure you want to delete this scent?"
        handleDelete={handleDelete}
      />
    </div>
  );
}

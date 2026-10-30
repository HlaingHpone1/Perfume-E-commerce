"use client";

import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import { MoreHorizontal, Archive, Eye, Trash2 } from "lucide-react";
import { toast } from "sonner";
import { ContactStatus } from "@/generated/prisma/client";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import SearchBox from "@/components/search-box";
import { DataTable } from "@/components/data-table";
import DeleteDialog from "@/components/delete-dialog";
import { useDeleteModalStore } from "@/stores/useDeleteStore";
import {
  deleteContactSubmission,
  updateContactStatus,
} from "@/templates/contact/action";

export type ContactMessageRow = {
  id: string;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
  createdAt: string;
};

const statusStyles: Record<ContactStatus, string> = {
  NEW: "bg-blue-50 text-blue-700",
  READ: "bg-gray-100 text-gray-700",
  ARCHIVED: "bg-amber-50 text-amber-800",
};

export function ContactMessagesTable({
  data,
  totalPages,
}: {
  data: ContactMessageRow[];
  totalPages: number;
}) {
  const deleteModal = useDeleteModalStore();

  const handleStatus = async (id: string, status: ContactStatus) => {
    const result = await updateContactStatus(id, status);
    if (result.success) {
      toast.success(result.message);
    } else {
      toast.error(result.error);
    }
  };

  const handleDelete = async () => {
    if (!deleteModal.selectedId) return;
    const result = await deleteContactSubmission(deleteModal.selectedId);
    if (result.success) {
      toast.success(result.message);
      deleteModal.setOpen(false);
    } else {
      toast.error(result.error);
    }
  };

  const columns: ColumnDef<ContactMessageRow>[] = [
    {
      accessorKey: "createdAt",
      header: "When",
      cell: ({ row }) =>
        format(new Date(row.original.createdAt), "MMM d, yyyy h:mm a"),
    },
    {
      accessorKey: "name",
      header: "Name",
      cell: ({ row }) => (
        <span className="font-medium">{row.original.name}</span>
      ),
    },
    {
      accessorKey: "email",
      header: "Email",
      cell: ({ row }) => (
        <a
          href={`mailto:${row.original.email}`}
          className="text-primary hover:underline"
        >
          {row.original.email}
        </a>
      ),
    },
    {
      accessorKey: "subject",
      header: "Subject",
      cell: ({ row }) => (
        <span className="max-w-[180px] truncate block" title={row.original.subject}>
          {row.original.subject}
        </span>
      ),
    },
    {
      accessorKey: "message",
      header: "Message",
      cell: ({ row }) => (
        <span
          className="text-muted-foreground block max-w-xs truncate text-xs"
          title={row.original.message}
        >
          {row.original.message}
        </span>
      ),
    },
    {
      accessorKey: "status",
      header: "Status",
      cell: ({ row }) => (
        <span
          className={`inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium ${statusStyles[row.original.status]}`}
        >
          {row.original.status}
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
                <span className="sr-only">Open menu</span>
                <MoreHorizontal className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end">
              {row.original.status !== "READ" && (
                <DropdownMenuItem
                  onClick={() => handleStatus(row.original.id, "READ")}
                >
                  <Eye className="mr-2 h-4 w-4" /> Mark as Read
                </DropdownMenuItem>
              )}
              {row.original.status !== "ARCHIVED" && (
                <DropdownMenuItem
                  onClick={() => handleStatus(row.original.id, "ARCHIVED")}
                >
                  <Archive className="mr-2 h-4 w-4" /> Archive
                </DropdownMenuItem>
              )}
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
        <SearchBox
          placeholder="Search by name, email, or subject..."
          className="w-[320px]"
        />
      </div>

      <DataTable
        columns={columns}
        data={data}
        noDataText="No contact messages found."
        totalPages={totalPages}
      />

      <DeleteDialog
        title="Delete Message"
        description="Are you sure you want to delete this contact message?"
        handleDelete={handleDelete}
      />
    </div>
  );
}

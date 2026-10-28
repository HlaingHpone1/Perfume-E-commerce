"use client";

import Link from "next/link";
import { ColumnDef } from "@tanstack/react-table";
import { format } from "date-fns";
import SearchBox from "@/components/search-box";
import { DataTable } from "@/components/data-table";

export type AuditLogRow = {
  id: string;
  entityType: string;
  entityId: string;
  action: string;
  changedBy: string | null;
  actorName: string | null;
  actorEmail: string | null;
  timestamp: string;
  metadata: string | null;
};

function entityHref(entityType: string, entityId: string) {
  if (entityType === "Order") return `/admin/orders/${entityId}`;
  return null;
}

export function AuditLogsTable({
  data,
  totalPages,
}: {
  data: AuditLogRow[];
  totalPages: number;
}) {
  const columns: ColumnDef<AuditLogRow>[] = [
    {
      accessorKey: "timestamp",
      header: "When",
      cell: ({ row }) =>
        format(new Date(row.original.timestamp), "MMM d, yyyy h:mm a"),
    },
    {
      accessorKey: "action",
      header: "Action",
      cell: ({ row }) => (
        <span className="inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-medium text-blue-700">
          {row.original.action}
        </span>
      ),
    },
    {
      accessorKey: "entityType",
      header: "Entity",
      cell: ({ row }) => {
        const href = entityHref(row.original.entityType, row.original.entityId);
        const label = `${row.original.entityType} · ${row.original.entityId.slice(0, 8)}`;

        if (!href) {
          return <span title={row.original.entityId}>{label}</span>;
        }

        return (
          <Link
            href={href}
            className="text-primary hover:underline"
            title={row.original.entityId}
          >
            {label}
          </Link>
        );
      },
    },
    {
      accessorKey: "actorName",
      header: "Changed by",
      cell: ({ row }) => {
        if (!row.original.changedBy) return "—";
        return (
          <div className="flex flex-col">
            <span className="font-medium">
              {row.original.actorName ?? "Unknown user"}
            </span>
            {row.original.actorEmail ? (
              <span className="text-muted-foreground text-xs">
                {row.original.actorEmail}
              </span>
            ) : null}
          </div>
        );
      },
    },
    {
      accessorKey: "metadata",
      header: "Details",
      cell: ({ row }) => (
        <span
          className="text-muted-foreground block max-w-xs truncate text-xs"
          title={row.original.metadata ?? undefined}
        >
          {row.original.metadata ?? "—"}
        </span>
      ),
    },
  ];

  return (
    <div className="space-y-4">
      <SearchBox
        placeholder="Search action, entity, or user..."
        className="w-[320px] max-w-none"
      />
      <DataTable
        columns={columns}
        data={data}
        noDataText="No audit logs yet."
        totalPages={totalPages}
      />
    </div>
  );
}

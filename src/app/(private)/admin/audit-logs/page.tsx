import { Suspense } from "react";
import { prisma } from "@/config/auth";
import { Prisma } from "@/generated/prisma/client";
import { AuditLogsTable } from "@/templates/audit-logs";

export const metadata = {
  title: "Audit Logs - Admin",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function AuditLogsPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const query = (params.search as string) || "";
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const skip = (page - 1) * limit;

  const matchingUsers = query
    ? await prisma.user.findMany({
        where: {
          OR: [
            { name: { contains: query, mode: "insensitive" } },
            { email: { contains: query, mode: "insensitive" } },
          ],
        },
        select: { id: true },
        take: 50,
      })
    : [];

  const where: Prisma.AuditLogWhereInput = query
    ? {
        OR: [
          { action: { contains: query, mode: "insensitive" } },
          { entityType: { contains: query, mode: "insensitive" } },
          { entityId: { contains: query, mode: "insensitive" } },
          ...(matchingUsers.length
            ? [{ changedBy: { in: matchingUsers.map((user) => user.id) } }]
            : []),
        ],
      }
    : {};

  const [totalCount, logs] = await Promise.all([
    prisma.auditLog.count({ where }),
    prisma.auditLog.findMany({
      where,
      orderBy: { timestamp: "desc" },
      take: limit,
      skip,
    }),
  ]);

  const actorIds = [
    ...new Set(
      logs
        .map((log) => log.changedBy)
        .filter((id): id is string => Boolean(id)),
    ),
  ];

  const actors = actorIds.length
    ? await prisma.user.findMany({
        where: { id: { in: actorIds } },
        select: { id: true, name: true, email: true },
      })
    : [];

  const actorById = new Map(actors.map((actor) => [actor.id, actor]));

  const rows = logs.map((log) => {
    const actor = log.changedBy ? actorById.get(log.changedBy) : undefined;
    return {
      id: log.id,
      entityType: log.entityType,
      entityId: log.entityId,
      action: log.action,
      changedBy: log.changedBy,
      actorName: actor?.name ?? null,
      actorEmail: actor?.email ?? null,
      timestamp: log.timestamp.toISOString(),
      metadata: log.metadata ? JSON.stringify(log.metadata) : null,
    };
  });

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Audit Logs</h1>
        <p className="text-muted-foreground">
          Review changes recorded across orders and admin actions.
        </p>
      </div>

      <Suspense fallback={<div>Loading audit logs...</div>}>
        <AuditLogsTable data={rows} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}

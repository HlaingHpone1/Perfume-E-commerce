import { Suspense } from "react";
import { prisma } from "@/config/auth";
import { ScentsTable } from "@/templates/scent";
import { AttachmentRecordType, Prisma } from "@/generated/prisma/client";

export const metadata = {
  title: "Scents Management - Admin",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ScentsPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (params.search as string) || "";
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.ScentWhereInput = query
    ? { title: { contains: query, mode: "insensitive" } }
    : {};

  const [totalCount, scents] = await Promise.all([
    prisma.scent.count({ where }),
    prisma.scent.findMany({
      where,
      include: { _count: { select: { products: true } } },
      orderBy: { title: "asc" },
      take: limit,
      skip,
    }),
  ]);

  const scentIds = scents.map((s) => s.id);
  const attachments = await prisma.attachment.findMany({
    where: {
      recordType: AttachmentRecordType.Scent,
      recordId: { in: scentIds },
    },
  });

  const data = scents.map((scent) => ({
    ...scent,
    attachments: attachments.filter((a) => a.recordId === scent.id),
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scents</h1>
        <p className="text-muted-foreground">
          Manage reusable scent families for products.
        </p>
      </div>

      <Suspense fallback={<div>Loading scents...</div>}>
        <ScentsTable data={data} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}

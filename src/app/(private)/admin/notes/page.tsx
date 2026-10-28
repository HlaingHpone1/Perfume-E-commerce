import { Suspense } from "react";
import { prisma } from "@/config/auth";
import { NotesTable } from "@/templates/note";
import { AttachmentRecordType, Prisma } from "@/generated/prisma/client";

export const metadata = {
  title: "Notes Management - Admin",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function NotesPage({ searchParams }: PageProps) {
  const params = await searchParams;
  const query = (params.search as string) || "";
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.NoteWhereInput = query
    ? { title: { contains: query, mode: "insensitive" } }
    : {};

  const [totalCount, notes] = await Promise.all([
    prisma.note.count({ where }),
    prisma.note.findMany({
      where,
      include: { _count: { select: { products: true } } },
      orderBy: { title: "asc" },
      take: limit,
      skip,
    }),
  ]);

  const noteIds = notes.map((n) => n.id);
  const attachments = await prisma.attachment.findMany({
    where: {
      recordType: AttachmentRecordType.Note,
      recordId: { in: noteIds },
    },
  });

  const data = notes.map((note) => ({
    ...note,
    attachments: attachments.filter((a) => a.recordId === note.id),
  }));

  const totalPages = Math.ceil(totalCount / limit);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Notes</h1>
        <p className="text-muted-foreground">
          Manage reusable fragrance notes (top, middle, base).
        </p>
      </div>

      <Suspense fallback={<div>Loading notes...</div>}>
        <NotesTable data={data} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}

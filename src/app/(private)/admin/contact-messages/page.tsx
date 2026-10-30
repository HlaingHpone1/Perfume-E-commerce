import { Suspense } from "react";
import { prisma } from "@/config/auth";
import { Prisma } from "@/generated/prisma/client";
import { ContactMessagesTable } from "@/templates/contact";

export const metadata = {
  title: "Contact Messages - Admin",
};

type PageProps = {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>;
};

export default async function ContactMessagesPage({ searchParams }: PageProps) {
  const params = await searchParams;

  const query = (params.search as string) || "";
  const page = Number(params.page) || 1;
  const limit = Number(params.limit) || 10;
  const skip = (page - 1) * limit;

  const where: Prisma.ContactSubmissionWhereInput = query
    ? {
        OR: [
          { name: { contains: query, mode: "insensitive" } },
          { email: { contains: query, mode: "insensitive" } },
          { subject: { contains: query, mode: "insensitive" } },
        ],
      }
    : {};

  const [totalCount, submissions] = await Promise.all([
    prisma.contactSubmission.count({ where }),
    prisma.contactSubmission.findMany({
      where,
      orderBy: { createdAt: "desc" },
      take: limit,
      skip,
    }),
  ]);

  const totalPages = Math.ceil(totalCount / limit);

  const data = submissions.map((row) => ({
    id: row.id,
    name: row.name,
    email: row.email,
    subject: row.subject,
    message: row.message,
    status: row.status,
    createdAt: row.createdAt.toISOString(),
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Contact Messages</h1>
        <p className="text-muted-foreground">
          Messages submitted from the public contact form.
        </p>
      </div>

      <Suspense fallback={<div>Loading messages...</div>}>
        <ContactMessagesTable data={data} totalPages={totalPages} />
      </Suspense>
    </div>
  );
}

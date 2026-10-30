import { betterAuth } from "better-auth";
import { prismaAdapter } from "better-auth/adapters/prisma";

import { PrismaClient } from "@/generated/prisma/client";
import { PrismaPg } from "@prisma/adapter-pg";
import { sendPasswordResetEmail } from "@/config/email";

const connectionString = `${process.env.DATABASE_URL}`;

/** Bump when adding Prisma models so stale globalThis clients are discarded in dev. */
const PRISMA_CLIENT_GENERATION = 2;

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
  prismaGeneration: number | undefined;
  auth: ReturnType<typeof betterAuth> | undefined;
};

function createPrismaClient() {
  const adapter = new PrismaPg({ connectionString });
  return new PrismaClient({ adapter });
}

function getPrismaClient() {
  const cached = globalForPrisma.prisma;
  const isFresh =
    cached &&
    globalForPrisma.prismaGeneration === PRISMA_CLIENT_GENERATION &&
    typeof cached.contactSubmission?.count === "function";

  if (isFresh) {
    return cached;
  }

  const client = createPrismaClient();
  if (process.env.NODE_ENV !== "production") {
    globalForPrisma.prisma = client;
    globalForPrisma.prismaGeneration = PRISMA_CLIENT_GENERATION;
    // Auth binds the old prisma adapter — force recreate.
    globalForPrisma.auth = undefined;
  }
  return client;
}

export const prisma = getPrismaClient();

export const auth =
  globalForPrisma.auth ||
  betterAuth({
    baseURL: process.env.BETTER_AUTH_URL || process.env.NEXT_PUBLIC_BASE_URL,
    database: prismaAdapter(prisma, {
      provider: "postgresql",
    }),
    emailAndPassword: {
      enabled: true,
      autoSignIn: true,
      sendResetPassword: async ({ user, url }) => {
        await sendPasswordResetEmail(user.email, url);
      },
    },
    user: {
      additionalFields: {
        role: {
          type: "string",
          required: false,
          input: false,
        },
      },
    },

    experimental: { joins: true },
    session: {
      disableSessionRefresh: false,
      cookieCache: {
        enabled: true,
        maxAge: 7 * 24 * 60 * 60, // 7 days cache duration
        strategy: "jwe",
        refreshCache: true,
      },
      account: {
        storeStateStrategy: "cookie",
        storeAccountCookie: true, // Store account data after OAuth flow in a cookie (useful for database-less flows)
      },
    },
  });

if (process.env.NODE_ENV !== "production") {
  globalForPrisma.auth = auth;
}

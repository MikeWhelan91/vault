// @ts-nocheck
/**
 * Prisma Client singleton
 * Uses Neon serverless adapter for edge runtime compatibility
 */

import { PrismaClient } from '@/generated/prisma';
import { PrismaNeon } from '@prisma/adapter-neon';
import { Pool, neonConfig } from '@neondatabase/serverless';

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined;
};

let prismaInstance: PrismaClient | undefined;

function getPrismaClient() {
  if (prismaInstance) return prismaInstance;

  // Edge runtime (Cloudflare Workers/Pages)
  if (process.env.DATABASE_URL) {
    // Configure for edge runtime - must be set before creating Pool
    neonConfig.webSocketConstructor = WebSocket;

    const pool = new Pool({ connectionString: process.env.DATABASE_URL });
    const adapter = new PrismaNeon(pool);
    prismaInstance = new PrismaClient({
      adapter: adapter as any,
      log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
    });
    return prismaInstance;
  }

  // Fallback for local development
  prismaInstance = new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['query', 'error', 'warn'] : ['error'],
  });
  return prismaInstance;
}

// Export a proxy that creates the client lazily
export const prisma = new Proxy({} as PrismaClient, {
  get(_, prop) {
    const client = getPrismaClient();
    return client[prop];
  },
});

export default prisma;

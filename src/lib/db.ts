import { PrismaClient } from '@prisma/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Standard Prisma client for PostgreSQL (Supabase, Neon, etc.)
// Set DATABASE_URL to the pooled connection (transaction mode, port 6543)
// Set DIRECT_URL to the direct connection (port 5432) for migrations
export const db =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: process.env.NODE_ENV === 'development' ? ['error', 'warn'] : ['error'],
  })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

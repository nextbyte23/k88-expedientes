import { PrismaClient } from '@prisma/client'
import { PrismaLibSql } from '@prisma/adapter-libsql'
import { createClient } from '@libsql/client'

const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
}

// Works for both:
//  - Local dev:  DATABASE_URL=file:./db/local.db
//  - Production: DATABASE_URL=libsql://<db>.turso.io  +  DATABASE_AUTH_TOKEN=<token>
const libsql = createClient({
  url: process.env.DATABASE_URL!,
  authToken: process.env.DATABASE_AUTH_TOKEN || undefined,
})

const adapter = new PrismaLibSql(libsql)

export const db =
  globalForPrisma.prisma ??
  new PrismaClient({ adapter })

if (process.env.NODE_ENV !== 'production') globalForPrisma.prisma = db

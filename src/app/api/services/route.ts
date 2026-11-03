import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET() {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'RECEPTION'])
    const services = await db.service.findMany({
      where: { active: true },
      orderBy: [{ category: 'asc' }, { name: 'asc' }],
    })
    return ok(services)
  })
}

export async function POST(req: NextRequest) {
  return handleErrors(async () => {
    await requireRole(['ADMIN'])
    const body = await parseBody(req)
    const { name, description, category, defaultPrice } = body
    if (!name || !category || defaultPrice === undefined) {
      return bad('Nombre, categoría y precio son obligatorios')
    }
    const service = await db.service.create({
      data: {
        name,
        description: description || null,
        category,
        defaultPrice: Number(defaultPrice),
      },
    })
    return ok(service)
  })
}

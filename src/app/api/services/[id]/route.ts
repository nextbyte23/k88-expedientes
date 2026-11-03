import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, notFound, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    await requireRole(['ADMIN'])
    const { id } = await params
    const body = await parseBody(req)
    const existing = await db.service.findUnique({ where: { id } })
    if (!existing) return notFound('Servicio no encontrado')
    const { name, description, category, defaultPrice, active } = body
    const service = await db.service.update({
      where: { id },
      data: {
        name: name ?? existing.name,
        description: description ?? existing.description,
        category: category ?? existing.category,
        defaultPrice: defaultPrice !== undefined ? Number(defaultPrice) : existing.defaultPrice,
        active: active ?? existing.active,
      },
    })
    return ok(service)
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    await requireRole(['ADMIN'])
    const { id } = await params
    const existing = await db.service.findUnique({ where: { id } })
    if (!existing) return notFound('Servicio no encontrado')
    // Soft delete: marcar como inactivo en lugar de borrar
    await db.service.update({ where: { id }, data: { active: false } })
    return ok({ success: true })
  })
}

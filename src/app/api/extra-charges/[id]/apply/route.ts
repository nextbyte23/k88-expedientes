import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { handleErrors, notFound, ok } from '@/lib/api'

export const runtime = 'nodejs'

export async function PATCH(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    const { id } = await params
    const charge = await db.extraCharge.findUnique({ where: { id } })
    if (!charge) return notFound('Cargo extra no encontrado')
    // mark as applied without payment (for cases where reception collects directly)
    const updated = await db.extraCharge.update({
      where: { id },
      data: { status: 'APPLIED' },
    })
    return ok(updated)
  })
}

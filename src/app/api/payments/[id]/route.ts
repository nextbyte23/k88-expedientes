import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { handleErrors, notFound, ok } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'RECEPTION'])
    const { id } = await params
    const payment = await db.payment.findUnique({
      where: { id },
      include: { patient: true, items: true, methods: true, receptionist: true, billing: true },
    })
    if (!payment) return notFound('Pago no encontrado')
    return ok(payment)
  })
}

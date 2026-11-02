import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, notFound, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'RECEPTION'])
    const { id } = await params
    const close = await db.cashClose.findUnique({
      where: { id },
      include: { receptionist: true },
    })
    if (!close) return notFound('Cierre de caja no encontrado')
    // Get payments for that date + receptionist
    const dayStart = new Date(close.date + 'T00:00:00')
    const dayEnd = new Date(close.date + 'T23:59:59')
    const payments = await db.payment.findMany({
      where: {
        receptionistId: close.receptionistId,
        date: { gte: dayStart, lte: dayEnd },
      },
      include: { patient: true, items: true, methods: true },
      orderBy: { date: 'desc' },
    })
    return ok({ ...close, payments })
  })
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    const user = await requireRole(['ADMIN', 'RECEPTION'])
    const { id } = await params
    const body = await parseBody(req)
    const close = await db.cashClose.findUnique({ where: { id } })
    if (!close) return notFound('Cierre de caja no encontrado')
    if (close.status === 'CLOSED') return bad('El cierre de caja ya está cerrado')
    // Compute totals from payments of that date+receptionist
    const dayStart = new Date(close.date + 'T00:00:00')
    const dayEnd = new Date(close.date + 'T23:59:59')
    const payments = await db.payment.findMany({
      where: {
        receptionistId: close.receptionistId,
        date: { gte: dayStart, lte: dayEnd },
      },
      include: { methods: true, patient: true },
    })
    let totalCash = 0
    let totalTransfer = 0
    let totalCard = 0
    const attendedSet = new Set<string>()
    for (const p of payments) {
      attendedSet.add(p.patientId)
      for (const m of p.methods) {
        if (m.method === 'CASH') totalCash += m.amount
        else if (m.method === 'TRANSFER') totalTransfer += m.amount
        else if (m.method === 'CARD') totalCard += m.amount
      }
    }
    const totalCharged = totalCash + totalTransfer + totalCard
    const totalAttended = attendedSet.size
    const updated = await db.cashClose.update({
      where: { id },
      data: {
        totalCash,
        totalTransfer,
        totalCard,
        totalAttended,
        totalCharged,
        status: 'CLOSED',
        closedAt: new Date(),
        notes: body.notes || null,
      },
      include: { receptionist: true },
    })
    return ok(updated)
  })
}

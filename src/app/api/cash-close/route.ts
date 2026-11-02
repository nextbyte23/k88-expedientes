import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  return handleErrors(async () => {
    const user = await requireRole(['ADMIN', 'RECEPTION'])
    const url = new URL(req.url)
    const date = url.searchParams.get('date')
    const where: any = {}
    if (date) where.date = date
    if (user.role === 'RECEPTION') where.receptionistId = user.id
    const closes = await db.cashClose.findMany({
      where,
      include: { receptionist: true },
      orderBy: { openedAt: 'desc' },
    })
    return ok(closes)
  })
}

export async function POST(req: NextRequest) {
  return handleErrors(async () => {
    const user = await requireRole(['ADMIN', 'RECEPTION'])
    const body = await parseBody(req)
    const { date, openingBalance = 0 } = body
    if (!date) return bad('Fecha requerida')
    // Check there's no open cash close for that date+receptionist
    const existing = await db.cashClose.findFirst({
      where: { receptionistId: user.id, date, status: 'OPEN' },
    })
    if (existing) return bad('Ya existe un cierre de caja abierto para esa fecha')
    const close = await db.cashClose.create({
      data: {
        receptionistId: user.id,
        date,
        openingBalance: Number(openingBalance),
        status: 'OPEN',
      },
      include: { receptionist: true },
    })
    return ok(close)
  })
}

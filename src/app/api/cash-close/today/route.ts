import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { handleErrors, notFound, ok } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  return handleErrors(async () => {
    const user = await requireRole(['ADMIN', 'RECEPTION'])
    const url = new URL(req.url)
    let date = url.searchParams.get('date')
    if (!date) {
      date = new Date().toISOString().split('T')[0]
    }
    const where: any = { date, status: 'OPEN' }
    if (user.role === 'RECEPTION') where.receptionistId = user.id
    const close = await db.cashClose.findFirst({
      where,
      include: { receptionist: true },
    })
    return ok(close)
  })
}

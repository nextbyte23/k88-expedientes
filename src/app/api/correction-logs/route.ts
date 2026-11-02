import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { handleErrors, ok } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'COORDINATOR', 'DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR'])
    const url = new URL(req.url)
    const recordType = url.searchParams.get('recordType')
    const recordId = url.searchParams.get('recordId')
    const where: any = {}
    if (recordType) where.recordType = recordType
    if (recordId) where.recordId = recordId
    const logs = await db.correctionLog.findMany({
      where,
      include: { user: { include: { doctorProfile: true } } },
      orderBy: { correctedAt: 'desc' },
    })
    return ok(logs)
  })
}

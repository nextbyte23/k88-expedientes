import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { handleErrors, notFound, ok } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'COORDINATOR'])
    const { id } = await params
    const consent = await db.informedConsent.findUnique({
      where: { id },
      include: { patient: true, doctor: { include: { doctorProfile: true } } },
    })
    if (!consent) return notFound('Consentimiento no encontrado')
    return ok(consent)
  })
}

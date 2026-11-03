import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  return handleErrors(async () => {
    const user = await requireRole(['ADMIN', 'DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'COORDINATOR'])
    const url = new URL(req.url)
    const patientId = url.searchParams.get('patientId')
    const type = url.searchParams.get('type')
    const where: any = {}
    if (patientId) where.patientId = patientId
    if (type) where.type = type
    // Doctors see their own consents; coordinator sees all
    if (user.role === 'DENTAL_DOCTOR' || user.role === 'GENERAL_DOCTOR' || user.role === 'SPECIALIST_DOCTOR') {
      where.doctorId = user.id
    }
    const consents = await db.informedConsent.findMany({
      where,
      include: {
        patient: true,
        doctor: { include: { doctorProfile: true } },
      },
      orderBy: { date: 'desc' },
    })
    return ok(consents)
  })
}

export async function POST(req: NextRequest) {
  return handleErrors(async () => {
    const user = await requireRole(['DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'ADMIN'])
    const body = await parseBody(req)
    const { patientId, type, data, patientSignature, doctorSignature, witnessSignature, signed } = body
    if (!patientId || !type || !data) {
      return bad('Paciente, tipo y datos del consentimiento son obligatorios')
    }
    const consent = await db.informedConsent.create({
      data: {
        patientId,
        doctorId: user.id,
        type,
        data: typeof data === 'string' ? data : JSON.stringify(data),
        patientSignature: patientSignature || null,
        doctorSignature: doctorSignature || null,
        witnessSignature: witnessSignature || null,
        signedAt: signed ? new Date() : null,
      },
      include: { patient: true, doctor: { include: { doctorProfile: true } } },
    })
    return ok(consent)
  })
}

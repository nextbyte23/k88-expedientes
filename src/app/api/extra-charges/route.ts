import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  return handleErrors(async () => {
    const user = await requireRole(['ADMIN', 'RECEPTION', 'DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR'])
    const url = new URL(req.url)
    const patientId = url.searchParams.get('patientId')
    const status = url.searchParams.get('status') // PENDING | APPLIED
    const where: any = {}
    if (patientId) where.patientId = patientId
    if (status) where.status = status
    // Doctors see their own extra charges; reception sees all pending
    if (user.role === 'DENTAL_DOCTOR' || user.role === 'GENERAL_DOCTOR' || user.role === 'SPECIALIST_DOCTOR') {
      where.doctorId = user.id
    }
    if (user.role === 'RECEPTION') {
      // default to pending only unless status param set
      where.status = status || 'PENDING'
    }
    const charges = await db.extraCharge.findMany({
      where,
      include: { patient: true, doctor: { include: { doctorProfile: true } } },
      orderBy: { createdAt: 'desc' },
    })
    return ok(charges)
  })
}

export async function POST(req: NextRequest) {
  return handleErrors(async () => {
    const user = await requireRole(['DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'ADMIN'])
    const body = await parseBody(req)
    const { patientId, concept, description, amount } = body
    if (!patientId || !concept || !amount) return bad('Paciente, concepto y monto son obligatorios')
    const charge = await db.extraCharge.create({
      data: {
        patientId,
        doctorId: user.id,
        concept,
        description: description || null,
        amount: Number(amount),
        status: 'PENDING',
      },
      include: { patient: true, doctor: { include: { doctorProfile: true } } },
    })
    return ok(charge)
  })
}

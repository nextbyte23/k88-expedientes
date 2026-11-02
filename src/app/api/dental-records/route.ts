import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  return handleErrors(async () => {
    const user = await requireRole(['ADMIN', 'DENTAL_DOCTOR', 'COORDINATOR'])
    const url = new URL(req.url)
    const patientId = url.searchParams.get('patientId')
    const where: any = {}
    if (patientId) where.patientId = patientId
    if (user.role === 'DENTAL_DOCTOR') where.doctorId = user.id
    const records = await db.dentalRecord.findMany({
      where,
      include: {
        patient: true,
        doctor: { include: { doctorProfile: true } },
      },
      orderBy: { date: 'desc' },
    })
    return ok(records)
  })
}

export async function POST(req: NextRequest) {
  return handleErrors(async () => {
    const user = await requireRole(['DENTAL_DOCTOR', 'ADMIN'])
    const body = await parseBody(req)
    const { patientId, appointmentId, chiefComplaint, dentalExam, diagnosis, treatmentPlan, odontogramData } = body
    if (!patientId || !chiefComplaint || !diagnosis || !treatmentPlan) {
      return bad('Paciente, motivo de consulta, diagnóstico y plan de tratamiento son obligatorios')
    }
    const record = await db.dentalRecord.create({
      data: {
        patientId,
        doctorId: user.id,
        appointmentId: appointmentId || null,
        chiefComplaint,
        dentalExam: dentalExam || null,
        diagnosis,
        treatmentPlan,
        odontogramData: odontogramData
          ? typeof odontogramData === 'string'
            ? odontogramData
            : JSON.stringify(odontogramData)
          : null,
      },
      include: { patient: true, doctor: { include: { doctorProfile: true } } },
    })
    return ok(record)
  })
}

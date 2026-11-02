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
    const where: any = {}
    if (patientId) where.patientId = patientId
    // Doctors only see their own records (but coordinator sees all)
    if (user.role === 'GENERAL_DOCTOR' || user.role === 'SPECIALIST_DOCTOR') {
      where.doctorId = user.id
    }
    const records = await db.medicalRecord.findMany({
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
    const user = await requireRole(['GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'ADMIN'])
    const body = await parseBody(req)
    const {
      patientId,
      appointmentId,
      recordType,
      chiefComplaint,
      currentIllness,
      physicalExam,
      diagnosis,
      treatmentPlan,
      prognosis,
      vitalSigns,
      interconsultations,
    } = body
    if (!patientId || !chiefComplaint || !diagnosis || !treatmentPlan) {
      return bad('Paciente, motivo de consulta, diagnóstico y plan de tratamiento son obligatorios')
    }
    const record = await db.medicalRecord.create({
      data: {
        patientId,
        doctorId: user.id,
        appointmentId: appointmentId || null,
        recordType: recordType || (user.role === 'SPECIALIST_DOCTOR' ? 'SPECIALIST' : 'GENERAL'),
        chiefComplaint,
        currentIllness: currentIllness || null,
        physicalExam: physicalExam || null,
        diagnosis,
        treatmentPlan,
        prognosis: prognosis || null,
        vitalSigns: vitalSigns ? (typeof vitalSigns === 'string' ? vitalSigns : JSON.stringify(vitalSigns)) : null,
        interconsultations: interconsultations || null,
      },
      include: { patient: true, doctor: { include: { doctorProfile: true } } },
    })
    return ok(record)
  })
}

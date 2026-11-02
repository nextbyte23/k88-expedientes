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
    if (user.role === 'DENTAL_DOCTOR' || user.role === 'GENERAL_DOCTOR' || user.role === 'SPECIALIST_DOCTOR') {
      where.doctorId = user.id
    }
    const prescriptions = await db.prescription.findMany({
      where,
      include: {
        patient: true,
        doctor: { include: { doctorProfile: true } },
        items: true,
      },
      orderBy: { date: 'desc' },
    })
    return ok(prescriptions)
  })
}

export async function POST(req: NextRequest) {
  return handleErrors(async () => {
    const user = await requireRole(['DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'ADMIN'])
    const body = await parseBody(req)
    const { patientId, medicalRecordId, dentalRecordId, diagnosis, indications, items } = body
    if (!patientId || !diagnosis || !items || !Array.isArray(items) || items.length === 0) {
      return bad('Paciente, diagnóstico y al menos un medicamento son obligatorios')
    }
    const prescription = await db.prescription.create({
      data: {
        patientId,
        doctorId: user.id,
        medicalRecordId: medicalRecordId || null,
        dentalRecordId: dentalRecordId || null,
        diagnosis,
        indications: indications || null,
        items: {
          create: items.map((it: any) => ({
            medicationName: it.medicationName,
            dose: it.dose,
            frequency: it.frequency,
            route: it.route || 'Oral',
            duration: it.duration || null,
            notes: it.notes || null,
          })),
        },
      },
      include: { patient: true, doctor: { include: { doctorProfile: true } }, items: true },
    })
    return ok(prescription)
  })
}

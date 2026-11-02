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
    // Doctors only see their own notes; coordinator sees all
    if (user.role === 'DENTAL_DOCTOR' || user.role === 'GENERAL_DOCTOR' || user.role === 'SPECIALIST_DOCTOR') {
      where.doctorId = user.id
    }
    const notes = await db.evolutionNote.findMany({
      where,
      include: {
        patient: true,
        doctor: { include: { doctorProfile: true } },
      },
      orderBy: { date: 'desc' },
    })
    return ok(notes)
  })
}

export async function POST(req: NextRequest) {
  return handleErrors(async () => {
    const user = await requireRole(['DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'ADMIN'])
    const body = await parseBody(req)
    const {
      patientId, relatedRecordId, relatedRecordType, note,
      vitalSigns, currentStatus, treatment, nextAppointment,
    } = body
    if (!patientId || !note) return bad('Paciente y nota son obligatorios')
    const evo = await db.evolutionNote.create({
      data: {
        patientId,
        doctorId: user.id,
        relatedRecordId: relatedRecordId || null,
        relatedRecordType: relatedRecordType || null,
        note,
        vitalSigns: vitalSigns ? (typeof vitalSigns === 'string' ? vitalSigns : JSON.stringify(vitalSigns)) : null,
        currentStatus: currentStatus || null,
        treatment: treatment || null,
        nextAppointment: nextAppointment ? new Date(nextAppointment) : null,
      },
      include: { patient: true, doctor: { include: { doctorProfile: true } } },
    })
    return ok(evo)
  })
}

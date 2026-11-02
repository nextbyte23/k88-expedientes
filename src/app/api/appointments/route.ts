import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  return handleErrors(async () => {
    const user = await requireRole(['ADMIN', 'RECEPTION', 'DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'COORDINATOR'])
    const url = new URL(req.url)
    const doctorId = url.searchParams.get('doctorId')
    const patientId = url.searchParams.get('patientId')
    const date = url.searchParams.get('date') // YYYY-MM-DD
    const status = url.searchParams.get('status')

    const where: any = {}
    if (doctorId) where.doctorId = doctorId
    else if (user.role === 'DENTAL_DOCTOR' || user.role === 'GENERAL_DOCTOR' || user.role === 'SPECIALIST_DOCTOR') {
      where.doctorId = user.id
    }
    if (patientId) where.patientId = patientId
    if (status) where.status = status
    if (date) {
      const start = new Date(date + 'T00:00:00')
      const end = new Date(date + 'T23:59:59')
      where.dateTime = { gte: start, lte: end }
    }

    const appointments = await db.appointment.findMany({
      where,
      include: {
        patient: true,
        doctor: { include: { doctorProfile: true } },
      },
      orderBy: { dateTime: 'asc' },
    })
    return ok(appointments)
  })
}

export async function POST(req: NextRequest) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'RECEPTION'])
    const body = await parseBody(req)
    const { patientId, doctorId, dateTime, reason, notes, status } = body
    if (!patientId || !doctorId || !dateTime || !reason) return bad('Paciente, médico, fecha y motivo son obligatorios')
    const appointment = await db.appointment.create({
      data: {
        patientId,
        doctorId,
        dateTime: new Date(dateTime),
        reason,
        notes: notes || null,
        status: status || 'SCHEDULED',
      },
      include: {
        patient: true,
        doctor: { include: { doctorProfile: true } },
      },
    })
    return ok(appointment)
  })
}

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, notFound, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'RECEPTION', 'DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'COORDINATOR'])
    const { id } = await params
    const appointment = await db.appointment.findUnique({
      where: { id },
      include: { patient: true, doctor: { include: { doctorProfile: true } } },
    })
    if (!appointment) return notFound('Cita no encontrada')
    return ok(appointment)
  })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    const user = await requireRole(['ADMIN', 'RECEPTION', 'DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR'])
    const { id } = await params
    const body = await parseBody(req)
    const existing = await db.appointment.findUnique({ where: { id } })
    if (!existing) return notFound('Cita no encontrada')
    // Doctors can only update their own appointments' status
    if (user.role === 'DENTAL_DOCTOR' || user.role === 'GENERAL_DOCTOR' || user.role === 'SPECIALIST_DOCTOR') {
      if (existing.doctorId !== user.id) return bad('Solo puedes modificar tus citas')
    }
    const { dateTime, status, reason, notes, patientId, doctorId } = body
    const appointment = await db.appointment.update({
      where: { id },
      data: {
        dateTime: dateTime ? new Date(dateTime) : undefined,
        status: status ?? undefined,
        reason: reason ?? undefined,
        notes: notes ?? undefined,
        patientId: patientId ?? undefined,
        doctorId: doctorId ?? undefined,
      },
      include: { patient: true, doctor: { include: { doctorProfile: true } } },
    })
    return ok(appointment)
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'RECEPTION'])
    const { id } = await params
    await db.appointment.delete({ where: { id } })
    return ok({ success: true })
  })
}

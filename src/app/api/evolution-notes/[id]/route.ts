import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, notFound, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'COORDINATOR'])
    const { id } = await params
    const note = await db.evolutionNote.findUnique({
      where: { id },
      include: { patient: true, doctor: { include: { doctorProfile: true } } },
    })
    if (!note) return notFound('Nota de evolución no encontrada')
    return ok(note)
  })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    const user = await requireRole(['DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'ADMIN'])
    const { id } = await params
    const body = await parseBody(req)
    const existing = await db.evolutionNote.findUnique({ where: { id } })
    if (!existing) return notFound('Nota de evolución no encontrada')
    if (user.role !== 'ADMIN' && existing.doctorId !== user.id) return bad('Solo puedes corregir tus propias notas')
    const trackedFields = ['note', 'vitalSigns', 'currentStatus', 'treatment', 'nextAppointment']
    const corrections: Array<{ fieldName: string; oldValue: string | null; newValue: string | null }> = []
    for (const field of trackedFields) {
      if (field in body) {
        const oldVal = (existing as any)[field] || null
        let newVal = body[field] || null
        if (field === 'nextAppointment' && newVal) newVal = new Date(newVal).toISOString()
        if (field === 'vitalSigns' && newVal && typeof newVal !== 'string') newVal = JSON.stringify(newVal)
        const oldStr = oldVal instanceof Date ? oldVal.toISOString() : oldVal ? String(oldVal) : null
        const newStr = newVal ? String(newVal) : null
        if (oldStr !== newStr) corrections.push({ fieldName: field, oldValue: oldStr, newValue: newStr })
      }
    }
    const { note, vitalSigns, currentStatus, treatment, nextAppointment } = body
    const data: any = {}
    if (note !== undefined) data.note = note
    if (vitalSigns !== undefined) data.vitalSigns = vitalSigns ? (typeof vitalSigns === 'string' ? vitalSigns : JSON.stringify(vitalSigns)) : null
    if (currentStatus !== undefined) data.currentStatus = currentStatus
    if (treatment !== undefined) data.treatment = treatment
    if (nextAppointment !== undefined) data.nextAppointment = nextAppointment ? new Date(nextAppointment) : null
    const updated = await db.evolutionNote.update({
      where: { id },
      data,
      include: { patient: true, doctor: { include: { doctorProfile: true } } },
    })
    if (corrections.length > 0) {
      await db.correctionLog.createMany({
        data: corrections.map((c) => ({
          recordType: 'EVOLUTION_NOTE',
          recordId: id,
          userId: user.id,
          fieldName: c.fieldName,
          oldValue: c.oldValue,
          newValue: c.newValue,
          reason: body.correctionReason || null,
        })),
      })
    }
    return ok(updated)
  })
}

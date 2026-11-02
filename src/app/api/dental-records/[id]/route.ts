import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, notFound, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'DENTAL_DOCTOR', 'COORDINATOR'])
    const { id } = await params
    const record = await db.dentalRecord.findUnique({
      where: { id },
      include: { patient: true, doctor: { include: { doctorProfile: true } } },
    })
    if (!record) return notFound('Expediente dental no encontrado')
    return ok(record)
  })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    const user = await requireRole(['DENTAL_DOCTOR', 'ADMIN'])
    const { id } = await params
    const body = await parseBody(req)
    const existing = await db.dentalRecord.findUnique({ where: { id } })
    if (!existing) return notFound('Expediente dental no encontrado')
    if (user.role !== 'ADMIN' && existing.doctorId !== user.id) {
      return bad('Solo puedes corregir tus propios expedientes')
    }
    const trackedFields = ['chiefComplaint', 'dentalExam', 'diagnosis', 'treatmentPlan', 'odontogramData']
    const corrections: Array<{ fieldName: string; oldValue: string | null; newValue: string | null }> = []
    for (const field of trackedFields) {
      if (field in body) {
        const oldVal = (existing as any)[field] || null
        const newVal = body[field] || null
        const oldStr = typeof oldVal === 'string' ? oldVal : oldVal ? JSON.stringify(oldVal) : null
        const newStr = typeof newVal === 'string' ? newVal : newVal ? JSON.stringify(newVal) : null
        if (oldStr !== newStr) corrections.push({ fieldName: field, oldValue: oldStr, newValue: newStr })
      }
    }
    const { chiefComplaint, dentalExam, diagnosis, treatmentPlan, odontogramData } = body
    const data: any = {}
    if (chiefComplaint !== undefined) data.chiefComplaint = chiefComplaint
    if (dentalExam !== undefined) data.dentalExam = dentalExam
    if (diagnosis !== undefined) data.diagnosis = diagnosis
    if (treatmentPlan !== undefined) data.treatmentPlan = treatmentPlan
    if (odontogramData !== undefined) {
      data.odontogramData = odontogramData ? (typeof odontogramData === 'string' ? odontogramData : JSON.stringify(odontogramData)) : null
    }
    const record = await db.dentalRecord.update({
      where: { id },
      data,
      include: { patient: true, doctor: { include: { doctorProfile: true } } },
    })
    if (corrections.length > 0) {
      await db.correctionLog.createMany({
        data: corrections.map((c) => ({
          recordType: 'DENTAL_RECORD',
          recordId: id,
          userId: user.id,
          fieldName: c.fieldName,
          oldValue: c.oldValue,
          newValue: c.newValue,
          reason: body.correctionReason || null,
        })),
      })
    }
    return ok(record)
  })
}

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, notFound, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'COORDINATOR'])
    const { id } = await params
    const record = await db.medicalRecord.findUnique({
      where: { id },
      include: {
        patient: true,
        doctor: { include: { doctorProfile: true } },
      },
    })
    if (!record) return notFound('Expediente no encontrado')
    return ok(record)
  })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    const user = await requireRole(['GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'ADMIN'])
    const { id } = await params
    const body = await parseBody(req)
    const existing = await db.medicalRecord.findUnique({ where: { id } })
    if (!existing) return notFound('Expediente no encontrado')
    if (user.role !== 'ADMIN' && existing.doctorId !== user.id) {
      return bad('Solo puedes corregir tus propios expedientes')
    }
    // Track corrections for changed fields
    const trackedFields = [
      'chiefComplaint', 'currentIllness', 'physicalExam', 'diagnosis',
      'treatmentPlan', 'prognosis', 'vitalSigns', 'interconsultations',
    ]
    const corrections: Array<{ fieldName: string; oldValue: string | null; newValue: string | null }> = []
    for (const field of trackedFields) {
      if (field in body) {
        const oldVal = (existing as any)[field] || null
        const newVal = body[field] || null
        const oldStr = typeof oldVal === 'string' ? oldVal : oldVal ? JSON.stringify(oldVal) : null
        const newStr = typeof newVal === 'string' ? newVal : newVal ? JSON.stringify(newVal) : null
        if (oldStr !== newStr) {
          corrections.push({ fieldName: field, oldValue: oldStr, newValue: newStr })
        }
      }
    }
    const {
      chiefComplaint, currentIllness, physicalExam, diagnosis,
      treatmentPlan, prognosis, vitalSigns, interconsultations,
    } = body
    const data: any = {}
    if (chiefComplaint !== undefined) data.chiefComplaint = chiefComplaint
    if (currentIllness !== undefined) data.currentIllness = currentIllness
    if (physicalExam !== undefined) data.physicalExam = physicalExam
    if (diagnosis !== undefined) data.diagnosis = diagnosis
    if (treatmentPlan !== undefined) data.treatmentPlan = treatmentPlan
    if (prognosis !== undefined) data.prognosis = prognosis
    if (vitalSigns !== undefined) data.vitalSigns = vitalSigns ? (typeof vitalSigns === 'string' ? vitalSigns : JSON.stringify(vitalSigns)) : null
    if (interconsultations !== undefined) data.interconsultations = interconsultations

    const record = await db.medicalRecord.update({
      where: { id },
      data,
      include: { patient: true, doctor: { include: { doctorProfile: true } } },
    })

    if (corrections.length > 0) {
      await db.correctionLog.createMany({
        data: corrections.map((c) => ({
          recordType: 'MEDICAL_RECORD',
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

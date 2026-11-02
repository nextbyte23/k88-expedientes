import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, notFound, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'COORDINATOR'])
    const { id } = await params
    const prescription = await db.prescription.findUnique({
      where: { id },
      include: { patient: true, doctor: { include: { doctorProfile: true } }, items: true },
    })
    if (!prescription) return notFound('Receta no encontrada')
    return ok(prescription)
  })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    const user = await requireRole(['DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'ADMIN'])
    const { id } = await params
    const body = await parseBody(req)
    const existing = await db.prescription.findUnique({ where: { id }, include: { items: true } })
    if (!existing) return notFound('Receta no encontrada')
    if (user.role !== 'ADMIN' && existing.doctorId !== user.id) return bad('Solo puedes corregir tus propias recetas')
    const corrections: Array<{ fieldName: string; oldValue: string | null; newValue: string | null }> = []
    const trackFields = ['diagnosis', 'indications']
    for (const field of trackFields) {
      if (field in body) {
        const oldVal = (existing as any)[field] || null
        const newVal = body[field] || null
        if (oldVal !== newVal) corrections.push({ fieldName: field, oldValue: oldVal, newValue: newVal })
      }
    }
    const { diagnosis, indications, items } = body
    const data: any = {}
    if (diagnosis !== undefined) data.diagnosis = diagnosis
    if (indications !== undefined) data.indications = indications
    if (items !== undefined && Array.isArray(items)) {
      // Replace all items
      await db.prescriptionItem.deleteMany({ where: { prescriptionId: id } })
      data.items = {
        create: items.map((it: any) => ({
          medicationName: it.medicationName,
          dose: it.dose,
          frequency: it.frequency,
          route: it.route || 'Oral',
          duration: it.duration || null,
          notes: it.notes || null,
        })),
      }
      corrections.push({ fieldName: 'items', oldValue: JSON.stringify(existing.items), newValue: JSON.stringify(items) })
    }
    const prescription = await db.prescription.update({
      where: { id },
      data,
      include: { patient: true, doctor: { include: { doctorProfile: true } }, items: true },
    })
    if (corrections.length > 0) {
      await db.correctionLog.createMany({
        data: corrections.map((c) => ({
          recordType: 'PRESCRIPTION',
          recordId: id,
          userId: user.id,
          fieldName: c.fieldName,
          oldValue: c.oldValue,
          newValue: c.newValue,
          reason: body.correctionReason || null,
        })),
      })
    }
    return ok(prescription)
  })
}

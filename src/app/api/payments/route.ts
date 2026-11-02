import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'RECEPTION'])
    const url = new URL(req.url)
    const patientId = url.searchParams.get('patientId')
    const date = url.searchParams.get('date') // YYYY-MM-DD
    const where: any = {}
    if (patientId) where.patientId = patientId
    if (date) {
      const start = new Date(date + 'T00:00:00')
      const end = new Date(date + 'T23:59:59')
      where.date = { gte: start, lte: end }
    }
    const payments = await db.payment.findMany({
      where,
      include: {
        patient: true,
        receptionist: true,
        items: true,
        methods: true,
      },
      orderBy: { date: 'desc' },
    })
    return ok(payments)
  })
}

export async function POST(req: NextRequest) {
  return handleErrors(async () => {
    const user = await requireRole(['ADMIN', 'RECEPTION'])
    const body = await parseBody(req)
    const { patientId, appointmentId, items, methods, extraChargeIds } = body
    if (!patientId || !items || !Array.isArray(items) || items.length === 0) {
      return bad('Paciente y al menos un concepto de cobro son obligatorios')
    }
    if (!methods || !Array.isArray(methods) || methods.length === 0 || methods.length > 2) {
      return bad('Debe especificar 1 o 2 métodos de pago')
    }
    const totalAmount = items.reduce((sum: number, it: any) => sum + Number(it.amount), 0)
    const methodsTotal = methods.reduce((sum: number, m: any) => sum + Number(m.amount), 0)
    if (Math.abs(totalAmount - methodsTotal) > 0.01) {
      return bad(`El total de conceptos ($${totalAmount}) no coincide con el total de métodos de pago ($${methodsTotal})`)
    }
    const payment = await db.payment.create({
      data: {
        patientId,
        receptionistId: user.id,
        appointmentId: appointmentId || null,
        totalAmount,
        status: 'PAID',
        items: {
          create: items.map((it: any) => ({
            concept: it.concept,
            description: it.description,
            amount: Number(it.amount),
          })),
        },
        methods: {
          create: methods.map((m: any) => ({
            method: m.method,
            amount: Number(m.amount),
            reference: m.reference || null,
          })),
        },
      },
      include: { patient: true, items: true, methods: true, receptionist: true },
    })
    // Apply extra charges if provided
    if (extraChargeIds && Array.isArray(extraChargeIds) && extraChargeIds.length > 0) {
      await db.extraCharge.updateMany({
        where: { id: { in: extraChargeIds } },
        data: { status: 'APPLIED', appliedPaymentId: payment.id },
      })
    }
    return ok(payment)
  })
}

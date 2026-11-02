import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

function genFolio(): string {
  const ts = Date.now().toString().slice(-8)
  const rnd = Math.floor(Math.random() * 1000).toString().padStart(3, '0')
  return `F-${ts}${rnd}`
}

export async function GET(req: NextRequest) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'RECEPTION'])
    const url = new URL(req.url)
    const patientId = url.searchParams.get('patientId')
    const where: any = {}
    if (patientId) where.patientId = patientId
    const billings = await db.billing.findMany({
      where,
      include: { patient: true, payment: { include: { items: true, methods: true } }, receptionist: true },
      orderBy: { date: 'desc' },
    })
    return ok(billings)
  })
}

export async function POST(req: NextRequest) {
  return handleErrors(async () => {
    const user = await requireRole(['ADMIN', 'RECEPTION'])
    const body = await parseBody(req)
    const { patientId, paymentId, rfc, razonSocial, fiscalAddress, cfdiUse, subtotal, ivaRate = 0.16, items } = body
    if (!patientId || !rfc || !razonSocial) return bad('Paciente, RFC y razón social son obligatorios')
    let sub = subtotal
    if (sub === undefined && items && Array.isArray(items)) {
      sub = items.reduce((s: number, it: any) => s + Number(it.amount), 0)
    }
    if (sub === undefined) {
      if (paymentId) {
        const p = await db.payment.findUnique({ where: { id: paymentId } })
        if (p) sub = p.totalAmount
      }
    }
    if (sub === undefined) return bad('No se pudo determinar el subtotal')
    const iva = Number(sub) * Number(ivaRate)
    const total = Number(sub) + iva
    const billing = await db.billing.create({
      data: {
        patientId,
        paymentId: paymentId || null,
        receptionistId: user.id,
        folio: genFolio(),
        rfc,
        razonSocial,
        fiscalAddress: fiscalAddress || null,
        cfdiUse: cfdiUse || null,
        subtotal: Number(sub),
        iva,
        total,
        status: 'ISSUED',
      },
      include: { patient: true, payment: true, receptionist: true },
    })
    return ok(billing)
  })
}

import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET() {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'RECEPTION', 'DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'COORDINATOR'])
    const clinic = await db.clinic.findFirst()
    return ok(clinic)
  })
}

export async function PUT(req: NextRequest) {
  return handleErrors(async () => {
    await requireRole(['ADMIN'])
    const body = await parseBody(req)
    const { name, address, phone, email, rfc, fiscalAddress, logoUrl } = body
    if (!name || !address || !phone) return bad('Nombre, dirección y teléfono son obligatorios')
    const existing = await db.clinic.findFirst()
    let clinic
    if (existing) {
      clinic = await db.clinic.update({
        where: { id: existing.id },
        data: {
          name,
          address,
          phone,
          email: email || null,
          rfc: rfc || null,
          fiscalAddress: fiscalAddress || null,
          logoUrl: logoUrl ?? existing.logoUrl,
        },
      })
    } else {
      clinic = await db.clinic.create({
        data: {
          name,
          address,
          phone,
          email: email || null,
          rfc: rfc || null,
          fiscalAddress: fiscalAddress || null,
          logoUrl: logoUrl || null,
        },
      })
    }
    return ok(clinic)
  })
}

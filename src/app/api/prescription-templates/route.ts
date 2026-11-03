import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { bad, handleErrors, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  return handleErrors(async () => {
    const user = await requireUser()
    const url = new URL(req.url)
    const mineOnly = url.searchParams.get('mine') === 'true'
    // Show global templates + this doctor's personal templates
    const where = mineOnly
      ? { OR: [{ doctorId: null }, { doctorId: user.id }] }
      : { OR: [{ doctorId: null }, { doctorId: user.id }] }
    const templates = await db.prescriptionTemplate.findMany({
      where,
      include: { doctor: { include: { doctorProfile: true } } },
      orderBy: { name: 'asc' },
    })
    return ok(templates)
  })
}

export async function POST(req: NextRequest) {
  return handleErrors(async () => {
    const user = await requireUser()
    const body = await parseBody(req)
    const { name, diagnosis, indications, items } = body
    if (!name || !diagnosis || !items || !Array.isArray(items)) {
      return bad('Nombre, diagnóstico y medicamentos son obligatorios')
    }
    const template = await db.prescriptionTemplate.create({
      data: {
        name,
        diagnosis,
        indications: indications || null,
        itemsJson: JSON.stringify(items),
        doctorId: user.role === 'ADMIN' ? null : user.id,
      },
    })
    return ok(template)
  })
}

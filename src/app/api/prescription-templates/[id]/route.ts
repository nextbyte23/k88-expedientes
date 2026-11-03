import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireUser } from '@/lib/auth'
import { forbidden, handleErrors, notFound, ok } from '@/lib/api'

export const runtime = 'nodejs'

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    const user = await requireUser()
    const { id } = await params
    const template = await db.prescriptionTemplate.findUnique({ where: { id } })
    if (!template) return notFound('Plantilla no encontrada')
    // Solo el creador o admin puede borrar
    if (template.doctorId && template.doctorId !== user.id && user.role !== 'ADMIN') {
      return forbidden('No puedes borrar esta plantilla')
    }
    await db.prescriptionTemplate.delete({ where: { id } })
    return ok({ success: true })
  })
}

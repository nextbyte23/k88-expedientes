import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, requireRole } from '@/lib/auth'
import { bad, handleErrors, notFound, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    await requireRole(['ADMIN'])
    const { id } = await params
    const user = await db.user.findUnique({
      where: { id },
      include: { doctorProfile: true },
    })
    if (!user) return notFound('Usuario no encontrado')
    const { passwordHash, ...safe } = user
    return ok(safe)
  })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    await requireRole(['ADMIN'])
    const { id } = await params
    const body = await parseBody(req)
    const { email, password, role, active, fullName, career, specialty, professionalLicense } = body
    const existing = await db.user.findUnique({ where: { id }, include: { doctorProfile: true } })
    if (!existing) return notFound('Usuario no encontrado')
    if (email && email !== existing.email) {
      const dup = await db.user.findUnique({ where: { email: String(email).toLowerCase().trim() } })
      if (dup) return bad('El correo ya está registrado')
    }
    const data: any = {
      role: role ?? existing.role,
      active: active ?? existing.active,
      email: email ? String(email).toLowerCase().trim() : existing.email,
    }
    if (password) data.passwordHash = await hashPassword(password)
    const user = await db.user.update({
      where: { id },
      data,
      include: { doctorProfile: true },
    })
    // Update/create doctorProfile if role is a doctor
    const isDoctor = data.role === 'DENTAL_DOCTOR' || data.role === 'GENERAL_DOCTOR' || data.role === 'SPECIALIST_DOCTOR'
    if (isDoctor && fullName) {
      if (user.doctorProfile) {
        await db.doctorProfile.update({
          where: { userId: id },
          data: {
            fullName,
            career: career ?? user.doctorProfile.career,
            specialty: specialty ?? user.doctorProfile.specialty,
            professionalLicense: professionalLicense ?? user.doctorProfile.professionalLicense,
          },
        })
      } else {
        await db.doctorProfile.create({
          data: {
            userId: id,
            fullName,
            career: career || '',
            specialty: specialty || null,
            professionalLicense: professionalLicense || '',
          },
        })
      }
    } else if (!isDoctor && user.doctorProfile) {
      await db.doctorProfile.delete({ where: { userId: id } })
    }
    const refreshed = await db.user.findUnique({ where: { id }, include: { doctorProfile: true } })
    const { passwordHash, ...safe } = refreshed!
    return ok(safe)
  })
}

export async function DELETE(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    await requireRole(['ADMIN'])
    const { id } = await params
    const existing = await db.user.findUnique({ where: { id } })
    if (!existing) return notFound('Usuario no encontrado')
    // Soft delete: deactivate
    await db.user.update({ where: { id }, data: { active: false } })
    return ok({ success: true })
  })
}

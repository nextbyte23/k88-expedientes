import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { hashPassword, requireRole } from '@/lib/auth'
import { bad, handleErrors, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET() {
  return handleErrors(async () => {
    await requireRole(['ADMIN'])
    const users = await db.user.findMany({
      include: { doctorProfile: true },
      orderBy: { createdAt: 'desc' },
    })
    const safe = users.map((u) => {
      const { passwordHash, ...rest } = u
      return rest
    })
    return ok(safe)
  })
}

export async function POST(req: NextRequest) {
  return handleErrors(async () => {
    await requireRole(['ADMIN'])
    const body = await parseBody(req)
    const { email, password, role, fullName, career, specialty, professionalLicense, active } = body
    if (!email || !password || !role) return bad('Email, contraseña y rol son obligatorios')
    const existing = await db.user.findUnique({ where: { email: String(email).toLowerCase().trim() } })
    if (existing) return bad('El correo ya está registrado')
    const passwordHash = await hashPassword(password)
    const user = await db.user.create({
      data: {
        email: String(email).toLowerCase().trim(),
        passwordHash,
        role,
        active: active !== false,
        doctorProfile: (role === 'DENTAL_DOCTOR' || role === 'GENERAL_DOCTOR' || role === 'SPECIALIST_DOCTOR') && fullName
          ? {
              create: {
                fullName,
                career: career || '',
                specialty: specialty || null,
                professionalLicense: professionalLicense || '',
              },
            }
          : undefined,
      },
      include: { doctorProfile: true },
    })
    const { passwordHash: _, ...safe } = user
    return ok(safe)
  })
}

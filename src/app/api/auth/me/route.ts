import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { getCurrentUser, hashPassword, verifyPassword } from '@/lib/auth'
import { bad, handleErrors, ok, parseBody, unauthorized } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET() {
  return handleErrors(async () => {
    const user = await getCurrentUser()
    if (!user) return unauthorized()
    const clinic = await db.clinic.findFirst()
    return ok({ user, clinic })
  })
}

export async function PUT(req: NextRequest) {
  return handleErrors(async () => {
    const user = await getCurrentUser()
    if (!user) return unauthorized()

    const body = await parseBody(req)
    const { currentPassword, newPassword, fullName, career, specialty, professionalLicense } = body

    // If changing password, validate current password first
    if (newPassword) {
      if (!currentPassword) {
        return bad('Debes proporcionar tu contraseña actual para cambiarla')
      }
      const fullUser = await db.user.findUnique({ where: { id: user.id } })
      if (!fullUser) return unauthorized()
      const valid = await verifyPassword(currentPassword, fullUser.passwordHash)
      if (!valid) return bad('La contraseña actual es incorrecta')
      if (String(newPassword).length < 6) {
        return bad('La nueva contraseña debe tener al menos 6 caracteres')
      }
    }

    // Validate that doctor fields are only editable by doctors
    const isDoctor = user.role === 'DENTAL_DOCTOR' || user.role === 'GENERAL_DOCTOR' || user.role === 'SPECIALIST_DOCTOR'

    // Update password if requested
    if (newPassword) {
      const newHash = await hashPassword(newPassword)
      await db.user.update({
        where: { id: user.id },
        data: { passwordHash: newHash },
      })
    }

    // Update doctor profile fields if the user is a doctor and provided them
    if (isDoctor && (fullName || career || specialty !== undefined || professionalLicense)) {
      const existingProfile = await db.doctorProfile.findUnique({ where: { userId: user.id } })
      const profileData: any = {}
      if (fullName) profileData.fullName = String(fullName)
      if (career) profileData.career = String(career)
      if (specialty !== undefined) profileData.specialty = specialty ? String(specialty) : null
      if (professionalLicense) profileData.professionalLicense = String(professionalLicense)

      if (existingProfile) {
        await db.doctorProfile.update({
          where: { userId: user.id },
          data: profileData,
        })
      } else {
        await db.doctorProfile.create({
          data: {
            userId: user.id,
            fullName: fullName || user.email,
            career: career || '',
            specialty: specialty ? String(specialty) : null,
            professionalLicense: professionalLicense || '',
          },
        })
      }
    }

    // Return updated user
    const updated = await db.user.findUnique({
      where: { id: user.id },
      include: { doctorProfile: true },
    })
    if (!updated) return unauthorized()
    const { passwordHash, ...safe } = updated
    return ok(safe)
  })
}

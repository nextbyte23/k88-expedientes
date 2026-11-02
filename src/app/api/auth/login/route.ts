import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { createSession, setSessionCookie, verifyPassword } from '@/lib/auth'
import { bad, handleErrors, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  return handleErrors(async () => {
    const { email, password } = await parseBody(req)
    if (!email || !password) return bad('Email y contraseña requeridos')
    const user = await db.user.findUnique({
      where: { email: String(email).toLowerCase().trim() },
      include: { doctorProfile: true },
    })
    if (!user) return bad('Credenciales inválidas')
    if (!user.active) return bad('Usuario inactivo')
    const valid = await verifyPassword(password, user.passwordHash)
    if (!valid) return bad('Credenciales inválidas')
    const token = await createSession(user.id)
    await setSessionCookie(token)
    const { passwordHash, ...userWithoutPassword } = user
    const clinic = await db.clinic.findFirst()
    return ok({ user: userWithoutPassword, clinic })
  })
}

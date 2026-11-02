import bcrypt from 'bcryptjs'
import { randomBytes } from 'crypto'
import { cookies } from 'next/headers'
import { db } from './db'
import type { Role } from './roles'

export type { Role } from './roles'
export { ALL_ROLES, ROLE_LABELS } from './roles'

const SESSION_COOKIE = 'clinic_session'
const SESSION_DAYS = 7

export async function hashPassword(password: string): Promise<string> {
  return bcrypt.hash(password, 10)
}

export async function verifyPassword(password: string, hash: string): Promise<boolean> {
  return bcrypt.compare(password, hash)
}

export async function createSession(userId: string): Promise<string> {
  const token = randomBytes(32).toString('hex')
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  await db.session.create({
    data: { token, userId, expiresAt },
  })
  return token
}

export async function setSessionCookie(token: string) {
  const expires = new Date(Date.now() + SESSION_DAYS * 24 * 60 * 60 * 1000)
  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: 'lax',
    secure: false,
    path: '/',
    expires,
  })
}

export async function clearSessionCookie() {
  const cookieStore = await cookies()
  cookieStore.delete(SESSION_COOKIE)
}

export async function getSession() {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null
  const session = await db.session.findUnique({
    where: { token },
    include: {
      user: {
        include: { doctorProfile: true },
      },
    },
  })
  if (!session) return null
  if (session.expiresAt < new Date()) {
    await db.session.delete({ where: { id: session.id } })
    return null
  }
  return session
}

export async function getCurrentUser() {
  const session = await getSession()
  if (!session) return null
  const { passwordHash, ...userWithoutPassword } = session.user
  return userWithoutPassword
}

export async function requireUser() {
  const user = await getCurrentUser()
  if (!user) {
    throw new Error('No autenticado')
  }
  return user as NonNullable<typeof user>
}

export async function requireRole(roles: Role[]) {
  const user = await requireUser()
  if (!roles.includes(user.role as Role)) {
    throw new Error('Sin permisos para esta acción')
  }
  return user as NonNullable<typeof user>
}

export async function destroySession(token: string) {
  await db.session.deleteMany({ where: { token } })
}

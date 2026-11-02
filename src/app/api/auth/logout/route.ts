import { NextRequest } from 'next/server'
import { cookies } from 'next/headers'
import { db } from '@/lib/db'
import { clearSessionCookie, destroySession } from '@/lib/auth'
import { handleErrors, ok } from '@/lib/api'

export const runtime = 'nodejs'

export async function POST(req: NextRequest) {
  return handleErrors(async () => {
    const cookieStore = await cookies()
    const token = cookieStore.get('clinic_session')?.value
    if (token) await destroySession(token)
    await clearSessionCookie()
    return ok({ success: true })
  })
}

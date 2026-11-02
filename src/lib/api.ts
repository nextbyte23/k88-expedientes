import { NextResponse } from 'next/server'
import { requireUser } from './auth'

export type CurrentUser = Awaited<ReturnType<typeof requireUser>>

export function ok(data: unknown = null) {
  return NextResponse.json({ ok: true, data })
}

export function bad(message: string) {
  return NextResponse.json({ ok: false, error: message }, { status: 400 })
}

export function unauthorized(message = 'No autenticado') {
  return NextResponse.json({ ok: false, error: message }, { status: 401 })
}

export function forbidden(message = 'Sin permisos') {
  return NextResponse.json({ ok: false, error: message }, { status: 403 })
}

export function notFound(message = 'No encontrado') {
  return NextResponse.json({ ok: false, error: message }, { status: 404 })
}

export async function handleErrors<T>(fn: () => Promise<T>) {
  try {
    const result = await fn()
    return result
  } catch (e: unknown) {
    const err = e as { message?: string }
    if (err?.message === 'No autenticado') return unauthorized()
    if (err?.message === 'Sin permisos para esta acción') return forbidden()
    console.error('API error:', err)
    return bad(err?.message || 'Error interno')
  }
}

// Parses a body safely with a Zod-like manual check
export async function parseBody(req: Request): Promise<any> {
  try {
    return await req.json()
  } catch {
    return {}
  }
}

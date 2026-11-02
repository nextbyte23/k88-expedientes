'use client'

import { useQuery } from '@tanstack/react-query'

async function fetcher<T>(url: string): Promise<T> {
  const res = await fetch(url)
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'Error de servidor')
  return json.data as T
}

export function useApi<T>(key: any[], url: string | null, options?: { enabled?: boolean }) {
  return useQuery<T>({
    queryKey: key,
    queryFn: () => fetcher<T>(url!),
    enabled: !!url && (options?.enabled !== false),
  })
}

export async function apiPost<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'Error al guardar')
  return json.data as T
}

export async function apiPut<T>(url: string, body: any): Promise<T> {
  const res = await fetch(url, {
    method: 'PUT',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'Error al guardar')
  return json.data as T
}

export async function apiPatch<T>(url: string, body?: any): Promise<T> {
  const res = await fetch(url, {
    method: 'PATCH',
    headers: { 'Content-Type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'Error')
  return json.data as T
}

export async function apiDelete<T>(url: string): Promise<T> {
  const res = await fetch(url, { method: 'DELETE' })
  const json = await res.json()
  if (!json.ok) throw new Error(json.error || 'Error al eliminar')
  return json.data as T
}

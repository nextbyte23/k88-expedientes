export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat('es-MX', {
    style: 'currency',
    currency: 'MXN',
  }).format(amount || 0)
}

export function formatDate(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleDateString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  })
}

export function formatDateTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleString('es-MX', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function formatTime(date: Date | string | null | undefined): string {
  if (!date) return '—'
  const d = typeof date === 'string' ? new Date(date) : date
  if (isNaN(d.getTime())) return '—'
  return d.toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })
}

export function calcAge(birthDate: Date | string): string {
  const d = typeof birthDate === 'string' ? new Date(birthDate) : birthDate
  if (isNaN(d.getTime())) return '—'
  const diff = Date.now() - d.getTime()
  const ageDate = new Date(diff)
  return `${Math.abs(ageDate.getUTCFullYear() - 1970)} años`
}

export function todayISODate(): string {
  return new Date().toISOString().split('T')[0]
}

export function toLocalDatetimeInputValue(date: Date | string): string {
  const d = typeof date === 'string' ? new Date(date) : date
  const tzOffset = d.getTimezoneOffset() * 60000
  return new Date(d.getTime() - tzOffset).toISOString().slice(0, 16)
}

export const CONCEPT_LABELS: Record<string, string> = {
  CONSULTATION: 'Consulta',
  TREATMENT: 'Tratamiento',
  MEDICATION: 'Medicamento',
  STUDY: 'Estudio',
  OTHER: 'Otro',
}

export const METHOD_LABELS: Record<string, string> = {
  CASH: 'Efectivo',
  TRANSFER: 'Transferencia',
  CARD: 'Tarjeta',
}

export const STATUS_LABELS: Record<string, string> = {
  SCHEDULED: 'Programada',
  IN_PROGRESS: 'En curso',
  COMPLETED: 'Completada',
  CANCELLED: 'Cancelada',
  NO_SHOW: 'No asistió',
  PAID: 'Pagado',
  PARTIAL: 'Parcial',
  PENDING: 'Pendiente',
  APPLIED: 'Aplicado',
  OPEN: 'Abierto',
  CLOSED: 'Cerrado',
  ISSUED: 'Emitida',
}

export const STATUS_COLORS: Record<string, string> = {
  SCHEDULED: 'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
  IN_PROGRESS: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  COMPLETED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  CANCELLED: 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200',
  NO_SHOW: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200',
  PAID: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  PARTIAL: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  PENDING: 'bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200',
  APPLIED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  OPEN: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
  CLOSED: 'bg-gray-100 text-gray-800 dark:bg-gray-900/40 dark:text-gray-200',
  ISSUED: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200',
}

export const TOOTH_STATES = [
  { value: 'HEALTHY', label: 'Sano', color: '#ffffff' },
  { value: 'CARIES', label: 'Caries', color: '#ef4444' },
  { value: 'RESTORATION', label: 'Obturación', color: '#3b82f6' },
  { value: 'EXTRACTION', label: 'Ausente', color: '#6b7280' },
  { value: 'CROWN', label: 'Corona', color: '#eab308' },
  { value: 'ENDODONTICS', label: 'Endodoncia', color: '#a855f7' },
  { value: 'EXTRACTION_INDICATED', label: 'Extracción indicada', color: '#f97316' },
  { value: 'OTHER', label: 'Otro', color: '#14b8a6' },
] as const

export const TOOTH_SURFACES = ['Oclusal', 'Mesial', 'Distal', 'Vestibular', 'Lingual/Palatino']

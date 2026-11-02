'use client'

import { useState, useMemo, useEffect } from 'react'
import { useApi, apiPut, apiPost } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Checkbox } from '@/components/ui/checkbox'
import { useQueryClient } from '@tanstack/react-query'
import { TOOTH_STATES, TOOTH_SURFACES } from '@/lib/format'
import { Save, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

type OdontoEntry = {
  toothNumber: number
  state: string
  surface: string[]
  notes?: string
}

type DentalRecord = {
  id: string
  date: string
  chiefComplaint: string
  dentalExam: string | null
  diagnosis: string
  treatmentPlan: string
  odontogramData: string | null
  doctor: { doctorProfile?: { fullName: string } | null }
}

// Adult universal numbering: upper right 1-8, upper left 9-16, lower left 17-24, lower right 25-32
const UPPER_RIGHT = [1, 2, 3, 4, 5, 6, 7, 8]
const UPPER_LEFT = [9, 10, 11, 12, 13, 14, 15, 16]
const LOWER_LEFT = [17, 18, 19, 20, 21, 22, 23, 24]
const LOWER_RIGHT = [25, 26, 27, 28, 29, 30, 31, 32]

const STATE_COLOR: Record<string, string> = Object.fromEntries(TOOTH_STATES.map((s) => [s.value, s.color]))

export function Odontogram({ patientId }: { patientId: string }) {
  const qc = useQueryClient()
  const { data: records } = useApi<DentalRecord[]>(
    ['dental-records', patientId],
    `/api/dental-records?patientId=${patientId}`,
  )
  const latest = records?.[0]

  const initialEntries: OdontoEntry[] = useMemo(() => {
    if (!records || records.length === 0) return []
    const r = records[0]
    if (!r || !r.odontogramData) return []
    try { return JSON.parse(r.odontogramData) as OdontoEntry[] } catch { return [] }
  }, [records])

  const [entries, setEntries] = useState<OdontoEntry[]>([])
  const [editingTooth, setEditingTooth] = useState<number | null>(null)
  const [saving, setSaving] = useState(false)

  // Sync entries when the latest record's odontogram data loads/changes.
  useEffect(() => {
    setEntries(initialEntries)
  }, [initialEntries])

  function entryFor(tooth: number): OdontoEntry | undefined {
    return entries.find((e) => e.toothNumber === tooth)
  }

  function updateEntry(tooth: number, e: Partial<OdontoEntry>) {
    setEntries((prev) => {
      const existing = prev.find((x) => x.toothNumber === tooth)
      if (existing) {
        return prev.map((x) => (x.toothNumber === tooth ? { ...x, ...e } : x))
      }
      return [...prev, { toothNumber: tooth, state: 'HEALTHY', surface: [], notes: '', ...e }]
    })
  }

  function removeEntry(tooth: number) {
    setEntries((prev) => prev.filter((x) => x.toothNumber !== tooth))
    setEditingTooth(null)
  }

  async function saveAll() {
    if (!latest) {
      toast.error('Primero crea un expediente dental desde la pestaña "Historial"')
      return
    }
    setSaving(true)
    try {
      await apiPut(`/api/dental-records/${latest.id}`, {
        odontogramData: entries,
        correctionReason: 'Actualización de odontograma',
      })
      qc.invalidateQueries({ queryKey: ['dental-records', patientId] })
      qc.invalidateQueries({ queryKey: ['patient', patientId] })
      toast.success('Odontograma guardado')
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-4">
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Odontograma</CardTitle>
          <CardDescription>
            Clic en cada diente para registrar su estado. Numeración universal (1-32).
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Legend */}
          <div className="flex flex-wrap gap-3 text-xs">
            {TOOTH_STATES.map((s) => (
              <div key={s.value} className="flex items-center gap-1.5">
                <div
                  className="w-3.5 h-3.5 rounded border border-slate-400"
                  style={{ background: s.color === '#ffffff' ? 'white' : s.color }}
                />
                <span>{s.label}</span>
              </div>
            ))}
          </div>

          {/* Chart */}
          <div className="bg-white dark:bg-slate-900 rounded-lg p-4 border border-border overflow-x-auto">
            <div className="min-w-[640px] mx-auto space-y-2">
              {/* Upper row */}
              <div className="text-center text-xs text-muted-foreground mb-1">Maxilar Superior</div>
              <div className="flex justify-center gap-1">
                {[...UPPER_RIGHT, ...UPPER_LEFT].map((t) => (
                  <Tooth key={t} number={t} entry={entryFor(t)} onClick={() => setEditingTooth(t)} />
                ))}
              </div>
              <div className="flex justify-center text-[10px] text-muted-foreground">
                {[...UPPER_RIGHT, ...UPPER_LEFT].map((t) => (
                  <div key={t} className="w-7 text-center">{t}</div>
                ))}
              </div>
              <div className="border-t border-dashed border-slate-300 dark:border-slate-700 my-2" />
              <div className="flex justify-center text-[10px] text-muted-foreground">
                {[...LOWER_RIGHT, ...LOWER_LEFT].map((t) => (
                  <div key={t} className="w-7 text-center">{t}</div>
                ))}
              </div>
              <div className="flex justify-center gap-1">
                {[...LOWER_RIGHT, ...LOWER_LEFT].map((t) => (
                  <Tooth key={t} number={t} entry={entryFor(t)} onClick={() => setEditingTooth(t)} flipped />
                ))}
              </div>
              <div className="text-center text-xs text-muted-foreground mt-1">Maxilar Inferior</div>
            </div>
          </div>

          {/* Side labels */}
          <div className="flex justify-between text-xs text-muted-foreground px-2">
            <span>→ Derecha</span>
            <span>Izquierda ←</span>
          </div>

          <div className="flex justify-end gap-2">
            <Button variant="outline" size="sm" onClick={() => setEntries([])}>
              <Trash2 className="w-3.5 h-3.5 mr-1" /> Limpiar
            </Button>
            <Button size="sm" onClick={saveAll} disabled={saving || !latest}>
              <Save className="w-3.5 h-3.5 mr-1" /> {saving ? 'Guardando…' : 'Guardar odontograma'}
            </Button>
          </div>
          {!latest && (
            <p className="text-xs text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-900/30 p-2 rounded">
              Necesitas crear al menos un expediente dental antes de guardar el odontograma.
            </p>
          )}
        </CardContent>
      </Card>

      {/* Tooth editor popover */}
      {editingTooth !== null && (
        <Popover open onOpenChange={(o) => !o && setEditingTooth(null)}>
          <PopoverTrigger asChild>
            <button className="hidden" />
          </PopoverTrigger>
          <PopoverContent className="w-80" align="center">
            <ToothEditor
              tooth={editingTooth}
              entry={entryFor(editingTooth)}
              onSave={(e) => { updateEntry(editingTooth, e); setEditingTooth(null) }}
              onDelete={() => removeEntry(editingTooth)}
              onClose={() => setEditingTooth(null)}
            />
          </PopoverContent>
        </Popover>
      )}
    </div>
  )
}

function Tooth({ number, entry, onClick, flipped }: { number: number; entry?: OdontoEntry; onClick: () => void; flipped?: boolean }) {
  const color = entry ? STATE_COLOR[entry.state] || '#ffffff' : '#ffffff'
  return (
    <button
      onClick={onClick}
      className="relative w-7 h-9 group"
      title={entry ? `${TOOTH_STATES.find((s) => s.value === entry.state)?.label || entry.state}${entry.notes ? ' · ' + entry.notes : ''}` : 'Sin registro'}
    >
      <svg viewBox="0 0 24 32" className="w-full h-full">
        {/* tooth shape: a molar-ish rectangle with rounded top */}
        <path
          d={flipped
            ? "M2 28 Q2 14 12 4 Q22 14 22 28 Q22 30 20 30 L4 30 Q2 30 2 28 Z"
            : "M2 4 Q2 18 12 28 Q22 18 22 4 Q22 2 20 2 L4 2 Q2 2 2 4 Z"}
          fill={color === '#ffffff' ? 'white' : color}
          stroke="#475569"
          strokeWidth="1.2"
          opacity={entry ? 1 : 0.55}
        />
      </svg>
      {entry && entry.state !== 'HEALTHY' && (
        <span className="absolute inset-0 flex items-center justify-center text-[8px] font-bold text-white pointer-events-none">
          {entry.surface && entry.surface.length > 0 ? entry.surface.map((s) => s[0]).join('') : ''}
        </span>
      )}
    </button>
  )
}

function ToothEditor({
  tooth,
  entry,
  onSave,
  onDelete,
  onClose,
}: {
  tooth: number
  entry?: OdontoEntry
  onSave: (e: OdontoEntry) => void
  onDelete: () => void
  onClose: () => void
}) {
  const [state, setState] = useState(entry?.state || 'HEALTHY')
  const [surfaces, setSurfaces] = useState<string[]>(entry?.surface || [])
  const [notes, setNotes] = useState(entry?.notes || '')

  function toggleSurface(s: string) {
    setSurfaces((prev) => (prev.includes(s) ? prev.filter((x) => x !== s) : [...prev, s]))
  }

  return (
    <div className="space-y-3">
      <div>
        <p className="font-semibold text-sm">Diente #{tooth}</p>
        <p className="text-xs text-muted-foreground">Selecciona el estado y las caras afectadas</p>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Estado</Label>
        <Select value={state} onValueChange={setState}>
          <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
          <SelectContent>
            {TOOTH_STATES.map((s) => (
              <SelectItem key={s.value} value={s.value}>{s.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Caras afectadas</Label>
        <div className="grid grid-cols-2 gap-1.5">
          {TOOTH_SURFACES.map((s) => (
            <label key={s} className="flex items-center gap-1.5 text-xs">
              <Checkbox checked={surfaces.includes(s)} onCheckedChange={() => toggleSurface(s)} />
              {s}
            </label>
          ))}
        </div>
      </div>
      <div className="space-y-1.5">
        <Label className="text-xs">Notas</Label>
        <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones…" className="h-8" />
      </div>
      <div className="flex justify-between gap-2 pt-2">
        {entry && (
          <Button variant="ghost" size="sm" className="text-rose-600" onClick={onDelete}>
            <Trash2 className="w-3.5 h-3.5" /> Eliminar
          </Button>
        )}
        <div className="flex gap-2 ml-auto">
          <Button variant="outline" size="sm" onClick={onClose}>Cerrar</Button>
          <Button size="sm" onClick={() => onSave({ toothNumber: tooth, state, surface: surfaces, notes })}>
            Guardar
          </Button>
        </div>
      </div>
    </div>
  )
}

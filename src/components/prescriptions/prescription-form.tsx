'use client'

import { useState } from 'react'
import { apiPost } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Plus, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

type Item = {
  medicationName: string
  dose: string
  frequency: string
  route: string
  duration: string
  notes: string
}

const ROUTES = ['Oral', 'Tópica', 'Intravenosa', 'Intramuscular', 'Sublingual', 'Inhalada', 'Oftálmica', 'Ótica']

export function PrescriptionForm({ patientId, onDone, onCancel }: { patientId: string; onDone: () => void; onCancel: () => void }) {
  const [diagnosis, setDiagnosis] = useState('')
  const [indications, setIndications] = useState('')
  const [items, setItems] = useState<Item[]>([
    { medicationName: '', dose: '', frequency: '', route: 'Oral', duration: '', notes: '' },
  ])
  const [saving, setSaving] = useState(false)

  function updateItem(idx: number, field: keyof Item, value: string) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)))
  }
  function addItem() {
    setItems((prev) => [...prev, { medicationName: '', dose: '', frequency: '', route: 'Oral', duration: '', notes: '' }])
  }
  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }

  async function save() {
    if (!diagnosis) {
      toast.error('El diagnóstico es obligatorio')
      return
    }
    const validItems = items.filter((it) => it.medicationName && it.dose && it.frequency)
    if (validItems.length === 0) {
      toast.error('Agrega al menos un medicamento completo (nombre, dosis y frecuencia)')
      return
    }
    setSaving(true)
    try {
      await apiPost('/api/prescriptions', {
        patientId,
        diagnosis,
        indications: indications || undefined,
        items: validItems,
      })
      toast.success('Receta guardada')
      onDone()
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Nueva receta médica</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Diagnóstico *</Label>
          <Input value={diagnosis} onChange={(e) => setDiagnosis(e.target.value)} placeholder="Diagnóstico clínico" />
        </div>
        <div className="space-y-1.5">
          <Label>Indicaciones generales</Label>
          <Textarea value={indications} onChange={(e) => setIndications(e.target.value)} rows={2} placeholder="Indicaciones adicionales para el paciente" />
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <Label className="text-sm font-semibold">Medicamentos</Label>
            <Button size="sm" variant="outline" onClick={addItem}>
              <Plus className="w-3.5 h-3.5 mr-1" /> Agregar
            </Button>
          </div>
          {items.map((it, idx) => (
            <div key={idx} className="grid grid-cols-1 sm:grid-cols-12 gap-2 items-end p-3 rounded-md border border-border bg-muted/30">
              <div className="sm:col-span-4 space-y-1">
                <Label className="text-xs">Medicamento *</Label>
                <Input value={it.medicationName} onChange={(e) => updateItem(idx, 'medicationName', e.target.value)} placeholder="Paracetamol" className="h-8" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Dosis *</Label>
                <Input value={it.dose} onChange={(e) => updateItem(idx, 'dose', e.target.value)} placeholder="500mg" className="h-8" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Frecuencia *</Label>
                <Input value={it.frequency} onChange={(e) => updateItem(idx, 'frequency', e.target.value)} placeholder="c/8h" className="h-8" />
              </div>
              <div className="sm:col-span-2 space-y-1">
                <Label className="text-xs">Vía</Label>
                <Select value={it.route} onValueChange={(v) => updateItem(idx, 'route', v)}>
                  <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {ROUTES.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
                  </SelectContent>
                </Select>
              </div>
              <div className="sm:col-span-1 space-y-1">
                <Label className="text-xs">Duración</Label>
                <Input value={it.duration} onChange={(e) => updateItem(idx, 'duration', e.target.value)} placeholder="7 días" className="h-8" />
              </div>
              <div className="sm:col-span-1 flex justify-end">
                <Button size="icon" variant="ghost" className="text-rose-600" onClick={() => removeItem(idx)}>
                  <Trash2 className="w-4 h-4" />
                </Button>
              </div>
              <div className="sm:col-span-12 space-y-1">
                <Label className="text-xs">Notas</Label>
                <Input value={it.notes} onChange={(e) => updateItem(idx, 'notes', e.target.value)} placeholder="Tomar con alimentos, etc." className="h-8" />
              </div>
            </div>
          ))}
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar receta'}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

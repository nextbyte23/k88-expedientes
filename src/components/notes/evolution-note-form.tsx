'use client'

import { useState } from 'react'
import { apiPost } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { toast } from 'sonner'

export function EvolutionNoteForm({ patientId, onDone, onCancel }: { patientId: string; onDone: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    note: '',
    currentStatus: '',
    treatment: '',
    nextAppointment: '',
    vitalSigns: { bp: '', hr: '', rr: '', temp: '', weight: '', height: '', spo2: '' },
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.note) {
      toast.error('La nota es obligatoria')
      return
    }
    setSaving(true)
    try {
      await apiPost('/api/evolution-notes', {
        patientId,
        note: form.note,
        currentStatus: form.currentStatus || undefined,
        treatment: form.treatment || undefined,
        nextAppointment: form.nextAppointment || undefined,
        vitalSigns: form.vitalSigns,
      })
      toast.success('Nota de evolución guardada')
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
        <CardTitle className="text-base">Nueva nota de evolución (NOM-004)</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-1.5">
          <Label>Nota de evolución *</Label>
          <Textarea
            value={form.note}
            onChange={(e) => setForm({ ...form, note: e.target.value })}
            rows={6}
            placeholder="Describe la evolución del paciente, hallazgos, decisiones clínicas…"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <div className="space-y-1.5">
            <Label>Estado actual</Label>
            <Input value={form.currentStatus} onChange={(e) => setForm({ ...form, currentStatus: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Tratamiento</Label>
            <Input value={form.treatment} onChange={(e) => setForm({ ...form, treatment: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Próxima cita</Label>
            <Input type="datetime-local" value={form.nextAppointment} onChange={(e) => setForm({ ...form, nextAppointment: e.target.value })} />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground uppercase">Signos vitales</Label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-1">
            <SmallField label="TA" value={form.vitalSigns.bp} onChange={(v) => setForm({ ...form, vitalSigns: { ...form.vitalSigns, bp: v } })} placeholder="120/80" />
            <SmallField label="FC" value={form.vitalSigns.hr} onChange={(v) => setForm({ ...form, vitalSigns: { ...form.vitalSigns, hr: v } })} placeholder="80" />
            <SmallField label="FR" value={form.vitalSigns.rr} onChange={(v) => setForm({ ...form, vitalSigns: { ...form.vitalSigns, rr: v } })} placeholder="18" />
            <SmallField label="Temp °C" value={form.vitalSigns.temp} onChange={(v) => setForm({ ...form, vitalSigns: { ...form.vitalSigns, temp: v } })} placeholder="36.5" />
            <SmallField label="Peso kg" value={form.vitalSigns.weight} onChange={(v) => setForm({ ...form, vitalSigns: { ...form.vitalSigns, weight: v } })} placeholder="70" />
            <SmallField label="Talla cm" value={form.vitalSigns.height} onChange={(v) => setForm({ ...form, vitalSigns: { ...form.vitalSigns, height: v } })} placeholder="170" />
            <SmallField label="SpO₂ %" value={form.vitalSigns.spo2} onChange={(v) => setForm({ ...form, vitalSigns: { ...form.vitalSigns, spo2: v } })} placeholder="98" />
          </div>
        </div>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar nota'}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function SmallField({ label, value, onChange, placeholder }: { label: string; value: string; onChange: (v: string) => void; placeholder?: string }) {
  return (
    <div className="space-y-1">
      <Label className="text-xs">{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} className="h-8" />
    </div>
  )
}

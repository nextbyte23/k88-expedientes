'use client'

import { useState } from 'react'
import { apiPost } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Odontogram } from './odontogram'
import { toast } from 'sonner'

export function DentalRecordForm({ patientId, onDone, onCancel }: { patientId: string; onDone: () => void; onCancel: () => void }) {
  const [form, setForm] = useState({
    chiefComplaint: '',
    dentalExam: '',
    diagnosis: '',
    treatmentPlan: '',
  })
  const [odontogramData, setOdontogramData] = useState<any[]>([])
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.chiefComplaint || !form.diagnosis || !form.treatmentPlan) {
      toast.error('Motivo de consulta, diagnóstico y plan de tratamiento son obligatorios')
      return
    }
    setSaving(true)
    try {
      await apiPost('/api/dental-records', {
        patientId,
        ...form,
        odontogramData,
      })
      toast.success('Expediente dental guardado')
      onDone()
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
          <CardTitle className="text-base">Nuevo expediente dental</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-1.5">
            <Label>Motivo de consulta *</Label>
            <Textarea value={form.chiefComplaint} onChange={(e) => setForm({ ...form, chiefComplaint: e.target.value })} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Exploración dental</Label>
            <Textarea value={form.dentalExam} onChange={(e) => setForm({ ...form, dentalExam: e.target.value })} rows={3} />
          </div>
          <div className="space-y-1.5">
            <Label>Diagnóstico *</Label>
            <Textarea value={form.diagnosis} onChange={(e) => setForm({ ...form, diagnosis: e.target.value })} rows={2} />
          </div>
          <div className="space-y-1.5">
            <Label>Plan de tratamiento *</Label>
            <Textarea value={form.treatmentPlan} onChange={(e) => setForm({ ...form, treatmentPlan: e.target.value })} rows={3} />
          </div>
        </CardContent>
      </Card>

      <OdontogramInline patientId={patientId} onChange={setOdontogramData} />

      <div className="flex justify-end gap-2">
        <Button variant="outline" onClick={onCancel}>Cancelar</Button>
        <Button onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar expediente'}</Button>
      </div>
    </div>
  )
}

// Inline odontogram editor for the new-record form (doesn't depend on a saved record)
function OdontogramInline({ patientId, onChange }: { patientId: string; onChange: (data: any[]) => void }) {
  // For simplicity in the new-record flow, we render the full Odontogram but capture changes through a local store
  // However, since Odontogram saves to the latest record, in the new-record case there's no latest record.
  // To keep things simple, we render a read-only "preview" message and let the user save the record first, then edit the odontogram from the patient detail tab.
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-base">Odontograma</CardTitle>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-muted-foreground">
          Una vez guardado el expediente, podrás editar el odontograma interactivo desde la pestaña
          <b> Odontograma</b> del paciente.
        </p>
      </CardContent>
    </Card>
  )
}

'use client'

import { useState } from 'react'
import { apiPost } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { useStore } from '@/store/app-store'
import { toast } from 'sonner'

export function MedicalRecordForm({ patientId, onDone, onCancel }: { patientId: string; onDone: () => void; onCancel: () => void }) {
  const { user } = useStore()
  const [form, setForm] = useState({
    chiefComplaint: '',
    currentIllness: '',
    physicalExam: '',
    diagnosis: '',
    treatmentPlan: '',
    prognosis: '',
    interconsultations: '',
    vitalSigns: { bp: '', hr: '', rr: '', temp: '', weight: '', height: '', spo2: '' },
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.chiefComplaint || !form.diagnosis || !form.treatmentPlan) {
      toast.error('Motivo de consulta, diagnóstico y plan de tratamiento son obligatorios')
      return
    }
    setSaving(true)
    try {
      await apiPost('/api/medical-records', {
        patientId,
        recordType: user?.role === 'SPECIALIST_DOCTOR' ? 'SPECIALIST' : 'GENERAL',
        ...form,
      })
      toast.success('Expediente clínico guardado')
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
        <CardTitle className="text-base">Nuevo expediente clínico — {user?.role === 'SPECIALIST_DOCTOR' ? 'Especialista' : 'General'}</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Section title="Subjetivo">
          <Field label="Motivo de consulta *" value={form.chiefComplaint} onChange={(v) => setForm({ ...form, chiefComplaint: v })} textarea />
          <Field label="Enfermedad actual" value={form.currentIllness} onChange={(v) => setForm({ ...form, currentIllness: v })} textarea />
        </Section>
        <Section title="Objetivo">
          <Field label="Exploración física" value={form.physicalExam} onChange={(v) => setForm({ ...form, physicalExam: v })} textarea />
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <SmallField label="Tensión arterial" value={form.vitalSigns.bp} onChange={(v) => setForm({ ...form, vitalSigns: { ...form.vitalSigns, bp: v } })} placeholder="120/80" />
            <SmallField label="FC (lpm)" value={form.vitalSigns.hr} onChange={(v) => setForm({ ...form, vitalSigns: { ...form.vitalSigns, hr: v } })} placeholder="80" />
            <SmallField label="FR (rpm)" value={form.vitalSigns.rr} onChange={(v) => setForm({ ...form, vitalSigns: { ...form.vitalSigns, rr: v } })} placeholder="18" />
            <SmallField label="Temp (°C)" value={form.vitalSigns.temp} onChange={(v) => setForm({ ...form, vitalSigns: { ...form.vitalSigns, temp: v } })} placeholder="36.5" />
            <SmallField label="Peso (kg)" value={form.vitalSigns.weight} onChange={(v) => setForm({ ...form, vitalSigns: { ...form.vitalSigns, weight: v } })} placeholder="70" />
            <SmallField label="Talla (cm)" value={form.vitalSigns.height} onChange={(v) => setForm({ ...form, vitalSigns: { ...form.vitalSigns, height: v } })} placeholder="170" />
            <SmallField label="SpO₂ (%)" value={form.vitalSigns.spo2} onChange={(v) => setForm({ ...form, vitalSigns: { ...form.vitalSigns, spo2: v } })} placeholder="98" />
          </div>
        </Section>
        <Section title="Assessment">
          <Field label="Diagnóstico *" value={form.diagnosis} onChange={(v) => setForm({ ...form, diagnosis: v })} textarea />
        </Section>
        <Section title="Plan">
          <Field label="Plan de tratamiento *" value={form.treatmentPlan} onChange={(v) => setForm({ ...form, treatmentPlan: v })} textarea />
          <Field label="Pronóstico" value={form.prognosis} onChange={(v) => setForm({ ...form, prognosis: v })} />
          <Field label="Interconsultas" value={form.interconsultations} onChange={(v) => setForm({ ...form, interconsultations: v })} placeholder="Ej. Cardiología" />
        </Section>
        <div className="flex justify-end gap-2">
          <Button variant="outline" onClick={onCancel}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar expediente'}</Button>
        </div>
      </CardContent>
    </Card>
  )
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="space-y-2">
      <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">{title}</p>
      <div className="space-y-2">{children}</div>
    </div>
  )
}

function Field({ label, value, onChange, textarea }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {textarea ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={3} />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} />
      )}
    </div>
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

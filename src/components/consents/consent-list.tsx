'use client'

import { useState } from 'react'
import { useApi, apiPost } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Checkbox } from '@/components/ui/checkbox'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, FileText, Printer, Save } from 'lucide-react'
import { formatDate, formatDateTime } from '@/lib/format'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'
import { useStore } from '@/store/app-store'
import { PrintLayout } from '@/components/print/print-layout'

type Consent = {
  id: string
  type: string
  date: string
  data: string
  patientSignature: string | null
  doctorSignature: string | null
  witnessSignature: string | null
  signedAt: string | null
  patient: { id: string; firstName: string; lastName: string; birthDate: string; gender: string; phone: string }
  doctor: { doctorProfile?: { fullName: string; career: string; professionalLicense: string } | null; email: string }
}

const CONSENT_TYPES: Record<string, string> = {
  FIRST_VISIT: 'Primera cita',
  TREATMENT_PROPOSAL: 'Propuesta de tratamiento',
  SURGICAL: 'Procedimiento quirúrgico',
}

type Patient = { id: string; firstName: string; lastName: string }

export function ConsentList() {
  const { user } = useStore()
  const [showForm, setShowForm] = useState(false)
  const [type, setType] = useState<string>('FIRST_VISIT')
  const qc = useQueryClient()
  const { data: consents, isLoading } = useApi<Consent[]>(['informed-consents'], '/api/informed-consents')
  const { data: patients } = useApi<Patient[]>(['patients-all'], '/api/patients')

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Consentimientos informados</h1>
          <p className="text-sm text-muted-foreground">Documentos legales firmados por pacientes</p>
        </div>
      </div>

      {/* Quick create buttons */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {(Object.keys(CONSENT_TYPES) as Array<keyof typeof CONSENT_TYPES>).map((t) => (
          <Card key={t} className="hover:shadow-md transition cursor-pointer" >
            <CardContent
              className="p-4 flex items-start gap-3"
              onClick={() => { setType(t); setShowForm(true) }}
            >
              <div className="w-10 h-10 rounded-lg bg-teal-100 dark:bg-teal-900/30 text-teal-700 dark:text-teal-300 flex items-center justify-center shrink-0">
                <FileText className="w-5 h-5" />
              </div>
              <div>
                <p className="font-semibold text-sm">{CONSENT_TYPES[t]}</p>
                <p className="text-xs text-muted-foreground mt-0.5">Clic para crear uno nuevo</p>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base">Consentimientos registrados</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center text-muted-foreground">Cargando…</p>
          ) : consents && consents.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="hidden md:table-cell">Médico</TableHead>
                  <TableHead>Firmado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {consents.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs">{formatDateTime(c.date)}</TableCell>
                    <TableCell><Badge variant="outline">{CONSENT_TYPES[c.type] || c.type}</Badge></TableCell>
                    <TableCell className="text-xs">{c.patient.firstName} {c.patient.lastName}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{c.doctor?.doctorProfile?.fullName || c.doctor?.email}</TableCell>
                    <TableCell>
                      {c.signedAt ? (
                        <Badge className="bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200">Firmado</Badge>
                      ) : (
                        <Badge className="bg-amber-100 text-amber-800 dark:bg-amber-900/40 dark:text-amber-200">Pendiente</Badge>
                      )}
                    </TableCell>
                    <TableCell className="text-right">
                      <ConsentPrintButton consent={c} />
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <FileText className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Sin consentimientos registrados</p>
              <p className="text-xs mt-1">Usa las tarjetas de arriba para crear uno nuevo.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <ConsentFormDialog
          type={type}
          patients={patients || []}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            qc.invalidateQueries({ queryKey: ['informed-consents'] })
          }}
        />
      )}
    </div>
  )
}

// Print button that uses the PrintLayout component
function ConsentPrintButton({ consent }: { consent: Consent }) {
  const data = (() => {
    try { return JSON.parse(consent.data) } catch { return {} }
  })()
  const title = CONSENT_TYPES[consent.type] || 'Consentimiento Informado'

  return (
    <PrintLayout
      title={title}
      patient={consent.patient}
      doctorName={consent.doctor?.doctorProfile?.fullName || ''}
      doctorLicense={consent.doctor?.doctorProfile?.professionalLicense}
      doctorCareer={consent.doctor?.doctorProfile?.career}
    >
      <ConsentPrintBody consent={consent} data={data} />
    </PrintLayout>
  )
}

// Renders the consent body for printing
function ConsentPrintBody({ consent, data }: { consent: Consent; data: any }) {
  const renderFields = (fields: Array<[string, any]>) => (
    <div className="space-y-1">
      {fields.map(([label, value]) => (
        <div key={label} style={{ display: 'flex', gap: '8px' }}>
          <span style={{ fontWeight: 600, minWidth: '200px' }}>{label}:</span>
          <span>{value || '—'}</span>
        </div>
      ))}
    </div>
  )

  if (consent.type === 'FIRST_VISIT') {
    return (
      <div className="space-y-4">
        <p><b>Motivo de consulta:</b> {data.reason || '—'}</p>
        <h3 style={{ fontWeight: 700, marginTop: '12px' }}>Antecedentes médicos</h3>
        {renderFields([
          ['Enfermedades crónicas', data.chronicConditions],
          ['Medicamentos actuales', data.currentMedications],
          ['Alergias', data.allergies],
          ['Reacción adversa a anestesia', data.anesthesiaReaction],
          ['Fumador', data.smoker],
          ['Consumo de alcohol', data.alcohol],
          ['Embarazo (si aplica)', data.pregnancy],
          ['Antecedentes familiares', data.familyHistory],
        ])}
        <h3 style={{ fontWeight: 700, marginTop: '12px' }}>Antecedentes dentales</h3>
        {renderFields([
          ['Última visita al dentista', data.lastDentalVisit],
          ['Higiene bucal', data.oralHygiene],
          ['Sangrado de encías', data.gumBleeding],
        ])}
        <h3 style={{ fontWeight: 700, marginTop: '12px' }}>Autorización</h3>
        <p>{data.authorizationText || 'Autorizo al equipo de la clínica a realizar el diagnóstico y tratamiento que considere necesario, habiendo sido informado(a) de los procedimientos, riesgos y alternativas.'}</p>
        <div style={{ marginTop: '16px' }}>
          <p><b>Firma del paciente:</b> {consent.patientSignature || '—'}</p>
          <p><b>Firma del médico:</b> {consent.doctorSignature || '—'}</p>
        </div>
      </div>
    )
  }

  if (consent.type === 'TREATMENT_PROPOSAL') {
    return (
      <div className="space-y-4">
        {renderFields([
          ['Diagnóstico', data.diagnosis],
          ['Tratamiento propuesto', data.proposedTreatment],
          ['Alternativas', data.alternatives],
          ['Costo estimado', data.estimatedCost],
          ['Número de sesiones', data.sessions],
          ['Duración estimada', data.duration],
        ])}
        <h3 style={{ fontWeight: 700, marginTop: '12px' }}>Riesgos y beneficios</h3>
        <p><b>Riesgos:</b> {data.risks || '—'}</p>
        <p><b>Beneficios:</b> {data.benefits || '—'}</p>
        <h3 style={{ fontWeight: 700, marginTop: '12px' }}>Autorización</h3>
        <p>{data.authorizationText || 'Autorizo la realización del tratamiento descrito, habiendo comprendido los riesgos, beneficios y alternativas.'}</p>
        <div style={{ marginTop: '16px' }}>
          <p><b>Firma del paciente:</b> {consent.patientSignature || '—'}</p>
          <p><b>Firma del médico:</b> {consent.doctorSignature || '—'}</p>
        </div>
      </div>
    )
  }

  // SURGICAL
  return (
    <div className="space-y-4">
      {renderFields([
        ['Procedimiento quirúrgico', data.procedure],
        ['Descripción detallada', data.description],
        ['Anestesia a utilizar', data.anesthesia],
        ['Medicación postoperatoria', data.postMedication],
        ['Cuidados postoperatorios', data.postCare],
      ])}
      <h3 style={{ fontWeight: 700, marginTop: '12px' }}>Riesgos y complicaciones</h3>
      <p>{data.risks || '—'}</p>
      <h3 style={{ fontWeight: 700, marginTop: '12px' }}>Alternativas al procedimiento</h3>
      <p>{data.alternatives || '—'}</p>
      <h3 style={{ fontWeight: 700, marginTop: '12px' }}>Autorización</h3>
      <p>{data.authorizationText || 'Autorizo la realización del procedimiento quirúrgico descrito, habiendo sido informado(a) de los riesgos, beneficios, alternativas y cuidados postoperatorios.'}</p>
      <div style={{ marginTop: '16px' }}>
        <p><b>Firma del paciente:</b> {consent.patientSignature || '—'}</p>
        <p><b>Firma del médico:</b> {consent.doctorSignature || '—'}</p>
        {consent.witnessSignature && <p><b>Firma del testigo:</b> {consent.witnessSignature}</p>}
      </div>
    </div>
  )
}

function ConsentFormDialog({
  type,
  patients,
  onClose,
  onSaved,
}: {
  type: string
  patients: Patient[]
  onClose: () => void
  onSaved: () => void
}) {
  const [patientId, setPatientId] = useState('')
  const [data, setData] = useState<Record<string, string>>({})
  const [patientSignature, setPatientSignature] = useState('')
  const [doctorSignature, setDoctorSignature] = useState('')
  const [witnessSignature, setWitnessSignature] = useState('')
  const [signed, setSigned] = useState(true)
  const [saving, setSaving] = useState(false)

  function setField(key: string, value: string) {
    setData((prev) => ({ ...prev, [key]: value }))
  }

  async function save() {
    if (!patientId) {
      toast.error('Selecciona un paciente')
      return
    }
    if (signed && !patientSignature) {
      toast.error('La firma del paciente es obligatoria para consentimientos firmados')
      return
    }
    setSaving(true)
    try {
      await apiPost('/api/informed-consents', {
        patientId,
        type,
        data,
        patientSignature: signed ? patientSignature : undefined,
        doctorSignature: signed ? doctorSignature : undefined,
        witnessSignature: signed ? witnessSignature : undefined,
        signed,
      })
      toast.success('Consentimiento guardado')
      onSaved()
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  const title = CONSENT_TYPES[type] || 'Consentimiento'

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto thin-scroll">
        <DialogHeader>
          <DialogTitle>Consentimiento informado — {title}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="space-y-1.5">
            <Label>Paciente *</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar paciente" /></SelectTrigger>
              <SelectContent>
                {patients.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Dynamic fields per consent type */}
          {type === 'FIRST_VISIT' && <FirstVisitFields data={data} setField={setField} />}
          {type === 'TREATMENT_PROPOSAL' && <TreatmentProposalFields data={data} setField={setField} />}
          {type === 'SURGICAL' && <SurgicalFields data={data} setField={setField} />}

          {/* Signatures */}
          <div className="p-3 rounded-md border border-border bg-muted/30 space-y-3">
            <p className="text-sm font-semibold">Firmas</p>
            <label className="flex items-center gap-2 text-sm">
              <Checkbox checked={signed} onCheckedChange={() => setSigned((s) => !s)} />
              <span>Marcar como firmado (requiere nombres abajo)</span>
            </label>
            {signed && (
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="space-y-1.5">
                  <Label className="text-xs">Firma del paciente (nombre tecleado) *</Label>
                  <Input value={patientSignature} onChange={(e) => setPatientSignature(e.target.value)} placeholder="Nombre completo del paciente" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Firma del médico</Label>
                  <Input value={doctorSignature} onChange={(e) => setDoctorSignature(e.target.value)} placeholder="Tu nombre" />
                </div>
                <div className="space-y-1.5">
                  <Label className="text-xs">Testigo (opcional)</Label>
                  <Input value={witnessSignature} onChange={(e) => setWitnessSignature(e.target.value)} placeholder="Nombre del testigo" />
                </div>
              </div>
            )}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>
            <Save className="w-4 h-4 mr-2" /> {saving ? 'Guardando…' : 'Guardar consentimiento'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

// Reusable field component
function Field({ label, value, onChange, textarea, placeholder }: { label: string; value: string; onChange: (v: string) => void; textarea?: boolean; placeholder?: string }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      {textarea ? (
        <Textarea value={value} onChange={(e) => onChange(e.target.value)} rows={2} placeholder={placeholder} />
      ) : (
        <Input value={value} onChange={(e) => onChange(e.target.value)} placeholder={placeholder} />
      )}
    </div>
  )
}

function FirstVisitFields({ data, setField }: { data: Record<string, string>; setField: (k: string, v: string) => void }) {
  return (
    <div className="space-y-3">
      <Field label="Motivo de consulta" value={data.reason || ''} onChange={(v) => setField('reason', v)} textarea placeholder="¿Qué le trae a la consulta?" />
      <div className="pt-2 border-t border-border">
        <p className="text-sm font-semibold mb-2">Antecedentes médicos</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Enfermedades crónicas" value={data.chronicConditions || ''} onChange={(v) => setField('chronicConditions', v)} placeholder="Diabetes, hipertensión…" />
        <Field label="Medicamentos actuales" value={data.currentMedications || ''} onChange={(v) => setField('currentMedications', v)} placeholder="Listado de medicamentos" />
        <Field label="Alergias" value={data.allergies || ''} onChange={(v) => setField('allergies', v)} placeholder="Penicilina, latex…" />
        <Field label="Reacción adversa a anestesia" value={data.anesthesiaReaction || ''} onChange={(v) => setField('anesthesiaReaction', v)} placeholder="Sí/No + detalle" />
        <Field label="¿Fumador?" value={data.smoker || ''} onChange={(v) => setField('smoker', v)} placeholder="Sí/No + cuántos al día" />
        <Field label="Consumo de alcohol" value={data.alcohol || ''} onChange={(v) => setField('alcohol', v)} placeholder="Frecuencia" />
        <Field label="Embarazo (si aplica)" value={data.pregnancy || ''} onChange={(v) => setField('pregnancy', v)} placeholder="Semanas / No aplica" />
        <Field label="Antecedentes familiares" value={data.familyHistory || ''} onChange={(v) => setField('familyHistory', v)} placeholder="Relevantes" />
      </div>
      <div className="pt-2 border-t border-border">
        <p className="text-sm font-semibold mb-2">Antecedentes dentales</p>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Última visita al dentista" value={data.lastDentalVisit || ''} onChange={(v) => setField('lastDentalVisit', v)} placeholder="Hace cuánto" />
        <Field label="Higiene bucal" value={data.oralHygiene || ''} onChange={(v) => setField('oralHygiene', v)} placeholder="Frecuencia cepillado + hilo" />
        <Field label="Sangrado de encías" value={data.gumBleeding || ''} onChange={(v) => setField('gumBleeding', v)} placeholder="Sí/No + cuándo" />
      </div>
      <Field label="Texto de autorización (editable)" value={data.authorizationText || ''} onChange={(v) => setField('authorizationText', v)} textarea placeholder="Autorizo al equipo de la clínica a realizar el diagnóstico y tratamiento que considere necesario…" />
    </div>
  )
}

function TreatmentProposalFields({ data, setField }: { data: Record<string, string>; setField: (k: string, v: string) => void }) {
  return (
    <div className="space-y-3">
      <Field label="Diagnóstico" value={data.diagnosis || ''} onChange={(v) => setField('diagnosis', v)} textarea />
      <Field label="Tratamiento propuesto" value={data.proposedTreatment || ''} onChange={(v) => setField('proposedTreatment', v)} textarea placeholder="Detalle del tratamiento" />
      <Field label="Alternativas de tratamiento" value={data.alternatives || ''} onChange={(v) => setField('alternatives', v)} textarea />
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <Field label="Costo estimado (MXN)" value={data.estimatedCost || ''} onChange={(v) => setField('estimatedCost', v)} placeholder="$0.00" />
        <Field label="Número de sesiones" value={data.sessions || ''} onChange={(v) => setField('sessions', v)} placeholder="Ej. 4" />
        <Field label="Duración estimada" value={data.duration || ''} onChange={(v) => setField('duration', v)} placeholder="Ej. 3 meses" />
      </div>
      <Field label="Riesgos" value={data.risks || ''} onChange={(v) => setField('risks', v)} textarea />
      <Field label="Beneficios" value={data.benefits || ''} onChange={(v) => setField('benefits', v)} textarea />
      <Field label="Texto de autorización (editable)" value={data.authorizationText || ''} onChange={(v) => setField('authorizationText', v)} textarea />
    </div>
  )
}

function SurgicalFields({ data, setField }: { data: Record<string, string>; setField: (k: string, v: string) => void }) {
  return (
    <div className="space-y-3">
      <Field label="Procedimiento quirúrgico" value={data.procedure || ''} onChange={(v) => setField('procedure', v)} placeholder="Ej. Extracción de cordal" />
      <Field label="Descripción detallada" value={data.description || ''} onChange={(v) => setField('description', v)} textarea />
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <Field label="Anestesia a utilizar" value={data.anesthesia || ''} onChange={(v) => setField('anesthesia', v)} placeholder="Local/Regional/General + tipo" />
        <Field label="Medicación postoperatoria" value={data.postMedication || ''} onChange={(v) => setField('postMedication', v)} placeholder="Antibiótico, analgésico…" />
      </div>
      <Field label="Cuidados postoperatorios" value={data.postCare || ''} onChange={(v) => setField('postCare', v)} textarea />
      <Field label="Riesgos y complicaciones" value={data.risks || ''} onChange={(v) => setField('risks', v)} textarea />
      <Field label="Alternativas al procedimiento" value={data.alternatives || ''} onChange={(v) => setField('alternatives', v)} textarea />
      <Field label="Texto de autorización (editable)" value={data.authorizationText || ''} onChange={(v) => setField('authorizationText', v)} textarea />
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useStore } from '@/store/app-store'
import { useApi } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { ArrowLeft, Edit2, Phone, Mail, MapPin, Calendar } from 'lucide-react'
import { calcAge, formatDate, formatDateTime, STATUS_LABELS, STATUS_COLORS, CONCEPT_LABELS, METHOD_LABELS, formatCurrency } from '@/lib/format'
import { PatientFormDialog } from './patient-list'
import { useQueryClient } from '@tanstack/react-query'
import { PrintLayout } from '@/components/print/print-layout'
import { useStore as useAppStore } from '@/store/app-store'
import { Odontogram } from '@/components/dental/odontogram'
import { DentalRecordForm } from '@/components/dental/dental-record-form'
import { MedicalRecordForm } from '@/components/medical/medical-record-form'
import { EvolutionNoteForm } from '@/components/notes/evolution-note-form'
import { PrescriptionForm } from '@/components/prescriptions/prescription-form'
import { toast } from 'sonner'

type PatientDetail = {
  id: string
  firstName: string
  lastName: string
  birthDate: string
  gender: string
  phone: string
  email: string | null
  address: string | null
  bloodType: string | null
  allergies: string | null
  emergencyContact: string | null
  appointments: any[]
  medicalRecords: any[]
  dentalRecords: any[]
  evolutionNotes: any[]
  prescriptions: any[]
  payments: any[]
  extraCharges: any[]
}

export function PatientDetail() {
  const { selectedPatientId, setView, user } = useStore()
  const [editing, setEditing] = useState(false)
  const [activeTab, setActiveTab] = useState('general')
  const qc = useQueryClient()

  const { data: patient, isLoading } = useApi<PatientDetail>(
    ['patient', selectedPatientId],
    `/api/patients/${selectedPatientId}`,
  )

  if (isLoading) return <div className="p-6 text-muted-foreground">Cargando paciente…</div>
  if (!patient) return <div className="p-6">Paciente no encontrado</div>

  const isDoctor = user?.role === 'DENTAL_DOCTOR' || user?.role === 'GENERAL_DOCTOR' || user?.role === 'SPECIALIST_DOCTOR'
  const isDental = user?.role === 'DENTAL_DOCTOR'
  const isReceptionOrAdmin = user?.role === 'RECEPTION' || user?.role === 'ADMIN'

  // Combine all records into a timeline
  const timeline: Array<{ date: string; type: string; title: string; doctor: string; data: any }> = []
  for (const r of patient.medicalRecords) {
    timeline.push({
      date: r.date,
      type: 'Médico',
      title: r.chiefComplaint,
      doctor: r.doctor?.doctorProfile?.fullName || r.doctor?.email,
      data: r,
    })
  }
  for (const r of patient.dentalRecords) {
    timeline.push({
      date: r.date,
      type: 'Dental',
      title: r.chiefComplaint,
      doctor: r.doctor?.doctorProfile?.fullName || r.doctor?.email,
      data: r,
    })
  }
  timeline.sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

  return (
    <div className="p-6 space-y-4">
      <div className="flex items-center gap-3">
        <Button variant="ghost" size="sm" onClick={() => setView('patients')}>
          <ArrowLeft className="w-4 h-4 mr-1" /> Pacientes
        </Button>
        {isReceptionOrAdmin && (
          <Button variant="outline" size="sm" onClick={() => setEditing(true)}>
            <Edit2 className="w-4 h-4 mr-1" /> Editar
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-4">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <h1 className="text-2xl font-bold">{patient.firstName} {patient.lastName}</h1>
              <div className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground mt-1">
                <span>{calcAge(patient.birthDate)} · {patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : 'Otro'}</span>
                <span className="flex items-center gap-1"><Phone className="w-3.5 h-3.5" /> {patient.phone}</span>
                {patient.email && <span className="flex items-center gap-1"><Mail className="w-3.5 h-3.5" /> {patient.email}</span>}
                {patient.address && <span className="flex items-center gap-1"><MapPin className="w-3.5 h-3.5" /> {patient.address}</span>}
              </div>
              {(patient.bloodType || patient.allergies || patient.emergencyContact) && (
                <div className="flex flex-wrap gap-2 mt-2 text-xs">
                  {patient.bloodType && <Badge variant="outline">Sangre: {patient.bloodType}</Badge>}
                  {patient.allergies && <Badge variant="destructive">Alergias: {patient.allergies}</Badge>}
                  {patient.emergencyContact && <Badge variant="secondary">Emergencia: {patient.emergencyContact}</Badge>}
                </div>
              )}
            </div>
          </div>
        </CardContent>
      </Card>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="flex flex-wrap h-auto">
          <TabsTrigger value="general">Datos</TabsTrigger>
          <TabsTrigger value="timeline">Historial ({timeline.length})</TabsTrigger>
          <TabsTrigger value="notes">Notas evolución ({patient.evolutionNotes.length})</TabsTrigger>
          <TabsTrigger value="prescriptions">Recetas ({patient.prescriptions.length})</TabsTrigger>
          {isDental && <TabsTrigger value="odontograma">Odontograma</TabsTrigger>}
          {isReceptionOrAdmin && <TabsTrigger value="payments">Pagos ({patient.payments.length})</TabsTrigger>}
        </TabsList>

        <TabsContent value="general" className="mt-3">
          <Card>
            <CardHeader><CardTitle className="text-base">Datos del paciente</CardTitle></CardHeader>
            <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
              <Info label="Fecha de nacimiento" value={formatDate(patient.birthDate)} />
              <Info label="Edad" value={calcAge(patient.birthDate)} />
              <Info label="Género" value={patient.gender === 'M' ? 'Masculino' : patient.gender === 'F' ? 'Femenino' : 'Otro'} />
              <Info label="Tipo de sangre" value={patient.bloodType || '—'} />
              <Info label="Alergias" value={patient.allergies || '—'} />
              <Info label="Contacto de emergencia" value={patient.emergencyContact || '—'} />
              <Info label="Dirección" value={patient.address || '—'} />
              <Info label="Correo" value={patient.email || '—'} />
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="timeline" className="mt-3 space-y-3">
          {isDoctor && (
            <div className="flex gap-2 flex-wrap">
              {isDental && <Button size="sm" onClick={() => setActiveTab('new-dental')}><Calendar className="w-4 h-4 mr-1" /> Nuevo expediente dental</Button>}
              {(user?.role === 'GENERAL_DOCTOR' || user?.role === 'SPECIALIST_DOCTOR') && (
                <Button size="sm" onClick={() => setActiveTab('new-medical')}><Calendar className="w-4 h-4 mr-1" /> Nuevo expediente clínico</Button>
              )}
              <Button size="sm" variant="outline" onClick={() => setActiveTab('new-note')}>Nota de evolución</Button>
              <Button size="sm" variant="outline" onClick={() => setActiveTab('new-prescription')}>Receta</Button>
            </div>
          )}
          {timeline.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">Sin consultas registradas</CardContent></Card>
          ) : (
            timeline.map((t, i) => (
              <Card key={i}>
                <CardContent className="p-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <div className="flex items-center gap-2">
                        <Badge variant={t.type === 'Dental' ? 'secondary' : 'default'}>{t.type}</Badge>
                        <span className="text-sm font-medium">{t.title}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {formatDateTime(t.date)} · {t.doctor}
                      </p>
                    </div>
                    <PrintLayout
                      title={t.type === 'Dental' ? 'Expediente Dental' : 'Expediente Clínico'}
                      patient={patient}
                      doctorName={t.doctor}
                    >
                      <div className="space-y-2 text-sm">
                        <div><b>Motivo de consulta:</b> {t.data.chiefComplaint}</div>
                        {t.data.currentIllness && <div><b>Estado actual:</b> {t.data.currentIllness}</div>}
                        {t.data.dentalExam && <div><b>Exploración:</b> {t.data.dentalExam}</div>}
                        {t.data.physicalExam && <div><b>Exploración física:</b> {t.data.physicalExam}</div>}
                        {t.data.vitalSigns && <div><b>Signos vitales:</b> <VitalSigns data={t.data.vitalSigns} /></div>}
                        <div><b>Diagnóstico:</b> {t.data.diagnosis}</div>
                        <div><b>Plan de tratamiento:</b> {t.data.treatmentPlan}</div>
                        {t.data.prognosis && <div><b>Pronóstico:</b> {t.data.prognosis}</div>}
                        {t.data.interconsultations && <div><b>Interconsultas:</b> {t.data.interconsultations}</div>}
                      </div>
                    </PrintLayout>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="notes" className="mt-3 space-y-3">
          {isDoctor && (
            <Button size="sm" onClick={() => setActiveTab('new-note')}><Calendar className="w-4 h-4 mr-1" /> Nueva nota de evolución</Button>
          )}
          {patient.evolutionNotes.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">Sin notas de evolución</CardContent></Card>
          ) : (
            patient.evolutionNotes.map((n: any) => (
              <Card key={n.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">{formatDateTime(n.date)} · {n.doctor?.doctorProfile?.fullName || n.doctor?.email}</p>
                      <p className="text-sm mt-1 whitespace-pre-wrap">{n.note}</p>
                      {n.vitalSigns && <div className="text-xs mt-2"><VitalSigns data={n.vitalSigns} /></div>}
                      {n.treatment && <p className="text-xs mt-1"><b>Tratamiento:</b> {n.treatment}</p>}
                      {n.nextAppointment && <p className="text-xs mt-1"><b>Próxima cita:</b> {formatDate(n.nextAppointment)}</p>}
                    </div>
                    <PrintLayout title="Nota de Evolución" patient={patient} doctorName={n.doctor?.doctorProfile?.fullName || ''}>
                      <div className="space-y-2 text-sm">
                        <div><b>Fecha:</b> {formatDateTime(n.date)}</div>
                        {n.vitalSigns && <div><b>Signos vitales:</b> <VitalSigns data={n.vitalSigns} /></div>}
                        <div><b>Nota:</b> <span className="whitespace-pre-wrap">{n.note}</span></div>
                        {n.currentStatus && <div><b>Estado actual:</b> {n.currentStatus}</div>}
                        {n.treatment && <div><b>Tratamiento:</b> {n.treatment}</div>}
                        {n.nextAppointment && <div><b>Próxima cita:</b> {formatDate(n.nextAppointment)}</div>}
                      </div>
                    </PrintLayout>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        <TabsContent value="prescriptions" className="mt-3 space-y-3">
          {isDoctor && (
            <Button size="sm" onClick={() => setActiveTab('new-prescription')}><Calendar className="w-4 h-4 mr-1" /> Nueva receta</Button>
          )}
          {patient.prescriptions.length === 0 ? (
            <Card><CardContent className="p-6 text-center text-muted-foreground">Sin recetas</CardContent></Card>
          ) : (
            patient.prescriptions.map((p: any) => (
              <Card key={p.id}>
                <CardContent className="p-4">
                  <div className="flex items-start justify-between gap-2">
                    <div className="flex-1">
                      <p className="text-xs text-muted-foreground">{formatDateTime(p.date)} · {p.doctor?.doctorProfile?.fullName || p.doctor?.email}</p>
                      <p className="text-sm font-medium mt-1">Diagnóstico: {p.diagnosis}</p>
                      <ul className="mt-2 space-y-1 text-sm">
                        {p.items.map((it: any) => (
                          <li key={it.id} className="border-l-2 border-teal-500 pl-2">
                            <div className="font-medium">{it.medicationName}</div>
                            <div className="text-xs text-muted-foreground">
                              {it.dose} · {it.frequency} · {it.route}{it.duration ? ` · ${it.duration}` : ''}
                            </div>
                            {it.notes && <div className="text-xs italic">{it.notes}</div>}
                          </li>
                        ))}
                      </ul>
                      {p.indications && <p className="text-xs mt-2"><b>Indicaciones:</b> {p.indications}</p>}
                    </div>
                    <PrintLayout title="Receta Médica" patient={patient} doctorName={p.doctor?.doctorProfile?.fullName || ''} doctorLicense={p.doctor?.doctorProfile?.professionalLicense} doctorCareer={p.doctor?.doctorProfile?.career}>
                      <div className="space-y-3 text-sm">
                        <div><b>Diagnóstico:</b> {p.diagnosis}</div>
                        <table className="w-full border-collapse">
                          <thead>
                            <tr className="border-b border-black">
                              <th className="text-left py-1">Medicamento</th>
                              <th className="text-left py-1">Dosis</th>
                              <th className="text-left py-1">Frecuencia</th>
                              <th className="text-left py-1">Vía</th>
                            </tr>
                          </thead>
                          <tbody>
                            {p.items.map((it: any) => (
                              <tr key={it.id} className="border-b border-black/20">
                                <td className="py-1">{it.medicationName}</td>
                                <td className="py-1">{it.dose}</td>
                                <td className="py-1">{it.frequency}</td>
                                <td className="py-1">{it.route}</td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                        {p.indications && <div><b>Indicaciones:</b> {p.indications}</div>}
                      </div>
                    </PrintLayout>
                  </div>
                </CardContent>
              </Card>
            ))
          )}
        </TabsContent>

        {isDental && (
          <TabsContent value="odontograma" className="mt-3">
            <Odontogram patientId={patient.id} />
          </TabsContent>
        )}

        {isReceptionOrAdmin && (
          <TabsContent value="payments" className="mt-3 space-y-3">
            {patient.payments.length === 0 ? (
              <Card><CardContent className="p-6 text-center text-muted-foreground">Sin pagos</CardContent></Card>
            ) : (
              patient.payments.map((p: any) => (
                <Card key={p.id}>
                  <CardContent className="p-4">
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div>
                        <p className="text-xs text-muted-foreground">{formatDateTime(p.date)}</p>
                        <p className="font-bold text-lg">{formatCurrency(p.totalAmount)}</p>
                        <Badge className={STATUS_COLORS[p.status]}>{STATUS_LABELS[p.status]}</Badge>
                      </div>
                      <div className="text-sm">
                        <p className="font-medium text-xs mb-1">Conceptos:</p>
                        <ul className="text-xs space-y-0.5">
                          {p.items.map((it: any) => (
                            <li key={it.id}>· {CONCEPT_LABELS[it.concept] || it.concept}: {it.description} — {formatCurrency(it.amount)}</li>
                          ))}
                        </ul>
                        <p className="font-medium text-xs mt-2 mb-1">Métodos:</p>
                        <ul className="text-xs space-y-0.5">
                          {p.methods.map((m: any) => (
                            <li key={m.id}>· {METHOD_LABELS[m.method] || m.method}: {formatCurrency(m.amount)}{m.reference ? ` (ref: ${m.reference})` : ''}</li>
                          ))}
                        </ul>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </TabsContent>
        )}

        {/* Conditional new-record tabs */}
        {activeTab === 'new-medical' && user?.role !== 'DENTAL_DOCTOR' && (
          <TabsContent value="new-medical" className="mt-3">
            <MedicalRecordForm patientId={patient.id} onDone={() => { setActiveTab('timeline'); qc.invalidateQueries({ queryKey: ['patient', patient.id] }) }} onCancel={() => setActiveTab('timeline')} />
          </TabsContent>
        )}
        {activeTab === 'new-dental' && isDental && (
          <TabsContent value="new-dental" className="mt-3">
            <DentalRecordForm patientId={patient.id} onDone={() => { setActiveTab('timeline'); qc.invalidateQueries({ queryKey: ['patient', patient.id] }) }} onCancel={() => setActiveTab('timeline')} />
          </TabsContent>
        )}
        {activeTab === 'new-note' && (
          <TabsContent value="new-note" className="mt-3">
            <EvolutionNoteForm patientId={patient.id} onDone={() => { setActiveTab('notes'); qc.invalidateQueries({ queryKey: ['patient', patient.id] }) }} onCancel={() => setActiveTab('notes')} />
          </TabsContent>
        )}
        {activeTab === 'new-prescription' && (
          <TabsContent value="new-prescription" className="mt-3">
            <PrescriptionForm patientId={patient.id} onDone={() => { setActiveTab('prescriptions'); qc.invalidateQueries({ queryKey: ['patient', patient.id] }) }} onCancel={() => setActiveTab('prescriptions')} />
          </TabsContent>
        )}
      </Tabs>

      {editing && (
        <PatientFormDialog
          initial={patient}
          onClose={() => setEditing(false)}
          onSaved={() => {
            setEditing(false)
            qc.invalidateQueries({ queryKey: ['patient', patient.id] })
            toast.success('Paciente actualizado')
          }}
        />
      )}
    </div>
  )
}

function Info({ label, value }: { label: string; value: string }) {
  return (
    <div>
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className="font-medium">{value}</p>
    </div>
  )
}

function VitalSigns({ data }: { data: string }) {
  let vs: any = {}
  try { vs = typeof data === 'string' ? JSON.parse(data) : data } catch { return null }
  const parts: string[] = []
  if (vs.bp) parts.push(`TA: ${vs.bp}`)
  if (vs.hr) parts.push(`FC: ${vs.hr}`)
  if (vs.rr) parts.push(`FR: ${vs.rr}`)
  if (vs.temp) parts.push(`Temp: ${vs.temp}°C`)
  if (vs.weight) parts.push(`Peso: ${vs.weight}kg`)
  if (vs.height) parts.push(`Talla: ${vs.height}cm`)
  if (vs.spo2) parts.push(`SpO₂: ${vs.spo2}%`)
  return <span>{parts.join(' · ')}</span>
}

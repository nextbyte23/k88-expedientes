'use client'

import { useState } from 'react'
import { useStore } from '@/store/app-store'
import { useApi, apiPost, apiPut, apiDelete } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Calendar } from 'lucide-react'
import { formatDateTime, formatTime, STATUS_LABELS, STATUS_COLORS, toLocalDatetimeInputValue } from '@/lib/format'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

type Doctor = {
  id: string
  email: string
  role: string
  doctorProfile?: { fullName: string; specialty: string | null } | null
}

type Patient = { id: string; firstName: string; lastName: string }

type Appointment = {
  id: string
  dateTime: string
  status: string
  reason: string
  notes: string | null
  patient: Patient
  doctor: Doctor
}

export function AppointmentList() {
  const { user } = useStore()
  const [filterDate, setFilterDate] = useState('')
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()

  const { data: doctors } = useApi<Doctor[]>(['doctors'], '/api/doctors')
  const { data: patients } = useApi<Patient[]>(['patients-all'], '/api/patients')
  const dateParam = filterDate || new Date().toISOString().split('T')[0]
  const { data: appts, isLoading } = useApi<Appointment[]>(
    ['appointments', dateParam],
    `/api/appointments?date=${dateParam}`,
  )

  const doctorOptions = (doctors || [])

  async function changeStatus(appt: Appointment, status: string) {
    try {
      await apiPut(`/api/appointments/${appt.id}`, { status })
      qc.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Estado actualizado')
    } catch (e: any) {
      toast.error(e.message || 'Error al actualizar')
    }
  }

  async function removeAppt(id: string) {
    if (!confirm('¿Eliminar esta cita?')) return
    try {
      await apiDelete(`/api/appointments/${id}`)
      qc.invalidateQueries({ queryKey: ['appointments'] })
      toast.success('Cita eliminada')
    } catch (e: any) {
      toast.error(e.message || 'Error al eliminar')
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Citas</h1>
          <p className="text-sm text-muted-foreground">
            {user?.role === 'RECEPTION' || user?.role === 'ADMIN' ? 'Agenda general' : 'Tu agenda'}
          </p>
        </div>
        {(user?.role === 'RECEPTION' || user?.role === 'ADMIN') && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nueva cita
          </Button>
        )}
      </div>

      <div className="flex items-center gap-2">
        <Calendar className="w-4 h-4 text-muted-foreground" />
        <Input type="date" value={filterDate} onChange={(e) => setFilterDate(e.target.value)} className="max-w-[200px]" />
        {!filterDate && <span className="text-xs text-muted-foreground">Mostrando hoy</span>}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center text-muted-foreground">Cargando…</p>
          ) : appts && appts.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Hora</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="hidden md:table-cell">Médico</TableHead>
                  <TableHead className="hidden lg:table-cell">Motivo</TableHead>
                  <TableHead>Estado</TableHead>
                  {(user?.role === 'RECEPTION' || user?.role === 'ADMIN') && <TableHead className="text-right">Acciones</TableHead>}
                </TableRow>
              </TableHeader>
              <TableBody>
                {appts.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-xs font-mono">{formatTime(a.dateTime)}</TableCell>
                    <TableCell className="font-medium">{a.patient.firstName} {a.patient.lastName}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">
                      {a.doctor?.doctorProfile?.fullName || a.doctor?.email}
                      <div className="text-[10px] text-muted-foreground">
                        {a.doctor?.doctorProfile?.specialty || ''}
                      </div>
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{a.reason}</TableCell>
                    <TableCell>
                      {(user?.role === 'RECEPTION' || user?.role === 'ADMIN' || a.doctor.id === user?.id) ? (
                        <Select value={a.status} onValueChange={(v) => changeStatus(a, v)}>
                          <SelectTrigger className="h-7 w-32 text-xs">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            {Object.entries(STATUS_LABELS).filter(([k]) => ['SCHEDULED', 'IN_PROGRESS', 'COMPLETED', 'CANCELLED', 'NO_SHOW'].includes(k)).map(([k, v]) => (
                              <SelectItem key={k} value={k}>{v}</SelectItem>
                            ))}
                          </SelectContent>
                        </Select>
                      ) : (
                        <Badge className={STATUS_COLORS[a.status]}>{STATUS_LABELS[a.status]}</Badge>
                      )}
                    </TableCell>
                    {(user?.role === 'RECEPTION' || user?.role === 'ADMIN') && (
                      <TableCell className="text-right">
                        <Button size="icon" variant="ghost" className="text-rose-600" onClick={() => removeAppt(a.id)}>
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </TableCell>
                    )}
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-8 text-center text-muted-foreground">No hay citas para esta fecha</p>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <AppointmentForm
          doctors={doctorOptions}
          patients={patients || []}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            qc.invalidateQueries({ queryKey: ['appointments'] })
          }}
        />
      )}
    </div>
  )
}

function AppointmentForm({ doctors, patients, onClose, onSaved }: { doctors: Doctor[]; patients: Patient[]; onClose: () => void; onSaved: () => void }) {
  const [patientId, setPatientId] = useState('')
  const [doctorId, setDoctorId] = useState('')
  const [dateTime, setDateTime] = useState(toLocalDatetimeInputValue(new Date()))
  const [reason, setReason] = useState('')
  const [notes, setNotes] = useState('')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!patientId || !doctorId || !dateTime || !reason) {
      toast.error('Paciente, médico, fecha y motivo son obligatorios')
      return
    }
    setSaving(true)
    try {
      await apiPost('/api/appointments', {
        patientId,
        doctorId,
        dateTime: new Date(dateTime).toISOString(),
        reason,
        notes: notes || undefined,
      })
      toast.success('Cita agendada')
      onSaved()
    } catch (e: any) {
      toast.error(e.message || 'Error al agendar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nueva cita</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
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
          <div className="space-y-1.5">
            <Label>Médico *</Label>
            <Select value={doctorId} onValueChange={setDoctorId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar médico" /></SelectTrigger>
              <SelectContent>
                {doctors.map((d) => (
                  <SelectItem key={d.id} value={d.id}>
                    {d.doctorProfile?.fullName || d.email} — {d.doctorProfile?.specialty || ''}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Fecha y hora *</Label>
            <Input type="datetime-local" value={dateTime} onChange={(e) => setDateTime(e.target.value)} />
          </div>
          <div className="space-y-1.5">
            <Label>Motivo *</Label>
            <Input value={reason} onChange={(e) => setReason(e.target.value)} placeholder="Motivo de la consulta" />
          </div>
          <div className="space-y-1.5">
            <Label>Notas</Label>
            <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Notas adicionales" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Agendar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

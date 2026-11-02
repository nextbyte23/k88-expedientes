'use client'

import { useState } from 'react'
import { useStore } from '@/store/app-store'
import { useApi, apiPost, apiPut } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Search, UserPlus } from 'lucide-react'
import { calcAge } from '@/lib/format'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

export type Patient = {
  id: string
  firstName: string
  lastName: string
  birthDate: string
  gender: string
  phone: string
  email: string | null
  address: string | null
  bloodType?: string | null
  allergies?: string | null
  emergencyContact?: string | null
}

export function PatientList() {
  const { selectPatient } = useStore()
  const [search, setSearch] = useState('')
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()
  const { data: patients, isLoading } = useApi<Patient[]>(
    ['patients', search],
    `/api/patients?search=${encodeURIComponent(search)}`,
  )

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pacientes</h1>
          <p className="text-sm text-muted-foreground">Registro de pacientes</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <UserPlus className="w-4 h-4 mr-2" /> Nuevo paciente
        </Button>
      </div>

      <div className="relative max-w-md">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
        <Input
          placeholder="Buscar por nombre, teléfono o correo…"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-9"
        />
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center text-muted-foreground">Cargando…</p>
          ) : patients && patients.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead className="hidden sm:table-cell">Edad</TableHead>
                  <TableHead className="hidden md:table-cell">Teléfono</TableHead>
                  <TableHead className="hidden lg:table-cell">Correo</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {patients.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div className="font-medium">{p.firstName} {p.lastName}</div>
                      <div className="text-xs text-muted-foreground sm:hidden">{calcAge(p.birthDate)}</div>
                    </TableCell>
                    <TableCell className="hidden sm:table-cell">{calcAge(p.birthDate)}</TableCell>
                    <TableCell className="hidden md:table-cell">{p.phone}</TableCell>
                    <TableCell className="hidden lg:table-cell">{p.email || '—'}</TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => selectPatient(p.id)}>
                        Ver expediente
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-8 text-center text-muted-foreground">No hay pacientes registrados</p>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <PatientFormDialog
          onClose={() => setShowForm(false)}
          onSaved={(p) => {
            qc.invalidateQueries({ queryKey: ['patients'] })
            setShowForm(false)
            selectPatient(p.id)
          }}
        />
      )}
    </div>
  )
}

export function PatientFormDialog({
  initial,
  onClose,
  onSaved,
}: {
  initial?: Patient
  onClose: () => void
  onSaved: (p: Patient) => void
}) {
  const isEdit = !!initial
  const [form, setForm] = useState({
    firstName: initial?.firstName || '',
    lastName: initial?.lastName || '',
    birthDate: initial?.birthDate ? initial.birthDate.split('T')[0] : '',
    gender: initial?.gender || 'M',
    phone: initial?.phone || '',
    email: initial?.email || '',
    address: initial?.address || '',
    bloodType: initial?.bloodType || '',
    allergies: initial?.allergies || '',
    emergencyContact: initial?.emergencyContact || '',
  })
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.firstName || !form.lastName || !form.birthDate || !form.phone) {
      toast.error('Nombre, apellidos, fecha de nacimiento y teléfono son obligatorios')
      return
    }
    setSaving(true)
    try {
      const url = isEdit ? `/api/patients/${initial!.id}` : '/api/patients'
      const fn = isEdit ? apiPut : apiPost
      const saved = await fn<Patient>(url, form)
      onSaved(saved)
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto thin-scroll">
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar paciente' : 'Nuevo paciente'}</DialogTitle>
        </DialogHeader>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          <Field label="Nombre(s) *" value={form.firstName} onChange={(v) => setForm({ ...form, firstName: v })} />
          <Field label="Apellido(s) *" value={form.lastName} onChange={(v) => setForm({ ...form, lastName: v })} />
          <div className="space-y-1.5">
            <Label>Fecha de nacimiento *</Label>
            <Input type="date" value={form.birthDate} onChange={(e) => setForm({ ...form, birthDate: e.target.value })} />
          </div>
          <div className="space-y-1.5">
            <Label>Género *</Label>
            <Select value={form.gender} onValueChange={(v) => setForm({ ...form, gender: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="M">Masculino</SelectItem>
                <SelectItem value="F">Femenino</SelectItem>
                <SelectItem value="OTHER">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <Field label="Teléfono *" value={form.phone} onChange={(v) => setForm({ ...form, phone: v })} />
          <Field label="Correo" value={form.email} onChange={(v) => setForm({ ...form, email: v })} />
          <Field label="Dirección" value={form.address} onChange={(v) => setForm({ ...form, address: v })} />
          <Field label="Tipo de sangre" value={form.bloodType} onChange={(v) => setForm({ ...form, bloodType: v })} />
          <Field label="Alergias" value={form.allergies} onChange={(v) => setForm({ ...form, allergies: v })} />
          <Field label="Contacto de emergencia" value={form.emergencyContact} onChange={(v) => setForm({ ...form, emergencyContact: v })} />
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (v: string) => void }) {
  return (
    <div className="space-y-1.5">
      <Label>{label}</Label>
      <Input value={value} onChange={(e) => onChange(e.target.value)} />
    </div>
  )
}

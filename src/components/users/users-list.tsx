'use client'

import { useState } from 'react'
import { useApi, apiPost, apiPut } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, UserCog } from 'lucide-react'
import { ROLE_LABELS } from '@/lib/roles'
import { formatDate } from '@/lib/format'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

type DoctorProfile = {
  id: string
  fullName: string
  career: string
  specialty: string | null
  professionalLicense: string
}

type User = {
  id: string
  email: string
  role: string
  active: boolean
  createdAt: string
  doctorProfile?: DoctorProfile | null
}

const ROLES = [
  { value: 'ADMIN', label: 'Administrador' },
  { value: 'RECEPTION', label: 'Recepción' },
  { value: 'DENTAL_DOCTOR', label: 'Odontólogo' },
  { value: 'GENERAL_DOCTOR', label: 'Médico General' },
  { value: 'SPECIALIST_DOCTOR', label: 'Especialista' },
  { value: 'COORDINATOR', label: 'Coordinador Médico' },
]

export function UsersList() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<User | null>(null)
  const qc = useQueryClient()
  const { data: users, isLoading } = useApi<User[]>(['users'], '/api/users')

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Usuarios</h1>
          <p className="text-sm text-muted-foreground">Gestión de usuarios y permisos</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo usuario
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center text-muted-foreground">Cargando…</p>
          ) : users && users.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Correo</TableHead>
                  <TableHead>Rol</TableHead>
                  <TableHead className="hidden md:table-cell">Nombre médico</TableHead>
                  <TableHead className="hidden lg:table-cell">Especialidad</TableHead>
                  <TableHead className="hidden lg:table-cell">Cédula</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acción</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="text-xs">{u.email}</TableCell>
                    <TableCell><Badge variant="outline">{ROLE_LABELS[u.role as keyof typeof ROLE_LABELS] || u.role}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{u.doctorProfile?.fullName || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{u.doctorProfile?.specialty || '—'}</TableCell>
                    <TableCell className="hidden lg:table-cell text-xs">{u.doctorProfile?.professionalLicense || '—'}</TableCell>
                    <TableCell>
                      <Badge className={u.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'}>
                        {u.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(u); setShowForm(true) }}>
                        <UserCog className="w-3.5 h-3.5 mr-1" /> Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-8 text-center text-muted-foreground">Sin usuarios</p>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <UserForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => {
            setShowForm(false)
            setEditing(null)
            qc.invalidateQueries({ queryKey: ['users'] })
          }}
        />
      )}
    </div>
  )
}

function UserForm({ initial, onClose, onSaved }: { initial: User | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!initial
  const [email, setEmail] = useState(initial?.email || '')
  const [password, setPassword] = useState('')
  const [role, setRole] = useState(initial?.role || 'RECEPTION')
  const [active, setActive] = useState(initial?.active ?? true)
  const [fullName, setFullName] = useState(initial?.doctorProfile?.fullName || '')
  const [career, setCareer] = useState(initial?.doctorProfile?.career || '')
  const [specialty, setSpecialty] = useState(initial?.doctorProfile?.specialty || '')
  const [professionalLicense, setProfessionalLicense] = useState(initial?.doctorProfile?.professionalLicense || '')
  const [saving, setSaving] = useState(false)

  const isDoctor = role === 'DENTAL_DOCTOR' || role === 'GENERAL_DOCTOR' || role === 'SPECIALIST_DOCTOR'

  async function save() {
    if (!email || (!isEdit && !password)) {
      toast.error('Correo y contraseña son obligatorios')
      return
    }
    if (isDoctor && !fullName) {
      toast.error('El nombre del médico es obligatorio para roles de doctor')
      return
    }
    setSaving(true)
    try {
      const body: any = {
        email,
        role,
        active,
        fullName,
        career,
        specialty: specialty || undefined,
        professionalLicense,
      }
      if (password) body.password = password
      if (isEdit) {
        await apiPut(`/api/users/${initial!.id}`, body)
      } else {
        await apiPost('/api/users', body)
      }
      toast.success(isEdit ? 'Usuario actualizado' : 'Usuario creado')
      onSaved()
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
          <DialogTitle>{isEdit ? 'Editar usuario' : 'Nuevo usuario'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Correo *</Label>
              <Input value={email} onChange={(e) => setEmail(e.target.value)} />
            </div>
            <div className="space-y-1.5">
              <Label>{isEdit ? 'Nueva contraseña (dejar vacío para no cambiar)' : 'Contraseña *'}</Label>
              <Input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Rol *</Label>
              <Select value={role} onValueChange={setRole}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {ROLES.map((r) => <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Estado</Label>
              <Select value={active ? 'true' : 'false'} onValueChange={(v) => setActive(v === 'true')}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="true">Activo</SelectItem>
                  <SelectItem value="false">Inactivo</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isDoctor && (
            <div className="p-3 rounded-md border border-border bg-muted/30 space-y-3">
              <p className="text-sm font-semibold">Datos del médico</p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Nombre completo *</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr. / Dra. Nombre Apellido" />
                </div>
                <div className="space-y-1.5">
                  <Label>Carrera *</Label>
                  <Input value={career} onChange={(e) => setCareer(e.target.value)} placeholder="Médico Cirujano / Cirujano Dentista" />
                </div>
                <div className="space-y-1.5">
                  <Label>Especialidad</Label>
                  <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Cardiología, etc." />
                </div>
                <div className="space-y-1.5">
                  <Label>Cédula profesional *</Label>
                  <Input value={professionalLicense} onChange={(e) => setProfessionalLicense(e.target.value)} placeholder="12345678" />
                </div>
              </div>
            </div>
          )}
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

'use client'

import { useState } from 'react'
import { useStore } from '@/store/app-store'
import { useApi, apiPost } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, PackagePlus } from 'lucide-react'
import { formatCurrency, formatDateTime, STATUS_LABELS, STATUS_COLORS } from '@/lib/format'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

type Patient = { id: string; firstName: string; lastName: string }
type ExtraCharge = {
  id: string
  concept: string
  description: string | null
  amount: number
  status: string
  createdAt: string
  patient: { id: string; firstName: string; lastName: string }
  doctor: { doctorProfile?: { fullName: string } | null; email: string }
}

const CONCEPTS = ['CONSULTATION', 'TREATMENT', 'MEDICATION', 'STUDY', 'OTHER']

export function ExtraChargeList() {
  const { user } = useStore()
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()

  const isDoctor = user?.role === 'DENTAL_DOCTOR' || user?.role === 'GENERAL_DOCTOR' || user?.role === 'SPECIALIST_DOCTOR'
  const isReception = user?.role === 'RECEPTION' || user?.role === 'ADMIN'

  const { data: charges, isLoading } = useApi<ExtraCharge[]>(
    ['extra-charges', user?.id, isReception ? 'PENDING' : ''],
    isReception ? '/api/extra-charges?status=PENDING' : '/api/extra-charges',
  )

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Cargos extra</h1>
          <CardDescription>
            {isDoctor ? 'Cargos que agregas para que recepción los cobre' : 'Cargos pendientes por cobrar a pacientes'}
          </CardDescription>
        </div>
        {isDoctor && (
          <Button onClick={() => setShowForm(true)}>
            <Plus className="w-4 h-4 mr-2" /> Nuevo cargo
          </Button>
        )}
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center text-muted-foreground">Cargando…</p>
          ) : charges && charges.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="hidden md:table-cell">Médico</TableHead>
                  <TableHead>Concepto</TableHead>
                  <TableHead className="hidden sm:table-cell">Descripción</TableHead>
                  <TableHead>Monto</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {charges.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs">{formatDateTime(c.createdAt)}</TableCell>
                    <TableCell className="font-medium">{c.patient.firstName} {c.patient.lastName}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{c.doctor?.doctorProfile?.fullName || c.doctor?.email}</TableCell>
                    <TableCell className="text-xs">{c.concept}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{c.description || '—'}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(c.amount)}</TableCell>
                    <TableCell><Badge className={STATUS_COLORS[c.status]}>{STATUS_LABELS[c.status]}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <PackagePlus className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>No hay cargos {isReception ? 'pendientes' : 'registrados'}</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <ExtraChargeForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ['extra-charges'] }) }} />
      )}
    </div>
  )
}

function ExtraChargeForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [patientId, setPatientId] = useState('')
  const [concept, setConcept] = useState('TRATAMIENTO')
  const [description, setDescription] = useState('')
  const [amount, setAmount] = useState('')
  const [saving, setSaving] = useState(false)
  const { data: patients } = useApi<Patient[]>(['patients-all'], '/api/patients')

  async function save() {
    if (!patientId || !concept || !amount) {
      toast.error('Paciente, concepto y monto son obligatorios')
      return
    }
    setSaving(true)
    try {
      await apiPost('/api/extra-charges', {
        patientId,
        concept,
        description: description || undefined,
        amount: Number(amount),
      })
      toast.success('Cargo agregado. La recepción podrá verlo y cobrarlo.')
      onSaved()
    } catch (e: any) {
      toast.error(e.message || 'Error al agregar cargo')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>Nuevo cargo extra</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Paciente *</Label>
            <Select value={patientId} onValueChange={setPatientId}>
              <SelectTrigger><SelectValue placeholder="Seleccionar paciente" /></SelectTrigger>
              <SelectContent>
                {patients?.map((p) => (
                  <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-1.5">
            <Label>Concepto *</Label>
            <Input value={concept} onChange={(e) => setConcept(e.target.value)} placeholder="Ej. Procedimiento adicional" />
          </div>
          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Input value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Detalle del cargo" />
          </div>
          <div className="space-y-1.5">
            <Label>Monto *</Label>
            <Input type="number" value={amount} onChange={(e) => setAmount(e.target.value)} placeholder="0.00" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Agregar cargo'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

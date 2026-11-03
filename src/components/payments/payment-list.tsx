'use client'

import { useState } from 'react'
import { useStore } from '@/store/app-store'
import { useApi, apiPost } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Trash2, Wallet, Receipt } from 'lucide-react'
import { formatCurrency, formatDateTime, STATUS_LABELS, STATUS_COLORS, CONCEPT_LABELS, METHOD_LABELS } from '@/lib/format'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

type Patient = { id: string; firstName: string; lastName: string }
type ExtraCharge = {
  id: string
  patientId: string
  concept: string
  description: string | null
  amount: number
  status: string
  patient: { id: string; firstName: string; lastName: string }
  doctor: { doctorProfile?: { fullName: string } | null; email: string }
}

type Payment = {
  id: string
  totalAmount: number
  status: string
  date: string
  patient: { id: string; firstName: string; lastName: string }
  items: Array<{ id: string; concept: string; description: string; amount: number }>
  methods: Array<{ id: string; method: string; amount: number; reference: string | null }>
}

const CONCEPTS = ['CONSULTATION', 'TREATMENT', 'MEDICATION', 'STUDY', 'OTHER']
const METHODS = ['CASH', 'TRANSFER', 'CARD']

export function PaymentList() {
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()
  const { data: patients } = useApi<Patient[]>(['patients-all'], '/api/patients')
  const { data: payments, isLoading } = useApi<Payment[]>(['payments'], '/api/payments')

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Pagos</h1>
          <p className="text-sm text-muted-foreground">Registro de cobros a pacientes</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo pago
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center text-muted-foreground">Cargando…</p>
          ) : payments && payments.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="hidden md:table-cell">Conceptos</TableHead>
                  <TableHead className="hidden md:table-cell">Métodos</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {payments.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell className="text-xs">{formatDateTime(p.date)}</TableCell>
                    <TableCell className="font-medium">{p.patient.firstName} {p.patient.lastName}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">
                      {p.items.map((it) => (
                        <div key={it.id}>· {CONCEPT_LABELS[it.concept] || it.concept}: {formatCurrency(it.amount)}</div>
                      ))}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs">
                      {p.methods.map((m) => (
                        <div key={m.id}>· {METHOD_LABELS[m.method] || m.method}: {formatCurrency(m.amount)}</div>
                      ))}
                    </TableCell>
                    <TableCell className="font-bold">{formatCurrency(p.totalAmount)}</TableCell>
                    <TableCell><Badge className={STATUS_COLORS[p.status]}>{STATUS_LABELS[p.status]}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-8 text-center text-muted-foreground">Sin pagos registrados</p>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <PaymentForm
          patients={patients || []}
          onClose={() => setShowForm(false)}
          onSaved={() => {
            setShowForm(false)
            qc.invalidateQueries({ queryKey: ['payments'] })
            qc.invalidateQueries({ queryKey: ['extra-charges'] })
            qc.invalidateQueries({ queryKey: ['cash-close', 'today'] })
          }}
        />
      )}
    </div>
  )
}

function PaymentForm({ patients, onClose, onSaved }: { patients: Patient[]; onClose: () => void; onSaved: () => void }) {
  const [patientId, setPatientId] = useState('')
  const [items, setItems] = useState<Array<{ concept: string; description: string; amount: string }>>([
    { concept: 'CONSULTATION', description: '', amount: '' },
  ])
  const [methods, setMethods] = useState<Array<{ method: string; amount: string; reference: string }>>([
    { method: 'CASH', amount: '', reference: '' },
  ])
  const [saving, setSaving] = useState(false)

  const { data: pendingCharges } = useApi<ExtraCharge[]>(
    ['pending-charges', patientId],
    patientId ? `/api/extra-charges?patientId=${patientId}&status=PENDING` : null,
  )

  // Catálogo de servicios para autocompletar conceptos
  const { data: services } = useApi<Array<{ id: string; name: string; category: string; defaultPrice: number }>>(
    ['services'],
    '/api/services',
  )

  const [appliedCharges, setAppliedCharges] = useState<string[]>([])

  const itemsTotal = items.reduce((s, it) => s + (Number(it.amount) || 0), 0) + appliedCharges.reduce((s, id) => {
    const c = pendingCharges?.find((x) => x.id === id)
    return s + (c?.amount || 0)
  }, 0)
  const methodsTotal = methods.reduce((s, m) => s + (Number(m.amount) || 0), 0)
  const diff = Math.abs(itemsTotal - methodsTotal)

  function updateItem(idx: number, field: 'concept' | 'description' | 'amount', value: string) {
    setItems((prev) => prev.map((it, i) => (i === idx ? { ...it, [field]: value } : it)))
  }
  function updateMethod(idx: number, field: 'method' | 'amount' | 'reference', value: string) {
    setMethods((prev) => prev.map((m, i) => (i === idx ? { ...m, [field]: value } : m)))
  }
  function addItem() {
    setItems((prev) => [...prev, { concept: 'OTHER', description: '', amount: '' }])
  }
  function addServiceFromCatalog(svc: { id: string; name: string; category: string; defaultPrice: number }) {
    setItems((prev) => [...prev, {
      concept: svc.category === 'CONSULTATION' ? 'CONSULTATION' : svc.category === 'STUDY' ? 'STUDY' : svc.category === 'MEDICAL' || svc.category === 'DENTAL' ? 'TREATMENT' : 'OTHER',
      description: svc.name,
      amount: String(svc.defaultPrice),
    }])
  }
  function removeItem(idx: number) {
    setItems((prev) => prev.filter((_, i) => i !== idx))
  }
  function addMethod() {
    if (methods.length >= 2) {
      toast.error('Solo se permiten hasta 2 métodos de pago')
      return
    }
    setMethods((prev) => [...prev, { method: 'CARD', amount: '', reference: '' }])
  }
  function removeMethod(idx: number) {
    setMethods((prev) => prev.filter((_, i) => i !== idx))
  }
  function toggleCharge(id: string) {
    setAppliedCharges((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]))
  }

  async function save() {
    if (!patientId) {
      toast.error('Selecciona un paciente')
      return
    }
    const validItems = items.filter((it) => it.amount && Number(it.amount) > 0)
    if (validItems.length === 0 && appliedCharges.length === 0) {
      toast.error('Agrega al menos un concepto de cobro')
      return
    }
    if (methods.length === 0 || methods.length > 2) {
      toast.error('Especifica 1 o 2 métodos de pago')
      return
    }
    if (diff > 0.01) {
      toast.error(`Los totales no coincen: conceptos ${formatCurrency(itemsTotal)} vs métodos ${formatCurrency(methodsTotal)}`)
      return
    }
    setSaving(true)
    try {
      const allItems = [
        ...validItems.map((it) => ({ ...it, amount: Number(it.amount) })),
        ...(appliedCharges.map((id) => {
          const c = pendingCharges?.find((x) => x.id === id)
          return c ? { concept: 'OTHER', description: c.concept, amount: c.amount } : null
        }).filter(Boolean) as any[]),
      ]
      await apiPost('/api/payments', {
        patientId,
        items: allItems,
        methods: methods.filter((m) => m.amount && Number(m.amount) > 0).map((m) => ({ ...m, amount: Number(m.amount) })),
        extraChargeIds: appliedCharges,
      })
      toast.success('Pago registrado')
      onSaved()
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto thin-scroll">
        <DialogHeader>
          <DialogTitle>Nuevo pago</DialogTitle>
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

          {/* Pending extra charges */}
          {pendingCharges && pendingCharges.length > 0 && (
            <div className="p-3 rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-900/20">
              <p className="text-xs font-semibold mb-2">Cargos pendientes del médico ({pendingCharges.length})</p>
              <div className="space-y-1">
                {pendingCharges.map((c) => (
                  <label key={c.id} className="flex items-center gap-2 text-sm">
                    <input
                      type="checkbox"
                      checked={appliedCharges.includes(c.id)}
                      onChange={() => toggleCharge(c.id)}
                    />
                    <span className="flex-1">{c.concept} — {formatCurrency(c.amount)} <span className="text-xs text-muted-foreground">({c.doctor?.doctorProfile?.fullName || 'Médico'})</span></span>
                  </label>
                ))}
              </div>
            </div>
          )}

          {/* Catálogo de servicios — acceso rápido */}
          {services && services.length > 0 && (
            <div className="p-3 rounded-md border border-teal-200 bg-teal-50 dark:bg-teal-900/20 dark:border-teal-800">
              <p className="text-xs font-semibold mb-2 text-teal-900 dark:text-teal-200">Catálogo de servicios (clic para agregar)</p>
              <div className="flex flex-wrap gap-1.5">
                {services.map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => addServiceFromCatalog(s)}
                    className="text-xs px-2 py-1 rounded-md border border-teal-300 dark:border-teal-700 bg-white dark:bg-slate-800 hover:bg-teal-100 dark:hover:bg-teal-900/40 transition"
                    title={`Agregar ${s.name} (${formatCurrency(s.defaultPrice)})`}
                  >
                    + {s.name} <span className="text-muted-foreground">· {formatCurrency(s.defaultPrice)}</span>
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Items */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold">Conceptos de cobro</Label>
              <Button size="sm" variant="outline" onClick={addItem}><Plus className="w-3.5 h-3.5 mr-1" /> Agregar</Button>
            </div>
            <div className="space-y-2">
              {items.map((it, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4 space-y-1">
                    <Label className="text-xs">Tipo</Label>
                    <Select value={it.concept} onValueChange={(v) => updateItem(idx, 'concept', v)}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {CONCEPTS.map((c) => <SelectItem key={c} value={c}>{CONCEPT_LABELS[c]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-5 space-y-1">
                    <Label className="text-xs">Descripción</Label>
                    <Input value={it.description} onChange={(e) => updateItem(idx, 'description', e.target.value)} placeholder="Consulta general" className="h-8" />
                  </div>
                  <div className="col-span-2 space-y-1">
                    <Label className="text-xs">Monto</Label>
                    <Input type="number" value={it.amount} onChange={(e) => updateItem(idx, 'amount', e.target.value)} placeholder="0.00" className="h-8" />
                  </div>
                  <div className="col-span-1">
                    <Button size="icon" variant="ghost" className="text-rose-600" onClick={() => removeItem(idx)}><Trash2 className="w-4 h-4" /></Button>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Methods */}
          <div>
            <div className="flex items-center justify-between mb-2">
              <Label className="text-sm font-semibold">Métodos de pago (máx. 2)</Label>
              <Button size="sm" variant="outline" onClick={addMethod} disabled={methods.length >= 2}>
                <Plus className="w-3.5 h-3.5 mr-1" /> Agregar método
              </Button>
            </div>
            <div className="space-y-2">
              {methods.map((m, idx) => (
                <div key={idx} className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-4 space-y-1">
                    <Label className="text-xs">Método</Label>
                    <Select value={m.method} onValueChange={(v) => updateMethod(idx, 'method', v)}>
                      <SelectTrigger className="h-8"><SelectValue /></SelectTrigger>
                      <SelectContent>
                        {METHODS.map((mm) => <SelectItem key={mm} value={mm}>{METHOD_LABELS[mm]}</SelectItem>)}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="col-span-3 space-y-1">
                    <Label className="text-xs">Monto</Label>
                    <Input type="number" value={m.amount} onChange={(e) => updateMethod(idx, 'amount', e.target.value)} placeholder="0.00" className="h-8" />
                  </div>
                  <div className="col-span-4 space-y-1">
                    <Label className="text-xs">Referencia</Label>
                    <Input value={m.reference} onChange={(e) => updateMethod(idx, 'reference', e.target.value)} placeholder="TXN-123" className="h-8" />
                  </div>
                  <div className="col-span-1">
                    {methods.length > 1 && (
                      <Button size="icon" variant="ghost" className="text-rose-600" onClick={() => removeMethod(idx)}><Trash2 className="w-4 h-4" /></Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Totals */}
          <div className="flex flex-wrap justify-between gap-3 p-3 rounded-md bg-muted">
            <div>
              <p className="text-xs text-muted-foreground">Total conceptos</p>
              <p className="text-lg font-bold">{formatCurrency(itemsTotal)}</p>
            </div>
            <div className="text-right">
              <p className="text-xs text-muted-foreground">Total métodos</p>
              <p className={`text-lg font-bold ${diff > 0.01 ? 'text-rose-600' : 'text-emerald-600'}`}>{formatCurrency(methodsTotal)}</p>
              {diff > 0.01 && (
                <p className="text-xs text-rose-600">Diferencia: {formatCurrency(diff)}</p>
              )}
            </div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Registrar pago'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

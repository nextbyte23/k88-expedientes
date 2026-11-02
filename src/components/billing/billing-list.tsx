'use client'

import { useState } from 'react'
import { useApi, apiPost } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Receipt } from 'lucide-react'
import { formatCurrency, formatDate, STATUS_LABELS, STATUS_COLORS } from '@/lib/format'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

type Patient = { id: string; firstName: string; lastName: string }
type Payment = {
  id: string
  totalAmount: number
  date: string
  receptionistId: string
  items: Array<{ id: string; concept: string; description: string; amount: number }>
  methods: Array<{ id: string; method: string; amount: number }>
}

type Billing = {
  id: string
  folio: string
  date: string
  rfc: string
  razonSocial: string
  fiscalAddress: string | null
  cfdiUse: string | null
  subtotal: number
  iva: number
  total: number
  status: string
  patient: { id: string; firstName: string; lastName: string }
}

const CFDI_USES = [
  'G01 - Adquisición de mercancías',
  'G03 - Gastos en general',
  'P01 - Por definir',
  'D01 - Honorarios médicos',
  'D10 - Servicios médicos',
]

export function BillingList() {
  const [showForm, setShowForm] = useState(false)
  const qc = useQueryClient()
  const { data: billings, isLoading } = useApi<Billing[]>(['billings'], '/api/billing')

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Facturación</h1>
          <p className="text-sm text-muted-foreground">Facturas emitidas</p>
        </div>
        <Button onClick={() => setShowForm(true)}>
          <Plus className="w-4 h-4 mr-2" /> Nueva factura
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center text-muted-foreground">Cargando…</p>
          ) : billings && billings.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Folio</TableHead>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Paciente</TableHead>
                  <TableHead className="hidden md:table-cell">RFC</TableHead>
                  <TableHead className="hidden md:table-cell">Razón social</TableHead>
                  <TableHead>Subtotal</TableHead>
                  <TableHead className="hidden sm:table-cell">IVA</TableHead>
                  <TableHead>Total</TableHead>
                  <TableHead>Estado</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {billings.map((b) => (
                  <TableRow key={b.id}>
                    <TableCell className="font-mono text-xs">{b.folio}</TableCell>
                    <TableCell className="text-xs">{formatDate(b.date)}</TableCell>
                    <TableCell className="text-xs">{b.patient.firstName} {b.patient.lastName}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{b.rfc}</TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{b.razonSocial}</TableCell>
                    <TableCell className="text-xs">{formatCurrency(b.subtotal)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{formatCurrency(b.iva)}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(b.total)}</TableCell>
                    <TableCell><Badge className={STATUS_COLORS[b.status]}>{STATUS_LABELS[b.status]}</Badge></TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-8 text-center text-muted-foreground">Sin facturas registradas</p>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <BillingForm onClose={() => setShowForm(false)} onSaved={() => { setShowForm(false); qc.invalidateQueries({ queryKey: ['billings'] }) }} />
      )}
    </div>
  )
}

function BillingForm({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [patientId, setPatientId] = useState('')
  const [paymentId, setPaymentId] = useState('')
  const [rfc, setRfc] = useState('')
  const [razonSocial, setRazonSocial] = useState('')
  const [fiscalAddress, setFiscalAddress] = useState('')
  const [cfdiUse, setCfdiUse] = useState('P01 - Por definir')
  const [ivaRate, setIvaRate] = useState('0.16')
  const [saving, setSaving] = useState(false)

  const { data: patients } = useApi<Patient[]>(['patients-all'], '/api/patients')
  const { data: payments } = useApi<Payment[]>(
    ['payments-patient', patientId],
    patientId ? `/api/payments?patientId=${patientId}` : null,
  )

  const selectedPayment = payments?.find((p) => p.id === paymentId)
  const subtotal = selectedPayment?.totalAmount || 0
  const iva = subtotal * (Number(ivaRate) || 0)
  const total = subtotal + iva

  async function save() {
    if (!patientId || !rfc || !razonSocial) {
      toast.error('Paciente, RFC y razón social son obligatorios')
      return
    }
    setSaving(true)
    try {
      await apiPost('/api/billing', {
        patientId,
        paymentId: paymentId || undefined,
        rfc,
        razonSocial,
        fiscalAddress: fiscalAddress || undefined,
        cfdiUse,
        ivaRate: Number(ivaRate),
        subtotal,
      })
      toast.success('Factura emitida')
      onSaved()
    } catch (e: any) {
      toast.error(e.message || 'Error al facturar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Nueva factura</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Paciente *</Label>
              <Select value={patientId} onValueChange={(v) => { setPatientId(v); setPaymentId('') }}>
                <SelectTrigger><SelectValue placeholder="Seleccionar" /></SelectTrigger>
                <SelectContent>
                  {patients?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{p.firstName} {p.lastName}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Pago asociado</Label>
              <Select value={paymentId} onValueChange={setPaymentId} disabled={!patientId}>
                <SelectTrigger><SelectValue placeholder="Opcional" /></SelectTrigger>
                <SelectContent>
                  {payments?.map((p) => (
                    <SelectItem key={p.id} value={p.id}>{formatCurrency(p.totalAmount)} · {new Date(p.date).toLocaleDateString('es-MX')}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>RFC *</Label>
              <Input value={rfc} onChange={(e) => setRfc(e.target.value.toUpperCase())} placeholder="XAXX010101000" />
            </div>
            <div className="space-y-1.5">
              <Label>Razón social *</Label>
              <Input value={razonSocial} onChange={(e) => setRazonSocial(e.target.value)} placeholder="Nombre o empresa" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Dirección fiscal</Label>
            <Input value={fiscalAddress} onChange={(e) => setFiscalAddress(e.target.value)} placeholder="Calle, número, colonia, CP" />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Uso CFDI</Label>
              <Select value={cfdiUse} onValueChange={setCfdiUse}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {CFDI_USES.map((u) => <SelectItem key={u} value={u}>{u}</SelectItem>)}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Tasa IVA</Label>
              <Select value={ivaRate} onValueChange={setIvaRate}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="0.16">16%</SelectItem>
                  <SelectItem value="0">0% (Exento)</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
          <div className="p-3 rounded-md bg-muted space-y-1 text-sm">
            <div className="flex justify-between"><span>Subtotal:</span><span>{formatCurrency(subtotal)}</span></div>
            <div className="flex justify-between"><span>IVA ({(Number(ivaRate) * 100).toFixed(0)}%):</span><span>{formatCurrency(iva)}</span></div>
            <div className="flex justify-between font-bold border-t border-border pt-1"><span>Total:</span><span>{formatCurrency(total)}</span></div>
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Emitiendo…' : 'Emitir factura'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

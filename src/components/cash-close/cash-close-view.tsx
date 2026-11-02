'use client'

import { useState } from 'react'
import { useApi, apiPost } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Calculator, Lock, Plus } from 'lucide-react'
import { formatCurrency, formatDate, METHOD_LABELS, STATUS_LABELS, STATUS_COLORS, todayISODate } from '@/lib/format'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

type CashClose = {
  id: string
  date: string
  status: string
  openingBalance: number
  totalCash: number
  totalTransfer: number
  totalCard: number
  totalAttended: number
  totalCharged: number
  openedAt: string
  closedAt: string | null
  receptionist: { email: string }
  notes?: string | null
}

type Payment = {
  id: string
  date: string
  totalAmount: number
  patient: { id: string; firstName: string; lastName: string }
  methods: Array<{ id: string; method: string; amount: number }>
}

type CashCloseDetail = CashClose & {
  payments: Payment[]
}

export function CashCloseView() {
  const today = todayISODate()
  const qc = useQueryClient()
  const { data: todayClose } = useApi<CashClose | null>(['cash-close', 'today'], `/api/cash-close/today?date=${today}`)
  const { data: history } = useApi<CashClose[]>(['cash-close-history'], '/api/cash-close')
  const [showOpen, setShowOpen] = useState(false)
  const [closing, setClosing] = useState(false)
  const [notes, setNotes] = useState('')

  const { data: detail } = useApi<CashCloseDetail>(
    ['cash-close-payments', todayClose?.id],
    todayClose ? `/api/cash-close/${todayClose.id}` : null,
  )
  const todayPayments = detail?.payments || []

  async function closeCash() {
    if (!todayClose) return
    setClosing(true)
    try {
      await apiPost(`/api/cash-close/${todayClose.id}`, { notes })
      qc.invalidateQueries({ queryKey: ['cash-close'] })
      toast.success('Caja cerrada')
    } catch (e: any) {
      toast.error(e.message || 'Error al cerrar caja')
    } finally {
      setClosing(false)
    }
  }

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Cierre de caja</h1>
        <p className="text-sm text-muted-foreground">Apertura, movimientos y cierre del día</p>
      </div>

      {/* Today's cash */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Calculator className="w-5 h-5" /> Caja de hoy · {formatDate(new Date())}
          </CardTitle>
          <CardDescription>
            {todayClose?.status === 'OPEN' ? 'Caja abierta' : todayClose?.status === 'CLOSED' ? 'Caja cerrada' : 'Sin abrir'}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {todayClose ? (
            <>
              <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                <Stat label="Saldo inicial" value={formatCurrency(todayClose.openingBalance)} />
                <Stat label="Efectivo" value={formatCurrency(todayClose.totalCash)} />
                <Stat label="Transferencia" value={formatCurrency(todayClose.totalTransfer)} />
                <Stat label="Tarjeta" value={formatCurrency(todayClose.totalCard)} />
              </div>
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 pt-2 border-t border-border">
                <Stat label="Pacientes atendidos" value={String(todayClose.totalAttended)} />
                <Stat label="Total cobrado" value={formatCurrency(todayClose.totalCharged)} bold />
                <div className="flex items-center">
                  <Badge className={STATUS_COLORS[todayClose.status]}>{STATUS_LABELS[todayClose.status]}</Badge>
                </div>
              </div>

              {/* Today's payments */}
              {todayPayments && todayPayments.length > 0 && (
                <div>
                  <p className="text-sm font-semibold mb-2">Pagos del día</p>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Hora</TableHead>
                        <TableHead>Paciente</TableHead>
                        <TableHead>Métodos</TableHead>
                        <TableHead className="text-right">Total</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {todayPayments.map((p) => (
                        <TableRow key={p.id}>
                          <TableCell className="text-xs">{new Date(p.date).toLocaleTimeString('es-MX', { hour: '2-digit', minute: '2-digit' })}</TableCell>
                          <TableCell className="text-xs">{p.patient.firstName} {p.patient.lastName}</TableCell>
                          <TableCell className="text-xs">
                            {p.methods.map((m) => (
                              <div key={m.id}>{METHOD_LABELS[m.method]}: {formatCurrency(m.amount)}</div>
                            ))}
                          </TableCell>
                          <TableCell className="text-right font-bold">{formatCurrency(p.totalAmount)}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              )}

              {todayClose.status === 'OPEN' && (
                <div className="space-y-2 pt-3 border-t border-border">
                  <div className="space-y-1.5">
                    <Label>Notas del cierre (opcional)</Label>
                    <Input value={notes} onChange={(e) => setNotes(e.target.value)} placeholder="Observaciones…" />
                  </div>
                  <Button onClick={closeCash} disabled={closing} className="w-full sm:w-auto">
                    <Lock className="w-4 h-4 mr-2" /> {closing ? 'Cerrando…' : 'Cerrar caja del día'}
                  </Button>
                </div>
              )}
            </>
          ) : (
            <div className="text-center py-4">
              <p className="text-sm text-muted-foreground mb-3">No hay caja abierta para hoy</p>
              <Button onClick={() => setShowOpen(true)}>
                <Plus className="w-4 h-4 mr-2" /> Abrir caja
              </Button>
            </div>
          )}
        </CardContent>
      </Card>

      {/* History */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base">Historial de cierres</CardTitle>
        </CardHeader>
        <CardContent className="p-0">
          {history && history.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Fecha</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead>Efectivo</TableHead>
                  <TableHead className="hidden sm:table-cell">Transferencia</TableHead>
                  <TableHead className="hidden sm:table-cell">Tarjeta</TableHead>
                  <TableHead>Pacientes</TableHead>
                  <TableHead>Total</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {history.map((c) => (
                  <TableRow key={c.id}>
                    <TableCell className="text-xs">{formatDate(c.date)}</TableCell>
                    <TableCell><Badge className={STATUS_COLORS[c.status]}>{STATUS_LABELS[c.status]}</Badge></TableCell>
                    <TableCell className="text-xs">{formatCurrency(c.totalCash)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{formatCurrency(c.totalTransfer)}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs">{formatCurrency(c.totalCard)}</TableCell>
                    <TableCell className="text-xs">{c.totalAttended}</TableCell>
                    <TableCell className="font-bold">{formatCurrency(c.totalCharged)}</TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <p className="p-6 text-center text-muted-foreground text-sm">Sin historial</p>
          )}
        </CardContent>
      </Card>

      {showOpen && (
        <OpenCashDialog onClose={() => setShowOpen(false)} onSaved={() => { setShowOpen(false); qc.invalidateQueries({ queryKey: ['cash-close'] }) }} />
      )}
    </div>
  )
}

function OpenCashDialog({ onClose, onSaved }: { onClose: () => void; onSaved: () => void }) {
  const [openingBalance, setOpeningBalance] = useState('0')
  const [saving, setSaving] = useState(false)

  async function open() {
    setSaving(true)
    try {
      await apiPost('/api/cash-close', {
        date: todayISODate(),
        openingBalance: Number(openingBalance) || 0,
      })
      toast.success('Caja abierta')
      onSaved()
    } catch (e: any) {
      toast.error(e.message || 'Error al abrir caja')
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center p-4 z-50">
      <Card className="w-full max-w-md">
        <CardHeader>
          <CardTitle className="text-base">Abrir caja</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Saldo inicial (efectivo en caja)</Label>
            <Input type="number" value={openingBalance} onChange={(e) => setOpeningBalance(e.target.value)} />
          </div>
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={onClose}>Cancelar</Button>
            <Button onClick={open} disabled={saving}>{saving ? 'Abriendo…' : 'Abrir caja'}</Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

function Stat({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="p-2 rounded-md bg-muted">
      <p className="text-xs text-muted-foreground">{label}</p>
      <p className={`text-sm ${bold ? 'font-bold' : 'font-medium'}`}>{value}</p>
    </div>
  )
}

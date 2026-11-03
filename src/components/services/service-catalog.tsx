'use client'

import { useState } from 'react'
import { useApi, apiPost, apiPut, apiDelete } from '@/lib/use-api'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from '@/components/ui/dialog'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Badge } from '@/components/ui/badge'
import { Plus, Edit2, Trash2, DollarSign } from 'lucide-react'
import { formatCurrency } from '@/lib/format'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

type Service = {
  id: string
  name: string
  description: string | null
  category: string
  defaultPrice: number
  maxPrice: number | null
  active: boolean
}

const CATEGORIES: Record<string, string> = {
  CONSULTATION: 'Consulta',
  DENTAL: 'Dental',
  MEDICAL: 'Médico',
  STUDY: 'Estudio',
  OTHER: 'Otro',
}

function formatPriceRange(min: number, max: number | null): string {
  if (max && max > min) {
    return `${formatCurrency(min)} – ${formatCurrency(max)}`
  }
  return formatCurrency(min)
}

export function ServiceCatalog() {
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState<Service | null>(null)
  const qc = useQueryClient()
  const { data: services, isLoading } = useApi<Service[]>(['services'], '/api/services')

  return (
    <div className="p-6 space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold">Catálogo de servicios</h1>
          <p className="text-sm text-muted-foreground">Servicios con precio fijo para cobranza</p>
        </div>
        <Button onClick={() => { setEditing(null); setShowForm(true) }}>
          <Plus className="w-4 h-4 mr-2" /> Nuevo servicio
        </Button>
      </div>

      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <p className="p-8 text-center text-muted-foreground">Cargando…</p>
          ) : services && services.length > 0 ? (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Categoría</TableHead>
                  <TableHead className="hidden md:table-cell">Descripción</TableHead>
                  <TableHead>Precio</TableHead>
                  <TableHead>Estado</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {services.map((s) => (
                  <TableRow key={s.id}>
                    <TableCell className="font-medium">{s.name}</TableCell>
                    <TableCell><Badge variant="outline">{CATEGORIES[s.category] || s.category}</Badge></TableCell>
                    <TableCell className="hidden md:table-cell text-xs">{s.description || '—'}</TableCell>
                    <TableCell className="font-bold">{formatPriceRange(s.defaultPrice, s.maxPrice)}</TableCell>
                    <TableCell>
                      <Badge className={s.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'}>
                        {s.active ? 'Activo' : 'Inactivo'}
                      </Badge>
                    </TableCell>
                    <TableCell className="text-right">
                      <Button size="sm" variant="outline" onClick={() => { setEditing(s); setShowForm(true) }}>
                        <Edit2 className="w-3.5 h-3.5 mr-1" /> Editar
                      </Button>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          ) : (
            <div className="p-8 text-center text-muted-foreground">
              <DollarSign className="w-10 h-10 mx-auto mb-2 opacity-40" />
              <p>Sin servicios registrados</p>
              <p className="text-xs mt-1">Agrega los servicios que ofrece la clínica con sus precios.</p>
            </div>
          )}
        </CardContent>
      </Card>

      {showForm && (
        <ServiceForm
          initial={editing}
          onClose={() => { setShowForm(false); setEditing(null) }}
          onSaved={() => {
            setShowForm(false)
            setEditing(null)
            qc.invalidateQueries({ queryKey: ['services'] })
          }}
        />
      )}
    </div>
  )
}

function ServiceForm({ initial, onClose, onSaved }: { initial: Service | null; onClose: () => void; onSaved: () => void }) {
  const isEdit = !!initial
  const [name, setName] = useState(initial?.name || '')
  const [description, setDescription] = useState(initial?.description || '')
  const [category, setCategory] = useState(initial?.category || 'CONSULTATION')
  const [defaultPrice, setDefaultPrice] = useState(initial ? String(initial.defaultPrice) : '')
  const [maxPrice, setMaxPrice] = useState(initial?.maxPrice ? String(initial.maxPrice) : '')
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!name || !category || !defaultPrice) {
      toast.error('Nombre, categoría y precio mínimo son obligatorios')
      return
    }
    if (maxPrice && Number(maxPrice) <= Number(defaultPrice)) {
      toast.error('El precio máximo debe ser mayor al precio mínimo')
      return
    }
    setSaving(true)
    try {
      const body = {
        name,
        description: description || undefined,
        category,
        defaultPrice: Number(defaultPrice),
        maxPrice: maxPrice ? Number(maxPrice) : undefined,
      }
      if (isEdit) {
        await apiPut(`/api/services/${initial!.id}`, body)
      } else {
        await apiPost('/api/services', body)
      }
      toast.success(isEdit ? 'Servicio actualizado' : 'Servicio creado')
      onSaved()
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  return (
    <Dialog open onOpenChange={(o) => !o && onClose()}>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{isEdit ? 'Editar servicio' : 'Nuevo servicio'}</DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nombre *</Label>
            <Input value={name} onChange={(e) => setName(e.target.value)} placeholder="Ej. Consulta dental" />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Categoría *</Label>
              <Select value={category} onValueChange={setCategory}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {Object.entries(CATEGORIES).map(([k, v]) => (
                    <SelectItem key={k} value={k}>{v}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label>Precio mínimo (MXN) *</Label>
              <Input type="number" value={defaultPrice} onChange={(e) => setDefaultPrice(e.target.value)} placeholder="500" />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Precio máximo (MXN) — opcional</Label>
            <Input type="number" value={maxPrice} onChange={(e) => setMaxPrice(e.target.value)} placeholder="Vacío = precio único" />
            <p className="text-xs text-muted-foreground">
              Si el servicio tiene precio fijo, deja este campo vacío.
              Si tiene rango (ej. $250–$300), captura el máximo aquí.
            </p>
          </div>
          <div className="space-y-1.5">
            <Label>Descripción</Label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} rows={2} placeholder="Detalle del servicio (subgrupo, notas, etc.)" />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={onClose}>Cancelar</Button>
          <Button onClick={save} disabled={saving}>{saving ? 'Guardando…' : 'Guardar'}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}

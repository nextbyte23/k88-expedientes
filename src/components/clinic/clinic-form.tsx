'use client'

import { useState } from 'react'
import { useStore } from '@/store/app-store'
import { useApi, apiPut } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Building2, Save } from 'lucide-react'
import { toast } from 'sonner'
import { useQueryClient } from '@tanstack/react-query'

type Clinic = {
  id: string
  name: string
  address: string
  phone: string
  email: string | null
  rfc: string | null
  fiscalAddress: string | null
  logoUrl: string | null
}

export function ClinicForm() {
  const { clinic, setClinic } = useStore()
  const qc = useQueryClient()
  const [form, setForm] = useState<Clinic>(clinic as Clinic)
  const [saving, setSaving] = useState(false)

  async function save() {
    if (!form.name || !form.address || !form.phone) {
      toast.error('Nombre, dirección y teléfono son obligatorios')
      return
    }
    setSaving(true)
    try {
      const updated = await apiPut<Clinic>('/api/clinic', form)
      setClinic(updated)
      qc.invalidateQueries({ queryKey: ['clinic'] })
      toast.success('Configuración guardada')
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar')
    } finally {
      setSaving(false)
    }
  }

  function handleLogoUpload(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0]
    if (!file) return
    if (file.size > 500_000) {
      toast.error('El logo es muy grande. Máximo 500KB.')
      return
    }
    const reader = new FileReader()
    reader.onload = () => {
      setForm((f) => ({ ...f, logoUrl: reader.result as string }))
    }
    reader.readAsDataURL(file)
  }

  if (!form) return null

  return (
    <div className="p-6 space-y-4">
      <div>
        <h1 className="text-2xl font-bold">Configuración de la clínica</h1>
        <p className="text-sm text-muted-foreground">Estos datos aparecerán en todos los documentos impresos (recetas, notas, expedientes)</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Building2 className="w-5 h-5" /> Datos de la clínica
          </CardTitle>
          <CardDescription>Encabezado común para impresiones</CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="space-y-1.5">
            <Label>Nombre *</Label>
            <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>Teléfono *</Label>
              <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Correo</Label>
              <Input value={form.email || ''} onChange={(e) => setForm({ ...form, email: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Dirección *</Label>
            <Textarea value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} rows={2} />
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-1.5">
              <Label>RFC</Label>
              <Input value={form.rfc || ''} onChange={(e) => setForm({ ...form, rfc: e.target.value })} />
            </div>
            <div className="space-y-1.5">
              <Label>Dirección fiscal</Label>
              <Input value={form.fiscalAddress || ''} onChange={(e) => setForm({ ...form, fiscalAddress: e.target.value })} />
            </div>
          </div>
          <div className="space-y-1.5">
            <Label>Logo de la clínica</Label>
            <div className="flex items-center gap-3">
              {form.logoUrl ? (
                <img src={form.logoUrl} alt="logo" className="w-16 h-16 object-contain border rounded-md p-1" />
              ) : (
                <div className="w-16 h-16 rounded-md bg-teal-600 text-white flex items-center justify-center font-bold">
                  {form.name.slice(0, 3).toUpperCase()}
                </div>
              )}
              <Input type="file" accept="image/*" onChange={handleLogoUpload} />
              {form.logoUrl && (
                <Button variant="ghost" size="sm" onClick={() => setForm({ ...form, logoUrl: null })}>
                  Quitar
                </Button>
              )}
            </div>
            <p className="text-xs text-muted-foreground">Aparece en el encabezado de recetas, notas de evolución y expedientes.</p>
          </div>
          <div className="flex justify-end">
            <Button onClick={save} disabled={saving}>
              <Save className="w-4 h-4 mr-2" /> {saving ? 'Guardando…' : 'Guardar cambios'}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

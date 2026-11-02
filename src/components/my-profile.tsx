'use client'

import { useState } from 'react'
import { useStore } from '@/store/app-store'
import { apiPut } from '@/lib/use-api'
import { useQueryClient } from '@tanstack/react-query'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { User, Lock, Save, Eye, EyeOff } from 'lucide-react'
import { ROLE_LABELS } from '@/lib/roles'
import { toast } from 'sonner'

export function MyProfile() {
  const { user, setUser } = useStore()
  const qc = useQueryClient()
  const [showPwd, setShowPwd] = useState(false)
  const [showNewPwd, setShowNewPwd] = useState(false)

  // Password form
  const [currentPassword, setCurrentPassword] = useState('')
  const [newPassword, setNewPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [savingPwd, setSavingPwd] = useState(false)

  // Profile form (only for doctors)
  const isDoctor = user?.role === 'DENTAL_DOCTOR' || user?.role === 'GENERAL_DOCTOR' || user?.role === 'SPECIALIST_DOCTOR'
  const [fullName, setFullName] = useState(user?.doctorProfile?.fullName || '')
  const [career, setCareer] = useState(user?.doctorProfile?.career || '')
  const [specialty, setSpecialty] = useState(user?.doctorProfile?.specialty || '')
  const [professionalLicense, setProfessionalLicense] = useState(user?.doctorProfile?.professionalLicense || '')
  const [savingProfile, setSavingProfile] = useState(false)

  if (!user) return null

  async function changePassword(e: React.FormEvent) {
    e.preventDefault()
    if (!currentPassword || !newPassword || !confirmPassword) {
      toast.error('Llena los tres campos de contraseña')
      return
    }
    if (newPassword !== confirmPassword) {
      toast.error('La nueva contraseña y su confirmación no coinciden')
      return
    }
    if (newPassword.length < 6) {
      toast.error('La nueva contraseña debe tener al menos 6 caracteres')
      return
    }
    setSavingPwd(true)
    try {
      await apiPut('/api/auth/me', { currentPassword, newPassword })
      toast.success('Contraseña actualizada correctamente')
      setCurrentPassword('')
      setNewPassword('')
      setConfirmPassword('')
    } catch (e: any) {
      toast.error(e.message || 'Error al cambiar la contraseña')
    } finally {
      setSavingPwd(false)
    }
  }

  async function saveProfile(e: React.FormEvent) {
    e.preventDefault()
    if (!fullName) {
      toast.error('El nombre completo es obligatorio')
      return
    }
    setSavingProfile(true)
    try {
      const updated = await apiPut<any>('/api/auth/me', {
        fullName,
        career,
        specialty: specialty || undefined,
        professionalLicense,
      })
      // Update the store with the new user data
      setUser(updated)
      qc.invalidateQueries({ queryKey: ['me'] })
      toast.success('Datos profesionales actualizados')
    } catch (e: any) {
      toast.error(e.message || 'Error al guardar')
    } finally {
      setSavingProfile(false)
    }
  }

  return (
    <div className="p-6 max-w-3xl mx-auto space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Mi perfil</h1>
        <p className="text-sm text-muted-foreground">Administra tu cuenta y datos profesionales</p>
      </div>

      {/* Account info (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <User className="w-4 h-4" /> Información de la cuenta
          </CardTitle>
          <CardDescription>Datos generales de tu usuario</CardDescription>
        </CardHeader>
        <CardContent className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
          <div>
            <p className="text-xs text-muted-foreground">Correo electrónico</p>
            <p className="font-medium">{user.email}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Rol</p>
            <Badge variant="outline">{ROLE_LABELS[user.role as keyof typeof ROLE_LABELS] || user.role}</Badge>
          </div>
          <div>
            <p className="text-xs text-muted-foreground">Estado</p>
            <Badge className={user.active ? 'bg-emerald-100 text-emerald-800 dark:bg-emerald-900/40 dark:text-emerald-200' : 'bg-rose-100 text-rose-800 dark:bg-rose-900/40 dark:text-rose-200'}>
              {user.active ? 'Activo' : 'Inactivo'}
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Change password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-base flex items-center gap-2">
            <Lock className="w-4 h-4" /> Cambiar contraseña
          </CardTitle>
          <CardDescription>Verifica tu contraseña actual antes de cambiarla</CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={changePassword} className="space-y-3 max-w-md">
            <div className="space-y-1.5">
              <Label>Contraseña actual *</Label>
              <div className="relative">
                <Input
                  type={showPwd ? 'text' : 'password'}
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  placeholder="Tu contraseña actual"
                  autoComplete="current-password"
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Nueva contraseña *</Label>
              <div className="relative">
                <Input
                  type={showNewPwd ? 'text' : 'password'}
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="Mínimo 6 caracteres"
                  autoComplete="new-password"
                />
                <button
                  type="button"
                  onClick={() => setShowNewPwd((s) => !s)}
                  className="absolute right-2 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  {showNewPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>
            <div className="space-y-1.5">
              <Label>Confirmar nueva contraseña *</Label>
              <Input
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                placeholder="Repite la nueva contraseña"
                autoComplete="new-password"
              />
            </div>
            <Button type="submit" disabled={savingPwd}>
              <Save className="w-4 h-4 mr-2" /> {savingPwd ? 'Guardando…' : 'Cambiar contraseña'}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Doctor profile (only for doctors) */}
      {isDoctor && (
        <Card>
          <CardHeader>
            <CardTitle className="text-base flex items-center gap-2">
              <User className="w-4 h-4" /> Datos profesionales
            </CardTitle>
            <CardDescription>
              Estos datos aparecen en las recetas, notas de evolución y expedientes que firmes
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={saveProfile} className="space-y-3">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <Label>Nombre completo *</Label>
                  <Input value={fullName} onChange={(e) => setFullName(e.target.value)} placeholder="Dr. / Dra. Nombre Apellido" />
                </div>
                <div className="space-y-1.5">
                  <Label>Carrera *</Label>
                  <Input value={career} onChange={(e) => setCareer(e.target.value)} placeholder="Cirujano Dentista / Médico Cirujano" />
                </div>
                <div className="space-y-1.5">
                  <Label>Especialidad</Label>
                  <Input value={specialty} onChange={(e) => setSpecialty(e.target.value)} placeholder="Ej. Cardiología, Odontología General" />
                </div>
                <div className="space-y-1.5">
                  <Label>Cédula profesional *</Label>
                  <Input value={professionalLicense} onChange={(e) => setProfessionalLicense(e.target.value)} placeholder="12345678" />
                </div>
              </div>
              <Button type="submit" disabled={savingProfile}>
                <Save className="w-4 h-4 mr-2" /> {savingProfile ? 'Guardando…' : 'Guardar datos profesionales'}
              </Button>
            </form>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

'use client'

import { useState } from 'react'
import { useAppStore } from '@/store/app-store'
import { apiPost } from '@/lib/use-api'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { HeartPulse, Loader2, Stethoscope } from 'lucide-react'
import { toast } from 'sonner'

const DEMO_ACCOUNTS = [
  { email: 'admin@k88.mx', role: 'Administrador' },
  { email: 'recepcion@k88.mx', role: 'Recepción' },
  { email: 'odontologo1@k88.mx', role: 'Odontólogo 1' },
  { email: 'odontologo2@k88.mx', role: 'Odontólogo 2' },
  { email: 'medico1@k88.mx', role: 'Médico General 1' },
  { email: 'coordinador@k88.mx', role: 'Coordinador Médico' },
]

export function Login() {
  const { setUser, setClinic } = useAppStore()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [loading, setLoading] = useState(false)

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault()
    setLoading(true)
    try {
      const data = await apiPost<{ user: any; clinic: any }>('/api/auth/login', { email, password })
      setUser(data.user)
      setClinic(data.clinic)
      toast.success(`Bienvenido(a), ${data.user.doctorProfile?.fullName || data.user.email}`)
    } catch (e: any) {
      toast.error(e.message || 'Error al iniciar sesión')
    } finally {
      setLoading(false)
    }
  }

  function quickLogin(accEmail: string) {
    setEmail(accEmail)
    setPassword('demo1234')
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-teal-50 to-emerald-50 dark:from-slate-900 dark:to-slate-800 p-4">
      <div className="w-full max-w-5xl grid md:grid-cols-2 gap-6 items-center">
        {/* Branding */}
        <div className="hidden md:flex flex-col gap-6 p-8">
          <div className="flex items-center gap-3">
            <div className="w-14 h-14 rounded-2xl bg-teal-600 text-white flex items-center justify-center shadow-lg">
              <HeartPulse className="w-8 h-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900 dark:text-white">K88</h1>
              <p className="text-sm text-slate-600 dark:text-slate-300">Centro Integral Odontológico y Especialidades Médicas</p>
            </div>
          </div>
          <div className="space-y-3 text-slate-700 dark:text-slate-200">
            <div className="flex items-start gap-3">
              <Stethoscope className="w-5 h-5 text-teal-600 mt-0.5" />
              <p className="text-sm">Odontólogos, médicos generales y especialistas en una sola plataforma.</p>
            </div>
            <div className="flex items-start gap-3">
              <HeartPulse className="w-5 h-5 text-teal-600 mt-0.5" />
              <p className="text-sm">Notas de evolución NOM-004, odontograma interactivo (con brackets y ortodoncia) y recetas digitales.</p>
            </div>
            <div className="flex items-start gap-3">
              <Stethoscope className="w-5 h-5 text-teal-600 mt-0.5" />
              <p className="text-sm">Recepción con pagos combinados y cierre de caja diario.</p>
            </div>
          </div>
        </div>

        {/* Login form */}
        <Card className="shadow-xl border-slate-200 dark:border-slate-700">
          <CardHeader className="space-y-2">
            <div className="md:hidden flex items-center gap-2 mb-2">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center">
                <HeartPulse className="w-6 h-6" />
              </div>
              <CardTitle className="text-lg">K88</CardTitle>
            </div>
            <CardTitle className="text-2xl">Iniciar sesión</CardTitle>
            <CardDescription>Ingresa con tu cuenta para acceder al sistema</CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="email">Correo electrónico</Label>
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="usuario@k88.mx"
                  required
                  autoComplete="email"
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="password">Contraseña</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  autoComplete="current-password"
                />
              </div>
              <Button type="submit" className="w-full" disabled={loading}>
                {loading && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                Iniciar sesión
              </Button>
            </form>

            <div className="mt-6 pt-4 border-t border-slate-200 dark:border-slate-700">
              <p className="text-xs font-semibold text-slate-500 dark:text-slate-400 mb-2 uppercase tracking-wide">
                Cuentas demo (clic para autollenar · contraseña: demo1234)
              </p>
              <div className="grid grid-cols-2 gap-2">
                {DEMO_ACCOUNTS.map((acc) => (
                  <button
                    key={acc.email}
                    type="button"
                    onClick={() => quickLogin(acc.email)}
                    className="text-left px-2 py-1.5 rounded-md text-xs hover:bg-teal-50 dark:hover:bg-slate-800 border border-slate-100 dark:border-slate-700 transition"
                  >
                    <div className="font-medium text-slate-700 dark:text-slate-200">{acc.role}</div>
                    <div className="text-[10px] text-slate-500 truncate">{acc.email}</div>
                  </button>
                ))}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

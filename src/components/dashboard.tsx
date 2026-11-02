'use client'

import { useAppStore as useStore } from '@/store/app-store'
import { useApi } from '@/lib/use-api'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { CalendarDays, Users, Wallet, Calculator, HeartPulse, FileText, Pill, PackagePlus, History } from 'lucide-react'
import { formatCurrency, formatDate, formatTime, STATUS_LABELS, STATUS_COLORS } from '@/lib/format'

type Appointment = {
  id: string
  dateTime: string
  status: string
  reason: string
  patient: { id: string; firstName: string; lastName: string; phone: string }
  doctor: { id: string; email: string; doctorProfile?: { fullName: string; specialty: string | null } | null }
}

type CashClose = {
  id: string
  date: string
  status: string
  openingBalance: number
  totalCash: number
  totalTransfer: number
  totalCard: number
  totalCharged: number
  totalAttended: number
}

export function Dashboard() {
  const { user, setView } = useStore()

  const today = new Date().toISOString().split('T')[0]
  const isReceptionOrAdmin = user?.role === 'RECEPTION' || user?.role === 'ADMIN'
  const isDoctor = user?.role === 'DENTAL_DOCTOR' || user?.role === 'GENERAL_DOCTOR' || user?.role === 'SPECIALIST_DOCTOR'
  const isCoordinator = user?.role === 'COORDINATOR'

  // Fetch appointments for today (doctors see their own; reception/admin see all)
  const { data: todayAppts } = useApi<Appointment[]>(
    ['appointments', 'today', user?.id || 'anon'],
    `/api/appointments?date=${today}`,
  )

  // Fetch cash close for today
  const { data: cashClose } = useApi<CashClose | null>(
    ['cash-close', 'today'],
    `/api/cash-close/today?date=${today}`,
    { enabled: isReceptionOrAdmin },
  )

  if (!user) return null

  return (
    <div className="p-6 space-y-6">
      <div>
        <h1 className="text-2xl font-bold">Panel principal</h1>
        <p className="text-muted-foreground">Resumen del día · {formatDate(new Date())}</p>
      </div>

      {/* Stats cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard
          title="Citas de hoy"
          value={todayAppts?.length ?? 0}
          icon={<CalendarDays className="w-5 h-5" />}
          accent="teal"
        />
        {isReceptionOrAdmin && (
          <>
            <StatCard
              title="Pacientes atendidos"
              value={cashClose?.totalAttended ?? 0}
              icon={<Users className="w-5 h-5" />}
              accent="emerald"
            />
            <StatCard
              title="Total cobrado hoy"
              value={formatCurrency(cashClose?.totalCharged ?? 0)}
              icon={<Wallet className="w-5 h-5" />}
              accent="amber"
            />
            <StatCard
              title="Estado de caja"
              value={cashClose?.status === 'OPEN' ? 'Abierta' : cashClose?.status === 'CLOSED' ? 'Cerrada' : 'Sin abrir'}
              icon={<Calculator className="w-5 h-5" />}
              accent="rose"
            />
          </>
        )}
        {isDoctor && (
          <>
            <StatCard
              title="Tu rol"
              value={user.doctorProfile?.specialty || user.doctorProfile?.career || '—'}
              icon={<HeartPulse className="w-5 h-5" />}
              accent="emerald"
            />
            <StatCard
              title="Cédula profesional"
              value={user.doctorProfile?.professionalLicense || '—'}
              icon={<FileText className="w-5 h-5" />}
              accent="amber"
            />
          </>
        )}
        {isCoordinator && (
          <StatCard
            title="Rol"
            value="Coordinador Médico"
            icon={<HeartPulse className="w-5 h-5" />}
            accent="emerald"
          />
        )}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
        {/* Today's appointments */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <CardTitle className="text-base">Citas de hoy</CardTitle>
            <CardDescription>Agenda del día</CardDescription>
          </CardHeader>
          <CardContent>
            {todayAppts && todayAppts.length > 0 ? (
              <ul className="divide-y divide-border">
                {todayAppts.map((a) => (
                  <li key={a.id} className="py-2.5 flex items-center gap-3">
                    <div className="text-sm font-mono text-muted-foreground w-16">{formatTime(a.dateTime)}</div>
                    <div className="flex-1 min-w-0">
                      <button
                        onClick={() => useStore.getState().selectPatient(a.patient.id)}
                        className="font-medium text-sm hover:underline truncate block text-left"
                      >
                        {a.patient.firstName} {a.patient.lastName}
                      </button>
                      <p className="text-xs text-muted-foreground truncate">{a.reason}</p>
                    </div>
                    <span
                      className={`text-xs px-2 py-0.5 rounded-full font-medium ${STATUS_COLORS[a.status] || 'bg-gray-100'}`}
                    >
                      {STATUS_LABELS[a.status] || a.status}
                    </span>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted-foreground py-8 text-center">No hay citas para hoy</p>
            )}
            <Button variant="outline" size="sm" className="mt-3" onClick={() => setView('appointments')}>
              Ver agenda completa
            </Button>
          </CardContent>
        </Card>

        {/* Cash summary or quick actions */}
        {isReceptionOrAdmin ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Caja de hoy</CardTitle>
              <CardDescription>{cashClose?.status === 'OPEN' ? 'Abierta' : cashClose?.status === 'CLOSED' ? 'Cerrada' : 'Sin apertura'}</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2 text-sm">
              {cashClose ? (
                <>
                  <Row label="Saldo inicial" value={formatCurrency(cashClose.openingBalance)} />
                  <Row label="Efectivo" value={formatCurrency(cashClose.totalCash)} />
                  <Row label="Transferencia" value={formatCurrency(cashClose.totalTransfer)} />
                  <Row label="Tarjeta" value={formatCurrency(cashClose.totalCard)} />
                  <div className="border-t border-border pt-2 mt-2">
                    <Row label="Total cobrado" value={formatCurrency(cashClose.totalCharged)} bold />
                  </div>
                  <Button size="sm" className="w-full mt-2" onClick={() => setView('cash-close')}>
                    <Calculator className="w-4 h-4 mr-2" /> Ir a cierre de caja
                  </Button>
                </>
              ) : (
                <>
                  <p className="text-muted-foreground">No hay caja abierta para hoy.</p>
                  <Button size="sm" className="w-full" onClick={() => setView('cash-close')}>
                    Abrir caja
                  </Button>
                </>
              )}
            </CardContent>
          </Card>
        ) : isDoctor ? (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Accesos rápidos</CardTitle>
              <CardDescription>Atención clínica</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <QuickBtn onClick={() => setView(user.role === 'DENTAL_DOCTOR' ? 'dental-records' : 'medical-records')} icon={<FileText className="w-4 h-4" />}>Nuevo expediente</QuickBtn>
              <QuickBtn onClick={() => setView('evolution-notes')} icon={<FileText className="w-4 h-4" />}>Nota de evolución</QuickBtn>
              <QuickBtn onClick={() => setView('prescriptions')} icon={<Pill className="w-4 h-4" />}>Nueva receta</QuickBtn>
              <QuickBtn onClick={() => setView('extra-charges')} icon={<PackagePlus className="w-4 h-4" />}>Agregar cargo extra</QuickBtn>
            </CardContent>
          </Card>
        ) : (
          <Card>
            <CardHeader>
              <CardTitle className="text-base">Accesos rápidos</CardTitle>
              <CardDescription>Vista coordinador</CardDescription>
            </CardHeader>
            <CardContent className="space-y-2">
              <QuickBtn onClick={() => setView('medical-records')} icon={<HeartPulse className="w-4 h-4" />}>Expedientes médicos</QuickBtn>
              <QuickBtn onClick={() => setView('dental-records')} icon={<HeartPulse className="w-4 h-4" />}>Expedientes dentales</QuickBtn>
              <QuickBtn onClick={() => setView('evolution-notes')} icon={<FileText className="w-4 h-4" />}>Notas de evolución</QuickBtn>
              <QuickBtn onClick={() => setView('corrections')} icon={<History className="w-4 h-4" />}>Correcciones</QuickBtn>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

function StatCard({ title, value, icon, accent }: { title: string; value: string | number; icon: React.ReactNode; accent: string }) {
  const accents: Record<string, string> = {
    teal: 'bg-teal-100 text-teal-700 dark:bg-teal-900/30 dark:text-teal-200',
    emerald: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-900/30 dark:text-emerald-200',
    amber: 'bg-amber-100 text-amber-700 dark:bg-amber-900/30 dark:text-amber-200',
    rose: 'bg-rose-100 text-rose-700 dark:bg-rose-900/30 dark:text-rose-200',
  }
  return (
    <Card>
      <CardContent className="p-4 flex items-center justify-between">
        <div className="min-w-0">
          <p className="text-xs text-muted-foreground truncate">{title}</p>
          <p className="text-xl font-bold mt-1 truncate">{value}</p>
        </div>
        <div className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${accents[accent]}`}>
          {icon}
        </div>
      </CardContent>
    </Card>
  )
}

function Row({ label, value, bold }: { label: string; value: string; bold?: boolean }) {
  return (
    <div className="flex items-center justify-between">
      <span className="text-muted-foreground">{label}</span>
      <span className={bold ? 'font-bold' : 'font-medium'}>{value}</span>
    </div>
  )
}

function QuickBtn({ children, onClick, icon }: { children: React.ReactNode; onClick: () => void; icon: React.ReactNode }) {
  return (
    <Button variant="outline" size="sm" className="w-full justify-start" onClick={onClick}>
      {icon}
      <span className="ml-2">{children}</span>
    </Button>
  )
}

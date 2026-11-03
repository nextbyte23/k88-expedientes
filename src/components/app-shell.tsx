'use client'

import { useAppStore, ViewKey } from '@/store/app-store'
import { apiPost } from '@/lib/use-api'
import { Button } from '@/components/ui/button'
import { Avatar, AvatarFallback } from '@/components/ui/avatar'
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu'
import {
  LayoutDashboard, Users, CalendarDays, FileText, HeartPulse, Pill,
  Wallet, Calculator, PackagePlus, Settings, LogOut,
  Sun, Moon, Stethoscope, ChevronRight, FilePlus2, Pencil, History, UserCircle,
  DollarSign, FileSignature,
} from 'lucide-react'
import { useTheme } from 'next-themes'
import { ROLE_LABELS } from '@/lib/roles'
import { toast } from 'sonner'
import { useState } from 'react'

type NavItem = { view: ViewKey; label: string; icon: React.ReactNode }

export function AppShell({ children }: { children: React.ReactNode }) {
  const { user, clinic, currentView, setView, logout } = useAppStore()
  const { theme, setTheme } = useTheme()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  if (!user) return null

  const navByRole: Record<string, NavItem[]> = {
    ADMIN: [
      { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { view: 'patients', label: 'Pacientes', icon: <Users className="w-4 h-4" /> },
      { view: 'appointments', label: 'Citas', icon: <CalendarDays className="w-4 h-4" /> },
      { view: 'payments', label: 'Pagos', icon: <Wallet className="w-4 h-4" /> },
      { view: 'cash-close', label: 'Cierre de caja', icon: <Calculator className="w-4 h-4" /> },
      { view: 'extra-charges', label: 'Cargos pendientes', icon: <PackagePlus className="w-4 h-4" /> },
      { view: 'users', label: 'Usuarios', icon: <Users className="w-4 h-4" /> },
      { view: 'services', label: 'Catálogo de servicios', icon: <DollarSign className="w-4 h-4" /> },
      { view: 'clinic', label: 'Configuración clínica', icon: <Settings className="w-4 h-4" /> },
    ],
    RECEPTION: [
      { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { view: 'patients', label: 'Pacientes', icon: <Users className="w-4 h-4" /> },
      { view: 'appointments', label: 'Citas', icon: <CalendarDays className="w-4 h-4" /> },
      { view: 'extra-charges', label: 'Cargos pendientes', icon: <PackagePlus className="w-4 h-4" /> },
      { view: 'payments', label: 'Pagos', icon: <Wallet className="w-4 h-4" /> },
      { view: 'cash-close', label: 'Cierre de caja', icon: <Calculator className="w-4 h-4" /> },
    ],
    DENTAL_DOCTOR: [
      { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { view: 'appointments', label: 'Mis citas', icon: <CalendarDays className="w-4 h-4" /> },
      { view: 'patients', label: 'Mis pacientes', icon: <Users className="w-4 h-4" /> },
      { view: 'dental-records', label: 'Expedientes dentales', icon: <FileText className="w-4 h-4" /> },
      { view: 'evolution-notes', label: 'Notas de evolución', icon: <FilePlus2 className="w-4 h-4" /> },
      { view: 'prescriptions', label: 'Recetas', icon: <Pill className="w-4 h-4" /> },
      { view: 'consents', label: 'Consentimientos', icon: <FileSignature className="w-4 h-4" /> },
      { view: 'extra-charges', label: 'Cargos extra', icon: <PackagePlus className="w-4 h-4" /> },
    ],
    GENERAL_DOCTOR: [
      { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { view: 'appointments', label: 'Mis citas', icon: <CalendarDays className="w-4 h-4" /> },
      { view: 'patients', label: 'Mis pacientes', icon: <Users className="w-4 h-4" /> },
      { view: 'medical-records', label: 'Expedientes clínicos', icon: <FileText className="w-4 h-4" /> },
      { view: 'evolution-notes', label: 'Notas de evolución', icon: <FilePlus2 className="w-4 h-4" /> },
      { view: 'prescriptions', label: 'Recetas', icon: <Pill className="w-4 h-4" /> },
      { view: 'consents', label: 'Consentimientos', icon: <FileSignature className="w-4 h-4" /> },
      { view: 'extra-charges', label: 'Cargos extra', icon: <PackagePlus className="w-4 h-4" /> },
    ],
    SPECIALIST_DOCTOR: [
      { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { view: 'appointments', label: 'Mis citas', icon: <CalendarDays className="w-4 h-4" /> },
      { view: 'patients', label: 'Mis pacientes', icon: <Users className="w-4 h-4" /> },
      { view: 'medical-records', label: 'Expedientes clínicos', icon: <FileText className="w-4 h-4" /> },
      { view: 'evolution-notes', label: 'Notas de evolución', icon: <FilePlus2 className="w-4 h-4" /> },
      { view: 'prescriptions', label: 'Recetas', icon: <Pill className="w-4 h-4" /> },
      { view: 'consents', label: 'Consentimientos', icon: <FileSignature className="w-4 h-4" /> },
      { view: 'extra-charges', label: 'Cargos extra', icon: <PackagePlus className="w-4 h-4" /> },
    ],
    COORDINATOR: [
      { view: 'dashboard', label: 'Dashboard', icon: <LayoutDashboard className="w-4 h-4" /> },
      { view: 'patients', label: 'Pacientes', icon: <Users className="w-4 h-4" /> },
      { view: 'medical-records', label: 'Expedientes médicos', icon: <Stethoscope className="w-4 h-4" /> },
      { view: 'dental-records', label: 'Expedientes dentales', icon: <HeartPulse className="w-4 h-4" /> },
      { view: 'evolution-notes', label: 'Notas de evolución', icon: <FilePlus2 className="w-4 h-4" /> },
      { view: 'prescriptions', label: 'Recetas', icon: <Pill className="w-4 h-4" /> },
      { view: 'corrections', label: 'Correcciones', icon: <History className="w-4 h-4" /> },
    ],
  }

  const items = navByRole[user.role] || []
  const displayName = user.doctorProfile?.fullName || user.email
  const initials = displayName.split(' ').slice(0, 2).map((s) => s[0]).join('').toUpperCase()

  async function handleLogout() {
    try {
      await apiPost('/api/auth/logout', {})
    } catch {}
    logout()
    toast.success('Sesión cerrada')
  }

  const sidebar = (
    <aside className="w-64 shrink-0 border-r border-border bg-sidebar text-sidebar-foreground h-full flex flex-col">
      <div className="p-4 border-b border-sidebar-border">
        <div className="flex items-center gap-2">
          <div className="w-9 h-9 rounded-lg bg-teal-600 text-white flex items-center justify-center shrink-0">
            <HeartPulse className="w-5 h-5" />
          </div>
          <div className="min-w-0">
            <p className="font-semibold text-sm truncate">{clinic?.name || 'Clínica'}</p>
            <p className="text-xs text-muted-foreground truncate">Expedientes clínicos</p>
          </div>
        </div>
      </div>
      <nav className="flex-1 p-3 overflow-y-auto thin-scroll">
        <ul className="space-y-1">
          {items.map((item) => (
            <li key={item.view}>
              <button
                onClick={() => {
                  setView(item.view)
                  setSidebarOpen(false)
                }}
                className={`w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm font-medium transition ${
                  currentView === item.view || (item.view === 'patients' && currentView === 'patient-detail')
                    ? 'bg-sidebar-accent text-sidebar-accent-foreground'
                    : 'text-sidebar-foreground hover:bg-sidebar-accent/60'
                }`}
              >
                {item.icon}
                <span className="flex-1 text-left">{item.label}</span>
                {currentView === item.view && <ChevronRight className="w-4 h-4" />}
              </button>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-3 border-t border-sidebar-border text-xs text-muted-foreground space-y-1">
        <p className="truncate">{clinic?.address || '—'}</p>
        <p className="truncate">{clinic?.phone || '—'}</p>
        <p className="pt-1.5 mt-1.5 border-t border-sidebar-border/60 text-center">
          <span className="opacity-70">Designed by </span>
          <a
            href="https://nextbyte.mx"
            target="_blank"
            rel="noopener noreferrer"
            className="font-semibold text-teal-600 dark:text-teal-400 hover:underline"
          >
            NextByte
          </a>
        </p>
      </div>
    </aside>
  )

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Mobile top bar */}
      <div className="md:hidden flex items-center justify-between p-3 border-b border-border bg-card">
        <button
          onClick={() => setSidebarOpen((o) => !o)}
          className="p-2 rounded-md hover:bg-muted"
          aria-label="Menú"
        >
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <line x1="3" y1="6" x2="21" y2="6" />
            <line x1="3" y1="12" x2="21" y2="12" />
            <line x1="3" y1="18" x2="21" y2="18" />
          </svg>
        </button>
        <div className="font-semibold text-sm">{clinic?.name}</div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Avatar className="w-8 h-8 cursor-pointer">
              <AvatarFallback className="text-xs bg-teal-600 text-white">{initials}</AvatarFallback>
            </Avatar>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel className="text-xs">{displayName}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}>
              {theme === 'dark' ? <Sun className="w-4 h-4 mr-2" /> : <Moon className="w-4 h-4 mr-2" />}
              Cambiar tema
            </DropdownMenuItem>
            <DropdownMenuItem onClick={() => setView('my-profile')}>
              <UserCircle className="w-4 h-4 mr-2" /> Mi perfil
            </DropdownMenuItem>
            <DropdownMenuItem onClick={handleLogout} className="text-rose-600">
              <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <div className="flex flex-1 min-h-0">
        {/* Desktop sidebar */}
        <div className="hidden md:block">{sidebar}</div>

        {/* Mobile sidebar (drawer) */}
        {sidebarOpen && (
          <div className="md:hidden fixed inset-0 z-50 flex">
            <div className="absolute inset-0 bg-black/40" onClick={() => setSidebarOpen(false)} />
            <div className="relative z-10">{sidebar}</div>
          </div>
        )}

        <main className="flex-1 min-w-0 flex flex-col">
          {/* Desktop top bar */}
          <header className="hidden md:flex items-center justify-between px-6 py-3 border-b border-border bg-card">
            <div>
              <p className="text-sm text-muted-foreground">
                {ROLE_LABELS[user.role as keyof typeof ROLE_LABELS]}
              </p>
              <h2 className="text-lg font-semibold">{displayName}</h2>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={() => setTheme(theme === 'dark' ? 'light' : 'dark')}
                aria-label="Cambiar tema"
              >
                {theme === 'dark' ? <Sun className="w-4 h-4" /> : <Moon className="w-4 h-4" />}
              </Button>
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="flex items-center gap-2 px-2 py-1 rounded-md hover:bg-muted">
                    <Avatar className="w-8 h-8">
                      <AvatarFallback className="text-xs bg-teal-600 text-white">{initials}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium">{displayName.split(' ').slice(0, 2).join(' ')}</span>
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end">
                  <DropdownMenuLabel className="text-xs">{user.email}</DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={() => setView('my-profile')}>
                    <UserCircle className="w-4 h-4 mr-2" /> Mi perfil
                  </DropdownMenuItem>
                  <DropdownMenuItem onClick={handleLogout} className="text-rose-600">
                    <LogOut className="w-4 h-4 mr-2" /> Cerrar sesión
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          </header>

          {/* Content */}
          <div className="flex-1 overflow-y-auto thin-scroll">{children}</div>

          {/* Sticky footer */}
          <footer className="mt-auto py-3 px-6 border-t border-border bg-card text-xs text-muted-foreground">
            <div className="flex flex-wrap items-center justify-between gap-2">
              <span>© {new Date().getFullYear()} {clinic?.name || 'Clínica'}</span>
              <span>{clinic?.address} · {clinic?.phone}</span>
            </div>
          </footer>
        </main>
      </div>
    </div>
  )
}

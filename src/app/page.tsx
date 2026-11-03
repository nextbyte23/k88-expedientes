'use client'

import { useEffect, useState } from 'react'
import { useStore } from '@/store/app-store'
import { Providers } from '@/components/providers'
import { Login } from '@/components/login'
import { AppShell } from '@/components/app-shell'
import { Dashboard } from '@/components/dashboard'
import { PatientList } from '@/components/patients/patient-list'
import { PatientDetail } from '@/components/patients/patient-detail'
import { AppointmentList } from '@/components/appointments/appointment-list'
import { MedicalRecordsList, DentalRecordsList } from '@/components/medical/records-list'
import { MedicalRecordForm } from '@/components/medical/medical-record-form'
import { DentalRecordForm } from '@/components/dental/dental-record-form'
import { EvolutionNotesList, PrescriptionsList } from '@/components/notes/notes-list'
import { EvolutionNoteForm } from '@/components/notes/evolution-note-form'
import { PrescriptionForm } from '@/components/prescriptions/prescription-form'
import { PaymentList } from '@/components/payments/payment-list'
import { BillingList } from '@/components/billing/billing-list'
import { CashCloseView } from '@/components/cash-close/cash-close-view'
import { ExtraChargeList } from '@/components/extra-charges/extra-charge-list'
import { UsersList } from '@/components/users/users-list'
import { ClinicForm } from '@/components/clinic/clinic-form'
import { CorrectionsList } from '@/components/notes/corrections-list'
import { MyProfile } from '@/components/my-profile'
import { ServiceCatalog } from '@/components/services/service-catalog'
import { ConsentList } from '@/components/consents/consent-list'
import { useApi } from '@/lib/use-api'

function AppContent() {
  const { user, currentView, selectedPatientId } = useStore()

  if (!user) return <Login />

  let content: React.ReactNode = null
  switch (currentView) {
    case 'dashboard':
      content = <Dashboard />
      break
    case 'patients':
      content = <PatientList />
      break
    case 'patient-detail':
      content = <PatientDetail key={selectedPatientId} />
      break
    case 'appointments':
      content = <AppointmentList />
      break
    case 'medical-records':
      content = <MedicalRecordsList />
      break
    case 'dental-records':
      content = <DentalRecordsList />
      break
    case 'evolution-notes':
      content = <EvolutionNotesList />
      break
    case 'prescriptions':
      content = <PrescriptionsList />
      break
    case 'payments':
      content = <PaymentList />
      break
    case 'billing':
      content = <BillingList />
      break
    case 'cash-close':
      content = <CashCloseView />
      break
    case 'extra-charges':
      content = <ExtraChargeList />
      break
    case 'users':
      content = <UsersList />
      break
    case 'clinic':
      content = <ClinicForm />
      break
    case 'corrections':
      content = <CorrectionsList />
      break
    case 'my-profile':
      content = <MyProfile />
      break
    case 'services':
      content = <ServiceCatalog />
      break
    case 'consents':
      content = <ConsentList />
      break
    default:
      content = <Dashboard />
  }

  return <AppShell>{content}</AppShell>
}

function AuthGate() {
  const { user, setUser, setClinic } = useStore()
  const { data, isLoading, isError } = useApi<{ user: any; clinic: any } | null>(
    ['me'],
    '/api/auth/me',
  )

  const checked = !isLoading || !!user || isError
  // Sync the authenticated user into the Zustand store once the session resolves.
  // This is a one-shot mirror from the query cache to global state (used by logout
  // and the app-shell). It does NOT cause cascading renders because the data
  // stabilizes after a single fetch.
  useEffect(() => {
    if (!isLoading && data) {
      setUser(data.user)
      setClinic(data.clinic)
    } else if (isError) {
      setUser(null)
    }
  }, [data, isLoading, isError, setUser, setClinic])

  if (!checked) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-muted-foreground text-sm">Cargando…</div>
      </div>
    )
  }

  return <AppContent />
}

export default function Home() {
  return (
    <Providers>
      <AuthGate />
    </Providers>
  )
}

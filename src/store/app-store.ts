'use client'

import { create } from 'zustand'

export type ViewKey =
  | 'dashboard'
  | 'patients'
  | 'patient-detail'
  | 'appointments'
  | 'medical-records'
  | 'medical-record-form'
  | 'dental-records'
  | 'dental-record-form'
  | 'evolution-notes'
  | 'evolution-note-form'
  | 'prescriptions'
  | 'prescription-form'
  | 'payments'
  | 'billing'
  | 'cash-close'
  | 'extra-charges'
  | 'users'
  | 'clinic'
  | 'corrections'
  | 'my-profile'

export type ClinicData = {
  id: string
  name: string
  address: string
  phone: string
  email: string | null
  rfc: string | null
  fiscalAddress: string | null
  logoUrl: string | null
}

export type UserData = {
  id: string
  email: string
  role: string
  active: boolean
  doctorProfile?: {
    id: string
    fullName: string
    career: string
    specialty: string | null
    professionalLicense: string
  } | null
}

interface AppState {
  user: UserData | null
  clinic: ClinicData | null
  currentView: ViewKey
  selectedPatientId: string | null
  selectedRecordId: string | null
  setUser: (u: UserData | null) => void
  setClinic: (c: ClinicData | null) => void
  setView: (v: ViewKey) => void
  selectPatient: (id: string) => void
  selectRecord: (id: string | null) => void
  logout: () => void
}

export const useAppStore = create<AppState>((set) => ({
  user: null,
  clinic: null,
  currentView: 'dashboard',
  selectedPatientId: null,
  selectedRecordId: null,
  setUser: (u) => set({ user: u }),
  setClinic: (c) => set({ clinic: c }),
  setView: (v) => set({ currentView: v }),
  selectPatient: (id) => set({ selectedPatientId: id, currentView: 'patient-detail' }),
  selectRecord: (id) => set({ selectedRecordId: id }),
  logout: () => set({ user: null, clinic: null, currentView: 'dashboard', selectedPatientId: null, selectedRecordId: null }),
}))

// Convenience alias used across the UI components
export const useStore = useAppStore

export type Role =
  | 'ADMIN'
  | 'RECEPTION'
  | 'DENTAL_DOCTOR'
  | 'GENERAL_DOCTOR'
  | 'SPECIALIST_DOCTOR'
  | 'COORDINATOR'

export const ALL_ROLES: Role[] = [
  'ADMIN',
  'RECEPTION',
  'DENTAL_DOCTOR',
  'GENERAL_DOCTOR',
  'SPECIALIST_DOCTOR',
  'COORDINATOR',
]

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: 'Administrador',
  RECEPTION: 'Recepción',
  DENTAL_DOCTOR: 'Odontólogo',
  GENERAL_DOCTOR: 'Médico General',
  SPECIALIST_DOCTOR: 'Especialista',
  COORDINATOR: 'Coordinador Médico',
}

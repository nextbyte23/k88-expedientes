// Shared TypeScript types — Prisma uses String enums; we enforce union types here.

export type Role =
  | "ADMIN"
  | "RECEPTION"
  | "DENTAL_DOCTOR"
  | "GENERAL_DOCTOR"
  | "SPECIALIST_DOCTOR"
  | "COORDINATOR";

export const ROLE_LABELS: Record<Role, string> = {
  ADMIN: "Administrador",
  RECEPTION: "Recepción",
  DENTAL_DOCTOR: "Odontólogo",
  GENERAL_DOCTOR: "Médico General",
  SPECIALIST_DOCTOR: "Médico Especialista",
  COORDINATOR: "Coordinador Médico",
};

export const ROLE_BADGE_COLORS: Record<Role, string> = {
  ADMIN: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  RECEPTION: "bg-teal-100 text-teal-700 dark:bg-teal-900/40 dark:text-teal-300",
  DENTAL_DOCTOR: "bg-rose-100 text-rose-700 dark:bg-rose-900/40 dark:text-rose-300",
  GENERAL_DOCTOR: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  SPECIALIST_DOCTOR: "bg-emerald-100 text-emerald-700 dark:bg-emerald-900/40 dark:text-emerald-300",
  COORDINATOR: "bg-amber-100 text-amber-700 dark:bg-amber-900/40 dark:text-amber-300",
};

export type AppointmentStatus =
  | "SCHEDULED"
  | "IN_PROGRESS"
  | "COMPLETED"
  | "CANCELLED"
  | "NO_SHOW";

export const APPOINTMENT_STATUS_LABELS: Record<AppointmentStatus, string> = {
  SCHEDULED: "Programada",
  IN_PROGRESS: "En consulta",
  COMPLETED: "Completada",
  CANCELLED: "Cancelada",
  NO_SHOW: "No asistió",
};

export type PaymentStatus = "PAID" | "PARTIAL" | "PENDING";
export const PAYMENT_STATUS_LABELS: Record<PaymentStatus, string> = {
  PAID: "Pagado",
  PARTIAL: "Parcial",
  PENDING: "Pendiente",
};

export type PaymentMethod = "CASH" | "TRANSFER" | "CARD";
export const PAYMENT_METHOD_LABELS: Record<PaymentMethod, string> = {
  CASH: "Efectivo",
  TRANSFER: "Transferencia",
  CARD: "Tarjeta",
};

export type PaymentConcept =
  | "CONSULTATION"
  | "TREATMENT"
  | "MEDICATION"
  | "STUDY"
  | "OTHER";

export const PAYMENT_CONCEPT_LABELS: Record<PaymentConcept, string> = {
  CONSULTATION: "Consulta",
  TREATMENT: "Tratamiento",
  MEDICATION: "Medicamento",
  STUDY: "Estudio",
  OTHER: "Otro",
};

export type ExtraChargeStatus = "PENDING" | "APPLIED";
export const EXTRA_CHARGE_STATUS_LABELS: Record<ExtraChargeStatus, string> = {
  PENDING: "Pendiente",
  APPLIED: "Aplicado",
};

export type BillingStatus = "ISSUED" | "CANCELLED";
export const BILLING_STATUS_LABELS: Record<BillingStatus, string> = {
  ISSUED: "Emitida",
  CANCELLED: "Cancelada",
};

export type CashCloseStatus = "OPEN" | "CLOSED";
export const CASH_CLOSE_STATUS_LABELS: Record<CashCloseStatus, string> = {
  OPEN: "Abierta",
  CLOSED: "Cerrada",
};

export type CorrectionRecordType =
  | "MEDICAL_RECORD"
  | "DENTAL_RECORD"
  | "EVOLUTION_NOTE"
  | "PRESCRIPTION";

export const CORRECTION_RECORD_TYPE_LABELS: Record<CorrectionRecordType, string> = {
  MEDICAL_RECORD: "Expediente médico",
  DENTAL_RECORD: "Expediente dental",
  EVOLUTION_NOTE: "Nota de evolución",
  PRESCRIPTION: "Receta",
};

export type ToothState =
  | "SANO"
  | "CARIES"
  | "OBTURADO"
  | "AUSENTE"
  | "CORONA"
  | "ENDODONCIA"
  | "EXTRACCION_INDICADA"
  | "OTRO";

export const TOOTH_STATE_LABELS: Record<ToothState, string> = {
  SANO: "Sano",
  CARIES: "Caries",
  OBTURADO: "Obturado",
  AUSENTE: "Ausente",
  CORONA: "Corona",
  ENDODONCIA: "Endodoncia",
  EXTRACCION_INDICADA: "Extracción indicada",
  OTRO: "Otro",
};

export const TOOTH_STATE_COLORS: Record<ToothState, string> = {
  SANO: "#ffffff",
  CARIES: "#dc2626",
  OBTURADO: "#2563eb",
  AUSENTE: "#6b7280",
  CORONA: "#facc15",
  ENDODONCIA: "#7c3aed",
  EXTRACCION_INDICADA: "#ea580c",
  OTRO: "#0891b2",
};

export type ToothSurface =
  | "MESIAL"
  | "DISTAL"
  | "OCLUSAL"
  | "VESTIBULAR"
  | "LINGUAL";

export const TOOTH_SURFACE_LABELS: Record<ToothSurface, string> = {
  MESIAL: "Mesial",
  DISTAL: "Distal",
  OCLUSAL: "Oclusal",
  VESTIBULAR: "Vestibular",
  LINGUAL: "Lingual/Palatino",
};

export interface OdontogramEntry {
  toothNumber: number;
  state: ToothState;
  surfaces: ToothSurface[];
  notes?: string;
}

export interface VitalSigns {
  bp?: string; // blood pressure "120/80"
  hr?: string; // heart rate
  rr?: string; // respiratory rate
  temp?: string; // temperature °C
  weight?: string; // kg
  height?: string; // cm
  spo2?: string; // oxygen saturation %
}

// Frontend-safe user (no passwordHash)
export interface SafeUser {
  id: string;
  email: string;
  role: Role;
  active: boolean;
  profile?: {
    id: string;
    fullName: string;
    career: string;
    specialty?: string | null;
    professionalLicense: string;
  } | null;
}

export const DOCTOR_ROLES: Role[] = [
  "DENTAL_DOCTOR",
  "GENERAL_DOCTOR",
  "SPECIALIST_DOCTOR",
];

export const CLINICAL_ROLES: Role[] = [
  "DENTAL_DOCTOR",
  "GENERAL_DOCTOR",
  "SPECIALIST_DOCTOR",
  "COORDINATOR",
];

export function isDoctor(role: string): boolean {
  return (DOCTOR_ROLES as string[]).includes(role);
}

export function canEditClinical(role: string): boolean {
  return (["DENTAL_DOCTOR", "GENERAL_DOCTOR", "SPECIALIST_DOCTOR"] as string[]).includes(role);
}

// Currency & date formatting helpers (es-MX)
export function formatCurrency(amount: number): string {
  return new Intl.NumberFormat("es-MX", {
    style: "currency",
    currency: "MXN",
  }).format(amount || 0);
}

export function formatDate(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  }).format(d);
}

export function formatDateTime(date: Date | string): string {
  const d = typeof date === "string" ? new Date(date) : date;
  return new Intl.DateTimeFormat("es-MX", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  }).format(d);
}

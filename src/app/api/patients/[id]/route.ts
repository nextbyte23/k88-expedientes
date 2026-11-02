import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, notFound, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(_req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'RECEPTION', 'DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'COORDINATOR'])
    const { id } = await params
    const patient = await db.patient.findUnique({
      where: { id },
      include: {
        appointments: { include: { doctor: { include: { doctorProfile: true } } }, orderBy: { dateTime: 'desc' } },
        medicalRecords: { include: { doctor: { include: { doctorProfile: true } } }, orderBy: { date: 'desc' } },
        dentalRecords: { include: { doctor: { include: { doctorProfile: true } } }, orderBy: { date: 'desc' } },
        evolutionNotes: { include: { doctor: { include: { doctorProfile: true } } }, orderBy: { date: 'desc' } },
        prescriptions: { include: { doctor: { include: { doctorProfile: true } }, items: true }, orderBy: { date: 'desc' } },
        payments: { include: { items: true, methods: true, receptionist: true }, orderBy: { date: 'desc' } },
        extraCharges: { include: { doctor: { include: { doctorProfile: true } } }, orderBy: { createdAt: 'desc' } },
      },
    })
    if (!patient) return notFound('Paciente no encontrado')
    return ok(patient)
  })
}

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'RECEPTION'])
    const { id } = await params
    const body = await parseBody(req)
    const { firstName, lastName, birthDate, gender, phone, email, address, bloodType, allergies, emergencyContact } = body
    const existing = await db.patient.findUnique({ where: { id } })
    if (!existing) return notFound('Paciente no encontrado')
    const patient = await db.patient.update({
      where: { id },
      data: {
        firstName: firstName ?? existing.firstName,
        lastName: lastName ?? existing.lastName,
        birthDate: birthDate ? new Date(birthDate) : existing.birthDate,
        gender: gender ?? existing.gender,
        phone: phone ?? existing.phone,
        email: email ?? existing.email,
        address: address ?? existing.address,
        bloodType: bloodType ?? existing.bloodType,
        allergies: allergies ?? existing.allergies,
        emergencyContact: emergencyContact ?? existing.emergencyContact,
      },
    })
    return ok(patient)
  })
}

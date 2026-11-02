import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { bad, handleErrors, ok, parseBody } from '@/lib/api'

export const runtime = 'nodejs'

export async function GET(req: NextRequest) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'RECEPTION', 'DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR', 'COORDINATOR'])
    const url = new URL(req.url)
    const search = url.searchParams.get('search') || ''
    const where = search
      ? {
          OR: [
            { firstName: { contains: search } },
            { lastName: { contains: search } },
            { phone: { contains: search } },
            { email: { contains: search } },
          ],
        }
      : {}
    const patients = await db.patient.findMany({
      where,
      orderBy: { createdAt: 'desc' },
    })
    return ok(patients)
  })
}

export async function POST(req: NextRequest) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'RECEPTION', 'DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR'])
    const body = await parseBody(req)
    const { firstName, lastName, birthDate, gender, phone, email, address, bloodType, allergies, emergencyContact } = body
    if (!firstName || !lastName || !birthDate || !gender || !phone) {
      return bad('Nombre, apellidos, fecha de nacimiento, género y teléfono son obligatorios')
    }
    const patient = await db.patient.create({
      data: {
        firstName,
        lastName,
        birthDate: new Date(birthDate),
        gender,
        phone,
        email: email || null,
        address: address || null,
        bloodType: bloodType || null,
        allergies: allergies || null,
        emergencyContact: emergencyContact || null,
      },
    })
    return ok(patient)
  })
}

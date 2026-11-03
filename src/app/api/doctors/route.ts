import { NextRequest } from 'next/server'
import { db } from '@/lib/db'
import { requireRole } from '@/lib/auth'
import { handleErrors, ok } from '@/lib/api'

export const runtime = 'nodejs'

// Returns only users with medical roles (DENTAL_DOCTOR, GENERAL_DOCTOR, SPECIALIST_DOCTOR)
// with their doctorProfile. Accessible to Reception (to assign appointments),
// Admin, Coordinator, and other doctors (for interconsultation, etc.)
export async function GET(_req: NextRequest) {
  return handleErrors(async () => {
    await requireRole(['ADMIN', 'RECEPTION', 'COORDINATOR', 'DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR'])
    const doctors = await db.user.findMany({
      where: {
        active: true,
        role: { in: ['DENTAL_DOCTOR', 'GENERAL_DOCTOR', 'SPECIALIST_DOCTOR'] },
      },
      include: { doctorProfile: true },
      orderBy: { email: 'asc' },
    })
    // Strip passwordHash
    const safe = doctors.map((u) => {
      const { passwordHash, ...rest } = u
      return rest
    })
    return ok(safe)
  })
}

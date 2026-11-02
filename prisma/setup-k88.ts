// Script de configuración inicial para Clínica K88
// Centro Integral Odontológico y Especialidades Médicas
// Tapachula, Chiapas

import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  console.log('🔧 Configurando Clínica K88...')

  // 1. Actualizar la clínica con datos reales
  const existingClinic = await prisma.clinic.findFirst()
  if (!existingClinic) {
    console.error('❌ No existe la clínica en la BD. Corre primero prisma/seed.ts')
    process.exit(1)
  }

  const clinic = await prisma.clinic.update({
    where: { id: existingClinic.id },
    data: {
      name: 'K88 Centro Integral Odontológico y Especialidades Médicas',
      address: '3ª Avenida Sur (frente a la Unidad Administrativa y a un costado de Farmacia Guadalajara), Tapachula, Chiapas',
      phone: '962 167 9384',
      email: 'k88.tapachula@gmail.com',
      rfc: null, // Por capturar
      fiscalAddress: null, // Por capturar
    },
  })
  console.log(`✓ Clínica actualizada: ${clinic.name}`)
  console.log(`  Dirección: ${clinic.address}`)
  console.log(`  Teléfono: ${clinic.phone}`)

  // 2. Actualizar usuarios existentes y crear los nuevos
  const passwordHash = await bcrypt.hash('demo1234', 10)

  // Mapeo de usuarios existentes → nuevos correos/roles/perfiles
  // El sistema actual tiene 6 usuarios demo; los reconfiguramos a la estructura K88
  const usersConfig = [
    // Administrador (1)
    {
      oldEmail: 'admin@clinicasantafe.mx',
      newEmail: 'admin@k88.mx',
      role: 'ADMIN',
      profile: null,
    },
    // Recepcionista (1)
    {
      oldEmail: 'recepcion@clinicasantafe.mx',
      newEmail: 'recepcion@k88.mx',
      role: 'RECEPTION',
      profile: null,
    },
    // Odontólogo 1 (uno de los 4 — este usuario también usa la cuenta de coordinador)
    {
      oldEmail: 'odontologo@clinicasantafe.mx',
      newEmail: 'odontologo1@k88.mx',
      role: 'DENTAL_DOCTOR',
      profile: {
        fullName: 'Odontólogo(a) K88 #1',
        career: 'Cirujano(a) Dentista',
        specialty: 'Odontología General',
        professionalLicense: '00000001',
      },
    },
    // Odontólogo 2
    {
      oldEmail: 'general@clinicasantafe.mx',
      newEmail: 'odontologo2@k88.mx',
      role: 'DENTAL_DOCTOR',
      profile: {
        fullName: 'Odontólogo(a) K88 #2',
        career: 'Cirujano(a) Dentista',
        specialty: 'Odontología General',
        professionalLicense: '00000002',
      },
    },
    // Médico General 1 (era el especialista demo)
    {
      oldEmail: 'especialista@clinicasantafe.mx',
      newEmail: 'medico1@k88.mx',
      role: 'GENERAL_DOCTOR',
      profile: {
        fullName: 'Médico(a) General K88 #1',
        career: 'Médico(a) Cirujano(a)',
        specialty: 'Medicina General',
        professionalLicense: '00000003',
      },
    },
    // Coordinador Médico (lo usará uno de los odontólogos)
    {
      oldEmail: 'coordinador@clinicasantafe.mx',
      newEmail: 'coordinador@k88.mx',
      role: 'COORDINATOR',
      profile: null,
    },
  ]

  // Actualizar cada usuario existente
  for (const u of usersConfig) {
    const existing = await prisma.user.findUnique({ where: { email: u.oldEmail } })
    if (!existing) {
      console.log(`  ⚠️  Usuario ${u.oldEmail} no encontrado, saltando...`)
      continue
    }
    // Si el rol cambia de doctor a no-doctor, borrar el perfil previo
    const isDoctorRole = u.role === 'DENTAL_DOCTOR' || u.role === 'GENERAL_DOCTOR' || u.role === 'SPECIALIST_DOCTOR'
    if (!isDoctorRole && existing.role !== u.role) {
      // Era doctor, ahora no — borrar doctorProfile si existe
      await prisma.doctorProfile.deleteMany({ where: { userId: existing.id } })
    }
    // Actualizar el usuario
    await prisma.user.update({
      where: { id: existing.id },
      data: {
        email: u.newEmail,
        role: u.role,
        passwordHash,
        active: true,
      },
    })
    // Si es doctor, actualizar o crear su doctorProfile
    if (isDoctorRole && u.profile) {
      const existingProfile = await prisma.doctorProfile.findUnique({ where: { userId: existing.id } })
      if (existingProfile) {
        await prisma.doctorProfile.update({
          where: { userId: existing.id },
          data: u.profile,
        })
      } else {
        await prisma.doctorProfile.create({
          data: {
            userId: existing.id,
            ...u.profile,
          },
        })
      }
    }
    console.log(`  ✓ ${u.newEmail} (${u.role})`)
  }

  // Crear usuarios nuevos que no existían
  // Odontólogos 3 y 4 (no existían en la seed)
  const newDoctors = [
    {
      email: 'odontologo3@k88.mx',
      role: 'DENTAL_DOCTOR',
      profile: {
        fullName: 'Odontólogo(a) K88 #3',
        career: 'Cirujano(a) Dentista',
        specialty: 'Odontología General',
        professionalLicense: '00000004',
      },
    },
    {
      email: 'odontologo4@k88.mx',
      role: 'DENTAL_DOCTOR',
      profile: {
        fullName: 'Odontólogo(a) K88 #4',
        career: 'Cirujano(a) Dentista',
        specialty: 'Odontología General',
        professionalLicense: '00000005',
      },
    },
    // Médico General 2
    {
      email: 'medico2@k88.mx',
      role: 'GENERAL_DOCTOR',
      profile: {
        fullName: 'Médico(a) General K88 #2',
        career: 'Médico(a) Cirujano(a)',
        specialty: 'Medicina General',
        professionalLicense: '00000006',
      },
    },
  ]

  for (const u of newDoctors) {
    const existing = await prisma.user.findUnique({ where: { email: u.email } })
    if (existing) {
      console.log(`  ⚠️  ${u.email} ya existe, saltando...`)
      continue
    }
    await prisma.user.create({
      data: {
        email: u.email,
        passwordHash,
        role: u.role,
        active: true,
        doctorProfile: {
          create: u.profile!,
        },
      },
    })
    console.log(`  ✓ ${u.email} (${u.role}) [nuevo]`)
  }

  // Cerrar sesiones existentes para forzar re-login con los nuevos correos
  await prisma.session.deleteMany()
  console.log('✓ Sesiones cerradas (todos deben iniciar sesión de nuevo)')

  // Resumen final
  const users = await prisma.user.findMany({
    where: { active: true },
    include: { doctorProfile: true },
    orderBy: { role: 'asc' },
  })
  console.log('\n========================================')
  console.log('📋 Resumen de cuentas K88 (password: demo1234)')
  console.log('========================================')
  for (const u of users) {
    const profileName = u.doctorProfile?.fullName || '—'
    console.log(`  ${u.role.padEnd(20)} ${u.email.padEnd(28)} ${profileName}`)
  }
  console.log('========================================')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

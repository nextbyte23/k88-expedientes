import { PrismaClient } from '@prisma/client'
import bcrypt from 'bcryptjs'

const prisma = new PrismaClient()

async function main() {
  // Limpiar datos existentes
  await prisma.session.deleteMany()
  await prisma.correctionLog.deleteMany()
  await prisma.prescriptionItem.deleteMany()
  await prisma.prescription.deleteMany()
  await prisma.evolutionNote.deleteMany()
  await prisma.dentalRecord.deleteMany()
  await prisma.medicalRecord.deleteMany()
  await prisma.billing.deleteMany()
  await prisma.paymentMethodBreakdown.deleteMany()
  await prisma.paymentItem.deleteMany()
  await prisma.payment.deleteMany()
  await prisma.extraCharge.deleteMany()
  await prisma.cashClose.deleteMany()
  await prisma.appointment.deleteMany()
  await prisma.doctorProfile.deleteMany()
  await prisma.user.deleteMany()
  await prisma.patient.deleteMany()
  await prisma.clinic.deleteMany()

  // Clínica
  const clinic = await prisma.clinic.create({
    data: {
      name: 'Clínica Santa Fe',
      address: 'Av. Insurgentes Sur 1234, Col. Del Valle, CDMX',
      phone: '55 1234 5678',
      email: 'info@clinicasantafe.mx',
      rfc: 'CSF850101AB1',
      fiscalAddress: 'Av. Insurgentes Sur 1234, Col. Del Valle, Benito Juárez, CDMX, C.P. 03100',
    },
  })

  const passwordHash = await bcrypt.hash('demo1234', 10)

  // Usuarios por rol
  const admin = await prisma.user.create({
    data: { email: 'admin@clinicasantafe.mx', passwordHash, role: 'ADMIN' },
  })
  const reception = await prisma.user.create({
    data: { email: 'recepcion@clinicasantafe.mx', passwordHash, role: 'RECEPTION' },
  })
  const dental = await prisma.user.create({
    data: { email: 'odontologo@clinicasantafe.mx', passwordHash, role: 'DENTAL_DOCTOR' },
  })
  const general = await prisma.user.create({
    data: { email: 'general@clinicasantafe.mx', passwordHash, role: 'GENERAL_DOCTOR' },
  })
  const specialist = await prisma.user.create({
    data: { email: 'especialista@clinicasantafe.mx', passwordHash, role: 'SPECIALIST_DOCTOR' },
  })
  const coordinator = await prisma.user.create({
    data: { email: 'coordinador@clinicasantafe.mx', passwordHash, role: 'COORDINATOR' },
  })

  // Perfiles de médicos
  await prisma.doctorProfile.create({
    data: {
      userId: dental.id,
      fullName: 'Dra. Ana López Martínez',
      career: 'Cirujana Dentista',
      specialty: 'Odontología General',
      professionalLicense: '12345678',
    },
  })
  await prisma.doctorProfile.create({
    data: {
      userId: general.id,
      fullName: 'Dr. Carlos Méndez Ruiz',
      career: 'Médico Cirujano',
      specialty: 'Medicina General',
      professionalLicense: '87654321',
    },
  })
  await prisma.doctorProfile.create({
    data: {
      userId: specialist.id,
      fullName: 'Dra. Patricia Ruiz Cortés',
      career: 'Médico Cirujano',
      specialty: 'Cardiología',
      professionalLicense: '11223344',
    },
  })

  // Pacientes de ejemplo
  const p1 = await prisma.patient.create({
    data: {
      firstName: 'Juan',
      lastName: 'Pérez García',
      birthDate: new Date('1985-04-12'),
      gender: 'M',
      phone: '55 2345 6789',
      email: 'juan.perez@example.com',
      address: 'Calle Roma 45, Col. Centro, CDMX',
      bloodType: 'O+',
      allergies: 'Penicilina',
      emergencyContact: 'María Pérez 55 9876 5432',
    },
  })
  const p2 = await prisma.patient.create({
    data: {
      firstName: 'María',
      lastName: 'González Torres',
      birthDate: new Date('1990-08-23'),
      gender: 'F',
      phone: '55 3456 7890',
      email: 'maria.gonzalez@example.com',
      address: 'Av. Reforma 100, Col. Juárez, CDMX',
      bloodType: 'A+',
      emergencyContact: 'Pedro Torres 55 1111 2222',
    },
  })
  const p3 = await prisma.patient.create({
    data: {
      firstName: 'Roberto',
      lastName: 'Hernández Cruz',
      birthDate: new Date('1978-11-05'),
      gender: 'M',
      phone: '55 4567 8901',
      address: 'Calle Sol 78, Col. Polanco, CDMX',
      bloodType: 'B+',
      allergies: 'Ninguna conocida',
    },
  })

  // Citas
  const today = new Date()
  const todayAt10 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 10, 0, 0)
  const todayAt11 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 11, 0, 0)
  const todayAt12 = new Date(today.getFullYear(), today.getMonth(), today.getDate(), 12, 30, 0)

  await prisma.appointment.create({
    data: {
      patientId: p1.id,
      doctorId: dental.id,
      dateTime: todayAt10,
      status: 'COMPLETED',
      reason: 'Limpieza dental y revisión',
    },
  })
  await prisma.appointment.create({
    data: {
      patientId: p2.id,
      doctorId: general.id,
      dateTime: todayAt11,
      status: 'COMPLETED',
      reason: 'Consulta general',
    },
  })
  await prisma.appointment.create({
    data: {
      patientId: p3.id,
      doctorId: specialist.id,
      dateTime: todayAt12,
      status: 'SCHEDULED',
      reason: 'Consulta cardiológica',
    },
  })

  // Un pago de ejemplo
  const payment = await prisma.payment.create({
    data: {
      patientId: p1.id,
      receptionistId: reception.id,
      date: today,
      totalAmount: 800,
      status: 'PAID',
      items: {
        create: [
          { concept: 'CONSULTATION', description: 'Consulta odontológica', amount: 500 },
          { concept: 'TREATMENT', description: 'Limpieza dental', amount: 300 },
        ],
      },
      methods: {
        create: [
          { method: 'CASH', amount: 300, reference: null },
          { method: 'CARD', amount: 500, reference: 'TXN-001' },
        ],
      },
    },
  })

  // Expediente médico de ejemplo (general)
  await prisma.medicalRecord.create({
    data: {
      patientId: p2.id,
      doctorId: general.id,
      recordType: 'GENERAL',
      chiefComplaint: 'Dolor de garganta y fiebre',
      currentIllness: 'Inicio de sínt hace 3 días con odinofagia, fiebre de 38.5°C',
      physicalExam: 'Faringes hiperémica, amígdalas aumentadas de tamaño, no exudado',
      diagnosis: 'Faringitis aguda',
      treatmentPlan: 'Antibiótico y antiinflamatorio, reposo 3 días',
      prognosis: 'Bueno',
      vitalSigns: JSON.stringify({ bp: '120/80', hr: '85', rr: '18', temp: '38.5', weight: '65', height: '165', spo2: '97' }),
    },
  })

  // Expediente dental de ejemplo con odontograma
  await prisma.dentalRecord.create({
    data: {
      patientId: p1.id,
      doctorId: dental.id,
      chiefComplaint: 'Revisión rutinaria',
      dentalExam: 'Piezas dentales en buen estado general. Se observa caries inicial en pieza 16.',
      diagnosis: 'Caries inicial en 16',
      treatmentPlan: 'Obturación con resina en pieza 16',
      odontogramData: JSON.stringify([
        { toothNumber: 16, state: 'CARIES', surface: ['O'], notes: 'Caries oclusal inicial' },
      ]),
    },
  })

  // Cierre de caja abierto para hoy
  const todayStr = today.toISOString().split('T')[0]
  await prisma.cashClose.create({
    data: {
      receptionistId: reception.id,
      date: todayStr,
      openingBalance: 500,
      status: 'OPEN',
    },
  })

  console.log('✓ Seed completado')
  console.log('  Clínica:', clinic.name)
  console.log('  Usuarios: 6 (admin, recepción, odontólogo, general, especialista, coordinador)')
  console.log('  Pacientes: 3 (Juan Pérez, María González, Roberto Hernández)')
  console.log('  Citas: 3 | Pago: 1 (con métodos combinados) | Expediente médico: 1 | Expediente dental: 1')
  console.log('  Cierre de caja abierto para hoy')
  console.log('  Contraseña para todos: demo1234')
}

main()
  .catch((e) => {
    console.error(e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

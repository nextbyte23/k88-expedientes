// Script para limpiar datos demo de la clínica K88
// Borra: pacientes, citas, pagos, expedientes, notas, recetas, cierres de caja, cargos, correcciones
// Conserva: usuarios K88 (9 cuentas), DoctorProfile, configuración de la clínica
//
// Uso: bun prisma/cleanup-demo.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🧹 Limpiando datos demo de K88...')
  console.log('   (Se conservan usuarios K88, DoctorProfile y configuración de la clínica)')
  console.log('')

  // Estadísticas antes de limpiar
  const before = {
    patients: await prisma.patient.count(),
    appointments: await prisma.appointment.count(),
    payments: await prisma.payment.count(),
    medicalRecords: await prisma.medicalRecord.count(),
    dentalRecords: await prisma.dentalRecord.count(),
    evolutionNotes: await prisma.evolutionNote.count(),
    prescriptions: await prisma.prescription.count(),
    billings: await prisma.billing.count(),
    cashCloses: await prisma.cashClose.count(),
    extraCharges: await prisma.extraCharge.count(),
    corrections: await prisma.correctionLog.count(),
    sessions: await prisma.session.count(),
  }

  console.log('📊 Registros antes de limpiar:')
  for (const [k, v] of Object.entries(before)) {
    console.log(`   ${k.padEnd(20)} ${v}`)
  }
  console.log('')

  // Orden de borrado respeta foreign keys
  console.log('🗑️  Borrando...')

  // 1. Correcciones (referencian User y registros)
  const corrections = await prisma.correctionLog.deleteMany()
  console.log(`   ✓ Correcciones: ${corrections.count}`)

  // 2. Items de recetas → Recetas
  const prescriptionItems = await prisma.prescriptionItem.deleteMany()
  console.log(`   ✓ Items de recetas: ${prescriptionItems.count}`)
  const prescriptions = await prisma.prescription.deleteMany()
  console.log(`   ✓ Recetas: ${prescriptions.count}`)

  // 3. Notas de evolución
  const evoNotes = await prisma.evolutionNote.deleteMany()
  console.log(`   ✓ Notas de evolución: ${evoNotes.count}`)

  // 4. Expedientes dentales y médicos
  const dental = await prisma.dentalRecord.deleteMany()
  console.log(`   ✓ Expedientes dentales: ${dental.count}`)
  const medical = await prisma.medicalRecord.deleteMany()
  console.log(`   ✓ Expedientes médicos: ${medical.count}`)

  // 5. Facturas → Methods/Items de pago → Pagos
  const billings = await prisma.billing.deleteMany()
  console.log(`   ✓ Facturas: ${billings.count}`)
  const methodBreakdowns = await prisma.paymentMethodBreakdown.deleteMany()
  console.log(`   ✓ Breakdown de métodos: ${methodBreakdowns.count}`)
  const paymentItems = await prisma.paymentItem.deleteMany()
  console.log(`   ✓ Items de pago: ${paymentItems.count}`)
  const payments = await prisma.payment.deleteMany()
  console.log(`   ✓ Pagos: ${payments.count}`)

  // 6. Cargos extra
  const charges = await prisma.extraCharge.deleteMany()
  console.log(`   ✓ Cargos extra: ${charges.count}`)

  // 7. Cierres de caja
  const cashCloses = await prisma.cashClose.deleteMany()
  console.log(`   ✓ Cierres de caja: ${cashCloses.count}`)

  // 8. Citas
  const appts = await prisma.appointment.deleteMany()
  console.log(`   ✓ Citas: ${appts.count}`)

  // 9. Pacientes (al final, después de borrar todo lo que los referencia)
  const patients = await prisma.patient.deleteMany()
  console.log(`   ✓ Pacientes: ${patients.count}`)

  // 10. Sesiones (forzar re-login)
  const sessions = await prisma.session.deleteMany()
  console.log(`   ✓ Sesiones: ${sessions.count} (todos deben iniciar sesión de nuevo)`)

  console.log('')
  console.log('✅ Limpieza completada.')
  console.log('')

  // Estadísticas después
  const after = {
    users: await prisma.user.count(),
    doctorProfiles: await prisma.doctorProfile.count(),
    clinic: await prisma.clinic.count(),
    patients: await prisma.patient.count(),
    appointments: await prisma.appointment.count(),
    payments: await prisma.payment.count(),
  }

  console.log('📋 Estado final (conservado):')
  for (const [k, v] of Object.entries(after)) {
    console.log(`   ${k.padEnd(20)} ${v}`)
  }
  console.log('')
  console.log('🎯 La clínica K88 está lista para capturar datos reales.')
  console.log('   Usuarios K88 conservados — todos deben iniciar sesión de nuevo.')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

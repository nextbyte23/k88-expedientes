// Seed inicial de catálogo de servicios y plantillas de recetas para K88
// Uso: bun prisma/seed-services.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('📦 Cargando catálogo de servicios y plantillas de recetas...')

  // Limpiar entradas previas
  await prisma.service.deleteMany()
  await prisma.prescriptionTemplate.deleteMany()

  // === Catálogo de servicios ===
  const services = [
    // Consultas
    { name: 'Consulta dental', category: 'CONSULTATION', defaultPrice: 300, description: 'Consulta inicial odontológica' },
    { name: 'Consulta médica general', category: 'CONSULTATION', defaultPrice: 350, description: 'Consulta con médico general' },
    { name: 'Consulta de especialidad', category: 'CONSULTATION', defaultPrice: 600, description: 'Consulta con especialista' },
    { name: 'Revisión/Control', category: 'CONSULTATION', defaultPrice: 200, description: 'Consulta de seguimiento' },

    // Dentales
    { name: 'Limpieza dental (profilaxis)', category: 'DENTAL', defaultPrice: 600, description: 'Profilaxis dental completa' },
    { name: 'Aplicación de flúor', category: 'DENTAL', defaultPrice: 150, description: 'Aplicación tópica de flúor' },
    { name: 'Sellante dental', category: 'DENTAL', defaultPrice: 250, description: 'Sellante por pieza' },
    { name: 'Obturación (resina) — 1 cara', category: 'DENTAL', defaultPrice: 700, description: 'Obturación con resina, una cara' },
    { name: 'Obturación (resina) — 2 caras', category: 'DENTAL', defaultPrice: 900, description: 'Obturación con resina, dos caras' },
    { name: 'Obturación (resina) — 3+ caras', category: 'DENTAL', defaultPrice: 1200, description: 'Obturación con resina, tres o más caras' },
    { name: 'Endodoncia — uniradicular', category: 'DENTAL', defaultPrice: 2500, description: 'Tratamiento de conducto en diente uniradicular' },
    { name: 'Endodoncia — multiradicular', category: 'DENTAL', defaultPrice: 4000, description: 'Tratamiento de conducto en diente multiradicular' },
    { name: 'Extracción simple', category: 'DENTAL', defaultPrice: 600, description: 'Extracción dental simple' },
    { name: 'Extracción quirúrgica', category: 'DENTAL', defaultPrice: 1800, description: 'Extracción quirúrgica (incluye cordal)' },
    { name: 'Corona metal-cerámica', category: 'DENTAL', defaultPrice: 4500, description: 'Corona metal-cerámica por pieza' },
    { name: 'Corona de zirconia', category: 'DENTAL', defaultPrice: 6500, description: 'Corona de zirconia por pieza' },
    { name: 'Provisional', category: 'DENTAL', defaultPrice: 500, description: 'Corona temporal' },
    { name: 'Blanqueamiento dental', category: 'DENTAL', defaultPrice: 4500, description: 'Tratamiento de blanqueamiento completo' },
    { name: 'Brackets (consulta inicial ortodoncia)', category: 'DENTAL', defaultPrice: 800, description: 'Valoración para tratamiento de ortodoncia' },

    // Médicos
    { name: 'Curación simple', category: 'MEDICAL', defaultPrice: 200, description: 'Curación de herida simple' },
    { name: 'Curación compleja', category: 'MEDICAL', defaultPrice: 500, description: 'Curación de herida compleja' },
    { name: 'Sutura de heridas', category: 'MEDICAL', defaultPrice: 400, description: 'Sutura por herida' },
    { name: 'Inyección intramuscular', category: 'MEDICAL', defaultPrice: 150, description: 'Aplicación de medicamento IM' },
    { name: 'Nebulización', category: 'MEDICAL', defaultPrice: 200, description: 'Terapia nebulizada' },
    { name: 'Electrocardiograma (ECG)', category: 'MEDICAL', defaultPrice: 500, description: 'Estudio ECG en reposo' },
    { name: 'Toma de muestra laboratorio', category: 'MEDICAL', defaultPrice: 100, description: 'Toma de muestra para estudios' },

    // Estudios
    { name: 'Radiografía panorámica', category: 'STUDY', defaultPrice: 350, description: 'Radiografía panorámica dental' },
    { name: 'Radiografía periapical', category: 'STUDY', defaultPrice: 80, description: 'Radiografía periapical por pieza' },
    { name: 'Estudios de laboratorio (paquete básico)', category: 'STUDY', defaultPrice: 600, description: 'Biometría, glucosa, orina' },
  ]

  for (const s of services) {
    await prisma.service.create({ data: s })
  }
  console.log(`  ✓ ${services.length} servicios cargados`)

  // === Plantillas de recetas globales ===
  const templates = [
    {
      name: 'Antibiótico para infección dental',
      diagnosis: 'Infección dental / absceso periapical',
      indications: 'Tomar con alimentos. Completar todo el tratamiento aunque mejoren los síntomas.',
      items: [
        { medicationName: 'Amoxicilina 500mg', dose: '500 mg', frequency: 'c/8 horas', route: 'Oral', duration: '7 días', notes: 'Tomar con alimentos' },
        { medicationName: 'Ibuprofeno 400mg', dose: '400 mg', frequency: 'c/8 horas', route: 'Oral', duration: '5 días', notes: 'Tomar con alimentos para dolor' },
      ],
    },
    {
      name: 'Post-extracción dental',
      diagnosis: 'Post-extracción dental',
      indications: 'Aplicar frío en la zona por 15 min cada hora el primer día. No enjuagar la boca en las primeras 24h. Dieta blanda y fría.',
      items: [
        { medicationName: 'Amoxicilina 500mg', dose: '500 mg', frequency: 'c/8 horas', route: 'Oral', duration: '7 días', notes: '' },
        { medicationName: 'Ibuprofeno 400mg', dose: '400 mg', frequency: 'c/8 horas', route: 'Oral', duration: '5 días', notes: 'Para dolor e inflamación' },
        { medicationName: 'Clorhexidina 0.12%', dose: '15 ml', frequency: '2 veces al día', route: 'Tópica', duration: '7 días', notes: 'Enjuagar 30 seg y escupir, NO tragar' },
      ],
    },
    {
      name: 'Analgésico estándar para dolor',
      diagnosis: 'Dolor leve a moderado',
      indications: 'No exceder la dosis máxima diaria.',
      items: [
        { medicationName: 'Paracetamol 500mg', dose: '500 mg', frequency: 'c/8 horas', route: 'Oral', duration: '3-5 días', notes: 'Máximo 4 g al día' },
      ],
    },
    {
      name: 'Antibiótico alternativo (penicilina alérgica)',
      diagnosis: 'Infección dental en paciente alérgico a penicilina',
      indications: 'Tomar con alimentos. Completar tratamiento.',
      items: [
        { medicationName: 'Clindamicina 300mg', dose: '300 mg', frequency: 'c/8 horas', route: 'Oral', duration: '7 días', notes: 'Alternativa a amoxicilina' },
        { medicationName: 'Ibuprofeno 400mg', dose: '400 mg', frequency: 'c/8 horas', route: 'Oral', duration: '5 días', notes: 'Para dolor' },
      ],
    },
    {
      name: 'Antiinflamatorio para gingivitis',
      diagnosis: 'Gingivitis / inflamación de encías',
      indications: 'Mejorar higiene bucal. Cepillado 3 veces al día y uso de hilo dental.',
      items: [
        { medicationName: 'Clorhexidina 0.12%', dose: '15 ml', frequency: '2 veces al día', route: 'Tópica', duration: '14 días', notes: 'Enjuague bucal, no tragar' },
        { medicationName: 'Ibuprofeno 400mg', dose: '400 mg', frequency: 'c/8 horas', route: 'Oral', duration: '3 días', notes: 'Para inflamación' },
      ],
    },
    {
      name: 'Resfriado común / faringitis',
      diagnosis: 'Faringitis aguda / resfriado común',
      indications: 'Reposo, hidratación abundante. Si persiste más de 5 días o hay fiebre alta, consultar de nuevo.',
      items: [
        { medicationName: 'Paracetamol 500mg', dose: '500 mg', frequency: 'c/6 horas', route: 'Oral', duration: '3-5 días', notes: 'Para fiebre y dolor' },
        { medicationName: 'Loratadina 10mg', dose: '10 mg', frequency: '1 vez al día', route: 'Oral', duration: '5 días', notes: '' },
        { medicationName: 'Ambroxol 30mg', dose: '30 mg', frequency: 'c/8 horas', route: 'Oral', duration: '5 días', notes: 'Para tos productiva' },
      ],
    },
    {
      name: 'Hipertensión arterial',
      diagnosis: 'Hipertensión arterial leve',
      indications: 'Control de presión arterial mensual. Reducir sodio en dieta.',
      items: [
        { medicationName: 'Losartán 50mg', dose: '50 mg', frequency: '1 vez al día', route: 'Oral', duration: 'Indefinido', notes: 'Tomar por la mañana' },
      ],
    },
    {
      name: 'Gastritis',
      diagnosis: 'Gastritis aguda',
      indications: 'Evitar irritantes (picante, café, alcohol). Comida fraccionada.',
      items: [
        { medicationName: 'Omeprazol 20mg', dose: '20 mg', frequency: '1 vez al día', route: 'Oral', duration: '14 días', notes: 'Tomar en ayunas 30 min antes del desayuno' },
        { medicationName: 'Magaldrato 800mg', dose: '800 mg', frequency: 'c/8 horas', route: 'Oral', duration: '7 días', notes: 'Después de comidas' },
      ],
    },
  ]

  for (const t of templates) {
    await prisma.prescriptionTemplate.create({
      data: {
        name: t.name,
        diagnosis: t.diagnosis,
        indications: t.indications,
        itemsJson: JSON.stringify(t.items),
        doctorId: null, // plantillas globales
      },
    })
  }
  console.log(`  ✓ ${templates.length} plantillas de recetas cargadas`)

  console.log('')
  console.log('✅ Catálogo cargado exitosamente.')
  console.log('   Puedes editar o agregar más desde el panel de admin → "Catálogo de servicios"')
  console.log('   Las plantillas de recetas están disponibles para todos los médicos al crear una receta.')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

// Catálogo de servicios K88 — Centro Integral Odontológico y Especialidades Médicas
// Precios oficiales en MXN
// Uso: bun prisma/seed-services.ts

import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

// Estructura de cada servicio:
//   name: nombre visible
//   category: CONSULTATION | DENTAL | STUDY | OTHER (categoría interna del sistema)
//   subgroup: Odontología general | Odontopediatría | Cirugía / Especialidad | Ortodoncia | Insumos
//   minPrice: precio mínimo (precio único si es "Precio único")
//   maxPrice: precio máximo (null si es precio único)
//   description: texto que se muestra en el catálogo
type ServiceInput = {
  name: string
  category: 'CONSULTATION' | 'DENTAL' | 'STUDY' | 'OTHER'
  subgroup: string
  minPrice: number
  maxPrice?: number | null
}

const services: ServiceInput[] = [
  // ============ ODONTOLOGÍA GENERAL (25) ============
  { name: 'Resina (1 cara)', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 600 },
  { name: 'Resina (2 caras)', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 800 },
  { name: 'Resina estética', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 1500 },
  { name: 'Endodoncia anterior', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 1500, maxPrice: 1800 },
  { name: 'Endodoncia posterior', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 3000 },
  { name: 'Corona de zirconia', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 7000, maxPrice: 8000 },
  { name: 'Corona metal-porcelana', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 3000, maxPrice: 3800 },
  { name: 'Corona de E-max', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 5000 },
  { name: 'Corona de disilicato', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 4000 },
  { name: 'Corona de resina', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 2000, maxPrice: 2500 },
  { name: 'Cirugía de 3ras', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 2500 },
  { name: 'Cirugía de 3ras complejas', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 3500, maxPrice: 3800 },
  { name: 'Consulta general', category: 'CONSULTATION', subgroup: 'Odontología general', minPrice: 250, maxPrice: 300 },
  { name: 'Consulta de especialidad', category: 'CONSULTATION', subgroup: 'Odontología general', minPrice: 800, maxPrice: 1000 },
  { name: 'Radiografía apical', category: 'STUDY', subgroup: 'Odontología general', minPrice: 250 },
  { name: 'Limpieza completa (detartraje)', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 600, maxPrice: 700 },
  { name: 'Blanqueamiento', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 3000, maxPrice: 3500 },
  { name: 'Endoposte de fibra de vidrio', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 1800 },
  { name: 'Corona de porcelana', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 4500 },
  { name: 'Carilla directa sin desgaste', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 2500 },
  { name: 'Carilla inyectada', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 3000 },
  { name: 'Carilla estratificada', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 3500 },
  { name: 'Incrustación de zirconia', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 4000 },
  { name: 'Incrustación de resina cerámica', category: 'DENTAL', subgroup: 'Odontología general', minPrice: 2500 },
  { name: 'Escaneo dental', category: 'STUDY', subgroup: 'Odontología general', minPrice: 250 },

  // ============ ODONTOPEDIATRÍA (7) ============
  { name: 'Limpieza (odontopediatría)', category: 'DENTAL', subgroup: 'Odontopediatría', minPrice: 499 },
  { name: 'Sellador (c/diente) — pediatría', category: 'DENTAL', subgroup: 'Odontopediatría', minPrice: 300 },
  { name: 'Resina (pediatría)', category: 'DENTAL', subgroup: 'Odontopediatría', minPrice: 400, maxPrice: 500 },
  { name: 'Extracción diente temporal', category: 'DENTAL', subgroup: 'Odontopediatría', minPrice: 300, maxPrice: 400 },
  { name: 'Corona de metal (acero-cromo)', category: 'DENTAL', subgroup: 'Odontopediatría', minPrice: 900, maxPrice: 1800 },
  { name: 'Mantenedor de espacio', category: 'DENTAL', subgroup: 'Odontopediatría', minPrice: 2250 },
  { name: 'Pulpo / Pulpectomía', category: 'DENTAL', subgroup: 'Odontopediatría', minPrice: 1500 },

  // ============ CIRUGÍA / ESPECIALIDAD (7) ============
  { name: 'Tercer molar cerrado', category: 'DENTAL', subgroup: 'Cirugía / Especialidad', minPrice: 2500 },
  { name: 'Tercer molar abierto', category: 'DENTAL', subgroup: 'Cirugía / Especialidad', minPrice: 5000 },
  { name: 'Carilla de resina (cirugía)', category: 'DENTAL', subgroup: 'Cirugía / Especialidad', minPrice: 3500 },
  { name: 'Carilla de zirconia (cirugía)', category: 'DENTAL', subgroup: 'Cirugía / Especialidad', minPrice: 6000 },
  { name: 'Corona de E-max (cirugía)', category: 'DENTAL', subgroup: 'Cirugía / Especialidad', minPrice: 5000 },
  { name: 'Incrustación de zirconia (cirugía)', category: 'DENTAL', subgroup: 'Cirugía / Especialidad', minPrice: 4000 },
  { name: 'Incrustación de resina cerámica (cirugía)', category: 'DENTAL', subgroup: 'Cirugía / Especialidad', minPrice: 2500 },

  // ============ ORTODONCIA (12) ============
  { name: 'Consulta de ortodoncia', category: 'CONSULTATION', subgroup: 'Ortodoncia', minPrice: 800 },
  { name: 'Colocación de brackets', category: 'DENTAL', subgroup: 'Ortodoncia', minPrice: 6000, maxPrice: 10000 },
  { name: 'Cita mensual ortodoncia', category: 'CONSULTATION', subgroup: 'Ortodoncia', minPrice: 700, maxPrice: 1000 },
  { name: 'Hawley (Retenedor)', category: 'DENTAL', subgroup: 'Ortodoncia', minPrice: 1200, maxPrice: 1800 },
  { name: 'Hawley', category: 'DENTAL', subgroup: 'Ortodoncia', minPrice: 2300 },
  { name: 'Hawley plano', category: 'DENTAL', subgroup: 'Ortodoncia', minPrice: 2300 },
  { name: 'Botón de Nance', category: 'DENTAL', subgroup: 'Ortodoncia', minPrice: 2000 },
  { name: 'Barra transpalatina', category: 'DENTAL', subgroup: 'Ortodoncia', minPrice: 2000 },
  { name: 'Quad Hélix', category: 'DENTAL', subgroup: 'Ortodoncia', minPrice: 2800 },
  { name: 'Hyrax', category: 'DENTAL', subgroup: 'Ortodoncia', minPrice: 4500 },
  { name: 'Klammt', category: 'DENTAL', subgroup: 'Ortodoncia', minPrice: 3500 },
  { name: 'Bionator', category: 'DENTAL', subgroup: 'Ortodoncia', minPrice: 4000 },

  // ============ INSUMOS DE ORTODONCIA (5) ============
  { name: 'Arco (insumo)', category: 'OTHER', subgroup: 'Insumos de ortodoncia', minPrice: 20 },
  { name: 'Elastómeros (insumo)', category: 'OTHER', subgroup: 'Insumos de ortodoncia', minPrice: 10 },
  { name: 'Guantes (insumo)', category: 'OTHER', subgroup: 'Insumos de ortodoncia', minPrice: 3 },
  { name: 'Campo (insumo)', category: 'OTHER', subgroup: 'Insumos de ortodoncia', minPrice: 2 },
  { name: 'Eyector (insumo)', category: 'OTHER', subgroup: 'Insumos de ortodoncia', minPrice: 4 },
]

async function main() {
  console.log('📦 Cargando catálogo de servicios K88...')
  console.log(`   ${services.length} servicios en 5 subgrupos`)
  console.log('')

  // Limpiar entradas previas
  await prisma.service.deleteMany()
  await prisma.prescriptionTemplate.deleteMany()

  // Insertar servicios
  let count = 0
  for (const s of services) {
    await prisma.service.create({
      data: {
        name: s.name,
        description: s.subgroup,
        category: s.category,
        defaultPrice: s.minPrice,
        maxPrice: s.maxPrice ?? null,
      },
    })
    count++
  }
  console.log(`✓ ${count} servicios cargados`)

  // Estadísticas de precios
  const ranges = services.filter((s) => s.maxPrice).length
  const unique = services.length - ranges
  console.log(`   • ${unique} servicios con precio único`)
  console.log(`   • ${ranges} servicios con rango (min-max)`)

  // Resumen por subgrupo
  const groups = services.reduce((acc, s) => {
    acc[s.subgroup] = (acc[s.subgroup] || 0) + 1
    return acc
  }, {} as Record<string, number>)
  console.log('')
  console.log('📊 Distribución por subgrupo:')
  for (const [g, c] of Object.entries(groups)) {
    console.log(`   ${g.padEnd(30)} ${c} servicios`)
  }

  // === Plantillas de recetas globales (se conservan las 8 anteriores) ===
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
        doctorId: null,
      },
    })
  }
  console.log('')
  console.log(`✓ ${templates.length} plantillas de recetas globales cargadas`)

  console.log('')
  console.log('✅ Catálogo K88 cargado exitosamente.')
}

main()
  .catch((e) => {
    console.error('❌ Error:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

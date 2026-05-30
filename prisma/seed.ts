import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  console.log('🌱 Seeding database...')

  // Create categories based on the CSV analysis
  const categories = await Promise.all([
    // Vie quotidienne
    prisma.category.create({
      data: {
        name: 'Alimentation',
        description: 'Courses, supermarchés, alimentation',
        color: '#10B981',
        icon: 'ShoppingCart',
        parentName: 'Vie quotidienne',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Bien-être et soins',
        description: 'Coiffeur, parfums, soins personnels',
        color: '#EC4899',
        icon: 'Sparkles',
        parentName: 'Vie quotidienne',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Mobilier et électroménager',
        description: 'Meubles, électroménager, décoration',
        color: '#8B5CF6',
        icon: 'Home',
        parentName: 'Vie quotidienne',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Livres et loisirs',
        description: 'Livres, CD/DVD, bijoux, jouets',
        color: '#F59E0B',
        icon: 'Book',
        parentName: 'Vie quotidienne',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Vie Quotidienne - Autres',
        description: 'Autres dépenses quotidiennes',
        color: '#6B7280',
        icon: 'Package',
        parentName: 'Vie quotidienne',
      },
    }),

    // Abonnements & téléphonie
    prisma.category.create({
      data: {
        name: 'Téléphonie',
        description: 'Téléphone fixe et mobile',
        color: '#3B82F6',
        icon: 'Phone',
        parentName: 'Abonnements & téléphonie',
      },
    }),

    // Voyages & Transports
    prisma.category.create({
      data: {
        name: 'Transports quotidiens',
        description: 'Métro, bus, tramway',
        color: '#14B8A6',
        icon: 'Bus',
        parentName: 'Voyages & Transports',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Transports longue distance',
        description: 'Avions, trains, cars',
        color: '#06B6D4',
        icon: 'Train',
        parentName: 'Voyages & Transports',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Hébergement',
        description: 'Hôtels, camping, locations',
        color: '#0EA5E9',
        icon: 'Hotel',
        parentName: 'Voyages & Transports',
      },
    }),

    // Auto & Moto
    prisma.category.create({
      data: {
        name: 'Carburant',
        description: 'Essence, diesel, électrique',
        color: '#EF4444',
        icon: 'Fuel',
        parentName: 'Auto & Moto',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Assurances Auto/Moto',
        description: 'Assurances véhicules',
        color: '#DC2626',
        icon: 'Shield',
        parentName: 'Auto & Moto',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Entretien et Réparation',
        description: 'Garage, pièces, réparations',
        color: '#B91C1C',
        icon: 'Wrench',
        parentName: 'Auto & Moto',
      },
    }),

    // Santé
    prisma.category.create({
      data: {
        name: 'Pharmacie et laboratoire',
        description: 'Médicaments, analyses',
        color: '#22C55E',
        icon: 'Pill',
        parentName: 'Santé',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Médecins et frais médicaux',
        description: 'Consultations, soins',
        color: '#16A34A',
        icon: 'Stethoscope',
        parentName: 'Santé',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Remboursements frais de santé',
        description: 'Remboursements mutuelles et CPAM',
        color: '#15803D',
        icon: 'HeartPulse',
        parentName: 'Santé',
      },
    }),

    // Logement
    prisma.category.create({
      data: {
        name: 'Énergie',
        description: 'Électricité, gaz, fuel, chauffage',
        color: '#F97316',
        icon: 'Zap',
        parentName: 'Logement',
      },
    }),

    // Loisirs et sorties
    prisma.category.create({
      data: {
        name: 'Restaurants et bars',
        description: 'Restaurants, bars, discothèques',
        color: '#A855F7',
        icon: 'UtensilsCrossed',
        parentName: 'Loisirs et sorties',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Divertissement et culture',
        description: 'Cinéma, théâtre, concerts, musées',
        color: '#9333EA',
        icon: 'Theater',
        parentName: 'Loisirs et sorties',
      },
    }),

    // Cadeaux et solidarité
    prisma.category.create({
      data: {
        name: 'Dons et Cadeaux',
        description: 'Dons caritatifs et cadeaux',
        color: '#EF4444',
        icon: 'Gift',
        parentName: 'Cadeaux et solidarité',
      },
    }),

    // Services financiers & professionnels
    prisma.category.create({
      data: {
        name: 'Transfert d\'argent à l\'étranger',
        description: 'Western Union, Remitly, Wise',
        color: '#0891B2',
        icon: 'Send',
        parentName: 'Services financiers & professionnels',
      },
    }),

    // Virements
    prisma.category.create({
      data: {
        name: 'Virements reçus',
        description: 'Virements entrants',
        color: '#10B981',
        icon: 'ArrowDownCircle',
        parentName: 'Virements reçus',
      },
    }),
    prisma.category.create({
      data: {
        name: 'Virements émis',
        description: 'Virements sortants',
        color: '#EF4444',
        icon: 'ArrowUpCircle',
        parentName: 'Virements émis',
      },
    }),

    // Retraits cash
    prisma.category.create({
      data: {
        name: 'Retraits cash',
        description: 'Retraits aux distributeurs',
        color: '#6B7280',
        icon: 'Banknote',
        parentName: 'Retraits cash',
      },
    }),

    // Non catégorisé
    prisma.category.create({
      data: {
        name: 'Non catégorisé',
        description: 'Transactions non catégorisées',
        color: '#9CA3AF',
        icon: 'HelpCircle',
        parentName: 'Non catégorisé',
      },
    }),
  ])

  console.log(`✅ Created ${categories.length} categories`)

  // Create some merchants
  const merchants = await Promise.all([
    prisma.merchant.create({
      data: {
        name: 'Lidl',
        suggestedName: 'Lidl',
        type: 'store',
        description: 'Supermarché discount',
      },
    }),
    prisma.merchant.create({
      data: {
        name: 'ALDI',
        suggestedName: 'ALDI',
        type: 'store',
        description: 'Supermarché discount',
      },
    }),
    prisma.merchant.create({
      data: {
        name: 'E.Leclerc',
        suggestedName: 'E.Leclerc',
        type: 'store',
        description: 'Hypermarché',
      },
    }),
    prisma.merchant.create({
      data: {
        name: 'Bouygues Telecom',
        suggestedName: 'Bouygues Telecom',
        type: 'service',
        description: 'Opérateur téléphonique',
      },
    }),
    prisma.merchant.create({
      data: {
        name: 'SNCF',
        suggestedName: 'SNCF',
        type: 'transport',
        description: 'Transport ferroviaire',
      },
    }),
    prisma.merchant.create({
      data: {
        name: 'RTM',
        suggestedName: 'RTM',
        type: 'transport',
        description: 'Transports Marseille',
      },
    }),
  ])

  console.log(`✅ Created ${merchants.length} merchants`)

  console.log('✨ Seeding completed!')
}

main()
  .catch((e) => {
    console.error('❌ Seeding failed:', e)
    process.exit(1)
  })
  .finally(async () => {
    await prisma.$disconnect()
  })

// Made with Bob

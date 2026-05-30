import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function main() {
  try {
    // Find the "Don" category
    const donCategory = await prisma.category.findFirst({
      where: {
        name: 'Don'
      }
    })

    if (!donCategory) {
      console.log('❌ Catégorie "Don" non trouvée')
      console.log('Création de la catégorie "Don"...')
      
      const newDonCategory = await prisma.category.create({
        data: {
          name: 'Don',
          color: '#10b981', // Green color
        }
      })
      
      console.log('✅ Catégorie "Don" créée:', newDonCategory.id)
      
      // Update MUSLIMI.COM transactions
      const result = await prisma.transaction.updateMany({
        where: {
          label: {
            contains: 'MUSLIMI.COM'
          }
        },
        data: {
          categoryId: newDonCategory.id
        }
      })
      
      console.log(`✅ ${result.count} transactions MUSLIMI.COM mises à jour vers la catégorie "Don"`)
    } else {
      console.log('✅ Catégorie "Don" trouvée:', donCategory.id)
      
      // Update MUSLIMI.COM transactions
      const result = await prisma.transaction.updateMany({
        where: {
          label: {
            contains: 'MUSLIMI.COM'
          }
        },
        data: {
          categoryId: donCategory.id
        }
      })
      
      console.log(`✅ ${result.count} transactions MUSLIMI.COM mises à jour vers la catégorie "Don"`)
    }
    
    // Show updated transactions
    const muslimTransactions = await prisma.transaction.findMany({
      where: {
        label: {
          contains: 'MUSLIMI.COM'
        }
      },
      include: {
        category: true,
        merchant: true
      },
      take: 5
    })
    
    console.log('\n📋 Exemples de transactions MUSLIMI.COM:')
    muslimTransactions.forEach(t => {
      console.log(`  - ${t.label} | ${t.amount}€ | Catégorie: ${t.category?.name || 'N/A'}`)
    })
    
  } catch (error) {
    console.error('❌ Erreur:', error)
  } finally {
    await prisma.$disconnect()
  }
}

main()

// Made with Bob

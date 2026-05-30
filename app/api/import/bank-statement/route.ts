import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'

interface BankTransaction {
  dateOp: string
  dateVal: string
  label: string
  suggestedLabel: string
  category: string
  categoryParent: string
  amount: string
  comment: string
  accountNum: string
  accountLabel: string
  accountbalance: string
}

// Parse date from DD/MM/YYYY or YYYY-MM-DD format
function parseDate(dateStr: string): Date {
  if (!dateStr) return new Date()
  
  // Try ISO format first (YYYY-MM-DD)
  if (dateStr.includes('-') && dateStr.split('-')[0].length === 4) {
    return new Date(dateStr)
  }
  
  // Try DD/MM/YYYY format
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    return new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
  }
  
  return new Date(dateStr)
}

// Parse amount (handle French format with comma)
function parseAmount(amountStr: string): number {
  if (!amountStr) return 0
  // Remove spaces and replace comma with dot
  const cleaned = amountStr.replace(/\s/g, '').replace(',', '.')
  return parseFloat(cleaned) || 0
}

// Determine transaction type based on amount
function getTransactionType(amount: number): string {
  if (amount > 0) return 'income'
  if (amount < 0) return 'expense'
  return 'transfer'
}

// Determine payment method from label
function getPaymentMethod(label: string): string {
  const labelLower = label.toLowerCase()
  if (labelLower.includes('carte') || labelLower.includes('cb')) return 'card'
  if (labelLower.includes('prlv') || labelLower.includes('prelevement')) return 'direct_debit'
  if (labelLower.includes('vir') || labelLower.includes('virement')) return 'transfer'
  if (labelLower.includes('retrait') || labelLower.includes('dab')) return 'cash'
  if (labelLower.includes('cheque')) return 'check'
  return 'other'
}

// Find or create category
async function findOrCreateCategory(categoryName: string, parentName: string) {
  if (!categoryName || categoryName === 'Non catégorisé') {
    return await prisma.category.findFirst({
      where: { name: 'Non catégorisé' }
    })
  }

  let category = await prisma.category.findFirst({
    where: { name: categoryName }
  })

  if (!category) {
    category = await prisma.category.create({
      data: {
        name: categoryName,
        parentName: parentName || 'Non catégorisé',
        color: '#9CA3AF',
        icon: 'Tag',
      }
    })
  }

  return category
}

// Find or create merchant
async function findOrCreateMerchant(suggestedLabel: string) {
  if (!suggestedLabel) return null

  let merchant = await prisma.merchant.findFirst({
    where: { suggestedName: suggestedLabel }
  })

  if (!merchant) {
    merchant = await prisma.merchant.create({
      data: {
        name: suggestedLabel,
        suggestedName: suggestedLabel,
        type: 'unknown',
      }
    })
  }

  return merchant
}

// POST /api/import/bank-statement - Import BoursoBank CSV
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    // Parse CSV
    const text = await file.text()
    const result = Papa.parse<BankTransaction>(text, {
      header: true,
      skipEmptyLines: true,
      delimiter: ';', // BoursoBank uses semicolon
    })

    if (result.errors.length > 0) {
      console.error('CSV parsing errors:', result.errors)
    }

    const transactions = result.data
    console.log(`📊 Found ${transactions.length} transactions in CSV`)

    let imported = 0
    let skipped = 0
    const createdTransactions = []

    for (const row of transactions) {
      try {
        // Skip if no amount or date
        if (!row.amount || !row.dateOp) {
          skipped++
          continue
        }

        const amount = parseAmount(row.amount)
        if (amount === 0) {
          skipped++
          continue
        }

        // Find or create category
        const category = await findOrCreateCategory(row.category, row.categoryParent)
        
        // Find or create merchant
        const merchant = await findOrCreateMerchant(row.suggestedLabel)

        // Create transaction
        const transaction = await prisma.transaction.create({
          data: {
            dateOp: parseDate(row.dateOp),
            dateVal: parseDate(row.dateVal),
            label: row.label || '',
            amount: amount,
            type: getTransactionType(amount),
            comment: row.comment || null,
            accountNum: row.accountNum || null,
            accountLabel: row.accountLabel || null,
            balance: parseAmount(row.accountbalance),
            paymentMethod: getPaymentMethod(row.label),
            categoryId: category?.id || null,
            merchantId: merchant?.id || null,
          },
          include: {
            category: true,
            merchant: true,
          },
        })

        createdTransactions.push(transaction)
        imported++
      } catch (error) {
        console.error('Error importing transaction:', error, row)
        skipped++
      }
    }

    console.log(`✅ Imported ${imported} transactions, skipped ${skipped}`)

    return NextResponse.json({
      success: true,
      imported,
      skipped,
      total: transactions.length,
      transactions: createdTransactions.slice(0, 10), // Return first 10 for preview
    })
  } catch (error: any) {
    console.error('Error importing bank statement:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'importation', details: error.message },
      { status: 500 }
    )
  }
}

// Made with Bob

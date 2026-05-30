import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import Papa from 'papaparse'
import * as XLSX from 'xlsx'

interface ParsedDonation {
  date: string
  amount: number
  description?: string
  beneficiaryName?: string
}

// Parse CSV file
function parseCSV(text: string): ParsedDonation[] {
  const result = Papa.parse(text, {
    header: true,
    skipEmptyLines: true,
    dynamicTyping: true,
  })

  return result.data.map((row: any) => ({
    date: row.date || row.Date || row.DATE || row['Date'] || '',
    amount: parseFloat(row.amount || row.Amount || row.AMOUNT || row.Montant || row.montant || 0),
    description: row.description || row.Description || row.DESCRIPTION || row.Libellé || row.libelle || '',
    beneficiaryName: row.beneficiary || row.Beneficiary || row.Bénéficiaire || row.beneficiaire || '',
  }))
}

// Parse Excel file
function parseExcel(buffer: ArrayBuffer): ParsedDonation[] {
  const workbook = XLSX.read(buffer, { type: 'array' })
  const firstSheet = workbook.Sheets[workbook.SheetNames[0]]
  const data = XLSX.utils.sheet_to_json(firstSheet)

  return data.map((row: any) => ({
    date: row.date || row.Date || row.DATE || row['Date'] || '',
    amount: parseFloat(row.amount || row.Amount || row.AMOUNT || row.Montant || row.montant || 0),
    description: row.description || row.Description || row.DESCRIPTION || row.Libellé || row.libelle || '',
    beneficiaryName: row.beneficiary || row.Beneficiary || row.Bénéficiaire || row.beneficiaire || '',
  }))
}

// Parse date from various formats
function parseDate(dateStr: string): Date {
  // Try ISO format first
  let date = new Date(dateStr)
  if (!isNaN(date.getTime())) {
    return date
  }

  // Try DD/MM/YYYY format
  const parts = dateStr.split('/')
  if (parts.length === 3) {
    const [day, month, year] = parts
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (!isNaN(date.getTime())) {
      return date
    }
  }

  // Try DD-MM-YYYY format
  const dashParts = dateStr.split('-')
  if (dashParts.length === 3) {
    const [day, month, year] = dashParts
    date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day))
    if (!isNaN(date.getTime())) {
      return date
    }
  }

  // Default to today if parsing fails
  return new Date()
}

// POST /api/import - Import donations from file
export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData()
    const file = formData.get('file') as File
    const beneficiaryId = formData.get('beneficiaryId') as string
    const categoryId = formData.get('categoryId') as string

    if (!file) {
      return NextResponse.json(
        { error: 'Aucun fichier fourni' },
        { status: 400 }
      )
    }

    if (!beneficiaryId || !categoryId) {
      return NextResponse.json(
        { error: 'Bénéficiaire et catégorie requis' },
        { status: 400 }
      )
    }

    // Verify beneficiary and category exist
    const [beneficiary, category] = await Promise.all([
      prisma.beneficiary.findUnique({ where: { id: beneficiaryId } }),
      prisma.category.findUnique({ where: { id: categoryId } }),
    ])

    if (!beneficiary || !category) {
      return NextResponse.json(
        { error: 'Bénéficiaire ou catégorie introuvable' },
        { status: 404 }
      )
    }

    let parsedDonations: ParsedDonation[] = []

    // Parse file based on type
    const fileName = file.name.toLowerCase()
    if (fileName.endsWith('.csv')) {
      const text = await file.text()
      parsedDonations = parseCSV(text)
    } else if (fileName.endsWith('.xlsx') || fileName.endsWith('.xls')) {
      const buffer = await file.arrayBuffer()
      parsedDonations = parseExcel(buffer)
    } else {
      return NextResponse.json(
        { error: 'Format de fichier non supporté. Utilisez CSV ou Excel.' },
        { status: 400 }
      )
    }

    // Filter valid donations
    const validDonations = parsedDonations.filter(
      (d) => d.amount > 0 && d.date
    )

    if (validDonations.length === 0) {
      return NextResponse.json(
        { error: 'Aucune donation valide trouvée dans le fichier' },
        { status: 400 }
      )
    }

    // Create donations in database
    const createdDonations = await Promise.all(
      validDonations.map((donation) =>
        prisma.donation.create({
          data: {
            amount: donation.amount,
            date: parseDate(donation.date),
            description: donation.description || `Import depuis ${file.name}`,
            categoryId,
            beneficiaryId,
            paymentMethod: 'transfer', // Default to transfer for bank statements
          },
          include: {
            category: true,
            beneficiary: true,
          },
        })
      )
    )

    return NextResponse.json({
      success: true,
      imported: createdDonations.length,
      total: parsedDonations.length,
      donations: createdDonations,
    })
  } catch (error: any) {
    console.error('Error importing donations:', error)
    return NextResponse.json(
      { error: 'Erreur lors de l\'importation', details: error.message },
      { status: 500 }
    )
  }
}

// Made with Bob

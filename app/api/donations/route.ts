import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { donationSchema } from '@/lib/validations'

// GET /api/donations - List all donations
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const categoryId = searchParams.get('categoryId')
    const beneficiaryId = searchParams.get('beneficiaryId')
    const startDate = searchParams.get('startDate')
    const endDate = searchParams.get('endDate')

    const where: any = {}

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (beneficiaryId) {
      where.beneficiaryId = beneficiaryId
    }

    if (startDate || endDate) {
      where.date = {}
      if (startDate) {
        where.date.gte = new Date(startDate)
      }
      if (endDate) {
        where.date.lte = new Date(endDate)
      }
    }

    const donations = await prisma.donation.findMany({
      where,
      include: {
        category: true,
        beneficiary: true,
      },
      orderBy: {
        date: 'desc',
      },
    })

    return NextResponse.json(donations)
  } catch (error) {
    console.error('Error fetching donations:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donations' },
      { status: 500 }
    )
  }
}

// POST /api/donations - Create a new donation
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = donationSchema.parse({
      ...body,
      date: new Date(body.date),
      amount: parseFloat(body.amount),
    })

    const donation = await prisma.donation.create({
      data: validatedData,
      include: {
        category: true,
        beneficiary: true,
      },
    })

    return NextResponse.json(donation, { status: 201 })
  } catch (error: any) {
    console.error('Error creating donation:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create donation' },
      { status: 500 }
    )
  }
}

// Made with Bob

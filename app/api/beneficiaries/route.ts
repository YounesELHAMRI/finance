import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { beneficiarySchema } from '@/lib/validations'

// GET /api/beneficiaries - List all beneficiaries
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')

    const where: any = {}

    if (type) {
      where.type = type
    }

    const beneficiaries = await prisma.beneficiary.findMany({
      where,
      include: {
        _count: {
          select: { donations: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(beneficiaries)
  } catch (error) {
    console.error('Error fetching beneficiaries:', error)
    return NextResponse.json(
      { error: 'Failed to fetch beneficiaries' },
      { status: 500 }
    )
  }
}

// POST /api/beneficiaries - Create a new beneficiary
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = beneficiarySchema.parse(body)

    const beneficiary = await prisma.beneficiary.create({
      data: validatedData,
    })

    return NextResponse.json(beneficiary, { status: 201 })
  } catch (error: any) {
    console.error('Error creating beneficiary:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create beneficiary' },
      { status: 500 }
    )
  }
}

// Made with Bob

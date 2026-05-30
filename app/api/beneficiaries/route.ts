import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/beneficiaries - List all merchants (renamed from beneficiaries)
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')

    const where: any = {}

    if (type) {
      where.type = type
    }

    const merchants = await prisma.merchant.findMany({
      where,
      include: {
        _count: {
          select: { transactions: true },
        },
      },
      orderBy: {
        name: 'asc',
      },
    })

    return NextResponse.json(merchants)
  } catch (error) {
    console.error('Error fetching merchants:', error)
    return NextResponse.json(
      { error: 'Failed to fetch merchants' },
      { status: 500 }
    )
  }
}

// POST /api/beneficiaries - Create a new merchant
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    const merchant = await prisma.merchant.create({
      data: {
        name: body.name,
        type: body.type,
        description: body.description,
        suggestedName: body.suggestedName,
      },
    })

    return NextResponse.json(merchant, { status: 201 })
  } catch (error: any) {
    console.error('Error creating merchant:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to create merchant' },
      { status: 500 }
    )
  }
}

// Made with Bob

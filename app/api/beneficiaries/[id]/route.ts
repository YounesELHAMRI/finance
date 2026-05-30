import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { beneficiarySchema } from '@/lib/validations'

// GET /api/beneficiaries/[id] - Get a single beneficiary
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const beneficiary = await prisma.beneficiary.findUnique({
      where: { id: params.id },
      include: {
        _count: {
          select: { donations: true },
        },
      },
    })

    if (!beneficiary) {
      return NextResponse.json(
        { error: 'Beneficiary not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(beneficiary)
  } catch (error) {
    console.error('Error fetching beneficiary:', error)
    return NextResponse.json(
      { error: 'Failed to fetch beneficiary' },
      { status: 500 }
    )
  }
}

// PUT /api/beneficiaries/[id] - Update a beneficiary
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = beneficiarySchema.parse(body)

    const beneficiary = await prisma.beneficiary.update({
      where: { id: params.id },
      data: validatedData,
    })

    return NextResponse.json(beneficiary)
  } catch (error: any) {
    console.error('Error updating beneficiary:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Beneficiary not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update beneficiary' },
      { status: 500 }
    )
  }
}

// DELETE /api/beneficiaries/[id] - Delete a beneficiary
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.beneficiary.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting beneficiary:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Beneficiary not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete beneficiary' },
      { status: 500 }
    )
  }
}

// Made with Bob

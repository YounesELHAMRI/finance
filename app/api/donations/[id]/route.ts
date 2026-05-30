import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'
import { donationSchema } from '@/lib/validations'

// GET /api/donations/[id] - Get a single donation
export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const donation = await prisma.donation.findUnique({
      where: { id: params.id },
      include: {
        category: true,
        beneficiary: true,
      },
    })

    if (!donation) {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(donation)
  } catch (error) {
    console.error('Error fetching donation:', error)
    return NextResponse.json(
      { error: 'Failed to fetch donation' },
      { status: 500 }
    )
  }
}

// PUT /api/donations/[id] - Update a donation
export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validatedData = donationSchema.parse({
      ...body,
      date: new Date(body.date),
      amount: parseFloat(body.amount),
    })

    const donation = await prisma.donation.update({
      where: { id: params.id },
      data: validatedData,
      include: {
        category: true,
        beneficiary: true,
      },
    })

    return NextResponse.json(donation)
  } catch (error: any) {
    console.error('Error updating donation:', error)
    
    if (error.name === 'ZodError') {
      return NextResponse.json(
        { error: 'Validation failed', details: error.errors },
        { status: 400 }
      )
    }

    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to update donation' },
      { status: 500 }
    )
  }
}

// DELETE /api/donations/[id] - Delete a donation
export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await prisma.donation.delete({
      where: { id: params.id },
    })

    return NextResponse.json({ success: true })
  } catch (error: any) {
    console.error('Error deleting donation:', error)
    
    if (error.code === 'P2025') {
      return NextResponse.json(
        { error: 'Donation not found' },
        { status: 404 }
      )
    }

    return NextResponse.json(
      { error: 'Failed to delete donation' },
      { status: 500 }
    )
  }
}

// Made with Bob

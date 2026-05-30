import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/transactions - List all transactions
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const type = searchParams.get('type')
    const categoryId = searchParams.get('categoryId')
    const merchantId = searchParams.get('merchantId')

    const where: any = {}

    if (type && type !== 'all') {
      where.type = type
    }

    if (categoryId && categoryId !== 'all') {
      where.categoryId = categoryId
    }

    if (merchantId && merchantId !== 'all') {
      where.merchantId = merchantId
    }

    const transactions = await prisma.transaction.findMany({
      where,
      include: {
        category: true,
        merchant: true,
      },
      orderBy: {
        dateOp: 'desc',
      },
    })

    return NextResponse.json(transactions)
  } catch (error) {
    console.error('Error fetching transactions:', error)
    return NextResponse.json(
      { error: 'Failed to fetch transactions' },
      { status: 500 }
    )
  }
}

// POST /api/transactions - Create a new transaction
export async function POST(request: NextRequest) {
  try {
    const body = await request.json()

    const transaction = await prisma.transaction.create({
      data: {
        dateOp: new Date(body.dateOp),
        dateVal: new Date(body.dateVal),
        label: body.label,
        amount: parseFloat(body.amount),
        type: body.type,
        description: body.description,
        comment: body.comment,
        accountNum: body.accountNum,
        accountLabel: body.accountLabel,
        balance: body.balance ? parseFloat(body.balance) : null,
        paymentMethod: body.paymentMethod,
        categoryId: body.categoryId,
        merchantId: body.merchantId,
      },
      include: {
        category: true,
        merchant: true,
      },
    })

    return NextResponse.json(transaction, { status: 201 })
  } catch (error: any) {
    console.error('Error creating transaction:', error)

    return NextResponse.json(
      { error: 'Failed to create transaction' },
      { status: 500 }
    )
  }
}

// Made with Bob
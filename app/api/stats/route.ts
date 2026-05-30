import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/stats - Get transaction statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const currentYear = year ? parseInt(year) : new Date().getFullYear()

    // Get total transactions (expenses only - negative amounts)
    const totalExpenses = await prisma.transaction.aggregate({
      where: {
        amount: {
          lt: 0, // Only expenses
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    })

    // Get total income (positive amounts)
    const totalIncome = await prisma.transaction.aggregate({
      where: {
        amount: {
          gt: 0, // Only income
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    })

    // Get transactions for current year
    const yearStart = new Date(currentYear, 0, 1)
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59)

    const yearExpenses = await prisma.transaction.aggregate({
      where: {
        dateOp: {
          gte: yearStart,
          lte: yearEnd,
        },
        amount: {
          lt: 0,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    })

    const yearIncome = await prisma.transaction.aggregate({
      where: {
        dateOp: {
          gte: yearStart,
          lte: yearEnd,
        },
        amount: {
          gt: 0,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    })

    // Get transactions by category
    const transactionsByCategory = await prisma.category.findMany({
      include: {
        transactions: {
          where: {
            dateOp: {
              gte: yearStart,
              lte: yearEnd,
            },
          },
        },
      },
    })

    const categoryStats = transactionsByCategory.map((category: any) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      total: Math.abs(category.transactions.reduce((sum: number, t: any) => sum + t.amount, 0)),
      count: category.transactions.length,
    }))

    // Get transactions by month for current year
    const monthlyTransactions = await prisma.transaction.findMany({
      where: {
        dateOp: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
      orderBy: {
        dateOp: 'asc',
      },
    })

    const monthlyStats = Array.from({ length: 12 }, (_, i) => {
      const monthTransactions = monthlyTransactions.filter(
        (t: any) => new Date(t.dateOp).getMonth() === i
      )
      const expenses = monthTransactions.filter((t: any) => t.amount < 0)
      const income = monthTransactions.filter((t: any) => t.amount > 0)
      
      return {
        month: i + 1,
        total: Math.abs(expenses.reduce((sum: number, t: any) => sum + t.amount, 0)),
        income: income.reduce((sum: number, t: any) => sum + t.amount, 0),
        count: monthTransactions.length,
      }
    })

    // Get top merchants
    const merchants = await prisma.merchant.findMany({
      include: {
        transactions: {
          where: {
            dateOp: {
              gte: yearStart,
              lte: yearEnd,
            },
          },
        },
      },
    })

    const topBeneficiaries = merchants
      .map((merchant: any) => ({
        id: merchant.id,
        name: merchant.name,
        type: merchant.type,
        total: Math.abs(merchant.transactions.reduce((sum: number, t: any) => sum + t.amount, 0)),
        count: merchant.transactions.length,
      }))
      .filter((m: any) => m.total > 0)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 5)

    // Get recent transactions
    const recentDonations = await prisma.transaction.findMany({
      take: 5,
      orderBy: {
        dateOp: 'desc',
      },
      include: {
        category: true,
        merchant: true,
      },
    })

    return NextResponse.json({
      total: {
        amount: Math.abs(totalExpenses._sum.amount || 0),
        income: totalIncome._sum.amount || 0,
        count: totalExpenses._count + totalIncome._count,
      },
      year: {
        year: currentYear,
        amount: Math.abs(yearExpenses._sum.amount || 0),
        income: yearIncome._sum.amount || 0,
        count: yearExpenses._count + yearIncome._count,
      },
      byCategory: categoryStats,
      byMonth: monthlyStats,
      topBeneficiaries,
      recentDonations,
    })
  } catch (error) {
    console.error('Error fetching statistics:', error)
    return NextResponse.json(
      { error: 'Failed to fetch statistics' },
      { status: 500 }
    )
  }
}

// Made with Bob

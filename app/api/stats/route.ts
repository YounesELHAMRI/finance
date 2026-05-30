import { NextRequest, NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

// GET /api/stats - Get donation statistics
export async function GET(request: NextRequest) {
  try {
    const searchParams = request.nextUrl.searchParams
    const year = searchParams.get('year')
    const currentYear = year ? parseInt(year) : new Date().getFullYear()

    // Get total donations
    const totalDonations = await prisma.donation.aggregate({
      _sum: {
        amount: true,
      },
      _count: true,
    })

    // Get donations for current year
    const yearStart = new Date(currentYear, 0, 1)
    const yearEnd = new Date(currentYear, 11, 31, 23, 59, 59)

    const yearDonations = await prisma.donation.aggregate({
      where: {
        date: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
      _sum: {
        amount: true,
      },
      _count: true,
    })

    // Get donations by category
    const donationsByCategory = await prisma.category.findMany({
      include: {
        donations: {
          where: {
            date: {
              gte: yearStart,
              lte: yearEnd,
            },
          },
        },
      },
    })

    const categoryStats = donationsByCategory.map((category: any) => ({
      id: category.id,
      name: category.name,
      color: category.color,
      total: category.donations.reduce((sum: number, d: any) => sum + d.amount, 0),
      count: category.donations.length,
    }))

    // Get donations by month for current year
    const monthlyDonations = await prisma.donation.findMany({
      where: {
        date: {
          gte: yearStart,
          lte: yearEnd,
        },
      },
      orderBy: {
        date: 'asc',
      },
    })

    const monthlyStats = Array.from({ length: 12 }, (_, i) => {
      const monthDonations = monthlyDonations.filter(
        (d: any) => new Date(d.date).getMonth() === i
      )
      return {
        month: i + 1,
        total: monthDonations.reduce((sum: number, d: any) => sum + d.amount, 0),
        count: monthDonations.length,
      }
    })

    // Get top beneficiaries
    const beneficiaries = await prisma.beneficiary.findMany({
      include: {
        donations: {
          where: {
            date: {
              gte: yearStart,
              lte: yearEnd,
            },
          },
        },
      },
    })

    const topBeneficiaries = beneficiaries
      .map((beneficiary: any) => ({
        id: beneficiary.id,
        name: beneficiary.name,
        type: beneficiary.type,
        total: beneficiary.donations.reduce((sum: number, d: any) => sum + d.amount, 0),
        count: beneficiary.donations.length,
      }))
      .filter((b: any) => b.total > 0)
      .sort((a: any, b: any) => b.total - a.total)
      .slice(0, 5)

    // Get recent donations
    const recentDonations = await prisma.donation.findMany({
      take: 5,
      orderBy: {
        date: 'desc',
      },
      include: {
        category: true,
        beneficiary: true,
      },
    })

    return NextResponse.json({
      total: {
        amount: totalDonations._sum.amount || 0,
        count: totalDonations._count,
      },
      year: {
        year: currentYear,
        amount: yearDonations._sum.amount || 0,
        count: yearDonations._count,
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

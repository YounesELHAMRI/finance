'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, formatShortDate, getMonthName } from '@/lib/utils'
import { TrendingUp, DollarSign, Gift, Users } from 'lucide-react'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts'

interface Stats {
  total: { amount: number; count: number }
  year: { year: number; amount: number; count: number }
  byCategory: Array<{ id: string; name: string; color: string; total: number; count: number }>
  byMonth: Array<{ month: number; total: number; count: number }>
  topBeneficiaries: Array<{ id: string; name: string; type: string; total: number; count: number }>
  recentDonations: Array<any>
}

export default function Dashboard() {
  const [stats, setStats] = useState<Stats | null>(null)
  const [loading, setLoading] = useState(true)
  const [selectedYear, setSelectedYear] = useState(new Date().getFullYear())

  useEffect(() => {
    fetchStats()
  }, [selectedYear])

  const fetchStats = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/stats?year=${selectedYear}`)
      const data = await response.json()
      setStats(data)
    } catch (error) {
      console.error('Error fetching stats:', error)
    } finally {
      setLoading(false)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des statistiques...</p>
        </div>
      </div>
    )
  }

  if (!stats) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <p className="text-gray-600">Erreur lors du chargement des données</p>
      </div>
    )
  }

  const monthlyChartData = stats.byMonth.map((item) => ({
    name: getMonthName(item.month - 1).substring(0, 3),
    montant: item.total,
  }))

  const categoryChartData = stats.byCategory
    .filter((cat) => cat.total > 0)
    .map((cat) => ({
      name: cat.name,
      value: cat.total,
      color: cat.color || '#3B82F6',
    }))

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Tableau de bord</h1>
        <p className="mt-2 text-gray-600">
          Vue d'ensemble de vos donations pour l'année {selectedYear}
        </p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Total des dons</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats.total.amount)}
              </p>
            </div>
            <div className="bg-blue-100 rounded-full p-3">
              <DollarSign className="h-6 w-6 text-blue-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Dons en {selectedYear}</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {formatCurrency(stats.year.amount)}
              </p>
            </div>
            <div className="bg-green-100 rounded-full p-3">
              <TrendingUp className="h-6 w-6 text-green-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Nombre de dons</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.year.count}
              </p>
            </div>
            <div className="bg-purple-100 rounded-full p-3">
              <Gift className="h-6 w-6 text-purple-600" />
            </div>
          </div>
        </div>

        <div className="bg-white rounded-lg shadow p-6">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm font-medium text-gray-600">Bénéficiaires</p>
              <p className="text-2xl font-bold text-gray-900 mt-2">
                {stats.topBeneficiaries.length}
              </p>
            </div>
            <div className="bg-orange-100 rounded-full p-3">
              <Users className="h-6 w-6 text-orange-600" />
            </div>
          </div>
        </div>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        {/* Monthly Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dons mensuels {selectedYear}
          </h2>
          <ResponsiveContainer width="100%" height={300}>
            <BarChart data={monthlyChartData}>
              <CartesianGrid strokeDasharray="3 3" />
              <XAxis dataKey="name" />
              <YAxis />
              <Tooltip
                formatter={(value: number) => formatCurrency(value)}
                labelStyle={{ color: '#000' }}
              />
              <Bar dataKey="montant" fill="#3B82F6" radius={[8, 8, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>

        {/* Category Chart */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dons par catégorie
          </h2>
          {categoryChartData.length > 0 ? (
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={categoryChartData}
                  cx="50%"
                  cy="50%"
                  labelLine={false}
                  label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                  outerRadius={80}
                  fill="#8884d8"
                  dataKey="value"
                >
                  {categoryChartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip formatter={(value: number) => formatCurrency(value)} />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="flex items-center justify-center h-[300px] text-gray-500">
              Aucune donnée disponible
            </div>
          )}
        </div>
      </div>

      {/* Top Beneficiaries and Recent Donations */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Top Beneficiaries */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Top bénéficiaires
          </h2>
          <div className="space-y-4">
            {stats.topBeneficiaries.map((beneficiary) => (
              <div
                key={beneficiary.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div>
                  <p className="font-medium text-gray-900">{beneficiary.name}</p>
                  <p className="text-sm text-gray-500">{beneficiary.count} dons</p>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(beneficiary.total)}
                </p>
              </div>
            ))}
            {stats.topBeneficiaries.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Aucun bénéficiaire pour le moment
              </p>
            )}
          </div>
        </div>

        {/* Recent Donations */}
        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Dons récents
          </h2>
          <div className="space-y-4">
            {stats.recentDonations.map((donation) => (
              <div
                key={donation.id}
                className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
              >
                <div className="flex-1">
                  <p className="font-medium text-gray-900">
                    {donation.beneficiary.name}
                  </p>
                  <p className="text-sm text-gray-500">
                    {donation.category.name} • {formatShortDate(donation.date)}
                  </p>
                </div>
                <p className="font-semibold text-gray-900">
                  {formatCurrency(donation.amount)}
                </p>
              </div>
            ))}
            {stats.recentDonations.length === 0 && (
              <p className="text-center text-gray-500 py-4">
                Aucun don enregistré
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

// Made with Bob

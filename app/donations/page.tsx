'use client'

import { useEffect, useState } from 'react'
import { formatCurrency, formatShortDate, getPaymentMethodLabel } from '@/lib/utils'
import { Plus, Pencil, Trash2, Search, Filter } from 'lucide-react'

interface Donation {
  id: string
  amount: number
  date: string
  description?: string
  paymentMethod?: string
  category: { id: string; name: string; color?: string }
  beneficiary: { id: string; name: string }
}

interface Category {
  id: string
  name: string
}

interface Beneficiary {
  id: string
  name: string
}

export default function DonationsPage() {
  const [donations, setDonations] = useState<Donation[]>([])
  const [categories, setCategories] = useState<Category[]>([])
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterCategory, setFilterCategory] = useState('')
  const [filterBeneficiary, setFilterBeneficiary] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingDonation, setEditingDonation] = useState<Donation | null>(null)

  useEffect(() => {
    fetchData()
  }, [filterCategory, filterBeneficiary])

  const fetchData = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterCategory) params.append('categoryId', filterCategory)
      if (filterBeneficiary) params.append('beneficiaryId', filterBeneficiary)

      const [donationsRes, categoriesRes, beneficiariesRes] = await Promise.all([
        fetch(`/api/donations?${params}`),
        fetch('/api/categories'),
        fetch('/api/beneficiaries'),
      ])

      const [donationsData, categoriesData, beneficiariesData] = await Promise.all([
        donationsRes.json(),
        categoriesRes.json(),
        beneficiariesRes.json(),
      ])

      setDonations(donationsData)
      setCategories(categoriesData)
      setBeneficiaries(beneficiariesData)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce don ?')) return

    try {
      const response = await fetch(`/api/donations/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchData()
      }
    } catch (error) {
      console.error('Error deleting donation:', error)
    }
  }

  const filteredDonations = donations.filter((donation) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      donation.beneficiary.name.toLowerCase().includes(searchLower) ||
      donation.category.name.toLowerCase().includes(searchLower) ||
      donation.description?.toLowerCase().includes(searchLower)
    )
  })

  const totalAmount = filteredDonations.reduce((sum, d) => sum + d.amount, 0)

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des dons...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dons</h1>
          <p className="mt-2 text-gray-600">
            Gérez et suivez tous vos dons
          </p>
        </div>
        <button
          onClick={() => {
            setEditingDonation(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nouveau don
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Rechercher
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un don..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Catégorie
            </label>
            <select
              value={filterCategory}
              onChange={(e) => setFilterCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Toutes les catégories</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Filter className="h-4 w-4 inline mr-1" />
              Bénéficiaire
            </label>
            <select
              value={filterBeneficiary}
              onChange={(e) => setFilterBeneficiary(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Tous les bénéficiaires</option>
              {beneficiaries.map((ben) => (
                <option key={ben.id} value={ben.id}>
                  {ben.name}
                </option>
              ))}
            </select>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{filteredDonations.length}</span> dons •{' '}
            <span className="font-semibold">{formatCurrency(totalAmount)}</span> au total
          </p>
        </div>
      </div>

      {/* Donations List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {filteredDonations.length === 0 ? (
          <div className="text-center py-12">
            <p className="text-gray-500">Aucun don trouvé</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Date
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Bénéficiaire
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Catégorie
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Montant
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Paiement
                  </th>
                  <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {filteredDonations.map((donation) => (
                  <tr key={donation.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                      {formatShortDate(donation.date)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">
                        {donation.beneficiary.name}
                      </div>
                      {donation.description && (
                        <div className="text-sm text-gray-500">
                          {donation.description}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <span
                        className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium"
                        style={{
                          backgroundColor: donation.category.color + '20',
                          color: donation.category.color || '#3B82F6',
                        }}
                      >
                        {donation.category.name}
                      </span>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm font-semibold text-gray-900">
                      {formatCurrency(donation.amount)}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                      {donation.paymentMethod
                        ? getPaymentMethodLabel(donation.paymentMethod)
                        : '-'}
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <button
                        onClick={() => {
                          setEditingDonation(donation)
                          setShowForm(true)
                        }}
                        className="text-blue-600 hover:text-blue-900 mr-3"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(donation.id)}
                        className="text-red-600 hover:text-red-900"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Form Modal - Placeholder for now */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingDonation ? 'Modifier le don' : 'Nouveau don'}
            </h2>
            <p className="text-gray-600 mb-4">
              Formulaire à implémenter avec react-hook-form
            </p>
            <button
              onClick={() => setShowForm(false)}
              className="w-full px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300"
            >
              Fermer
            </button>
          </div>
        </div>
      )}
    </div>
  )
}

// Made with Bob

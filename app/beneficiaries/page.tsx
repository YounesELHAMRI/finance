'use client'

import { useEffect, useState } from 'react'
import { getBeneficiaryTypeLabel } from '@/lib/utils'
import { Plus, Pencil, Trash2, Search, Mail, Phone, MapPin } from 'lucide-react'

interface Beneficiary {
  id: string
  name: string
  type: string
  email?: string
  phone?: string
  address?: string
  description?: string
  _count?: { donations: number }
}

export default function BeneficiariesPage() {
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [filterType, setFilterType] = useState('')
  const [showForm, setShowForm] = useState(false)
  const [editingBeneficiary, setEditingBeneficiary] = useState<Beneficiary | null>(null)

  useEffect(() => {
    fetchBeneficiaries()
  }, [filterType])

  const fetchBeneficiaries = async () => {
    try {
      setLoading(true)
      const params = new URLSearchParams()
      if (filterType) params.append('type', filterType)

      const response = await fetch(`/api/beneficiaries?${params}`)
      const data = await response.json()
      setBeneficiaries(data)
    } catch (error) {
      console.error('Error fetching beneficiaries:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer ce bénéficiaire ?')) return

    try {
      const response = await fetch(`/api/beneficiaries/${id}`, {
        method: 'DELETE',
      })

      if (response.ok) {
        fetchBeneficiaries()
      }
    } catch (error) {
      console.error('Error deleting beneficiary:', error)
    }
  }

  const filteredBeneficiaries = beneficiaries.filter((beneficiary) => {
    const searchLower = searchTerm.toLowerCase()
    return (
      beneficiary.name.toLowerCase().includes(searchLower) ||
      beneficiary.description?.toLowerCase().includes(searchLower) ||
      beneficiary.email?.toLowerCase().includes(searchLower)
    )
  })

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[calc(100vh-8rem)]">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">Chargement des bénéficiaires...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Bénéficiaires</h1>
          <p className="mt-2 text-gray-600">
            Gérez les bénéficiaires de vos dons
          </p>
        </div>
        <button
          onClick={() => {
            setEditingBeneficiary(null)
            setShowForm(true)
          }}
          className="flex items-center gap-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
        >
          <Plus className="h-5 w-5" />
          Nouveau bénéficiaire
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-6 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              <Search className="h-4 w-4 inline mr-1" />
              Rechercher
            </label>
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher un bénéficiaire..."
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Type
            </label>
            <select
              value={filterType}
              onChange={(e) => setFilterType(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
            >
              <option value="">Tous les types</option>
              <option value="organization">Organisation</option>
              <option value="individual">Individu</option>
              <option value="charity">Association caritative</option>
            </select>
          </div>
        </div>
        <div className="mt-4 pt-4 border-t border-gray-200">
          <p className="text-sm text-gray-600">
            <span className="font-semibold">{filteredBeneficiaries.length}</span> bénéficiaires
          </p>
        </div>
      </div>

      {/* Beneficiaries Grid */}
      {filteredBeneficiaries.length === 0 ? (
        <div className="bg-white rounded-lg shadow p-12 text-center">
          <p className="text-gray-500">Aucun bénéficiaire trouvé</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredBeneficiaries.map((beneficiary) => (
            <div
              key={beneficiary.id}
              className="bg-white rounded-lg shadow hover:shadow-lg transition-shadow p-6"
            >
              <div className="flex justify-between items-start mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900 mb-1">
                    {beneficiary.name}
                  </h3>
                  <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                    {getBeneficiaryTypeLabel(beneficiary.type)}
                  </span>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => {
                      setEditingBeneficiary(beneficiary)
                      setShowForm(true)
                    }}
                    className="text-blue-600 hover:text-blue-900"
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    onClick={() => handleDelete(beneficiary.id)}
                    className="text-red-600 hover:text-red-900"
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>

              {beneficiary.description && (
                <p className="text-sm text-gray-600 mb-4">
                  {beneficiary.description}
                </p>
              )}

              <div className="space-y-2 text-sm">
                {beneficiary.email && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Mail className="h-4 w-4" />
                    <span className="truncate">{beneficiary.email}</span>
                  </div>
                )}
                {beneficiary.phone && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <Phone className="h-4 w-4" />
                    <span>{beneficiary.phone}</span>
                  </div>
                )}
                {beneficiary.address && (
                  <div className="flex items-center gap-2 text-gray-600">
                    <MapPin className="h-4 w-4" />
                    <span className="truncate">{beneficiary.address}</span>
                  </div>
                )}
              </div>

              {beneficiary._count && (
                <div className="mt-4 pt-4 border-t border-gray-200">
                  <p className="text-sm text-gray-600">
                    <span className="font-semibold">{beneficiary._count.donations}</span> dons reçus
                  </p>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Form Modal - Placeholder for now */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg p-6 max-w-md w-full">
            <h2 className="text-xl font-bold mb-4">
              {editingBeneficiary ? 'Modifier le bénéficiaire' : 'Nouveau bénéficiaire'}
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

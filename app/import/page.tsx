'use client'

import { useEffect, useState } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download } from 'lucide-react'
import { formatCurrency, formatShortDate } from '@/lib/utils'

interface Category {
  id: string
  name: string
  color?: string
}

interface Beneficiary {
  id: string
  name: string
  type: string
}

interface ImportResult {
  success: boolean
  imported: number
  total: number
  donations: any[]
}

export default function ImportPage() {
  const [categories, setCategories] = useState<Category[]>([])
  const [beneficiaries, setBeneficiaries] = useState<Beneficiary[]>([])
  const [selectedCategory, setSelectedCategory] = useState('')
  const [selectedBeneficiary, setSelectedBeneficiary] = useState('')
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    fetchData()
  }, [])

  const fetchData = async () => {
    try {
      const [categoriesRes, beneficiariesRes] = await Promise.all([
        fetch('/api/categories'),
        fetch('/api/beneficiaries'),
      ])

      if (!categoriesRes.ok || !beneficiariesRes.ok) {
        console.error('Error fetching categories:', await categoriesRes.text())
        console.error('Error fetching beneficiaries:', await beneficiariesRes.text())
        setCategories([])
        setBeneficiaries([])
        return
      }

      const [categoriesData, beneficiariesData] = await Promise.all([
        categoriesRes.json(),
        beneficiariesRes.json(),
      ])

      setCategories(Array.isArray(categoriesData) ? categoriesData : [])
      setBeneficiaries(Array.isArray(beneficiariesData) ? beneficiariesData : [])
    } catch (error) {
      console.error('Error fetching data:', error)
      setCategories([])
      setBeneficiaries([])
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      const validTypes = [
        'text/csv',
        'application/vnd.ms-excel',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      ]
      
      if (validTypes.includes(selectedFile.type) || 
          selectedFile.name.endsWith('.csv') || 
          selectedFile.name.endsWith('.xlsx') || 
          selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile)
        setError(null)
        setResult(null)
      } else {
        setError('Format de fichier non supporté. Utilisez CSV ou Excel (.xlsx, .xls)')
        setFile(null)
      }
    }
  }

  const handleImport = async () => {
    if (!file || !selectedCategory || !selectedBeneficiary) {
      setError('Veuillez remplir tous les champs')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const formData = new FormData()
      formData.append('file', file)
      formData.append('categoryId', selectedCategory)
      formData.append('beneficiaryId', selectedBeneficiary)

      const response = await fetch('/api/import', {
        method: 'POST',
        body: formData,
      })

      const data = await response.json()

      if (!response.ok) {
        throw new Error(data.error || 'Erreur lors de l\'importation')
      }

      setResult(data)
      setFile(null)
      // Reset file input
      const fileInput = document.getElementById('file-input') as HTMLInputElement
      if (fileInput) fileInput.value = ''
    } catch (error: any) {
      setError(error.message)
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Import de relevé bancaire</h1>
        <p className="mt-2 text-gray-600">
          Importez vos dons depuis un fichier CSV ou Excel
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Instructions
        </h2>
        <ul className="space-y-2 text-sm text-blue-800">
          <li>• Le fichier doit contenir les colonnes suivantes : <strong>date</strong>, <strong>amount</strong> (montant)</li>
          <li>• Colonnes optionnelles : <strong>description</strong>, <strong>beneficiary</strong> (bénéficiaire)</li>
          <li>• Format de date accepté : DD/MM/YYYY, DD-MM-YYYY, ou ISO (YYYY-MM-DD)</li>
          <li>• Les montants doivent être des nombres positifs</li>
          <li>• Formats supportés : CSV, Excel (.xlsx, .xls)</li>
        </ul>
        <div className="mt-4">
          <a
            href="/exemple-releve.csv"
            download
            className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
          >
            <Download className="h-4 w-4" />
            Télécharger un exemple de fichier CSV
          </a>
        </div>
      </div>

      {/* Import Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="space-y-6">
          {/* Category Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Catégorie *
            </label>
            <select
              value={selectedCategory}
              onChange={(e) => setSelectedCategory(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionnez une catégorie</option>
              {categories.map((cat) => (
                <option key={cat.id} value={cat.id}>
                  {cat.name}
                </option>
              ))}
            </select>
          </div>

          {/* Beneficiary Selection */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Bénéficiaire *
            </label>
            <select
              value={selectedBeneficiary}
              onChange={(e) => setSelectedBeneficiary(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-red-500 focus:border-transparent"
              required
            >
              <option value="">Sélectionnez un bénéficiaire</option>
              {beneficiaries.map((ben) => (
                <option key={ben.id} value={ben.id}>
                  {ben.name}
                </option>
              ))}
            </select>
          </div>

          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier de relevé bancaire *
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-red-400 transition-colors">
              <div className="space-y-1 text-center">
                <FileSpreadsheet className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-input"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
                  >
                    <span>Choisir un fichier</span>
                    <input
                      id="file-input"
                      type="file"
                      className="sr-only"
                      accept=".csv,.xlsx,.xls"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500">CSV, XLSX, XLS jusqu'à 10MB</p>
                {file && (
                  <p className="text-sm text-green-600 font-medium mt-2">
                    ✓ {file.name}
                  </p>
                )}
              </div>
            </div>
          </div>

          {/* Error Message */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 flex items-start gap-3">
              <XCircle className="h-5 w-5 text-red-600 flex-shrink-0 mt-0.5" />
              <div>
                <h3 className="text-sm font-medium text-red-800">Erreur</h3>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={!file || !selectedCategory || !selectedBeneficiary || loading}
            className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:bg-gray-300 disabled:cursor-not-allowed transition-colors font-medium"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white"></div>
                Importation en cours...
              </>
            ) : (
              <>
                <Upload className="h-5 w-5" />
                Importer les dons
              </>
            )}
          </button>
        </div>
      </div>

      {/* Success Result */}
      {result && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-6">
          <div className="flex items-start gap-3 mb-4">
            <CheckCircle className="h-6 w-6 text-green-600 flex-shrink-0" />
            <div>
              <h3 className="text-lg font-semibold text-green-900">
                Importation réussie !
              </h3>
              <p className="text-sm text-green-700 mt-1">
                {result.imported} dons importés sur {result.total} lignes traitées
              </p>
            </div>
          </div>

          {/* Imported Donations List */}
          {result.donations && result.donations.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Dons importés :
              </h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {result.donations.map((donation) => (
                  <div
                    key={donation.id}
                    className="bg-white rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {donation.beneficiary.name}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatShortDate(donation.date)} • {donation.category.name}
                      </p>
                      {donation.description && (
                        <p className="text-xs text-gray-500 mt-1">
                          {donation.description}
                        </p>
                      )}
                    </div>
                    <p className="font-semibold text-gray-900 ml-4">
                      {formatCurrency(donation.amount)}
                    </p>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}

      {/* Example File Format */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          Exemple de format CSV :
        </h3>
        <pre className="text-xs bg-white p-4 rounded border border-gray-200 overflow-x-auto">
{`date,amount,description
15/01/2024,100,Don mensuel
01/02/2024,50,Aide humanitaire
15/02/2024,75,Soutien médical`}
        </pre>
      </div>
    </div>
  )
}

// Made with Bob

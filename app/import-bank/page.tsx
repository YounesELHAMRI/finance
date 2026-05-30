'use client'

import { useState } from 'react'
import { Upload, FileSpreadsheet, CheckCircle, XCircle, AlertCircle, Download, ArrowLeft } from 'lucide-react'
import { formatCurrency, formatShortDate } from '@/lib/utils'
import Link from 'next/link'

interface ImportResult {
  success: boolean
  imported: number
  skipped: number
  total: number
  transactions: any[]
}

export default function ImportBankStatementPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)
  const [dragActive, setDragActive] = useState(false)

  const validateAndSetFile = (selectedFile: File) => {
    if (selectedFile.name.endsWith('.csv')) {
      setFile(selectedFile)
      setError(null)
      setResult(null)
    } else {
      setError('Format de fichier non supporté. Utilisez un fichier CSV de BoursoBank')
      setFile(null)
    }
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      validateAndSetFile(selectedFile)
    }
  }

  const handleDrag = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true)
    } else if (e.type === 'dragleave') {
      setDragActive(false)
    }
  }

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault()
    e.stopPropagation()
    setDragActive(false)

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      validateAndSetFile(e.dataTransfer.files[0])
    }
  }

  const handleImport = async () => {
    if (!file) {
      setError('Veuillez sélectionner un fichier')
      return
    }

    try {
      setLoading(true)
      setError(null)
      setResult(null)

      const formData = new FormData()
      formData.append('file', file)

      const response = await fetch('/api/import/bank-statement', {
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
      {/* Back Button */}
      <Link
        href="/"
        className="inline-flex items-center gap-2 text-gray-600 hover:text-gray-900 mb-6"
      >
        <ArrowLeft className="h-4 w-4" />
        Retour au tableau de bord
      </Link>

      {/* Header */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Import de relevé bancaire BoursoBank</h1>
        <p className="mt-2 text-gray-600">
          Importez automatiquement toutes vos transactions depuis votre export BoursoBank
        </p>
      </div>

      {/* Instructions */}
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-8">
        <h2 className="text-lg font-semibold text-blue-900 mb-3 flex items-center gap-2">
          <AlertCircle className="h-5 w-5" />
          Comment obtenir votre relevé BoursoBank
        </h2>
        <ol className="space-y-2 text-sm text-blue-800 list-decimal list-inside">
          <li>Connectez-vous à votre compte BoursoBank</li>
          <li>Allez dans "Comptes" puis sélectionnez votre compte</li>
          <li>Cliquez sur "Exporter" ou "Télécharger les opérations"</li>
          <li>Choisissez le format <strong>CSV</strong></li>
          <li>Sélectionnez la période souhaitée</li>
          <li>Téléchargez le fichier et importez-le ici</li>
        </ol>
        <div className="mt-4 p-3 bg-blue-100 rounded">
          <p className="text-sm text-blue-900 font-medium">
            ℹ️ Le fichier doit contenir les colonnes : dateOp, dateVal, label, category, amount, etc.
          </p>
        </div>
      </div>

      {/* Import Form */}
      <div className="bg-white rounded-lg shadow p-6 mb-8">
        <div className="space-y-6">
          {/* File Upload */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Fichier de relevé bancaire BoursoBank (CSV) *
            </label>
            <div
              className={`mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-dashed rounded-lg transition-colors ${
                dragActive
                  ? 'border-red-500 bg-red-50'
                  : 'border-gray-300 hover:border-red-400'
              }`}
              onDragEnter={handleDrag}
              onDragLeave={handleDrag}
              onDragOver={handleDrag}
              onDrop={handleDrop}
            >
              <div className="space-y-1 text-center">
                <FileSpreadsheet className={`mx-auto h-12 w-12 ${dragActive ? 'text-red-500' : 'text-gray-400'}`} />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-input"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-red-600 hover:text-red-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-red-500"
                  >
                    <span>Choisir un fichier CSV</span>
                    <input
                      id="file-input"
                      type="file"
                      className="sr-only"
                      accept=".csv"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">ou glisser-déposer</p>
                </div>
                <p className="text-xs text-gray-500">CSV BoursoBank jusqu'à 10MB</p>
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
            disabled={!file || loading}
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
                Importer les transactions
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
              <div className="text-sm text-green-700 mt-2 space-y-1">
                <p>✅ <strong>{result.imported}</strong> transactions importées</p>
                <p>⏭️ <strong>{result.skipped}</strong> transactions ignorées</p>
                <p>📊 <strong>{result.total}</strong> lignes traitées au total</p>
              </div>
            </div>
          </div>

          {/* Preview of imported transactions */}
          {result.transactions && result.transactions.length > 0 && (
            <div className="mt-4">
              <h4 className="text-sm font-medium text-gray-900 mb-3">
                Aperçu des transactions importées :
              </h4>
              <div className="space-y-2 max-h-96 overflow-y-auto">
                {result.transactions.map((transaction) => (
                  <div
                    key={transaction.id}
                    className="bg-white rounded-lg p-3 flex items-center justify-between"
                  >
                    <div className="flex-1">
                      <p className="font-medium text-gray-900">
                        {transaction.merchant?.name || transaction.label}
                      </p>
                      <p className="text-sm text-gray-500">
                        {formatShortDate(transaction.dateOp)} • {transaction.category?.name || 'Non catégorisé'}
                      </p>
                    </div>
                    <p className={`font-semibold ml-4 ${transaction.amount >= 0 ? 'text-green-600' : 'text-red-600'}`}>
                      {transaction.amount >= 0 ? '+' : ''}{formatCurrency(transaction.amount)}
                    </p>
                  </div>
                ))}
              </div>
              <div className="mt-4 text-center">
                <Link
                  href="/transactions"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Voir toutes les transactions
                </Link>
              </div>
            </div>
          )}
        </div>
      )}

      {/* Info Box */}
      <div className="mt-8 bg-gray-50 border border-gray-200 rounded-lg p-6">
        <h3 className="text-sm font-semibold text-gray-900 mb-3">
          ℹ️ Informations importantes
        </h3>
        <ul className="text-sm text-gray-600 space-y-2">
          <li>• Les catégories sont automatiquement créées si elles n'existent pas</li>
          <li>• Les commerçants sont automatiquement détectés et enregistrés</li>
          <li>• Les montants négatifs sont des dépenses, les positifs des revenus</li>
          <li>• Vous pouvez modifier les transactions après l'import</li>
          <li>• Les doublons ne sont pas détectés automatiquement</li>
        </ul>
      </div>
    </div>
  )
}

// Made with Bob

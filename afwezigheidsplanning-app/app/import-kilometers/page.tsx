'use client'

import { useState } from 'react'
import { Car, Upload, CheckCircle, AlertCircle } from 'lucide-react'

interface ImportResult {
  message: string
  imported: {
    werknemers: number
    kilometers: number
  }
}

export default function ImportKilometersPage() {
  const [file, setFile] = useState<File | null>(null)
  const [loading, setLoading] = useState(false)
  const [result, setResult] = useState<ImportResult | null>(null)
  const [error, setError] = useState<string | null>(null)

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (selectedFile) {
      // Check if it's an Excel file
      if (selectedFile.name.endsWith('.xlsx') || selectedFile.name.endsWith('.xlsm') || selectedFile.name.endsWith('.xls')) {
        setFile(selectedFile)
        setError(null)
        setResult(null)
      } else {
        setError('Selecteer een geldig Excel bestand (.xlsx, .xlsm, of .xls)')
        setFile(null)
      }
    }
  }

  const handleImport = async () => {
    if (!file) return

    setLoading(true)
    setError(null)
    setResult(null)

    try {
      const formData = new FormData()
      formData.append('file', file)

      const res = await fetch('/api/import/kilometers', {
        method: 'POST',
        body: formData
      })

      const data = await res.json()

      if (res.ok) {
        setResult(data)
        setFile(null)
        // Reset file input
        const fileInput = document.getElementById('file-input') as HTMLInputElement
        if (fileInput) fileInput.value = ''
      } else {
        setError(data.error || 'Er is een fout opgetreden bij het importeren')
      }
    } catch (error) {
      console.error('Error importing:', error)
      setError('Er is een fout opgetreden bij het importeren')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Car className="w-8 h-8 mr-3 text-blue-600" />
          Import Kilometers Excel
        </h1>
        <p className="mt-2 text-gray-600">
          Importeer kilometers vanuit Kilometer2026.xlsx
        </p>
      </div>

      {/* Import Card */}
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-blue-100 rounded-full">
            <Upload className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
          Kilometers Excel Importeren
        </h2>

        <div className="space-y-6">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecteer Kilometer2026.xlsx
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <Car className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-input"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload Kilometer2026.xlsx</span>
                    <input
                      id="file-input"
                      name="file-input"
                      type="file"
                      className="sr-only"
                      accept=".xlsx,.xlsm,.xls"
                      onChange={handleFileChange}
                    />
                  </label>
                  <p className="pl-1">of sleep en drop</p>
                </div>
                <p className="text-xs text-gray-500">
                  Excel bestanden (.xlsx, .xlsm, .xls)
                </p>
              </div>
            </div>
          </div>

          {/* Selected File */}
          {file && (
            <div className="p-4 bg-blue-50 rounded-lg border border-blue-200">
              <p className="text-sm text-blue-800">
                <span className="font-semibold">Geselecteerd bestand:</span> {file.name}
              </p>
              <p className="text-xs text-blue-600 mt-1">
                Grootte: {(file.size / 1024).toFixed(2)} KB
              </p>
            </div>
          )}

          {/* Import Button */}
          <button
            onClick={handleImport}
            disabled={!file || loading}
            className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium text-lg transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Importeren...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-3" />
                Importeer Kilometers
              </>
            )}
          </button>

          {/* Error Message */}
          {error && (
            <div className="p-4 bg-red-50 rounded-lg border border-red-200 flex items-start">
              <AlertCircle className="w-5 h-5 text-red-600 mr-3 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-sm font-semibold text-red-800">Fout bij importeren</p>
                <p className="text-sm text-red-700 mt-1">{error}</p>
              </div>
            </div>
          )}

          {/* Success Message */}
          {result && (
            <div className="p-4 bg-green-50 rounded-lg border border-green-200">
              <div className="flex items-start mb-3">
                <CheckCircle className="w-5 h-5 text-green-600 mr-3 mt-0.5 flex-shrink-0" />
                <div>
                  <p className="text-sm font-semibold text-green-800">Import Succesvol!</p>
                  <p className="text-sm text-green-700 mt-1">{result.message}</p>
                </div>
              </div>
              <div className="mt-3 pt-3 border-t border-green-200">
                <p className="text-sm font-semibold text-green-800 mb-2">Geïmporteerd:</p>
                <ul className="text-sm text-green-700 space-y-1">
                  <li>🚗 {result.imported.kilometers} kilometers registraties</li>
                  <li>👤 {result.imported.werknemers} nieuwe werknemers</li>
                </ul>
              </div>
              <div className="mt-4">
                <a 
                  href="/kilometers"
                  className="text-sm text-blue-600 hover:text-blue-700 font-medium"
                >
                  → Ga naar Kilometers pagina
                </a>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Import Informatie</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Upload je Kilometer2026.xlsx bestand</li>
            <li>• Het systeem herkent automatisch werknemers en maanden</li>
            <li>• Numerieke waarden worden geïmporteerd als kilometers</li>
            <li>• Bestaande werknemers worden niet dubbel aangemaakt</li>
            <li>• Dubbele kilometers voor dezelfde dag worden overschreven</li>
          </ul>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📖 Instructies
        </h3>
        <ol className="space-y-3 text-gray-700">
          <li className="flex">
            <span className="font-bold text-blue-600 mr-3">1.</span>
            <span>Zorg dat je Kilometer2026.xlsx bestand de juiste structuur heeft</span>
          </li>
          <li className="flex">
            <span className="font-bold text-blue-600 mr-3">2.</span>
            <span>Elk werkblad moet een maandnaam bevatten (Januari, Februari, etc.)</span>
          </li>
          <li className="flex">
            <span className="font-bold text-blue-600 mr-3">3.</span>
            <span>De eerste kolom moet werknemersnamen bevatten</span>
          </li>
          <li className="flex">
            <span className="font-bold text-blue-600 mr-3">4.</span>
            <span>Selecteer het bestand en klik op "Importeer Kilometers"</span>
          </li>
          <li className="flex">
            <span className="font-bold text-blue-600 mr-3">5.</span>
            <span>Controleer na import of alle kilometers correct zijn geïmporteerd</span>
          </li>
        </ol>
      </div>

      {/* Back Link */}
      <div className="mt-6 max-w-2xl">
        <a 
          href="/import"
          className="text-blue-600 hover:text-blue-700 flex items-center"
        >
          ← Terug naar algemene import
        </a>
      </div>
    </div>
  )
}


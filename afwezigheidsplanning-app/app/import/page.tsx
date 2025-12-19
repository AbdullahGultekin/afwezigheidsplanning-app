'use client'

import { useState } from 'react'
import { FileUp, Upload, CheckCircle, AlertCircle, Car, Clock } from 'lucide-react'
import Link from 'next/link'

interface ImportResult {
  message: string
  imported: {
    werknemers: number
    urenregistraties: number
    afwezigheden: number
  }
}

export default function ImportPage() {
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

      const res = await fetch('/api/import/excel', {
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
          <FileUp className="w-8 h-8 mr-3 text-blue-600" />
          Import Excel Data
        </h1>
        <p className="mt-2 text-gray-600">
          Importeer bestaande Excel data (afwezigheden, uren, kilometers)
        </p>
      </div>

      {/* Import Type Selector */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
        <Link
          href="/import-kilometers"
          className="bg-white rounded-lg shadow-sm p-6 border-2 border-transparent hover:border-blue-500 hover:shadow-md transition-all"
        >
          <div className="flex items-center mb-3">
            <div className="p-3 bg-blue-100 rounded-lg">
              <Car className="w-6 h-6 text-blue-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">
              Kilometers Import
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            Importeer Kilometer2026.xlsx met alle kilometers registraties
          </p>
          <p className="text-xs text-blue-600 mt-2">
            → Klik hier voor kilometers import
          </p>
        </Link>

        <div className="bg-white rounded-lg shadow-sm p-6 border-2 border-gray-200">
          <div className="flex items-center mb-3">
            <div className="p-3 bg-green-100 rounded-lg">
              <Clock className="w-6 h-6 text-green-600" />
            </div>
            <h3 className="ml-3 text-lg font-semibold text-gray-900">
              Algemene Import
            </h3>
          </div>
          <p className="text-sm text-gray-600">
            Importeer afwezigheidsplanning met uren en afwezigheden
          </p>
          <p className="text-xs text-gray-600 mt-2">
            ↓ Gebruik onderstaand formulier
          </p>
        </div>
      </div>

      {/* Import Card */}
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-green-100 rounded-full">
            <Upload className="w-12 h-12 text-green-600" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
          Excel Bestand Importeren
        </h2>

        <div className="space-y-6">
          {/* File Input */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecteer Excel Bestand
            </label>
            <div className="mt-1 flex justify-center px-6 pt-5 pb-6 border-2 border-gray-300 border-dashed rounded-lg hover:border-blue-400 transition-colors">
              <div className="space-y-1 text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="flex text-sm text-gray-600">
                  <label
                    htmlFor="file-input"
                    className="relative cursor-pointer bg-white rounded-md font-medium text-blue-600 hover:text-blue-500 focus-within:outline-none focus-within:ring-2 focus-within:ring-offset-2 focus-within:ring-blue-500"
                  >
                    <span>Upload een bestand</span>
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
            className="w-full flex items-center justify-center px-6 py-4 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium text-lg transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Importeren...
              </>
            ) : (
              <>
                <Upload className="w-5 h-5 mr-3" />
                Importeer Data
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
                  <li>• {result.imported.werknemers} werknemers</li>
                  <li>• {result.imported.urenregistraties} urenregistraties</li>
                  <li>• {result.imported.afwezigheden} afwezigheden</li>
                </ul>
              </div>
            </div>
          )}
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">ℹ️ Import Informatie</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Het systeem herkent automatisch werknemers en maanden</li>
            <li>• Bestaande werknemers worden niet dubbel aangemaakt</li>
            <li>• Afwezigheidscodes: V (Vakantie), Z (Ziek), P (Persoonlijk)</li>
            <li>• Numerieke waarden worden geïmporteerd als uren</li>
            <li>• Weekenden (G) worden automatisch genegeerd</li>
          </ul>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📖 Instructies voor Import
        </h3>
        <ol className="space-y-3 text-gray-700">
          <li className="flex">
            <span className="font-bold text-green-600 mr-3">1.</span>
            <span>Zorg dat uw Excel bestand de juiste structuur heeft (zoals het originele bestand)</span>
          </li>
          <li className="flex">
            <span className="font-bold text-green-600 mr-3">2.</span>
            <span>Elk werkblad moet een maandnaam bevatten (Januari, Februari, etc.)</span>
          </li>
          <li className="flex">
            <span className="font-bold text-green-600 mr-3">3.</span>
            <span>De eerste kolom moet werknemersnamen bevatten</span>
          </li>
          <li className="flex">
            <span className="font-bold text-green-600 mr-3">4.</span>
            <span>Selecteer het bestand en klik op "Importeer Data"</span>
          </li>
          <li className="flex">
            <span className="font-bold text-green-600 mr-3">5.</span>
            <span>Controleer na import of alle data correct is geïmporteerd</span>
          </li>
        </ol>
      </div>

      {/* Warning */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
          ⚠️ Let Op
        </h3>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li>• Import voegt data toe aan de bestaande database</li>
          <li>• Dubbele entries worden vermeden waar mogelijk</li>
          <li>• Maak een backup van uw huidige data voordat u importeert</li>
          <li>• Bij problemen kunt u werknemers handmatig verwijderen via de Werknemers pagina</li>
        </ul>
      </div>
    </div>
  )
}


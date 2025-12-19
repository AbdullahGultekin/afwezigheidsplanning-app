'use client'

import { useState } from 'react'
import { FileDown, Download, Calendar } from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'

export default function ExportPage() {
  const [selectedMonth, setSelectedMonth] = useState(format(new Date(), 'yyyy-MM'))
  const [loading, setLoading] = useState(false)

  const handleExport = async () => {
    setLoading(true)
    try {
      const res = await fetch(`/api/export/liantis?maand=${selectedMonth}`)
      
      if (res.ok) {
        const blob = await res.blob()
        const url = window.URL.createObjectURL(blob)
        const a = document.createElement('a')
        a.href = url
        a.download = `Liantis_Export_${selectedMonth}.xlsx`
        document.body.appendChild(a)
        a.click()
        window.URL.revokeObjectURL(url)
        document.body.removeChild(a)
      } else {
        alert('Fout bij exporteren. Controleer of er data beschikbaar is voor deze maand.')
      }
    } catch (error) {
      console.error('Error exporting:', error)
      alert('Er is een fout opgetreden bij het exporteren.')
    } finally {
      setLoading(false)
    }
  }

  // Genereer maand opties (vorig jaar tot volgend jaar)
  const generateMonthOptions = () => {
    const options = []
    const currentYear = new Date().getFullYear()
    
    for (let year = currentYear - 1; year <= currentYear + 1; year++) {
      for (let month = 1; month <= 12; month++) {
        const date = new Date(year, month - 1, 1)
        const value = format(date, 'yyyy-MM')
        const label = format(date, 'MMMM yyyy', { locale: nl })
        options.push({ value, label })
      }
    }
    
    return options
  }

  const monthOptions = generateMonthOptions()

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <FileDown className="w-8 h-8 mr-3 text-blue-600" />
          Export naar Liantis
        </h1>
        <p className="mt-2 text-gray-600">
          Download maandoverzicht voor sociaal secretariaat Liantis
        </p>
      </div>

      {/* Export Card */}
      <div className="bg-white rounded-lg shadow-sm p-8 max-w-2xl">
        <div className="flex items-center justify-center mb-6">
          <div className="p-4 bg-blue-100 rounded-full">
            <Download className="w-12 h-12 text-blue-600" />
          </div>
        </div>

        <h2 className="text-xl font-semibold text-gray-900 text-center mb-6">
          Maandoverzicht Exporteren
        </h2>

        <div className="space-y-6">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Selecteer Maand
            </label>
            <div className="relative">
              <Calendar className="absolute left-3 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
              <select
                value={selectedMonth}
                onChange={(e) => setSelectedMonth(e.target.value)}
                className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent text-lg"
              >
                {monthOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </select>
            </div>
          </div>

          <button
            onClick={handleExport}
            disabled={loading}
            className="w-full flex items-center justify-center px-6 py-4 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium text-lg transition-colors"
          >
            {loading ? (
              <>
                <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
                Exporteren...
              </>
            ) : (
              <>
                <Download className="w-5 h-5 mr-3" />
                Download Excel Bestand
              </>
            )}
          </button>
        </div>

        {/* Info Section */}
        <div className="mt-8 p-4 bg-blue-50 rounded-lg border border-blue-200">
          <h3 className="font-semibold text-blue-900 mb-2">📋 Export Informatie</h3>
          <ul className="text-sm text-blue-800 space-y-1">
            <li>• Het bestand bevat alle werknemers en hun uren/afwezigheden</li>
            <li>• Formaat is compatibel met Liantis systeem</li>
            <li>• Afwezigheden worden weergegeven als: V (Vakantie), Z (Ziek), P (Persoonlijk)</li>
            <li>• Weekenden worden automatisch gemarkeerd met 'W'</li>
            <li>• Totalen worden automatisch berekend</li>
          </ul>
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-8 bg-white rounded-lg shadow-sm p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          📖 Instructies voor Liantis
        </h3>
        <ol className="space-y-3 text-gray-700">
          <li className="flex">
            <span className="font-bold text-blue-600 mr-3">1.</span>
            <span>Selecteer de gewenste maand hierboven</span>
          </li>
          <li className="flex">
            <span className="font-bold text-blue-600 mr-3">2.</span>
            <span>Klik op "Download Excel Bestand"</span>
          </li>
          <li className="flex">
            <span className="font-bold text-blue-600 mr-3">3.</span>
            <span>Open het gedownloade bestand en controleer de gegevens</span>
          </li>
          <li className="flex">
            <span className="font-bold text-blue-600 mr-3">4.</span>
            <span>Upload het bestand naar het Liantis portaal of stuur per email</span>
          </li>
        </ol>
      </div>

      {/* Support Info */}
      <div className="mt-8 bg-yellow-50 border border-yellow-200 rounded-lg p-6 max-w-2xl">
        <h3 className="text-lg font-semibold text-yellow-900 mb-2">
          💡 Tips
        </h3>
        <ul className="text-sm text-yellow-800 space-y-2">
          <li>• Exporteer aan het einde van elke maand voor nauwkeurige gegevens</li>
          <li>• Controleer of alle uren en afwezigheden correct zijn geregistreerd</li>
          <li>• Bewaar een kopie van het bestand voor uw eigen administratie</li>
          <li>• Bij vragen over het formaat, neem contact op met Liantis</li>
        </ul>
      </div>
    </div>
  )
}


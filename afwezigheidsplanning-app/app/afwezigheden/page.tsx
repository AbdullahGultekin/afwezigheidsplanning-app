'use client'

import { useEffect, useState } from 'react'
import { Calendar, Plus, Trash2, Check, X, Table } from 'lucide-react'
import { format } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'

interface Werknemer {
  id: string
  naam: string
  vakantiedagenTotaal: number
  vakantiedagenOpgenomen: number
}

interface Afwezigheid {
  id: string
  werknemerId: string
  startDatum: string
  eindDatum: string
  type: string
  uren?: number
  opmerking?: string
  goedgekeurd: boolean
  werknemer: {
    id: string
    naam: string
  }
}

const afwezigheidTypes = [
  { value: 'VAKANTIE', label: 'Vakantie (V)', color: 'bg-blue-100 text-blue-800' },
  { value: 'ZIEK', label: 'Ziek (Z)', color: 'bg-red-100 text-red-800' },
  { value: 'PERSOONLIJK', label: 'Persoonlijk (P)', color: 'bg-purple-100 text-purple-800' },
  { value: 'AANGEPAST_1', label: 'Aangepast 1', color: 'bg-yellow-100 text-yellow-800' },
  { value: 'AANGEPAST_2', label: 'Aangepast 2', color: 'bg-green-100 text-green-800' },
]

export default function AfwezighedenPage() {
  const [werknemers, setWerknemers] = useState<Werknemer[]>([])
  const [afwezigheden, setAfwezigheden] = useState<Afwezigheid[]>([])
  const [selectedWerknemer, setSelectedWerknemer] = useState<string>('')
  const [showForm, setShowForm] = useState(false)
  const [loading, setLoading] = useState(false)

  // Form state
  const [startDatum, setStartDatum] = useState('')
  const [eindDatum, setEindDatum] = useState('')
  const [type, setType] = useState('VAKANTIE')
  const [opmerking, setOpmerking] = useState('')

  useEffect(() => {
    fetchWerknemers()
    fetchAfwezigheden()
  }, [])

  useEffect(() => {
    if (selectedWerknemer) {
      fetchAfwezigheden()
    }
  }, [selectedWerknemer])

  const fetchWerknemers = async () => {
    try {
      const res = await fetch('/api/werknemers')
      const data = await res.json()
      if (Array.isArray(data)) {
        setWerknemers(data.filter((w: any) => w.actief))
      }
    } catch (error) {
      console.error('Error fetching werknemers:', error)
    }
  }

  const fetchAfwezigheden = async () => {
    try {
      const url = selectedWerknemer 
        ? `/api/afwezigheden?werknemerId=${selectedWerknemer}`
        : '/api/afwezigheden'
      const res = await fetch(url)
      const data = await res.json()
      if (Array.isArray(data)) {
        setAfwezigheden(data)
      }
    } catch (error) {
      console.error('Error fetching afwezigheden:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWerknemer || !startDatum || !eindDatum) return

    setLoading(true)
    try {
      const res = await fetch('/api/afwezigheden', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          werknemerId: selectedWerknemer,
          startDatum: new Date(startDatum).toISOString(),
          eindDatum: new Date(eindDatum).toISOString(),
          type,
          opmerking: opmerking || null,
          goedgekeurd: true
        })
      })

      if (res.ok) {
        setShowForm(false)
        setStartDatum('')
        setEindDatum('')
        setType('VAKANTIE')
        setOpmerking('')
        fetchAfwezigheden()
        fetchWerknemers() // Refresh om vakantiedagen bij te werken
      }
    } catch (error) {
      console.error('Error saving afwezigheid:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet u zeker dat u deze afwezigheid wilt verwijderen?')) return

    try {
      const res = await fetch(`/api/afwezigheden/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchAfwezigheden()
        fetchWerknemers() // Refresh om vakantiedagen bij te werken
      }
    } catch (error) {
      console.error('Error deleting afwezigheid:', error)
    }
  }

  const getTypeInfo = (type: string) => {
    return afwezigheidTypes.find(t => t.value === type) || afwezigheidTypes[0]
  }

  const calculateDays = (start: string, end: string) => {
    const startDate = new Date(start)
    const endDate = new Date(end)
    const diffTime = Math.abs(endDate.getTime() - startDate.getTime())
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1
    return diffDays
  }

  const selectedWerknemerData = werknemers.find(w => w.id === selectedWerknemer)

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Calendar className="w-8 h-8 mr-3 text-blue-600" />
              Afwezigheden & Vakantiedagen
            </h1>
            <p className="mt-2 text-gray-600">
              Beheer vakantiedagen, ziekte en andere afwezigheden
            </p>
          </div>
          <Link
            href="/afwezigheden/bulk"
            className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
          >
            <Table className="w-4 h-4 mr-2" /> Maandoverzicht
          </Link>
        </div>
      </div>

      {/* Werknemer Selectie & Info */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecteer Werknemer
        </label>
        <select
          value={selectedWerknemer}
          onChange={(e) => setSelectedWerknemer(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent mb-4"
        >
          <option value="">-- Alle werknemers --</option>
          {werknemers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.naam}
            </option>
          ))}
        </select>

        {selectedWerknemerData && (
          <div className="mt-4 p-4 bg-blue-50 rounded-lg border border-blue-200">
            <h3 className="font-semibold text-blue-900 mb-2">Vakantiedagen Overzicht</h3>
            <div className="grid grid-cols-3 gap-4 text-center">
              <div>
                <p className="text-sm text-blue-700">Totaal</p>
                <p className="text-2xl font-bold text-blue-900">
                  {selectedWerknemerData.vakantiedagenTotaal}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Opgenomen</p>
                <p className="text-2xl font-bold text-orange-600">
                  {selectedWerknemerData.vakantiedagenOpgenomen}
                </p>
              </div>
              <div>
                <p className="text-sm text-blue-700">Resterend</p>
                <p className="text-2xl font-bold text-green-600">
                  {selectedWerknemerData.vakantiedagenTotaal - selectedWerknemerData.vakantiedagenOpgenomen}
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Add Button */}
      {selectedWerknemer && !showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nieuwe Afwezigheid Toevoegen
        </button>
      )}

      {/* Form */}
      {showForm && selectedWerknemer && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            Nieuwe Afwezigheid Registreren
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Startdatum
                </label>
                <input
                  type="date"
                  value={startDatum}
                  onChange={(e) => setStartDatum(e.target.value)}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Einddatum
                </label>
                <input
                  type="date"
                  value={eindDatum}
                  onChange={(e) => setEindDatum(e.target.value)}
                  min={startDatum}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                  required
                />
              </div>
            </div>

            {startDatum && eindDatum && (
              <div className="p-3 bg-gray-50 rounded-lg">
                <p className="text-sm text-gray-700">
                  Aantal dagen: <span className="font-bold">{calculateDays(startDatum, eindDatum)}</span>
                </p>
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Type Afwezigheid
              </label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                {afwezigheidTypes.map((t) => (
                  <option key={t.value} value={t.value}>
                    {t.label}
                  </option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Opmerking (optioneel)
              </label>
              <textarea
                value={opmerking}
                onChange={(e) => setOpmerking(e.target.value)}
                rows={2}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="Bijv. reden, contactpersoon, etc."
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {loading ? 'Opslaan...' : 'Opslaan'}
              </button>
              <button
                type="button"
                onClick={() => {
                  setShowForm(false)
                  setStartDatum('')
                  setEindDatum('')
                  setType('VAKANTIE')
                  setOpmerking('')
                }}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Afwezigheden Lijst */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          {selectedWerknemer ? 'Afwezigheden' : 'Alle Afwezigheden'}
        </h3>
        {afwezigheden.length === 0 ? (
          <p className="text-gray-500 text-center py-8">
            Geen afwezigheden gevonden
          </p>
        ) : (
          <div className="space-y-3">
            {afwezigheden.map((afwezigheid) => {
              const typeInfo = getTypeInfo(afwezigheid.type)
              const dagen = calculateDays(afwezigheid.startDatum, afwezigheid.eindDatum)
              
              return (
                <div
                  key={afwezigheid.id}
                  className="flex items-center justify-between p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors"
                >
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <span className={`px-3 py-1 rounded-full text-xs font-semibold ${typeInfo.color}`}>
                        {typeInfo.label}
                      </span>
                      {afwezigheid.goedgekeurd ? (
                        <span className="flex items-center text-xs text-green-600">
                          <Check className="w-4 h-4 mr-1" />
                          Goedgekeurd
                        </span>
                      ) : (
                        <span className="flex items-center text-xs text-orange-600">
                          <X className="w-4 h-4 mr-1" />
                          In afwachting
                        </span>
                      )}
                    </div>
                    <p className="font-medium text-gray-900">
                      {!selectedWerknemer && `${afwezigheid.werknemer.naam} - `}
                      {format(new Date(afwezigheid.startDatum), 'dd MMM yyyy', { locale: nl })}
                      {' → '}
                      {format(new Date(afwezigheid.eindDatum), 'dd MMM yyyy', { locale: nl })}
                      <span className="text-sm text-gray-600 ml-2">
                        ({dagen} {dagen === 1 ? 'dag' : 'dagen'})
                      </span>
                    </p>
                    {afwezigheid.opmerking && (
                      <p className="text-sm text-gray-600 mt-1">{afwezigheid.opmerking}</p>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(afwezigheid.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg ml-4"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}


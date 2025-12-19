'use client'

import { useEffect, useState } from 'react'
import { Car, Save, Calendar as CalendarIcon } from 'lucide-react'
import { format, getDaysInMonth } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'

interface Werknemer {
  id: string
  naam: string
}

interface KmData {
  [werknemerId: string]: {
    [dag: number]: number | ''
  }
}

export default function KilometersBulkPage() {
  const [werknemers, setWerknemers] = useState<Werknemer[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [kmData, setKmData] = useState<KmData>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchWerknemers()
  }, [])

  useEffect(() => {
    if (werknemers.length > 0) {
      fetchKmData()
    }
  }, [werknemers, selectedMonth])

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

  const fetchKmData = async () => {
    setLoading(true)
    try {
      const maand = format(selectedMonth, 'yyyy-MM')
      const newData: KmData = {}

      for (const werknemer of werknemers) {
        const res = await fetch(`/api/kilometers?werknemerId=${werknemer.id}&maand=${maand}`)
        const kilometers = await res.json()
        
        newData[werknemer.id] = {}
        if (Array.isArray(kilometers)) {
          kilometers.forEach((k: any) => {
            const dag = new Date(k.datum).getDate()
            newData[werknemer.id][dag] = k.kilometers
          })
        }
      }

      setKmData(newData)
    } catch (error) {
      console.error('Error fetching kilometers:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCellChange = (werknemerId: string, dag: number, value: string) => {
    const numValue = value === '' ? '' : parseFloat(value)
    
    setKmData(prev => ({
      ...prev,
      [werknemerId]: {
        ...(prev[werknemerId] || {}),
        [dag]: numValue
      }
    }))
  }

  const handleSaveAll = async () => {
    setSaving(true)
    try {
      let savedCount = 0

      for (const werknemerId in kmData) {
        for (const dag in kmData[werknemerId]) {
          const km = kmData[werknemerId][parseInt(dag)]
          
          if (km !== '' && km > 0) {
            const datum = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), parseInt(dag))
            
            await fetch('/api/kilometers', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                werknemerId,
                datum: datum.toISOString(),
                kilometers: km
              })
            })
            savedCount++
          }
        }
      }

      alert(`✅ ${savedCount} kilometers registraties opgeslagen!`)
      fetchKmData()
    } catch (error) {
      console.error('Error saving kilometers:', error)
      alert('❌ Fout bij opslaan')
    } finally {
      setSaving(false)
    }
  }

  const daysInMonth = getDaysInMonth(selectedMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const KM_TARIEF = 0.40 // €0.40 per kilometer

  const getTotaalVoorWerknemer = (werknemerId: string) => {
    const data = kmData[werknemerId] || {}
    return Object.values(data).reduce((sum: number, val) => sum + (typeof val === 'number' ? val : 0), 0)
  }

  const getKostenVoorWerknemer = (werknemerId: string) => {
    const totaalKm = getTotaalVoorWerknemer(werknemerId)
    return totaalKm * KM_TARIEF
  }

  const getTotaalVoorDag = (dag: number) => {
    let totaal = 0
    for (const werknemerId in kmData) {
      const km = kmData[werknemerId][dag]
      if (typeof km === 'number') totaal += km
    }
    return totaal
  }

  const getTotaalKosten = () => {
    let totaal = 0
    for (const werknemerId in kmData) {
      totaal += getKostenVoorWerknemer(werknemerId)
    }
    return totaal
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Car className="w-8 h-8 mr-3 text-blue-600" />
              Kilometers Maandoverzicht (Excel-stijl)
            </h1>
            <p className="mt-2 text-gray-600">
              Alle werknemers in één overzicht - direct aanpassen
            </p>
          </div>
          <Link
            href="/kilometers"
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            ← Terug naar kalender
          </Link>
        </div>
      </div>

      {/* Maand Selectie en Totalen */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between mb-4">
          <button
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            ← Vorige
          </button>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            {format(selectedMonth, 'MMMM yyyy', { locale: nl })}
          </h2>
          <button
            onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
            className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Volgende →
          </button>
        </div>
        
        {/* Maand Totalen */}
        <div className="grid grid-cols-3 gap-4 pt-4 border-t">
          <div className="text-center">
            <p className="text-sm text-gray-600">Totaal Kilometers</p>
            <p className="text-2xl font-bold text-blue-600">
              {werknemers.reduce((sum, w) => sum + getTotaalVoorWerknemer(w.id), 0)} km
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Tarief</p>
            <p className="text-2xl font-bold text-gray-900">
              €{KM_TARIEF.toFixed(2)} / km
            </p>
          </div>
          <div className="text-center">
            <p className="text-sm text-gray-600">Totaal Te Betalen</p>
            <p className="text-2xl font-bold text-green-600">
              €{getTotaalKosten().toFixed(2)}
            </p>
          </div>
        </div>
      </div>

      {/* Save Button */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <button
          onClick={handleSaveAll}
          disabled={saving}
          className="w-full flex items-center justify-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:bg-gray-400 font-medium"
        >
          {saving ? (
            <>
              <div className="animate-spin rounded-full h-5 w-5 border-b-2 border-white mr-3"></div>
              Opslaan...
            </>
          ) : (
            <>
              <Save className="w-5 h-5 mr-2" />
              Alle Wijzigingen Opslaan
            </>
          )}
        </button>
      </div>

      {/* Tabel */}
      <div className="bg-white rounded-lg shadow-sm overflow-x-auto">
        {loading ? (
          <div className="p-8 text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
            <p className="mt-4 text-gray-600">Laden...</p>
          </div>
        ) : (
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50 sticky top-0">
              <tr>
                <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                  Werknemer
                </th>
                {days.map(dag => (
                  <th key={dag} className="px-2 py-3 text-center text-xs font-medium text-gray-500 uppercase">
                    {dag}
                  </th>
                ))}
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                  Totaal KM
                </th>
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50">
                  Te Betalen
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {werknemers.map((werknemer) => (
                <tr key={werknemer.id} className="hover:bg-gray-50">
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white">
                    {werknemer.naam}
                  </td>
                  {days.map(dag => {
                    const value = kmData[werknemer.id]?.[dag] ?? ''
                    return (
                      <td key={dag} className="px-1 py-1">
                        <input
                          type="number"
                          step="0.1"
                          min="0"
                          value={value}
                          onChange={(e) => handleCellChange(werknemer.id, dag, e.target.value)}
                          className="w-16 px-2 py-1 text-center text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="-"
                        />
                      </td>
                    )
                  })}
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-blue-600 text-center bg-white">
                    {getTotaalVoorWerknemer(werknemer.id)} km
                  </td>
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-green-600 text-center sticky right-0 bg-white">
                    €{getKostenVoorWerknemer(werknemer.id).toFixed(2)}
                  </td>
                </tr>
              ))}
              
              {/* Totaal Rij */}
              <tr className="bg-gray-100 font-bold">
                <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 sticky left-0 bg-gray-100">
                  TOTAAL
                </td>
                {days.map(dag => (
                  <td key={dag} className="px-2 py-3 text-center text-sm text-gray-900">
                    {getTotaalVoorDag(dag) || '-'}
                  </td>
                ))}
                <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-900 text-center bg-gray-100">
                  {werknemers.reduce((sum, w) => sum + getTotaalVoorWerknemer(w.id), 0)} km
                </td>
                <td className="px-4 py-3 whitespace-nowrap text-sm text-green-900 text-center sticky right-0 bg-gray-100">
                  €{getTotaalKosten().toFixed(2)}
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>

      {/* Info */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips:</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Vul direct kilometers in per werknemer per dag</li>
          <li>• Gebruik Tab toets om snel door de cellen te gaan</li>
          <li>• Wijzigingen worden pas opgeslagen na klik op "Alle Wijzigingen Opslaan"</li>
          <li>• Laat cellen leeg voor dagen zonder kilometers</li>
          <li>• <strong>Kosten worden automatisch berekend: Kilometers × €{KM_TARIEF.toFixed(2)}</strong></li>
        </ul>
      </div>
    </div>
  )
}


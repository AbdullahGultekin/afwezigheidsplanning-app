'use client'

import { useEffect, useState } from 'react'
import { Clock, Save, Calendar as CalendarIcon } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDaysInMonth } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'

interface Werknemer {
  id: string
  naam: string
}

interface UrenData {
  [werknemerId: string]: {
    [dag: number]: number | ''
  }
}

export default function UrenBulkPage() {
  const [werknemers, setWerknemers] = useState<Werknemer[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [urenData, setUrenData] = useState<UrenData>({})
  const [loading, setLoading] = useState(false)
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    fetchWerknemers()
  }, [])

  useEffect(() => {
    if (werknemers.length > 0) {
      fetchUrenData()
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

  const fetchUrenData = async () => {
    setLoading(true)
    try {
      const maand = format(selectedMonth, 'yyyy-MM')
      const newData: UrenData = {}

      for (const werknemer of werknemers) {
        const res = await fetch(`/api/uren?werknemerId=${werknemer.id}&maand=${maand}`)
        const uren = await res.json()
        
        newData[werknemer.id] = {}
        if (Array.isArray(uren)) {
          uren.forEach((u: any) => {
            const dag = new Date(u.datum).getDate()
            newData[werknemer.id][dag] = u.uren
          })
        }
      }

      setUrenData(newData)
    } catch (error) {
      console.error('Error fetching uren:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleCellChange = (werknemerId: string, dag: number, value: string) => {
    const numValue = value === '' ? '' : parseFloat(value)
    
    setUrenData(prev => ({
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

      for (const werknemerId in urenData) {
        for (const dag in urenData[werknemerId]) {
          const uren = urenData[werknemerId][parseInt(dag)]
          
          if (uren !== '' && uren > 0) {
            const datum = new Date(selectedMonth.getFullYear(), selectedMonth.getMonth(), parseInt(dag))
            
            await fetch('/api/uren', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                werknemerId,
                datum: datum.toISOString(),
                uren
              })
            })
            savedCount++
          }
        }
      }

      alert(`✅ ${savedCount} uren registraties opgeslagen!`)
      fetchUrenData()
    } catch (error) {
      console.error('Error saving uren:', error)
      alert('❌ Fout bij opslaan')
    } finally {
      setSaving(false)
    }
  }

  const daysInMonth = getDaysInMonth(selectedMonth)
  const days = Array.from({ length: daysInMonth }, (_, i) => i + 1)

  const getTotaalVoorWerknemer = (werknemerId: string) => {
    const data = urenData[werknemerId] || {}
    return Object.values(data).reduce((sum: number, val) => sum + (typeof val === 'number' ? val : 0), 0)
  }

  const getTotaalVoorDag = (dag: number) => {
    let totaal = 0
    for (const werknemerId in urenData) {
      const uren = urenData[werknemerId][dag]
      if (typeof uren === 'number') totaal += uren
    }
    return totaal
  }

  return (
    <div>
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Clock className="w-8 h-8 mr-3 text-blue-600" />
              Uren Maandoverzicht (Excel-stijl)
            </h1>
            <p className="mt-2 text-gray-600">
              Alle werknemers in één overzicht - direct aanpassen
            </p>
          </div>
          <Link
            href="/uren"
            className="px-4 py-2 text-sm text-blue-600 hover:text-blue-700 border border-blue-600 rounded-lg hover:bg-blue-50"
          >
            ← Terug naar kalender
          </Link>
        </div>
      </div>

      {/* Maand Selectie */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
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
                <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider sticky right-0 bg-gray-50">
                  Totaal
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
                    const value = urenData[werknemer.id]?.[dag] ?? ''
                    return (
                      <td key={dag} className="px-1 py-1">
                        <input
                          type="number"
                          step="0.5"
                          min="0"
                          max="24"
                          value={value}
                          onChange={(e) => handleCellChange(werknemer.id, dag, e.target.value)}
                          className="w-16 px-2 py-1 text-center text-sm border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                          placeholder="-"
                        />
                      </td>
                    )
                  })}
                  <td className="px-4 py-2 whitespace-nowrap text-sm font-bold text-blue-600 text-center sticky right-0 bg-white">
                    {getTotaalVoorWerknemer(werknemer.id)}
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
                <td className="px-4 py-3 whitespace-nowrap text-sm text-blue-900 text-center sticky right-0 bg-gray-100">
                  {werknemers.reduce((sum, w) => sum + getTotaalVoorWerknemer(w.id), 0)}
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
          <li>• Vul direct uren in per werknemer per dag</li>
          <li>• Gebruik Tab toets om snel door de cellen te gaan</li>
          <li>• Wijzigingen worden pas opgeslagen na klik op "Alle Wijzigingen Opslaan"</li>
          <li>• Laat cellen leeg voor dagen zonder uren</li>
        </ul>
      </div>
    </div>
  )
}


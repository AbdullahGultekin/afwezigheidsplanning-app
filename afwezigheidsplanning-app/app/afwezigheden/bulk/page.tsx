'use client'

import { useEffect, useState } from 'react'
import { Calendar as CalendarIcon, Users, ChevronLeft, ChevronRight, Plus, Edit, X } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, getDay, isSameDay } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'

interface Werknemer {
  id: string
  naam: string
  actief?: boolean
}

interface Afwezigheid {
  id: string
  werknemerId: string
  startDatum: string
  eindDatum: string
  type: string
  uren?: number
  opmerking?: string
}

const afwezigheidTypes = [
  { value: 'VAKANTIE', label: 'Vakantie', color: 'bg-green-100 text-green-800' },
  { value: 'ZIEK', label: 'Ziek', color: 'bg-red-100 text-red-800' },
  { value: 'PERSOONLIJK', label: 'Persoonlijk', color: 'bg-blue-100 text-blue-800' },
  { value: 'AANGEPAST_1', label: 'Aangepast 1', color: 'bg-purple-100 text-purple-800' },
  { value: 'AANGEPAST_2', label: 'Aangepast 2', color: 'bg-orange-100 text-orange-800' }
]

// Nederlandse feestdagen (vast)
const getFeestdagen = (year: number): Date[] => {
  const feestdagen: Date[] = []
  
  // Vaste feestdagen
  feestdagen.push(new Date(year, 0, 1))   // Nieuwjaarsdag
  feestdagen.push(new Date(year, 3, 27))  // Koningsdag (27 april)
  feestdagen.push(new Date(year, 4, 5))   // Bevrijdingsdag (5 mei)
  feestdagen.push(new Date(year, 11, 25)) // Eerste Kerstdag
  feestdagen.push(new Date(year, 11, 26)) // Tweede Kerstdag
  
  // Pasen berekenen (eerste zondag na eerste volle maan na 21 maart)
  // Vereenvoudigde versie: gebruik bekende datums voor 2024-2027
  const paasData: { [key: number]: { paaszondag: number, pinksteren: number } } = {
    2024: { paaszondag: 31, pinksteren: 19 },
    2025: { paaszondag: 20, pinksteren: 8 },
    2026: { paaszondag: 5, pinksteren: 24 },
    2027: { paaszondag: 28, pinksteren: 16 }
  }
  
  if (paasData[year]) {
    feestdagen.push(new Date(year, 2, paasData[year].paaszondag))      // Paaszondag
    feestdagen.push(new Date(year, 2, paasData[year].paaszondag + 1))  // Tweede Paasdag
    feestdagen.push(new Date(year, 4, paasData[year].paaszondag + 39)) // Hemelvaart
    feestdagen.push(new Date(year, 4, paasData[year].pinksteren))      // Eerste Pinksterdag
    feestdagen.push(new Date(year, 4, paasData[year].pinksteren + 1))  // Tweede Pinksterdag
  }
  
  return feestdagen
}

// Check of dag een werkdag is (maandag = gesloten, feestdagen = open)
const isWerkdag = (datum: Date, feestdagen: Date[]): boolean => {
  const dagVanWeek = getDay(datum) // 0 = zondag, 1 = maandag, etc.
  
  // Maandag = gesloten
  if (dagVanWeek === 1) return false
  
  // Feestdagen = open (werkdag)
  const isFeestdag = feestdagen.some(fd => isSameDay(fd, datum))
  if (isFeestdag) return true
  
  // Alle andere dagen (inclusief weekend) = werkdag
  return true
}

// Check of dag gesloten is (maandag)
const isGesloten = (datum: Date): boolean => {
  return getDay(datum) === 1 // Maandag
}

export default function BulkAfwezighedenPage() {
  const [werknemers, setWerknemers] = useState<Werknemer[]>([])
  const [afwezigheden, setAfwezigheden] = useState<Afwezigheid[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [loading, setLoading] = useState(false)
  const [editingCell, setEditingCell] = useState<{ werknemerId: string; datum: Date } | null>(null)
  const [showForm, setShowForm] = useState(false)
  const [formData, setFormData] = useState({
    werknemerId: '',
    startDatum: '',
    eindDatum: '',
    type: 'VAKANTIE',
    opmerking: ''
  })

  const feestdagen = getFeestdagen(selectedMonth.getFullYear())
  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth)
  })

  useEffect(() => {
    fetchWerknemers()
  }, [])

  useEffect(() => {
    fetchAfwezigheden()
  }, [selectedMonth])

  const fetchWerknemers = async () => {
    try {
      const res = await fetch('/api/werknemers')
      const data = await res.json()
      if (Array.isArray(data)) {
        setWerknemers(data.filter((w: Werknemer) => w.actief !== false))
      }
    } catch (error) {
      console.error('Error fetching werknemers:', error)
    }
  }

  const fetchAfwezigheden = async () => {
    setLoading(true)
    try {
      const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd')
      const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd')

      const res = await fetch(`/api/afwezigheden?startDate=${startDate}&endDate=${endDate}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setAfwezigheden(data)
      }
    } catch (error) {
      console.error('Error fetching afwezigheden:', error)
    } finally {
      setLoading(false)
    }
  }

  const getAfwezigheidVoorDag = (werknemerId: string, datum: Date) => {
    return afwezigheden.find(afw => {
      if (afw.werknemerId !== werknemerId) return false
      
      const start = new Date(afw.startDatum)
      const eind = new Date(afw.eindDatum)
      
      return datum >= start && datum <= eind
    })
  }

  const getAfwezigheidLabel = (type: string) => {
    const typeMap: { [key: string]: { label: string; color: string; bgColor: string } } = {
      'VAKANTIE': { label: 'V', color: 'text-green-800', bgColor: 'bg-green-100' },
      'ZIEK': { label: 'Z', color: 'text-red-800', bgColor: 'bg-red-100' },
      'PERSOONLIJK': { label: 'P', color: 'text-blue-800', bgColor: 'bg-blue-100' },
      'AANGEPAST_1': { label: 'A1', color: 'text-purple-800', bgColor: 'bg-purple-100' },
      'AANGEPAST_2': { label: 'A2', color: 'text-orange-800', bgColor: 'bg-orange-100' }
    }
    return typeMap[type] || { label: type.substring(0, 2), color: 'text-gray-800', bgColor: 'bg-gray-100' }
  }

  const handleCellClick = (werknemerId: string, datum: Date) => {
    if (isGesloten(datum)) return // Maandag = gesloten, kan niet bewerken
    
    const existing = getAfwezigheidVoorDag(werknemerId, datum)
    if (existing) {
      // Bewerk bestaande afwezigheid
      setFormData({
        werknemerId,
        startDatum: format(new Date(existing.startDatum), 'yyyy-MM-dd'),
        eindDatum: format(new Date(existing.eindDatum), 'yyyy-MM-dd'),
        type: existing.type,
        opmerking: existing.opmerking || ''
      })
      setEditingCell({ werknemerId, datum })
    } else {
      // Nieuwe afwezigheid
      const datumStr = format(datum, 'yyyy-MM-dd')
      setFormData({
        werknemerId,
        startDatum: datumStr,
        eindDatum: datumStr,
        type: 'VAKANTIE',
        opmerking: ''
      })
      setEditingCell({ werknemerId, datum })
    }
    setShowForm(true)
  }

  const handleSave = async () => {
    try {
      const payload = {
        werknemerId: formData.werknemerId,
        startDatum: formData.startDatum,
        eindDatum: formData.eindDatum,
        type: formData.type,
        opmerking: formData.opmerking || null
      }

      const existing = afwezigheden.find(afw => 
        afw.werknemerId === formData.werknemerId &&
        format(new Date(afw.startDatum), 'yyyy-MM-dd') === formData.startDatum
      )

      if (existing) {
        // Update
        await fetch(`/api/afwezigheden/${existing.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        // Create
        await fetch('/api/afwezigheden', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      setShowForm(false)
      setEditingCell(null)
      fetchAfwezigheden()
      fetchWerknemers() // Refresh voor vakantiedagen
    } catch (error) {
      console.error('Error saving afwezigheid:', error)
      alert('Fout bij opslaan')
    }
  }

  const handleDelete = async () => {
    if (!editingCell) return
    
    const existing = getAfwezigheidVoorDag(editingCell.werknemerId, editingCell.datum)
    if (!existing) return

    if (!confirm('Weet u zeker dat u deze afwezigheid wilt verwijderen?')) return

    try {
      await fetch(`/api/afwezigheden/${existing.id}`, { method: 'DELETE' })
      setShowForm(false)
      setEditingCell(null)
      fetchAfwezigheden()
      fetchWerknemers()
    } catch (error) {
      console.error('Error deleting afwezigheid:', error)
    }
  }

  const getTotaalAfwezigDagen = (werknemerId: string) => {
    let count = 0
    daysInMonth.forEach(dag => {
      if (isWerkdag(dag, feestdagen) && getAfwezigheidVoorDag(werknemerId, dag)) {
        count++
      }
    })
    return count
  }

  const getTotaalAanwezigDagen = (werknemerId: string) => {
    let count = 0
    daysInMonth.forEach(dag => {
      if (isWerkdag(dag, feestdagen) && !getAfwezigheidVoorDag(werknemerId, dag)) {
        count++
      }
    })
    return count
  }

  const getBeschikbareWerknemersVoorDag = (dag: Date) => {
    if (!isWerkdag(dag, feestdagen)) return 0
    return werknemers.filter(w => !getAfwezigheidVoorDag(w.id, dag)).length
  }

  const getWerkdagenInMaand = () => {
    return daysInMonth.filter(d => isWerkdag(d, feestdagen)).length
  }

  const previousMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))
  }

  const nextMonth = () => {
    setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))
  }

  return (
    <div className="container mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-800 flex items-center">
            <CalendarIcon className="w-8 h-8 mr-3 text-blue-600" />
            Afwezigheden & Vakantie Overzicht
          </h1>
          <p className="mt-2 text-gray-600">
            Maandoverzicht - Klik op een cel om afwezigheid toe te voegen/bewerken
          </p>
        </div>
        <Link
          href="/afwezigheden"
          className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
        >
          ← Terug naar Afwezigheden
        </Link>
      </div>

      {/* Maand Navigatie */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <div className="flex items-center justify-between">
          <button
            onClick={previousMonth}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            <ChevronLeft className="w-4 h-4 mr-1" />
            Vorige
          </button>
          <h2 className="text-xl font-semibold text-gray-900 flex items-center">
            <CalendarIcon className="w-5 h-5 mr-2" />
            {format(selectedMonth, 'MMMM yyyy', { locale: nl })}
          </h2>
          <button
            onClick={nextMonth}
            className="flex items-center px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
          >
            Volgende
            <ChevronRight className="w-4 h-4 ml-1" />
          </button>
        </div>
      </div>

      {/* Legenda */}
      <div className="bg-white rounded-lg shadow-sm p-4 mb-6">
        <h3 className="text-sm font-semibold text-gray-700 mb-3">Legenda:</h3>
        <div className="flex flex-wrap gap-4">
          <div className="flex items-center">
            <span className="w-8 h-8 bg-green-100 text-green-800 rounded flex items-center justify-center text-xs font-bold mr-2">V</span>
            <span className="text-sm text-gray-700">Vakantie</span>
          </div>
          <div className="flex items-center">
            <span className="w-8 h-8 bg-red-100 text-red-800 rounded flex items-center justify-center text-xs font-bold mr-2">Z</span>
            <span className="text-sm text-gray-700">Ziek</span>
          </div>
          <div className="flex items-center">
            <span className="w-8 h-8 bg-blue-100 text-blue-800 rounded flex items-center justify-center text-xs font-bold mr-2">P</span>
            <span className="text-sm text-gray-700">Persoonlijk</span>
          </div>
          <div className="flex items-center">
            <span className="w-8 h-8 bg-gray-300 text-gray-700 rounded flex items-center justify-center text-xs font-bold mr-2">M</span>
            <span className="text-sm text-gray-700">Maandag (Gesloten)</span>
          </div>
          <div className="flex items-center">
            <span className="w-8 h-8 bg-yellow-100 text-yellow-800 rounded flex items-center justify-center text-xs font-bold mr-2">F</span>
            <span className="text-sm text-gray-700">Feestdag (Open)</span>
          </div>
          <div className="flex items-center">
            <span className="w-8 h-8 bg-white border-2 border-green-500 rounded flex items-center justify-center text-xs font-bold mr-2">✓</span>
            <span className="text-sm text-gray-700">Beschikbaar</span>
          </div>
        </div>
      </div>

      {/* Form Modal */}
      {showForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
            <div className="flex items-center justify-between p-4 border-b">
              <h3 className="text-lg font-semibold text-gray-900">
                {editingCell && getAfwezigheidVoorDag(editingCell.werknemerId, editingCell.datum) ? 'Bewerk Afwezigheid' : 'Nieuwe Afwezigheid'}
              </h3>
              <button
                onClick={() => {
                  setShowForm(false)
                  setEditingCell(null)
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Werknemer
                </label>
                <select
                  value={formData.werknemerId}
                  onChange={(e) => setFormData({ ...formData, werknemerId: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  disabled
                >
                  <option value="">Selecteer...</option>
                  {werknemers.map(w => (
                    <option key={w.id} value={w.id}>{w.naam}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Type
                </label>
                <select
                  value={formData.type}
                  onChange={(e) => setFormData({ ...formData, type: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {afwezigheidTypes.map(t => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Start Datum
                  </label>
                  <input
                    type="date"
                    value={formData.startDatum}
                    onChange={(e) => setFormData({ ...formData, startDatum: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Eind Datum
                  </label>
                  <input
                    type="date"
                    value={formData.eindDatum}
                    onChange={(e) => setFormData({ ...formData, eindDatum: e.target.value })}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Opmerking (optioneel)
                </label>
                <input
                  type="text"
                  value={formData.opmerking}
                  onChange={(e) => setFormData({ ...formData, opmerking: e.target.value })}
                  className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Bijv. Doktersafspraak"
                />
              </div>

              <div className="flex gap-3 pt-4">
                {editingCell && getAfwezigheidVoorDag(editingCell.werknemerId, editingCell.datum) && (
                  <button
                    onClick={handleDelete}
                    className="flex-1 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                  >
                    Verwijderen
                  </button>
                )}
                <button
                  onClick={() => {
                    setShowForm(false)
                    setEditingCell(null)
                  }}
                  className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300"
                >
                  Annuleren
                </button>
                <button
                  onClick={handleSave}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                >
                  Opslaan
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {loading ? (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Laden...</p>
        </div>
      ) : (
        <>
          {/* Overzichtstabel */}
          <div className="bg-white shadow-md rounded-lg overflow-hidden mb-6">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider sticky left-0 bg-gray-50 z-10">
                      Werknemer
                    </th>
                    {daysInMonth.map(dag => {
                      const dagNummer = format(dag, 'd')
                      const isMaandag = isGesloten(dag)
                      const isFeestdag = feestdagen.some(fd => isSameDay(fd, dag))
                      const isWerkdagDag = isWerkdag(dag, feestdagen)
                      
                      return (
                        <th
                          key={dag.toISOString()}
                          className={`px-2 py-3 text-center text-xs font-medium uppercase tracking-wider ${
                            isMaandag 
                              ? 'bg-gray-300 text-gray-600' 
                              : isFeestdag
                              ? 'bg-yellow-100 text-yellow-800'
                              : 'text-gray-500'
                          }`}
                        >
                          <div>{dagNummer}</div>
                          <div className="text-[10px]">
                            {format(dag, 'EEE', { locale: nl })}
                          </div>
                          {isFeestdag && <div className="text-[9px] mt-1">F</div>}
                        </th>
                      )
                    })}
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-gray-50">
                      Afwezig
                    </th>
                    <th className="px-4 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider bg-green-50">
                      Beschikbaar
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {werknemers.map(werknemer => (
                    <tr key={werknemer.id} className="hover:bg-gray-50">
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-gray-900 sticky left-0 bg-white z-10">
                        {werknemer.naam}
                      </td>
                      {daysInMonth.map(dag => {
                        const afwezigheid = getAfwezigheidVoorDag(werknemer.id, dag)
                        const isMaandag = isGesloten(dag)
                        const isFeestdag = feestdagen.some(fd => isSameDay(fd, dag))
                        const isWerkdagDag = isWerkdag(dag, feestdagen)
                        
                        if (isMaandag) {
                          return (
                            <td key={dag.toISOString()} className="px-2 py-3 text-center bg-gray-300 cursor-not-allowed">
                              <span className="text-xs text-gray-600 font-bold">M</span>
                            </td>
                          )
                        }
                        
                        if (afwezigheid) {
                          const { label, color, bgColor } = getAfwezigheidLabel(afwezigheid.type)
                          return (
                            <td 
                              key={dag.toISOString()} 
                              className="px-2 py-3 text-center cursor-pointer hover:bg-gray-100"
                              onClick={() => handleCellClick(werknemer.id, dag)}
                              title={`Klik om te bewerken: ${afwezigheid.type}${afwezigheid.opmerking ? ' - ' + afwezigheid.opmerking : ''}`}
                            >
                              <div
                                className={`inline-flex items-center justify-center w-8 h-8 rounded ${bgColor} ${color} text-xs font-bold`}
                              >
                                {label}
                              </div>
                            </td>
                          )
                        }
                        
                        return (
                          <td 
                            key={dag.toISOString()} 
                            className="px-2 py-3 text-center cursor-pointer hover:bg-green-50"
                            onClick={() => handleCellClick(werknemer.id, dag)}
                            title="Klik om afwezigheid toe te voegen"
                          >
                            <div className="inline-flex items-center justify-center w-8 h-8 rounded border-2 border-green-500 text-green-600 text-xs font-bold">
                              ✓
                            </div>
                          </td>
                        )
                      })}
                      <td className="px-4 py-3 text-center text-sm text-red-600 font-bold bg-gray-50">
                        {getTotaalAfwezigDagen(werknemer.id)}
                      </td>
                      <td className="px-4 py-3 text-center text-sm text-green-600 font-bold bg-green-50">
                        {getTotaalAanwezigDagen(werknemer.id)}
                      </td>
                    </tr>
                  ))}
                  
                  {/* Totaal Rij */}
                  <tr className="bg-blue-50 font-bold">
                    <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-900 sticky left-0 bg-blue-50 z-10">
                      BESCHIKBAAR
                    </td>
                    {daysInMonth.map(dag => {
                      const beschikbaar = getBeschikbareWerknemersVoorDag(dag)
                      const isMaandag = isGesloten(dag)
                      const isFeestdag = feestdagen.some(fd => isSameDay(fd, dag))
                      
                      if (isMaandag) {
                        return (
                          <td key={dag.toISOString()} className="px-2 py-3 text-center text-sm text-gray-400 bg-gray-300">
                            -
                          </td>
                        )
                      }
                      
                      return (
                        <td
                          key={dag.toISOString()}
                          className={`px-2 py-3 text-center text-sm ${
                            beschikbaar === 0
                              ? 'text-red-600'
                              : beschikbaar < werknemers.length / 2
                              ? 'text-orange-600'
                              : 'text-green-600'
                          }`}
                        >
                          {beschikbaar}
                        </td>
                      )
                    })}
                    <td className="px-4 py-3 text-center text-sm text-gray-900">-</td>
                    <td className="px-4 py-3 text-center text-sm text-gray-900">-</td>
                  </tr>
                </tbody>
              </table>
            </div>
          </div>

          {/* Statistieken */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="bg-white rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <Users className="w-8 h-8 text-blue-600 mr-3" />
                <div>
                  <p className="text-sm text-gray-600">Totaal Werknemers</p>
                  <p className="text-2xl font-bold text-gray-900">{werknemers.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  ✓
                </div>
                <div>
                  <p className="text-sm text-green-700">Gem. Beschikbaar</p>
                  <p className="text-2xl font-bold text-green-900">
                    {Math.round(
                      daysInMonth.filter(d => isWerkdag(d, feestdagen)).reduce(
                        (sum, d) => sum + getBeschikbareWerknemersVoorDag(d),
                        0
                      ) / daysInMonth.filter(d => isWerkdag(d, feestdagen)).length
                    )}
                  </p>
                </div>
              </div>
            </div>

            <div className="bg-red-50 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <div className="w-8 h-8 bg-red-500 rounded-full flex items-center justify-center text-white font-bold mr-3">
                  !
                </div>
                <div>
                  <p className="text-sm text-red-700">Totaal Afwezigheden</p>
                  <p className="text-2xl font-bold text-red-900">{afwezigheden.length}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 rounded-lg shadow-sm p-6">
              <div className="flex items-center">
                <CalendarIcon className="w-8 h-8 text-orange-600 mr-3" />
                <div>
                  <p className="text-sm text-orange-700">Werkdagen</p>
                  <p className="text-2xl font-bold text-orange-900">
                    {getWerkdagenInMaand()}
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
            <h3 className="text-sm font-semibold text-blue-900 mb-2">💡 Tips:</h3>
            <ul className="text-sm text-blue-800 space-y-1">
              <li>• <strong>Klik op een cel</strong> om afwezigheid toe te voegen of te bewerken</li>
              <li>• <strong>Groen ✓</strong>: Werknemer is beschikbaar om te werken</li>
              <li>• <strong>Gekleurde letters</strong>: Type afwezigheid (V=Vakantie, Z=Ziek, P=Persoonlijk)</li>
              <li>• <strong>M (grijs)</strong>: Maandag - Gesloten</li>
              <li>• <strong>F (geel)</strong>: Feestdag - Open (werkdag)</li>
              <li>• <strong>Beschikbaar rij</strong>: Toont hoeveel werknemers beschikbaar zijn per dag</li>
              <li>• <strong>Rode getallen</strong>: Dagen waar niemand beschikbaar is (let op!)</li>
            </ul>
          </div>
        </>
      )}
    </div>
  )
}

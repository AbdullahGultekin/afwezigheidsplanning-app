'use client'

import { useEffect, useState } from 'react'
import { Clock, Plus, Trash2, Calendar as CalendarIcon, Table } from 'lucide-react'
import { format, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, isWeekend } from 'date-fns'
import { nl } from 'date-fns/locale'
import Link from 'next/link'

interface Werknemer {
  id: string
  naam: string
}

interface Urenregistratie {
  id: string
  werknemerId: string
  datum: string
  uren: number
  opmerking?: string
  werknemer: {
    id: string
    naam: string
  }
}

export default function UrenPage() {
  const [werknemers, setWerknemers] = useState<Werknemer[]>([])
  const [urenregistraties, setUrenregistraties] = useState<Urenregistratie[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [selectedWerknemer, setSelectedWerknemer] = useState<string>('')
  const [selectedDate, setSelectedDate] = useState<Date | null>(null)
  const [uren, setUren] = useState<number>(8)
  const [opmerking, setOpmerking] = useState<string>('')
  const [loading, setLoading] = useState(false)

  useEffect(() => {
    fetchWerknemers()
  }, [])

  useEffect(() => {
    if (selectedWerknemer) {
      fetchUrenregistraties()
    }
  }, [selectedWerknemer, selectedMonth])

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

  const fetchUrenregistraties = async () => {
    try {
      const maand = format(selectedMonth, 'yyyy-MM')
      const res = await fetch(`/api/uren?werknemerId=${selectedWerknemer}&maand=${maand}`)
      const data = await res.json()
      if (Array.isArray(data)) {
        setUrenregistraties(data)
      }
    } catch (error) {
      console.error('Error fetching urenregistraties:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!selectedWerknemer || !selectedDate) return

    setLoading(true)
    try {
      const res = await fetch('/api/uren', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          werknemerId: selectedWerknemer,
          datum: selectedDate.toISOString(),
          uren,
          opmerking: opmerking || null
        })
      })

      if (res.ok) {
        setSelectedDate(null)
        setUren(8)
        setOpmerking('')
        fetchUrenregistraties()
      }
    } catch (error) {
      console.error('Error saving uren:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet u zeker dat u deze urenregistratie wilt verwijderen?')) return

    try {
      const res = await fetch(`/api/uren/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchUrenregistraties()
      }
    } catch (error) {
      console.error('Error deleting uren:', error)
    }
  }

  const daysInMonth = eachDayOfInterval({
    start: startOfMonth(selectedMonth),
    end: endOfMonth(selectedMonth)
  })

  const getUrenForDate = (date: Date) => {
    return urenregistraties.find(u => isSameDay(new Date(u.datum), date))
  }

  const totalUren = urenregistraties.reduce((sum, u) => sum + u.uren, 0)

  return (
    <div>
      <div className="mb-8">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900 flex items-center">
              <Clock className="w-8 h-8 mr-3 text-blue-600" />
              Urenregistratie
            </h1>
            <p className="mt-2 text-gray-600">
              Registreer gewerkte uren per dag
            </p>
          </div>
          <Link
            href="/uren/bulk"
            className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 font-medium"
          >
            <Table className="w-5 h-5 mr-2" />
            Excel-stijl Overzicht
          </Link>
        </div>
      </div>

      {/* Werknemer Selectie */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Selecteer Werknemer
        </label>
        <select
          value={selectedWerknemer}
          onChange={(e) => setSelectedWerknemer(e.target.value)}
          className="w-full md:w-96 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        >
          <option value="">-- Kies een werknemer --</option>
          {werknemers.map((w) => (
            <option key={w.id} value={w.id}>
              {w.naam}
            </option>
          ))}
        </select>
      </div>

      {selectedWerknemer && (
        <>
          {/* Maand Selectie */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="flex items-center justify-between">
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() - 1))}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                ← Vorige
              </button>
              <h2 className="text-xl font-semibold text-gray-900">
                {format(selectedMonth, 'MMMM yyyy', { locale: nl })}
              </h2>
              <button
                onClick={() => setSelectedMonth(new Date(selectedMonth.getFullYear(), selectedMonth.getMonth() + 1))}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
              >
                Volgende →
              </button>
            </div>

            <div className="mt-4 text-center">
              <p className="text-sm text-gray-600">
                Totaal uren deze maand: <span className="font-bold text-lg text-blue-600">{totalUren}</span>
              </p>
            </div>
          </div>

          {/* Kalender Grid */}
          <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
            <div className="grid grid-cols-7 gap-2">
              {['Ma', 'Di', 'Wo', 'Do', 'Vr', 'Za', 'Zo'].map((day) => (
                <div key={day} className="text-center font-semibold text-gray-700 py-2">
                  {day}
                </div>
              ))}

              {/* Empty cells for alignment */}
              {Array.from({ length: (startOfMonth(selectedMonth).getDay() + 6) % 7 }).map((_, i) => (
                <div key={`empty-${i}`} />
              ))}

              {daysInMonth.map((date) => {
                const urenData = getUrenForDate(date)
                const isWeekendDay = isWeekend(date)
                const isSelected = selectedDate && isSameDay(date, selectedDate)

                return (
                  <button
                    key={date.toISOString()}
                    onClick={() => setSelectedDate(date)}
                    className={`p-3 rounded-lg border-2 transition-all ${
                      isSelected
                        ? 'border-blue-500 bg-blue-50'
                        : urenData
                        ? 'border-green-500 bg-green-50 hover:bg-green-100'
                        : isWeekendDay
                        ? 'border-gray-200 bg-gray-50'
                        : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
                    }`}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {format(date, 'd')}
                    </div>
                    {urenData && (
                      <div className="text-xs font-bold text-green-700 mt-1">
                        {urenData.uren}u
                      </div>
                    )}
                  </button>
                )
              })}
            </div>
          </div>

          {/* Uren Invoer Form */}
          {selectedDate && (
            <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                <Plus className="w-5 h-5 mr-2 text-blue-600" />
                Uren registreren voor {format(selectedDate, 'dd MMMM yyyy', { locale: nl })}
              </h3>
              <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Aantal uren
                  </label>
                  <input
                    type="number"
                    step="0.5"
                    min="0"
                    max="24"
                    value={uren}
                    onChange={(e) => setUren(parseFloat(e.target.value))}
                    className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    required
                  />
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
                    placeholder="Bijv. overwerk, project naam, etc."
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
                    onClick={() => setSelectedDate(null)}
                    className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
                  >
                    Annuleren
                  </button>
                </div>
              </form>
            </div>
          )}

          {/* Recente Registraties */}
          {urenregistraties.length > 0 && (
            <div className="bg-white rounded-lg shadow-sm p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4">
                Geregistreerde uren
              </h3>
              <div className="space-y-2">
                {urenregistraties.map((uren) => (
                  <div
                    key={uren.id}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="flex items-center gap-4">
                      <CalendarIcon className="w-5 h-5 text-gray-400" />
                      <div>
                        <p className="font-medium text-gray-900">
                          {format(new Date(uren.datum), 'dd MMMM yyyy', { locale: nl })}
                        </p>
                        {uren.opmerking && (
                          <p className="text-sm text-gray-600">{uren.opmerking}</p>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-bold text-lg text-blue-600">
                        {uren.uren} uur
                      </span>
                      <button
                        onClick={() => handleDelete(uren.id)}
                        className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                      >
                        <Trash2 className="w-5 h-5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { Car, FileText, PenTool, Download, Calendar as CalendarIcon, Save, CheckSquare, Square } from 'lucide-react'
import { format, startOfMonth, endOfMonth } from 'date-fns'
import { nl } from 'date-fns/locale'
import SignatureCanvas from '@/components/SignatureCanvas'

interface Werknemer {
  id: string
  naam: string
  nummerplaat?: string
}

interface MaandKmStand {
  id?: string
  werknemerId: string
  jaar: number
  maand: number
  beginKmStand: number
  eindKmStand?: number
  elkeDagGereden?: number
  handtekening?: string
  getekendOp?: string
}

interface Kilometer {
  id: string
  datum: string
  kilometers: number
}

interface WerknemerData {
  werknemer: Werknemer
  maandKmStand: MaandKmStand | null
  kilometers: Kilometer[]
  beginKmStand: number
  eindKmStand: number
  elkeDagGereden: number
}

export default function KmDeclaratiePage() {
  const [werknemers, setWerknemers] = useState<Werknemer[]>([])
  const [selectedWerknemerIds, setSelectedWerknemerIds] = useState<string[]>([])
  const [selectedMonth, setSelectedMonth] = useState(new Date())
  const [werknemerDataMap, setWerknemerDataMap] = useState<Map<string, WerknemerData>>(new Map())
  const [loading, setLoading] = useState(false)
  const [savingWerknemerId, setSavingWerknemerId] = useState<string | null>(null)
  const [signingWerknemerId, setSigningWerknemerId] = useState<string | null>(null)

  const KM_TARIEF = 0.40

  useEffect(() => {
    fetchWerknemers()
  }, [])

  useEffect(() => {
    if (selectedWerknemerIds.length > 0) {
      fetchAllWerknemerData()
    }
  }, [selectedWerknemerIds, selectedMonth])

  const fetchWerknemers = async () => {
    try {
      const res = await fetch('/api/werknemers')
      const data = await res.json()
      if (Array.isArray(data)) {
        setWerknemers(data.filter((w: Werknemer) => w.nummerplaat))
      }
    } catch (error) {
      console.error('Error fetching werknemers:', error)
    }
  }

  const fetchAllWerknemerData = async () => {
    setLoading(true)
    try {
      const jaar = selectedMonth.getFullYear()
      const maand = selectedMonth.getMonth() + 1
      const newDataMap = new Map<string, WerknemerData>()

      for (const werknemerId of selectedWerknemerIds) {
        const werknemer = werknemers.find(w => w.id === werknemerId)
        if (!werknemer) continue

        // Fetch maand km-stand
        const kmStandRes = await fetch(
          `/api/maand-km-stand?werknemerId=${werknemerId}&jaar=${jaar}&maand=${maand}`
        )
        const kmStandData = await kmStandRes.json()
        const maandKmStand = kmStandData && kmStandData.length > 0 ? kmStandData[0] : null

        // Fetch kilometers
        const startDate = format(startOfMonth(selectedMonth), 'yyyy-MM-dd')
        const endDate = format(endOfMonth(selectedMonth), 'yyyy-MM-dd')
        
        const kmRes = await fetch(
          `/api/kilometers?werknemerId=${werknemerId}&startDate=${startDate}&endDate=${endDate}`
        )
        const kmData = await kmRes.json()
        const kilometers = Array.isArray(kmData) ? kmData : []

        newDataMap.set(werknemerId, {
          werknemer,
          maandKmStand,
          kilometers,
          beginKmStand: maandKmStand?.beginKmStand || 0,
          eindKmStand: maandKmStand?.eindKmStand || 0,
          elkeDagGereden: maandKmStand?.elkeDagGereden || 0
        })
      }

      setWerknemerDataMap(newDataMap)
    } catch (error) {
      console.error('Error fetching data:', error)
    } finally {
      setLoading(false)
    }
  }

  const toggleWerknemerSelection = (werknemerId: string) => {
    setSelectedWerknemerIds(prev => {
      if (prev.includes(werknemerId)) {
        return prev.filter(id => id !== werknemerId)
      } else {
        return [...prev, werknemerId]
      }
    })
  }

  const selectAllWerknemers = () => {
    if (selectedWerknemerIds.length === werknemers.length) {
      setSelectedWerknemerIds([])
    } else {
      setSelectedWerknemerIds(werknemers.map(w => w.id))
    }
  }

  const updateWerknemerData = (werknemerId: string, field: string, value: number) => {
    setWerknemerDataMap(prev => {
      const newMap = new Map(prev)
      const data = newMap.get(werknemerId)
      if (data) {
        newMap.set(werknemerId, {
          ...data,
          [field]: value
        })
      }
      return newMap
    })
  }

  const handleSaveWerknemer = async (werknemerId: string) => {
    const data = werknemerDataMap.get(werknemerId)
    if (!data) return

    setSavingWerknemerId(werknemerId)
    try {
      const jaar = selectedMonth.getFullYear()
      const maand = selectedMonth.getMonth() + 1

      const payload = {
        werknemerId,
        jaar,
        maand,
        beginKmStand: data.beginKmStand,
        eindKmStand: data.eindKmStand || null,
        elkeDagGereden: data.elkeDagGereden || null,
        handtekening: data.maandKmStand?.handtekening || null,
        getekendOp: data.maandKmStand?.getekendOp || null
      }

      if (data.maandKmStand?.id) {
        await fetch(`/api/maand-km-stand/${data.maandKmStand.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      } else {
        await fetch('/api/maand-km-stand', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(payload)
        })
      }

      // Refresh data for this werknemer
      await fetchAllWerknemerData()
    } catch (error) {
      console.error('Error saving:', error)
      alert('Fout bij opslaan')
    } finally {
      setSavingWerknemerId(null)
    }
  }

  const handleSaveAll = async () => {
    for (const werknemerId of selectedWerknemerIds) {
      await handleSaveWerknemer(werknemerId)
    }
    alert('Alle km-standen succesvol opgeslagen!')
  }

  const handleSignature = async (werknemerId: string, signature: string) => {
    const data = werknemerDataMap.get(werknemerId)
    if (!data?.maandKmStand?.id) {
      alert('Sla eerst de km-standen op voordat u tekent')
      setSigningWerknemerId(null)
      return
    }

    try {
      await fetch(`/api/maand-km-stand/${data.maandKmStand.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          handtekening: signature,
          getekendOp: new Date().toISOString()
        })
      })

      setSigningWerknemerId(null)
      await fetchAllWerknemerData()
    } catch (error) {
      console.error('Error saving signature:', error)
      alert('Fout bij opslaan handtekening')
    }
  }

  const getTotaalKm = (werknemerId: string) => {
    const data = werknemerDataMap.get(werknemerId)
    if (!data) return 0
    return data.kilometers.reduce((sum, k) => sum + k.kilometers, 0)
  }

  const getTotaalBedrag = (werknemerId: string) => {
    return getTotaalKm(werknemerId) * KM_TARIEF
  }

  return (
    <div className="container mx-auto p-6">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Car className="w-8 h-8 mr-3 text-blue-600" />
          Kilometerdeclaratie - Meerdere Werknemers
        </h1>
        <p className="mt-2 text-gray-600">
          Selecteer meerdere werknemers en beheer hun km-standen
        </p>
      </div>

      {/* Maand Selectie */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Maand
            </label>
            <input
              type="month"
              value={format(selectedMonth, 'yyyy-MM')}
              onChange={(e) => setSelectedMonth(new Date(e.target.value + '-01'))}
              className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          <div className="flex items-center ml-6">
            <CalendarIcon className="w-5 h-5 mr-2 text-blue-600" />
            <span className="text-lg font-semibold text-gray-900">
              {format(selectedMonth, 'MMMM yyyy', { locale: nl })}
            </span>
          </div>
        </div>
      </div>

      {/* Werknemer Selectie */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-lg font-semibold text-gray-900">
            Selecteer Werknemers ({selectedWerknemerIds.length} geselecteerd)
          </h2>
          <button
            onClick={selectAllWerknemers}
            className="flex items-center px-4 py-2 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
          >
            {selectedWerknemerIds.length === werknemers.length ? (
              <>
                <Square className="w-4 h-4 mr-2" />
                Deselecteer Alles
              </>
            ) : (
              <>
                <CheckSquare className="w-4 h-4 mr-2" />
                Selecteer Alles
              </>
            )}
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
          {werknemers.map((werknemer) => (
            <button
              key={werknemer.id}
              onClick={() => toggleWerknemerSelection(werknemer.id)}
              className={`flex items-center p-3 border-2 rounded-lg transition-all ${
                selectedWerknemerIds.includes(werknemer.id)
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white hover:border-gray-300'
              }`}
            >
              {selectedWerknemerIds.includes(werknemer.id) ? (
                <CheckSquare className="w-5 h-5 text-blue-600 mr-3" />
              ) : (
                <Square className="w-5 h-5 text-gray-400 mr-3" />
              )}
              <div className="text-left">
                <div className="font-medium text-gray-900">{werknemer.naam}</div>
                <div className="text-sm text-gray-500 font-mono">{werknemer.nummerplaat}</div>
              </div>
            </button>
          ))}
        </div>
      </div>

      {/* Geselecteerde Werknemers */}
      {selectedWerknemerIds.length > 0 && !loading && (
        <>
          <div className="flex justify-end mb-4">
            <button
              onClick={handleSaveAll}
              disabled={savingWerknemerId !== null}
              className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed font-medium"
            >
              <Save className="w-5 h-5 mr-2" />
              Alles Opslaan
            </button>
          </div>

          {selectedWerknemerIds.map((werknemerId) => {
            const data = werknemerDataMap.get(werknemerId)
            if (!data) return null

            return (
              <div key={werknemerId} className="bg-white rounded-lg shadow-sm p-6 mb-6">
                <div className="flex items-center justify-between mb-4 pb-4 border-b">
                  <div className="flex items-center">
                    <Car className="w-6 h-6 text-blue-600 mr-3" />
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">{data.werknemer.naam}</h3>
                      <p className="text-sm text-gray-600 font-mono">{data.werknemer.nummerplaat}</p>
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={() => handleSaveWerknemer(werknemerId)}
                      disabled={savingWerknemerId === werknemerId}
                      className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {savingWerknemerId === werknemerId ? 'Bezig...' : 'Opslaan'}
                    </button>
                    {data.maandKmStand?.id && (
                      <button
                        onClick={() => setSigningWerknemerId(werknemerId)}
                        className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                      >
                        <PenTool className="w-4 h-4 mr-2" />
                        Tekenen
                      </button>
                    )}
                  </div>
                </div>

                {/* Km-standen Grid */}
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Begin Km-stand
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={data.beginKmStand}
                      onChange={(e) => updateWerknemerData(werknemerId, 'beginKmStand', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Eind Km-stand
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={data.eindKmStand}
                      onChange={(e) => updateWerknemerData(werknemerId, 'eindKmStand', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="0"
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Elke Dag Gereden
                    </label>
                    <input
                      type="number"
                      min="0"
                      step="1"
                      value={data.elkeDagGereden}
                      onChange={(e) => updateWerknemerData(werknemerId, 'elkeDagGereden', parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      placeholder="Bijv. 22"
                    />
                    <p className="text-xs text-gray-500 mt-1">Aantal werkdagen</p>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                      Verschil
                    </label>
                    <div className="px-4 py-2 bg-gray-50 border border-gray-300 rounded-lg text-lg font-semibold text-gray-900">
                      {(data.eindKmStand - data.beginKmStand).toLocaleString()} km
                    </div>
                  </div>
                </div>

                {/* Summary Cards */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                  <div className="bg-orange-50 rounded-lg p-4">
                    <p className="text-sm text-orange-600 font-medium mb-1">Totaal KM</p>
                    <p className="text-xl font-bold text-orange-900">
                      {getTotaalKm(werknemerId).toLocaleString()} km
                    </p>
                  </div>

                  <div className="bg-green-50 rounded-lg p-4">
                    <p className="text-sm text-green-600 font-medium mb-1">Te Betalen</p>
                    <p className="text-xl font-bold text-green-900">
                      €{getTotaalBedrag(werknemerId).toFixed(2)}
                    </p>
                  </div>

                  <div className="bg-blue-50 rounded-lg p-4">
                    <p className="text-sm text-blue-600 font-medium mb-1">Status</p>
                    <p className="text-lg font-bold text-blue-900">
                      {data.maandKmStand?.handtekening ? '✓ Getekend' : '○ Niet getekend'}
                    </p>
                  </div>
                </div>

                {/* Handtekening & PDF */}
                {data.maandKmStand?.handtekening && (
                  <div className="border-t pt-4 mb-4">
                    <div className="flex items-start justify-between">
                      <div>
                        <p className="text-sm text-gray-600 font-medium mb-2">Handtekening</p>
                        <img
                          src={data.maandKmStand.handtekening}
                          alt="Handtekening"
                          className="border rounded-lg max-w-xs"
                        />
                        {data.maandKmStand.getekendOp && (
                          <p className="text-xs text-gray-500 mt-2">
                            Getekend op: {format(new Date(data.maandKmStand.getekendOp), 'dd MMMM yyyy HH:mm', { locale: nl })}
                          </p>
                        )}
                      </div>
                      {data.maandKmStand?.id && (
                        <a
                          href={`/api/km-declaratie/pdf?id=${data.maandKmStand.id}`}
                          target="_blank"
                          className="inline-flex items-center px-6 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                        >
                          <Download className="w-4 h-4 mr-2" />
                          Download PDF
                        </a>
                      )}
                    </div>
                  </div>
                )}
              </div>
            )
          })}
        </>
      )}

      {loading && (
        <div className="text-center py-12">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="mt-4 text-gray-600">Gegevens laden...</p>
        </div>
      )}

      {selectedWerknemerIds.length === 0 && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-8 text-center">
          <Car className="w-16 h-16 text-blue-400 mx-auto mb-4" />
          <p className="text-blue-900 font-medium text-lg">
            Selecteer één of meerdere werknemers om te beginnen
          </p>
        </div>
      )}

      {/* Signature Modal */}
      {signingWerknemerId && (
        <SignatureCanvas
          onSave={(signature) => handleSignature(signingWerknemerId, signature)}
          onClose={() => setSigningWerknemerId(null)}
          initialSignature={werknemerDataMap.get(signingWerknemerId)?.maandKmStand?.handtekening}
        />
      )}
    </div>
  )
}

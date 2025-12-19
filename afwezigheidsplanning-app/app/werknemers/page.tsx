'use client'

import { useEffect, useState } from 'react'
import { Users, Plus, Edit, Trash2, UserCheck, UserX } from 'lucide-react'

interface Werknemer {
  id: string
  naam: string
  email?: string
  nummerplaat?: string
  vakantiedagenTotaal: number
  vakantiedagenOpgenomen: number
  actief: boolean
  _count?: {
    urenregistraties: number
    afwezigheden: number
  }
}

export default function WerknemersPage() {
  const [werknemers, setWerknemers] = useState<Werknemer[]>([])
  const [showForm, setShowForm] = useState(false)
  const [editingId, setEditingId] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Form state
  const [naam, setNaam] = useState('')
  const [email, setEmail] = useState('')
  const [nummerplaat, setNummerplaat] = useState('')
  const [vakantiedagenTotaal, setVakantiedagenTotaal] = useState(20)

  useEffect(() => {
    fetchWerknemers()
  }, [])

  const fetchWerknemers = async () => {
    try {
      const res = await fetch('/api/werknemers')
      const data = await res.json()
      if (Array.isArray(data)) {
        setWerknemers(data)
      }
    } catch (error) {
      console.error('Error fetching werknemers:', error)
    }
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setLoading(true)

    try {
      if (editingId) {
        // Update
        const res = await fetch(`/api/werknemers/${editingId}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            naam,
            email: email || null,
            nummerplaat: nummerplaat || null,
            vakantiedagenTotaal,
            actief: true
          })
        })

        if (res.ok) {
          resetForm()
          fetchWerknemers()
        }
      } else {
        // Create
        const res = await fetch('/api/werknemers', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            naam,
            email: email || null,
            nummerplaat: nummerplaat || null,
            vakantiedagenTotaal
          })
        })

        if (res.ok) {
          resetForm()
          fetchWerknemers()
        }
      }
    } catch (error) {
      console.error('Error saving werknemer:', error)
    } finally {
      setLoading(false)
    }
  }

  const handleEdit = (werknemer: Werknemer) => {
    setEditingId(werknemer.id)
    setNaam(werknemer.naam)
    setEmail(werknemer.email || '')
    setNummerplaat(werknemer.nummerplaat || '')
    setVakantiedagenTotaal(werknemer.vakantiedagenTotaal)
    setShowForm(true)
  }

  const handleToggleActive = async (werknemer: Werknemer) => {
    try {
      const res = await fetch(`/api/werknemers/${werknemer.id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...werknemer,
          actief: !werknemer.actief
        })
      })

      if (res.ok) {
        fetchWerknemers()
      }
    } catch (error) {
      console.error('Error toggling werknemer status:', error)
    }
  }

  const handleDelete = async (id: string) => {
    if (!confirm('Weet u zeker dat u deze werknemer wilt verwijderen? Dit verwijdert ook alle bijbehorende uren en afwezigheden.')) return

    try {
      const res = await fetch(`/api/werknemers/${id}`, { method: 'DELETE' })
      if (res.ok) {
        fetchWerknemers()
      }
    } catch (error) {
      console.error('Error deleting werknemer:', error)
    }
  }

  const resetForm = () => {
    setShowForm(false)
    setEditingId(null)
    setNummerplaat('')
    setNaam('')
    setEmail('')
    setVakantiedagenTotaal(20)
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <Users className="w-8 h-8 mr-3 text-blue-600" />
          Werknemers Beheer
        </h1>
        <p className="mt-2 text-gray-600">
          Beheer werknemers en hun vakantiedagen
        </p>
      </div>

      {/* Add Button */}
      {!showForm && (
        <button
          onClick={() => setShowForm(true)}
          className="mb-6 flex items-center px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 font-medium"
        >
          <Plus className="w-5 h-5 mr-2" />
          Nieuwe Werknemer Toevoegen
        </button>
      )}

      {/* Form */}
      {showForm && (
        <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">
            {editingId ? 'Werknemer Bewerken' : 'Nieuwe Werknemer'}
          </h3>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Naam *
              </label>
              <input
                type="text"
                value={naam}
                onChange={(e) => setNaam(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
                placeholder="Bijv. Jan Janssen"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Email (optioneel)
              </label>
              <input
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="jan.janssen@example.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Nummerplaat (optioneel)
              </label>
              <input
                type="text"
                value={nummerplaat}
                onChange={(e) => setNummerplaat(e.target.value.toUpperCase())}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                placeholder="1-ABC-123"
                maxLength={10}
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Totaal Vakantiedagen per Jaar
              </label>
              <input
                type="number"
                min="0"
                step="0.5"
                value={vakantiedagenTotaal}
                onChange={(e) => setVakantiedagenTotaal(parseFloat(e.target.value))}
                className="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                required
              />
            </div>

            <div className="flex gap-3">
              <button
                type="submit"
                disabled={loading}
                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-gray-400 font-medium"
              >
                {loading ? 'Opslaan...' : editingId ? 'Bijwerken' : 'Toevoegen'}
              </button>
              <button
                type="button"
                onClick={resetForm}
                className="px-6 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 font-medium"
              >
                Annuleren
              </button>
            </div>
          </form>
        </div>
      )}

      {/* Werknemers Lijst */}
      <div className="bg-white rounded-lg shadow-sm overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Naam
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Email
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Nummerplaat
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Vakantiedagen
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Registraties
                </th>
                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Acties
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {werknemers.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-6 py-8 text-center text-gray-500">
                    Geen werknemers gevonden. Voeg een nieuwe werknemer toe om te beginnen.
                  </td>
                </tr>
              ) : (
                werknemers.map((werknemer) => (
                  <tr key={werknemer.id} className={!werknemer.actief ? 'bg-gray-50 opacity-60' : ''}>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <button
                        onClick={() => handleToggleActive(werknemer)}
                        className={`flex items-center px-3 py-1 rounded-full text-xs font-semibold ${
                          werknemer.actief
                            ? 'bg-green-100 text-green-800 hover:bg-green-200'
                            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
                        }`}
                      >
                        {werknemer.actief ? (
                          <>
                            <UserCheck className="w-3 h-3 mr-1" />
                            Actief
                          </>
                        ) : (
                          <>
                            <UserX className="w-3 h-3 mr-1" />
                            Inactief
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-medium text-gray-900">{werknemer.naam}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">{werknemer.email || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm font-mono text-gray-900">{werknemer.nummerplaat || '-'}</div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-900">
                        <span className="font-semibold text-orange-600">
                          {werknemer.vakantiedagenOpgenomen}
                        </span>
                        {' / '}
                        <span className="font-semibold text-blue-600">
                          {werknemer.vakantiedagenTotaal}
                        </span>
                        <div className="text-xs text-gray-500 mt-1">
                          Resterend: {werknemer.vakantiedagenTotaal - werknemer.vakantiedagenOpgenomen}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap">
                      <div className="text-sm text-gray-500">
                        {werknemer._count?.urenregistraties || 0} uren
                        <br />
                        {werknemer._count?.afwezigheden || 0} afwezigheden
                      </div>
                    </td>
                    <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                      <div className="flex justify-end gap-2">
                        <button
                          onClick={() => handleEdit(werknemer)}
                          className="p-2 text-blue-600 hover:bg-blue-50 rounded-lg"
                          title="Bewerken"
                        >
                          <Edit className="w-5 h-5" />
                        </button>
                        <button
                          onClick={() => handleDelete(werknemer.id)}
                          className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                          title="Verwijderen"
                        >
                          <Trash2 className="w-5 h-5" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Stats */}
      {werknemers.length > 0 && (
        <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="bg-blue-50 rounded-lg p-4 border border-blue-200">
            <p className="text-sm text-blue-700">Totaal Werknemers</p>
            <p className="text-2xl font-bold text-blue-900">{werknemers.length}</p>
          </div>
          <div className="bg-green-50 rounded-lg p-4 border border-green-200">
            <p className="text-sm text-green-700">Actieve Werknemers</p>
            <p className="text-2xl font-bold text-green-900">
              {werknemers.filter(w => w.actief).length}
            </p>
          </div>
          <div className="bg-orange-50 rounded-lg p-4 border border-orange-200">
            <p className="text-sm text-orange-700">Totaal Vakantiedagen Opgenomen</p>
            <p className="text-2xl font-bold text-orange-900">
              {werknemers.reduce((sum, w) => sum + w.vakantiedagenOpgenomen, 0)}
            </p>
          </div>
        </div>
      )}
    </div>
  )
}


'use client'

import { useEffect, useState } from 'react'
import { Users, Clock, Calendar, TrendingUp } from 'lucide-react'
import Link from 'next/link'

interface DashboardStats {
  totalWerknemers: number
  actieveWerknemers: number
  totaalUrenDezeMaand: number
  afwezighedenDezeMaand: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalWerknemers: 0,
    actieveWerknemers: 0,
    totaalUrenDezeMaand: 0,
    afwezighedenDezeMaand: 0
  })
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetchDashboardData()
  }, [])

  const fetchDashboardData = async () => {
    try {
      // Fetch werknemers
      const werknemersRes = await fetch('/api/werknemers')
      const werknemers = await werknemersRes.json()

      // Huidige maand
      const now = new Date()
      const currentMonth = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

      // Fetch uren voor deze maand
      const urenRes = await fetch(`/api/uren?maand=${currentMonth}`)
      const uren = await urenRes.json()

      // Fetch afwezigheden voor deze maand
      const afwezighedenRes = await fetch(`/api/afwezigheden?maand=${currentMonth}`)
      const afwezigheden = await afwezighedenRes.json()

      const totaalUren = Array.isArray(uren) 
        ? uren.reduce((sum, u) => sum + (u.uren || 0), 0) 
        : 0

      setStats({
        totalWerknemers: Array.isArray(werknemers) ? werknemers.length : 0,
        actieveWerknemers: Array.isArray(werknemers) 
          ? werknemers.filter((w: any) => w.actief).length 
          : 0,
        totaalUrenDezeMaand: totaalUren,
        afwezighedenDezeMaand: Array.isArray(afwezigheden) ? afwezigheden.length : 0
      })
    } catch (error) {
      console.error('Error fetching dashboard data:', error)
    } finally {
      setLoading(false)
    }
  }

  const statCards = [
    {
      title: 'Actieve Werknemers',
      value: stats.actieveWerknemers,
      total: stats.totalWerknemers,
      icon: Users,
      color: 'bg-blue-500',
      href: '/werknemers'
    },
    {
      title: 'Uren Deze Maand',
      value: stats.totaalUrenDezeMaand,
      icon: Clock,
      color: 'bg-green-500',
      href: '/uren'
    },
    {
      title: 'Afwezigheden Deze Maand',
      value: stats.afwezighedenDezeMaand,
      icon: Calendar,
      color: 'bg-orange-500',
      href: '/afwezigheden'
    },
    {
      title: 'Gemiddeld per Werknemer',
      value: stats.actieveWerknemers > 0 
        ? Math.round(stats.totaalUrenDezeMaand / stats.actieveWerknemers) 
        : 0,
      icon: TrendingUp,
      color: 'bg-purple-500',
      href: '/uren'
    }
  ]

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="mt-2 text-gray-600">
          Overzicht van uw urenregistratie en afwezigheidsplanning
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {statCards.map((card) => {
          const Icon = card.icon
          return (
            <Link
              key={card.title}
              href={card.href}
              className="bg-white rounded-lg shadow-sm p-6 hover:shadow-md transition-shadow"
            >
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600">{card.title}</p>
                  <p className="mt-2 text-3xl font-bold text-gray-900">
                    {card.value}
                    {card.total && (
                      <span className="text-lg text-gray-500 ml-2">/ {card.total}</span>
                    )}
                  </p>
                </div>
                <div className={`${card.color} p-3 rounded-lg`}>
                  <Icon className="w-6 h-6 text-white" />
                </div>
              </div>
            </Link>
          )
        })}
      </div>

      {/* Quick Actions */}
      <div className="bg-white rounded-lg shadow-sm p-6">
        <h2 className="text-xl font-semibold text-gray-900 mb-4">Snelle Acties</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Link
            href="/uren"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-blue-500 hover:bg-blue-50 transition-colors"
          >
            <Clock className="w-8 h-8 text-blue-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Uren Registreren</h3>
              <p className="text-sm text-gray-600">Voeg nieuwe uren toe</p>
            </div>
          </Link>

          <Link
            href="/afwezigheden"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-orange-500 hover:bg-orange-50 transition-colors"
          >
            <Calendar className="w-8 h-8 text-orange-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Afwezigheid Melden</h3>
              <p className="text-sm text-gray-600">Registreer vakantie/ziekte</p>
            </div>
          </Link>

          <Link
            href="/export"
            className="flex items-center p-4 border-2 border-gray-200 rounded-lg hover:border-green-500 hover:bg-green-50 transition-colors"
          >
            <TrendingUp className="w-8 h-8 text-green-600 mr-3" />
            <div>
              <h3 className="font-medium text-gray-900">Export naar Liantis</h3>
              <p className="text-sm text-gray-600">Download maandoverzicht</p>
            </div>
          </Link>
        </div>
      </div>

      {/* Info Section */}
      <div className="mt-8 bg-blue-50 border border-blue-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-blue-900 mb-2">
          Welkom bij Afwezigheidsplanning 2026
        </h3>
        <p className="text-blue-800">
          Deze applicatie helpt u bij het bijhouden van uren en het plannen van afwezigheden. 
          Aan het einde van de maand kunt u eenvoudig een overzicht exporteren voor Liantis.
        </p>
      </div>
    </div>
  )
}

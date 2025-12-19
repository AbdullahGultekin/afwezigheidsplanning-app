import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Haal urenregistraties op (met optionele filters)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const werknemerId = searchParams.get('werknemerId')
    const maand = searchParams.get('maand') // Format: YYYY-MM
    const jaar = searchParams.get('jaar')

    let whereClause: any = {}

    if (werknemerId) {
      whereClause.werknemerId = werknemerId
    }

    if (maand) {
      const [year, month] = maand.split('-')
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      
      whereClause.datum = {
        gte: startDate,
        lte: endDate
      }
    } else if (jaar) {
      const startDate = new Date(parseInt(jaar), 0, 1)
      const endDate = new Date(parseInt(jaar), 11, 31, 23, 59, 59)
      
      whereClause.datum = {
        gte: startDate,
        lte: endDate
      }
    }

    const urenregistraties = await prisma.urenregistratie.findMany({
      where: whereClause,
      include: {
        werknemer: {
          select: {
            id: true,
            naam: true
          }
        }
      },
      orderBy: { datum: 'desc' }
    })

    return NextResponse.json(urenregistraties)
  } catch (error) {
    console.error('Error fetching urenregistraties:', error)
    return NextResponse.json({ error: 'Failed to fetch urenregistraties' }, { status: 500 })
  }
}

// POST - Registreer uren
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { werknemerId, datum, uren, opmerking } = body

    const urenregistratie = await prisma.urenregistratie.upsert({
      where: {
        werknemerId_datum: {
          werknemerId,
          datum: new Date(datum)
        }
      },
      update: {
        uren,
        opmerking
      },
      create: {
        werknemerId,
        datum: new Date(datum),
        uren,
        opmerking
      },
      include: {
        werknemer: {
          select: {
            id: true,
            naam: true
          }
        }
      }
    })

    return NextResponse.json(urenregistratie, { status: 201 })
  } catch (error) {
    console.error('Error creating urenregistratie:', error)
    return NextResponse.json({ error: 'Failed to create urenregistratie' }, { status: 500 })
  }
}


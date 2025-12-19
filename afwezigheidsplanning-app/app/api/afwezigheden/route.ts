import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Haal afwezigheden op (met optionele filters)
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const werknemerId = searchParams.get('werknemerId')
    const maand = searchParams.get('maand') // Format: YYYY-MM
    const type = searchParams.get('type')

    let whereClause: any = {}

    if (werknemerId) {
      whereClause.werknemerId = werknemerId
    }

    if (type) {
      whereClause.type = type
    }

    if (maand) {
      const [year, month] = maand.split('-')
      const startDate = new Date(parseInt(year), parseInt(month) - 1, 1)
      const endDate = new Date(parseInt(year), parseInt(month), 0, 23, 59, 59)
      
      whereClause.OR = [
        {
          startDatum: {
            gte: startDate,
            lte: endDate
          }
        },
        {
          eindDatum: {
            gte: startDate,
            lte: endDate
          }
        }
      ]
    }

    const afwezigheden = await prisma.afwezigheid.findMany({
      where: whereClause,
      include: {
        werknemer: {
          select: {
            id: true,
            naam: true
          }
        }
      },
      orderBy: { startDatum: 'desc' }
    })

    return NextResponse.json(afwezigheden)
  } catch (error) {
    console.error('Error fetching afwezigheden:', error)
    return NextResponse.json({ error: 'Failed to fetch afwezigheden' }, { status: 500 })
  }
}

// POST - Registreer afwezigheid
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { werknemerId, startDatum, eindDatum, type, uren, opmerking, goedgekeurd } = body

    // Als type VAKANTIE is, update vakantiedagen
    let updateData: any = {}
    if (type === 'VAKANTIE') {
      const start = new Date(startDatum)
      const eind = new Date(eindDatum)
      const dagen = Math.ceil((eind.getTime() - start.getTime()) / (1000 * 60 * 60 * 24)) + 1
      
      const werknemer = await prisma.werknemer.findUnique({
        where: { id: werknemerId }
      })

      if (werknemer) {
        updateData = {
          vakantiedagenOpgenomen: werknemer.vakantiedagenOpgenomen + dagen
        }
      }
    }

    const afwezigheid = await prisma.afwezigheid.create({
      data: {
        werknemerId,
        startDatum: new Date(startDatum),
        eindDatum: new Date(eindDatum),
        type,
        uren,
        opmerking,
        goedgekeurd: goedgekeurd || false
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

    // Update werknemer vakantiedagen indien nodig
    if (Object.keys(updateData).length > 0) {
      await prisma.werknemer.update({
        where: { id: werknemerId },
        data: updateData
      })
    }

    return NextResponse.json(afwezigheid, { status: 201 })
  } catch (error) {
    console.error('Error creating afwezigheid:', error)
    return NextResponse.json({ error: 'Failed to create afwezigheid' }, { status: 500 })
  }
}


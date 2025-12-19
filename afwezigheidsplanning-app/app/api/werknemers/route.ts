import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Haal alle werknemers op
export async function GET() {
  try {
    const werknemers = await prisma.werknemer.findMany({
      orderBy: { naam: 'asc' },
      include: {
        _count: {
          select: {
            urenregistraties: true,
            afwezigheden: true
          }
        }
      }
    })
    return NextResponse.json(werknemers)
  } catch (error) {
    console.error('Error fetching werknemers:', error)
    return NextResponse.json({ error: 'Failed to fetch werknemers' }, { status: 500 })
  }
}

// POST - Maak nieuwe werknemer aan
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { naam, email, nummerplaat, vakantiedagenTotaal } = body

    const werknemer = await prisma.werknemer.create({
      data: {
        naam,
        email,
        nummerplaat,
        vakantiedagenTotaal: vakantiedagenTotaal || 20
      }
    })

    return NextResponse.json(werknemer, { status: 201 })
  } catch (error) {
    console.error('Error creating werknemer:', error)
    return NextResponse.json({ error: 'Failed to create werknemer' }, { status: 500 })
  }
}


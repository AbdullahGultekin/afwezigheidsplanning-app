import { NextResponse } from 'next/server'
import { prisma } from '@/lib/db'

// GET - Haal maandelijkse km-standen op
export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const werknemerId = searchParams.get('werknemerId')
    const jaar = searchParams.get('jaar')
    const maand = searchParams.get('maand')

    const where: any = {}
    
    if (werknemerId) where.werknemerId = werknemerId
    if (jaar) where.jaar = parseInt(jaar)
    if (maand) where.maand = parseInt(maand)

    const maandKmStanden = await prisma.maandKmStand.findMany({
      where,
      include: {
        werknemer: true
      },
      orderBy: [
        { jaar: 'desc' },
        { maand: 'desc' }
      ]
    })

    return NextResponse.json(maandKmStanden)
  } catch (error) {
    console.error('Error fetching maand km-standen:', error)
    return NextResponse.json({ error: 'Failed to fetch maand km-standen' }, { status: 500 })
  }
}

// POST - Maak nieuwe maandelijkse km-stand aan
export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { werknemerId, jaar, maand, beginKmStand, eindKmStand, elkeDagGereden, handtekening, getekendOp } = body

    if (!werknemerId || !jaar || !maand || beginKmStand === undefined) {
      return NextResponse.json(
        { error: 'werknemerId, jaar, maand and beginKmStand are required' },
        { status: 400 }
      )
    }

    const maandKmStand = await prisma.maandKmStand.create({
      data: {
        werknemerId,
        jaar: parseInt(jaar),
        maand: parseInt(maand),
        beginKmStand: parseFloat(beginKmStand),
        eindKmStand: eindKmStand ? parseFloat(eindKmStand) : null,
        elkeDagGereden: elkeDagGereden ? parseFloat(elkeDagGereden) : null,
        handtekening: handtekening || null,
        getekendOp: getekendOp ? new Date(getekendOp) : null
      },
      include: {
        werknemer: true
      }
    })

    return NextResponse.json(maandKmStand, { status: 201 })
  } catch (error: any) {
    console.error('Error creating maand km-stand:', error)
    
    // Check for unique constraint violation
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'Maand km-stand already exists for this werknemer, jaar and maand' },
        { status: 409 }
      )
    }
    
    return NextResponse.json({ error: 'Failed to create maand km-stand' }, { status: 500 })
  }
}

